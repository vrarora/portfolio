"use client";

import { AnimatePresence, motion } from "motion/react";
import { HeartStraight } from "@phosphor-icons/react";
import { campaign, formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";

/** Amount tiers with the "Most chosen" anchor (experiment 1) and the meaning
 * line that rewrites per selection (experiment 2). */
export function AmountTiers() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const selectedTier = state.tierId ? getTier(state.tierId) : null;

  return (
    <div className="ea-tiers-block">
      <div className="ea-tiers">
        {campaign.tiers.map((tier) => {
          const selected = state.tierId === tier.id;
          return (
            <motion.button
              key={tier.id}
              type="button"
              className={selected ? "ea-tier ea-selected" : "ea-tier"}
              data-ea-target={`tier-${tier.id}`}
              whileTap={interactive ? { scale: 0.94 } : undefined}
              onClick={() => dispatch({ type: "SELECT_TIER", tierId: tier.id })}
            >
              {tier.mostChosen && (
                <span className="ea-tier-badge">Most chosen</span>
              )}
              <span className="ea-tier-amount ea-num">
                {formatAmount(tier.amount)}
                {state.frequency === "monthly" && (
                  <span className="ea-tier-permo">/mo</span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="ea-impact" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={state.tierId ?? "none"}
            className={
              selectedTier ? "ea-impact-line ea-has-tier" : "ea-impact-line"
            }
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -9 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {selectedTier ? (
              <>
                <HeartStraight size={13} weight="fill" />
                {selectedTier.impact}
              </>
            ) : (
              "Choose an amount that feels right"
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
