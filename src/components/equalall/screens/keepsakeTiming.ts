/** Choreography map for the thank-you moment — seconds after the keepsake
 * mounts. Dawn breaks first (shader reveal 0.25 + 1.6s, radially from the
 * checkmark's position), so every element enters onto lit ground; then the
 * journey unfolds downward: the stamped fact, the thread leaving it, the
 * promise ahead.
 *
 * Downstream consumers keyed to these numbers: demo/scripts.ts (recurring
 * pause), scripts/verify-equalall.mjs, both audit scripts, and
 * scripts/capture-equalall-thumbnails.mjs. Change here → change there. */
export const KEEPSAKE_T = {
  title: 0.65,
  lede: 0.95,
  card: 1.1,
  wp1: 1.35,
  stamp: 1.65, // lands ~1.89 (spring travel ~0.24s); jolt at 1.87
  seg1: 1.95,
  wp2: 2.3,
  seg2: 2.55,
  wp3: 2.95,
  promise: 3.25,
  stub: 3.4, // reference rolls at 3.5, settles ~4.25
  invite: 3.65,
  reset: 4.0,
} as const;

/** Spring travel time from stamp start to first paper contact. */
export const STAMP_LAND = 0.24;
