"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LockSimple, X } from "@phosphor-icons/react";
import { SlotText } from "slot-text/react";
import { formatAmount, getTier } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { FADE, SPRING_SHEET } from "../motionTokens";
import { AmountTiers } from "./AmountTiers";
import { FrequencyToggle } from "./FrequencyToggle";
import { StepPager } from "./StepPager";
import { TangibleConfirm } from "./TangibleConfirm";

function GiftStep() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const tier = state.tierId ? getTier(state.tierId) : null;

  return (
    <div className="ea-sheet-step">
      <h2 className="ea-sheet-title">Your gift</h2>
      <span className="ea-title-stitch" aria-hidden="true" />
      <FrequencyToggle />
      <span className="ea-freq-note" aria-live="polite">
        <AnimatePresence initial={false}>
          {state.frequency === "monthly" && (
            <motion.span
              key="note"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={FADE}
            >
              You can cancel anytime.
            </motion.span>
          )}
        </AnimatePresence>
      </span>
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
    </div>
  );
}

/** Bottom sheet hosting the two-step gift flow: amount -> tangible confirm.
 * Replaces a cart page entirely — the race against the fading feeling is won
 * by never leaving the story. */
export function GiftSheet() {
  const { state, dispatch, mode } = useDonationFlow();
  const interactive = mode === "interactive";
  const isConfirm = state.step === "confirm";

  // Forward when heading to confirm, back when returning — the pager slides
  // the incoming step in from the matching side.
  const prevConfirmRef = useRef(isConfirm);
  const direction = isConfirm ? 1 : prevConfirmRef.current ? -1 : 0;
  prevConfirmRef.current = isConfirm;

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
        <div className="ea-sheet-body">
          {/* Inside .ea-sheet-body (position: relative) so its top offset
              matches the step's back button, which shares this context. */}
          <button
            type="button"
            className="ea-sheet-close"
            aria-label="Close"
            data-ea-target="gift-close"
            onClick={() => dispatch({ type: "CLOSE_GIFT" })}
          >
            <X size={15} weight="bold" />
          </button>
          <StepPager
            stepKey={isConfirm ? "confirm" : "gift"}
            direction={direction}
          >
            {isConfirm ? <TangibleConfirm /> : <GiftStep />}
          </StepPager>
        </div>
    </motion.div>
  );
}
