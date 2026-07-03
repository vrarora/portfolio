export type TierId = "t25" | "t50" | "t100" | "t250";

export type Frequency = "once" | "monthly";

export type FlowStep =
  | "story"
  | "gift"
  | "confirm"
  | "payment"
  | "processing"
  | "keepsake";

export type Receipt = {
  ref: string;
  date: string;
};

export type DonationState = {
  step: FlowStep;
  heroIndex: number;
  tierId: TierId | null;
  frequency: Frequency;
  monthlyUpgraded: boolean;
  receipt: Receipt | null;
};

export type DonationAction =
  | { type: "OPEN_GIFT" }
  | { type: "CLOSE_GIFT" }
  | { type: "SELECT_TIER"; tierId: TierId }
  | { type: "SET_FREQUENCY"; frequency: Frequency }
  | { type: "CONTINUE_TO_CONFIRM" }
  | { type: "BACK_TO_GIFT" }
  | { type: "OPEN_PAYMENT" }
  | { type: "CANCEL_PAYMENT" }
  | { type: "AUTHORIZE_PAYMENT" }
  | { type: "PAYMENT_DONE"; receipt?: Receipt }
  | { type: "SET_HERO_INDEX"; index: number }
  | { type: "ACCEPT_MONTHLY" }
  | { type: "RESET" }
  | { type: "HYDRATE"; state: DonationState };

/** How the experience is being hosted. Gestures and ambient effects are
 * interactive-only; the scripted mode drives everything through actions. */
export type FlowMode = "interactive" | "scripted";
