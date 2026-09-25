import { GLYPHS, UNITS_PER_EM } from "./allure";

export type PenText = {
  /** One SVG path per pen stroke, in drawing order. */
  paths: string[];
  width: number;
  height: number;
};

/** Line height as a multiple of the font size. */
const LEADING = 1.55;

function advance(line: string) {
  let w = 0;
  for (const ch of line) w += (GLYPHS[ch] ?? GLYPHS[" "])[0];
  return w;
}

/**
 * Lays out handwritten text at `size` px per em. The box's top-left sits at
 * (x, y), and "\n" starts a new line.
 */
export function penText(text: string, size: number, x = 0, y = 0): PenText {
  const s = size / UNITS_PER_EM;
  const lines = text.split("\n");
  const paths: string[] = [];
  let width = 0;

  lines.forEach((line, row) => {
    const baseline = y + size * 0.8 + row * size * LEADING;
    let cx = x;
    for (const ch of line) {
      const [adv, strokes] = GLYPHS[ch] ?? GLYPHS[" "];
      for (const stroke of strokes) {
        let d = "";
        for (let i = 0; i < stroke.length; i += 2) {
          d += `${i ? "L" : "M"}${(cx + stroke[i] * s).toFixed(1)} ${(baseline - stroke[i + 1] * s).toFixed(1)}`;
        }
        paths.push(d);
      }
      cx += adv * s;
    }
    width = Math.max(width, advance(line) * s);
  });

  return { paths, width, height: size * (0.8 + (lines.length - 1) * LEADING + 0.35) };
}

/** Width of the longest line at `size`, for fitting text to a box. */
export function penWidth(text: string, size: number) {
  return Math.max(...text.split("\n").map(advance)) * (size / UNITS_PER_EM);
}
