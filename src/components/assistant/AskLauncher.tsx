"use client";

import { useAsk } from "./AskProvider";

import "./assistant.css";

export function AskLauncher() {
  const { open, toggle, launcherRef } = useAsk();
  return (
    <button
      ref={launcherRef}
      type="button"
      className="ask-launcher"
      onClick={toggle}
      aria-expanded={open}
      aria-controls="ask-panel"
      aria-label="Ask Vaibhav, an AI stand-in"
    >
      <span className="ask-orb" aria-hidden="true" />
      <span className="ask-launcher-label">Ask Vaibhav</span>
    </button>
  );
}
