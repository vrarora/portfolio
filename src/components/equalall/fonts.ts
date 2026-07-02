import { Fraunces } from "next/font/google";

/** Editorial serif for campaign storytelling and the keepsake card.
 * Exposed as a CSS variable so equalall.css can reference it while the
 * portfolio's global font setup stays untouched. Apply `fraunces.variable`
 * on every `.ea-root` host element. */
export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--ea-font-serif",
  display: "swap",
});
