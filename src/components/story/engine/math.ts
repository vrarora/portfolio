export type RGB = readonly [number, number, number];

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Linear 0..1 position of `x` between `a` and `b`, clamped. */
export const range = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));

export const smooth = (t: number) => t * t * (3 - 2 * t);

export const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Rises over [a, b], holds, falls over [c, d]. */
export const bump = (x: number, a: number, b: number, c: number, d: number) =>
  range(x, a, b) * (1 - range(x, c, d));

export function hex(value: string): RGB {
  const n = Number.parseInt(value.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const mix = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export const rgba = (c: RGB, a = 1) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

/** Deterministic PRNG so every scene draws the same way on every visit. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = ReturnType<typeof seeded>;

export const between = (rand: Rand, a: number, b: number) => a + (b - a) * rand();
