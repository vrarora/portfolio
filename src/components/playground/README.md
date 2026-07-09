# Playground — Living Constellation of Design Experiments

`/playground` is the permanent home for independent explorations: every
experiment is a drifting node in a particle constellation. Hovering grows a
node into a living muted video preview; clicking opens a full media stage
with an info card and an "Open live ↗" link to a same-domain static build
under `/labs/<slug>/`. Modeled on the playground-interaction reference
(bones), skinned in the portfolio's language (white/black editorial,
`#fd431d` accent, Inter). The approved spec with all locked decisions is
`Playground Plan.md` at the repo root (local, gitignored).

To add a new experiment, follow `ADDING-A-NODE.md` in this directory — the
only file that must change is `src/content/playground.ts`.

## Architecture — React owns content, the engine owns geometry

React renders the node/stage/card DOM **once** from the content file;
every per-frame mutation (transforms, opacities, the stage rect, the zoom
readout, the canvas) is an imperative ref write inside the rAF engine.
React state exists only for discrete UI: `activeId`, `showMore`,
`coarsePointer`.

- `PlaygroundField.tsx` — client root `.pg-root`; composes everything, owns
  `useFieldEngine`, carries `data-lenis-prevent`, moves focus to the card
  close button on open and back to the node on close.
- `PlaygroundChrome.tsx` — top chrome: "V." mark home link, centred intro
  whose **measured bottom edge sets the field top**, bracketed
  "Back to work" → `/#work`.
- `FieldNode.tsx` — dot + label + index code + the hover box
  (`<video muted playsinline loop preload="none">` with poster and a dark
  caption gradient for media legibility).
- `Stage.tsx` — fixed media shell; the engine pools `<video>`/`<img>`
  layers inside it imperatively and positions the rect each frame. Flat
  black play button — stage videos never autoplay.
- `InfoCard.tsx` — flat near-black card: title, category, Show more (CSS
  grid grow), tabular counter, prev/next, close, accent "Open live ↗" pill.
  React owns the discrete content; the engine drives opacity and
  pointer-events. Content stays mounted through the close flight
  (`onActiveChange(null)` fires only when the shrink completes).
- `Hud.tsx` — hint row (coarse-pointer variant) + zoom readout, both
  mutated imperatively.

### Engine (`engine/`)

- `types.ts` — `EngineState` (one mutable bag constructed inside the main
  effect), `NodeRuntime`, hover-box constants (`HBOX_W/H` 236×150), zoom
  clamp 0.72–1.35.
- `math.ts` — `lerp`/`clamp`/`easeIO`/`edgeDist`/`rectsOverlap`/`pad2`.
- `simulation.ts` — pure per-frame math, zero DOM: eased cursor + zoom,
  per-node drift oscillators, drag (grab point stays under the cursor,
  converted back through zoom/parallax), ring-out of non-central nodes
  around the open stage, magnetic hover pull, field clamping, stage-rect
  lerp. **Stage grow progress `p` is measured on area, not width** — a
  portrait stage (pulse) can open *narrower* than the hover box, so
  width-based progress would run backwards and pin the stage invisible at
  p = 0. Area grows monotonically for every aspect ratio, and the
  `max(1, …)` denominator keeps the close flight (target = the box itself,
  delta 0) saturated at 1 until the rect lands.
- `canvasLayer.ts` — depth dust (count scales with area, DPR ≤ 2) and
  particle threads on every node pair, pure-black ink at lower alphas than
  the reference (pure white ground reads harder than warm paper). Reduced
  motion: static dust, hairlines only.
- `useFieldEngine.ts` — the hook. Everything mutable is constructed inside
  one effect (StrictMode-safe; all `Math.random()` in-effect keeps the
  static export hydration-safe); listeners hang off one `AbortController`;
  the rAF loop parks on hidden tabs and the drift clock rebases on return;
  reduced motion renders discrete frames on input instead of looping.

### Interactions

- **Hover** (fine pointers): nearest node < 90px, held while the cursor
  stays inside the grown box + margin (`inHoverBox`). Only ONE preview
  video plays at a time; `muted` is set before `src` for Safari; leaving
  pauses it.
- **Drag**: 4px threshold (8px coarse) then pointer capture; the click is
  suppressed on release.
- **Zoom**: wheel (ctrl+wheel = trackpad pinch, faster), two-pointer touch
  pinch; min zoom is 1 while the stage is open.
- **Open**: click/tap → stage flies out of the node's box rect; background
  click or Escape closes; ←/→ step; Enter/Space on a focused node opens;
  stage click toggles play.
- **Deep links**: `#open-<id>` on mount and `hashchange`; open writes the
  hash via `replaceState`, close clears it.
- **Mobile ≤ 767**: hover boxes off (tap opens directly), card
  `calc(100vw - 24px)`, stage max 92vw, HUD copy switches to
  Pinch/Drag/Tap.

### Lenis

Double defense: `app/providers.tsx` calls `lenis.stop()` whenever
`pathname.startsWith("/playground")` (checked on async init AND on every
route change — the stop must never fire off-playground), plus
`data-lenis-prevent` on `.pg-root`. The page itself is
`position: fixed; inset: 0; overflow: hidden`.

## Visual language (portfolio skin)

All rules live under `.pg-root` in `styles/playground.css` with `:where()`
element resets (`text-transform: none`, `max-width: none` — the global
uppercase-h1 clamp leaks otherwise; equalall lesson). Breakpoints at
1199/767 match the portfolio tiers.

**Accent `#fd431d` in exactly three places:** the intro title's period,
the hovered node's dot, and the Open-live pill. Nothing else. Card is flat
near-black (`rgba(10,10,10,0.96)`), no backdrop blur, no gradients on
interactive elements. Focus rings use the site-wide `--color-link` blue.

## Content + assets

- `src/content/playground.ts` — the one file future nodes are added to
  (see `ADDING-A-NODE.md` for the field-by-field template).
- `public/labs/<slug>/` — committed static builds of the live prototypes,
  each with a `.build-info.json` recording the source repo + commit.
- `public/playground/<slug>/preview.mp4 + poster.webp` — the living loop
  (≤ 2.5MB budget, enforced) and its poster.

## Scripts

- `scripts/build-labs.mjs` — rebuilds `public/labs/<slug>/` from the source
  repos (`node scripts/build-labs.mjs [slug…]`; needs network). Fails
  loudly if the emitted index.html references absolute paths outside
  `/labs/<slug>/` (base-path drift).
- `scripts/record-lab-previews.mjs` — serves `public/` locally, drives each
  lab with scripted beats under Playwright recording, transcodes a 10s
  H.264 loop (`ffmpeg-static`) and encodes the poster (sharp).
- `scripts/verify-playground.mjs` — ~30 end-to-end checks: calm field,
  hover previews, zoom, drag, stage + card, deep links, all four labs,
  reduced motion, mobile touch (CDP-dispatched touch drag + pinch), Lenis
  gating. Run against a production build:
  `npm run build && (cd out && python3 -m http.server 8788)` then
  `env -u PLAYWRIGHT_BROWSERS_PATH BASE_URL=http://localhost:8788 node scripts/verify-playground.mjs`.
- `scripts/audit-playground.mjs` — steady-state captures at 2x DPR plus
  24-frame contact sheets of the open/step/close stage flights, written to
  `.audit/playground/` for pixel review (`--states-only` skips the motion
  pass).

Testing gotcha: the nodes never stop drifting, so screen coordinates go
stale between reading and clicking. Hover first and click the grown box,
or target the node *label*, and always re-read positions at the last
moment — see the helpers at the top of the verify script.
