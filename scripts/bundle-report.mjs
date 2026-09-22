// Gzipped first-load JS per prerendered route, read from out/.
// Run after `npm run build`: node scripts/bundle-report.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const OUT = "out";
const pages = ["index.html", "work/index.html", "work/equalall/index.html", "writing/index.html", "playground/index.html"];
const budgets = { "index.html": 130, "work/index.html": 170, "work/equalall/index.html": 260 };

let over = false;
for (const page of pages) {
  const html = readFileSync(join(OUT, page), "utf8");
  // Skip the nomodule polyfill; modern browsers never fetch it.
  const scripts = [...html.matchAll(/<script([^>]*)>/g)]
    .filter((m) => !/nomodule/.test(m[1]))
    .map((m) => /src="([^"]+\.js)"/.exec(m[1])?.[1])
    .filter((src) => typeof src === "string");
  let gz = 0;
  const seen = new Set();
  for (const src of scripts) {
    const rel = src.replace(/^\//, "").split("?")[0];
    if (seen.has(rel)) continue;
    seen.add(rel);
    try {
      gz += gzipSync(readFileSync(join(OUT, rel))).length;
    } catch {
      /* external or missing */
    }
  }
  const kb = Math.round(gz / 1024);
  const budget = budgets[page];
  const flag = budget && kb > budget ? " OVER" : "";
  if (flag) over = true;
  console.log(`${page.padEnd(28)} ${String(kb).padStart(4)} kB gz across ${seen.size} scripts${budget ? ` (budget ${budget})` : ""}${flag}`);
}
if (over) process.exit(1);
