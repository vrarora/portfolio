/**
 * Captures the EqualAll cover thumbnail: a single phone (glass bezel) showing
 * the Story screen on the warm desktop-stage canvas. Used identically on the
 * homepage work card and the atlas case-study hero.
 *
 * Usage:
 *   BASE_URL=http://localhost:8788 node scripts/capture-equalall-thumbnails.mjs
 *
 * Run against a production build (agentation devtools render null there) so
 * no dev UI leaks into the capture:
 *   npm run build && (cd out && python3 -m http.server 8788)
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8788";
const OUT_DIR = new URL("../public/images/equalall/", import.meta.url).pathname;
const WIDTH = 1180;

const browser = await chromium.launch();
// Desktop viewport so PhoneFrame renders the bezel on the warm canvas
// (>480px avoids the fullbleed mobile layout). Landscape crop drops cleanly
// into the landscape work card and case-hero frames.
const page = await browser.newPage({
  viewport: { width: 1180, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE_URL}/mockups/equalall/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2200); // progress fill + fonts + hero image + seal

const tmp = mkdtempSync(join(tmpdir(), "ea-thumbs-"));
const pngPath = join(tmp, "equalall-cover.png");
await page.locator(".ea-mockup-page").screenshot({ path: pngPath });
console.log("captured equalall-cover");

await browser.close();

const outPath = join(OUT_DIR, "equalall-cover.webp");
await sharp(pngPath).resize({ width: WIDTH }).webp({ quality: 82 }).toFile(outPath);
console.log(`wrote ${outPath}`);

rmSync(tmp, { recursive: true, force: true });
