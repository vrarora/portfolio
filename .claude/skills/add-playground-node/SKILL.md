---
name: add-playground-node
description: >-
  Add a new experiment, prototype, side project, or lab to the /playground
  constellation page of this portfolio. Use this whenever the user wants to
  feature another project on the playground, points you at a GitHub repo (or a
  deployed URL) to add as a node, says things like "add X to the playground",
  "put my new project on the field", "add another lab", or "how do we get <repo>
  onto the playground" — even if they don't name the exact files. It drives the
  full pipeline: a same-domain static build under public/labs/<slug>/, a recorded
  preview loop + poster under public/playground/<slug>/, and one node in
  src/content/playground.ts, then verification.
---

# Add a node to the /playground constellation

The playground (`/playground`) is a drifting particle field where each node is
one design experiment. Hovering grows a node into a living muted video preview;
clicking opens a media stage with an info card and an "Open live ↗" link to a
static build hosted same-domain under `/labs/<slug>/`. Adding a project means
producing **three artifacts** and verifying them:

1. **Static live build** → `public/labs/<slug>/` (what "Open live ↗" opens)
2. **Preview loop + poster** → `public/playground/<slug>/preview.mp4` + `poster.webp`
3. **One node** → an entry in `src/content/playground.ts`

The engine, skin, and pipeline are documented in
`src/components/playground/README.md`; the human-facing (non-coder) version of
this procedure is `src/components/playground/ADDING-A-NODE.md`. This skill is the
operational version with the gotchas that actually bite.

Before starting, pick a **slug**: short, lowercase, hyphenated (e.g. `ripple-clock`).
It becomes the folder names, the URL `/labs/<slug>/`, the node `id`, and the deep
link `/playground/#open-<slug>`.

---

## Step 1 — Build the live prototype into `public/labs/<slug>/`

Add one entry to the `LABS` array near the top of `scripts/build-labs.mjs`. Match
the closest existing entry by build type:

- **Vite + TypeScript** (most common) — copy the `pulse`/`koyomi` shape:
  ```js
  {
    slug: "<slug>",
    repo: "https://github.com/<owner>/<repo>.git",
    build: (dir) => {
      run("npm", ["ci"], dir);
      run("npx", ["tsc", "-b"], dir);        // or ["tsc"] / ["tsc", "--noEmit"] — match the repo's build script
      run("npx", ["vite", "build", `--base=/labs/<slug>/`], dir);
    },
    distDir: "dist",
  }
  ```
  Read the repo's `package.json` `"build"` script first and mirror its exact
  typecheck step (`tsc -b` vs `tsc` vs `tsc --noEmit`). **The `--base=/labs/<slug>/`
  flag is load-bearing** — it is what makes every asset resolve under the subpath.
- **Plain static files** (index.html + css/js, no build) — copy the `hover-reveal`
  entry: `build: () => {}`, `distDir: "."`.

Then run (needs network — it shallow-clones into gitignored `.labs-src/`):
```
node scripts/build-labs.mjs <slug>
```

The script builds, replaces `public/labs/<slug>/`, writes `.build-info.json` (repo
+ HEAD sha), and **fails loudly if the emitted `index.html`/CSS references any
absolute path outside `/labs/<slug>/`** (the base-path drift guard). If it fails,
the `--base` flag is wrong/missing or the app hardcodes absolute asset URLs.

Verify the output paths are all subpath-relative:
```
grep -oE '(src|href)="[^"]*"' public/labs/<slug>/index.html
```
Every ref should start with `/labs/<slug>/` (watch specifically for absolute
`/fonts/…` or `/assets/…` preloads — Vite rewrites them, but confirm).

If the project is hosted elsewhere instead, skip this step and use that URL as
`liveUrl` in Step 3 (but same-domain `/labs/` builds are the norm — zero hosting
cost, no iframe).

## Step 2 — Record the preview loop into `public/playground/<slug>/`

Add an entry to the `LABS` array in `scripts/record-lab-previews.mjs`. Shape:
```js
{
  slug: "<slug>",
  viewport: { width: 390, height: 844 },   // portrait phone/app; use 1280×800 for a landscape web page
  orientation: "portrait",                 // "portrait" | "landscape" — drives the ffmpeg scale + poster resize
  async run(page, t0) {
    await page.goto(`http://localhost:${PORT}/labs/<slug>/`, { waitUntil: "load" });
    await page.waitForSelector("<a real settled selector>", { state: "visible" });
    await page.waitForTimeout(2500);        // let network/shaders/animation warm up before filming
    const clipStartMs = Date.now() - t0;    // the 10s clip window starts here
    await page.waitForTimeout(900);
    const posterBuffer = await page.screenshot({ type: "png" });  // capture the poster on the best still frame
    // ...drive the signature interaction so the loop shows the thing that makes it special...
    return { clipStartMs, posterBuffer };
  },
}
```

Read the cloned source in `.labs-src/<slug>/` to find real selectors and the one
interaction worth filming. The clip is **10 seconds**; make it show the project's
signature move, not a static screen. Never touch sound UI (the browser launches
`--mute-audio` and videos ship muted).

**Deterministic-vs-signature tradeoff (learned on Atmos):** apps often expose
query-param scene forcing or deep links (`?scene=…`, `#/26`) for a repeatable
pretty capture. Use them when the pretty state is otherwise random — BUT if forcing
a state *pins* the visuals, it can disable the very interaction you want to film
(Atmos's `?scene=` pins the sky, killing the time-travel scrub). When the signature
interaction is the point, drive the real app and let the interaction produce the
beauty; capture the poster mid-interaction on a great frame.

Then run:
```
env -u PLAYWRIGHT_BROWSERS_PATH node scripts/record-lab-previews.mjs <slug>
```
It serves `public/` on :8123, records via Playwright, transcodes a 10s H.264 loop
(portrait → scaled to height 960, landscape → width 960) and a WebP poster. **It
throws if the mp4 exceeds 2.5 MB** — calm/shorten the beats if so.

**Review the frames before trusting it.** Extract a few and actually look:
```
FF=$(node -e "import('ffmpeg-static').then(m=>process.stdout.write(m.default))")
"$FF" -i public/playground/<slug>/preview.mp4 2>&1 | grep -oE '[0-9]{2,4}x[0-9]{2,4}'   # note the real dims
for t in 0.5 4 8; do "$FF" -y -ss $t -i public/playground/<slug>/preview.mp4 -frames:v 1 /tmp/f$t.png 2>/dev/null; done
```
Then Read `/tmp/f*.png` and the `poster.webp` to confirm the app loaded (not a
blank/error state), the interaction is visible, and the poster is a strong still.

## Step 3 — Add the node to `src/content/playground.ts`

Append one object to `playgroundNodes` (copy an existing one). Fields:

| Field | Value |
| --- | --- |
| `id` | The slug. Also the deep link `#open-<id>`. |
| `title` | Display name, e.g. `"Ripple Clock"`. |
| `index` | Decorative 4-digit string under the label, e.g. `"2741"`. Pick any unused number. |
| `category` | 2–3 word type label, e.g. `"Interaction study"`, `"Weather instrument"`. |
| `year` | e.g. `"2026"`. |
| `description` | 2–4 sentences for the card. Editorial voice. **No em dashes** (hard project rule — rewrite with commas/periods). |
| `type` | `"video"` (normal) or `"image"` (a still only). |
| `src` | `"/playground/<slug>/preview.mp4"`. |
| `poster` | `"/playground/<slug>/poster.webp"`. |
| `aspectRatio` | **width / height of the ACTUAL recorded mp4**, not the viewport. A 390×844 portrait viewport transcodes to `444 / 960`; a 1280×800 landscape to `960 / 600`. Confirm with the `ffmpeg -i` dims from Step 2. |
| `home` | Resting position `[x, y]` as field fractions (0 = left/top, 1 = right/bottom). See placement rule below. |
| `z` | Depth `-0.6` (far, smaller, dimmer threads) to `0.6` (near, bigger). Vary it from neighbours so the field reads layered. |
| `liveUrl` | `"/labs/<slug>/"` (or the external URL from Step 1). |
| `objectPosition` | Optional. Only if the hover-box crop cuts the wrong part — e.g. `"center top"`. Omit otherwise. |

### Placement rule (this is a real bug, not a nicety)

The engine seeds the cursor at **viewport centre** on load, so a node resting at
roughly the field centre (`x ≈ 0.5` AND `y ≈ 0.45–0.50` together) **auto-hovers
and expands on page load** until the user moves the mouse. Keep new nodes clear of
that centre point. Check the current occupancy first (`grep -E 'id:|home:'
src/content/playground.ts`) and pick an open pocket. As of the last five nodes:
koyomi `[0.22,0.2]`, memento-mori `[0.76,0.24]`, pulse `[0.32,0.74]`,
hover-reveal `[0.7,0.68]`, atmos `[0.5,0.66]`. Lower-centre and the vertical
mid-edges are safe; dead centre is not.

## Step 4 — Verify against a production build

```
npm run typecheck
npm run build
(cd out && python3 -m http.server 8788 &)
env -u PLAYWRIGHT_BROWSERS_PATH BASE_URL=http://localhost:8788 node scripts/verify-playground.mjs
```

`verify-playground.mjs` **auto-derives** the expected node count from
`playground.ts` and the lab slugs from `public/labs/`, so adding a node needs no
test edits — it should now assert N nodes, `/labs/<slug>/` loading clean, and the
card counter reading `/0N`. Everything must pass.

Then confirm visually. Prefer the `run`/preview tools if available, else drive
Playwright against `:8788` (nodes drift, so screen coords go stale — hover then
click the grown box, or open deterministically via `/playground/#open-<slug>`).
Screenshot the field (confirm the new node is placed well and **nothing
auto-hovers on load**) and the open stage (right title/category, video plays, the
"Open live ↗" href is `/labs/<slug>/`). Optionally run
`scripts/audit-playground.mjs` for steady-state captures.

## Step 5 — Commit

Stage everything the steps produced and commit:
```
git add scripts/build-labs.mjs scripts/record-lab-previews.mjs \
        src/content/playground.ts public/labs/<slug> public/playground/<slug>
```
The committed static build + preview assets are intentional (labs are served from
the repo). **Never add a `Co-Authored-By` trailer** (project rule). If the user
asked to push, push; otherwise leave it staged/committed and say so. Update
`handoff.md` with the new node after it lands (also a standing project rule).

---

## Failure modes worth knowing

- **`sharp` dies with "Could not load … darwin-arm64"** after any `npm install`:
  `npm install --include=optional sharp` restores the optional binary. `ffmpeg-static`
  is already a devDependency; the record script resolves its path via
  `import('ffmpeg-static')`.
- **Playwright can't find its browser** (esp. in a sandbox): always prefix record/
  verify commands with `env -u PLAYWRIGHT_BROWSERS_PATH`, and run outside any
  restrictive sandbox (git clone + browser launch need full permissions).
- **Base-path drift guard fails**: the app references an absolute URL outside
  `/labs/<slug>/`. Fix the `--base` flag, or the app hardcodes an absolute asset
  path that needs to be relative in its source.
- **Preview looks blank/errored**: the app needs network at record time (e.g. a
  live API) or more warmup — increase the pre-clip `waitForTimeout` and wait on a
  real settled selector before `clipStartMs`.
- **Port 8788 already held**: a stale `python3 -m http.server 8788` may serve an
  old `out/`. Check `lsof -nP -iTCP:8788` and its cwd before trusting a verify run.
