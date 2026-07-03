"use client";

import { useDonationFlow } from "../flow/DonationFlowProvider";

/** Desktop-stage ambient light: the phone's screen state spills onto the
 * canvas behind it. Gradients can't transition, so three fixed layers
 * crossfade by opacity — warm neutral while the donor reads and chooses,
 * charcoal dusk while the wallet is open, aurora warmth at the thank-you.
 * Rendered only by the mockup route's desktop branch; embeds and the
 * fullbleed mobile layout never mount it. */
export function StageGlow() {
  const { state } = useDonationFlow();
  const step = state.step;
  const dusk = step === "payment" || step === "processing";
  const dawn = step === "keepsake";

  return (
    <div className="ea-stage-glow" aria-hidden="true">
      <span
        className="ea-glow-warm"
        style={{ opacity: dusk || dawn ? 0 : 1 }}
      />
      <span className="ea-glow-dusk" style={{ opacity: dusk ? 1 : 0 }} />
      <span className="ea-glow-dawn" style={{ opacity: dawn ? 1 : 0 }} />
    </div>
  );
}
