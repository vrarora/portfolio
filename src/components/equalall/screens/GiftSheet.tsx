"use client";

import { AnimatePresence, motion } from "motion/react";
import { LockSimple, X } from "@phosphor-icons/react";
import { SlotText } from "slot-text/react";
import { formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE, SPRING_SHEET, SPRING_STEP } from "../motionTokens";
import { AmountTiers } from "./AmountTiers";
import { FrequencyToggle } from "./FrequencyToggle";
import { TangibleConfirm } from "./TangibleConfirm";

function GiftStep() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const tier = state.tierId ? getTier(state.tierId) : null;

  return (
    <motion.div
      className="ea-sheet-step"
      initial={{ x: -36, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -36, opacity: 0 }}
      transition={SPRING_STEP}
    >
      <h2 className="ea-sheet-title">Your gift</h2>
      <FrequencyToggle />
      <AmountTiers />
      <motion.button
        type="button"
        className="ea-sheet-cta"
        data-ea-target="gift-continue"
        disabled={tier === null}
        whileTap={interactive && tier !== null ? { scale: 0.97 } : undefined}
        onClick={() => dispatch({ type: "CONTINUE_TO_CONFIRM" })}
      >
        {tier === null ? (
          "Choose an amount"
        ) : (
          <>
            <span>Give</span>
            <span className="ea-num">
              <SlotText
                text={formatAmount(tier.amount)}
                options={{ direction: "up", stagger: 40, duration: 300 }}
              />
            </span>
            {state.frequency === "monthly" && <span>monthly</span>}
          </>
        )}
      </motion.button>
      <span className="ea-sheet-note">
        <LockSimple size={11} weight="fill" />
        Protected by bank-grade encryption
      </span>
    </motion.div>
  );
}

/** Bottom sheet hosting the two-step gift flow: amount -> tangible confirm.
 * Replaces a cart page entirely — the race against the fading feeling is won
 * by never leaving the story. */
export function GiftSheet() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const isConfirm = state.step === "confirm";

  return (
    <motion.div
        className="ea-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Make a donation"
        initial={{ y: "104%" }}
        animate={{ y: 0 }}
        exit={{ y: "104%" }}
        transition={SPRING_SHEET}
        drag={interactive ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 600) {
            dispatch({ type: "CLOSE_GIFT" });
          }
        }}
      >
        <span className="ea-sheet-grabber" aria-hidden="true" />
        <button
          type="button"
          className="ea-sheet-close"
          aria-label="Close"
          data-ea-target="gift-close"
          onClick={() => dispatch({ type: "CLOSE_GIFT" })}
        >
          <X size={15} weight="bold" />
        </button>
        <div className="ea-sheet-body">
          <AnimatePresence mode="popLayout" initial={false}>
            {isConfirm ? (
              <TangibleConfirm key="confirm" />
            ) : (
              <GiftStep key="gift" />
            )}
          </AnimatePresence>
        </div>
    </motion.div>
  );
}
