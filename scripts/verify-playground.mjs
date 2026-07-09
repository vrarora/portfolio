/**
 * End-to-end verification of the playground constellation page.
 *
 * Usage:
 *   BASE_URL=http://localhost:8788 node scripts/verify-playground.mjs
 *
 * Run against the production build: `npm run build`, serve out/ (e.g.
 * `cd out && python3 -m http.server 8788`), then run with
 * `env -u PLAYWRIGHT_BROWSERS_PATH`. Asserts the calm field, hover previews,
 * zoom, drag, the open stage with card navigation, deep links, all four
 * same-domain lab builds, reduced motion and the mobile touch surface.
 */
import { readFileSync, readdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:8788";
let failures = 0;

// Expected counts come from the content file and the labs directory, so
// adding a node (see ADDING-A-NODE.md) never breaks this suite.
const contentSrc = readFileSync(
  new URL("../src/content/playground.ts", import.meta.url),
  "utf8",
);
const NODE_COUNT = [...contentSrc.matchAll(/^\s*id: "/gm)].length;
const LAB_SLUGS = readdirSync(new URL("../public/labs/", import.meta.url), {
  withFileTypes: true,
})
  .filter((d) => d.isDirectory())
  .map((d) => d.name);
const pad2 = (n) => String(n).padStart(2, "0");

function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${!ok && detail ? `  (${detail})` : ""}`);
  if (!ok) failures += 1;
}

async function dotCenter(page, id) {
  const box = await page.locator(`[data-pg-node="${id}"] .pg-node-dot`).boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

// The label is a far bigger touch target than the 7px dot; the nodes drift,
// so always read it at the last moment before touching.
async function labelCenter(page, id) {
  const box = await page.locator(`[data-pg-node="${id}"] .pg-node-label`).boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const browser = await chromium.launch();

// ---- Desktop field + stage --------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);

  check(
    `field renders ${NODE_COUNT} nodes`,
    (await page.locator("[data-pg-node]").count()) === NODE_COUNT,
  );
  const calm = await page.evaluate(() => ({
    stage: document.querySelector(".pg-stage")?.style.display,
    cardHidden: document.querySelector(".pg-card")?.getAttribute("aria-hidden"),
    hash: window.location.hash,
  }));
  check(
    "calm field on load (no auto-open)",
    calm.stage === "none" && calm.cardHidden === "true" && calm.hash === "",
  );
  check(
    "canvas is DPR-sized to the viewport",
    await page.evaluate(() => {
      const c = document.querySelector(".pg-canvas");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      return (
        c.width === Math.round(window.innerWidth * dpr) &&
        c.height === Math.round(window.innerHeight * dpr)
      );
    }),
  );

  // Lenis gating: wheel must zoom the field, never scroll the document.
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(700);
  const wheeled = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollTop: document.documentElement.scrollTop,
    zoom: document.querySelector(".pg-zoom")?.textContent,
  }));
  check("wheel does not scroll the page (Lenis gated)", wheeled.scrollY === 0 && wheeled.scrollTop === 0);
  check("wheel changes the zoom readout", wheeled.zoom !== "100%", `readout ${wheeled.zoom}`);

  // Zoom must move geometry too: nodes contract toward the field center.
  const koyomiOut = await dotCenter(page, "koyomi");
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -400);
  await page.waitForTimeout(700);
  const koyomiIn = await dotCenter(page, "koyomi");
  const centerX = 720;
  check(
    "zoom transforms node positions",
    Math.abs(koyomiIn.x - centerX) - Math.abs(koyomiOut.x - centerX) > 40,
    `|dx| ${Math.abs(koyomiOut.x - centerX).toFixed(0)} -> ${Math.abs(koyomiIn.x - centerX).toFixed(0)}`,
  );
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 400); // back near 100%
  await page.waitForTimeout(600);

  // Hover: box grows, living preview plays muted; leaving pauses it.
  const koyomi = await dotCenter(page, "koyomi");
  await page.mouse.move(koyomi.x, koyomi.y, { steps: 10 });
  await page.waitForTimeout(900);
  const hover = await page.evaluate(() => {
    const node = document.querySelector('[data-pg-node="koyomi"]');
    const video = node?.querySelector(".pg-node-thumb");
    return {
      isHover: node?.classList.contains("is-hover"),
      boxW: node?.querySelector(".pg-node-box")?.getBoundingClientRect().width ?? 0,
      playing: video instanceof HTMLVideoElement && !video.paused,
      muted: video instanceof HTMLVideoElement && video.muted,
    };
  });
  check("hover marks the node and grows the box", hover.isHover && hover.boxW > 180, `w ${hover.boxW}`);
  check("hovered preview video plays muted", hover.playing && hover.muted);

  await page.mouse.move(koyomi.x + 500, koyomi.y + 200, { steps: 10 });
  await page.waitForTimeout(500);
  check(
    "leaving the node pauses its preview",
    await page.evaluate(() => {
      const video = document.querySelector('[data-pg-node="koyomi"] .pg-node-thumb');
      return video instanceof HTMLVideoElement && video.paused;
    }),
  );

  // Drag: node moves, click is suppressed, nothing opens.
  const before = await labelCenter(page, "memento-mori");
  await page.mouse.move(before.x, before.y, { steps: 6 });
  await page.mouse.down();
  await page.mouse.move(before.x + 150, before.y + 90, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  const after = await labelCenter(page, "memento-mori");
  const moved = Math.hypot(after.x - before.x, after.y - before.y);
  const openedByDrag = await page.evaluate(
    () => document.querySelector(".pg-stage")?.style.display !== "none",
  );
  check("drag moves a node without opening it", moved > 100 && !openedByDrag, `moved ${moved.toFixed(0)}px`);

  // Click to open: stage flight, card content, counter, hash. The nodes
  // drift continuously, so hover first (the grown box is a 236x150 target
  // drift cannot escape) and click the box centre read at the last moment.
  const target = await dotCenter(page, "koyomi");
  await page.mouse.move(target.x, target.y, { steps: 6 });
  await page.waitForTimeout(500);
  const grownBox = await page.locator('[data-pg-node="koyomi"] .pg-node-box').boundingBox();
  await page.mouse.click(grownBox.x + grownBox.width / 2, grownBox.y + grownBox.height / 2);
  await page.waitForFunction(
    () => parseFloat(document.querySelector(".pg-card")?.style.opacity || "0") > 0.9,
    null,
    { timeout: 5000 },
  );
  const open = await page.evaluate(() => ({
    title: document.querySelector(".pg-card-title")?.textContent,
    cur: document.querySelector(".pg-card-cur")?.textContent,
    tot: document.querySelector(".pg-card-tot")?.textContent,
    hash: window.location.hash,
    live: document.querySelector(".pg-card-live")?.getAttribute("href"),
  }));
  check(
    "click opens the stage with the right card",
    open.title === "Koyomi" && open.cur === "01" && open.tot === pad2(NODE_COUNT),
    JSON.stringify(open),
  );
  check("open writes the deep-link hash", open.hash === "#open-koyomi");
  check("Open live points at the same-domain lab", open.live === "/labs/koyomi/");

  // Stage video never autoplays: play button visible, click starts playback.
  await page.waitForSelector(".pg-playbtn.is-visible", { timeout: 5000 });
  check(
    "stage video is paused behind a play button",
    await page.evaluate(() => {
      const v = document.querySelector(".pg-stage-vid");
      return v instanceof HTMLVideoElement && v.paused;
    }),
  );
  await page.locator(".pg-playbtn").click();
  await page.waitForTimeout(500);
  check(
    "play button starts the stage video",
    await page.evaluate(() => {
      const v = document.querySelector(".pg-stage-vid");
      return v instanceof HTMLVideoElement && !v.paused;
    }),
  );

  // Prev/next cycle and keyboard close.
  await page.locator('.pg-card-pill[aria-label="Next"]').click();
  await page.waitForTimeout(900);
  const next = await page.evaluate(() => ({
    title: document.querySelector(".pg-card-title")?.textContent,
    cur: document.querySelector(".pg-card-cur")?.textContent,
  }));
  await page.locator('.pg-card-pill[aria-label="Previous"]').click();
  await page.waitForTimeout(900);
  const prevTitle = await page.locator(".pg-card-title").textContent();
  check(
    "next/prev cycle the stage",
    next.title === "Memento Mori" && next.cur === "02" && prevTitle === "Koyomi",
    JSON.stringify(next),
  );

  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.querySelector(".pg-stage")?.style.display === "none",
    null,
    { timeout: 5000 },
  );
  check(
    "Escape closes the stage and clears the hash",
    await page.evaluate(() => window.location.hash === ""),
  );

  check("no page errors on the field", errors.length === 0, errors.join(" | "));
  await page.close();
}

// ---- Deep link ---------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE_URL}/playground/#open-pulse`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => parseFloat(document.querySelector(".pg-card")?.style.opacity || "0") > 0.9,
    null,
    { timeout: 6000 },
  );
  const title = await page.locator(".pg-card-title").textContent();
  check("deep link #open-pulse opens the node", title === "Pulse", `title ${title}`);
  await page.close();
}

// ---- Lab builds (base-path regression) ----------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const slug of LAB_SLUGS) {
    const errors = [];
    const failed = [];
    const onError = (e) => errors.push(e.message);
    const onResponse = (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    };
    page.on("pageerror", onError);
    page.on("response", onResponse);
    const res = await page.goto(`${BASE_URL}/labs/${slug}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const hasContent = await page.evaluate(() => document.body.innerHTML.length > 300);
    page.off("pageerror", onError);
    page.off("response", onResponse);
    check(
      `lab /${slug}/ loads clean`,
      res.status() === 200 && hasContent && errors.length === 0 && failed.length === 0,
      [res.status() !== 200 && `status ${res.status()}`, ...errors, ...failed]
        .filter(Boolean)
        .join(" | "),
    );
  }
  await page.close();
}

// ---- Reduced motion ------------------------------------------------------------
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);

  const t1 = await page.locator('[data-pg-node="koyomi"]').evaluate((el) => el.style.transform);
  await page.waitForTimeout(800);
  const t2 = await page.locator('[data-pg-node="koyomi"]').evaluate((el) => el.style.transform);
  check("reduced motion: nodes do not drift", t1 === t2);

  const dot = await dotCenter(page, "koyomi");
  await page.mouse.move(dot.x, dot.y, { steps: 8 });
  await page.waitForTimeout(600);
  const rmHover = await page.evaluate(() => {
    const node = document.querySelector('[data-pg-node="koyomi"]');
    const video = node?.querySelector(".pg-node-thumb");
    return {
      isHover: node?.classList.contains("is-hover"),
      videoIdle:
        video instanceof HTMLVideoElement &&
        video.paused &&
        !video.getAttribute("src") &&
        !!video.poster,
    };
  });
  check(
    "reduced motion: hover shows the poster, video never plays",
    rmHover.isHover && rmHover.videoIdle,
    JSON.stringify(rmHover),
  );
  await page.close();
}

// ---- Mobile touch surface -------------------------------------------------------
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const cdp = await context.newCDPSession(page);

  // Tap opens directly (no hover tier on coarse pointers).
  const koyomi = await labelCenter(page, "koyomi");
  await page.touchscreen.tap(koyomi.x, koyomi.y);
  await page.waitForFunction(
    () => parseFloat(document.querySelector(".pg-card")?.style.opacity || "0") > 0.9,
    null,
    { timeout: 5000 },
  );
  const mobileTitle = await page.locator(".pg-card-title").textContent();
  check("mobile: tap opens the stage", mobileTitle === "Koyomi", `title ${mobileTitle}`);

  await page.locator(".pg-card-close").click();
  await page.waitForFunction(
    () => document.querySelector(".pg-stage")?.style.display === "none",
    null,
    { timeout: 5000 },
  );
  check("mobile: close button returns to the field", true);

  // Touch drag moves a node without opening it.
  const before = await labelCenter(page, "memento-mori");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: before.x, y: before.y }],
  });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: before.x + i * 12, y: before.y + i * 8 }],
    });
    await page.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(400);
  const after = await labelCenter(page, "memento-mori");
  const moved = Math.hypot(after.x - before.x, after.y - before.y);
  const opened = await page.evaluate(
    () => document.querySelector(".pg-stage")?.style.display !== "none",
  );
  check("mobile: touch drag moves a node without opening", moved > 50 && !opened, `moved ${moved.toFixed(0)}px`);

  // Pinch changes zoom.
  const zoomBefore = await page.locator(".pg-zoom").textContent();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 160, y: 500, id: 0 },
      { x: 230, y: 500, id: 1 },
    ],
  });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: 160 - i * 8, y: 500, id: 0 },
        { x: 230 + i * 8, y: 500, id: 1 },
      ],
    });
    await page.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(600);
  const zoomAfter = await page.locator(".pg-zoom").textContent();
  check("mobile: pinch changes zoom", zoomAfter !== zoomBefore, `${zoomBefore} -> ${zoomAfter}`);

  check("no page errors on mobile", errors.length === 0, errors.join(" | "));
  await context.close();
}

// ---- Short phone viewport (Safari toolbars: ~664px, not 844) -------------------
// Regression for the two real-device bugs: the open pulse stage is SMALLER
// than the hover box here, and Show more shrinks any stage below it — both
// pinned the size-derived progress at 0 and made stage + card invisible.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 664 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE_URL}/playground/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);

  const pulse = await labelCenter(page, "pulse");
  await page.touchscreen.tap(pulse.x, pulse.y);
  let shortOpen = null;
  try {
    await page.waitForFunction(
      () => parseFloat(document.querySelector(".pg-card")?.style.opacity || "0") > 0.9,
      null,
      { timeout: 5000 },
    );
    shortOpen = await page.evaluate(() => ({
      title: document.querySelector(".pg-card-title")?.textContent,
      stageOpacity: parseFloat(document.querySelector(".pg-stage")?.style.opacity || "0"),
      stageW: parseFloat(document.querySelector(".pg-stage")?.style.width || "0"),
    }));
  } catch {
    /* falls through to the failing check */
  }
  check(
    "short viewport: pulse opens with a visible stage",
    !!shortOpen &&
      shortOpen.title === "Pulse" &&
      shortOpen.stageOpacity > 0.9 &&
      shortOpen.stageW > 90,
    JSON.stringify(shortOpen),
  );

  await page.locator(".pg-card-showmore").click();
  await page.waitForTimeout(900);
  const afterMore = await page.evaluate(() => ({
    cardOpacity: parseFloat(document.querySelector(".pg-card")?.style.opacity || "0"),
    stageOpacity: parseFloat(document.querySelector(".pg-stage")?.style.opacity || "0"),
    stageH: parseFloat(document.querySelector(".pg-stage")?.style.height || "0"),
    descVisible: (() => {
      const d = document.querySelector(".pg-card-desc");
      return !!d && d.getBoundingClientRect().height > 20;
    })(),
  }));
  check(
    "short viewport: Show more keeps stage and card visible",
    afterMore.cardOpacity > 0.9 &&
      afterMore.stageOpacity > 0.9 &&
      afterMore.stageH > 90 &&
      afterMore.descVisible,
    JSON.stringify(afterMore),
  );

  await page.locator(".pg-card-close").click();
  await page.waitForFunction(
    () => document.querySelector(".pg-stage")?.style.display === "none",
    null,
    { timeout: 5000 },
  );
  check("short viewport: close returns to the field", true);
  check("no page errors on short viewport", errors.length === 0, errors.join(" | "));
  await context.close();
}

await browser.close();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
