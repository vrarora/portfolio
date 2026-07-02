"use client";

import { motion } from "motion/react";
import { useDonationFlow } from "../flow/DonationFlowProvider";
import { SPRING_STEP } from "../motionTokens";
import type { Frequency } from "../flow/types";

const OPTIONS: Array<{ id: Frequency; label: string }> = [
  { id: "once", label: "One-time" },
  { id: "monthly", label: "Monthly" },
];

/** One-time <-> monthly segmented control (experiment 5a): a single gift
 * becomes a standing one with one tap. */
export function FrequencyToggle() {
  const { state, dispatch } = useDonationFlow();

  return (
    <div className="ea-freq" role="tablist" aria-label="Giving frequency">
      {OPTIONS.map((option) => {
        const active = state.frequency === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? "ea-freq-option ea-active" : "ea-freq-option"}
            data-ea-target={`freq-${option.id}`}
            onClick={() =>
              dispatch({ type: "SET_FREQUENCY", frequency: option.id })
            }
          >
            {active && (
              <motion.span
                className="ea-freq-thumb"
                layoutId="ea-freq-thumb"
                transition={SPRING_STEP}
              />
            )}
            <span className="ea-freq-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
