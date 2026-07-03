"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { campaign, formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE, SPRING_SHEET } from "../motionTokens";

const AUTHORIZE_MS = 1600;
const DONE_HOLD_MS = 900;

function PaymentDetails() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const tier = state.tierId ? getTier(state.tierId) : null;
  if (tier === null) return null;

  return (
    <motion.div
      key="details"
      className="ea-pay-body"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      <div className="ea-pay-card-row">
        <span className="ea-pay-card-art" aria-hidden="true">
          <span className="ea-pay-card-chip" />
        </span>
        <span className="ea-pay-card-info">
          <span className="ea-pay-card-name">Visa •••• 4821</span>
          <span className="ea-pay-card-sub">Sarah Mitchell</span>
        </span>
      </div>

      <dl className="ea-pay-lines">
        <div className="ea-pay-line">
          <dt>To</dt>
          <dd>{campaign.organizer.name}</dd>
        </div>
        <div className="ea-pay-line">
          <dt>{state.frequency === "monthly" ? "Monthly gift" : "Gift"}</dt>
          <dd className="ea-num">
            {formatAmount(tier.amount)}
            {state.frequency === "monthly" && (
              <span className="ea-pay-permo">/mo</span>
            )}
          </dd>
        </div>
        {state.frequency === "monthly" && (
          <div className="ea-pay-line ea-pay-line-sub">
            <dt>Starting</dt>
            <dd>Today. Cancel anytime.</dd>
          </div>
        )}
      </dl>

      <motion.button
        type="button"
        className="ea-pay-confirm"
        data-ea-target="pay-confirm"
        whileTap={interactive ? { scale: 0.97 } : undefined}
        onClick={() => dispatch({ type: "AUTHORIZE_PAYMENT" })}
      >
        Confirm gift
      </motion.button>
    </motion.div>
  );
}

function PaymentProcessing() {
  const { dispatch } = useDonationFlow();

  useEffect(() => {
    const id = window.setTimeout(
      () => dispatch({ type: "PAYMENT_DONE" }),
      AUTHORIZE_MS + DONE_HOLD_MS,
    );
    return () => window.clearTimeout(id);
  }, [dispatch]);

  return (
    <motion.div
      key="processing"
      className="ea-pay-body ea-pay-processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE}
    >
      <span className="ea-pay-ring-wrap">
        <motion.span
          className="ea-pay-ring"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0] }}
          transition={{
            duration: (AUTHORIZE_MS + 300) / 1000,
            times: [0, 0.88, 1],
          }}
        />
        <motion.svg
          className="ea-pay-check"
          viewBox="0 0 36 36"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: AUTHORIZE_MS / 1000, duration: 0.2 }}
        >
          <motion.path
            d="M10 18.6 L15.6 24.2 L26.4 12.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: AUTHORIZE_MS / 1000,
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.svg>
      </span>
      <span className="ea-pay-status">Processing…</span>
    </motion.div>
  );
}

/** Fictional wallet-style payment sheet. Dark glass, hairline dividers,
 * a processing ring that resolves into a drawn checkmark. */
export function PaymentSheet() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const processing = state.step === "processing";

  return (
    <motion.div
      className="ea-pay-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm payment"
      initial={{ y: "104%" }}
      animate={{ y: 0 }}
      exit={{ y: "104%" }}
      transition={SPRING_SHEET}
    >
      <div className="ea-pay-head">
        <span className="ea-pay-brand"> Pay</span>
        {!processing && (
          <button
            type="button"
            className="ea-pay-close"
            aria-label="Cancel payment"
            data-ea-target="pay-cancel"
            onClick={
              interactive
                ? () => dispatch({ type: "CANCEL_PAYMENT" })
                : undefined
            }
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {processing ? <PaymentProcessing /> : <PaymentDetails />}
      </AnimatePresence>
    </motion.div>
  );
}
