"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, Repeat } from "@phosphor-icons/react";
import { formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE, SPRING_STEP } from "../motionTokens";

/** Post-donation recurring invite (experiment 5b): the donors most moved to
 * give are the least willing to feel it again — so the peak converts into a
 * standing commitment right here, without a second visit. */
export function RecurringInvite({ delay = 0 }: { delay?: number }) {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const tier = state.tierId ? getTier(state.tierId) : null;
  if (tier === null) return null;

  const alreadyMonthly = state.frequency === "monthly";

  return (
    <motion.div
      className="ea-invite"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_STEP, delay }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {alreadyMonthly ? (
          <motion.p
            key="set"
            className="ea-invite-set"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={FADE}
          >
            <CheckCircle size={16} weight="fill" />
            Your monthly gift is set. Cancel anytime.
          </motion.p>
        ) : state.monthlyUpgraded ? (
          <motion.p
            key="upgraded"
            className="ea-invite-set"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_STEP}
          >
            <CheckCircle size={16} weight="fill" />
            You&rsquo;re giving {formatAmount(tier.amount)} monthly now.
          </motion.p>
        ) : (
          <motion.div
            key="ask"
            className="ea-invite-ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={FADE}
          >
            <p className="ea-invite-copy">
              Keep this going, without feeling it twice.
            </p>
            <motion.button
              type="button"
              className="ea-invite-accept"
              data-ea-target="invite-accept"
              whileTap={interactive ? { scale: 0.96 } : undefined}
              onClick={() => dispatch({ type: "ACCEPT_MONTHLY" })}
            >
              <Repeat size={15} weight="bold" />
              Give {formatAmount(tier.amount)} monthly
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
