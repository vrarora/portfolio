"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { SPRING_STEP } from "../motionTokens";

/** Confirm step: the amount becomes the thing (experiment 3). Fleshed out in
 * the next milestone — this stub keeps the step machine honest. */
export function TangibleConfirm() {
  const { state, dispatch } = useDonationFlow();
  const tier = state.tierId ? getTier(state.tierId) : null;

  if (tier === null) return null;

  return (
    <motion.div
      className="ea-sheet-step"
      initial={{ x: 36, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 36, opacity: 0 }}
      transition={SPRING_STEP}
    >
      <button
        type="button"
        className="ea-sheet-back"
        data-ea-target="confirm-back"
        aria-label="Back"
        onClick={() => dispatch({ type: "BACK_TO_GIFT" })}
      >
        <ArrowLeft size={15} weight="bold" />
      </button>
      <h2 className="ea-sheet-title">
        {formatAmount(tier.amount)} becomes {tier.tangible.title.toLowerCase()}
      </h2>
    </motion.div>
  );
}
