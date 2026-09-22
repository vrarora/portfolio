export const BREAKPOINTS = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1200,
  xl: 1468,
} as const;

export const mq = {
  coarse: "(pointer: coarse)",
  hover: "(hover: hover)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  belowSm: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  belowMd: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  belowLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
} as const;
