"use client";

import { LeafShadow } from "@/components/effects/LeafShadow";
import { useSky } from "@/components/effects/SkyProvider";

/** Leaf shadows over the hero; wind halves at night. */
export function HomeLeaves() {
  const { state } = useSky();
  return <LeafShadow amplitude={state.night > 0.5 ? 0.5 : 1} />;
}
