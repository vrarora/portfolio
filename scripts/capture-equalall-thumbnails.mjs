/**
 * Captures the EqualAll homepage thumbnails by driving the real mockup flow
 * at an iPhone viewport, then converting to WebP via sharp.
 *
 * Usage:
 *   BASE_URL=http://localhost:8788 node scripts/capture-equalall-thumbnails.mjs
 *
 * Run against a production build (agentation devtools render null there) so
 * no dev UI leaks into the captures:
 *   npm run build && (cd out && python3 -m http.server 8788)
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8788";
const OUT_DIR = new URL("../public/images/equalall/", import.meta.url).pathname;
const WIDTH = 520;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto(`${BASE_URL}/mockups/equalall/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2200); // progress fill + fonts + hero image

const tmp = mkdtempSync(join(tmpdir(), "ea-thumbs-"));
const captures = [];

async function capture(name) {
  const pngPath = join(tmp, `${name}.png`);
  await page.locator(".ea-viewport").screenshot({ path: pngPath });
  captures.push({ name, pngPath });
  console.log(`captured ${name}`);
}

// 1. Story page, top
await capture("thumb-story");

// 2. Gift sheet with the "Most chosen" tier selected
await page.locator('[data-ea-target="donate-bar"]').click();
await page.waitForTimeout(700);
await page.locator('[data-ea-target="tier-t100"]').click();
await page.waitForTimeout(600);
await capture("thumb-gift");

// 3. Keepsake after the full flow's choreography settles
await page.locator('[data-ea-target="gift-continue"]').click();
await page.waitForTimeout(700);
await page.locator('[data-ea-target="confirm-give"]').click();
await page.waitForTimeout(700);
await page.locator('[data-ea-target="pay-confirm"]').click();
await page.waitForTimeout(4700);
await capture("thumb-keepsake");

await browser.close();

for (const { name, pngPath } of captures) {
  const outPath = join(OUT_DIR, `${name}.webp`);
  await sharp(pngPath).resize({ width: WIDTH }).webp({ quality: 82 }).toFile(outPath);
  console.log(`wrote ${outPath}`);
}

rmSync(tmp, { recursive: true, force: true });
