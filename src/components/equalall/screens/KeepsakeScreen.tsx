"use client";

import { motion } from "motion/react";
import { formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE } from "../motionTokens";

/** Thank-you takeover — the emotional peak. Fleshed out in the next
 * milestone; this stub proves the flow reaches its destination. */
export function KeepsakeScreen() {
  const { state, dispatch } = useDonationFlow();
  const tier = state.tierId ? getTier(state.tierId) : null;

  return (
    <motion.div
      className="ea-keepsake"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      <p className="ea-keepsake-stub">
        Thank you{tier ? ` for ${formatAmount(tier.amount)}` : ""}.
        {state.receipt ? ` Ref ${state.receipt.ref}` : ""}
      </p>
      <button
        type="button"
        className="ea-keepsake-reset"
        data-ea-target="keepsake-done"
        onClick={() => dispatch({ type: "RESET" })}
      >
        Back to campaign
      </button>
    </motion.div>
  );
}
