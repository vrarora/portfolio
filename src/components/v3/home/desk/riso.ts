/**
 * A small risograph printer for Canvas 2D. A scene draws each ink into its own
 * coverage plate (alpha is tone), and `print` screens every plate into halftone
 * dots, offsets it a little out of register and multiplies it onto grained paper.
 */

export type InkName = "yellow" | "pink" | "blue" | "indigo";

export type Plates = Record<InkName, CanvasRenderingContext2D>;

type Ink = {
  name: InkName;
  rgb: readonly [number, number, number];
  /** Screen angle in degrees; each ink sits at its own angle so the dots don't moiré. */
  angle: number;
  /** Out-of-register offset in design units. */
  offset: readonly [number, number];
};

const INKS: readonly Ink[] = [
  { name: "yellow", rgb: [255, 214, 58], angle: 0, offset: [0.6, -0.4] },
  { name: "pink", rgb: [244, 84, 160], angle: 72, offset: [-0.5, 0.5] },
  { name: "blue", rgb: [46, 98, 178], angle: 15, offset: [0.4, 0.6] },
  { name: "indigo", rgb: [46, 44, 88], angle: 45, offset: [-0.3, -0.3] },
];

const PAPER: readonly [number, number, number] = [246, 240, 228];
/** How strongly a dot of ink covers the paper; riso ink is slightly translucent. */
const INK_OPACITY = 0.92;

export class RisoPrinter {
  private readonly canvas: HTMLCanvasElement;
  private readonly out: CanvasRenderingContext2D;
  private readonly designWidth: number;
  private readonly designHeight: number;
  private plates: Plates | null = null;
  private thresholds: Uint8Array[] = [];
  private grain: Float32Array = new Float32Array(0);
  private width = 0;
  private height = 0;
  private scale = 1;

  constructor(canvas: HTMLCanvasElement, designWidth: number, designHeight: number) {
    this.canvas = canvas;
    const out = canvas.getContext("2d");
    if (!out) throw new Error("Canvas 2D is unavailable");
    this.out = out;
    this.designWidth = designWidth;
    this.designHeight = designHeight;
  }

  /** Sizes the print to its box; `pitch` is the halftone cell in CSS pixels. */
  resize(cssWidth: number, dpr: number, pitch = 2.3) {
    const width = Math.max(1, Math.round(cssWidth * dpr));
    const height = Math.max(1, Math.round((cssWidth * dpr * this.designHeight) / this.designWidth));
    if (width === this.width && height === this.height) return;

    this.width = width;
    this.height = height;
    this.scale = width / this.designWidth;
    this.canvas.width = width;
    this.canvas.height = height;

    const make = () => {
      const plate = document.createElement("canvas");
      plate.width = width;
      plate.height = height;
      const ctx = plate.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas 2D is unavailable");
      return ctx;
    };
    this.plates = { yellow: make(), pink: make(), blue: make(), indigo: make() };

    // A dot screen per ink: each pixel's threshold is its distance from the nearest dot centre.
    const cell = pitch * dpr;
    this.thresholds = INKS.map((ink) => {
      const map = new Uint8Array(width * height);
      const a = (ink.angle * Math.PI) / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const u = (x * cos + y * sin) / cell;
          const v = (-x * sin + y * cos) / cell;
          const du = u - Math.floor(u) - 0.5;
          const dv = v - Math.floor(v) - 0.5;
          map[y * width + x] = Math.min(255, (du * du + dv * dv) * Math.PI * 255);
        }
      }
      return map;
    });

    // Paper tooth: fine noise plus the odd fibre.
    this.grain = new Float32Array(width * height);
    let seed = 1234567;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < this.grain.length; i++) this.grain[i] = 0.965 + rand() * 0.035;
    for (let f = 0; f < (width * height) / 900; f++) {
      let x = rand() * width;
      let y = rand() * height;
      const a = rand() * Math.PI;
      for (let s = 0; s < 14; s++) {
        x += Math.cos(a) * dpr;
        y += Math.sin(a) * dpr;
        const i = Math.floor(y) * width + Math.floor(x);
        if (i >= 0 && i < this.grain.length) this.grain[i] *= 0.955;
      }
    }
  }

  /**
   * Draws the scene into fresh plates and prints them. `drift` nudges every plate
   * by a fraction of a pixel, which gives a looping print its slight shimmer.
   */
  print(draw: (plates: Plates) => void, drift = 0) {
    const plates = this.plates;
    if (!plates) return;
    const { width, height, scale } = this;

    INKS.forEach((ink, i) => {
      const g = plates[ink.name];
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = "source-over";
      g.clearRect(0, 0, width, height);
      const wobble = drift ? Math.sin(drift * 2.1 + i * 1.7) * 0.25 : 0;
      g.setTransform(scale, 0, 0, scale, (ink.offset[0] + wobble) * scale, (ink.offset[1] - wobble) * scale);
    });

    draw(plates);

    const coverage = INKS.map((ink) => plates[ink.name].getImageData(0, 0, width, height).data);
    const image = this.out.createImageData(width, height);
    const px = image.data;
    const factors = INKS.map((ink) => ink.rgb.map((c) => 1 - INK_OPACITY * (1 - c / 255)));

    for (let i = 0, p = 0; i < width * height; i++, p += 4) {
      const paper = this.grain[i];
      let r = PAPER[0] * paper;
      let g = PAPER[1] * paper;
      let b = PAPER[2] * paper;
      for (let k = 0; k < INKS.length; k++) {
        const c = coverage[k][p + 3];
        if (c === 0) continue;
        // Soft-edged dot: a few levels either side of the threshold blend, so dots stay round.
        const ink = Math.min(1, Math.max(0, (c - this.thresholds[k][i]) / 28 + 0.5));
        if (ink === 0) continue;
        const f = factors[k];
        r *= 1 - ink * (1 - f[0]);
        g *= 1 - ink * (1 - f[1]);
        b *= 1 - ink * (1 - f[2]);
      }
      px[p] = r;
      px[p + 1] = g;
      px[p + 2] = b;
      px[p + 3] = 255;
    }

    this.out.putImageData(image, 0, 0);
  }
}

/* Drawing helpers: every shape is a Path2D so one outline can print on one plate and clear another. */

export function tone(g: CanvasRenderingContext2D, path: Path2D, coverage: number) {
  g.fillStyle = `rgba(0,0,0,${coverage})`;
  g.fill(path);
}

/** Clears a shape out of a plate at full coverage, so a lighter ink over it prints clean. */
export function knock(g: CanvasRenderingContext2D, path: Path2D) {
  g.save();
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = "#000";
  g.fill(path);
  g.restore();
}

/** Clears, then prints: a shape that owns its tone instead of adding to what is under it. */
export function plane(g: CanvasRenderingContext2D, path: Path2D, coverage: number) {
  knock(g, path);
  tone(g, path, coverage);
}

type Stops = readonly (readonly [number, number])[];

function gradientStops(gradient: CanvasGradient, stops: Stops) {
  stops.forEach(([at, coverage]) => gradient.addColorStop(at, `rgba(0,0,0,${coverage})`));
  return gradient;
}

/** A coverage ramp inside a shape: on paper it prints as dots growing or shrinking. */
export function ramp(g: CanvasRenderingContext2D, path: Path2D, from: readonly [number, number], to: readonly [number, number], stops: Stops) {
  g.fillStyle = gradientStops(g.createLinearGradient(from[0], from[1], to[0], to[1]), stops);
  g.fill(path);
}

export function glow(g: CanvasRenderingContext2D, path: Path2D, cx: number, cy: number, r0: number, r1: number, stops: Stops) {
  g.fillStyle = gradientStops(g.createRadialGradient(cx, cy, r0, cx, cy, r1), stops);
  g.fill(path);
}

/** A soft knockout: lightens a plate along a ramp, like light opening up a dark ground. */
export function fade(g: CanvasRenderingContext2D, path: Path2D, cx: number, cy: number, r0: number, r1: number, strength: number) {
  g.save();
  g.globalCompositeOperation = "destination-out";
  glow(g, path, cx, cy, r0, r1, [
    [0, strength],
    [1, 0],
  ]);
  g.restore();
}

export function line(g: CanvasRenderingContext2D, path: Path2D, width: number, coverage: number) {
  g.strokeStyle = `rgba(0,0,0,${coverage})`;
  g.lineWidth = width;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.stroke(path);
}

/** Loose dots scattered by a density function: grain, dust, steam. */
export function spray(g: CanvasRenderingContext2D, count: number, rand: () => number, place: (r: () => number) => readonly [number, number, number] | null) {
  g.fillStyle = "#000";
  for (let i = 0; i < count; i++) {
    const dot = place(rand);
    if (!dot) continue;
    g.beginPath();
    g.arc(dot[0], dot[1], dot[2], 0, Math.PI * 2);
    g.fill();
  }
}
