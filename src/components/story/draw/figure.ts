import { lerp } from "../engine/math";

/**
 * Joint angles in radians, measured from straight down.
 * Positive angles swing toward the direction the figure faces.
 * Knee and elbow values bend the lower limb relative to the upper one.
 */
export type Pose = {
  lean: number;
  hipL: number;
  kneeL: number;
  hipR: number;
  kneeR: number;
  shL: number;
  elL: number;
  shR: number;
  elR: number;
  head: number;
};

export type Outfit = "shirt" | "kurta" | "saree" | "kid";

export type Build = {
  /** Standing height in px. */
  height: number;
  /** 0 is a small child, 1 is an adult. */
  age: number;
  hair: "short" | "tuft" | "turban" | "bun";
  outfit?: Outfit;
};

/** A light on one side of the figure: its copy is drawn offset, so an edge of light shows. */
export type Rim = { dx: number; dy: number; color: string };

export type Joints = {
  handL: [number, number];
  handR: [number, number];
  head: [number, number];
  hip: [number, number];
  lap: [number, number];
};

export const STAND: Pose = {
  lean: 0.02,
  hipL: 0.09,
  kneeL: 0.04,
  hipR: -0.07,
  kneeR: 0,
  shL: 0.08,
  elL: 0.12,
  shR: -0.06,
  elR: 0.1,
  head: 0,
};

/** Seated on the ground, knees up, hands forward over the lap. */
export const SIT: Pose = {
  lean: 0.12,
  hipL: 1.95,
  kneeL: 1.7,
  hipR: 1.85,
  kneeR: 1.6,
  shL: 0.85,
  elL: 0.55,
  shR: 0.95,
  elR: 0.5,
  head: 0.18,
};

/** Seated on a chair at a desk, leaning in, hands forward on the keys. */
export const CHAIR: Pose = {
  lean: 0.2,
  hipL: 1.4,
  kneeL: 1.35,
  hipR: 1.35,
  kneeR: 1.3,
  shL: 1.15,
  elL: 0.45,
  shR: 1.25,
  elR: 0.4,
  head: 0.05,
};

export function walkPose(phase: number, amount: number): Pose {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  return {
    lean: 0.06 * amount + 0.02,
    hipL: s * 0.42 * amount,
    kneeL: Math.max(0, -Math.sin(phase - 0.9)) * 0.75 * amount,
    hipR: -s * 0.42 * amount,
    kneeR: Math.max(0, Math.sin(phase - 0.9)) * 0.75 * amount,
    shL: -s * 0.36 * amount + 0.04,
    elL: 0.25 + 0.2 * amount * Math.max(0, -s),
    shR: s * 0.36 * amount + 0.04,
    elR: 0.25 + 0.2 * amount * Math.max(0, s),
    head: 0.03 * c * amount,
  };
}

export function blendPose(a: Pose, b: Pose, t: number): Pose {
  return {
    lean: lerp(a.lean, b.lean, t),
    hipL: lerp(a.hipL, b.hipL, t),
    kneeL: lerp(a.kneeL, b.kneeL, t),
    hipR: lerp(a.hipR, b.hipR, t),
    kneeR: lerp(a.kneeR, b.kneeR, t),
    shL: lerp(a.shL, b.shL, t),
    elL: lerp(a.elL, b.elL, t),
    shR: lerp(a.shR, b.shR, t),
    elR: lerp(a.elR, b.elR, t),
    head: lerp(a.head, b.head, t),
  };
}

type Pt = [number, number];

type Skeleton = {
  dir: number;
  h: number;
  age: number;
  hip: Pt;
  neck: Pt;
  shoulder: Pt;
  knees: [Pt, Pt];
  feet: [Pt, Pt];
  elbows: [Pt, Pt];
  hands: [Pt, Pt];
  head: Pt;
  headR: number;
  ground: number;
  seated: boolean;
};

const limb = (x: number, y: number, angle: number, length: number, dir: number): Pt => [
  x + Math.sin(angle) * length * dir,
  y + Math.cos(angle) * length,
];

function solve(x: number, ground: number, dir: 1 | -1, pose: Pose, build: Build): Skeleton {
  const h = build.height;
  const age = build.age;
  const headR = h * lerp(0.086, 0.062, age);
  const torso = h * lerp(0.3, 0.32, age);
  const thigh = h * lerp(0.21, 0.245, age);
  const shin = h * lerp(0.2, 0.235, age);
  const upperArm = h * lerp(0.15, 0.17, age);
  const foreArm = h * lerp(0.14, 0.16, age);

  const kneeL = limb(0, 0, pose.hipL, thigh, dir);
  const footL = limb(kneeL[0], kneeL[1], pose.hipL - pose.kneeL, shin, dir);
  const kneeR = limb(0, 0, pose.hipR, thigh, dir);
  const footR = limb(kneeR[0], kneeR[1], pose.hipR - pose.kneeR, shin, dir);
  const lowest = Math.max(footL[1], footR[1], kneeL[1], kneeR[1], h * 0.06);
  const hip: Pt = [x, ground - lowest - h * 0.025];
  const neck: Pt = [hip[0] + Math.sin(pose.lean) * torso * dir, hip[1] - Math.cos(pose.lean) * torso];
  const shoulder: Pt = [lerp(hip[0], neck[0], 0.9), lerp(hip[1], neck[1], 0.9)];
  const elbowL = limb(shoulder[0], shoulder[1], pose.shL, upperArm, dir);
  const handL = limb(elbowL[0], elbowL[1], pose.shL + pose.elL, foreArm, dir);
  const elbowR = limb(shoulder[0], shoulder[1], pose.shR, upperArm, dir);
  const handR = limb(elbowR[0], elbowR[1], pose.shR + pose.elR, foreArm, dir);
  const tilt = pose.lean + pose.head;
  const head: Pt = [neck[0] + Math.sin(tilt) * headR * 1.3 * dir, neck[1] - Math.cos(tilt) * headR * 1.3];
  const at = (p: Pt): Pt => [hip[0] + p[0], hip[1] + p[1]];
  return {
    dir,
    h,
    age,
    hip,
    neck,
    shoulder,
    knees: [at(kneeL), at(kneeR)],
    feet: [at(footL), at(footR)],
    elbows: [elbowL, elbowR],
    hands: [handL, handR],
    head,
    headR,
    ground,
    seated: Math.abs(pose.hipL) > 1,
  };
}

/** A limb segment that narrows from `wa` to `wb`, with rounded ends. */
function taper(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, wa: number, wb: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(a[0] + nx * wa, a[1] + ny * wa);
  ctx.lineTo(b[0] + nx * wb, b[1] + ny * wb);
  ctx.lineTo(b[0] - nx * wb, b[1] - ny * wb);
  ctx.lineTo(a[0] - nx * wa, a[1] - ny * wa);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(a[0], a[1], wa, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b[0], b[1], wb, 0, Math.PI * 2);
  ctx.fill();
}

/** A closed shape through the points, rounded by passing through each edge's midpoint. */
function smoothShape(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  const n = pts.length;
  const mid = (i: number): Pt => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
  const start = mid(n - 1);
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < n; i += 1) {
    const m = mid(i);
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
  }
  ctx.closePath();
  ctx.fill();
}

function paint(ctx: CanvasRenderingContext2D, s: Skeleton, build: Build, tilt: number) {
  const { h, dir, hip, neck, shoulder } = s;
  const outfit = build.outfit ?? (s.age < 0.5 ? "kid" : "shirt");
  const kid = outfit === "kid";
  // Children are softer and rounder: every width is fuller relative to their height.
  const k = kid ? 1.45 : 1;

  const leg = (i: 0 | 1) => {
    const slim = outfit === "kurta" ? 0.88 : 1;
    const knee = s.knees[i];
    const foot = s.feet[i];
    taper(ctx, hip, knee, h * 0.05 * k * slim, h * 0.033 * k * slim);
    taper(ctx, knee, foot, h * 0.032 * k, h * 0.019 * k);
    // The calf, a little below the knee on the back of the leg.
    const cx = lerp(knee[0], foot[0], 0.32) - h * 0.008 * dir;
    const cy = lerp(knee[1], foot[1], 0.32);
    const angle = Math.atan2(foot[1] - knee[1], foot[0] - knee[0]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, h * 0.055, h * 0.03 * k, angle, 0, Math.PI * 2);
    ctx.fill();
    // A shoe: flat underneath, rounded at the toe.
    const [fx, fy] = foot;
    const len = h * 0.085 * (kid ? 0.9 : 1);
    ctx.beginPath();
    ctx.moveTo(fx - len * 0.28 * dir, fy - h * 0.012);
    ctx.lineTo(fx + len * 0.55 * dir, fy - h * 0.004);
    ctx.quadraticCurveTo(fx + len * 0.78 * dir, fy + h * 0.004, fx + len * 0.6 * dir, fy + h * 0.02);
    ctx.lineTo(fx - len * 0.3 * dir, fy + h * 0.02);
    ctx.closePath();
    ctx.fill();
  };

  const arm = (i: 0 | 1) => {
    const elbow = s.elbows[i];
    const hand = s.hands[i];
    taper(ctx, shoulder, elbow, h * 0.034 * k, h * 0.024 * k);
    // Biceps and forearm, so the arm has shape rather than a single thickness.
    const angleU = Math.atan2(elbow[1] - shoulder[1], elbow[0] - shoulder[0]);
    ctx.beginPath();
    ctx.ellipse(lerp(shoulder[0], elbow[0], 0.45), lerp(shoulder[1], elbow[1], 0.45), h * 0.06, h * 0.03 * k, angleU, 0, Math.PI * 2);
    ctx.fill();
    taper(ctx, elbow, hand, h * 0.025 * k, h * 0.016 * k);
    const angleF = Math.atan2(hand[1] - elbow[1], hand[0] - elbow[0]);
    ctx.beginPath();
    ctx.ellipse(lerp(elbow[0], hand[0], 0.3), lerp(elbow[1], hand[1], 0.3), h * 0.05, h * 0.024 * k, angleF, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hand[0] + Math.cos(angleF) * h * 0.012, hand[1] + Math.sin(angleF) * h * 0.012, h * 0.026, h * 0.018, angleF, 0, Math.PI * 2);
    ctx.fill();
  };

  arm(0);
  leg(0);
  leg(1);

  // Torso along the spine: broad chest and shoulders, narrow waist, a curve at the lower back.
  const tx = neck[0] - hip[0];
  const ty = neck[1] - hip[1];
  const len = Math.hypot(tx, ty) || 1;
  const ux = tx / len;
  const uy = ty / len;
  const fx = -uy * dir;
  const fy = ux * dir;
  const along = (t: number, side: number): Pt => [hip[0] + tx * t + fx * side * h, hip[1] + ty * t + fy * side * h];
  const torso: Pt[] = kid
    ? [along(0, -0.085), along(0.4, -0.08), along(0.8, -0.085), along(1.02, -0.05), along(1.02, 0.042), along(0.75, 0.095), along(0.4, 0.1), along(0, 0.09)]
    : [
        along(0, -0.058),
        along(0.3, -0.048),
        along(0.62, -0.066),
        along(0.88, -0.072),
        along(1.02, -0.04),
        along(1.02, 0.028),
        along(0.86, 0.084),
        along(0.64, 0.082),
        along(0.4, 0.05),
        along(0, 0.058),
      ];
  smoothShape(ctx, torso);
  // Shoulder cap.
  ctx.beginPath();
  ctx.arc(shoulder[0] - fx * h * 0.01, shoulder[1] - fy * h * 0.01, h * (kid ? 0.055 : 0.046), 0, Math.PI * 2);
  ctx.fill();

  if (outfit === "kurta" && !s.seated) {
    const kneeMid: Pt = [(s.knees[0][0] + s.knees[1][0]) / 2, (s.knees[0][1] + s.knees[1][1]) / 2];
    ctx.beginPath();
    ctx.moveTo(...along(0.12, -0.06));
    ctx.lineTo(kneeMid[0] - h * 0.085 * dir, kneeMid[1] + h * 0.01);
    ctx.lineTo(kneeMid[0] + h * 0.085 * dir, kneeMid[1] + h * 0.01);
    ctx.lineTo(...along(0.12, 0.064));
    ctx.closePath();
    ctx.fill();
  }

  if (outfit === "saree" && !s.seated) {
    ctx.beginPath();
    ctx.moveTo(...along(0.3, -0.055));
    ctx.lineTo(hip[0] - h * 0.1 * dir, s.ground - h * 0.02);
    ctx.lineTo(hip[0] + h * 0.12 * dir, s.ground - h * 0.02);
    ctx.lineTo(...along(0.3, 0.065));
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(...along(0.98, -0.02));
    ctx.quadraticCurveTo(hip[0] - h * 0.13 * dir, hip[1] - h * 0.1, hip[0] - h * 0.11 * dir, hip[1] + h * 0.14);
    ctx.lineTo(hip[0] - h * 0.05 * dir, hip[1] + h * 0.1);
    ctx.lineTo(...along(0.6, -0.05));
    ctx.closePath();
    ctx.fill();
  }

  taper(ctx, neck, s.head, h * (kid ? 0.042 : 0.028), h * (kid ? 0.04 : 0.024));
  head(ctx, s.head[0], s.head[1], s.headR, dir, tilt, build.hair, kid);

  arm(1);
}

/** The head is drawn upright and then turned by the tilt, so the face really looks up or down. */
function head(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, dir: number, tilt: number, style: Build["hair"], kid: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * dir);
  ctx.scale(dir, 1);

  // Skull and jaw.
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.9, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, r * 0.4);
  ctx.quadraticCurveTo(r * 0.1, r * (kid ? 1.02 : 1.12), r * 0.62, r * 0.82);
  ctx.lineTo(r * 0.78, r * 0.3);
  ctx.closePath();
  ctx.fill();
  // Brow, nose and lips, kept small so the profile reads without turning into a caricature.
  ctx.beginPath();
  ctx.moveTo(r * 0.78, -r * 0.2);
  ctx.quadraticCurveTo(r * 0.94, -r * 0.14, r * 0.86, r * 0.02);
  ctx.lineTo(r * (kid ? 0.98 : 1.04), r * 0.3);
  ctx.quadraticCurveTo(r * 0.96, r * 0.38, r * 0.82, r * 0.4);
  ctx.lineTo(r * 0.86, r * 0.52);
  ctx.quadraticCurveTo(r * 0.84, r * 0.66, r * 0.7, r * 0.66);
  ctx.lineTo(r * 0.5, r * 0.2);
  ctx.closePath();
  ctx.fill();
  // Ear.
  ctx.beginPath();
  ctx.ellipse(-r * 0.12, r * 0.08, r * 0.2, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  switch (style) {
    case "tuft":
      ctx.moveTo(-r * 0.95, r * 0.25);
      ctx.quadraticCurveTo(-r * 1.1, -r * 0.95, -r * 0.1, -r * 1.12);
      ctx.quadraticCurveTo(r * 0.7, -r * 1.4, r * 0.98, -r * 0.9);
      ctx.quadraticCurveTo(r * 0.62, -r * 0.78, r * 0.58, -r * 0.55);
      ctx.quadraticCurveTo(-r * 0.2, -r * 0.6, -r * 0.5, r * 0.1);
      ctx.closePath();
      break;
    case "turban":
      ctx.ellipse(-r * 0.05, -r * 0.6, r * 1.18, r * 0.76, -0.12, 0, Math.PI * 2);
      ctx.moveTo(-r * 0.9, -r * 0.2);
      ctx.ellipse(-r * 1.05, r * 0.3, r * 0.28, r * 0.75, 0.35, 0, Math.PI * 2);
      break;
    case "bun":
      ctx.ellipse(-r * 0.12, -r * 0.42, r * 1.0, r * 0.7, 0, 0, Math.PI * 2);
      ctx.moveTo(-r * 0.75, -r * 0.15);
      ctx.arc(-r * 1.05, -r * 0.15, r * 0.42, 0, Math.PI * 2);
      break;
    case "short":
      ctx.ellipse(-r * 0.16, -r * 0.4, r * 1.0, r * 0.72, -0.1, 0, Math.PI * 2);
      if (kid) {
        ctx.moveTo(r * 0.75, -r * 0.55);
        ctx.ellipse(r * 0.5, -r * 0.62, r * 0.4, r * 0.24, 0.3, 0, Math.PI * 2);
      }
      break;
  }
  ctx.fill();
  ctx.restore();
}

/** How far above the ground the hips sit in a pose, so furniture can be built to meet them. */
export function hipHeight(pose: Pose, build: Build) {
  const s = solve(0, 0, 1, pose, build);
  return -s.hip[1];
}

/**
 * Draws a silhouette standing on (x, ground) and returns key joint positions.
 * The figure faces right when dir is 1 and left when dir is -1.
 */
export function drawFigure(
  ctx: CanvasRenderingContext2D,
  x: number,
  ground: number,
  dir: 1 | -1,
  pose: Pose,
  build: Build,
  color: string,
  rim?: Rim,
): Joints {
  const s = solve(x, ground, dir, pose, build);
  const tilt = pose.lean + pose.head;
  if (rim) {
    ctx.save();
    ctx.translate(rim.dx, rim.dy);
    ctx.filter = "blur(1px)";
    ctx.fillStyle = rim.color;
    paint(ctx, s, build, tilt);
    ctx.restore();
  }
  ctx.fillStyle = color;
  paint(ctx, s, build, tilt);
  const [kl, kr] = s.knees;
  return {
    handL: s.hands[0],
    handR: s.hands[1],
    head: s.head,
    hip: s.hip,
    lap: [(kl[0] + kr[0]) / 2, Math.min(kl[1], kr[1]) - s.h * 0.04],
  };
}
