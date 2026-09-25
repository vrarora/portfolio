/**
 * Renders the Agentic Design case study's cover, thumbnail, link preview and
 * work-table images from the board's title card.
 *
 * Needs `next dev` on port 3000, because the board's seek hook is dev only:
 *   node scripts/render-agentic-covers.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import ffmpeg from "ffmpeg-static";
import { chromium } from "playwright";

const ROOT = resolve(import.meta.dirname, "..");
const URL = "http://localhost:3000/work/agentic-design/";
const BEAT = "cover";

/** Each image is a screenshot of the finished beat at the output's aspect ratio. */
const OUTPUTS = [
  { file: "public/images/agentic-design/cover.webp", width: 2880, height: 1660 },
  { file: "public/images/agentic-design/thumbnail.webp", width: 2880, height: 1706 },
  { file: "public/images/agentic-design/og.jpg", width: 1200, height: 630 },
  { file: "public/images/work-table/agentic-design.webp", width: 720, height: 550 },
];

const tmp = mkdtempSync(join(tmpdir(), "agentic-covers-"));
const browser = await chromium.launch({ args: ["--no-sandbox"] });

try {
  for (const out of OUTPUTS) {
    const cssHeight = Math.round((1440 * out.height) / out.width);
    const page = await browser.newPage({ viewport: { width: 1440, height: cssHeight }, deviceScaleFactor: 2 });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.waitForFunction(() => "__board" in window, null, { timeout: 30000 });

    // Seek to the end of the beat, let dev tools finish mounting, then hide everything pinned over the board

    await page.evaluate((beat) => {
      const spans = Object.entries(window.__board.spans).filter(([id]) => id.startsWith(`${beat}-`));
      window.__board.seek(Math.max(...spans.map(([, s]) => s.t1)) + 0.001);
    }, BEAT);
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      document.querySelectorAll(".board-pill").forEach((el) => (el.style.display = "none"));
      for (const el of document.querySelectorAll("body *")) {
        if (!el.closest(".board-stage") && getComputedStyle(el).position === "fixed") el.style.display = "none";
      }
    });

    const shot = join(tmp, "shot.png");
    await page.screenshot({ path: shot });
    await page.close();

    mkdirSync(dirname(join(ROOT, out.file)), { recursive: true });
    const quality = out.file.endsWith(".webp") ? ["-quality", "88"] : out.file.endsWith(".jpg") ? ["-q:v", "3"] : [];
    const result = spawnSync(ffmpeg, ["-v", "error", "-y", "-i", shot, "-vf", `scale=${out.width}:${out.height}:flags=lanczos`, ...quality, join(ROOT, out.file)]);
    if (result.status !== 0) throw new Error(`ffmpeg failed for ${out.file}: ${result.stderr}`);
    console.log(`Wrote ${out.file} (${out.width}x${out.height})`);
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
