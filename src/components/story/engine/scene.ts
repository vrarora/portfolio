import { AFTER_BEATS, BEATS, PLACES, afterProgress, blendSky, firstProgress, skyAfter, skyAt, type Sky } from "./timeline";
import { constellationBox, EDGES, STARS, starAt } from "./constellation";
import { bump, clamp01, easeInOut, easeOut, hex, lerp, mix, range, rgba, smooth, type RGB } from "./math";
import { createClouds, createSkyField, drawBirds, drawBloom, drawClouds, drawConstellation, drawSky, type SkyField } from "../draw/sky";
import { createAtmosphere, drawCuriosity, drawGlow, drawGrain, drawPaper, drawRain, drawVignette, type Atmosphere } from "../draw/atmosphere";
import { createStreet, drawBulbs, drawDog, drawForeground, drawStreetLayer, drawWalkers, type Street, type StreetPaint } from "../draw/street";
import { createBlades, drawFarHill, drawHill, drawLampPost, drawPole, drawSignpost, drawTree, hillSurface, type Blade, type Hill } from "../draw/hill";
import { drawRoomBack, drawRoomLight, layoutRoom } from "../draw/room";
import { drawPuddle } from "../draw/puddle";
import { createGrass, createRidge, createTrees, drawBench, drawCart, drawGate, drawGrass, drawRidge, drawTrees, type Blade as GrassBlade, type Ridge, type Tree } from "../draw/land";
import { blendPose, CHAIR, drawFigure, hipHeight, SIT, STAND, walkPose, type Build, type Pose, type Rim } from "../draw/figure";

const INK = hex("#0b0911");
const WARM = "rgba(255,198,122,A)";
const LAMP = "rgba(255,196,128,A)";
const PAGE = "rgba(255,236,190,A)";
const SCREEN = "rgba(170,205,255,A)";
const GREEN = hex("#2f5c46");
const MIST = hex("#7e9aac");

/** Where the first act leaves him: at the puddle, face lifted to the dawn. */
const LOOKING_UP: Pose = { ...STAND, head: -0.7, lean: -0.09, shL: -0.12, shR: -0.22 };

/** Hunched on a bench, head bowed over a phone held in both hands. */
const BENCH: Pose = { lean: 0.3, hipL: 1.45, kneeL: 1.45, hipR: 1.4, kneeR: 1.35, shL: 0.55, elL: 1.1, shR: 0.65, elR: 1.0, head: 0.5 };

/** Pushing a cart: both arms forward to the handles. */
const PUSH: Pose = { ...STAND, lean: 0.08, shL: 1.05, elL: 0.35, shR: 0.95, elR: 0.35 };

/** The golden street he grew up on, as it looks in the puddle. */
const CHILDHOOD_SKY: Sky = skyAt(0.08);

const between = (p: number, [a, b]: readonly [number, number]) => range(p, a, b);
const window4 = (p: number, [a, b, c, d]: readonly [number, number, number, number]) => bump(p, a, b, c, d);

const adult = (u: number): Build => ({ height: u * 20, age: 1, hair: "tuft" });
const boy = (u: number): Build => ({ height: u * 13, age: 0.12, hair: "short" });

/** The boy grows into a young man as he leaves the street. */
const growing = (p: number, u: number): Build => {
  const age = smooth(between(p, BEATS.growUp));
  return { height: lerp(13, 20, age) * u, age: lerp(0.12, 1, age), hair: age < 0.5 ? "short" : "tuft" };
};

export class StoryScene {
  private w = 0;
  private h = 0;
  private u = 0;
  private street: Street | null = null;
  private blades: Blade[] = [];
  private readonly sky: SkyField = createSkyField();
  private readonly atmos: Atmosphere = createAtmosphere();
  private readonly clouds = createClouds();
  private farHills: Ridge | null = null;
  private treeline: Ridge | null = null;
  private mountains: Ridge | null = null;
  private hillsFar: Ridge | null = null;
  private hillsNear: Ridge | null = null;
  private trees: Tree[] = [];
  private meadow: GrassBlade[] = [];
  private tufts: GrassBlade[] = [];
  private grassSpan = 0;
  private lastWalk = 0;
  private stride = 0;
  private walk = 0;
  private frame = 0;

  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  resize(w: number, h: number) {
    // A hidden or collapsed viewport reports zero; building geometry at zero scale never terminates.
    if (w < 1 || h < 1) return;
    this.w = w;
    this.h = h;
    this.u = Math.min(h / 100, w / 60);
    this.street = createStreet(w, this.u, this.panLength);
    this.blades = createBlades(this.u);
    this.buildCountry();
  }

  private buildCountry() {
    const { w, u } = this;
    this.farHills = createRidge(71, { base: u * 2, amp: u * 14, length: u * 110, parallax: 0.1 });
    this.treeline = createRidge(73, { base: -u, amp: u * 5, length: u * 24, parallax: 0.35, shape: "puff", detail: 2 });
    this.mountains = createRidge(79, { base: u * 4, amp: u * 20, length: u * 120, parallax: 0.06, shape: "peak" });
    this.hillsFar = createRidge(83, { base: u, amp: u * 10, length: u * 70, parallax: 0.22 });
    this.hillsNear = createRidge(89, { base: -u, amp: u * 4.5, length: u * 50, parallax: 0.5 });
    this.grassSpan = w + u * 80;
    this.meadow = createGrass(61, u, this.grassSpan, Math.round(this.grassSpan / (u * 0.45)));
    this.tufts = createGrass(67, u * 2.2, this.grassSpan, Math.round(this.grassSpan / (u * 5)));
    const places = [PLACES.bench, PLACES.family, PLACES.gate, PLACES.cart].map((m) => this.worldX(m));
    this.trees = createTrees(u, this.afterWalk(1) + w * 2, this.worldX(PLACES.strangers + 0.04), places);
  }

  private get panLength() {
    return this.u * 200;
  }

  /** Distance walked down the safe road, after he stops at the fork and before he stops to write. */
  private roadWalk(p: number) {
    return this.u * 70 * between(p, BEATS.roadWalk);
  }

  /** Distance walked through the second act, from his street to the plains. */
  private afterWalk(q: number) {
    const t = between(q, AFTER_BEATS.walk);
    return this.u * 600 * lerp(t, smooth(t), 0.35);
  }

  /** World x of a place that stands at `screen` (a fraction of the width) midway through its stanza. */
  private worldX(q: number, screen = 0.64) {
    return this.afterWalk(q) + this.w * screen;
  }

  /** p is story progress 0..1, time is seconds since start, dt is the frame delta. */
  render(p: number, time: number, dt: number, still: boolean) {
    const { ctx, w, h, u, street } = this;
    if (!street || w === 0) return;
    this.frame += 1;

    const first = firstProgress(p);
    const after = afterProgress(p);
    const sky = after > 0 ? skyAfter(after) : skyAt(first);
    const ink = mix(INK, sky.horizon, 0.1);

    // Scrolling is walking: his legs move only while the world moves past him.
    const camera = easeInOut(between(first, BEATS.streetPan)) * this.panLength;
    const walked = camera + this.roadWalk(first) + this.afterWalk(after);
    const moved = Math.abs(walked - this.lastWalk);
    this.lastWalk = walked;
    this.stride += moved;
    const targetWalk = clamp01(moved / Math.max(dt, 1 / 120) / (u * 14));
    this.walk += (targetWalk - this.walk) * (1 - Math.exp(-dt * 8));

    if (after > 0) this.after(after, sky, ink, time);
    else this.first(first, sky, ink, camera, time);

    drawPaper(ctx, w, h, this.atmos);
    drawVignette(ctx, w, h, 0.42);
    drawGrain(ctx, w, h, this.atmos, this.frame, still);
  }

  private nightGround(p: number) {
    return lerp(this.h * 0.66, this.h * 0.72, smooth(between(p, BEATS.dawn)));
  }

  /** The first act: the street, the fork, the night, his room, the puddle and the dawn. */
  private first(p: number, sky: Sky, ink: RGB, camera: number, time: number) {
    const { ctx, w, h } = this;
    const golden = h * 0.8;
    const outside = between(p, BEATS.outside);
    const nightGround = this.nightGround(p);

    drawSky(ctx, w, h, sky, this.sky, time, outside > 0 ? nightGround : golden);
    const heavy = window4(p, BEATS.rain);
    const cloudCover = Math.max(0.5 - 0.25 * bump(p, 0.55, 0.6, 0.85, 0.9), heavy);
    drawClouds(ctx, w, h, this.clouds, sky, time, cloudCover, heavy);

    if (p < 0.31) this.goldenStreet(p, sky, ink, camera, time);
    if (p > 0.25 && p < 0.57) this.road(p, sky, ink, time);
    if (p < 0.31) this.boyOnStreet(p, ink);

    drawCuriosity(ctx, w, h, this.atmos, time, window4(p, BEATS.curiosity), golden);
    drawRain(ctx, w, h, this.atmos, time, window4(p, BEATS.rain));

    const room = window4(p, BEATS.room);
    if (room > 0.001) this.room(p, room, sky, time);

    if (outside > 0.001) this.homeStreet(p, outside, sky, nightGround, time);

    drawBirds(ctx, w, h, time, Math.max(0.5 * (1 - range(p, 0.18, 0.26)), range(p, 0.92, 1)), rgba(ink));
    if (room < 0.99) drawBloom(ctx, w, h, sky, 0.9 * (1 - room));
  }

  /* ---------- 1. The busy street at golden hour ---------- */

  private paint(sky: Sky, ink: RGB, windows: number): StreetPaint {
    return {
      far: rgba(mix(ink, sky.horizon, 0.45)),
      mid: rgba(mix(ink, sky.lower, 0.2)),
      near: rgba(ink),
      buildings: rgba(mix(ink, sky.lower, 0.15)),
      crowd: rgba(mix(ink, sky.lower, 0.07)),
      shutter: rgba(mix(ink, sky.lower, 0.2)),
      warm: WARM.replace("A", String(windows)),
      dim: WARM.replace("A", String(windows * 0.35)),
      bulb: "rgba(255,212,150,ALPHA)",
    };
  }

  private streetLayers(street: Street, g: number, camera: number, sky: Sky, paint: StreetPaint, open = 1) {
    const { ctx, h } = this;
    drawStreetLayer(ctx, street.far, camera, g, paint.far, paint);
    this.haze(g, sky.horizon, 0.3 * sky.haze, h * 0.3);
    drawStreetLayer(ctx, street.mid, camera, g, paint.mid, paint);
    this.haze(g, sky.horizon, 0.18 * sky.haze, h * 0.18);
    drawStreetLayer(ctx, street.near, camera, g, paint.buildings, paint, open);
  }

  /** The road catches light from the sky and shops, so figures stay darker than it. */
  private roadSurface(g: number, sky: Sky, ink: RGB, warmth: number) {
    const { ctx, w, h } = this;
    const road = ctx.createLinearGradient(0, g, 0, h);
    road.addColorStop(0, rgba(mix(ink, sky.lower, 0.26 * warmth)));
    road.addColorStop(0.35, rgba(mix(ink, sky.lower, 0.12 * warmth)));
    road.addColorStop(1, rgba(ink));
    ctx.fillStyle = road;
    ctx.fillRect(0, g - 1, w, h - g + 1);
  }

  private goldenStreet(p: number, sky: Sky, ink: RGB, camera: number, time: number) {
    const { ctx, w, h, u, street } = this;
    if (!street) return;
    const fade = between(p, BEATS.streetFade);
    if (fade > 0.99) return;
    const g = h * 0.8 + easeInOut(fade) * h * 0.06;
    const paint = this.paint(sky, ink, 0.55 + 0.4 * range(p, 0.08, 0.26));
    ctx.save();
    ctx.globalAlpha = 1 - fade;
    this.streetLayers(street, g, camera, sky, paint);
    drawBulbs(ctx, street, camera, g, u, paint, time, w);
    this.roadSurface(g, sky, ink, 1);
    drawWalkers(ctx, street, camera, g, u, time, paint.crowd, w);
    drawForeground(ctx, street, camera, h * 0.97, rgba(INK));
    ctx.restore();
  }

  /** On the street he walks the front edge, nearer to us than the crowd, then steps up onto the hill. */
  private boyOnStreet(p: number, ink: RGB) {
    const { ctx, w, h, u } = this;
    if (p > 0.31) return;
    const x = lerp(w * 0.36, w * 0.42, smooth(range(p, 0.26, 0.32)));
    const ground = Math.min(h * 0.8 + u * 5, hillSurface(this.hillAt(p), x));
    drawFigure(ctx, x, ground, 1, this.walking(), growing(p, u), rgba(ink), this.rim(x, skyAt(p)));
  }

  /** A thin edge of sunlight on the side of him that faces the sun. */
  private rim(x: number, sky: Sky): Rim | undefined {
    if (sky.glow < 0.15) return undefined;
    const side = Math.sign(sky.sunX * this.w - x) || 1;
    return { dx: side * Math.max(0.8, this.u * 0.11), dy: -this.u * 0.04, color: rgba(mix(sky.sun, sky.horizon, 0.4), 0.42 * sky.glow) };
  }

  private walking(): Pose {
    const phase = this.stride / (this.u * 6);
    return blendPose(STAND, walkPose(phase, this.walk), this.walk);
  }

  /* ---------- 2 and 3. The safe road, then the heavy night ---------- */

  private hillAt(p: number): Hill {
    const { w, h } = this;
    const top = lerp(h * 1.3, h * 0.74, easeOut(between(p, BEATS.hillRise)));
    const r = Math.max(w * 1.3, h * 1.5);
    return { cx: w / 2, cy: top + r, r };
  }

  private road(p: number, sky: Sky, ink: RGB, time: number) {
    const { ctx, w, h, u } = this;
    const inkCss = rgba(ink);
    const hill = this.hillAt(p);
    if (hill.cy - hill.r > h) return;
    const walked = this.roadWalk(p);
    const boyX = lerp(w * 0.36, w * 0.42, smooth(range(p, 0.26, 0.32)));
    const fork = window4(p, BEATS.fork);

    // The road not taken: a path up a far hill, toward the light.
    if (fork > 0.01) {
      const farX = boyX - u * 16 - walked * 0.45;
      ctx.save();
      ctx.globalAlpha *= fork;
      drawFarHill(ctx, farX, hillSurface(hill, farX) + u * 2, u, rgba(mix(ink, sky.horizon, 0.32)), rgba(mix(ink, sky.horizon, 0.62)), sky.sun, 1, time);
      ctx.restore();
    }

    drawHill(ctx, hill, inkCss, sky.sun, 0, this.blades, w);

    // The paved road runs on along the hill, with the same pole at the same spacing.
    const poles = window4(p, BEATS.poles);
    if (poles > 0.01) {
      const spacing = u * 34;
      const offset = -(walked % spacing);
      ctx.save();
      ctx.globalAlpha *= poles;
      ctx.strokeStyle = inkCss;
      ctx.lineWidth = 1;
      let previous: [number, number] | null = null;
      for (let x = offset - spacing; x < w + spacing; x += spacing) {
        const [left, right] = drawPole(ctx, x, hillSurface(hill, x), u, inkCss);
        if (previous) {
          ctx.beginPath();
          ctx.moveTo(previous[0], previous[1]);
          ctx.quadraticCurveTo((previous[0] + left[0]) / 2, Math.max(previous[1], left[1]) + u * 3, left[0], left[1]);
          ctx.stroke();
        }
        previous = right;
      }
      ctx.restore();
    }

    if (fork > 0.01) {
      ctx.save();
      ctx.globalAlpha *= fork;
      const signX = boyX + u * 6 - walked;
      drawSignpost(ctx, signX, hillSurface(hill, signX), u, inkCss);
      // Everyone else, already walking the paved road ahead of him.
      const ahead = between(p, BEATS.crowd) * u * 80;
      const outfits = ["kurta", "shirt", "saree", "shirt", "kurta"] as const;
      outfits.forEach((outfit, i) => {
        const cx = boyX + u * (20 + i * 9) + ahead - walked;
        const build: Build = { height: u * (18 + (i % 3)), age: 1, hair: outfit === "saree" ? "bun" : "short", outfit };
        drawFigure(ctx, cx, hillSurface(hill, cx), 1, walkPose(time * 3.2 + i * 1.7, 0.9), build, inkCss, this.rim(cx, sky));
      });
      ctx.restore();
    }

    const treeX = boyX + u * 110 - walked;
    drawTree(ctx, treeX, hillSurface(hill, treeX), u, inkCss, time);

    // The lamp he stops under to write.
    const lampX = boyX + u * 80 - walked;
    const light = drawLampPost(ctx, lampX, hillSurface(hill, lampX), u, inkCss);
    drawGlow(ctx, light[0], light[1], u * 18, LAMP, sky.stars * 0.9);

    if (p <= 0.31) return;
    const writing = window4(p, BEATS.writing);
    const wonder = bump(p, 0.3, 0.31, 0.33, 0.345);
    const walking = this.walking();
    const pose = blendPose({ ...walking, head: walking.head - 0.25 * wonder }, { ...SIT, head: 0.4 }, smooth(writing));
    const joints = drawFigure(ctx, boyX, hillSurface(hill, boyX), 1, pose, growing(p, u), inkCss, this.rim(boyX, sky));
    if (writing > 0.01) this.journal(joints.lap, joints.handR, writing);
  }

  /** An open journal resting on his knees, a pen in his hand, the pages lit by the lamp. */
  private journal([lx, ly]: [number, number], hand: [number, number], amount: number) {
    const { ctx, u } = this;
    const cx = lx + u * 1.4;
    const cy = ly - u * 0.6;
    drawGlow(ctx, cx, cy - u, u * 8, PAGE, amount * 0.7);
    ctx.save();
    ctx.globalAlpha *= amount;
    ctx.translate(cx, cy);
    ctx.rotate(-0.28);
    const pw = u * 2.3;
    const ph = u * 1.5;
    // Two pages meeting at the spine in a shallow V.
    ctx.fillStyle = "rgba(92,70,52,0.95)";
    ctx.beginPath();
    ctx.moveTo(-pw - u * 0.2, -ph * 0.5);
    ctx.lineTo(0, 0);
    ctx.lineTo(pw + u * 0.2, -ph * 0.5);
    ctx.lineTo(pw + u * 0.2, -ph * 0.5 + u * 0.35);
    ctx.lineTo(0, u * 0.35);
    ctx.lineTo(-pw - u * 0.2, -ph * 0.5 + u * 0.35);
    ctx.closePath();
    ctx.fill();
    for (const side of [-1, 1]) {
      ctx.fillStyle = "rgba(246,239,222,0.96)";
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.05);
      ctx.lineTo(side * pw, -ph * 0.5 - u * 0.05);
      ctx.lineTo(side * pw, -ph * 0.5 - ph);
      ctx.quadraticCurveTo(side * pw * 0.5, -ph * 1.25, 0, -ph);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(120,140,180,0.55)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let i = 1; i <= 4; i += 1) {
        const t = i / 5;
        ctx.moveTo(side * pw * 0.12, -ph * 0.2 - ph * 0.85 * t);
        ctx.lineTo(side * pw * 0.9, -ph * 0.65 - ph * 0.85 * t);
      }
      ctx.stroke();
    }
    ctx.restore();
    // The pen, held in his hand and touching the right-hand page.
    ctx.strokeStyle = "rgba(20,16,24,1)";
    ctx.lineWidth = Math.max(1, u * 0.22);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hand[0], hand[1]);
    ctx.lineTo(cx + u * 1.1, cy - u * 1.9);
    ctx.stroke();
  }

  /* ---------- 4. His room, the seminar ---------- */

  private room(p: number, alpha: number, sky: Sky, time: number) {
    const { ctx, w, h, u } = this;
    const layout = layoutRoom(w, h, u);
    ctx.save();
    ctx.globalAlpha = alpha;
    // The rain on the window eases as his heart lifts.
    const rainOnGlass = 1 - range(p, 0.72, 0.79);
    const seat = layout.floor - hipHeight(CHAIR, adult(u)) + u * 0.5;
    const ink = drawRoomBack(ctx, w, h, u, layout, sky, time, rainOnGlass, 0.7, seat);
    // He can't sit still: he rises from the chair.
    const rise = smooth(between(p, BEATS.standUp));
    const head = lerp(lerp(0.05, -0.05, range(p, 0.6, 0.64)), -0.15, rise);
    drawFigure(ctx, layout.hipX - u * 1.5 * rise, layout.floor, 1, { ...blendPose(CHAIR, STAND, rise), head }, adult(u), ink);
    drawRoomLight(ctx, u, layout, ink, range(p, 0.555, 0.58), between(p, BEATS.racing), time);
    drawCuriosity(ctx, w, h, this.atmos, time, window4(p, BEATS.wonder) * 0.8, layout.deskTop, [layout.hipX + u * 4, layout.hipX + u * 32]);
    ctx.restore();
  }

  /* ---------- 5 and 6. Back on his street at night, the puddle, then dawn ---------- */

  /** His door, the puddle, and where he stands at its edge, for a street whose ground is at g. */
  private homeMarks(g: number) {
    const { w, u } = this;
    const puddle = { x: w * 0.52, y: g + u * 16, rx: Math.min(u * 28, w * 0.44), ry: u * 5.6 };
    return { doorX: w * 0.3, puddle, standX: puddle.x - puddle.rx * 0.18, standGround: puddle.y - puddle.ry - u * 1.2 };
  }

  /**
   * With `figures` off the second act draws him and the dog itself, and the
   * street only keeps his reflection, fading by `mirror`.
   */
  private homeStreet(p: number, alpha: number, sky: Sky, g: number, time: number, figures = true, mirror = 1) {
    const { ctx, w, h, u, street } = this;
    if (!street) return;
    const ink = mix(INK, sky.horizon, 0.1);
    const inkCss = rgba(ink);
    const dawn = between(p, BEATS.dawn);
    const paint = this.paint(sky, ink, lerp(0.4, 0.12, dawn));

    ctx.save();
    ctx.globalAlpha = alpha;
    this.streetLayers(street, g, 0, sky, paint, 0);
    drawBulbs(ctx, street, 0, g, u, paint, time, w, 0);

    // The road is wet: darker, with the lamp's light running down it.
    this.roadSurface(g, sky, ink, 0.6);
    const light = drawLampPost(ctx, w * 0.18, g + u * 3, u, inkCss);
    const lampOn = 1 - dawn;
    drawGlow(ctx, light[0], light[1], u * 20, LAMP, lampOn);
    const streak = ctx.createLinearGradient(0, g + u * 3, 0, h);
    streak.addColorStop(0, `rgba(255,196,128,${0.22 * lampOn})`);
    streak.addColorStop(1, "rgba(255,196,128,0)");
    ctx.fillStyle = streak;
    ctx.fillRect(light[0] - u * 1.2, g + u * 3, u * 2.4, h - g);

    // His front door, left open, its light spilling onto the wet road.
    const { doorX, puddle, standX, standGround } = this.homeMarks(g);
    const doorW = u * 6;
    const doorH = u * 11;
    ctx.fillStyle = WARM.replace("A", String(0.85 * (1 - dawn * 0.6)));
    ctx.fillRect(doorX - doorW / 2, g - doorH, doorW, doorH);
    ctx.fillStyle = inkCss;
    ctx.fillRect(doorX - doorW / 2 - u * 0.6, g - doorH - u * 0.6, doorW + u * 1.2, u * 0.6);
    ctx.beginPath();
    ctx.moveTo(doorX + doorW / 2, g - doorH);
    ctx.lineTo(doorX + doorW / 2 + u * 2.4, g - doorH + u * 0.6);
    ctx.lineTo(doorX + doorW / 2 + u * 2.4, g + u * 0.4);
    ctx.lineTo(doorX + doorW / 2, g);
    ctx.closePath();
    ctx.fill();
    drawGlow(ctx, doorX, g, u * 16, WARM, 0.6 * (1 - dawn));

    // He walks out of the door, across the road, to the edge of the puddle.
    const out = smooth(range(p, BEATS.walkOut[0], BEATS.walkOut[3]));
    const manX = lerp(doorX, standX, out);
    const manGround = lerp(g + u * 0.5, standGround, out);
    const stride = window4(p, BEATS.walkOut);
    // He bows his head to the water, then lifts his face to the sky, shoulders opening back.
    const lookUp = smooth(between(p, BEATS.lookUp));
    const lookDown = smooth(range(p, 0.822, 0.838));
    const still: Pose = {
      ...STAND,
      head: lerp(lerp(0, 0.75, lookDown), -0.7, lookUp),
      lean: lerp(lerp(0.02, 0.1, lookDown), -0.09, lookUp),
      shL: lerp(0.08, -0.12, lookUp),
      shR: lerp(-0.06, -0.22, lookUp),
    };
    const pose = blendPose(still, walkPose(range(p, 0.8, 0.83) * 60, 1), stride);

    // In the water the man becomes the boy, under the sky of the street he grew up on.
    const becomes = smooth(between(p, BEATS.reflection));
    const atEdge = range(p, 0.822, 0.832) * mirror;
    const mirrorSky = blendSky(sky, CHILDHOOD_SKY, becomes * (1 - dawn * 0.5));
    const mirrorY = puddle.y - puddle.ry * 0.9;
    drawPuddle(ctx, puddle, mirrorSky, mirrorY, time, ink, atEdge, () => {
      const from = adult(u);
      const to = boy(u);
      const build: Build = {
        height: lerp(from.height, to.height, becomes) * 0.5,
        age: lerp(from.age, to.age, becomes),
        hair: becomes < 0.5 ? from.hair : to.hair,
      };
      drawFigure(ctx, manX, mirrorY, 1, still, { ...build, height: build.height * 1.5 }, inkCss);
    });

    if (figures) {
      // The street dog, asleep by his door until the light wakes it.
      drawDog(ctx, doorX - u * 7, g + u * 1.5, u, 1, inkCss, "sleep", time, smooth(range(p, 0.93, 0.97)));
      drawFigure(ctx, manX, manGround, 1, pose, adult(u), inkCss, this.rim(manX, sky));
    }
    ctx.restore();
  }

  /* ---------- 7 to 10. The life after: the people, the small joys, the plains, the boy ---------- */

  private after(q: number, sky: Sky, ink: RGB, time: number) {
    const { ctx, w, h, u } = this;
    const inkCss = rgba(ink);
    const street = h * 0.72;
    const ground = h * 0.8;
    const leave = smooth(between(q, AFTER_BEATS.leave));
    const plains = smooth(between(q, AFTER_BEATS.plainsIn));
    const camera = this.afterWalk(q);
    const home = this.homeMarks(street);

    drawSky(ctx, w, h, sky, this.sky, time, lerp(street, h * 0.77, leave));
    this.constellation(q, time);
    drawClouds(ctx, w, h, this.clouds, sky, time, lerp(0.5, 0.4, leave) * (1 - 0.7 * sky.stars), 0);

    const land = smooth(between(q, AFTER_BEATS.landIn)) * (1 - plains);
    if (land > 0.001) this.land(q, land, sky, ink, ground, camera, time);
    if (plains > 0.001) this.plains(plains, sky, ink, ground, camera, time);
    if (leave < 1) this.homeStreet(1, 1 - leave, sky, street, time, false, 1 - smooth(range(q, 0, 0.02)));

    drawCuriosity(ctx, w, h, this.atmos, time, window4(q, AFTER_BEATS.fireflies) * 0.6, ground, [w * 0.04, w * 0.96]);

    // He walks off from the puddle, and the dog gets up to follow him.
    const x = lerp(home.standX, w * 0.4, leave);
    const feet = lerp(home.standGround, ground + u, leave);
    const follow = smooth(range(q, 0.008, 0.05));
    const lying = q < 0.008 || q > AFTER_BEATS.sit[0] + 0.015;
    const dogX = lerp(home.doorX - u * 7, x - u * 9, follow);
    const dogGround = lerp(street + u * 1.5, ground + u * 0.4, follow);
    drawDog(ctx, dogX, dogGround, u, 1, inkCss, lying ? "sleep" : "trot", lying ? time : this.stride / (u * 40), 1);

    // On the plains he sits, looks out, and lifts his face to the stars.
    const stars = window4(q, AFTER_BEATS.stars);
    const upright = blendPose(LOOKING_UP, this.walking(), smooth(range(q, 0, 0.02)));
    const seated: Pose = { ...SIT, shL: 0.45, elL: 0.45, shR: 0.55, elR: 0.4, head: -0.1 - 0.35 * stars, lean: 0.1 - 0.12 * stars };
    const pose = blendPose(upright, seated, smooth(between(q, AFTER_BEATS.sit)));
    drawFigure(ctx, x, feet, 1, pose, adult(u), inkCss, this.rim(x, sky));

    // The boy he was, sitting beside him.
    const boyIn = smooth(between(q, AFTER_BEATS.boy));
    if (boyIn > 0.001) {
      const bx = x + u * 11;
      drawGlow(ctx, bx, ground - u * 5, u * 16, WARM, 0.55 * boyIn * (1 - 0.5 * range(q, 0.96, 1)));
      ctx.save();
      ctx.globalAlpha *= boyIn;
      drawFigure(ctx, bx, ground + u, 1, { ...SIT, shL: 0.45, elL: 0.45, shR: 0.55, elR: 0.4, head: -0.15, lean: 0.06 }, boy(u), inkCss, this.rim(bx, sky));
      ctx.restore();
    }

    const birds = lerp(1, 0.5, range(q, 0, 0.1)) * (1 - range(q, 0.62, 0.72));
    drawBirds(ctx, w, h, time, birds, rgba(ink));
    drawBloom(ctx, w, h, sky, 0.9);
  }

  /** Stars that join into a small shape; its link to the playground lives in the DOM. */
  private constellation(q: number, time: number) {
    const amount = window4(q, AFTER_BEATS.stars);
    if (amount < 0.01) return;
    const box = constellationBox(this.w, this.h);
    const points = STARS.map((star) => starAt(box, star));
    drawConstellation(this.ctx, points, EDGES, time, amount, range(q, AFTER_BEATS.stars[1] - 0.01, AFTER_BEATS.stars[1] + 0.03));
  }

  /** Daylight country: far hills, a line of trees, the road, and the places he passes. */
  private land(q: number, alpha: number, sky: Sky, ink: RGB, ground: number, camera: number, time: number) {
    const { ctx, w, h, u, farHills, treeline } = this;
    if (!farHills || !treeline) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    drawRidge(ctx, farHills, camera, ground, w, h, rgba(mix(ink, sky.horizon, 0.55)));
    this.haze(ground, sky.horizon, 0.3 * sky.haze, h * 0.25);
    drawRidge(ctx, treeline, camera, ground, w, h, rgba(mix(ink, sky.lower, 0.28)));
    this.haze(ground, sky.horizon, 0.15 * sky.haze, h * 0.12);
    this.roadSurface(ground, sky, ink, 1);
    drawTrees(ctx, this.trees, camera, ground, u, w, rgba(mix(ink, sky.lower, 0.06)), time);
    this.places(q, sky, ink, ground, camera);
    drawGrass(ctx, this.tufts, camera * 1.35, h * 0.99, this.grassSpan, w, rgba(INK), time, 0.4);
    ctx.restore();
  }

  /** The people he designed for, each met on the way, and a sweets cart in the evening. */
  private places(q: number, sky: Sky, ink: RGB, ground: number, camera: number) {
    const { ctx, w, u } = this;
    const people = rgba(mix(ink, sky.lower, 0.1));
    const at = (mid: number) => this.worldX(mid) - camera;
    const near = (x: number) => x > -u * 40 && x < w + u * 40;

    // Someone alone on a bench, lit by a phone.
    const bench = at(PLACES.bench);
    if (near(bench)) {
      const build: Build = { height: u * 19, age: 1, hair: "short", outfit: "shirt" };
      drawBench(ctx, bench, ground, u, hipHeight(BENCH, build) - u * 0.5, people);
      const joints = drawFigure(ctx, bench + u * 0.5, ground, -1, BENCH, build, people);
      const px = (joints.handL[0] + joints.handR[0]) / 2;
      const py = (joints.handL[1] + joints.handR[1]) / 2 - u * 0.4;
      drawGlow(ctx, px, py, u * 9, SCREEN, 0.9);
      ctx.fillStyle = "rgba(214,230,255,0.9)";
      ctx.fillRect(px - u * 0.25, py - u * 0.4, u * 0.5, u * 0.8);
    }

    // A family standing close, the mother's hand on her son's shoulder.
    const family = at(PLACES.family);
    if (near(family)) {
      drawFigure(ctx, family - u * 3, ground, -1, { ...STAND, head: -0.05 }, { height: u * 11, age: 0.15, hair: "short" }, people);
      drawFigure(ctx, family, ground, -1, { ...STAND, head: 0.2, shR: 0.35, elR: 0.1 }, { height: u * 18, age: 1, hair: "bun", outfit: "saree" }, people);
      drawFigure(ctx, family + u * 5, ground, -1, { ...STAND, head: 0.3, shL: 0.2 }, { height: u * 19.5, age: 1, hair: "short", outfit: "kurta" }, people);
    }

    // A queue at a lit doorway, waiting to be let in.
    const gate = at(PLACES.gate);
    if (near(gate)) {
      const light = drawGate(ctx, gate + u * 7, ground, u, people, "rgba(255,216,164,0.92)");
      drawGlow(ctx, light[0], light[1], u * 16, WARM, 0.55);
      [0, 1, 2].forEach((i) => {
        const outfit = (["shirt", "saree", "kurta"] as const)[i];
        const build: Build = { height: u * (18.5 + (i % 2)), age: 1, hair: outfit === "saree" ? "bun" : "short", outfit };
        drawFigure(ctx, gate - i * u * 5, ground, 1, { ...STAND, head: 0.12 * i }, build, people);
      });
    }

    // Strangers passing both ways, like the crowd outside his door.
    const mid = PLACES.strangers;
    const crowd = bump(q, mid - 0.06, mid - 0.035, mid + 0.04, mid + 0.07);
    if (crowd > 0.01) {
      const moved = camera - this.afterWalk(mid);
      ctx.save();
      ctx.globalAlpha *= crowd;
      const outfits = ["kurta", "saree", "shirt", "shirt", "kurta"] as const;
      outfits.forEach((outfit, i) => {
        const dir: 1 | -1 = i % 2 === 0 ? -1 : 1;
        const cx = at(mid) + (i - 2) * u * 13 + dir * moved * 0.5;
        const build: Build = { height: u * (17.5 + (i % 3)), age: 1, hair: outfit === "saree" ? "bun" : "short", outfit };
        drawFigure(ctx, cx, ground, dir, walkPose(this.stride / (u * 6) + i * 1.3, this.walk), build, people, this.rim(cx, sky));
      });
      ctx.restore();
    }

    const cart = at(PLACES.cart);
    if (near(cart)) {
      const lamp = drawCart(ctx, cart + u * 3, ground, u, people);
      drawGlow(ctx, lamp[0], lamp[1], u * 14, LAMP, 0.75);
      drawFigure(ctx, cart - u * 8.5, ground, 1, PUSH, { height: u * 18.5, age: 1, hair: "turban", outfit: "kurta" }, people);
    }
  }

  /** Green plains under mountains, the grass moving in a soft breeze. */
  private plains(alpha: number, sky: Sky, ink: RGB, ground: number, camera: number, time: number) {
    const { ctx, w, h, u, mountains, hillsFar, hillsNear } = this;
    if (!mountains || !hillsFar || !hillsNear) return;
    // Green only reads while there is light; at night the hills fall back to ink.
    const lit = 1 - sky.stars * 0.75;
    const green = (amount: number) => mix(ink, GREEN, amount * lit);
    ctx.save();
    ctx.globalAlpha = alpha;
    drawRidge(ctx, mountains, camera, ground, w, h, rgba(mix(ink, mix(sky.lower, MIST, 0.4), 0.5)));
    this.haze(ground, sky.horizon, 0.35 * sky.haze, h * 0.22);
    drawRidge(ctx, hillsFar, camera, ground, w, h, rgba(mix(green(0.5), sky.lower, 0.22)));
    this.haze(ground, sky.horizon, 0.14 * sky.haze, h * 0.1);
    drawRidge(ctx, hillsNear, camera, ground, w, h, rgba(mix(green(0.4), sky.lower, 0.08)));

    const meadow = ctx.createLinearGradient(0, ground, 0, h);
    meadow.addColorStop(0, rgba(green(0.3)));
    meadow.addColorStop(1, rgba(ink));
    ctx.fillStyle = meadow;
    ctx.fillRect(0, ground - 1, w, h - ground + 1);

    const tree = this.worldX(PLACES.lone, 0.8) - camera;
    ctx.save();
    ctx.translate(tree, ground + u * 0.5);
    ctx.scale(1.25, 1.25);
    drawTree(ctx, 0, 0, u, rgba(green(0.12)), time);
    ctx.restore();

    drawGrass(ctx, this.meadow, camera, ground + u * 0.5, this.grassSpan, w, rgba(green(0.3)), time, 1);
    drawGrass(ctx, this.tufts, camera * 1.35, h * 0.99, this.grassSpan, w, rgba(INK), time, 1);
    ctx.restore();
  }

  private haze(ground: number, color: RGB, alpha: number, height: number) {
    const g = this.ctx.createLinearGradient(0, ground - height, 0, ground);
    g.addColorStop(0, rgba(color, 0));
    g.addColorStop(1, rgba(color, alpha));
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, ground - height, this.w, height);
  }
}
