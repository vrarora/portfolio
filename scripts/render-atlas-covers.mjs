/**
 * Renders the Data Atlas case study's cover, thumbnail, link preview and
 * work-table images from the frozen assets-page snapshot, so every image
 * carries the renamed product.
 *
 * Run after `node scripts/capture-atlas-snapshots.mjs assets`:
 *   node scripts/render-atlas-covers.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import ffmpeg from "ffmpeg-static";
import { chromium } from "playwright";

const ROOT = resolve(import.meta.dirname, "..");
const SNAPSHOT = pathToFileURL(join(ROOT, "public", "atlas-snapshots", "assets", "index.html")).href;

/** Each image is a crop from the top of the 1440px-wide page, scaled to its output size. */
const OUTPUTS = [
  { file: "public/images/data-compass-cover.webp", width: 2880, height: 1660 },
  { file: "public/images/data-compass-thumbnail.webp", width: 2880, height: 1706 },
  { file: "public/images/data-compass-thumbnail.png", width: 2880, height: 1706 },
  { file: "public/images/data-compass-og.jpg", width: 1200, height: 630 },
  { file: "public/images/work-table/data-compass.webp", width: 720, height: 416 },
];

const tmp = mkdtempSync(join(tmpdir(), "atlas-covers-"));
const browser = await chromium.launch({ args: ["--no-sandbox"] });

try {
  for (const out of OUTPUTS) {
    const cssHeight = Math.round((1440 * out.height) / out.width);
    const page = await browser.newPage({ viewport: { width: 1440, height: cssHeight }, deviceScaleFactor: 2, javaScriptEnabled: false });
    await page.goto(SNAPSHOT, { waitUntil: "networkidle" });
    const shot = join(tmp, "shot.png");
    await page.screenshot({ path: shot });
    await page.close();

    const quality = out.file.endsWith(".webp") ? ["-quality", "88"] : out.file.endsWith(".jpg") ? ["-q:v", "3"] : [];
    const result = spawnSync(ffmpeg, ["-v", "error", "-y", "-i", shot, "-vf", `scale=${out.width}:${out.height}:flags=lanczos`, ...quality, join(ROOT, out.file)]);
    if (result.status !== 0) throw new Error(`ffmpeg failed for ${out.file}: ${result.stderr}`);
    console.log(`Wrote ${out.file} (${out.width}x${out.height})`);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
