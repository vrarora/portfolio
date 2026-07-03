"use client";

import {
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { motion, useMotionTemplate, useSpring } from "motion/react";
import { SlotText } from "slot-text/react";
import { campaign, formatAmount, getTier, type Tier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import type { Receipt } from "../flow/types";
import { SPRING_POP, SPRING_STEP } from "../motionTokens";
import { InkStamp } from "./InkStamp";
import { KEEPSAKE_T, STAMP_LAND } from "./keepsakeTiming";
import { StitchThread } from "./StitchThread";

const CARD_SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const TILT = { stiffness: 260, damping: 22 } as const;
const REF_PLACEHOLDER = "EA-••••••";

/** One stop on the gift's journey. Tone fades with distance from now:
 * "now" is inked fact, "next" is en route, "ahead" is the promise. */
function Waypoint({
  tone,
  delay,
  children,
}: {
  tone: "now" | "next" | "ahead";
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`ea-waypoint ea-waypoint-${tone}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_STEP, delay }}
    >
      <span className="ea-waypoint-node" aria-hidden="true" />
      <div className="ea-waypoint-body">{children}</div>
    </motion.div>
  );
}

function JourneyCard({
  tier,
  receipt,
  monthly,
  baseDelay,
}: {
  tier: Tier;
  receipt: Receipt;
  monthly: boolean;
  baseDelay: number;
}) {
  const { mode, reducedMotion } = useDonationFlow();
  const tiltEnabled = mode === "interactive" && !reducedMotion;

  const stampDelay = KEEPSAKE_T.stamp;
  const landDelay = stampDelay + STAMP_LAND;

  // slot-text only rolls on a text *change*, so the reference mounts masked
  // and resolves once the stub row has risen into place.
  const [refText, setRefText] = useState(() =>
    reducedMotion ? receipt.ref : REF_PLACEHOLDER,
  );
  useEffect(() => {
    const id = window.setTimeout(
      () => setRefText(receipt.ref),
      (KEEPSAKE_T.stub + 0.1) * 1000,
    );
    return () => window.clearTimeout(id);
  }, [receipt.ref]);

  // Holdable-object tilt: fine pointers only, springs so it settles like
  // card stock, a glare that tracks the pointer across the paper.
  const rotateX = useSpring(0, TILT);
  const rotateY = useSpring(0, TILT);
  const glareX = useSpring(50, TILT);
  const glareY = useSpring(30, TILT);
  const glareOpacity = useSpring(0, TILT);
  const glare = useMotionTemplate`radial-gradient(200px 150px at ${glareX}% ${glareY}%, rgba(255, 250, 240, 0.42), rgba(255, 250, 240, 0) 72%)`;

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 5);
    rotateY.set((px - 0.5) * 7);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(1);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(30);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      className="ea-keepsake-drop"
      initial={{ opacity: 0, y: -30, rotate: -2.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ ...CARD_SPRING, delay: baseDelay }}
    >
      <motion.div
        className="ea-keepsake-card"
        style={
          tiltEnabled
            ? { rotateX, rotateY, transformPerspective: 900 }
            : undefined
        }
        // the stamp's impact travels through the paper
        animate={{ y: [0, 2.5, 0], rotate: [0, 0.5, 0] }}
        transition={{
          delay: landDelay - 0.02,
          duration: 0.3,
          times: [0, 0.4, 1],
          ease: "easeOut",
        }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <span className="ea-keepsake-grain" aria-hidden="true" />
        <span className="ea-keepsake-clip" aria-hidden="true">
          <span
            className="ea-keepsake-shine"
            style={{ animationDelay: `${baseDelay + 0.35}s` }}
          />
          <InkStamp delay={stampDelay} />
          {tiltEnabled && (
            <motion.span
              className="ea-keepsake-glare"
              style={{ background: glare, opacity: glareOpacity }}
            />
          )}
        </span>

        <span className="ea-caps ea-keepsake-kicker">
          Your gift&rsquo;s journey
        </span>

        <div className="ea-journey">
          <Waypoint tone="now" delay={KEEPSAKE_T.wp1}>
            <span className="ea-waypoint-title">Gift received</span>
            <span className="ea-waypoint-sub">
              <span className="ea-num ea-waypoint-amount">
                {formatAmount(tier.amount)}
              </span>
              {monthly && " monthly"} &middot; {receipt.date}
            </span>
          </Waypoint>

          <div className="ea-journey-seg" aria-hidden="true">
            <StitchThread length={34} delay={KEEPSAKE_T.seg1} />
          </div>

          <Waypoint tone="next" delay={KEEPSAKE_T.wp2}>
            <span className="ea-waypoint-title">
              With the team in Turkana County
            </span>
            <span className="ea-waypoint-sub">Within days</span>
          </Waypoint>

          <div className="ea-journey-seg" aria-hidden="true">
            <StitchThread
              length={34}
              delay={KEEPSAKE_T.seg2}
              className="ea-stitch-ahead"
            />
          </div>

          <Waypoint tone="ahead" delay={KEEPSAKE_T.wp3}>
            <div className="ea-waypoint-dest">
              <motion.img
                src={tier.tangible.image}
                alt=""
                className="ea-waypoint-thumb"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_POP, delay: KEEPSAKE_T.wp3 + 0.08 }}
              />
              <div className="ea-waypoint-dest-text">
                <span className="ea-waypoint-title">{tier.tangible.title}</span>
                <span className="ea-waypoint-sub">What your gift becomes</span>
              </div>
            </div>
          </Waypoint>
        </div>

        <motion.p
          className="ea-journey-promise"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_STEP, delay: KEEPSAKE_T.promise }}
        >
          We&rsquo;ll show you exactly what your gift became.
          <span className="ea-caps ea-journey-promise-by">
            {campaign.organizer.name}
          </span>
        </motion.p>

        <motion.div
          className="ea-keepsake-stub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: KEEPSAKE_T.stub, ease: "easeOut" }}
        >
          <span className="ea-keepsake-divider" aria-hidden="true" />
          <dl className="ea-keepsake-meta">
            <div className="ea-keepsake-meta-row">
              <dt>Reference</dt>
              <dd className="ea-num">
                <SlotText
                  text={refText}
                  options={{ direction: "up", stagger: 45, duration: 380 }}
                />
              </dd>
            </div>
            <div className="ea-keepsake-meta-row">
              <dt>Date</dt>
              <dd>{receipt.date}</dd>
            </div>
          </dl>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** The journey card: the thank-you is no longer a receipt but a promise the
 * donor can follow. Three waypoints stitched by the coral thread — the
 * stamped fact of the gift, the team it travels with, the thing it becomes —
 * with the receipt demoted to a stub at the torn edge. */
export function KeepsakeCard({ baseDelay = 0 }: { baseDelay?: number }) {
  const { state } = useDonationFlow();
  const tier = state.tierId ? getTier(state.tierId) : null;
  if (tier === null || state.receipt === null) return null;

  return (
    <JourneyCard
      tier={tier}
      receipt={state.receipt}
      monthly={state.frequency === "monthly" || state.monthlyUpgraded}
      baseDelay={baseDelay}
    />
  );
}
