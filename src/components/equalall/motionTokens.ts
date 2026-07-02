/** Shared spring vocabulary — one physical language across the product. */
export const SPRING_SHEET = {
  type: "spring",
  stiffness: 340,
  damping: 36,
} as const;

export const SPRING_STEP = {
  type: "spring",
  stiffness: 380,
  damping: 34,
} as const;

export const SPRING_POP = {
  type: "spring",
  stiffness: 520,
  damping: 30,
} as const;

export const FADE = { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } as const;
