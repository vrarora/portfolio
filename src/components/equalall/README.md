# EqualAll — mweb Donation Experience

A reimagined premium concept build of EqualAll (Ketto's consumer donation
platform for Western donors), anchored in the five shipped experiments the
case study describes. The narrative source of truth is
`Case Study Context/EqualAll Case Study Locked Context.md` (local, gitignored).

Two hosts render the same product:

- **Interactive mockup** — `app/mockups/equalall/page.tsx` (`/mockups/equalall`).
  Desktop: centered phone frame. Below 480px: full-bleed real mweb page.
- **Case-study embeds** — five scripted micro-demos on `/case-studies/equalall`,
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

Sheet steps (gift <-> confirm, payment details <-> processing) transition
through `screens/StepPager.tsx`: a height-animating container that slides
panes horizontally while the exiting pane leaves layout flow immediately
(`.ea-step-pane-out`, `pointer-events: none`). Never swap sheet steps with
`AnimatePresence popLayout` — inside a bottom-anchored sheet it stacks both
steps and flashes a full-height white sheet mid-transition.

The wallet lockup is `screens/PayMark.tsx` (inline SVG). The `` glyph is a
private-use codepoint that renders as a blank gap outside Apple platforms —
don't put it in copy.

## Layout inside a scaled frame

`chrome/PhoneFrame.tsx` renders a fixed 390×844 logical screen scaled to fit
its parent (ResizeObserver). The `.ea-phone-fit` wrapper reserves the
*scaled* dimensions so layout never overflows. Nothing inside uses
`position: fixed`; all overlays are absolute within `.ea-viewport`.
The internal scroll container carries `data-lenis-prevent` because the
portfolio runs Lenis globally.

The bezel is an iPhone 17 Pro glass treatment (`.ea-phone` in
`styles/equalall.css`): a polished titanium rail (metallic gradient catching
light on opposing corners), a 2px black glass ring on `.ea-phone-screen`, a
faint specular sweep (`.ea-phone::after`), and a refined Dynamic Island.
`BEZEL` in `PhoneFrame.tsx` (9) must equal the `.ea-phone` padding — the
scale math depends on it. This one frame is shared by the mockup desktop
stage, all five case-study embeds, and the homepage/case-hero cover capture.

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
classes — must include `max-width: none` on headings (portfolio global
`h1 { max-width: 12ch }` at ≤720px otherwise wraps the story title).
Fraunces loads via `next/font` in `fonts.ts`, exposed as
`--ea-font-serif` on each `.ea-root` host; the portfolio's global font setup
is untouched.

## Design language — "Warm Paper & Glass"

Session 19 origin, Session 20 refinement (flat accent purge after external
"AI slop" feedback). Full token list and rationale in the locked context
file and `styles/equalall.css`.

- **Canvas:** warm off-white (`--ea-surface: #faf8f4`), desktop stage
  (`--ea-canvas: #f0ece4`).
- **One accent:** `--ea-accent: #e05430` — flat fills on all CTAs, solid
  progress fill, tier selection. Shared `--ea-shadow-accent`. No gradient
  fills on interactive elements.
- **Trust:** `--ea-trust` green for verified/secure chips only.
- **Paper:** keepsake card grain, torn edge, stamp; aurora reserved for
  thank-you peak (WebGL on interactive route, CSS blobs in embeds).
- **First Light:** the keepsake opens at the payment sheet's exact charcoal
  (#191715) and dawn breaks radially from where the checkmark resolved —
  the dark-to-light handoff is one continuous sunrise, never a cut. The
  keepsake takeover therefore enters at full opacity (a fade would ghost
  the bright story screen through the dusk). Content delays live in
  `KEEPSAKE_T` (`screens/keepsakeTiming.ts`); the recurring embed script,
  the verify suite, both audit scripts, and the thumbnail capture are all
  timed against them — change there, change everywhere.
- **The Kept Promise:** a stitched coral thread (`screens/StitchThread.tsx`)
  is the system motif — it connects amount to outcome on the confirm step,
  appears as a static stitch under the gift-sheet title, and becomes the
  thank-you's journey timeline. The thank-you is a *journey card*, not a
  receipt: three waypoints (stamped "Gift received" → "With the team" →
  the tangible destination with photo) drawn top-down by the thread, an
  organizer promise line, and the receipt demoted to a stub whose
  reference stays the first `.ea-keepsake-meta dd` (verify contract).
- **Warm Companion:** acknowledgment at every commitment point — heart
  pulse on the impact line, reserved-height "You can cancel anytime." under
  the monthly toggle (fixed 18px row so the sheet never jumps), "Sending
  your gift safely…" during processing, chip glint on the wallet card.
- **Stage light-spill:** `chrome/StageGlow.tsx` (mockup desktop branch
  only) crossfades three gradient layers by opacity behind the phone —
  warm while reading, charcoal during payment, aurora at the keepsake.
- **Glass:** sticky chrome head with backdrop blur + progressive fade edge;
  hero bottom scrim for dot/CTA legibility.
- **Payment:** fully opaque `#191715` sheet; `PayMark.tsx` SVG lockup (never
  the `` private-use glyph in copy); charcoal wallet card art.

The keepsake aurora has two implementations: `AuroraShader.tsx` (raw WebGL,
domain-warped fbm silk + dawn reveal + rising embers, half-resolution,
DPR-capped, context-loss fallback) used on the interactive route only, and
`AuroraCSS.tsx` (transform-only blobs) plus an `.ea-dawn` dusk overlay used
in embeds and under reduced motion. The shader canvas is created inside the
effect, not rendered by React: cleanup calls `loseContext()`, and a re-run
of the effect on the same DOM node (StrictMode, HMR) would get the dead
context back from `getContext()` and silently fall back to CSS — a fresh
canvas per effect run always gets a live context. The stamp's rubber-ink
look is an SVG filter (displacement-roughened edges, turbulence-alpha
`feComposite operator="out"` patchiness) in `screens/InkStamp.tsx`;
`screens/KeepsakeCard.tsx` holds the journey card, the stamp-impact jolt,
the slot-text reference roll (slot-text only animates on text *change*,
so the ref mounts masked), and the fine-pointer card tilt.

`StitchThread.tsx` gotcha: motion's `pathLength` animation writes
`stroke-dasharray`, which would clobber a dotted stroke — so the dotted
line is static and a solid line inside an SVG `<mask>` does the drawing.
The SVG occupies its final height from mount so StepPager's ResizeObserver
never sees a growing pane.

## Scripts

- `scripts/verify-equalall.mjs` — end-to-end checks (flow, embeds, scheduler
  cap, reduced motion). `BASE_URL=http://localhost:3001 node scripts/verify-equalall.mjs`
- `scripts/capture-equalall-thumbnails.mjs` — regenerates
  `public/images/equalall/equalall-cover.webp`, the single phone-on-canvas
  Story cover shared by the homepage work card (`workPreview: "cover"`) and
  the equalall case hero. Run against a production build (dev would leak the
  agentation button into captures):
  `npm run build && (cd out && python3 -m http.server 8788)` then
  `BASE_URL=http://localhost:8788 node scripts/capture-equalall-thumbnails.mjs`.
  The homepage card and the case hero both render this one image with no
  browser chrome (mweb product); the old 3-phone `phones` variant is gone.
- `scripts/audit-equalall.mjs` — captures every steady state + key
  mid-transition frames of the full flow (plus desktop stage and case-study
  embeds) to `.audit/equalall/` for pixel review.
- `scripts/audit-equalall-motion.mjs` — records the whole flow as video and
  tiles each transition into 24-frame contact sheets in
  `.audit/equalall-motion/` so transitions can be inspected frame by frame.

## Asset credits (Unsplash free license)

| File | Photo | Photographer |
| --- | --- | --- |
| `hero-meals.webp` | Girl smiling with a meal box | [Michael Ali](https://unsplash.com/photos/a-young-girl-smiles-as-she-holds-a-bowl-of-food-dMmZ4jSsjJM) |
| `hero-care.webp` | Relief worker feeding a child | [Michael Ali](https://unsplash.com/photos/a-man-is-giving-a-child-something-to-eat-0LZjRuipr20) |
| `hero-classroom.webp` | Teacher instructing a classroom | [David Geneugelijk](https://unsplash.com/photos/a-teacher-instructs-students-in-a-classroom-CXa6E3krENE) |
| `kit.webp` | Orange first-aid kit | [Ploegerson](https://unsplash.com/photos/orange-erste-hilfe-med-kit-j-ped4HD32Q) |

Campaign, organizer, donors, and card details in `data/campaign.ts` are
fictional.
