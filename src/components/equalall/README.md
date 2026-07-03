# EqualAll — mweb Donation Experience

A reimagined premium concept build of EqualAll (Ketto's consumer donation
platform for Western donors), anchored in the five shipped experiments the
case study describes. The narrative source of truth is
`Case Study Context/EqualAll Case Study Locked Context.md` (local, gitignored).

Two hosts render the same product:

- **Interactive mockup** — `app/mockups/equalall/page.tsx` (`/mockups/equalall`).
  Desktop: centered phone frame. Below 480px: full-bleed real mweb page.
- **Case-study embeds** — five scripted micro-demos on `/case-studies/atlas`,
  one per experiment, wired through `visualType: "equalall-*"` in
  `src/content/case-studies.ts` and the switch in
  `app/case-studies/[slug]/page.tsx` via the IO-lazy wrapper
  `app/case-studies/[slug]/EqualAllExperimentVisual.tsx`.

## Architecture — one reducer, two hosts

Every UI transition is a discrete action on `flow/reducer.ts`
(`OPEN_GIFT`, `SELECT_TIER`, `SET_FREQUENCY`, `CONTINUE_TO_CONFIRM`,
`OPEN_PAYMENT`, `AUTHORIZE_PAYMENT`, `PAYMENT_DONE`, `ACCEPT_MONTHLY`,
`HYDRATE`, `RESET`…). Sheets, the carousel, and morphs animate *from state
changes*, identically in both hosts. Gestures (drag-dismiss, carousel drag)
are interactive-mode enhancements that terminate in the same actions — the
demo driver taps real buttons (`element.click()`), so there is exactly one
animation source of truth and no scripted/interactive drift.

`flow/DonationFlowProvider.tsx` exposes `{ state, dispatch, mode,
reducedMotion, viewportRef }`. `mode` is `"interactive" | "scripted"`.
The receipt (`ref`, `date`) is generated in the reducer at `PAYMENT_DONE`
time — never at render time — so static export stays hydration-safe.

## Layout inside a scaled frame

`chrome/PhoneFrame.tsx` renders a fixed 390×844 logical screen scaled to fit
its parent (ResizeObserver). The `.ea-phone-fit` wrapper reserves the
*scaled* dimensions so layout never overflows. Nothing inside uses
`position: fixed`; all overlays are absolute within `.ea-viewport`.
The internal scroll container carries `data-lenis-prevent` because the
portfolio runs Lenis globally.

## Demo engine (`demo/`)

- `runner.ts` — flat async timeline (`tap / drift / swipe / action / caption /
  pause`) with AbortController cancellation. Targets are resolved live from
  `data-ea-target` attributes and converted to logical coordinates by
  dividing by the measured scale — no hardcoded positions.
- `TouchIndicator.tsx` — the synthetic finger (motion values, press squeeze,
  tap ripple), portaled into the phone viewport.
- `scheduler.ts` — global cap of 2 concurrently playing embeds; others hold
  their `HYDRATE`d hero pose.
- `scripts.ts` — the five scripts + poses. To add a demo: add a pose +
  steps here, a `visualType` branch in the case-study page, and (if new
  buttons are involved) `data-ea-target` attributes on the tappables.
- `DemoDriver.tsx` — host: IO threshold 0.35 starts/stops playback,
  `visibilitychange` pauses, reduced motion renders a captioned static pose.
  Loop reset = fade overlay → `HYDRATE` → fade back.

CSS is plain, scoped under `.ea-root` with `.ea-` prefixes
(`styles/equalall.css`), mirroring the data-compass convention. Element
resets use `:where()` so they stay at floor specificity below component
classes. Fraunces loads via `next/font` in `fonts.ts`, exposed as
`--ea-font-serif` on each `.ea-root` host; the portfolio's global font setup
is untouched.

The keepsake aurora has two implementations: `AuroraShader.tsx` (raw WebGL
fragment shader, half-resolution, DPR-capped, context-loss fallback) used on
the interactive route only, and `AuroraCSS.tsx` (transform-only blobs) used
in embeds and under reduced motion.

## Scripts

- `scripts/verify-equalall.mjs` — end-to-end checks (flow, embeds, scheduler
  cap, reduced motion). `BASE_URL=http://localhost:3001 node scripts/verify-equalall.mjs`
- `scripts/capture-equalall-thumbnails.mjs` — regenerates the homepage
  3-phone thumbnails by driving the real flow against a production build
  (dev would leak the agentation button into captures):
  `npm run build && (cd out && python3 -m http.server 8788)` then
  `BASE_URL=http://localhost:8788 node scripts/capture-equalall-thumbnails.mjs`.

## Asset credits (Unsplash free license)

| File | Photo | Photographer |
| --- | --- | --- |
| `hero-meals.webp` | Girl smiling with a meal box | [Michael Ali](https://unsplash.com/photos/a-young-girl-smiles-as-she-holds-a-bowl-of-food-dMmZ4jSsjJM) |
| `hero-care.webp` | Relief worker feeding a child | [Michael Ali](https://unsplash.com/photos/a-man-is-giving-a-child-something-to-eat-0LZjRuipr20) |
| `hero-classroom.webp` | Teacher instructing a classroom | [David Geneugelijk](https://unsplash.com/photos/a-teacher-instructs-students-in-a-classroom-CXa6E3krENE) |
| `kit.webp` | Orange first-aid kit | [Ploegerson](https://unsplash.com/photos/orange-erste-hilfe-med-kit-j-ped4HD32Q) |

Campaign, organizer, donors, and card details in `data/campaign.ts` are
fictional.
