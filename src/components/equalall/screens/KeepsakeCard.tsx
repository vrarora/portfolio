"use client";

import { motion } from "motion/react";
import { SlotText } from "slot-text/react";
import { campaign, formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";

const CARD_SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
const STAMP_SPRING = { type: "spring", stiffness: 420, damping: 22 } as const;

function Stamp({ delay }: { delay: number }) {
  return (
    <motion.span
      className="ea-stamp"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 1.7, rotate: 4 }}
      animate={{ opacity: 1, scale: 1, rotate: -11 }}
      transition={{ ...STAMP_SPRING, delay }}
    >
      <svg viewBox="0 0 96 96">
        <defs>
          <path
            id="ea-stamp-arc"
            d="M48 12 a36 36 0 1 1 -0.01 0"
            fill="none"
          />
        </defs>
        <circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle
          cx="48"
          cy="48"
          r="33"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <text className="ea-stamp-text">
          <textPath href="#ea-stamp-arc" startOffset="0%">
            GIFT RECEIVED • WITH THANKS • GIFT RECEIVED •
          </textPath>
        </text>
        <path
          d="M48 56.5 L41 49.5 a4.6 4.6 0 1 1 7 -6 a4.6 4.6 0 1 1 7 6 Z"
          fill="currentColor"
        />
      </svg>
    </motion.span>
  );
}

/** The gift record: part thank-you note, part proof-it-was-real. Paper grain,
 * a torn receipt edge, a stamp that lands with a thunk, and a reference
 * number that rolls into place. */
export function KeepsakeCard({ baseDelay = 0 }: { baseDelay?: number }) {
  const { state } = useDonationFlow();
  const tier = state.tierId ? getTier(state.tierId) : null;
  if (tier === null || state.receipt === null) return null;

  const monthly = state.frequency === "monthly" || state.monthlyUpgraded;

  return (
    <motion.div
      className="ea-keepsake-card"
      initial={{ opacity: 0, y: -30, rotate: -2.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ ...CARD_SPRING, delay: baseDelay }}
    >
      <span className="ea-keepsake-grain" aria-hidden="true" />
      <span className="ea-keepsake-clip" aria-hidden="true">
        <Stamp delay={baseDelay + 0.5} />
      </span>

      <span className="ea-caps ea-keepsake-kicker">Gift record</span>
      <p className="ea-keepsake-headline">{tier.tangible.title}</p>
      <p className="ea-keepsake-sub">
        {tier.tangible.detail}
      </p>

      <div className="ea-keepsake-amount-row">
        <span className="ea-keepsake-amount ea-num">
          {formatAmount(tier.amount)}
        </span>
        {monthly && <span className="ea-keepsake-permo">every month</span>}
      </div>

      <span className="ea-keepsake-divider" aria-hidden="true" />

      <dl className="ea-keepsake-meta">
        <div className="ea-keepsake-meta-row">
          <dt>Reference</dt>
          <dd className="ea-num">
            <SlotText
              text={state.receipt.ref}
              options={{ direction: "up", stagger: 45, duration: 380 }}
            />
          </dd>
        </div>
        <div className="ea-keepsake-meta-row">
          <dt>Date</dt>
          <dd>{state.receipt.date}</dd>
        </div>
        <div className="ea-keepsake-meta-row">
          <dt>Delivered by</dt>
          <dd>{campaign.organizer.name}</dd>
        </div>
      </dl>
    </motion.div>
  );
}
