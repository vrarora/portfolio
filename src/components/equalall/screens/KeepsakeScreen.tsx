"use client";

import { motion } from "motion/react";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE, SPRING_STEP } from "../motionTokens";
import { AuroraCSS } from "./AuroraCSS";
import { AuroraShader } from "./AuroraShader";
import { KeepsakeCard } from "./KeepsakeCard";
import { RecurringInvite } from "./RecurringInvite";

/** Thank-you takeover — the emotional peak, and the only aurora moment.
 * The gift becomes a keepsake: a stamped record that is both a thank-you
 * note and the trust artifact a first-time donor needs. */
export function KeepsakeScreen() {
  const { dispatch, mode, reducedMotion } = useDonationFlow();
  const interactive = mode === "interactive";
  const useShader = interactive && !reducedMotion;

  return (
    <motion.div
      className="ea-keepsake"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      {useShader ? <AuroraShader /> : <AuroraCSS />}

      <div className="ea-keepsake-content" data-lenis-prevent>
        <motion.header
          className="ea-keepsake-head"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_STEP, delay: 0.12 }}
        >
          <h2 className="ea-keepsake-title">Thank you, truly.</h2>
          <p className="ea-keepsake-lede">Your gift is already on its way.</p>
        </motion.header>

        <KeepsakeCard baseDelay={0.34} />
        <RecurringInvite delay={1.05} />

        <motion.button
          type="button"
          className="ea-keepsake-reset"
          data-ea-target="keepsake-done"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...FADE, delay: 1.35 }}
          onClick={() => dispatch({ type: "RESET" })}
        >
          Back to campaign
        </motion.button>
      </div>
    </motion.div>
  );
}
