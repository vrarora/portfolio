/**
 * Records the playground hover-preview loops from the built labs.
 *
 * Usage:
 *   env -u PLAYWRIGHT_BROWSERS_PATH node scripts/record-lab-previews.mjs           # all labs
 *   env -u PLAYWRIGHT_BROWSERS_PATH node scripts/record-lab-previews.mjs koyomi    # one or more slugs
 *
 * Serves public/ on a local port, drives each lab at /labs/<slug>/ with scripted
 * beats while Playwright records video, captures a poster frame at a good beat,
 * then transcodes the WebM to a muted H.264 MP4 (yuv420p, 24fps, faststart) via
 * ffmpeg-static and encodes the poster to WebP via sharp.
 *
 * Outputs (committed): public/playground/<slug>/preview.mp4 + poster.webp
 * Budget: each preview.mp4 must be <= 2.5 MB or the run fails.
 */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const projectRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const publicRoot = join(projectRoot, "public");
const PORT = 8123;
const CLIP_SECONDS = 10;
const BUDGET_BYTES = 2.5 * 1024 * 1024;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon",
};

function startServer() {
  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = normalize(join(publicRoot, decodeURIComponent(url.pathname)));
    if (!filePath.startsWith(publicRoot)) {
      res.writeHead(403).end();
      return;
    }
    if (filePath.endsWith("/") || (existsSync(filePath) && statSync(filePath).isDirectory())) {
      filePath = join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
    createReadStream(filePath).pipe(res);
  });
  return new Promise((resolveStarted) => {
    server.listen(PORT, () => resolveStarted(server));
  });
}

/**
 * Each lab script drives the page and returns beat marks:
 *   clipStartMs  — ms since page creation where the 10s clip should begin
 *   posterBuffer — PNG screenshot taken at the poster beat
 */
const LABS = [
  {
    slug: "koyomi",
    viewport: { width: 1280, height: 800 },
    orientation: "landscape",
    // Generative almanac: land on the fireflies pentad, let the particle scene
    // settle, then page through two seasons so the palette crossfades on film.
    // Sound stays off (#btn-sound is never touched; browser launches muted).
    async run(page, t0) {
      await page.goto(`http://localhost:${PORT}/labs/koyomi/#/26`, { waitUntil: "load" });
      await page.waitForSelector("#scene", { state: "attached" });
      await page.waitForTimeout(2200);
      const clipStartMs = Date.now() - t0;
      await page.waitForTimeout(2600);
      const posterBuffer = await page.screenshot({ type: "png" });
      await page.click("#next");
      await page.waitForTimeout(3400);
      await page.click("#next");
      await page.waitForTimeout(3400);
      await page.waitForTimeout(1200);
      return { clipStartMs, posterBuffer };
    },
  },
  {
    slug: "memento-mori",
    viewport: { width: 1280, height: 800 },
    orientation: "landscape",
    // Staged mortality piece: step through Threshold + Birth quickly, then film
    // the Act 2 week-lights burn-in (BURN_MS = 9500 in the source).
    async run(page, t0) {
      await page.goto(`http://localhost:${PORT}/labs/memento-mori/`, { waitUntil: "load" });
      await page.waitForSelector("button.ghost-btn.act-continue", { state: "visible" });
      await page.waitForTimeout(400);
      await page.click("button.ghost-btn.act-continue");
      await page.waitForSelector('input.birth-input[name="day"]', { state: "visible" });
      await page.fill('input.birth-input[name="day"]', "15");
      await page.fill('input.birth-input[name="month"]', "06");
      await page.fill('input.birth-input[name="year"]', "1994");
      await page.waitForSelector("button.ghost-btn.act-continue", { state: "visible" });
      await page.waitForTimeout(600);
      await page.click("button.ghost-btn.act-continue");
      // Act transition (650 + 350ms) + hollow grid fade (1500 + 500ms), then burn.
      const clipStartMs = Date.now() - t0 + 1400;
      await page.waitForTimeout(9200);
      const posterBuffer = await page.screenshot({ type: "png" });
      await page.waitForTimeout(2600);
      return { clipStartMs, posterBuffer };
    },
  },
  {
    slug: "pulse",
    viewport: { width: 390, height: 844 },
    orientation: "portrait",
    // Mobile finance prototype: frame the phone full-bleed (capture-only style
    // override), switch to the interactive prototype, scroll the home feed,
    // then open the AI plan sheet so the thinking/typing sequence is on film.
    async run(page, t0) {
      await page.goto(`http://localhost:${PORT}/labs/pulse/`, { waitUntil: "load" });
      await page.click('.mode-tabs [role="tab"]:last-child');
      await page.waitForSelector(".screen.home-screen", { state: "visible" });
      await page.addStyleTag({
        content: `
          main.stage { padding: 0 !important; min-height: 100vh !important; }
          .app-shell { gap: 0 !important; }
          .mode-tabs { display: none !important; }
          section.phone { height: 100vh !important; min-height: 0 !important;
            border-radius: 0 !important; }
        `,
      });
      await page.waitForTimeout(900);
      const clipStartMs = Date.now() - t0;
      await page.waitForTimeout(1400);
      const posterBuffer = await page.screenshot({ type: "png" });
      const home = page.locator(".screen.home-screen");
      for (let i = 0; i < 4; i++) {
        await home.evaluate((el) => el.scrollBy({ top: 150, behavior: "smooth" }));
        await page.waitForTimeout(550);
      }
      await home.evaluate((el) => el.scrollTo({ top: 0, behavior: "smooth" }));
      await page.waitForTimeout(900);
      await page.click('button.alert-action[aria-label="Create a plan with Pulse"]');
      await page.waitForTimeout(4600);
      return { clipStartMs, posterBuffer };
    },
  },
  {
    slug: "hover-reveal",
    viewport: { width: 594, height: 840 },
    orientation: "portrait",
    // Clay-to-metal brush shader: the reveal IS the loop, so the clip is one
    // long take of slow arcs over the portrait with a pause for the decay.
    // The artwork card is framed full-bleed (capture-only style override) so
    // the preview is the statue, not the page's beige margins.
    async run(page, t0) {
      await page.goto(`http://localhost:${PORT}/labs/hover-reveal/`, { waitUntil: "load" });
      await page.addStyleTag({
        content: `
          .shell { padding: 0 !important; }
          .viewport-card { height: 100svh !important; max-width: none !important; }
        `,
      });
      const viewport = page.locator("#viewport");
      await viewport.waitFor({ state: "visible" });
      await page.waitForTimeout(1200);
      const box = await viewport.boundingBox();
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      const rx = box.width * 0.32;
      const ry = box.height * 0.3;
      const sweep = async (turns, stepMs) => {
        const steps = Math.round(turns * 40);
        for (let i = 0; i <= steps; i++) {
          const a = (i / 40) * Math.PI * 2;
          await page.mouse.move(cx + Math.cos(a) * rx, cy + Math.sin(a * 0.8) * ry);
          await page.waitForTimeout(stepMs);
        }
      };
      await page.mouse.move(cx - rx, cy);
      const clipStartMs = Date.now() - t0;
      await sweep(1.2, 55);
      const posterBuffer = await page.screenshot({ type: "png" });
      await page.waitForTimeout(1300);
      await sweep(1.4, 45);
      return { clipStartMs, posterBuffer };
    },
  },
  {
    slug: "atmos",
    viewport: { width: 390, height: 844 },
    orientation: "portrait",
    // Living weather instrument: real Open-Meteo forecast for the default city
    // (San Francisco). Let the sky settle, capture the editorial hero as the
    // poster, then press-drag the temperature timeline so the whole sky
    // time-travels through the day (the signature interaction), release to let
    // it spring back to now, and open the glass dock to reveal week + stats.
    async run(page, t0) {
      await page.goto(`http://localhost:${PORT}/labs/atmos/`, { waitUntil: "load" });
      // Wait for the forecast fetch + sky/shader warmup before filming.
      await page.waitForSelector(".timeline-hit", { state: "visible" });
      await page.waitForTimeout(3200);

      const clipStartMs = Date.now() - t0;
      await page.waitForTimeout(900);
      const posterBuffer = await page.screenshot({ type: "png" });
      await page.waitForTimeout(700);

      // Scrub the sky: press and drag across the timeline hit-area. The sky
      // morphs hour by hour and the sun/moon glide along the arc.
      const hit = page.locator(".timeline-hit");
      const box = await hit.boundingBox();
      const y = box.y + box.height / 2;
      const x0 = box.x + box.width * 0.08;
      const x1 = box.x + box.width * 0.94;
      await page.mouse.move(x0, y);
      await page.mouse.down();
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        await page.mouse.move(x0 + ((x1 - x0) * i) / steps, y);
        await page.waitForTimeout(70);
      }
      await page.waitForTimeout(500);
      await page.mouse.up(); // springs back to now
      await page.waitForTimeout(1100);

      // Open the glass dock: week + stats constellation slides up.
      await page.click(".dock-handle");
      await page.waitForTimeout(2200);
      return { clipStartMs, posterBuffer };
    },
  },
];

function transcode(lab, webmPath, clipStartMs, outPath) {
  const scale = lab.orientation === "portrait" ? "scale=-2:960" : "scale=960:-2";
  execFileSync(
    ffmpegPath,
    [
      "-y",
      "-ss", (clipStartMs / 1000).toFixed(2),
      "-i", webmPath,
      "-t", String(CLIP_SECONDS),
      "-an",
      "-vf", `${scale},fps=24`,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "30",
      "-movflags", "+faststart",
      outPath,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
}

async function encodePoster(lab, posterBuffer, outPath) {
  const resizeOpts = lab.orientation === "portrait" ? { height: 960 } : { width: 960 };
  await sharp(posterBuffer).resize(resizeOpts).webp({ quality: 80 }).toFile(outPath);
}

async function recordLab(browser, lab, videoTmp) {
  console.log(`\n=== ${lab.slug} ===`);
  const context = await browser.newContext({
    viewport: lab.viewport,
    recordVideo: { dir: videoTmp, size: lab.viewport },
  });
  const page = await context.newPage();
  const t0 = Date.now();
  const { clipStartMs, posterBuffer } = await lab.run(page, t0);
  const video = page.video();
  await context.close();
  const webmPath = await video.path();

  const outDir = join(publicRoot, "playground", lab.slug);
  mkdirSync(outDir, { recursive: true });
  const mp4Path = join(outDir, "preview.mp4");
  const posterPath = join(outDir, "poster.webp");
  transcode(lab, webmPath, clipStartMs, mp4Path);
  await encodePoster(lab, posterBuffer, posterPath);

  const mp4Bytes = statSync(mp4Path).size;
  const posterBytes = statSync(posterPath).size;
  console.log(
    `  -> preview.mp4 ${(mp4Bytes / 1024 / 1024).toFixed(2)} MB, poster.webp ${(posterBytes / 1024).toFixed(0)} KB`,
  );
  if (mp4Bytes > BUDGET_BYTES) {
    throw new Error(`${lab.slug}: preview.mp4 is ${(mp4Bytes / 1024 / 1024).toFixed(2)} MB (budget 2.5 MB)`);
  }
}

const requested = process.argv.slice(2);
const selected = requested.length
  ? requested.map((slug) => {
      const lab = LABS.find((l) => l.slug === slug);
      if (!lab) throw new Error(`unknown lab slug "${slug}" (known: ${LABS.map((l) => l.slug).join(", ")})`);
      return lab;
    })
  : LABS;

const server = await startServer();
const videoTmp = mkdtempSync(join(tmpdir(), "lab-previews-"));
const browser = await chromium.launch({ args: ["--mute-audio"] });

try {
  for (const lab of selected) await recordLab(browser, lab, videoTmp);
} finally {
  await browser.close();
  server.close();
  rmSync(videoTmp, { recursive: true, force: true });
}
console.log("\nall previews recorded");
