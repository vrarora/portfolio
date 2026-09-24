> **How to resume (next chat)**: you are on branch `portfolio_v2`, cut from `main` on 2026-09-23. Nothing is built yet. Start at Migration step 0 (discard the uncommitted `app/layout.tsx` and `package-lock.json` edits, `npm ci`, baseline build). Copy drafts, the assistant system prompt, the curated Q→A pairs and notes copy live in `docs/PORTFOLIO_V2_CONTENT_DRAFTS.md`. Track progress in `docs/state.md` and log decisions in `docs/journal.md`. Never use Supabase on this project; the backend is Convex.

# Portfolio v2 redesign plan

## Context

Vaibhav wants a full redesign of vrarora.vercel.app around a calm, nature-touched visual language. The site should feel like a respite from the internet. Primary reference is anirudh.info; secondary references are jaksenc.com, lelezhang.design, benji.org, rachelchen.tech, cuelume.dev, the "GOATs" pages (rauno.me, emilkowal.ski, jakub.kr, paco.me, shud.in, raphaelsalaja.com) and the Inspo1 AI-assistant layout. Typography moves to Inter at a 14px base with Instrument Serif italic accents. New features: an AI assistant about Vaibhav, a public notes wall, a sticker stack, generative ambient music, UI sounds, bottom-sheet case studies with real URLs, and a footer sky that shifts with the visitor's hour.

Case study content is not rewritten in this pass. Only the template changes. The "strong opinion" section ships as an intentional placeholder.

All work happens on a new branch `portfolio_v2` cut from `main`.

## Decisions (from clarifying questions, 2026-09-23)

| Topic | Decision |
|---|---|
| Backend | **Convex** (never Supabase for this project). Site stays `output: "export"`; Convex functions handle chat, notes, rate limits. |
| LLM | **Gemini Flash free tier** via a Google AI Studio key stored in Convex env. Convex Agent component + rate limiter. Curated fallback answers when quota is exhausted. |
| Rebuild | Fresh app shell; port content, case-study visuals, EqualAll demos, playground labs, images, scripts. Retire old CSS and page.tsx. |
| Uncommitted edit | Discard `app/layout.tsx` and `package-lock.json` changes before branching. Analytics stays. |
| Theme | Light paper page always. Footer sky shifts with the visitor's hour, with a preview dial. No dark mode. |
| Nature | Both motifs, layered: leaf shadows over hero/intro, shader sky behind the footer. |
| Hero | GOATs pattern: name + role, 32px round photo as byline, three short first-person paragraphs with reading-line darkening, inline company logos, a few Instrument Serif italics. Copy email + Resume. No portrait illustration. |
| Typography | Inter 14px base + Instrument Serif italic accents only. |
| Strong opinion | Placeholder block; content to be discussed later. |
| Job signal | Subtle: one footer line + assistant answers. |
| v1 sections | Drop testimonials, TownSquare, logo marquee, principles cards, services, weather chip. |
| Work | One Work section with tabs Case studies / Experiments. `/playground` stays as an easter-egg link. |
| Case studies | Bottom sheet with real URLs (`/work/[slug]/`); direct visits render a benji-style reading page. |
| Writing | Placeholder list with 3 titles (route stubbed). |
| Notes | Public wall, text + doodle, dot-grid whiteboard, name + date, live via Convex, owner moderation. |
| Music | Generative Web Audio ambient, hour-aware, top-right pill with spinning disc. No files. |
| UI sounds | cuelume cues, off by default, toggle persisted. |
| Stickers | Illustrated interest stickers generated via Gemini prompts; data model allows swapping to photos later. |
| Assistant | Right side panel that pushes the page, named **Ask Vaibhav**, first-person voice, labeled AI. Scope: work, how I work, availability (never salary), interests. |
| Scroll | Native scroll. Lenis is removed (sheet needs its own scroller, reduced motion, fewer rAF loops). |
| Memory to save after plan mode | "Never use Supabase for this project; it is for Privy work." |

## Research summary (verified in browser and repo)

- **Repo today**: Next 16.2.9, React 19, App Router, static export, plain CSS (`app/globals.css` 6,834 lines, `app/page.tsx` 1,705 lines), `motion` 12, `lenis`, Phosphor. Inter via rsms.me link. Content as TS objects in `src/content/`. No DB, no API routes. Deployed on Vercel from `github.com/vrarora/portfolio`.
- **Blockers found**: `.npmrc` has `omit=optional`, which breaks `npx convex deploy` (esbuild platform binaries are optional deps). `.gitignore` has no `.env*` entry; `npx convex dev` writes `.env.local`. Uncommitted `app/layout.tsx` uses a named import the committed stub lacks.
- **Next static export**: intercepting/parallel routes are unsupported; `window.history.pushState` is integrated with the router and updates `usePathname`. This decides the sheet approach.
- **Convex**: Agent component 0.7.3 (peer `ai ^7`), rate limiter 0.4, default runtime has `fetch` + web streams so `@ai-sdk/google` works without the Node runtime. Free plan is enough; Convex's own AI Gateway is Pro-only, hence the Gemini key. Vercel build command becomes `npx convex deploy --cmd 'npm run build'` with `CONVEX_DEPLOY_KEY`.
- **Gemini free tier**: Gemini 3.x Flash models are free for input/output with RPM/RPD caps; content may be used to improve Google products. Exact model ID and caps must be read in AI Studio at build time and stored as `GEMINI_MODEL`.
- **Reference mechanics** (anirudh.info): leaves video at opacity .68, `mix-blend-mode: multiply`, blur 6px; `.reading-line` spans with `--line-fill` gradient via `background-clip: text` from `#111` to `rgba(17,17,17,.32)`; page shell `border-radius 0 0 26px 26px` lifting off a sky; sky dial (sun/moon/moon-stars); work drawer `radius 28px 28px 0 0`, `shadow 0 -18px 60px rgba(0,0,0,.14)`, `transform .56s cubic-bezier(.16,1,.3,1)`.
- **GOATs first fold**: name + role, 2 to 4 first-person paragraphs, 550 to 650px column, inline links only. benji.org: Inter 14/20 weight 460, `#111` on `#fdfdfc`, TOC 13px at 40%, captions 12px at 40%.
- **cuelume**: npm `cuelume` v0.2.2, <5kB, 17 Web Audio cues, `bind()` + `data-cuelume-*`, `play()`, `setVolume()`.

## Architecture

### Stack and wiring
- Next 16 static export unchanged (`output: "export"`, `trailingSlash: true`, `images.unoptimized`). No API routes, no middleware.
- Convex project with components `agent` and `rateLimiter`. Packages: `convex`, `@convex-dev/agent@^0.7`, `@convex-dev/rate-limiter@^0.4`, `ai@^7`, `@ai-sdk/google@^4`, `zod`. Verify peer ranges at install.
- `ConvexClientProvider` (client) wraps the app; it is a no-op when `NEXT_PUBLIC_CONVEX_URL` is absent so `npm run build` stays green anywhere. Expose `useConvexAvailable()` so the assistant and notes render static fallbacks. Mount lazily (first notes-section intersection or first assistant open) if the client connects eagerly.
- Anonymous identity: `getVisitorId()` in `src/lib/visitor.ts` (`localStorage["vp.visitor"]`, `v_` + uuid). Used as Agent `userId` and rate-limit key.
- Env vars (names only). Vercel: `CONVEX_DEPLOY_KEY` (Production key and a separate Preview key). Convex dev and prod deployments: `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL`, `ADMIN_TOKEN`, optional `ASSISTANT_DAILY_BUDGET`, `NOTES_PAUSED`. Local: `.env.local` written by `npx convex dev`.
- Vercel settings: Build Command `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`; Node 20; keep or remove the `npm install --os=linux --cpu=x64` install override after fixing `.npmrc`.
- Dev flow: terminal 1 `npx convex dev`, terminal 2 `npm run dev`. Add `dev:convex` script and a `.claude/launch.json` entry.

### CSS strategy
Plain global CSS split per component group with a mandatory class prefix (`site-`, `home-`, `work-`, `cs-`, `sheet-`, `ask-`, `notes-`, `fx-`, `audio-`), each file next to its component and under ~450 lines. `src/styles/` holds only `tokens.css`, `reset.css`, `typography.css`, `layers.css`, `utilities.css`. Reason: every kept subsystem (`.ea-*`, `.pg-*`, `.dc-*`, the ten `*Visual` prefixes) and every Playwright script already works this way.

### Tree (new and moved)
```
app/
  layout.tsx  providers.tsx  page.tsx  not-found.tsx
  work/page.tsx  work/[slug]/page.tsx        # static reading page, generateStaticParams
  writing/page.tsx                           # 3 placeholder titles
  case-studies/[slug]/page.tsx               # client redirect stub → /work/[slug]/
  admin/notes/page.tsx                       # hidden, noindex, token-gated moderation
  playground/  mockups/  covers/  icon.svg  apple-icon.png  agentation-stub.tsx   # kept
src/
  content/  case-studies.ts  playground.ts  site-links.ts  about.ts  writing.ts  assistant-faq.ts  stickers.ts
  shared/   limits.ts  textFilters.ts  blocklist.ts  strokeCodec.ts     # pure TS, imported by app and convex/
  lib/      convexClient.ts  visitor.ts  settings.ts  routes.ts  prefersReducedMotion.ts  hour.ts
  styles/   tokens.css  reset.css  typography.css  layers.css  utilities.css  fonts.ts  motion.ts  breakpoints.ts
  components/
    providers/  ConvexClientProvider.tsx  SettingsProvider.tsx  AudioProvider.tsx
    site/       SiteHeader  NavLinks  SiteFooter  SkipLink  PageShell  SocialLinks  site.css
    home/       HomePage  Intro  UpTo  Opinion  WorkSection  WritingList  NotesWallSection  home.css
    work/       WorkPage  WorkTabs  CaseStudyGrid  WorkCard  ExperimentsList  useWorkSheetRoute.ts  work.css
    case-study/ CaseStudyBody  CaseStudyHero  CaseStudySection  CaseStudyToc  ReadingPage  Figure  Margin  PhoneMedia  Fn
                ScrollRootContext  visualRegistry.ts  case-study.css
                visuals/  (moved from app/case-studies/[slug]/)  + design-repo.css  equalall-diagrams.css  outcome-impact.css
    sheet/      Sheet  useScrollLock  useReturnFocus  sheet.css
    reading/    Reading  Line treatments (Serif, Blur, Tag, LogoStack)  scrollDriver.ts  reading.css
    effects/    LeafShadow  SkyLayer  SkyGL (dynamic)  SkyDial  StickerStack  effects.css
    audio/      MusicPill  SoundToggle  ambient.ts  cues.ts  audioPrefs.ts  audio.css
    assistant/  AskLauncher  AskPanel  MessageList  MessageBubble  Composer  SuggestionChips  FallbackNotice  useAskThread.ts  pickFallback.ts  assistant.css
    notes/      NotesWall  NoteCard  NoteComposer  DoodleCanvas  DoodleSvg  NotesPeek  useNotes.ts  placement.ts  notes.css
    equalall/  playground/  data-compass/    # kept unchanged
convex/
  convex.config.ts  schema.ts  rateLimits.ts  knowledge.ts  assistant.ts  notes.ts  admin.ts  lib/guards.ts  _generated/
scripts/  existing 9  + verify-routes.mjs  verify-work-sheet.mjs  verify-assistant.mjs  verify-notes.mjs  check-prompt-budget.mjs
```

### Layer order and z-index
`--z-sky:-2 --z-leaf:-1 --z-content:0 --z-reading:5 --z-stickers:10 --z-header:20 --z-notes-peek:25 --z-sheet-scrim:40 --z-sheet:41 --z-ask:50 --z-controls:55 --z-toast:60 --z-admin:70`. Body order: SkipLink, SkyLayer, LeafShadow, SiteHeader, `main#content`, SiteFooter, StickerStack layer, `#sheet-root`, `#ask-root`, MusicPill, SoundToggle, NotesPeek, Analytics, AgentationDevtools. Fixed controls are body-level siblings, never inside the page shell (the shell gets transformed by the assistant push).

## Design system

### Fonts
- Inter via `next/font/google` (`Inter({ subsets: ["latin"], variable: "--font-inter", axes: ["opsz"] })`). Variable weights give the 460 body weight. If weight 460 or `cv11` alternates render poorly, switch to `next/font/local` with a subset `InterVariable.woff2` that includes `U+20B9` (₹).
- Instrument Serif via `next/font/google`, italic 400 only, `--font-serif`. Used at `1.12em` of surrounding Inter, `line-height: 1`. Allowed: up to 3 words per screen in the intro, footer nav labels, footer signature line (22px), case-study margin annotations (13px). Never headings, buttons, body, numbers.
- `font-synthesis: none`; `em` renders as Inter 500 upright, so the serif is the only italic voice.
- Remove both rsms.me `<link>`s and the TownSquare preconnect from `layout.tsx`.

### Type scale (14px base)
| Token | Size/line | Weight | Use |
|---|---|---|---|
| `--t-micro` | 11/16 | 500, +0.06em, uppercase, tnum | index codes, metadata labels |
| `--t-caption` | 12/16 | 460 | captions, TOC, footnotes, chips |
| `--t-body` | 14/20 | 460 | default |
| `--t-body-strong` | 14/20 | 500 | h3, card titles, tabs, sheet title |
| `--t-lede` | 16/24 | 460 | case-study lede, assistant welcome |
| `--t-h2` | 18/24 | 500 | section headings |
| `--t-h1` | 22/28 | 500 | name in hero |
| `--t-display` | 28/32 | 500 | case-study title |

Paragraph gap 20px; section gap 96px on home, 64px in case studies. `text-wrap: pretty` on paragraphs, `balance` on headings. Features `"liga","calt","cv11"`, `"tnum"` on numeric UI.

### Colour
`--paper #fdfdfc`, `--paper-2 #f6f6f3`, `--ink #111`, `--ink-2 rgba(0,0,0,.62)`, `--ink-3 rgba(0,0,0,.40)`, `--ink-4 rgba(0,0,0,.24)`, `--ink-dim rgba(17,17,17,.32)` (unread reading-line), `--hairline rgba(0,0,0,.08)`, `--hairline-2 rgba(0,0,0,.14)`, `--wash rgba(0,0,0,.03)`, `--accent #5b7f5e` (moss; link hover, availability dot), `--leaf #26301f`. Links: inherit colour, 1px underline in `--hairline-2`, offset .18em, hover to `--accent`.

Sky palette (zenith / mid / horizon / sky-ink / stars), interpolated in OKLCH:
| Stop | Peak local hour | Zenith | Mid | Horizon | Sky ink | Stars |
|---|---|---|---|---|---|---|
| night | 21:15 to 04:45 | `#0b0f1a` | `#141a26` | `#252e3e` | `rgba(255,255,255,.86)` | 1.0 |
| dawn | 06:15 | `#6c7fa6` | `#c9b3bd` | `#f3d6b4` | `#1e1b22` | .15 |
| day | 08:45 to 15:45 | `#7fa6d6` | `#b7cde8` | `#e4edf4` | `#14243a` | 0 |
| golden | 17:30 | `#8493b8` | `#ddb58b` | `#f5d9a6` | `#2a2016` | 0 |
| dusk | 19:15 | `#2b3358` | `#6a5a86` | `#c67e6c` | `rgba(255,255,255,.88)` | .35 |

`--control-tint: color-mix(in oklch, var(--paper), var(--sky-mid) 12%)` tints the music pill, sound toggle and dial. Nothing else tints.

### Spacing, radii, shadows, motion
- Spacing 4px grid `--s-1 … --s-15` (2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128). Keep old `--space-N` aliases until the old CSS is deleted.
- Radii `--r-1 4`, `--r-2 8`, `--r-3 12`, `--r-4 16`, `--r-sheet 28`, `--r-shell 26`, `--r-pill 999`.
- Shadows: `--shadow-sheet: 0 -18px 60px rgba(0,0,0,.14), 0 -1px 0 rgba(0,0,0,.04)`; `--shadow-card: 0 1px 2px rgba(0,0,0,.04), 0 12px 32px -16px rgba(0,0,0,.14)`.
- Durations `--d-tick 120ms`, `--d-fast 200`, `--d-base 320`, `--d-sheet 560`, `--d-slow 900`, `--d-audio 2000`. Easings `--ease-out-expo cubic-bezier(.16,1,.3,1)`, `--ease-out-quart cubic-bezier(.25,1,.5,1)`, `--ease-in-out cubic-bezier(.65,0,.35,1)`, `--ease-overshoot cubic-bezier(.34,1.56,.64,1)` (logo fan only).
- Springs in `src/styles/motion.ts` (extend `equalall/motionTokens.ts`): `SPRING_SHEET 340/36`, `SPRING_PANEL 300/34`, `SPRING_STICKER 260/24/.9`, `SPRING_GATHER 200/26`, `SPRING_FAN 420/28`, `SPRING_POP 520/30`, `FADE .24s`. Wrap app in `<MotionConfig reducedMotion="user">`.
- Widths `--col-reading 550`, `--col-reading-max 582`, `--col-toc 180`, `--col-margin 180`, `--col-bleed 760`, `--page-max 1040`, `--assistant-w 380`, `--sheet-top 92`. Breakpoints 480 / 768 / 1024 / 1200 / 1468 (assistant can push without covering the column).

## Pages and sections

### Home `/`
1. **Intro**: name `--t-h1` + "Product Designer at IDfy" `--ink-3`; 32px round photo (crop of `public/images/me.webp`) as byline with the sticker stack on it; three paragraphs through `<Reading>`: who I am (IDfy logo inline), previously (Ketto, Wysa logos), reach me. Buttons: Copy email (cue `chime`), Resume. Leaf shadows behind.
2. **What I've been up to**: label + 4 short lines.
3. **One strong opinion**: placeholder block that reads as a held position ("I'm writing this part. It's about handoffs, and why the artifact was always the problem, not the designer. Until it's done, ask the assistant what I think.").
4. **Work**: tabs Case studies / Experiments (see below).
5. **Writing**: 3 placeholder titles with a "Drafting" tag, no links.
6. **Notes wall**: latest 12 cards + "Leave a note".
7. **Footer** over the sky: nav (Work, Experiments, Writing, Notes, Resume, LinkedIn, X, GitHub, Email), signature line in serif, availability line ("Get in touch for senior product design roles at product-led companies. vraroraa@protonmail.com"), © 2026, "The sky shifts with the hour.", sky dial bottom-left.

Copy v1 for every section is drafted in the narrative agent output and will be placed in `src/content/about.ts` / component files at build time. Every fact marked [VERIFY] there must be confirmed or cut (Wysa role, city, remote stance, ₹10Cr wording, EqualAll 30 vs 40%, years of experience).

### Work `/work`
- Grid two columns at ≥1024 in the 760px bleed width; card = cover 16:10 (`--r-3`, hairline), title + year row, one-line subtitle. Hover: cover `scale(1.015)` + `--shadow-card`, title underline. Press `scale(.992)`.
- Tabs `role="tablist"` with a sliding underline (`layoutId`), panel crossfade 120/200ms. Experiments rows from `playgroundNodes`: `[ 0072 ]` index, title + category, year, "Open lab ↗". A small "See the constellation" link goes to `/playground/`.
- Home cards link straight to `/work/[slug]/` (prerendered). On `/work`, clicking a card opens the sheet via `useWorkSheetRoute().open(slug)` = `history.pushState({ vpSheet: true }, "", "/work/slug/")`. `usePathname()` drives `openSlug`; Back/Forward toggle the sheet; `close()` calls `history.back()` when the sheet pushed the entry, else `router.replace("/work/")`. Direct load of `/work/slug/` renders `ReadingPage`.

### Case study (`CaseStudyBody variant="sheet" | "page"`)
- Shared body, `ScrollRootContext` so the TOC and reveal observers use the sheet scroller or window. `visualRegistry.ts` maps `visualType` to `next/dynamic` imports with skeletons so `/work` only downloads a visual when opened. `FlatListMockup` and the thesis callout move out of the old page into a visual and a `callout` content field.
- Reading page grid at ≥1200: `180px TOC | 550px column | 180px margin`, gap 48. 768 to 1199: TOC + column, margin notes inline as `<aside>`. <768: single column, TOC becomes a horizontal strip.
- Type: title `--t-display`, lede `--t-lede --ink-2`, metadata `dl` 2 columns with hairlines, h2 `--t-h2` with 64px top margin, captions `--t-caption --ink-3`, footnotes `<Fn>` mirrored into the margin at ≥1200.
- `<Margin>` annotations in Instrument Serif italic 13/18 with a dash-reveal underline. `<Figure bleed>` extends media to 760px. `<PhoneMedia speeds={[1,.5]}>` wraps the existing `PhoneFrame` around muted looping video, pauses off-screen, poster under reduced motion.
- Existing `*Visual.tsx` mount inside `<Figure bleed>` (88% of their designed 860px); check `HierarchyExplorer` and `InspectorExplorer` for fixed-pixel minimums during the port.
- `/case-studies/[slug]/` becomes a client redirect stub to `/work/[slug]/` (keeps inbound links). Update `scripts/verify-equalall.mjs:88,124`, `scripts/audit-equalall.mjs:152` and `PlaygroundChrome.tsx:33` paths.

### Sheet
- `<dialog>` in `#sheet-root`, `role="dialog" aria-modal aria-labelledby`. Panel `position: fixed; top: var(--sheet-top); inset-inline: 0; height: calc(100dvh - 92px); border-radius: 28px 28px 0 0; background: var(--paper); box-shadow: var(--shadow-sheet)`. Mobile <768: `top: 16px`, radius 20, 36×4 grabber, drag-to-close on coarse pointers (`offset.y > 120 || velocity.y > 800`).
- Enter `y: 100% → 0` with `SPRING_SHEET`, content fade 240ms delayed 120ms; exit `y → 100%` 360ms `--ease-out-quart`. Grid behind gets `inert` + `opacity .5; filter: saturate(.6); transform: scale(.985)`; a `rgba(17,17,17,.24)` scrim at `--z-sheet-scrim`.
- Scroll lock via `html { overflow: hidden; scrollbar-gutter: stable }`; sheet body `overflow-y: auto; overscroll-behavior: contain`. Focus lands on the close button, returns to the trigger card (or the grid heading if it unmounted). Escape and scrim click close. Sticky 56px header with title, subtitle and × (blur backdrop, hairline appears after 8px of scroll).
- Reduced motion: fade only, no transform, grid dims without scale.

## Feature specs

### Reading-line (`src/components/reading/`)
- API: `<Reading band={{ center: .42, height: .22 }} lock="once">` wrapping `<p>` children; atomic inline tokens `<Serif>`, `<Blur>`, `<Tag>`, `<LogoStack logos=[…]>`, `a`, `strong`.
- Split: render each word as `<span class="rt">word </span>`, read `offsetTop` once in `useLayoutEffect`, group by line, re-render grouped under `<span class="reading-line">` with stable keys. Fallback to per-paragraph gradient if grouping re-wraps. Re-split on `ResizeObserver` and `document.fonts.ready`.
- Driver: one singleton on `window.scroll` coalesced to rAF, zero layout reads per frame. Per line `p = clamp((bandBottom - lineCenter) / bandH, 0, 1)`, `fill = easeOutCubic(p)`, `--line-fill = -14% + fill * 128%`; `p ≥ .5` adds `.is-line-active`, `p ≥ 1` adds `.is-line-past` (one-way). Write only when moved ≥ .5%.
- Paint: `@property --line-fill`; `background-image: linear-gradient(90deg, var(--ink) 0%, var(--ink) calc(var(--line-fill) - 14%), var(--ink-dim) calc(var(--line-fill) + 14%))`, `background-clip: text`, `transition: --line-fill 140ms linear`. Past lines drop the gradient.
- Treatments: `<Blur>` `filter: blur(3px)` clearing 600ms on active; `<Tag>` 12px bordered pill with corner dots via four radial-gradient backgrounds; `<LogoStack>` 16px logos with the fanned width reserved (32px for 3), stacked transforms `0/-3°, 3px/0, 6px/3°` and fanned `0,-1px,-12° / 8px,-3px,scale 1.06 / 16px,-1px,12°`, `transition 480ms --ease-overshoot` staggered 40ms.
- Reduced motion: all lines full ink, blur off, logos fanned, driver never subscribes. No aria; text order is DOM order.

### Leaf shadows (`effects/LeafShadow`)
- Canvas 2D, zero assets. 6 pre-blurred sprites (3 species × near/far blur 7px/15px) rasterized once to `OffscreenCanvas`, fill `--leaf`. 14 near + 8 far instances on desktop, 7 + 4 under 768.
- Wind from inline 2D simplex noise: `dx = 14·noise(x·.0015, t·.00012)`, `dy = 8·noise(...)`, rotation ±.06, global drift ≈4px/s, sway ±.5° at .03Hz; night halves amplitude.
- Element `opacity: .26; mix-blend-mode: multiply; filter: saturate(.8)`; height `min(120vh, 980px)` inside the hero+intro wrapper; `mask-image` fades out by 48% and softens both side edges.
- Backing store ≤ 960×640 at DPR 1, 30fps, rAF only while intersecting and visible, `ResizeObserver` debounced. Reduced motion or `saveData`: one static frame.

### Page shell and sky (`effects/SkyLayer`, `SkyGL`, `SkyDial`)
- `.sky` fixed full-viewport at `--z-sky` painting the CSS gradient `linear-gradient(180deg, var(--sky-zenith), var(--sky-mid) 55%, var(--sky-horizon))` plus a 4% `feTurbulence` grain. `.page-shell` opaque paper with `border-radius: 0 0 26px 26px` and `box-shadow: 0 24px 60px -30px rgba(0,0,0,.45)`. Footer is transparent, min-height 440px, so the sky appears only at the end.
- `SkyGL`: own ~90-line GLSL fragment (vertical 3-stop gradient, 2-octave fbm haze at strength .06, hash stars gated by `u_stars`, sun/moon orb glow), dynamically imported when a footer sentinel is within `rootMargin: 100%`, capped `1280×800` at DPR 1, 30fps, fades in over 600ms. Fallback (no WebGL, reduced motion, `saveData`): the CSS layer alone.
- `useLocalHour()` updates every 60s. Keyframes `4.75 night · 6.25 dawn · 8.75 day · 15.75 day · 17.5 golden · 19.25 dusk · 21.25 night`; interpolate L, C linearly and hue along the shortest arc; `--sky-ink` switches (not interpolated) when mid L < .55. Sun y = `sin(π(h−6)/12)`, moon shown when night weight > .5.
- Dial: 36px round button bottom-left of the footer, Phosphor icons `SunHorizon / Sun / CloudSun / MoonStars / Moon`, cycles live → dawn → day → golden → dusk → night → live; arrows step, Home returns to live; 1200ms `--ease-in-out` tween on a MotionValue; label fades in 1.6s; `aria-live` announcement; preview in `sessionStorage`, 45s idle returns to live.

### Sticker stack (`effects/StickerStack`, `content/stickers.ts`)
- Built on `motion` `drag` (no GSAP). Stack = 44px button around the 32px avatar with 3 sticker edges peeking (`8,-6,9° / 13,-10,-7° / 17,-14,15°`), `aria-expanded`, `aria-label="Scatter 10 stickers of things I like"`.
- Scatter: layer `position: absolute` in the page shell; slots in the two margin strips `[24px, colLeft−24]` and `[colRight+24, vw−24]` from `heroTop+40` to `heroTop+900`, 140px rows, jitter ±30/±20, rotation ±8°, seeded per index; under 900px viewport width slots become a two-row band under the hero buttons. Size 96px (72 under 768). Stagger 40ms, `SPRING_STICKER` from the avatar.
- Drag with momentum (`dragElastic .12`, `timeConstant 200`), z bump + `scale 1.06` + deeper drop-shadow on pointerdown. Keyboard: Enter lifts, arrows move 8px (Shift 32), Escape gathers (reverse order, `SPRING_GATHER`, unmount after settle). No persistence.
- Data: `{ id, src, alt, w, h, kind: "sticker" | "photo", interest }`; `kind: "photo"` renders a perforated postage-stamp mask, so a later swap is a data change.
- Assets: 512px transparent PNG → 192px WebP 2× under `public/images/stickers/`. Ten subjects: torch (Tøp Løre), Marcus Aurelius bust with laurel, folded almanac with plum blossom (Koyomi), brass barometer with cloud and sun (Atmos), linocut roller and pressed sheet (print craft), piggy bank with a coin mid-air (Pulse), hourglass with a candle (Memento Mori), printing roll unspooling paper (Rolling Paper), chai in a steel glass [VERIFY city or object], terminal cursor in a speech bubble (designing in code). Alternates: paper crane, fountain pen with ink drop.
- Gemini prompt template: "A single die-cut vinyl sticker of {SUBJECT}, centered on a pure transparent background. Flat illustrated style with a 2px dark ink outline, soft matte fills, subtle paper grain, no gradients, no text, no lettering. Palette limited to warm cream (#f3efe6), near-black ink (#111111), moss green (#5b7f5e), muted sky blue (#7fa6d6), ochre (#d8a855) and brick (#c67e6c). Clean 6px white die-cut border following the silhouette. Calm, quiet, slightly nostalgic mood. Square composition, subject fills about 80% of the frame, straight on. 1024×1024 PNG, transparent." If the model ignores transparency, generate on `#FF00FF` and key out with `sharp`.

### Music (`audio/ambient.ts`, `MusicPill`)
- Graph: master Gain (0 → .5 over 2s, 2s out) → DynamicsCompressor (−18dB, 2:1) → destination. Pad bus .55: 3 triangle oscillators detuned −7/0/+7 cents, per-voice gain LFO .05 to .09Hz, lowpass Q .7 with slow LFO. Wind bus .18: 4s generated pink-noise loop → bandpass 440Hz Q .8 with LFO. Bell bus .35 → delay .42s feedback .28 through 2.4kHz lowpass; bells = sine + partial at ×2.76 (−14dB), 2.8s decay, random 5 to 19s intervals, pentatonic within 2 octaves.
- Mood by hour: dawn D3 A3 E4 / D major pent / 720Hz; day G3 D4 B4 / G major pent / 620Hz; golden E3 B3 D4 / E mixolydian pent / 560Hz; dusk A2 E3 C4 / A minor pent / 460Hz; night D2 A2 F3 / D minor pent / 380Hz. Glide with `setTargetAtTime(…, 2.5)`.
- Nothing constructed until the pill is clicked; `ctx.resume()` inside the gesture; pause on `pagehide`. Preference `vp.settings.ambient` only pre-tints the pill and shows "resume" (no autoplay).
- Pill fixed top-right 20px: 32px tall, `--control-tint`, hairline, 16px CSS disc (conic grooves over a `--sky-horizon → --sky-zenith` radial) spinning 3.2s linear while playing and easing to the next full turn on stop; label `listen / playing / resume`; `aria-pressed`. No marquee.

### UI sounds (`audio/cues.ts`, `SoundToggle`)
- `cuelume` with `setVolume(.5)` (.35 while music plays). Default off, `vp.settings.uiSounds`. Toggle fixed bottom-right 20px, 32px round, `SpeakerSimpleSlash / SpeakerSimpleLow`, `aria-pressed`; first enable plays `arrival` then `toggle`. Hover cues only on `(hover: hover)`, rate-limited to one per 80ms.
- Map: `tick` nav/TOC/card/row enter; `press` card/chip/sticker/dial down; `release` sticker drop, sheet close, gather; `page` sheet open, Open lab, assistant open; `toggle` tabs, toggles, dial; `chime` copy email; `success` note posted; `error` note failed or assistant error; `loading` stream start, `ready` stream end; `sparkle` stickers scattered. `audioPrefs.ts` owns both preferences and a shared mute (`Shift+M`, `visibilitychange`).

### Notes wall (`notes/*`, `convex/notes.ts`, `convex/admin.ts`)
- Schema `notes`: `authorName` (1 to 24, default "Anonymous"), `text` (0 to 280; text or strokes required), `strokes?: [{ c, w, p: number[] }]` (≤40 strokes, ≤200 points each, ≤4000 ints total, 0 to 1000 normalised), `color` (paper | accent | gold | green | blue), `x, y` (0 to 1), `rotation` (−6 to 6), `visitorId`, `createdAt`, `hidden`, `hiddenAt?`; indexes `by_hidden_created`, `by_visitor`. Plus `siteState { key, value, updatedAt }` and `bannedVisitors { visitorId, reason?, createdAt }`.
- `listVisible` query (≤200, strips visitorId). `post` mutation: paused/banned checks, NFKC normalise, strip control and zero-width chars, collapse repeats, length checks, `containsUrl` (http, www, bare TLDs; `@handles` allowed), conservative leet-normalised blocklist, 10-minute duplicate check, rate limits `notePost` 3/hour per visitor and `notePostGlobal` 60/hour, insert with clamped placement. `removeOwn` lets the author hide within 15 minutes. Returns typed `{ ok:false, reason: rate_limited | invalid | blocked | paused, retryAfter? }` mapped to copy ("Links don't go on the wall. Words and doodles only.", "You left a note a moment ago. Give it ten minutes.", etc.).
- Moderation: `convex/admin.ts` mutations `listAll`, `setHidden`, `banVisitor`, `setNotesPaused`, each guarded by constant-time compare against `ADMIN_TOKEN` after `adminAttempt` 10/hour. Hidden `app/admin/notes/page.tsx` (noindex, unlinked) asks for the token, keeps it in `sessionStorage`, shows Hide/Unhide/Ban and a pause switch. Convex dashboard remains the fallback.
- UI: right-edge `NotesPeek` (28×96, vertical "Leave a note", hidden while sheet or assistant is open) and the home section. `<dialog>` `min(720px, 92vw) × min(520px, 86dvh)`, dot grid `radial-gradient(rgba(0,0,0,.14) 1px, transparent 1.2px) / 16px 16px`, drawing canvas (quadratic smoothing, 2.2px round strokes, 2 colours, eraser, undo, clear, RDP simplify ε 1.2), 280-char text + 24-char name, honeypot field, Post. Existing notes render as small paper cards (160 to 200px, ±3° seeded) with strokes as inline SVG polylines; live insert via `AnimatePresence`. Seed two owner notes. Mobile: full-screen dialog, 44px tools. When Convex is unavailable the board shows a static card and a disabled composer.

### Assistant "Ask Vaibhav" (`assistant/*`, `convex/assistant.ts`, `convex/knowledge.ts`)
- Knowledge: `convex/knowledge.ts` builds `SYSTEM_PROMPT` at Convex deploy time from `src/content/{about,case-studies,playground,site-links,assistant-faq}.ts` (Convex bundles relative imports). Sections in order: rules (identity, voice, ≤90 words or ≤180 on request, honesty, off-limits, JSON output `{ answer, followUps[] }`), bio + availability, timeline, work digests + metrics, how I work + opinions (six principles + case-study closers), labs + interests, FAQ as tone examples, off-limits verbatim responses. Budget ≤ 24,000 chars (~6k tokens), guarded by `scripts/check-prompt-budget.mjs`. The full rule text is drafted in the narrative agent output.
- Agent: `new Agent(components.agent, { name: "Vaibhav", languageModel: google(process.env.GEMINI_MODEL), instructions: SYSTEM_PROMPT, contextOptions: { recentMessages: 8, searchOptions: { limit: 0 } }, storageOptions: { saveMessages: "promptAndOutput" }, callSettings: { maxOutputTokens: 350, temperature: .4 }, stopWhen: stepCountIs(1) })`. No tools, no embeddings in v1.
- Functions: `getOrCreateThread(visitorId)` (validates `^v_[a-z0-9]{20,40}$`, rejects banned); `listMessages(threadId, visitorId, paginationOpts, streamArgs)` (verifies ownership, returns `listUIMessages` + `syncStreams`); `sendMessage(threadId, visitorId, prompt)` mutation (1 to 400 chars, pause check, limits in order `askPerVisitorBurst` 6/min cap 3 → `askPerVisitorDaily` 20/day → `askGlobalMinute` 8/min → `askGlobalDaily` env or 180/day, `saveMessage` then `scheduler.runAfter(0, internal.assistant.generate)`); `generate` internalAction streams with `saveStreamDeltas: { chunking: "word", throttleMs: 250 }`, on 429/RESOURCE_EXHAUSTED pauses 20 minutes via `siteState` and saves a curated fallback with `agentName: "fallback"`. Return unions `queued | rate_limited{retryAfter} | paused{until} | invalid{reason}`.
- Client: launcher in the header; panel `position: fixed; right: 0; width: 380px` sliding `x: 100% → 0` with `SPRING_PANEL`; page shell, footer and fixed controls translate by `--push = -min(190px, max(0, contentRight + 24 − (vw − 380)))` (transform, not grid reflow). Header: CSS orb 24px (sky-tinted radial, breathing idle, rotating conic while thinking), "Ask Vaibhav", `<Tag>AI</Tag>`, reset, ×. Persistent label "AI stand-in. Answers come from this site's content." Welcome line + 3 chips ("What are you working on at IDfy?", "How do you ship in code?", "Are you open to new roles?") answered locally with zero network. `useAskThread` is lazy: no Convex traffic until the panel opens; `threadId` in `sessionStorage`; `useUIMessages(..., { stream: true })` + `useSmoothText`. Composer 1 to 5 rows, `maxLength 400`, Enter sends, Shift+Enter newline, Stop while streaming. Fallbacks: `rate_limited` and `paused` show `pickFallback(question)` (keyword overlap against FAQ) with a "curated answer" tag and countdown; `useConvexAvailable() === false` gives chips-only mode. Mobile <768: full-screen sheet with `SPRING_SHEET`, no push. Escape closes; focus returns to the launcher.
- Twelve curated Q→A pairs (work ×3, how I work ×4, availability ×3, interests ×2) and the off-limits responses (compensation, interview pipeline, personal, bank name, jailbreak) are drafted in the narrative agent output for `src/content/assistant-faq.ts` and `about.ts`.

## Reduced motion and accessibility
| Effect | Reduced motion | Touch equivalent |
|---|---|---|
| Leaf shadows | one static frame | same |
| Reading-line | full ink, no driver | scroll-driven |
| Blur / LogoStack | sharp / fanned | reveals on line activation, tap toggles |
| Sky shader | CSS gradient only | same |
| Dial tween | snaps | tap cycles |
| Assistant push | snaps, panel fades 150ms | full-screen sheet |
| Bottom sheet | fade only, grid dims without scale | drag-to-close |
| Card hover | none | press state |
| Stickers | instant placement, 150ms fade, no inertia | drag works |
| Music disc | static, label carries state | same |
| Streaming text | no token animation | same |
| Sound cues | unaffected (separate toggle) | same |

Focus ring `2px solid var(--ink)` offset 3px (`--sky-ink` on the sky). Skip link at `--z-skip`. Icon-only controls have `aria-label` and 44px hit areas on coarse pointers. `--ink-3` only for text ≥12px and never as a control's sole label. Native scroll; `html { scroll-behavior: smooth }` only under `no-preference`.

## Migration order (each step ends with `npm run typecheck && npm run build` green and a commit)

| # | Step | Actions |
|---|---|---|
| 0 | Branch | `git checkout -- app/layout.tsx package-lock.json`; confirm clean; `git checkout -b portfolio_v2`; `npm ci`; baseline build (record `out/` size and route table). |
| 1 | Hygiene | Remove `designlang`; move `playwright` to devDependencies; delete `omit=optional` from `.npmrc`; add `.env*.local` to `.gitignore`; rename `Federal-DP-Main` in `app/mockups/data-compass/assets/page.tsx:144`; delete `bookIntro` placeholder and hidden Speaking block sources. |
| 2 | Convex | Install packages; `npx convex dev` (creates project, `.env.local`, `convex/_generated`); `convex.config.ts`, `schema.ts`, `rateLimits.ts`, empty `notes.ts`; guarded `ConvexClientProvider`. Build with and without `NEXT_PUBLIC_CONVEX_URL`. Set the Vercel build command and both `CONVEX_DEPLOY_KEY`s now so previews exercise the pipeline. |
| 3 | Tokens + shell | `src/styles/*`, `fonts.ts`, `motion.ts`, `breakpoints.ts`; new `layout.tsx` (next/font, no rsms/TownSquare), new `providers.tsx` (Convex › Settings › IconContext › Audio › MotionConfig; no Lenis), `SiteHeader`, `SiteFooter`, `PageShell`, `SkyLayer` (CSS first), `SkipLink`, `not-found.tsx`. Move `globals.css` import into the legacy pages so they keep rendering during the transition. Remove `lenis` and `data-lenis-prevent`. |
| 4 | Home | `about.ts`, `writing.ts`; `home/*`; `reading/*` + `LeafShadow`; `app/page.tsx` → `<HomePage/>`; notes section as static placeholder. Delete TownSquare files and weather code. |
| 5 | Work + sheet | `app/work/page.tsx`, `WorkPage`, `WorkTabs`, `ExperimentsList`, `Sheet`, `useScrollLock`, `useReturnFocus`, `useWorkSheetRoute`. Sheet body shows title + summary until step 6. |
| 6 | Case-study template | Move visuals to `src/components/case-study/visuals/`; port `toc.tsx` → `CaseStudyToc` with scroll root; extract CSS blocks (globals 2894–3163 → `case-study.css`; 3164–3511 → `equalall-diagrams.css`; 3512–5643 → `design-repo.css`; 5644–5821 → `app/covers/design-repo/covers.css`; 6708–6806 → `outcome-impact.css`; 1513–1585 + 6807–6834 → `cover-preview.css`; plus their tier rules from 5822–6707). Build `CaseStudyBody`, `visualRegistry`, `Figure`, `Margin`, `PhoneMedia`, `Fn`, `ReadingPage`, `app/work/[slug]/page.tsx` with `generateStaticParams` + `generateMetadata`. Replace `app/case-studies/[slug]/page.tsx` with the redirect stub. Update script paths. Fix content inconsistencies in `case-studies.ts` once Vaibhav confirms numbers. |
| 7 | Writing stub | `app/writing/page.tsx` from `writing.ts`. |
| 8 | Sky shader + dial + footer polish | `SkyGL`, `SkyDial`, `useLocalHour`, hour palette interpolation. |
| 9 | Assistant | `convex/knowledge.ts`, `assistant.ts`, `assistant-faq.ts`, `assistant/*`, launcher. Set `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL` on the dev deployment; read free-tier caps in AI Studio and size `askGlobalDaily` at ~70% of RPD. Swap intro paragraph 3 and the opinion block to their final variants. |
| 10 | Notes | `convex/notes.ts`, `admin.ts`, `src/shared/*`, `notes/*`, `app/admin/notes/page.tsx`; set `ADMIN_TOKEN` (dev); seed two owner notes; replace the home placeholder. |
| 11 | Stickers, music, sounds | `stickers.ts` + assets, `StickerStack`, `ambient.ts`, `MusicPill`, `cues.ts`, `SoundToggle`, `audioPrefs.ts`. |
| 12 | Cleanup | Delete `app/globals.css`, remaining old case-study files (keep the stub), old `page.tsx`; move `data-compass-tokens.css` import into the mockup entries; rewrite `README.md`; `npm prune`; `.claude/launch.json` convex entry; bundle check with `@next/bundle-analyzer` behind `ANALYZE=1`. |
| 13 | Ship | PR → Vercel preview (preview key creates a Convex preview deployment) → set the Convex env vars on the **prod** deployment → merge → verify prod. |

### File disposition
- **Deleted**: old `app/page.tsx`, `app/globals.css`, `app/case-studies/[slug]/{page,toc,BackRowActions}.tsx` (stub remains), `src/components/TownSquareEmbed.tsx`, `townsquare.css`, `.npmrc` `omit=optional`, deps `designlang`, `lenis`.
- **Moved**: `app/case-studies/[slug]/*Visual.tsx`, `HierarchyExplorer`, `InspectorExplorer`, `DesignRepoPlaybookCards`, `useInViewReveal.ts` → `src/components/case-study/visuals/`; `toc.tsx` → `CaseStudyToc`; `BackRowActions` → `site/SocialLinks`; inline `FlatListMockup` → a visual; CSS blocks per the map.
- **Kept unchanged**: `src/content/*` (+ optional fields), `src/components/{equalall,playground,data-compass}/**`, `app/{mockups,covers,playground}/**`, `public/**`, `scripts/**` (two path edits), `next.config.mjs`, `tsconfig.json`.

## What Vaibhav must supply or decide during the build
1. Convex account and project (`npx convex dev` prompts a GitHub login); Vercel build command change; `CONVEX_DEPLOY_KEY` for Production and Preview.
2. Google AI Studio API key set in the Convex dashboard (dev and prod); confirm the free-tier Flash model ID and its RPM/RPD there.
3. `ADMIN_TOKEN` (32+ random chars) for notes moderation.
4. Content confirmations flagged [VERIFY]: Wysa role and dates; city and remote stance; ₹10Cr wording (ARR vs contract); EqualAll 30% vs 40%; years of experience; keep, soften or drop the `0→1` tag; Disecto and OneThing roles or drop them; whether `public/og-image.png` (gitignored) is actually deployed.
5. Ten sticker images generated from the prompt template (or approval for me to generate them), 20 to 40 Hindi/Hinglish blocklist words for the notes filter, two seed doodles drawn in the composer.
6. Strong-opinion text (later milestone; placeholder ships).

## Verification
- Every step: `npm run typecheck`, `npm run build`, serve `out/` on 8788 and run scripts with `BASE_URL=http://localhost:8788` and `env -u PLAYWRIGHT_BROWSERS_PATH`.
- Existing: `verify-playground.mjs` (steps 3, 12), `verify-equalall.mjs` (steps 6, 12), `audit-*` for visual diffs of ported CSS at 390/768/1440.
- New `verify-routes.mjs`: every route 200 from `out/`, `404.html` present, `/case-studies/equalall/` redirects, all `/work/[slug]/index.html` exist.
- New `verify-work-sheet.mjs`: card click → URL `/work/<slug>/`, dialog visible within 700ms, focus inside, `html` overflow hidden, grid `inert`; Escape → `/work/`, focus back on the card; `goBack/goForward` toggle the sheet; direct load renders `.cs-page` with no dialog; `reducedMotion: "reduce"` shows no transform animation.
- New `verify-assistant.mjs`: chips answer with zero `*.convex.cloud` requests; with a dev URL, one typed message yields streamed text or a fallback within 15s; no element contains "Error" or a stack trace; red-team prompts (salary, notice period, which bank, ignore your rules, are you human) return the off-limits copy.
- New `verify-notes.mjs`: post appears; URL rejected with inline reason; 281 chars blocked client-side; a second browser context receives the new note live; dashboard hide removes it live.
- New `check-prompt-budget.mjs`: system prompt ≤ 24,000 chars.
- Browser MCP preview at desktop and `resize_window mobile` for each milestone; `read_console_messages onlyErrors`; `read_network_requests urlPattern=convex`. Vercel: build log shows the `convex deploy` step before `next build`, no serverless functions, Output Directory `out`, Analytics receiving events; Convex dashboard: prod env vars present, function logs clean, usage under the free budget.
- Bundle budgets (gzipped first-load JS from the route table): `/` ≤ 130kB, `/work` ≤ 170kB before any sheet, each visual chunk ≤ 40kB, `/work/[slug]/` ≤ 260kB, `/playground` unchanged. Lighthouse mobile performance ≥ 90 and accessibility ≥ 95 on `/`, `/work`, `/work/equalall/`.

## Risks
| Risk | Mitigation |
|---|---|
| `omit=optional` breaks `convex deploy` | Removed in step 1; first preview build in step 2 proves it. |
| Convex env vars set on dev but not prod | Step 13 checklist; `generate` throws a clear `ConvexError` absorbed by the fallback path. |
| Gemini free quota exhausted or model retired | Global daily limiter at ~70% RPD, 20-minute circuit breaker, `GEMINI_MODEL` env, curated fallbacks. |
| `ConvexReactClient` connects on every page load | Check in step 2; lazy-mount the provider if so. |
| Reading-line grouping re-wraps a line | Height check falls back to a per-paragraph gradient. |
| CSS extraction misses a tier rule | Visual regression via `audit-*` at three widths in step 6. |
| Sticker images not transparent | Generate on magenta and key out with `sharp`. |
| Profanity filter false positives | Conservative list; hide-in-seconds moderation is the real control. |
