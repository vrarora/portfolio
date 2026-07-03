"use client";

import { motion } from "motion/react";
import { ArrowLeft, Repeat } from "@phosphor-icons/react";
import { formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { SPRING_POP, SPRING_STEP } from "../motionTokens";

const STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const RISE = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING_STEP },
};

/** Confirm step (experiment 3): the least emotional moment of a checkout —
 * the abstract total — replaced by what the money becomes. The last click
 * should feel like the feeling. */
export function TangibleConfirm() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
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

      <h2 className="ea-sheet-title">Your gift becomes</h2>

      <motion.div
        className="ea-becomes"
        variants={STAGGER}
        initial="hidden"
        animate="show"
      >
        <motion.div className="ea-becomes-amount" variants={RISE}>
          <span className="ea-num">{formatAmount(tier.amount)}</span>
          {state.frequency === "monthly" && (
            <span className="ea-becomes-permo">every month</span>
          )}
        </motion.div>

        <motion.span
          className="ea-becomes-thread"
          aria-hidden="true"
          variants={{
            hidden: { scaleY: 0 },
            show: {
              scaleY: 1,
              transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        />

        <motion.figure
          className="ea-tangible-card"
          variants={{
            hidden: { opacity: 0, y: 22, scale: 0.965 },
            show: { opacity: 1, y: 0, scale: 1, transition: SPRING_POP },
          }}
        >
          <img src={tier.tangible.image} alt="" loading="lazy" />
          <figcaption>
            <span className="ea-tangible-title">{tier.tangible.title}</span>
            <span className="ea-tangible-detail">{tier.tangible.detail}</span>
          </figcaption>
        </motion.figure>

        {state.frequency === "monthly" && (
          <motion.span className="ea-monthly-chip" variants={RISE}>
            <Repeat size={12} weight="bold" />
            Renews monthly. Cancel anytime.
          </motion.span>
        )}
      </motion.div>

      <motion.button
        type="button"
        className="ea-pay-cta"
        data-ea-target="confirm-give"
        whileTap={interactive ? { scale: 0.97 } : undefined}
        onClick={() => dispatch({ type: "OPEN_PAYMENT" })}
      >
        Give with <span className="ea-pay-mark"> Pay</span>
      </motion.button>
    </motion.div>
  );
}
