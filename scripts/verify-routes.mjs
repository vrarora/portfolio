// Checks that the static export contains every route the site links to.
// Run after `npm run build`: node scripts/verify-routes.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const routes = [
  "index.html",
  "404.html",
  "work/index.html",
  "work/data-compass/index.html",
  "work/design-repo/index.html",
  "work/equalall/index.html",
  "writing/index.html",
  "admin/notes/index.html",
  "case-studies/data-compass/index.html",
  "case-studies/design-repo/index.html",
  "case-studies/equalall/index.html",
  "playground/index.html",
  "mockups/data-compass/index.html",
  "mockups/equalall/index.html",
  "covers/design-repo/index.html",
];

let failed = false;
for (const route of routes) {
  const path = join(OUT, route);
  if (!existsSync(path)) {
    console.error(`missing ${route}`);
    failed = true;
  }
}

const stub = readFileSync(join(OUT, "case-studies/equalall/index.html"), "utf8");
if (!stub.includes("/work/equalall/")) {
  console.error("case-studies stub does not point at /work/equalall/");
  failed = true;
}

const home = readFileSync(join(OUT, "index.html"), "utf8");
if (home.includes("—")) {
  console.error("home page contains an em dash");
  failed = true;
}

if (failed) process.exit(1);
console.log(`routes ok (${routes.length})`);
