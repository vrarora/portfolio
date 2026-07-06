/**
 * Captures the design-repo cover: one Data Compass screen split down the
 * middle — left half static wireframe with redlines on paper, right half the
 * same screen running (cursor mid-interaction, "Preview ready" chip). Used
 * identically on the homepage work card and the design-repo case-study hero.
 *
 * Usage:
 *   BASE_URL=http://localhost:8788 node scripts/capture-designrepo-cover.mjs
 *
 * Run against a production build (agentation devtools render null there) so
 * no dev UI leaks into the capture:
 *   npm run build && (cd out && python3 -m http.server 8788)
 */
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8788";
const OUT_DIR = new URL("../public/images/design-repo/", import.meta.url).pathname;
const WIDTH = 1180;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 1000 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE_URL}/covers/design-repo/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800); // fonts

const tmp = mkdtempSync(join(tmpdir(), "dr-cover-"));
const pngPath = join(tmp, "design-repo-cover.png");
// the route renders both variants; the cursor one is the shipped cover
await page.locator('[data-drcov-canvas="cursor"]').screenshot({ path: pngPath });
console.log("captured design-repo-cover");

await browser.close();

mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, "design-repo-cover.webp");
await sharp(pngPath).resize({ width: WIDTH }).webp({ quality: 82 }).toFile(outPath);
console.log(`wrote ${outPath}`);

rmSync(tmp, { recursive: true, force: true });
