import { arc, ellipse, reach, segment, type Point } from "../../sketch";

/**
 * Line doodles of the people behind the work, drawn in code. Each one is a
 * function of time that returns strokes in a 120 by 90 box; the card redraws
 * it a few times a second, so it moves like a flip book.
 */

export type Stroke = {
  points: Point[];
  closed?: boolean;
  width?: number;
  color?: string;
  fill?: string;
  opacity?: number;
};

export type Doodle = {
  id: string;
  label: string;
  draw: (t: number) => Stroke[];
};

const INK = "#1c1b1a";
const BLUE = "#3148d4";

type Pose = {
  /** Hip position. */
  hip: Point;
  scale?: number;
  /** Degrees the spine leans from upright; positive leans right. */
  lean?: number;
  tilt?: number;
  /** [upper, lower] angles in degrees for each arm and leg; 90 points straight down. */
  armL: [number, number];
  armR: [number, number];
  legL: [number, number];
  legR: [number, number];
  color?: string;
  /** A soft fill for the torso, for the coloured-pencil doodles. */
  shirt?: string;
};

/** A simple person: round head, soft torso, two-part limbs. */
function person({ hip, scale = 1, lean = 0, tilt = 0, armL, armR, legL, legR, color = INK, shirt }: Pose): Stroke[] {
  const s = scale;
  const shoulder = reach(hip, 21 * s, -90 + lean);
  const head = reach(shoulder, 8.5 * s, -90 + lean + tilt);
  const side = (p: Point, d: number): Point => reach(p, d, lean);
  const torso: Point[] = [side(shoulder, -5 * s), side(shoulder, 5 * s), side(hip, 4 * s), side(hip, -4 * s)];

  const limb = (from: Point, [a, b]: [number, number], l1: number, l2: number) => {
    const joint = reach(from, l1 * s, a);
    return [from, joint, reach(joint, l2 * s, b)];
  };

  return [
    { points: ellipse(head[0], head[1], 5.6 * s, 6 * s, 10), closed: true, color, fill: "#fff" },
    { points: torso, closed: true, color, fill: shirt ?? "#fff" },
    { points: limb(side(shoulder, -4.5 * s), armL, 10, 9), color },
    { points: limb(side(shoulder, 4.5 * s), armR, 10, 9), color },
    { points: limb(side(hip, -2.5 * s), legL, 12, 12), color },
    { points: limb(side(hip, 2.5 * s), legR, 12, 12), color },
  ];
}

const wave = (t: number, speed: number, amount: number, phase = 0) => Math.sin(t * speed + phase) * amount;

export const DOODLES: readonly Doodle[] = [
  {
    id: "bench",
    label: "Someone on a bench, talking to their phone late at night",
    draw: (t) => {
      const glow = 0.35 + 0.25 * (Math.sin(t * 2.2) + 1);
      return [
        { points: segment([22, 62], [98, 62], 6) },
        { points: segment([28, 62], [28, 78], 2) },
        { points: segment([92, 62], [92, 78], 2) },
        { points: segment([22, 55], [98, 55], 6), width: 1 },
        ...person({ hip: [58, 60], scale: 0.9, lean: -4, tilt: 12, armL: [60, -40], armR: [80, -60], legL: [180, 90], legR: [175, 95] }),
        { points: ellipse(66, 38, 7, 7, 10), closed: true, fill: "#9fb4ff", color: "transparent", opacity: glow },
        { points: [[63, 34], [69, 34], [69, 42], [63, 42]], closed: true, fill: "#fff", width: 1.2 },
        { points: arc(96, 18, 6, 6, -2.4, 1.2, 6), width: 1.2 },
      ];
    },
  },
  {
    id: "family",
    label: "A family standing close together",
    draw: (t) => {
      const sway = wave(t, 1.6, 1.4);
      const hop = Math.max(0, Math.sin(t * 3.2)) * 3;
      return [
        ...person({ hip: [38 + sway, 56], lean: 4, armL: [100, 95], armR: [60, 40], legL: [95, 92], legR: [85, 88] }),
        ...person({ hip: [60, 66 - hop], scale: 0.62, armL: [130, 150], armR: [50, 30], legL: [100, 95], legR: [80, 85] }),
        ...person({ hip: [82 - sway, 56], lean: -4, tilt: -6, armL: [120, 140], armR: [80, 85], legL: [95, 92], legR: [85, 88] }),
      ];
    },
  },
  {
    id: "id",
    label: "Someone holding up an ID to prove it is really them",
    draw: (t) => {
      const lift = wave(t, 2, 1.5);
      const check = (t * 0.5) % 1;
      const tick: Point[] = [[84, 26], [88, 31], [97, 20]];
      return [
        ...person({ hip: [44, 62], tilt: -8, armL: [110, 100], armR: [-20, -70 + lift * 4], legL: [96, 92], legR: [84, 88] }),
        { points: [[62, 18 + lift], [80, 18 + lift], [80, 30 + lift], [62, 30 + lift]], closed: true, fill: "#fff", width: 1.4 },
        { points: ellipse(67, 24 + lift, 2.6, 2.8, 8), closed: true, width: 1 },
        { points: segment([72, 22 + lift], [78, 22 + lift], 2), width: 1 },
        { points: segment([72, 26 + lift], [77, 26 + lift], 2), width: 1 },
        ...(check > 0.35 ? [{ points: tick.slice(0, check > 0.55 ? 3 : 2), color: BLUE, width: 2 }] : []),
      ];
    },
  },
  {
    id: "walk",
    label: "A walk with a dog that stops to sniff everything",
    draw: (t) => {
      const step = wave(t, 5, 22);
      const paw = wave(t, 7, 14);
      const tail = wave(t, 11, 12);
      return [
        ...person({ hip: [38, 54], lean: 4, armL: [100 - step / 2, 90], armR: [55, 25], legL: [90 + step, 95 + step], legR: [90 - step, 95 - step], shirt: "#cfe0ff" }),
        { points: [[57, 42], [70, 55], [82, 60]], width: 1, color: "#8a6b4a" },
        { points: ellipse(92, 66, 11, 6, 12), closed: true, fill: "#f2c27b" },
        { points: ellipse(80, 60, 5, 4.4, 10), closed: true, fill: "#f2c27b" },
        { points: [[77, 57], [75, 63], [79, 61]], closed: true, fill: "#c98d4c" },
        { points: [[84, 70], [83 + paw / 4, 80]] },
        { points: [[88, 71], [89 - paw / 4, 80]] },
        { points: [[98, 71], [97 + paw / 4, 80]] },
        { points: [[102, 70], [103 - paw / 4, 80]] },
        { points: [[103, 64], [110, 58 + tail / 3], [112, 52 + tail / 2]] },
      ];
    },
  },
  {
    id: "door",
    label: "A boy in his doorway, watching the street go by",
    draw: (t) => {
      const look = wave(t, 1.3, 14);
      const pass = ((t * 12) % 70) - 10;
      return [
        { points: [[20, 84], [20, 12], [54, 12], [54, 84]], width: 1.8 },
        { points: segment([54, 84], [112, 84], 5), width: 1 },
        ...person({ hip: [36, 66], scale: 0.62, tilt: look, armL: [100, 95], armR: [80, 85], legL: [95, 92], legR: [85, 88], color: BLUE }),
        ...person({ hip: [64 + pass, 60], scale: 0.7, lean: 6, armL: [110, 90], armR: [70, 90], legL: [70, 80], legR: [110, 100], color: "#9a9a9a" }),
      ];
    },
  },
  {
    id: "read",
    label: "Someone reading before sleep",
    draw: (t) => {
      const flip = (t * 0.7) % 1;
      const page = flip < 0.3 ? 70 - flip * 120 : 34;
      return [
        ...person({ hip: [48, 62], lean: 6, tilt: 18, armL: [60, -30], armR: [40, -40], legL: [10, 90], legR: [5, 95] }),
        { points: [[58, 42], [66, 36], [74, 42]], width: 1.4 },
        { points: [[66, 36], [66 + Math.cos((page * Math.PI) / 180) * 8, 36 - Math.sin((page * Math.PI) / 180) * 5]], width: 1.2 },
        { points: arc(98, 20, 7, 7, 1.9, 5.2, 7), color: BLUE, width: 1.4 },
        { points: segment([20, 84], [104, 84], 5), width: 1 },
      ];
    },
  },
  {
    id: "breathe",
    label: "One slow breath, then another",
    draw: (t) => {
      const breath = 1 + wave(t, 1.1, 0.05);
      const blink = (phase: number) => (Math.sin(t * 2 + phase) > 0.2 ? 1 : 0.15);
      const star = (x: number, y: number, phase: number): Stroke[] => [
        { points: segment([x - 3, y], [x + 3, y], 2), color: BLUE, width: 1.2, opacity: blink(phase) },
        { points: segment([x, y - 3], [x, y + 3], 2), color: BLUE, width: 1.2, opacity: blink(phase) },
      ];
      return [
        ...person({ hip: [60, 64], scale: breath, armL: [120, 60], armR: [60, 120], legL: [160, 10], legR: [20, 170] }),
        ...star(28, 24, 0),
        ...star(94, 30, 2),
        ...star(84, 12, 4),
      ];
    },
  },
  {
    id: "hello",
    label: "Someone waving hello",
    draw: (t) => {
      const hand = wave(t, 6, 26);
      return [
        ...person({ hip: [52, 62], tilt: 6, armL: [100, 95], armR: [-40, -90 + hand], legL: [96, 92], legR: [84, 88], color: BLUE }),
        { points: arc(74, 16, 10, 10, -2.2, -1.2, 4), color: BLUE, width: 1.2 },
        { points: arc(74, 16, 15, 15, -2.3, -1.1, 4), color: BLUE, width: 1.2 },
      ];
    },
  },
];
