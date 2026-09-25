/**
 * Exports the illustrations shown in the Agentic Design case study.
 *
 * SVGs come from the style sheets in the Privy repo, with CSS variables and
 * class styles resolved into attributes so each file renders on its own.
 * Gemini outputs become small webp thumbnails.
 *
 *   node scripts/export-agentic-art.mjs [path/to/Privy]
 *
 * Writes public/agentic/art/*.svg and public/agentic/gemini/*.webp.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import ffmpeg from "ffmpeg-static";
import { chromium } from "playwright";

const privy = process.argv[2] ?? path.join(os.homedir(), "Privy");
const brand = path.join(privy, "docs", "brand");
const gemini = path.join(os.homedir(), "Downloads", "Privy Illustration");
const out = path.join(process.cwd(), "public", "agentic");

/** Sheet, SVG index on that sheet, output name. */
const PICKS = [
  ["style-directions", 2, "direction-1-geometric"],
  ["style-directions", 5, "direction-2-fine-line"],
  ["style-directions", 8, "direction-3-isometric"],
  ["style-directions", 11, "direction-4-layered"],
  ["style-directions", 14, "direction-5-data-form"],
  ["style-directions", 17, "direction-6-duotone"],
  ["soft-stack-locked", 0, "soft-stack-anatomy"],
  ["soft-stack-locked", 9, "meaning-neutral"],
  ["soft-stack-locked", 10, "meaning-brand"],
  ["soft-stack-locked", 11, "meaning-success"],
  ["soft-stack-locked", 12, "meaning-error"],
  ["soft-stack-locked", 13, "meaning-warning"],
  ["soft-stack-locked", 14, "meaning-info"],
  ["soft-stack-locked", 19, "proof-connections-empty"],
  ["soft-stack-locked", 21, "proof-revoked"],
];

/** Paint properties copied from computed style when an attribute uses var() or a class sets them. */
const PAINT = ["fill", "stroke", "stroke-width", "stop-color", "stop-opacity", "flood-color", "flood-opacity", "opacity", "fill-opacity", "stroke-opacity"];
const TEXT = ["font-family", "font-size", "font-weight", "letter-spacing"];

function serialise({ index, paint, text }) {
  const source = document.querySelectorAll("svg")[index];
  const clone = source.cloneNode(true);
  const originals = [source, ...source.querySelectorAll("*")];
  const copies = [clone, ...clone.querySelectorAll("*")];
  originals.forEach((el, i) => {
    const copy = copies[i];
    const style = getComputedStyle(el);
    for (const prop of paint) {
      const attr = copy.getAttribute(prop);
      if ((attr && attr.includes("var(")) || el.hasAttribute("class")) copy.setAttribute(prop, style.getPropertyValue(prop));
    }
    if (el.tagName === "text") for (const prop of text) copy.setAttribute(prop, style.getPropertyValue(prop));
    const inline = copy.getAttribute("style");
    if (inline?.includes("var(")) copy.removeAttribute("style");
    copy.removeAttribute("class");
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.removeAttribute("role");
  return clone.outerHTML.replace(/<!--[\s\S]*?-->/g, "");
}

mkdirSync(path.join(out, "art"), { recursive: true });
mkdirSync(path.join(out, "gemini"), { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
let loaded = "";
for (const [sheet, index, name] of PICKS) {
  if (loaded !== sheet) {
    await page.goto(`file://${path.join(brand, `${sheet}.html`)}`, { waitUntil: "networkidle" });
    loaded = sheet;
  }
  const svg = await page.evaluate(serialise, { index, paint: PAINT, text: TEXT });
  writeFileSync(path.join(out, "art", `${name}.svg`), svg);
}
await browser.close();

const rounds = readdirSync(gemini, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
let n = 0;
for (const round of rounds) {
  for (const file of readdirSync(path.join(gemini, round)).filter((f) => f.endsWith(".png")).sort()) {
    n += 1;
    const dest = path.join(out, "gemini", `gemini-${String(n).padStart(2, "0")}.webp`);
    execFileSync(ffmpeg, ["-loglevel", "error", "-y", "-i", path.join(gemini, round, file), "-vf", "scale=320:-2", "-c:v", "libwebp", "-quality", "80", dest]);
  }
}

console.log(`${PICKS.length} SVGs and ${n} Gemini thumbnails written to ${out}`);
