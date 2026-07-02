"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
  type RefObject,
} from "react";
import { useReducedMotion } from "motion/react";
import { createInitialState, donationReducer } from "./reducer";
import type { DonationAction, DonationState, FlowMode } from "./types";

type DonationFlowContextValue = {
  state: DonationState;
  dispatch: Dispatch<DonationAction>;
  mode: FlowMode;
  reducedMotion: boolean;
  /** The phone-viewport element. Sheets portal into it and the demo driver
   * resolves touch targets against it. Attached by DonationExperience. */
  viewportRef: RefObject<HTMLDivElement | null>;
};

const DonationFlowContext = createContext<DonationFlowContextValue | null>(null);

export function DonationFlowProvider({
  mode,
  initialState,
  children,
}: {
  mode: FlowMode;
  initialState?: DonationState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    donationReducer,
    initialState ?? createInitialState(),
  );
  const prefersReducedMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      mode,
      reducedMotion: prefersReducedMotion ?? false,
      viewportRef,
    }),
    [state, mode, prefersReducedMotion],
  );

  return (
    <DonationFlowContext.Provider value={value}>
      {children}
    </DonationFlowContext.Provider>
  );
}

export function useDonationFlow(): DonationFlowContextValue {
  const ctx = useContext(DonationFlowContext);
  if (ctx === null) {
    throw new Error("useDonationFlow must be used inside DonationFlowProvider");
  }
  return ctx;
}
