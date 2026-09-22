export { SPRING_SHEET, SPRING_STEP, SPRING_POP, FADE } from "@/components/equalall/motionTokens";

export const SPRING_PANEL = { type: "spring", stiffness: 300, damping: 34 } as const;
export const SPRING_STICKER = { type: "spring", stiffness: 260, damping: 24, mass: 0.9 } as const;
export const SPRING_GATHER = { type: "spring", stiffness: 200, damping: 26 } as const;
export const SPRING_FAN = { type: "spring", stiffness: 420, damping: 28 } as const;

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
