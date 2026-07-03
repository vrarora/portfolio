"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE, SPRING_STEP } from "../motionTokens";
import { AuroraCSS } from "./AuroraCSS";
import { AuroraShader } from "./AuroraShader";
import { KeepsakeCard } from "./KeepsakeCard";
import { KEEPSAKE_T } from "./keepsakeTiming";
import { RecurringInvite } from "./RecurringInvite";

/** Serif headline that resolves word by word out of the first light —
 * blur-to-sharp, rising, gently staggered. */
function RevealTitle({ text, delay }: { text: string; delay: number }) {
  const words = text.split(" ");
  return (
    <h2 className="ea-keepsake-title" aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {i > 0 && " "}
          <motion.span
            className="ea-keepsake-word"
            aria-hidden="true"
            initial={{ opacity: 0, y: 16, filter: "blur(9px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              ...SPRING_STEP,
              delay: delay + i * 0.09,
              filter: {
                duration: 0.5,
                delay: delay + i * 0.09,
                ease: "easeOut",
              },
            }}
          >
            {word}
          </motion.span>
        </Fragment>
      ))}
    </h2>
  );
}

/** Thank-you takeover — the emotional peak, and the only aurora moment.
 * Opens at the payment sheet's charcoal so the dark-to-light handoff reads
 * as one continuous sunrise; the gift becomes a keepsake: a stamped record
 * that is both a thank-you note and the trust artifact a first-time donor
 * needs. */
export function KeepsakeScreen() {
  const { dispatch, mode, reducedMotion } = useDonationFlow();
  const interactive = mode === "interactive";
  const useShader = interactive && !reducedMotion;

  return (
    <motion.div
      className="ea-keepsake"
      // enters at full opacity: the first frame is dusk-dark, exactly where
      // the payment sheet's charcoal left off — a fade here would ghost the
      // bright story screen through the dark and break the sunrise
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      {useShader ? <AuroraShader /> : <AuroraCSS />}
      {/* CSS hosts get the dawn as a dissolving dusk overlay; the shader
          route grades the sunrise inside the fragment shader instead. */}
      {!useShader && !reducedMotion && (
        <span className="ea-dawn" aria-hidden="true" />
      )}
      <span className="ea-keepsake-film" aria-hidden="true" />

      <div className="ea-keepsake-content" data-lenis-prevent>
        <header className="ea-keepsake-head">
          <RevealTitle text="Thank you, truly." delay={KEEPSAKE_T.title} />
          <motion.p
            className="ea-keepsake-lede"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_STEP, delay: KEEPSAKE_T.lede }}
          >
            Your gift is already on its way.
          </motion.p>
        </header>

        <KeepsakeCard baseDelay={KEEPSAKE_T.card} />
        <RecurringInvite delay={KEEPSAKE_T.invite} />

        <motion.button
          type="button"
          className="ea-keepsake-reset"
          data-ea-target="keepsake-done"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...FADE, delay: KEEPSAKE_T.reset }}
          onClick={() => dispatch({ type: "RESET" })}
        >
          Back to campaign
        </motion.button>
      </div>
    </motion.div>
  );
}
