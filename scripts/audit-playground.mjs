/**
 * Frame-by-frame visual audit of the playground constellation page.
 *
 * Pass 1 captures every steady state at 2x DPR (idle, hover, mid-flight,
 * open stage, Show more, the portrait pulse stage at both breakpoints,
 * zoomed field, mobile, reduced motion). Pass 2 records the stage flights
 * and tiles the frames into contact sheets so every transition frame can
 * be inspected.
 *
 * Usage: BASE_URL=http://localhost:8788 node scripts/audit-playground.mjs [--states-only]
 * Output: .audit/playground/*.png
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8788";
const OUT_DIR = new URL("../.audit/playground/", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });
const statesOnly = process.argv.includes("--states-only");

const browser = await chromium.launch();

async function shot(page, name) {
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`), animations: "allow" });
  console.log(`  ${name}`);
}

// Hover a node, then click the grown box (the nodes drift, so the 236x150
// box is the only reliable click target — same pattern as the verify suite).
async function hoverNode(page, id) {
  const dot = await page.locator(`[data-pg-node="${id}"] .pg-node-dot`).boundingBox();
  await page.mouse.move(dot.x + dot.width / 2, dot.y + dot.height / 2, { steps: 8 });
  await page.waitForTimeout(600);
}

async function openNode(page, id) {
  await hoverNode(page, id);
  const box = await page.locator(`[data-pg-node="${id}"] .pg-node-box`).boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

// ---- Desktop steady states ---------------------------------------------------
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  console.log("desktop:");
  await shot(page, "01-idle");

  await hoverNode(page, "koyomi");
  await page.waitForTimeout(400);
  await shot(page, "02-hover-koyomi");

  await openNode(page, "koyomi");
  await page.waitForTimeout(180);
  await shot(page, "03-flight-mid");
  await page.waitForTimeout(1400);
  await shot(page, "04-stage-koyomi");

  await page.locator(".pg-card-showmore").click();
  await page.waitForTimeout(500);
  await shot(page, "05-show-more");
  await page.locator(".pg-card-showmore").click();
  await page.waitForTimeout(400);

  await page.locator('.pg-card-pill[aria-label="Next"]').click();
  await page.waitForTimeout(1400);
  await shot(page, "06-stage-memento");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(1400);

  // Min zoom: the whole constellation contracted, HUD readout at 72-73%.
  await page.mouse.move(720, 520);
  for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 500);
  await page.waitForTimeout(900);
  await shot(page, "07-zoom-out");
  await page.close();
}

// ---- Pulse portrait stage at both breakpoints (plan risk #6) -------------------
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(`${BASE_URL}/playground/#open-pulse`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2200);
  await shot(page, "08-stage-pulse-desktop");
  await page.close();

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(`${BASE_URL}/playground/#open-pulse`, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(2200);
  await shot(mobile, "09-stage-pulse-mobile");
  await mobile.close();
}

// ---- Mobile steady states -------------------------------------------------------
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1600);
  console.log("mobile:");
  await shot(page, "10-mobile-idle");

  const label = await page.locator('[data-pg-node="koyomi"] .pg-node-label').boundingBox();
  await page.touchscreen.tap(label.x + label.width / 2, label.y + label.height / 2);
  await page.waitForTimeout(1600);
  await shot(page, "11-mobile-stage-koyomi");
  await page.close();
}

// ---- Short phone viewport (Safari toolbars) — pulse stage + Show more ----------
{
  const page = await browser.newPage({
    viewport: { width: 390, height: 664 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${BASE_URL}/playground/#open-pulse`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2200);
  console.log("short viewport:");
  await shot(page, "14-short-stage-pulse");

  await page.locator(".pg-card-showmore").click();
  await page.waitForTimeout(1200);
  await shot(page, "15-short-show-more");
  await page.close();
}

// ---- Reduced motion ---------------------------------------------------------------
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  console.log("reduced motion:");
  await shot(page, "12-reduced-idle");

  await hoverNode(page, "koyomi");
  await shot(page, "13-reduced-hover-poster");
  await page.close();
}

// ---- Motion pass: contact sheets of the stage flights ------------------------------
if (!statesOnly) {
  console.log("motion pass:");
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
  });
  const t0 = Date.now();
  const page = await context.newPage();
  const marks = [];
  const mark = (label) => marks.push([label, (Date.now() - t0) / 1000]);

  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  mark("open-flight");
  await openNode(page, "koyomi");
  await page.waitForTimeout(1600);

  mark("step-flight");
  await page.locator('.pg-card-pill[aria-label="Next"]').click();
  await page.waitForTimeout(1600);

  mark("close-flight");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1600);
  mark("end");

  await context.close(); // flushes video

  const video = readdirSync(OUT_DIR).find((f) => f.endsWith(".webm"));
  if (!video) throw new Error("no video captured");
  const videoPath = join(OUT_DIR, video);

  // One contact sheet per flight window: 1.2s at 20fps = 24 frames, 6x4.
  const FRAME_W = 300;
  const FRAME_H = Math.round((FRAME_W * 800) / 1280);
  const COLS = 6;
  const ROWS = 4;
  const PAD = 3;

  for (const [label, at] of marks) {
    if (label === "end") continue;
    const framesDir = join(OUT_DIR, `frames-${label}`);
    mkdirSync(framesDir, { recursive: true });
    execFileSync(
      ffmpegPath,
      [
        "-y",
        "-ss",
        String(Math.max(0, at - 0.05)),
        "-t",
        "1.2",
        "-i",
        videoPath,
        "-r",
        "20",
        "-vf",
        `scale=${FRAME_W}:-1`,
        join(framesDir, "f-%02d.png"),
      ],
      { stdio: "pipe" },
    );

    const frames = readdirSync(framesDir).sort().slice(0, COLS * ROWS);
    const sheet = sharp({
      create: {
        width: COLS * (FRAME_W + PAD) + PAD,
        height: ROWS * (FRAME_H + PAD) + PAD,
        channels: 3,
        background: { r: 85, g: 85, b: 85 },
      },
    });
    const composites = frames.map((f, i) => ({
      input: join(framesDir, f),
      left: PAD + (i % COLS) * (FRAME_W + PAD),
      top: PAD + Math.floor(i / COLS) * (FRAME_H + PAD),
    }));
    await sheet
      .composite(composites)
      .png()
      .toFile(join(OUT_DIR, `strip-${label}.png`));
    rmSync(framesDir, { recursive: true, force: true });
    console.log(`  strip-${label}.png (${frames.length} frames)`);
  }
  rmSync(videoPath, { force: true });
}

await browser.close();
console.log(`\nwrote captures to ${OUT_DIR}`);
