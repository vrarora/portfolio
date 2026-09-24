import { jitter, seeded, smoothPath, type Point } from "../../sketch";
import { fade, glow, knock, line, plane, ramp, spray, tone, type Plates } from "./riso";

/** The print is drawn in a 640 by 480 design space. */
export const DESK_WIDTH = 640;
export const DESK_HEIGHT = 480;

/** A hand-cut shape: the points wobble a little, and a doubled point keeps its corner. */
function cut(points: readonly Point[], rand: () => number, amount = 0.8, closed = true) {
  return new Path2D(smoothPath(jitter(points, amount, rand), closed));
}

/** A rectangle as a hand-cut shape, with corners held and edges that waver. */
function block(x: number, y: number, w: number, h: number, rand: () => number, amount = 0.6) {
  const pts: Point[] = [];
  const edge = (a: Point, b: Point) => {
    pts.push(a, a);
    for (let i = 1; i < 4; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / 4, a[1] + ((b[1] - a[1]) * i) / 4]);
  };
  edge([x, y], [x + w, y]);
  edge([x + w, y], [x + w, y + h]);
  edge([x + w, y + h], [x, y + h]);
  edge([x, y + h], [x, y]);
  return cut(pts, rand, amount);
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number, rand: () => number, amount = 0.6, steps = 18) {
  const pts: Point[] = Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Point;
  });
  return cut(pts, rand, amount);
}

function union(...paths: Path2D[]) {
  const all = new Path2D();
  paths.forEach((p) => all.addPath(p));
  return all;
}

/**
 * His corner at dusk: a window over the rooftops of Bikaner, the desk, chai and a
 * jar of sweets, three awards on the shelf, a plant, and the dog asleep on its cushion.
 * `t` is seconds; only the steam, the lamp, the dog's breath and his nod move.
 */
export function drawDesk({ yellow: Y, pink: P, blue: B, indigo: I }: Plates, t: number) {
  // Shapes come from one seeded source in a fixed order, so every plate agrees on every edge.
  const rand = seeded(11);
  const everything = new Path2D();
  everything.rect(-10, -10, DESK_WIDTH + 20, DESK_HEIGHT + 20);

  /* Room ----------------------------------------------------------------------------- */

  tone(Y, everything, 0.1);
  tone(P, everything, 0.03);

  const floor = block(-10, 332, DESK_WIDTH + 20, 160, rand, 0);
  ramp(B, floor, [0, 332], [0, 480], [
    [0, 0.12],
    [1, 0.3],
  ]);
  ramp(P, floor, [0, 332], [0, 480], [
    [0, 0.05],
    [1, 0.12],
  ]);

  const rug = ellipsePath(330, 430, 250, 34, rand, 1.2);
  tone(P, rug, 0.16);
  tone(Y, rug, 0.12);

  /* Window: dusk over the rooftops ---------------------------------------------------- */

  // The window hangs high on the wall, so everything on the desk stands against plain wall.
  const all = [Y, P, B, I];
  all.forEach((g) => {
    g.save();
    g.translate(0, -46);
  });

  const frame = block(70, 36, 320, 258, rand, 0.4);
  const glass = block(84, 50, 292, 230, rand, 0.3);
  knock(Y, frame);
  knock(P, frame);

  ramp(P, glass, [0, 50], [0, 280], [
    [0, 0.62],
    [0.6, 0.28],
    [1, 0.12],
  ]);
  ramp(Y, glass, [0, 50], [0, 280], [
    [0, 0.04],
    [0.55, 0.5],
    [0.85, 0.95],
  ]);
  ramp(B, glass, [0, 50], [0, 280], [
    [0, 0.5],
    [0.45, 0.08],
    [0.7, 0],
  ]);

  // Two long clouds, pink on the warm half of the sky.
  const cloudA = cut([[110, 112], [150, 104], [220, 108], [262, 104], [300, 112], [246, 118], [170, 118]], rand, 1.2);
  const cloudB = cut([[200, 138], [250, 132], [330, 134], [360, 140], [300, 146], [230, 145]], rand, 1.2);
  tone(P, union(cloudA, cloudB), 0.45);
  knock(Y, union(cloudA, cloudB));

  // The sun sits low; its disc is cleared to paper, then printed pure yellow.
  const sun = ellipsePath(318, 226, 22, 22, rand, 0.3);
  knock(P, sun);
  knock(B, sun);
  plane(Y, sun, 0.98);
  fade(P, glass, 318, 226, 22, 110, 0.55);

  // Far hills in haze, then the city: flat roofs, a haveli, two chhatris, a temple.
  const hills = cut([[80, 244], [110, 236], [150, 240], [200, 232], [250, 238], [300, 234], [350, 240], [382, 236], [382, 282], [80, 282]], rand, 0.8);
  tone(B, hills, 0.34);

  const skyline: Point[] = [
    [80, 262], [80, 250], [96, 250], [96, 250], [96, 244], [118, 244], [118, 244], [118, 254], [132, 254], [132, 238],
    [138, 232], [144, 226], [150, 232], [156, 238], [156, 256], [176, 256], [176, 246], [204, 246], [204, 246], [204, 234],
    [206, 228], [214, 222], [222, 228], [224, 234], [224, 252], [240, 252], [240, 240], [262, 240], [262, 240], [262, 250],
    [280, 250], [282, 236], [286, 222], [290, 210], [294, 222], [298, 236], [300, 250], [322, 250], [322, 242], [344, 242],
    [344, 242], [344, 254], [360, 254], [360, 246], [382, 246], [382, 282], [80, 282],
  ];
  const city = cut(skyline, rand, 0.4);
  plane(B, city, 0.62);
  tone(I, city, 0.62);
  knock(Y, city);
  knock(P, city);

  // Lit windows across the city, warm against the dusk.
  const lit = union(
    ...[[100, 256], [124, 262], [140, 244], [164, 264], [186, 256], [212, 240], [232, 262], [252, 250], [290, 244], [310, 258], [334, 252], [352, 264], [370, 256]].map(([x, y]) =>
      block(x, y, 4, 5, rand, 0.2),
    ),
  );
  knock(I, lit);
  knock(B, lit);
  tone(Y, lit, 0.95);
  tone(P, lit, 0.2);

  // Frame and mullion.
  const bar = block(226, 50, 8, 230, rand, 0.3);
  const border = new Path2D("M70 36 H390 V294 H70 Z M84 50 V280 H376 V50 Z");
  for (const [g, coverage] of [[I, 0.82], [B, 0.3]] as const) {
    g.save();
    g.clip(frame);
    g.fillStyle = `rgba(0,0,0,${coverage})`;
    g.fill(border, "evenodd");
    g.restore();
    plane(g, bar, coverage);
  }
  knock(Y, bar);
  knock(P, bar);
  const sill = block(62, 288, 336, 10, rand, 0.3);
  plane(I, sill, 0.45);
  plane(B, sill, 0.5);
  knock(Y, sill);

  all.forEach((g) => g.restore());

  /* Shelf with the three awards ---------------------------------------------------------- */

  const shelf = block(416, 132, 150, 6, rand, 0.3);
  tone(I, shelf, 0.75);
  tone(B, shelf, 0.3);
  const cup = cut([[440, 96], [440, 96], [462, 96], [462, 96], [460, 110], [454, 118], [448, 118], [442, 110]], rand, 0.4);
  const stem = block(447, 118, 8, 8, rand, 0.2);
  const plinth = block(441, 125, 20, 7, rand, 0.2);
  tone(Y, union(cup, stem), 0.95);
  tone(P, union(cup, stem), 0.12);
  tone(I, plinth, 0.7);
  const medal = ellipsePath(496, 120, 9, 9, rand, 0.3);
  const ribbon = cut([[488, 96], [488, 96], [496, 110], [504, 96], [504, 96]], rand, 0.3, false);
  line(P, ribbon, 3, 0.9);
  tone(Y, medal, 0.95);
  const certificate = block(522, 102, 30, 30, rand, 0.3);
  tone(B, certificate, 0.18);
  line(I, certificate, 1.4, 0.8);

  /* Desk ----------------------------------------------------------------------------- */

  const top = block(40, 300, 560, 18, rand, 0.4);
  const apron = block(46, 318, 548, 14, rand, 0.4);
  const legs = union(block(62, 332, 14, 104, rand, 0.3), block(564, 332, 14, 104, rand, 0.3));
  knock(Y, union(top, apron, legs));
  plane(B, top, 0.62);
  plane(B, apron, 0.8);
  plane(B, legs, 0.7);
  tone(I, union(apron, legs), 0.5);
  tone(I, top, 0.18);

  // The laptop's glow opens a pool of light on the desk in front of him.
  fade(B, top, 252, 306, 4, 90, 0.7);
  glow(Y, top, 252, 306, 4, 90, [
    [0, 0.6],
    [1, 0],
  ]);

  // Books, the jar of sweets, the chai.
  const books = [block(78, 286, 50, 14, rand, 0.3), block(82, 274, 44, 12, rand, 0.3), block(76, 264, 48, 10, rand, 0.3)];
  plane(B, books[0], 0.82);
  plane(P, books[1], 0.72);
  plane(Y, books[2], 0.85);
  tone(B, books[2], 0.3);

  const jar = block(146, 262, 30, 38, rand, 0.4);
  tone(B, jar, 0.12);
  line(B, jar, 1.2, 0.55);
  const ladoos = union(
    ellipsePath(154, 291, 6, 6, rand, 0.3),
    ellipsePath(168, 292, 6, 6, rand, 0.3),
    ellipsePath(161, 281, 6, 6, rand, 0.3),
    ellipsePath(153, 272, 5, 5, rand, 0.3),
    ellipsePath(169, 273, 5, 5, rand, 0.3),
  );
  tone(Y, ladoos, 0.95);
  tone(P, ladoos, 0.4);
  const lid = block(148, 255, 26, 8, rand, 0.3);
  tone(P, lid, 0.9);

  const mug = block(192, 278, 18, 22, rand, 0.4);
  tone(P, mug, 0.7);
  tone(Y, mug, 0.5);
  line(P, cut([[192, 283], [184, 285], [184, 293], [192, 295]], rand, 0.3, false), 2.2, 0.7);
  // Steam rises and thins out into dots.
  const steamRand = seeded(Math.floor(t * 8));
  spray(I, 70, steamRand, (r) => {
    const k = r();
    const y = 272 - k * 44;
    const x = 201 + Math.sin(k * 7 + t * 2) * 5 + (r() - 0.5) * 6;
    return r() > k * 0.9 ? [x, y, 0.9 - k * 0.5] : null;
  });

  /* Lamp and its light -------------------------------------------------------------- */

  const flicker = 1 + Math.sin(t * 3.1) * 0.03 + Math.sin(t * 7.3) * 0.02;
  const cone = cut([[436, 214], [470, 214], [530, 300], [398, 300]], rand, 0.6);
  fade(B, top, 464, 300, 6, 80, 0.6 * flicker);
  ramp(Y, cone, [0, 214], [0, 300], [
    [0, 0.55 * flicker],
    [1, 0.08],
  ]);
  const arm = cut([[476, 298], [492, 244], [462, 208]], rand, 0.3, false);
  line(I, arm, 4, 0.85);
  const base = ellipsePath(476, 298, 16, 4, rand, 0.3);
  tone(I, base, 0.9);
  const shade = cut([[440, 196], [440, 196], [466, 202], [466, 202], [470, 216], [470, 216], [434, 214], [434, 214]], rand, 0.3);
  tone(I, shade, 0.9);
  tone(B, shade, 0.3);

  /* Him, from behind, against the window -------------------------------------------- */

  const nod = Math.sin(t * 4.6) * 1.2;
  const head = ellipsePath(252 + nod * 0.3, 194 + Math.abs(nod) * 0.4, 21, 23, rand, 0.4);
  const neck = block(242, 212, 20, 16, rand, 0.3);
  const torso = cut(
    [
      [228, 226], [276, 226], [294, 234], [300, 254], [292, 290], [288, 356], [216, 356], [212, 290], [204, 254], [210, 234],
    ],
    rand,
    0.6,
  );
  // Elbows out, forearms resting on the desk towards the laptop.
  const arms = union(
    cut([[212, 236], [200, 256], [194, 286], [206, 302], [228, 300], [214, 290], [208, 262], [218, 244]], rand, 0.5),
    cut([[292, 236], [304, 256], [310, 286], [298, 302], [276, 300], [290, 290], [296, 262], [286, 244]], rand, 0.5),
  );
  const figure = union(head, neck, torso, arms);

  // Sunset catches his right edge: blue and indigo shift left, yellow fills the gap.
  const shifted = (g: CanvasRenderingContext2D, coverage: number) => {
    g.save();
    g.translate(-5, 0.5);
    plane(g, figure, coverage);
    g.restore();
  };
  knock(P, figure);
  plane(Y, figure, 0.92);
  Y.save();
  Y.translate(-5, 0.5);
  knock(Y, figure);
  Y.restore();
  shifted(B, 0.86);
  shifted(I, 0.5);

  // Hair, then the pink headphones cleared through it so they print bright.
  const hair = cut([[232, 190], [232, 176], [242, 168], [256, 168], [268, 174], [273, 188], [262, 182], [246, 182]], rand, 0.5);
  tone(I, hair, 0.55);
  const band = cut([[230, 194], [234, 176], [252, 166], [270, 176], [274, 194]], rand, 0.3, false);
  const cups = union(block(225, 190, 9, 16, rand, 0.3), block(270, 190, 9, 16, rand, 0.3));
  knock(B, cups);
  knock(I, cups);
  line(P, band, 4, 0.95);
  tone(P, cups, 0.95);

  // A shirt fold and the chair back below his shoulders.
  line(I, cut([[244, 250], [240, 300], [244, 350]], rand, 0.5, false), 1.4, 0.5);
  const chairBack = block(214, 316, 76, 42, rand, 0.5);
  plane(I, chairBack, 0.85);
  plane(B, chairBack, 0.4);
  knock(Y, chairBack);
  const pole = block(247, 358, 10, 44, rand, 0.3);
  const feet = cut([[206, 412], [252, 400], [298, 412]], rand, 0.3, false);
  tone(I, pole, 0.85);
  line(I, feet, 5, 0.85);
  const wheels = union(ellipsePath(204, 414, 5, 5, rand, 0.2), ellipsePath(300, 414, 5, 5, rand, 0.2), ellipsePath(252, 404, 5, 5, rand, 0.2));
  tone(I, wheels, 0.95);

  /* The dog, asleep on its cushion ---------------------------------------------------- */

  const breath = 1 + Math.sin(t * 1.8) * 0.035;
  const cushion = ellipsePath(140, 430, 92, 22, rand, 0.8);
  const cushionTop = ellipsePath(140, 424, 84, 16, rand, 0.8);
  tone(I, ellipsePath(144, 444, 96, 12, rand, 1), 0.2);
  plane(B, cushion, 0.5);
  plane(B, cushionTop, 0.32);
  tone(P, cushion, 0.08);

  const body = cut(
    [
      [88, 420], [96, 400], [120, 390 - (breath - 1) * 60], [158, 388 - (breath - 1) * 80], [192, 396], [206, 412], [196, 426], [150, 430], [110, 430],
    ],
    rand,
    0.6,
  );
  const headDog = ellipsePath(84, 414, 16, 14, rand, 0.5);
  const snout = cut([[70, 414], [58, 418], [56, 424], [70, 426], [80, 424]], rand, 0.4);
  const dog = union(body, headDog, snout);
  knock(B, dog);
  plane(Y, dog, 0.88);
  plane(P, dog, 0.3);
  // Turn the belly and the far side into shadow with a ramp of pink and indigo.
  ramp(P, body, [0, 392], [0, 430], [
    [0, 0],
    [1, 0.28],
  ]);
  ramp(I, body, [0, 392], [0, 432], [
    [0.4, 0],
    [1, 0.22],
  ]);
  const wag = Math.max(0, Math.sin(t * 1.2)) ** 6 * 8;
  const tail = cut([[204, 410], [218, 398 - wag], [214, 386 - wag * 1.4]], rand, 0.3, false);
  line(Y, tail, 6, 0.88);
  line(P, tail, 6, 0.3);
  const ear = cut([[88, 402], [98, 404], [100, 418], [92, 424], [88, 412]], rand, 0.4);
  tone(P, ear, 0.5);
  tone(I, ear, 0.35);
  const nose = ellipsePath(56, 420, 3, 2.4, rand, 0.2);
  tone(I, nose, 0.95);
  line(I, cut([[76, 410], [80, 412], [84, 410]], rand, 0.2, false), 1.4, 0.9);
  const paws = union(ellipsePath(78, 430, 8, 4, rand, 0.3), ellipsePath(96, 431, 8, 4, rand, 0.3));
  tone(Y, paws, 0.5);

  /* Plant ------------------------------------------------------------------------- */

  const sway = Math.sin(t * 0.9) * 1.5;
  const leaf = (x: number, y: number, len: number, angle: number) => {
    const a = ((angle + sway) * Math.PI) / 180;
    const tip: Point = [x + Math.cos(a) * len, y + Math.sin(a) * len];
    const side = (s: number): Point => [x + Math.cos(a) * len * 0.5 + Math.cos(a + s) * len * 0.22, y + Math.sin(a) * len * 0.5 + Math.sin(a + s) * len * 0.22];
    return cut([[x, y], side(Math.PI / 2), tip, tip, side(-Math.PI / 2)], rand, 0.4);
  };
  const leaves = union(
    leaf(560, 360, 50, -120),
    leaf(560, 360, 58, -90),
    leaf(560, 360, 48, -60),
    leaf(560, 360, 40, -150),
    leaf(560, 360, 38, -30),
    leaf(560, 360, 34, -105),
  );
  knock(P, leaves);
  plane(B, leaves, 0.72);
  plane(Y, leaves, 0.9);
  const pot = cut([[532, 360], [532, 360], [588, 360], [588, 360], [580, 414], [580, 414], [540, 414], [540, 414]], rand, 0.4);
  knock(B, pot);
  plane(P, pot, 0.62);
  plane(Y, pot, 0.72);
  ramp(I, pot, [532, 0], [588, 0], [
    [0.4, 0],
    [1, 0.25],
  ]);
  tone(I, ellipsePath(560, 418, 34, 6, rand, 0.6), 0.2);
}
