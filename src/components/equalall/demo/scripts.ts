import type { DonationState } from "../flow/types";
import type { DemoScript } from "./runner";

export type ExperimentId =
  | "anchor"
  | "impact"
  | "tangible"
  | "carousel"
  | "recurring";

function pose(overrides: Partial<DonationState> = {}): DonationState {
  return {
    step: "story",
    heroIndex: 0,
    tierId: null,
    frequency: "once",
    monthlyUpgraded: false,
    receipt: null,
    ...overrides,
  };
}

/** One micro-demo per experiment — siblings, equally weighted. Every tap is
 * a real click on the live UI; the runner never fakes a transition. */
export const SCRIPTS: Record<ExperimentId, DemoScript> = {
  anchor: {
    pose: pose(),
    caption: "Doubt starts at the amount",
    holdEnd: 2300,
    steps: [
      { kind: "pause", ms: 700 },
      { kind: "tap", target: "donate-bar", hold: 750 },
      { kind: "caption", text: "How much is right?" },
      { kind: "drift", target: "tier-t25" },
      { kind: "pause", ms: 420 },
      { kind: "drift", target: "tier-t250" },
      { kind: "pause", ms: 420 },
      { kind: "caption", text: "The platform answers before doubt cools" },
      { kind: "tap", target: "tier-t100", hold: 650 },
      { kind: "caption", text: "“Most chosen” removes the hesitation" },
      { kind: "pause", ms: 900 },
    ],
  },

  impact: {
    pose: pose({ step: "gift" }),
    caption: "Amounts were bare numbers",
    holdEnd: 2300,
    steps: [
      { kind: "pause", ms: 800 },
      { kind: "tap", target: "tier-t25", hold: 950 },
      { kind: "tap", target: "tier-t50", hold: 950 },
      { kind: "caption", text: "Each amount carries its meaning" },
      { kind: "tap", target: "tier-t100", hold: 950 },
      { kind: "tap", target: "tier-t250", hold: 700 },
      { kind: "caption", text: "The ladder finally means something" },
      { kind: "pause", ms: 900 },
    ],
  },

  tangible: {
    pose: pose({ step: "gift", tierId: "t100" }),
    caption: "A checkout ends on an abstract total",
    holdEnd: 2600,
    steps: [
      { kind: "pause", ms: 800 },
      { kind: "tap", target: "gift-continue", hold: 900 },
      { kind: "caption", text: "The gift becomes the thing it buys" },
      { kind: "pause", ms: 1400 },
      { kind: "caption", text: "The last click feels like the feeling" },
      { kind: "pause", ms: 900 },
    ],
  },

  carousel: {
    pose: pose(),
    caption: "Donors reached for the photo",
    holdEnd: 2300,
    steps: [
      { kind: "pause", ms: 700 },
      {
        kind: "swipe",
        target: "hero-frame",
        dx: -110,
        action: { type: "SET_HERO_INDEX", index: 1 },
      },
      { kind: "pause", ms: 650 },
      {
        kind: "swipe",
        target: "hero-frame",
        dx: -110,
        action: { type: "SET_HERO_INDEX", index: 2 },
      },
      { kind: "caption", text: "Looking closer is no longer a dead end" },
      { kind: "pause", ms: 500 },
      { kind: "tap", target: "hero-donate", hold: 800 },
      { kind: "caption", text: "The photo leads straight into giving" },
      { kind: "pause", ms: 900 },
    ],
  },

  recurring: {
    pose: pose({ step: "gift", tierId: "t100" }),
    caption: "The most moved donors will not come back",
    holdEnd: 2600,
    steps: [
      { kind: "pause", ms: 800 },
      { kind: "tap", target: "freq-monthly", hold: 900 },
      { kind: "caption", text: "One tap turns a gift into a commitment" },
      { kind: "tap", target: "freq-once", hold: 700 },
      { kind: "action", action: { type: "SELECT_TIER", tierId: "t100" } },
      { kind: "action", action: { type: "CONTINUE_TO_CONFIRM" } },
      { kind: "pause", ms: 500 },
      { kind: "action", action: { type: "OPEN_PAYMENT" } },
      { kind: "pause", ms: 500 },
      { kind: "action", action: { type: "AUTHORIZE_PAYMENT" } },
      { kind: "caption", text: "And right after giving, once more" },
      { kind: "pause", ms: 2800 },
      { kind: "tap", target: "invite-accept", hold: 900 },
      { kind: "caption", text: "Keep giving without re-living it" },
      { kind: "pause", ms: 900 },
    ],
  },
};
