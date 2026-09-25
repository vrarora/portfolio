import { arc, ellipse, reach, segment, type Point } from "../../sketch";

/**
 * Small scenes of the people behind the work, drawn in code: silhouettes under
 * glowing skies, like the story page. Each scene is a function of time that
 * returns marks in a 100 by 75 box; the card redraws it a few times a second,
 * so it moves like a flip book. Motion stays slow, on the pace of a breath.
 */

export const VIEW_W = 100;
export const VIEW_H = 75;

export type Stroke = {
  points: Point[];
  closed?: boolean;
  /** Line width; 0 draws the fill alone. */
  width?: number;
  /** Defaults to the scene's ink. */
  color?: string;
  /** A colour, or "ink" to fill with the line colour. */
  fill?: string;
  opacity?: number;
  /** Skips the wobble, for horizons and small lights that should hold still. */
  steady?: boolean;
  /** Joins the points with straight lines, for boxes whose corners should stay square. */
  sharp?: boolean;
};

export type Glow = { glow: { x: number; y: number; r: number; color: string; opacity?: number } };

export type Mark = Stroke | Glow;

export type Doodle = {
  id: string;
  label: string;
  /** Sky colours from top to bottom. */
  sky: string[];
  /** Silhouette colour, always darker than the sky behind it. */
  ink: string;
  draw: (t: number) => Mark[];
};

const BLUE = "#3148d4";
const MOON = "#fbf0cf";
const PAPER = "#fbeed2";

/* Shapes --------------------------------------------------------------------- */

/** Points around a rectangle, several per side, so the wobble bends the edges. Draw it with `sharp`. */
function box(x: number, y: number, w: number, h: number): Point[] {
  const corners: Point[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  return corners.flatMap((corner, i) => segment(corner, corners[(i + 1) % 4], 3).slice(0, -1));
}

/** A band of land: the ridge line, closed along the bottom edge past the frame. */
function land(ridge: Point[], fill = "ink"): Stroke {
  return { points: [...ridge, [VIEW_W + 4, VIEW_H + 4], [-4, VIEW_H + 4]], closed: true, fill, width: 0 };
}

/** A four-point star that brightens and dims on its own phase. */
function star(x: number, y: number, size: number, t: number, phase: number, color = MOON): Stroke {
  const points: Point[] = Array.from({ length: 8 }, (_, i) => {
    const r = i % 2 === 0 ? size : size * 0.28;
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r];
  });
  return { points, closed: true, fill: color, width: 0, steady: true, opacity: 0.45 + 0.55 * ((Math.sin(t * 1.3 + phase) + 1) / 2) };
}

/** A bird as two wings; `flap` runs from -1 (down) to 1 (up). */
function bird(x: number, y: number, size: number, flap: number): Stroke {
  const tip = y - flap * size * 0.7;
  return {
    points: [
      [x - size, tip],
      [x - size * 0.45, y - size * 0.35],
      [x, y],
      [x + size * 0.45, y - size * 0.35],
      [x + size, tip],
    ],
    width: 0.55,
  };
}

/** A soft cloud from overlapping puffs. */
function cloud(x: number, y: number, size: number, color: string): Stroke[] {
  const puffs: [number, number, number][] = [
    [0, 0, 1],
    [-0.9, 0.35, 0.7],
    [0.95, 0.3, 0.75],
    [0.35, -0.35, 0.72],
  ];
  return puffs.map(([dx, dy, r]) => ({
    points: ellipse(x + dx * size * 2, y + dy * size, size * 1.4 * r, size * r, 12),
    closed: true,
    fill: color,
    width: 0,
    opacity: 0.9,
  }));
}

/** An arm that reaches a given hand position, bending a little on the way. */
function armTo(shoulder: Point, hand: Point, sag = 1.2): Stroke {
  const mid: Point = [(shoulder[0] + hand[0]) / 2, (shoulder[1] + hand[1]) / 2 + sag];
  return { points: [shoulder, mid, hand], width: 1.4 };
}

/** A slow sine, `speed` in radians per second. */
const wave = (t: number, speed: number, amount: number, phase = 0) => Math.sin(t * speed + phase) * amount;

/** Loops 0 to 1 once every `period` seconds. */
const loop = (t: number, period: number, offset = 0) => (((t / period + offset) % 1) + 1) % 1;

/* People --------------------------------------------------------------------- */

type Pose = {
  /** Hip position. */
  hip: Point;
  scale?: number;
  /** Degrees the spine leans from upright; positive leans right. */
  lean?: number;
  /** Degrees the head tips from the line of the spine. */
  tilt?: number;
  /** [upper, lower] angles in degrees for each arm and leg; 90 points straight down. */
  armL?: [number, number];
  armR?: [number, number];
  legL: [number, number];
  legR: [number, number];
};

type Figure = { marks: Stroke[]; shoulderL: Point; shoulderR: Point; handL?: Point; handR?: Point; head: Point };

/**
 * A silhouette about 24 units tall: round head, tapered torso, limbs as thick
 * round-capped strokes. Leave out an arm to draw it with `armTo` instead.
 */
function figure({ hip, scale = 1, lean = 0, tilt = 0, armL, armR, legL, legR }: Pose): Figure {
  const s = scale;
  const side = (p: Point, d: number): Point => reach(p, d, lean);
  const shoulder = reach(hip, 8.5 * s, -90 + lean);
  const neck = reach(shoulder, 1.2 * s, -90 + lean + tilt);
  const head = reach(neck, 2.5 * s, -90 + lean + tilt);
  const shoulderL = side(shoulder, -2 * s);
  const shoulderR = side(shoulder, 2 * s);

  const limb = (from: Point, [a, b]: [number, number], l1: number, l2: number) => {
    const joint = reach(from, l1 * s, a);
    return [from, joint, reach(joint, l2 * s, b)] as Point[];
  };

  const marks: Stroke[] = [
    { points: ellipse(head[0], head[1], 2.5 * s, 2.6 * s, 12), closed: true, fill: "ink", width: 0 },
    { points: [head, neck, shoulder], width: 1.4 * s },
    { points: [side(shoulder, -2.4 * s), side(shoulder, 2.4 * s), side(hip, 1.9 * s), side(hip, -1.9 * s)], closed: true, fill: "ink", width: 0.6 * s },
    { points: limb(side(hip, -1.1 * s), legL, 5.4, 5.2), width: 2 * s },
    { points: limb(side(hip, 1.1 * s), legR, 5.4, 5.2), width: 2 * s },
  ];

  let handL: Point | undefined;
  let handR: Point | undefined;
  if (armL) {
    const pts = limb(shoulderL, armL, 4.3, 4);
    handL = pts[2];
    marks.push({ points: pts, width: 1.5 * s });
  }
  if (armR) {
    const pts = limb(shoulderR, armR, 4.3, 4);
    handR = pts[2];
    marks.push({ points: pts, width: 1.5 * s });
  }

  return { marks, shoulderL, shoulderR, handL, handR, head };
}

/* Scenes --------------------------------------------------------------------- */

export const DOODLES: readonly Doodle[] = [
  {
    id: "bench",
    label: "Someone on a bench under the moon, talking it through with a friend",
    sky: ["#171d4a", "#343c7c", "#6664a3"],
    ink: "#0e1130",
    draw: (t) => {
      const person = figure({ hip: [41, 52.5], lean: -4, tilt: 8, armL: [95, 70], armR: [72, -95], legL: [8, 92], legR: [14, 88] });
      const phone = person.handR ?? [45, 43];
      const fall = loop(t, 9);
      const meteor: Mark[] =
        fall < 0.12
          ? [{ points: segment([14 + fall * 180, 6 + fall * 60], [20 + fall * 180, 8 + fall * 60], 2), color: MOON, width: 0.5, opacity: 1 - fall / 0.12, steady: true }]
          : [];
      return [
        { glow: { x: 74, y: 17, r: 28, color: "#fff1c9", opacity: 0.32 } },
        { points: ellipse(74, 17, 5, 5, 16), closed: true, fill: MOON, width: 0, steady: true },
        star(16, 11, 1.5, t, 0),
        star(33, 21, 1, t, 1.4),
        star(49, 8, 1.3, t, 2.2),
        star(90, 33, 1, t, 0.8),
        star(59, 27, 0.8, t, 3.1),
        star(8, 29, 0.9, t, 4.2),
        ...meteor,
        land([[-4, 55], [18, 51.5], [44, 54], [70, 49.5], [104, 53]], "#262b5c"),
        land([[-4, 62], [30, 60], [62, 61], [104, 59]]),
        { points: segment([25, 54], [57, 54], 4), width: 1.3 },
        { points: segment([26, 48], [56, 48], 4), width: 1 },
        { points: [[28, 48], [28, 54]], width: 0.9 },
        { points: [[54, 48], [54, 54]], width: 0.9 },
        { points: [[28, 54], [27.5, 61]], width: 1 },
        { points: [[54, 54], [54.5, 61]], width: 1 },
        ...person.marks,
        { glow: { x: phone[0], y: phone[1] - 1, r: 7, color: "#ffd58a", opacity: 0.5 + wave(t, 1.4, 0.15) } },
        { points: box(phone[0] - 0.6, phone[1] - 2, 1.3, 2.2), closed: true, sharp: true, fill: "#ffe3a3", width: 0, steady: true },
      ];
    },
  },
  {
    id: "family",
    label: "A family on a hill at dusk, swinging the little one between them",
    sky: ["#7a74be", "#d89ab6", "#ffd0a0"],
    ink: "#2a1f3d",
    draw: (t) => {
      const lift = Math.max(0, Math.sin(t * 1.7)) * 6;
      const tuck = lift / 6;
      const child = figure({
        hip: [50, 54 - lift],
        scale: 0.6,
        armL: [-120, -110],
        armR: [-60, -70],
        legL: [90 - tuck * 50, 90 + tuck * 40],
        legR: [90 - tuck * 40, 90 + tuck * 50],
      });
      const left = figure({ hip: [38, 50.5], lean: 3, armL: [98, 92], legL: [96, 92], legR: [86, 88] });
      const right = figure({ hip: [62, 50.5], lean: -3, armR: [82, 88], legL: [94, 92], legR: [84, 88] });
      const drift = loop(t, 24) * 130 - 15;
      return [
        { glow: { x: 50, y: 52, r: 36, color: "#fff0c2", opacity: 0.6 } },
        { points: ellipse(50, 52, 11, 11, 20), closed: true, fill: "#fff3d0", width: 0, steady: true },
        land([[-4, 58], [24, 55], [50, 57], [76, 54], [104, 57]], "#9a7199"),
        land([[-4, 71], [24, 63.5], [50, 60.5], [76, 63.5], [104, 71]]),
        ...left.marks,
        ...right.marks,
        ...child.marks,
        armTo(left.shoulderR, child.handL ?? [48, 44]),
        armTo(right.shoulderL, child.handR ?? [52, 44]),
        bird(drift, 18 + wave(t, 0.7, 1), 1.6, Math.sin(t * 4)),
        bird(drift + 5, 15 + wave(t, 0.7, 1, 1), 1.3, Math.sin(t * 4 + 1.5)),
      ];
    },
  },
  {
    id: "rain",
    label: "A grandmother and a child on the verandah steps, watching the rain",
    sky: ["#8c9ab8", "#b8c1d4", "#e4dacf"],
    ink: "#232a3d",
    draw: (t) => {
      const lean = wave(t, 0.9, 2);
      const grandma = figure({ hip: [30, 55.5], lean: 6, tilt: 6, armL: [95, 60], legL: [6, 94], legR: [12, 90] });
      const child = figure({ hip: [40, 57], scale: 0.62, lean: -16 + lean, tilt: -10, armL: [110, 40], armR: [80, 30], legL: [10, 96], legR: [16, 92] });
      const hug: Point = [child.shoulderR[0] + 0.6, child.shoulderR[1] + 1.4];
      const rain = Array.from({ length: 16 }, (_, i): Stroke => {
        const x = 57 + ((i * 37) % 44);
        const y = 8 + loop(t, 1.6, (i * 0.37) % 1) * 56;
        return { points: [[x, y], [x - 0.9, y + 3.4]], color: "#f1f4fb", width: 0.35, opacity: 0.7, steady: true };
      });
      const ripple = (x: number, offset: number): Stroke => {
        const p = loop(t, 2.4, offset);
        return { points: ellipse(x, 66.5, 1 + p * 4, 0.3 + p * 1, 14), closed: true, color: "#f1f4fb", width: 0.35, opacity: (1 - p) * 0.8, steady: true };
      };
      return [
        { glow: { x: 84, y: 40, r: 26, color: "#fff4e4", opacity: 0.45 } },
        land([[50, 50], [70, 47], [86, 49], [104, 46]], "#9aa3b9"),
        { points: [[80, 52], [80.2, 44]], color: "#7f89a3", width: 1.2 },
        { points: ellipse(80, 41, 5, 4.4, 12), closed: true, fill: "#7f89a3", width: 0 },
        land([[50, 64], [80, 63.5], [104, 64]], "#4b5470"),
        { points: ellipse(82, 66.5, 12, 1.8, 18), closed: true, fill: "#a9b3c9", width: 0, steady: true },
        ripple(78, 0),
        ripple(87, 0.5),
        ...rain,
        { points: box(-4, 10, 56, 70), closed: true, sharp: true, fill: "#3f4560", width: 0, steady: true },
        { glow: { x: 32, y: 42, r: 24, color: "#ffd59a", opacity: 0.4 } },
        { points: box(19, 24, 25, 32), closed: true, sharp: true, fill: "#ffcf8e", width: 0, steady: true },
        { points: box(-4, 3, 58, 7), closed: true, sharp: true, fill: "ink", width: 0, steady: true },
        { points: box(49, 10, 3, 46), closed: true, sharp: true, fill: "ink", width: 0, steady: true },
        { points: box(-4, 56, 57, 3.5), closed: true, sharp: true, fill: "ink", width: 0, steady: true },
        { points: box(-4, 59.5, 61, 3.5), closed: true, sharp: true, fill: "#1c2233", width: 0, steady: true },
        { points: box(-4, 63, 64, 20), closed: true, sharp: true, fill: "#151a29", width: 0, steady: true },
        ...grandma.marks,
        { points: ellipse(grandma.head[0] - 2, grandma.head[1] - 0.6, 1.3, 1.2, 8), closed: true, fill: "ink", width: 0 },
        ...child.marks,
        armTo(grandma.shoulderR, hug, -1.6),
      ];
    },
  },
  {
    id: "walk",
    label: "A slow morning walk with a dog that stops for every flower",
    sky: ["#ffe1b6", "#ffd0ae", "#f5c1b4"],
    ink: "#3a2638",
    draw: (t) => {
      const step = wave(t, 3, 16);
      const person = figure({
        hip: [44, 52],
        lean: 2,
        armL: [95 - step * 0.7, 100 - step * 0.5],
        armR: [62, 72],
        legL: [90 + step, 96 + step * 0.4],
        legR: [90 - step, 96 - step * 0.4],
      });
      const hand = person.handR ?? [50, 49];
      const sniff = 1 + wave(t, 5, 0.7);
      const wag = wave(t, 9, 1.4);
      const leaves = [0, 1, 2, 3].map((k): Stroke => {
        const p = loop(t, 7, k / 4);
        const x = 14 + k * 5 + p * 18 + Math.sin(p * 8 + k) * 2.5;
        const y = 26 + p * 36;
        return { points: ellipse(x, y, 1, 0.55, 6, p * 6 + k), closed: true, fill: k % 2 ? "#e07a3f" : "#c7553a", width: 0, opacity: p > 0.85 ? (1 - p) / 0.15 : 1 };
      });
      return [
        { glow: { x: 80, y: 22, r: 30, color: "#fff6d8", opacity: 0.75 } },
        land([[-4, 58], [40, 56], [104, 58]], "#d69c90"),
        { points: [[16, 62], [16.4, 48], [15, 36]], width: 2.8 },
        { points: [[16.2, 46], [21, 39]], width: 1.4 },
        { points: ellipse(14, 28, 10, 8, 14), closed: true, fill: "ink", width: 0 },
        { points: ellipse(22, 27, 8, 6.5, 14), closed: true, fill: "ink", width: 0 },
        { points: ellipse(9, 33, 7, 5.5, 12), closed: true, fill: "ink", width: 0 },
        { points: ellipse(21, 33, 7.5, 5, 12), closed: true, fill: "ink", width: 0 },
        land([[-4, 63], [50, 62], [104, 63.5]]),
        ...person.marks,
        { points: [hand, [(hand[0] + 76) / 2, (hand[1] + 56) / 2 + 2.5], [76, 56]], width: 0.45 },
        { points: ellipse(71, 57, 6, 3.2, 14), closed: true, fill: "ink", width: 0 },
        { points: ellipse(77.8, 56.4 + sniff, 2.5, 2.1, 10), closed: true, fill: "ink", width: 0 },
        { points: [[76.6, 55 + sniff], [75.4, 57.6 + sniff], [77.2, 57 + sniff]], closed: true, fill: "ink", width: 0.5 },
        { points: [[80, 56.6 + sniff], [81.6, 57.4 + sniff]], width: 1.4 },
        { points: [[67, 58.5], [66.6, 62.5]], width: 1.1 },
        { points: [[69.5, 59], [69.8, 62.5]], width: 1.1 },
        { points: [[73.5, 59], [73.2, 62.5]], width: 1.1 },
        { points: [[75.5, 58.5], [75.9, 62.5]], width: 1.1 },
        { points: [[65.4, 56], [63.4, 53.5 + wag], [63, 51.5 + wag]], width: 0.9 },
        { points: [[85, 63], [85.3, 59], [85, 56]], width: 0.6 },
        { points: [[85.2, 60], [87, 58.8]], width: 0.5 },
        { points: ellipse(85, 55.4, 1.7, 1.5, 10), closed: true, fill: "#ff7a59", width: 0 },
        { points: ellipse(85, 55.4, 0.5, 0.5, 6), closed: true, fill: "#ffd36b", width: 0, steady: true },
        ...leaves,
      ];
    },
  },
  {
    id: "door",
    label: "A boy in his doorway in Bikaner, watching kites cross the evening sky",
    sky: ["#f2ad82", "#fbcfa0", "#fde6c4"],
    ink: "#3b1f2b",
    draw: (t) => {
      const kite = (cx: number, cy: number, size: number, color: string): Stroke[] => [
        { points: [[cx, cy + size], [cx + 6, cy + 16], [cx + 12, cy + 36], [cx + 16, 80]], width: 0.3, opacity: 0.7 },
        { points: [[cx, cy - size], [cx + size * 0.75, cy], [cx, cy + size], [cx - size * 0.75, cy]], closed: true, fill: color, width: 0.45 },
        { points: [[cx, cy - size], [cx, cy + size]], width: 0.3 },
        { points: [[cx, cy + size], [cx - 1.5, cy + size + 2.5], [cx + 0.5, cy + size + 4.5]], width: 0.35 },
      ];
      const roofs: [number, number, number][] = [[30, 55, 10], [40, 57, 8], [47, 51, 9], [56, 57, 11], [66, 52, 11], [77, 55.5, 9], [86, 50, 5], [90, 57, 14]];
      const domes: [number, number, number][] = [[51.5, 51, 3], [88.5, 50, 2]];
      const boy = figure({ hip: [16, 62.5], scale: 0.6, lean: -6, armL: [80, 75], armR: [-38, -48], legL: [4, 88], legR: [10, 84] });
      return [
        { glow: { x: 78, y: 58, r: 30, color: "#fff1cf", opacity: 0.6 } },
        ...roofs.map(([x, y, w]): Stroke => ({ points: box(x - 0.3, y, w + 0.6, 30), closed: true, sharp: true, fill: "#d08b78", width: 0, steady: true })),
        ...domes.map(([x, y, r]): Stroke => ({ points: arc(x, y, r, r * 1.1, Math.PI, Math.PI * 2, 8), closed: true, fill: "#d08b78", width: 0, steady: true })),
        ...domes.map(([x, y, r]): Stroke => ({ points: [[x, y - r * 1.1], [x, y - r * 1.1 - 1.2]], color: "#d08b78", width: 0.5, steady: true })),
        ...kite(64 + wave(t, 0.8, 3), 20 + wave(t, 1.1, 2), 4, "#e2475b"),
        ...kite(85 + wave(t, 0.6, 2, 1), 11 + wave(t, 0.9, 1.5, 2), 2.8, BLUE),
        bird(46 + wave(t, 0.3, 4), 14, 1.2, Math.sin(t * 4)),
        { points: box(-4, 16, 37, 64), closed: true, sharp: true, fill: "ink", width: 0, steady: true },
        { glow: { x: 16, y: 52, r: 16, color: "#ffd9a0", opacity: 0.35 } },
        { points: [[9, 64], [9, 41], [10.5, 35.5], [16, 31], [21.5, 35.5], [23, 41], [23, 64]], closed: true, fill: "#ffc47d", width: 0 },
        { points: box(6, 64, 20, 2), closed: true, sharp: true, fill: "#2a1520", width: 0 },
        ...boy.marks,
      ];
    },
  },
  {
    id: "read",
    label: "Reading late, with the moon at the window and tea going cold",
    sky: ["#282c55", "#323664", "#3c3e6d"],
    ink: "#141530",
    draw: (t) => {
      const person = figure({ hip: [40, 51], lean: -12, tilt: 14, armL: [45, -55], armR: [30, -70], legL: [4, 80], legR: [-2, 86] });
      const hold = person.handR ?? [47, 43];
      const spine: Point = [hold[0] + 0.5, hold[1] - 1];
      const f = loop(t, 5);
      const turning = f < 0.18 ? f / 0.18 : -1;
      const pageTip = (base: number): Point => [spine[0] + 2.6 * Math.cos(Math.PI * turning), spine[1] + base - 1.8 * Math.sin(Math.PI * turning)];
      const steam = (phase: number): Stroke => ({
        points: [0, 1, 2, 3].map((i) => [63 + Math.sin(t * 1.2 + i + phase) * 0.8, 50.5 - i * 1.8] as Point),
        color: "#c9c3e6",
        width: 0.45,
        opacity: 0.55,
      });
      return [
        { points: box(57, 10, 32, 32), closed: true, sharp: true, fill: "ink", width: 0, steady: true },
        { points: box(58, 11, 30, 30), closed: true, sharp: true, fill: "#5a69a6", width: 0, steady: true },
        { glow: { x: 78, y: 20, r: 12, color: "#fff1c9", opacity: 0.4 } },
        { points: ellipse(78, 20, 3.4, 3.4, 14), closed: true, fill: MOON, width: 0, steady: true },
        star(64, 17, 0.9, t, 0),
        star(69, 33, 0.7, t, 2),
        star(84, 34, 0.8, t, 4),
        { points: [[73, 11], [73, 41]], width: 0.8, steady: true },
        { points: [[58, 26], [88, 26]], width: 0.8, steady: true },
        { glow: { x: 21, y: 32, r: 32, color: "#ffcf85", opacity: 0.42 } },
        land([[-4, 64], [104, 64]], "#1c1d3b"),
        { points: [[21, 30], [21, 64]], width: 0.9 },
        { points: [[17, 64], [25, 64]], width: 1.4 },
        { points: [[16, 30], [26, 30], [24, 23.5], [18, 23.5]], closed: true, fill: "#ffdca0", width: 0.5 },
        { points: [[29, 64], [29, 42], [31, 38], [35, 38.5], [36.5, 52], [54, 52], [56, 56], [55, 64]], closed: true, fill: "ink", width: 0 },
        ...person.marks,
        { points: [spine, [spine[0] - 2.6, spine[1] + 0.9], [spine[0] - 2.6, spine[1] + 2.4], [spine[0], spine[1] + 1.8]], closed: true, fill: PAPER, width: 0.3, steady: true },
        { points: [spine, [spine[0] + 2.6, spine[1] + 0.9], [spine[0] + 2.6, spine[1] + 2.4], [spine[0], spine[1] + 1.8]], closed: true, fill: PAPER, width: 0.3, steady: true },
        { glow: { x: spine[0], y: spine[1] + 1, r: 5, color: "#ffe2a8", opacity: 0.35 } },
        ...(turning >= 0 ? [{ points: [spine, pageTip(0.9), pageTip(2.4), [spine[0], spine[1] + 1.8]] as Point[], closed: true, fill: "#fff6e2", width: 0.3, steady: true }] : []),
        { points: box(58, 54, 10, 1.2), closed: true, sharp: true, fill: "ink", width: 0 },
        { points: [[59.5, 55], [59.5, 64]], width: 0.8 },
        { points: [[66.5, 55], [66.5, 64]], width: 0.8 },
        { points: box(61.6, 51.2, 2.8, 2.8), closed: true, sharp: true, fill: "#e9d7c0", width: 0.3 },
        steam(0),
        steam(2),
      ];
    },
  },
  {
    id: "breathe",
    label: "One slow breath at the edge of the sea, just as the sun comes up",
    sky: ["#9eafe0", "#f1c2c8", "#ffe1c1"],
    ink: "#2a2542",
    draw: (t) => {
      const breath = (Math.sin((t * Math.PI * 2) / 6) + 1) / 2;
      const rise = breath * 0.6;
      // The sitter sits left of the sun, so its reflection runs clear of them.
      const x = 37;
      const shimmer = [0, 1, 2, 3, 4, 5].map((i): Stroke => {
        const y = 51 + i * 2.1;
        const half = 4.2 - i * 0.55 + wave(t, 2, 0.6, i);
        return { points: [[50 - half, y], [50 + half, y]], color: "#fff1d6", width: 0.55, opacity: 0.5 + wave(t, 1.6, 0.35, i * 1.7), steady: true };
      });
      return [
        { glow: { x: 50, y: 48, r: 30 + breath * 6, color: "#fff2d8", opacity: 0.75 } },
        { points: ellipse(50, 49, 7, 7, 20), closed: true, fill: "#fff4dc", width: 0, steady: true },
        { points: box(-4, 49, 108, 30), closed: true, sharp: true, fill: "#8e8dbf", width: 0, steady: true },
        ...shimmer,
        bird(22 + wave(t, 0.25, 6), 20, 1.3, Math.sin(t * 3)),
        land([[-4, 66], [28, 64.2], [72, 64.6], [104, 66]]),
        { points: ellipse(x, 63.4, 6.6, 1.9, 16), closed: true, fill: "ink", width: 0 },
        { points: [[x - 2.4, 55.2 - rise], [x + 2.4, 55.2 - rise], [x + 3.4, 63], [x - 3.4, 63]], closed: true, fill: "ink", width: 0.6 },
        { points: [[x, 53.6 - rise], [x, 55.4 - rise]], width: 1.4 },
        { points: ellipse(x, 51.4 - rise, 2.5, 2.6, 12), closed: true, fill: "ink", width: 0 },
        { points: [[x - 2.2, 55.6 - rise], [x - 4.4, 59.2], [x - 5.8, 62.4]], width: 1.3 },
        { points: [[x + 2.2, 55.6 - rise], [x + 4.4, 59.2], [x + 5.8, 62.4]], width: 1.3 },
      ];
    },
  },
  {
    id: "hello",
    label: "Someone on a hilltop, waving to the birds on their way home",
    sky: ["#a6c6ea", "#d5def0", "#f7dbc5"],
    ink: "#23304a",
    draw: (t) => {
      const person = figure({ hip: [47, 47.5], tilt: -4, armL: [100, 94], armR: [-52, -84 + wave(t, 4, 22)], legL: [96, 92], legR: [84, 88] });
      const lead = 96 - loop(t, 22) * 124;
      const flock: [number, number][] = [[0, 0], [3.4, -2], [3.4, 2], [6.8, -3.8], [6.8, 3.6]];
      return [
        { glow: { x: 80, y: 56, r: 30, color: "#fff0d0", opacity: 0.6 } },
        ...cloud(24 + loop(t, 60) * 20, 18, 3.4, "#fffaf3"),
        ...cloud(76 - loop(t, 70, 0.5) * 16, 32, 2.4, "#fff6ee"),
        land([[-4, 60], [30, 56], [66, 58.5], [104, 55]], "#9eaacb"),
        land([[-4, 72], [20, 64.5], [40, 58.6], [56, 57.6], [72, 60.5], [104, 70]]),
        ...person.marks,
        ...flock.map(([dx, dy], i) => bird(lead + dx, 22 + dy + wave(t, 0.6, 0.8), 1.4, Math.sin(t * 4.5 + i * 0.9))),
        ...(person.handR ? [{ points: arc(person.handR[0], person.handR[1], 3.2, 3.2, -2.2, -1, 4), width: 0.4, opacity: 0.5 + wave(t, 4, 0.4) }] : []),
      ];
    },
  },
];
