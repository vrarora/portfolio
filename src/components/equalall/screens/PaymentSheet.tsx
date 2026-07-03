"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { campaign, formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { SPRING_SHEET } from "../motionTokens";
import { PayMark } from "./PayMark";
import { StepPager } from "./StepPager";

const AUTHORIZE_MS = 1600;
const DONE_HOLD_MS = 900;

/** Charcoal card with a foil chip and contactless arcs — drawn, not a
 * stock gradient. */
function CardArt() {
  return (
    <span className="ea-pay-card-art" aria-hidden="true">
      <span className="ea-pay-card-chip" />
      <svg
        className="ea-pay-card-waves"
        viewBox="0 0 10 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      >
        <path d="M2 4.2a4.4 4.4 0 0 1 0 3.6" opacity="0.45" />
        <path d="M4.6 2.8a7.2 7.2 0 0 1 0 6.4" opacity="0.7" />
        <path d="M7.2 1.4a10 10 0 0 1 0 9.2" />
      </svg>
      <span className="ea-pay-card-brand">VISA</span>
    </span>
  );
}

function PaymentDetails() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const tier = state.tierId ? getTier(state.tierId) : null;
  if (tier === null) return null;

  return (
    <div className="ea-pay-body">
      <div className="ea-pay-card-row">
        <CardArt />
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
    </div>
  );
}

function PaymentProcessing() {
  const { dispatch } = useDonationFlow();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const authId = window.setTimeout(() => setAuthorized(true), AUTHORIZE_MS);
    const doneId = window.setTimeout(
      () => dispatch({ type: "PAYMENT_DONE" }),
      AUTHORIZE_MS + DONE_HOLD_MS,
    );
    return () => {
      window.clearTimeout(authId);
      window.clearTimeout(doneId);
    };
  }, [dispatch]);

  return (
    <div className="ea-pay-body ea-pay-processing">
      <span className="ea-pay-ring-wrap">
        <AnimatePresence initial={false}>
          {!authorized && (
            <motion.span
              key="ring"
              className="ea-pay-ring"
              exit={{ opacity: 0, scale: 0.72 }}
              transition={{ duration: 0.18, ease: "easeIn" }}
            />
          )}
        </AnimatePresence>
        {authorized && (
          <svg className="ea-pay-check" viewBox="0 0 36 36">
            <motion.circle
              cx="18"
              cy="18"
              r="16.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d="M11.2 18.7 L16 23.4 L25 13.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                delay: 0.1,
                duration: 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </svg>
        )}
      </span>
      <span className="ea-pay-status" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={authorized ? "done" : "processing"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {authorized ? "Done" : "Sending your gift safely…"}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

/** Fictional wallet-style payment sheet. Fully opaque dark surface (any
 * translucency lets the bright story page ghost through), hairline
 * dividers, a processing ring that resolves into a drawn checkmark. */
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
        <span className="ea-pay-brand">
          <PayMark />
        </span>
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
      <StepPager stepKey={processing ? "processing" : "details"}>
        {processing ? <PaymentProcessing /> : <PaymentDetails />}
      </StepPager>
    </motion.div>
  );
}
