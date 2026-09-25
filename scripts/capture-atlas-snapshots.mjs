/**
 * Captures frozen DOM snapshots of the Data Atlas product UI.
 *
 * Drives the dc-design app (running at ATLAS_URL, default
 * http://localhost:6174) into each case-study state, then serializes the DOM
 * as static HTML plus one shared stylesheet. No app JavaScript is shipped.
 * The product is renamed "Data Atlas" in every snapshot.
 *
 * Output (public/atlas-snapshots/):
 *   <id>.html    static snapshot, links atlas.css
 *   <id>.json    { width, height, anchors: { name: { x, y, w, h } } }
 *   atlas.css    union of every state's CSS, asset urls rewritten
 *   assets/      fonts and images the snapshots reference
 *   index.json   list of state ids
 *
 * Each snapshot is reopened with JavaScript disabled and screenshotted next
 * to the live state so fidelity can be checked by eye (see CHECK_DIR).
 *
 * Usage: node scripts/capture-atlas-snapshots.mjs [id ...]
 */

import { chromium } from "playwright";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "atlas-snapshots");
const ASSET_DIR = join(OUT_DIR, "assets");
const APP_URL = (process.env.ATLAS_URL ?? "http://localhost:6174").replace(/\/$/, "");
const CHECK_DIR =
  process.env.ATLAS_CHECK_DIR ??
  "/private/tmp/claude-501/-Users-vaibhavarora-Port-3--claude-worktrees-new-session-2f2539/893f33c1-20ae-4e89-9c50-4b546c363977/scratchpad/atlas-check";

const VIEWPORT = { width: 1440, height: 900 };
const GEIST_MONO_HREF = "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap";

/* ── Browser helpers ── */

async function settle(page, ms = 1000) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

async function open(page, path) {
  await page.goto(APP_URL + path, { waitUntil: "networkidle" });
  await settle(page);
}

async function openPicker(page) {
  await open(page, "/assets");
  await page.getByRole("button", { name: /Add Asset/i }).first().click();
  await page.locator(".dc-conn__list").waitFor();
  await settle(page, 800);
}

/* A tooltip portal sits over the cards, so the click is forced. */
async function openPostgresWizard(page) {
  await openPicker(page);
  await page.locator(".dc-conn-card", { hasText: "PostgreSQL" }).first().click({ force: true });
  await page.locator('[aria-label="Add asset steps"]').waitFor();
  await settle(page, 600);
}

async function pickOption(page, triggerLabel, optionName) {
  await page.getByRole("combobox", { name: triggerLabel, exact: true }).click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
  await page.waitForTimeout(400);
}

async function fillConfigure(page) {
  await pickOption(page, "Domain name", "Retail & E-Commerce");
  await pickOption(page, "Subdomain name", "Marketing & Loyalty");
  await pickOption(page, "Environment", "Production");
  await page.locator("#dc-aa-name").fill("loyalty_members");
  await page.locator("#dc-aa-label").fill("Loyalty Members");
  await page.locator("#dc-aa-desc").fill("Cardholder loyalty tiers, points balances and reward redemptions.");
}

/* The app's first check run fails on purpose, so the checks run twice. */
async function passConnectStep(page) {
  await page.getByRole("button", { name: "Save and continue" }).click();
  await page.locator("#dc-aa-host").waitFor();
  await page.locator("#dc-aa-host").fill("db.internal.penguinbank.com");
  await page.locator("#dc-aa-port").fill("5432");
  await page.locator("#dc-aa-db").fill("loyalty_core");
  await page.locator("#dc-aa-pw").fill("demo-password");
  await page.getByRole("button", { name: "Run checks and continue" }).click();
  await page.getByRole("button", { name: "Re-run checks" }).click({ timeout: 10000 });
  await page.getByRole("button", { name: "Continue", exact: true }).click({ timeout: 10000 });
  await page.locator("#dc-run-discovery").waitFor();
}

const TREE_PATH = ["retail", "retail-customer", "retail-customer-ds-postgres", "customer_profiles"];

/* The tree ends at the asset; database, schema and table open from the main table. */
async function openExploreTable(page) {
  await open(page, "/explore");
  for (const value of TREE_PATH) {
    await page.locator(`[role=treeitem][data-value="${value}"]`).click();
    await page.waitForTimeout(800);
  }
  for (let depth = 0; depth < 3; depth++) {
    await page.locator("table tbody tr").first().locator("button.dc-node-link").click();
    await page.waitForTimeout(900);
  }
  await page.locator("table thead th", { hasText: "Actions" }).waitFor();
}

/* ── In-page anchor helpers (serialized into page.evaluate) ── */

const PAGE_HELPERS = String.raw`
  const box = (r) => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
  const clip = (a, b) => {
    const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
    const r = Math.min(a.x + a.w, b.x + b.w), btm = Math.min(a.y + a.h, b.y + b.h);
    return { x, y, w: Math.max(0, r - x), h: Math.max(0, btm - y) };
  };

  /* The part of a box left visible by clipping ancestors and the viewport. */
  const visible = (el, r) => {
    let out = clip(r, { x: 0, y: 0, w: innerWidth, h: innerHeight });
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX !== "visible" || cs.overflowY !== "visible") out = clip(out, box(a.getBoundingClientRect()));
    }
    return out;
  };
  const rectOf = (el) => (el ? visible(el, box(el.getBoundingClientRect())) : null);
  const textRect = (el) => {
    if (!el) return null;
    const text = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 3) }).nextNode();
    const range = document.createRange();
    range.selectNodeContents(text ?? el);
    return visible(el, box(range.getBoundingClientRect()));
  };
  const byText = (selector, text, root = document) =>
    [...root.querySelectorAll(selector)].find((el) => el.textContent.trim() === text) ?? null;
  const steps = () => [...document.querySelectorAll('[aria-label="Add asset steps"] > li')];
`;

function anchorsIn(page, body) {
  return page.evaluate(`(() => { ${PAGE_HELPERS}\n ${body} })()`);
}

const SCAN_ANCHORS = `
  const cells = [...document.querySelectorAll("table tbody td")];
  const chip = document.querySelector('table tbody td [data-slot="tag"]');
  return {
    discoveryLabel: textRect(cells.find((td) => /^(Discovery|Metadata Workflow)$/.test(td.textContent.trim()))),
    classificationLabel: textRect(cells.find((td) => /^(Classification|Profiler Workflow)$/.test(td.textContent.trim()))),
    schedule: rectOf(chip),
  };
`;

/* ── States ── */

const STATES = [
  {
    // The plain assets page, used for the case study's cover and preview images
    id: "assets",
    async reach(page) {
      await open(page, "/assets");
    },
    anchors: `return {};`,
  },
  {
    id: "picker",
    async reach(page) {
      await openPicker(page);
      await page.evaluate(() => {
        const list = document.querySelector(".dc-conn__list");
        const head = document.querySelector(".dc-conn__section-head");
        const offset = head.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
        list.scrollTop = Math.max(0, offset - list.clientHeight * 0.62);
      });
      await page.waitForTimeout(400);
    },
    anchors: `
      return {
        available: rectOf(document.querySelector(".dc-conn__list > .dc-conn__grid")),
        premiumHeading: rectOf(document.querySelector("#dc-conn-premium").closest('[data-slot="brand-frame"]')),
        search: rectOf(document.querySelector('input[aria-label="Search connectors"]').closest('[data-slot="input-wrap"]')),
      };
    `,
  },
  {
    id: "add-configure",
    async reach(page) {
      await openPostgresWizard(page);
      await fillConfigure(page);
    },
    anchors: `
      const [a, b, c] = steps();
      return { step1: rectOf(a.querySelector(".ap-stepper__head")), step2: rectOf(b.querySelector(".ap-stepper__head")), step3: rectOf(c.querySelector(".ap-stepper__head")) };
    `,
  },
  {
    id: "add-scans",
    async reach(page) {
      await openPostgresWizard(page);
      await fillConfigure(page);
      await passConnectStep(page);
    },
    anchors: `
      return { scanToggle: rectOf(document.querySelector("#dc-run-discovery")), step3: rectOf(steps()[2].querySelector(".ap-stepper__head")) };
    `,
  },
  {
    id: "scans-after",
    async reach(page) {
      await open(page, "/assets/merchant_master");
    },
    anchors: SCAN_ANCHORS,
  },
  {
    id: "scans-before",
    async reach(page) {
      await open(page, "/assets/merchant_master");
      await page.evaluate(() => {
        const OLD = { Discovery: "Metadata Workflow", Classification: "Profiler Workflow" };
        for (const td of document.querySelectorAll("table tbody td")) {
          const text = td.textContent.trim();
          if (!(text in OLD)) continue;
          const walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) n.nodeValue = n.nodeValue.replace(text, OLD[text]);
        }
        for (const row of document.querySelectorAll("table tbody tr[aria-label]")) {
          const label = row.getAttribute("aria-label");
          for (const [from, to] of Object.entries(OLD)) if (label.startsWith(from)) row.setAttribute("aria-label", label.replace(from, to));
        }
        document.querySelector('table tbody td [data-slot="tag"]').textContent = "0 9 * * 1";
      });
    },
    anchors: SCAN_ANCHORS,
  },
  {
    id: "explore-root",
    async reach(page) {
      await open(page, "/explore");
    },
    anchors: `
      return {
        plusChip: rectOf(document.querySelector('button[aria-label$="more data sources"]')),
        tree: rectOf(document.querySelector('[data-slot="tree-pane"]')),
      };
    `,
  },
  {
    id: "explore-tree",
    async reach(page) {
      await openExploreTable(page);
    },
    anchors: `
      const out = {};
      ["my-org", ...${JSON.stringify(TREE_PATH)}].forEach((v, i) => {
        out["node" + i] = rectOf(document.querySelector('[role=treeitem][data-value="' + v + '"]'));
      });
      out.column = rectOf(document.querySelector("table tbody tr"));
      return out;
    `,
  },
  {
    id: "info-panel",
    async reach(page) {
      await openExploreTable(page);
      await page.locator("table tbody tr").first().click({ position: { x: 300, y: 10 } });
      await page.getByText(/^About /).first().waitFor();
    },
    anchors: `
      let panel = [...document.querySelectorAll("*")].find((el) => el.children.length === 0 && /^About /.test(el.textContent.trim()));
      while (panel && panel.parentElement && !panel.textContent.includes("History")) panel = panel.parentElement;
      const p = rectOf(panel);
      const row = rectOf(document.querySelector("table tbody tr"));
      return { panel: p, column: { ...row, w: Math.min(row.w, p.x - row.x) } };
    `,
  },
];

/* ── In-page freeze: rename, strip tooling, freeze state ── */

function freezeInPage() {
  const report = { leaks: [], scrolls: 0, canvases: 0 };

  /* Rename the product. */
  const rename = (s) => s.replace(/Data Compass/g, "Data Atlas");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeValue.includes("Data Compass")) n.nodeValue = rename(n.nodeValue);
  }
  for (const attr of ["title", "aria-label", "alt", "placeholder"]) {
    for (const el of document.querySelectorAll(`[${attr}*="Data Compass"]`)) el.setAttribute(attr, rename(el.getAttribute(attr)));
  }
  document.title = rename(document.title);

  /* Neutral brand glyph: a globe with one meridian. */
  for (const mark of document.querySelectorAll("svg.dc-mark")) {
    const glyph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    glyph.setAttribute("width", "24");
    glyph.setAttribute("height", "24");
    glyph.setAttribute("viewBox", "0 0 24 24");
    glyph.setAttribute("fill", "none");
    glyph.setAttribute("stroke", "currentColor");
    glyph.setAttribute("stroke-width", "1.6");
    glyph.setAttribute("aria-hidden", "true");
    glyph.setAttribute("class", "atlas-mark");
    glyph.innerHTML = '<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.6" ry="8.5"/><path d="M3.5 12h17"/>';
    mark.replaceWith(glyph);
  }

  /* Strip dev tooling and scripts. */
  const tooling = "[data-agentation-root], [data-agentation-toolbar], [data-feedback-toolbar], script";
  for (const el of document.querySelectorAll(tooling)) el.remove();
  for (const el of document.querySelectorAll("[data-vite-dev-id]")) el.removeAttribute("data-vite-dev-id");

  /* Neutralise other brand names in visible text and attributes. */
  const LEAK = /IDfy|Privy|Aperture/gi;
  const leakWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = leakWalker.nextNode(); n; n = leakWalker.nextNode()) {
    if (!LEAK.test(n.nodeValue)) continue;
    report.leaks.push(n.nodeValue.trim().slice(0, 80));
    n.nodeValue = n.nodeValue.replace(LEAK, "Atlas");
  }
  for (const el of document.body.querySelectorAll("*")) {
    for (const a of ["title", "aria-label", "alt", "placeholder"]) {
      const v = el.getAttribute(a);
      if (v && /IDfy|Privy|Aperture/i.test(v)) {
        report.leaks.push(`[${a}] ${v.slice(0, 80)}`);
        el.setAttribute(a, v.replace(LEAK, "Atlas"));
      }
    }
  }

  /* Canvas becomes a static image. */
  for (const canvas of document.querySelectorAll("canvas")) {
    const img = document.createElement("img");
    const r = canvas.getBoundingClientRect();
    try {
      img.src = canvas.toDataURL("image/png");
    } catch {
      continue;
    }
    for (const a of canvas.attributes) if (a.name !== "width" && a.name !== "height") img.setAttribute(a.name, a.value);
    img.setAttribute("width", String(Math.round(r.width)));
    img.setAttribute("height", String(Math.round(r.height)));
    img.style.width = `${r.width}px`;
    img.style.height = `${r.height}px`;
    canvas.replaceWith(img);
    report.canvases++;
  }

  /* Form state becomes markup. */
  for (const input of document.querySelectorAll("input")) {
    if (input.type === "checkbox" || input.type === "radio") input.toggleAttribute("checked", input.checked);
    else if (input.type !== "file") input.setAttribute("value", input.value);
  }
  for (const ta of document.querySelectorAll("textarea")) ta.textContent = ta.value;
  for (const opt of document.querySelectorAll("option")) opt.toggleAttribute("selected", opt.selected);

  /* Scroll offsets become attributes for the host page to restore. */
  for (const el of document.body.querySelectorAll("*")) {
    if (el.scrollTop) el.setAttribute("data-snap-scroll-top", String(Math.round(el.scrollTop)));
    if (el.scrollLeft) el.setAttribute("data-snap-scroll-left", String(Math.round(el.scrollLeft)));
    if (el.scrollTop || el.scrollLeft) report.scrolls++;
  }

  return report;
}

/* ── In-page serialization: CSS and HTML, with asset urls collected ── */

function serializeInPage(appOrigin) {
  const urls = new Set();
  const toLocal = (raw) => {
    let u;
    try {
      u = new URL(raw, location.href);
    } catch {
      return raw;
    }
    if (u.origin !== appOrigin) return raw;
    urls.add(u.pathname);
    return "assets" + u.pathname;
  };
  const rewriteCssUrls = (css) =>
    css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, ref) =>
      ref.startsWith("data:") || ref.startsWith("#") ? m : `url("${toLocal(ref)}")`,
    );

  /* Stylesheets outside body. <style> text is kept verbatim unless the CSSOM
     holds extra runtime rules, in which case the CSSOM is serialized. */
  const blocks = [];
  const imports = [];
  for (const sheet of document.styleSheets) {
    const owner = sheet.ownerNode;
    if (owner && document.body.contains(owner)) continue;
    let rules;
    try {
      rules = [...sheet.cssRules];
    } catch {
      continue;
    }
    let text = null;
    if (owner && owner.tagName === "STYLE") {
      const probe = new CSSStyleSheet();
      const raw = owner.textContent.replace(/@import[^;]+;/g, "");
      try {
        probe.replaceSync(raw);
        const nonImport = rules.filter((r) => !(r instanceof CSSImportRule)).length;
        if (probe.cssRules.length === nonImport) text = raw;
      } catch {
        text = null;
      }
    }
    for (const r of rules) if (r instanceof CSSImportRule) imports.push(r.href);
    if (text === null) text = rules.filter((r) => !(r instanceof CSSImportRule)).map((r) => r.cssText).join("\n");
    text = text
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();
    if (text) blocks.push(rewriteCssUrls(text));
  }
  for (const sheet of document.adoptedStyleSheets ?? []) {
    blocks.push(rewriteCssUrls([...sheet.cssRules].map((r) => r.cssText).join("\n")));
  }

  /* Asset references in markup. */
  for (const el of document.body.querySelectorAll("[src]")) {
    const v = el.getAttribute("src");
    if (!v.startsWith("data:")) el.setAttribute("src", toLocal(v));
  }
  for (const el of document.body.querySelectorAll("[srcset]")) {
    el.setAttribute(
      "srcset",
      el
        .getAttribute("srcset")
        .split(",")
        .map((part) => {
          const [ref, ...rest] = part.trim().split(/\s+/);
          return [toLocal(ref), ...rest].join(" ");
        })
        .join(", "),
    );
  }
  for (const el of document.body.querySelectorAll("image[href], use[href], link[href]")) {
    const v = el.getAttribute("href");
    if (!v.startsWith("#") && !v.startsWith("data:")) el.setAttribute("href", toLocal(v));
  }
  for (const el of document.body.querySelectorAll("[style*='url(']")) {
    el.setAttribute("style", rewriteCssUrls(el.getAttribute("style")));
  }

  const attrs = (el) =>
    [...el.attributes]
      .map((a) => ` ${a.name}="${a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`)
      .join("");

  return {
    htmlAttrs: attrs(document.documentElement),
    bodyAttrs: attrs(document.body),
    bodyHTML: document.body.innerHTML,
    title: document.title,
    blocks,
    imports,
    urls: [...urls],
  };
}

/* ── Static server for verification ── */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function serveDir(dir) {
  const server = createServer(async (req, res) => {
    const path = join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!path.startsWith(dir)) return res.writeHead(403).end();
    try {
      const body = await readFile(path);
      res.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

/* ── Main ── */

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function documentFor(snap) {
  return [
    "<!doctype html>",
    `<html${snap.htmlAttrs}>`,
    "<head>",
    '<meta charset="utf-8">',
    `<title>${escapeHtml(snap.title)}</title>`,
    '<link rel="stylesheet" href="atlas.css">',
    `<link rel="stylesheet" href="${GEIST_MONO_HREF.replace(/&/g, "&amp;")}">`,
    "</head>",
    `<body${snap.bodyAttrs}>${snap.bodyHTML}</body>`,
    "</html>",
    "",
  ].join("\n");
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const states = only.size ? STATES.filter((s) => only.has(s.id)) : STATES;
  if (!states.length) throw new Error(`No states match: ${[...only].join(", ")}`);

  await mkdir(ASSET_DIR, { recursive: true });
  await mkdir(CHECK_DIR, { recursive: true });

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const appOrigin = new URL(APP_URL).origin;

  const cssBlocks = new Map();
  const assetPaths = new Set();
  const results = [];

  for (const state of states) {
    process.stdout.write(`• ${state.id} … `);
    await state.reach(page);

    /* Close hovers, drop focus rings, let motion settle. */
    await page.mouse.move(VIEWPORT.width - 1, VIEWPORT.height - 1);
    await page.evaluate(() => document.activeElement?.blur?.());
    await page.waitForTimeout(800);
    await settle(page, 1000);

    const report = await page.evaluate(freezeInPage);
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(CHECK_DIR, `${state.id}-live.png`) });

    const anchors = await anchorsIn(page, state.anchors);
    const snap = await page.evaluate(serializeInPage, appOrigin);

    for (const block of snap.blocks) if (!cssBlocks.has(block)) cssBlocks.set(block, cssBlocks.size);
    for (const u of snap.urls) assetPaths.add(u);
    const foreignImports = snap.imports.filter((href) => href !== GEIST_MONO_HREF);
    if (foreignImports.length) console.warn(`\n  unhandled @import: ${foreignImports.join(", ")}`);

    await writeFile(join(OUT_DIR, `${state.id}.html`), documentFor(snap));
    await writeFile(join(OUT_DIR, `${state.id}.json`), JSON.stringify({ ...VIEWPORT, anchors }, null, 2) + "\n");

    const missing = Object.entries(anchors).filter(([, r]) => !r || !r.w || !r.h).map(([k]) => k);
    results.push({ id: state.id, anchors: Object.keys(anchors), missing, ...report });
    console.log(`anchors ${Object.keys(anchors).join(", ")}${missing.length ? ` (empty: ${missing.join(", ")})` : ""}`);
  }

  /* A partial run keeps the stylesheet blocks that other states contributed. */
  let css = [...cssBlocks.keys()].join("\n\n");
  if (only.size) {
    try {
      const prior = await readFile(join(OUT_DIR, "atlas.css"), "utf8");
      const missingBlocks = [...cssBlocks.keys()].filter((b) => !prior.includes(b));
      css = missingBlocks.length ? `${prior}\n\n${missingBlocks.join("\n\n")}` : prior;
    } catch {
      /* No prior stylesheet. */
    }
  }
  await writeFile(join(OUT_DIR, "atlas.css"), css + "\n");

  for (const path of assetPaths) {
    const res = await page.request.get(APP_URL + path);
    if (!res.ok()) {
      console.warn(`  asset ${path} → ${res.status()}`);
      continue;
    }
    const dest = join(ASSET_DIR, path);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, await res.body());
  }

  const ids = STATES.map((s) => s.id);
  await writeFile(join(OUT_DIR, "index.json"), JSON.stringify(ids, null, 2) + "\n");

  /* Verify: reopen each snapshot without JavaScript and screenshot it. */
  const server = await serveDir(OUT_DIR);
  const base = `http://127.0.0.1:${server.address().port}`;
  const staticContext = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  for (const { id } of results) {
    await staticPage.goto(`${base}/${id}.html`, { waitUntil: "networkidle" });
    await staticPage.evaluate(async () => {
      await document.fonts.ready;
      for (const el of document.querySelectorAll("[data-snap-scroll-top], [data-snap-scroll-left]")) {
        el.scrollTop = Number(el.getAttribute("data-snap-scroll-top") ?? 0);
        el.scrollLeft = Number(el.getAttribute("data-snap-scroll-left") ?? 0);
      }
    });
    await staticPage.waitForTimeout(1200);
    await staticPage.screenshot({ path: join(CHECK_DIR, `${id}-snap.png`) });
  }
  server.close();
  await browser.close();

  console.log("\nSummary");
  for (const r of results) {
    const leaks = r.leaks.length ? ` leaks neutralised: ${JSON.stringify(r.leaks)}` : "";
    console.log(`  ${r.id}: scrolls ${r.scrolls}, canvases ${r.canvases}${leaks}`);
  }
  console.log(`  css blocks ${cssBlocks.size}, assets ${assetPaths.size}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
