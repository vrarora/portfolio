"use client";

import { createContext, useContext } from "react";
import type { RefObject } from "react";

/**
 * The element a case study scrolls inside: the sheet body when opened as a
 * sheet, null for the window on the reading page.
 */
export const ScrollRootContext = createContext<RefObject<HTMLElement | null> | null>(null);

export function useScrollRoot() {
  return useContext(ScrollRootContext);
}
