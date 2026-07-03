/**
 * Records the full EqualAll flow as video, then tiles frames into contact
 * sheets (one per transition window) so every frame of every transition can
 * be inspected for glitches.
 *
 * Usage: BASE_URL=http://localhost:3001 node scripts/audit-equalall-motion.mjs
 * Output: .audit/equalall-motion/*.png
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";
const OUT_DIR = new URL("../.audit/equalall-motion/", import.meta.url).pathname;
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const FFMPEG = join(
  homedir(),
  "Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac",
);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: OUT_DIR, size: { width: 390, height: 844 } },
});
// Marks: [label, seconds-from-recording-start] appended as we go. The video
// clock starts at page creation, so anchor t0 there.
const t0 = Date.now();
const page = await context.newPage();
const marks = [];
const mark = (label) => marks.push([label, (Date.now() - t0) / 1000]);

await page.goto(`${BASE_URL}/mockups/equalall/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

async function tap(target) {
  await page.locator(`[data-ea-target="${target}"]`).click();
}

mark("sheet-open");
await tap("donate-bar");
await page.waitForTimeout(900);

mark("tier-select");
await tap("tier-t100");
await page.waitForTimeout(700);

mark("freq-monthly");
await tap("freq-monthly");
await page.waitForTimeout(700);
mark("freq-once");
await tap("freq-once");
await page.waitForTimeout(700);

mark("step-forward");
await tap("gift-continue");
await page.waitForTimeout(1100);

mark("step-back");
await tap("confirm-back");
await page.waitForTimeout(1100);

mark("step-forward-2");
await tap("gift-continue");
await page.waitForTimeout(1100);

mark("payment-open");
await tap("confirm-give");
await page.waitForTimeout(900);

mark("payment-confirm");
await tap("pay-confirm");
await page.waitForTimeout(2700); // processing + check

mark("keepsake-enter");
await page.waitForTimeout(4200); // journey settles ~mount + 4.0s

mark("invite-accept");
await tap("invite-accept");
await page.waitForTimeout(1200);

mark("reset");
await tap("keepsake-done");
await page.waitForTimeout(1200);
mark("end");

await context.close(); // flushes video
await browser.close();

const video = readdirSync(OUT_DIR).find((f) => f.endsWith(".webm"));
if (!video) throw new Error("no video captured");
const videoPath = join(OUT_DIR, video);

// One contact sheet per transition window: 1.2s at 20fps = 24 frames, 6x4.
// Playwright's ffmpeg build has no fps/tile filters, so extract frames with
// -r and compose the grid with sharp.
const FRAME_W = 190;
const FRAME_H = Math.round((FRAME_W * 844) / 390);
const COLS = 6;
const ROWS = 4;
const PAD = 3;

for (const [label, at] of marks) {
  if (label === "end") continue;
  const framesDir = join(OUT_DIR, `frames-${label}`);
  mkdirSync(framesDir, { recursive: true });
  execFileSync(
    FFMPEG,
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
  console.log(`strip-${label}.png (${frames.length} frames)`);
}

console.log(`video: ${videoPath}`);
