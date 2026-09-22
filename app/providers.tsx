"use client";

import { IconContext } from "@phosphor-icons/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <IconContext.Provider value={{ weight: "bold" }}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </IconContext.Provider>
    </ConvexClientProvider>
  );
}
