/**
 * Builds the playground lab prototypes into public/labs/<slug>/.
 *
 * Usage:
 *   node scripts/build-labs.mjs            # all labs
 *   node scripts/build-labs.mjs koyomi     # one or more slugs
 *
 * Per slug: shallow-clones the source repo into .labs-src/ (gitignored),
 * builds it with the /labs/<slug>/ base path, replaces public/labs/<slug>/
 * with the fresh output, and records the source commit in .build-info.json.
 * After copying, the emitted index.html is checked for absolute src/href
 * references that escape /labs/<slug>/ (base-path drift fails the run).
 *
 * The built output is committed; this script is run manually when a lab's
 * source repo changes. Requires network access (github.com + npm registry).
 */
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const cloneRoot = join(projectRoot, ".labs-src");
const labsRoot = join(projectRoot, "public", "labs");

const LABS = [
  {
    slug: "koyomi",
    repo: "https://github.com/vrarora/koyomi.git",
    build: (dir) => {
      run("npm", ["ci"], dir);
      run("npx", ["tsc"], dir);
      run("npx", ["vite", "build", "--base=/labs/koyomi/"], dir);
    },
    distDir: "dist",
  },
  {
    slug: "memento-mori",
    repo: "https://github.com/vrarora/memento_mori.git",
    build: (dir) => {
      run("npm", ["ci"], dir);
      run("npx", ["tsc", "--noEmit"], dir);
      run("npx", ["vite", "build", "--base=/labs/memento-mori/"], dir);
    },
    distDir: "dist",
  },
  {
    slug: "pulse",
    repo: "https://github.com/vrarora/ai_finance_app_prototype.git",
    build: (dir) => {
      run("npm", ["ci"], dir);
      run("npx", ["tsc", "-b"], dir);
      run("npx", ["vite", "build", "--base=/labs/pulse/"], dir);
    },
    distDir: "dist",
  },
  {
    slug: "hover-reveal",
    repo: "https://github.com/vrarora/hover_interaction.git",
    // Plain static files (index.html, script.js, styles.css, assets/) with
    // relative references; served as-is, no build step.
    build: () => {},
    distDir: ".",
  },
  {
    slug: "east-is-up",
    repo: "https://github.com/vrarora/top-lore.git",
    build: (dir) => {
      run("npm", ["ci"], dir);
      run("npx", ["tsc", "--noEmit"], dir);
      run("npx", ["vite", "build", "--base=/labs/east-is-up/"], dir);
    },
    distDir: "dist",
  },
  {
    slug: "rolling-paper",
    repo: "https://github.com/vrarora/rolling-paper.git",
    // App is a single self-contained index.html; Three.js + GSAP come from CDN.
    // Download the CDN scripts locally so the recording script works without
    // external network access and so the lab doesn't depend on CDN uptime.
    build: (dir) => {
      run("curl", ["-L", "-o", join(dir, "three.min.js"), "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"], dir);
      run("curl", ["-L", "-o", join(dir, "gsap.min.js"), "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"], dir);
      let html = readFileSync(join(dir, "index.html"), "utf8");
      // Localise CDN scripts
      html = html
        .replace("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "./three.min.js")
        .replace("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", "./gsap.min.js");
      // Match the playground node name (source may still carry the upstream title)
      html = html.replace(/<title>[^<]*<\/title>/, "<title>Rolling Paper</title>");
      // Remove the VX brand / edition HUD elements (not relevant for portfolio context)
      html = html.replace(
        /\s*<div class="hud" id="brand">[\s\S]*?<\/div>\s*\n\s*<div class="hud" id="edition">[\s\S]*?<\/div>/,
        "",
      );
      // Inject async atlas upgrade: replace procedural cards with playground
      // experiment stills (plus two case-study covers to fill the 8-cell atlas).
      const atlasUpgrade = `
        // Replace procedural atlas with playground + case-study images (async).
        (function upgradeAtlasWithImages() {
          var CELL = 512;
          var srcs = [
            "/images/playground/koyomi.webp",
            "/images/playground/memento-mori.webp",
            "/images/playground/pulse.webp",
            "/images/playground/hover-reveal.webp",
            "/images/playground/atmos.webp",
            "/images/playground/east-is-up.webp",
            "/images/equalall/equalall-cover.webp",
            "/images/design-repo/design-repo-cover.webp",
          ];
          var ctx = atlasTex.image.getContext("2d");
          var loaded = 0;
          srcs.forEach(function (src, i) {
            var img = new Image();
            img.onload = function () {
              var x = i * CELL;
              ctx.fillStyle = "#f8f8f8";
              ctx.fillRect(x, 0, CELL, CELL);
              var scale = Math.max(CELL / img.naturalWidth, CELL / img.naturalHeight);
              var dw = img.naturalWidth * scale;
              var dh = img.naturalHeight * scale;
              ctx.drawImage(img, x + (CELL - dw) / 2, (CELL - dh) / 2, dw, dh);
              if (++loaded === srcs.length) {
                atlasTex.needsUpdate = true;
                barrelTex.needsUpdate = true;
                window.__rollPaperReady = true;
              }
            };
            img.onerror = function () {
              if (++loaded === srcs.length) {
                atlasTex.needsUpdate = true;
                barrelTex.needsUpdate = true;
                window.__rollPaperReady = true;
              }
            };
            img.src = src;
          });
        })();`;
      html = html.replace(
        "var barrelTex = atlasTex.clone();",
        atlasUpgrade + "\n        var barrelTex = atlasTex.clone();",
      );
      writeFileSync(join(dir, "index.html"), html);
    },
    distDir: ".",
  },
  {
    slug: "atmos",
    repo: "https://github.com/vrarora/atmos.git",
    build: (dir) => {
      run("npm", ["ci"], dir);
      run("npx", ["tsc", "-b"], dir);
      run("npx", ["vite", "build", "--base=/labs/atmos/"], dir);
    },
    distDir: "dist",
  },
];

function run(command, args, cwd) {
  console.log(`  $ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function cloneFresh(lab) {
  const dir = join(cloneRoot, lab.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(cloneRoot, { recursive: true });
  run("git", ["clone", "--depth=1", lab.repo, dir], projectRoot);
  return dir;
}

function headSha(dir) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: dir, encoding: "utf8" }).trim();
}

function copyOutput(lab, sourceDir) {
  const from = join(sourceDir, lab.distDir);
  const to = join(labsRoot, lab.slug);
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;
    cpSync(join(from, entry.name), join(to, entry.name), { recursive: true });
  }
  return to;
}

function assertBasePaths(lab, outDir) {
  const indexPath = join(outDir, "index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`${lab.slug}: expected ${indexPath} to exist after build`);
  }
  const html = readFileSync(indexPath, "utf8");
  const offenders = [];
  for (const match of html.matchAll(/(?:src|href)="(\/[^"]*)"/g)) {
    const url = match[1];
    if (url === `/labs/${lab.slug}/` || url.startsWith(`/labs/${lab.slug}/`)) continue;
    if (url.startsWith("//")) continue; // protocol-relative, not a local path
    offenders.push(url);
  }
  if (offenders.length > 0) {
    throw new Error(
      `${lab.slug}: index.html references absolute paths outside /labs/${lab.slug}/ ` +
        `(base-path drift):\n  ${offenders.join("\n  ")}`,
    );
  }
}

function buildLab(lab) {
  console.log(`\n=== ${lab.slug} ===`);
  const sourceDir = cloneFresh(lab);
  lab.build(sourceDir);
  const outDir = copyOutput(lab, sourceDir);
  assertBasePaths(lab, outDir);
  writeFileSync(
    join(outDir, ".build-info.json"),
    JSON.stringify({ repo: lab.repo, sha: headSha(sourceDir), builtAt: new Date().toISOString() }, null, 2) + "\n",
  );
  console.log(`  -> public/labs/${lab.slug}/ (sha ${headSha(sourceDir).slice(0, 7)})`);
}

const requested = process.argv.slice(2);
const selected = requested.length
  ? requested.map((slug) => {
      const lab = LABS.find((l) => l.slug === slug);
      if (!lab) throw new Error(`unknown lab slug "${slug}" (known: ${LABS.map((l) => l.slug).join(", ")})`);
      return lab;
    })
  : LABS;

for (const lab of selected) buildLab(lab);
console.log("\nall labs built");
