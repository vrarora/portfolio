import type { DonationAction, DonationState, Receipt } from "./types";

export function createInitialState(): DonationState {
  return {
    step: "story",
    heroIndex: 0,
    tierId: null,
    frequency: "once",
    monthlyUpgraded: false,
    receipt: null,
  };
}

function createReceipt(): Receipt {
  const serial = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return { ref: `EA-${serial}`, date };
}

export function donationReducer(
  state: DonationState,
  action: DonationAction,
): DonationState {
  switch (action.type) {
    case "OPEN_GIFT":
      return state.step === "story" ? { ...state, step: "gift" } : state;

    case "CLOSE_GIFT":
      return state.step === "gift" || state.step === "confirm"
        ? { ...state, step: "story" }
        : state;

    case "SELECT_TIER":
      return { ...state, tierId: action.tierId };

    case "SET_FREQUENCY":
      return { ...state, frequency: action.frequency };

    case "CONTINUE_TO_CONFIRM":
      return state.step === "gift" && state.tierId !== null
        ? { ...state, step: "confirm" }
        : state;

    case "BACK_TO_GIFT":
      return state.step === "confirm" ? { ...state, step: "gift" } : state;

    case "OPEN_PAYMENT":
      return state.step === "confirm" ? { ...state, step: "payment" } : state;

    case "AUTHORIZE_PAYMENT":
      return state.step === "payment"
        ? { ...state, step: "processing" }
        : state;

    case "PAYMENT_DONE":
      return state.step === "processing"
        ? { ...state, step: "keepsake", receipt: action.receipt ?? createReceipt() }
        : state;

    case "SET_HERO_INDEX":
      return { ...state, heroIndex: action.index };

    case "ACCEPT_MONTHLY":
      return state.step === "keepsake"
        ? { ...state, monthlyUpgraded: true }
        : state;

    case "RESET":
      return createInitialState();

    case "HYDRATE":
      return action.state;
  }
}
