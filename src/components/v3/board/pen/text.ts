import * as allure from "./allure";
import * as excalifont from "./excalifont";

type Shape = readonly number[];

type Glyph = {
  advance: number;
  /** Centre lines the pen follows, in writing order. */
  strokes: readonly Shape[];
  /** Outline fonts only: the closed outline, and the stroke width that uncovers all of it. */
  contours?: readonly Shape[];
  reveal?: number;
};

type Font = { unitsPerEm: number; glyph: (ch: string) => Glyph };

const FONTS: Record<"allure" | "excalifont", Font> = {
  allure: {
    unitsPerEm: allure.UNITS_PER_EM,
    glyph: (ch) => {
      const [advance, strokes] = allure.GLYPHS[ch] ?? allure.GLYPHS[" "];
      return { advance, strokes };
    },
  },
  excalifont: {
    unitsPerEm: excalifont.UNITS_PER_EM,
    glyph: (ch) => {
      const [advance, contours, strokes, reveal] = excalifont.GLYPHS[ch] ?? excalifont.GLYPHS[" "];
      return { advance, strokes, contours, reveal };
    },
  },
};

export type PenFont = keyof typeof FONTS;

export type PenText = {
  /** One SVG path per pen stroke, in writing order. */
  paths: string[];
  /**
   * Outline fonts only. `d` is every letter's filled shape. The paths drawn
   * `reveal[i]` wide uncover it, so each letter appears under the pen.
   */
  outline?: { d: string; reveal: number[] };
  width: number;
  height: number;
};

/** Line height as a multiple of the font size. */
const LEADING = 1.55;

function advance(line: string, font: PenFont) {
  let w = 0;
  for (const ch of line) w += FONTS[font].glyph(ch).advance;
  return w;
}

/**
 * Lays out handwritten text at `size` px per em. The box's top-left sits at
 * (x, y), and "\n" starts a new line.
 */
export function penText(text: string, size: number, x = 0, y = 0, font: PenFont = "allure"): PenText {
  const { unitsPerEm, glyph } = FONTS[font];
  const s = size / unitsPerEm;
  const lines = text.split("\n");
  const paths: string[] = [];
  const reveal: number[] = [];
  let outline = "";
  let width = 0;

  lines.forEach((line, row) => {
    const baseline = y + size * 0.8 + row * size * LEADING;
    let cx = x;
    const toPath = (shape: Shape) => {
      let d = "";
      for (let i = 0; i < shape.length; i += 2) {
        d += `${i ? "L" : "M"}${(cx + shape[i] * s).toFixed(1)} ${(baseline - shape[i + 1] * s).toFixed(1)}`;
      }
      return d;
    };

    for (const ch of line) {
      const g = glyph(ch);
      for (const stroke of g.strokes) {
        paths.push(toPath(stroke));
        if (g.reveal) reveal.push(g.reveal * s);
      }
      for (const contour of g.contours ?? []) outline += `${toPath(contour)}Z`;
      cx += g.advance * s;
    }
    width = Math.max(width, advance(line, font) * s);
  });

  return {
    paths,
    outline: outline ? { d: outline, reveal } : undefined,
    width,
    height: size * (0.8 + (lines.length - 1) * LEADING + 0.35),
  };
}

/** Width of the longest line at `size`, for fitting text to a box. */
export function penWidth(text: string, size: number, font: PenFont = "allure") {
  return Math.max(...text.split("\n").map((line) => advance(line, font))) * (size / FONTS[font].unitsPerEm);
}
