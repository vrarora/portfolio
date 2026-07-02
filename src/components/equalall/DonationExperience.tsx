"use client";

import "./styles/equalall.css";

import { motion } from "motion/react";
import { LockSimple } from "@phosphor-icons/react";
import { StatusBar } from "./chrome/StatusBar";
import { useDonationFlow } from "./flow/DonationFlowProvider";
import { StoryScreen } from "./screens/StoryScreen";

/** The whole product: story screen in a scroll container, the persistent
 * Donate dock, plus the sheet layer and keepsake takeover. Everything
 * positions absolutely within the phone viewport (never `fixed` — the tree
 * may render inside a scaled frame). */
export function DonationExperience() {
  const { dispatch, mode, viewportRef } = useDonationFlow();
  const interactive = mode === "interactive";

  return (
    <div className="ea-viewport" ref={viewportRef}>
      <div className="ea-scroll" data-lenis-prevent>
        <div className="ea-chrome-head">
          <StatusBar />
        </div>
        <StoryScreen />
        <div className="ea-scroll-spacer" aria-hidden="true" />
      </div>

      <div className="ea-donate-dock">
        <motion.button
          type="button"
          className="ea-donate-primary"
          data-ea-target="donate-bar"
          whileTap={interactive ? { scale: 0.97 } : undefined}
          onClick={() => dispatch({ type: "OPEN_GIFT" })}
        >
          Donate
        </motion.button>
        <span className="ea-donate-dock-note">
          <LockSimple size={11} weight="fill" />
          Secure payment. Every gift tracked.
        </span>
      </div>
    </div>
  );
}
