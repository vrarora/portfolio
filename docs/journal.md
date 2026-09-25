# Portfolio v2: journal

Dated log of decisions and notable events. One line per item where possible. Newest at the bottom.

## 2026-09-23 · Planning session
- Studied anirudh.info (frames at 400px scroll steps + CSS), jaksenc.com, lelezhang.design, benji.org/honkish, rachelchen.tech, cuelume.dev, Inspo1.jpeg, the GOATs list (rauno, emil, jakub, paco, shud, raphael), and the component libraries listed. Mechanics recorded in the plan.
- Mapped the current repo: static export, no server, 6.8k-line globals.css, 1.7k-line page.tsx, content as TS objects, 7 labs, TownSquare widget.
- Decided: fresh shell; keep content, case-study visuals, EqualAll demos, labs, images, scripts.
- Decided: Convex backend (Supabase is off limits for this project). Site stays a static export; Convex functions do chat, notes, rate limits.
- Decided: Gemini Flash free tier for the assistant (no paid API key). Curated fallbacks when quota runs out.
- Decided: light theme only; footer sky shifts with the visitor's hour, with a preview dial. Leaf shadows over the intro.
- Decided: GOATs-style hero (name, role, 32px photo byline, three paragraphs), no portrait illustration.
- Decided: Inter 14px base + Instrument Serif italic accents only.
- Decided: drop testimonials, TownSquare, logo marquee, principles cards, services, weather chip.
- Decided: Work with Case studies / Experiments tabs; bottom sheet with real URLs at /work/[slug]/; /playground stays as an easter egg.
- Decided: Writing shows 3 placeholder titles; strong opinion ships as a placeholder.
- Decided: notes wall is public, text + doodle, token-gated moderation page; assistant is a right panel named "Ask Vaibhav", first person, labeled AI.
- Decided: generative Web Audio ambient (no files); cuelume UI sounds off by default; illustrated interest stickers (swappable to photos).
- Decided: native scroll, Lenis removed.
- Found blockers: `.npmrc omit=optional` breaks `convex deploy`; `.gitignore` lacks `.env*`; uncommitted layout.tsx edit would break the Vercel build. All scheduled in steps 0 to 1.
- Created branch `portfolio_v2`; saved plan, content drafts, state and journal in `docs/`.

## 2026-09-23 · Step 0, baseline
- Discarded the uncommitted `app/layout.tsx` and `package-lock.json` edits; `npm ci` clean (174 packages, 10 audit findings, revisit in step 1).
- HEAD did not build: `layout.tsx` default-imported `#agentation-devtools` but the real file exports a named `AgentationDevtools`. Switched to the named import and made the stub export the same name.
- Baseline: 21 pages, `out/` 25 MB, `_next` 2.6 MB.
- Vaibhav is asleep; running steps autonomously with a commit per step. Convex and Gemini keys are deferred; every Convex path must degrade to a static fallback.

## 2026-09-23 · Step 1, hygiene
- Removed `designlang` (unused), moved `playwright` to devDependencies, deleted `.npmrc` (its only line was `omit=optional`), gitignored `.env*.local`.
- Renamed `Federal-DP-Main` to `Primary-DP-Main` in the Data Compass assets mockup so the bank name no longer leaks.
- Deleted `siteLinks.bookIntro` (example.com placeholder) and the hidden Speaking/Writing block plus `aboutMediaItems` in the old `page.tsx`.
- `npm audit` still reports findings in `next`, `sharp`, `postcss`, `nanoid`. `npm audit fix` would bump Next mid-migration; deferred to step 12 cleanup.
- Noticed `docs/` is gitignored on purpose, so docs updates stay local and are not in the commits.

## 2026-09-23 · Step 2, Convex scaffold
- Installed convex 1.46, @convex-dev/agent 0.7.3, @convex-dev/rate-limiter 0.4.0, ai 7, @ai-sdk/google 4, zod 4, convex-helpers (agent peer).
- `npx convex codegen` refuses to run without a deployment, and `npx convex dev` wants a login. `CONVEX_AGENT_MODE=anonymous npx convex dev --once` runs a local backend with no account and generated `convex/_generated`. Components agent and rateLimiter install cleanly, schema indexes applied.
- Wrote `convex/{convex.config,schema,rateLimits,notes}.ts`. Schema per plan plus an optional `owner` flag on notes for the two seed cards.
- `ConvexClientProvider` mounts `ConvexProvider` only after a feature calls `connect()`, so no socket opens on pages that never use Convex. `useConvexGate()` gives `{ configured, ready, connect }`; `useConvexAvailable()` is the boolean.
- Build is green with and without `NEXT_PUBLIC_CONVEX_URL`; the URL is inlined into one chunk when present.
- Pending Vaibhav: Vercel build command `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOY_KEY` for prod and preview.

## 2026-09-23 · Step 3, tokens and shell
- New tokens appended to `src/styles/tokens.css` (legacy tokens stay until step 12). Added `reset.css`, `typography.css`, `layers.css`, `utilities.css`, `fonts.ts` (next/font Inter with opsz axis, Instrument Serif italic 400), `motion.ts`, `breakpoints.ts`, `lib/routes.ts`, `lib/hour.ts`, `lib/prefersReducedMotion.ts`.
- Shell lives in the `(site)` route group so the mockup, cover and playground pages get no header, footer or sky. Root layout only sets fonts, tokens, reset and providers. Removed the rsms.me and TownSquare links.
- `SkyLayer` is CSS-first: picks the nearest hour stop and writes the palette to `:root`. Interpolation and WebGL wait for step 8.
- Footer renders on the sky with `--sky-ink`; a `dial` slot is reserved bottom-left. Header has the wordmark, Work / Writing / Notes, and a `trailing` slot for the Ask launcher.
- Lenis removed (package, `data-lenis-prevent` attributes, README notes). Providers are now Convex > IconContext > MotionConfig(reducedMotion user).
- `/writing` built now as the shell smoke test; `not-found.tsx` reuses the shell pieces directly since it sits outside the group.
- Checked in the browser at 1024 and 375: Inter at 14/460 and the serif load, no horizontal overflow, no console errors.

## 2026-09-23 · Step 4, home
- New home at `app/(site)/page.tsx` via `HomePage`. Deleted the old `app/page.tsx`, `TownSquareEmbed` and `townsquare.css` (the weather chip lived inside the old page, so it went with it).
- `src/content/about.ts` holds the bio, timeline, principles, closers, availability, interests, up-to lines, opinion placeholder variants, work and notes copy, and logo asset records.
- Assets: `scripts/build-home-assets.mjs` crops `me.webp` around the face into `me-64.webp` and `me-96.webp` and trims the IDfy, Ketto and Wysa marks into 36px-tall grayscale WebPs.
- Reading-line shipped as `src/components/reading/`: word tokenisation with atomic inline elements, two-phase measure and group by `offsetTop`, height check falls back to one gradient per paragraph, re-split on width change and `fonts.ready`. One scroll driver for every line, positions cached, `--line-fill` written only on a 0.5% change. Static under reduced motion.
- Treatments: `Serif`, `Blur`, `Tag`, `InlineLogo`, `LogoStack`. The intro uses `InlineLogo` wordmarks in place of company names rather than `LogoStack`, because the assets are wordmarks, not square marks.
- `LeafShadow`: Canvas 2D, three procedural leaf species pre-blurred once, 14 near + 8 far (7 + 4 on phones), simplex wind, 30fps while intersecting and visible, one frame under reduced motion or Save-Data, `mix-blend-mode: multiply` at .26 with a two-axis mask. Tuned sprite size twice; first pass read as blobs.
- Work section shows the three case-study cards (`WorkCard`, `CaseStudyGrid`, `work.css`) linking to the legacy `/case-studies/` pages until step 6; tabs come in step 5. Added a `year` field to `CaseStudy` with guessed values, flagged for Vaibhav.
- Notes wall is a static dot-grid board with the two owner seed notes and a disabled "Leave a note" button.
- Checked at 1024: lines darken as they enter the band, no overflow, build green (22 pages).

## 2026-09-23 · Step 5, work page and sheet
- `/work` at `app/(site)/work/page.tsx` (Suspense around `useSearchParams`). `WorkTabsPanel` is shared by the home section and `/work`: `WorkTabs` (roving tabindex, arrow keys, `layoutId` underline), crossfade panel, `CaseStudyGrid` or `ExperimentsList`.
- `ExperimentsList` rows use a new `blurb` field on `PlaygroundNode`; a poster preview floats right of the list at >=1200 with hover. "See the constellation" links to `/playground/`.
- `useWorkSheetRoute`: `open()` calls `history.pushState({ vpSheet: true }, "", "/work/<slug>/")`, `usePathname` drives the open slug, `close()` goes `history.back()` when this session pushed, else `router.replace("/work/")`. Verified in the browser: URL changes, Back closes, Forward reopens, Escape returns focus to the card.
- `Sheet`: `<dialog open>` portalled into `#sheet-root`, `AnimatePresence`, spring in and 360ms ease out, fade only under reduced motion, scrim click and Escape close, background gets `inert` (`#page-shell`, footer, `[data-fixed-control]`), `html.sheet-open` locks scroll, drag-to-close only on coarse pointers, sticky head shows its hairline after 8px of body scroll. The sheet body ref is published through `ScrollRootContext` for step 6.
- Sheet body is an interim summary (title, lede, metadata, link to the legacy page) until the shared template exists.
- Tab choice on `/work` mirrors into `?tab=experiments` with `replaceState`.

## 2026-09-23 · Step 6, case-study template
- Visual components and `useInViewReveal` moved to `src/components/case-study/visuals/`. Each imports its own CSS: `design-repo.css` (2078 lines, dr/drc/drl/drp/drd/drpb), `equalall-diagrams.css` (eaff, eagap), `outcome-impact.css`, `flat-list.css`, `inline-visuals.css` (the `swv-ripple` keyframes used from inline styles). `drcov` went to `app/covers/design-repo/covers.css`, and the covers page no longer imports globals.css.
- Extraction was done by selector prefix with `scripts/extract-css.py` (a small block parser that keeps nested media queries and pulls referenced keyframes) rather than by the line ranges in the plan, so the old `.case-*` page CSS and placeholder boxes were left behind in globals.css for step 12 to delete.
- `FlatListMockup` moved out of the old page into its own visual. The Data Compass thesis callout became a `callout` field on the section and renders through `Margin`.
- Template: `CaseStudyBody variant="sheet" | "page"` with `CaseStudyHero`, `CaseStudySection`, `CaseStudyToc` (tracks whichever scroller `ScrollRootContext` names), `Figure` (bleed to 760px), `Margin` (serif, absolute in the right margin at >=1200), `Fn`, `PhoneMedia` (phone-framed looping video, pauses off-screen), `visualRegistry` (`next/dynamic`, ssr off, one chunk per visual), `useReveal` with the scroll root.
- `/work/[slug]/` prerenders the reading page with `generateMetadata` and canonical. `/case-studies/[slug]/` is now a noindex stub that `location.replace`s to `/work/<slug>/`, verified in the browser.
- `routes.caseStudy` now points at `/work/`. Scripts `verify-equalall.mjs` and `audit-equalall.mjs` updated to the new path.
- Checked: reading page at 1024 with sticky TOC, sheet variant on `/work` with the design-repo visuals, TOC active state follows the sheet scroll, nothing overflows the sheet.

## 2026-09-23 · Step 8, sky shader and dial
- `src/lib/sky.ts`: sRGB to OKLCH and back, `mixOklch` with shortest-arc hue, `skyAt(hour)` interpolating between the seven keyframes; `--sky-ink` flips to light when the mixed mid stop drops under L .55; sun y = sin(pi(h-6)/12), moon when the night weight passes .5.
- `SkyProvider` owns the palette: live clock every minute, dial preview held in `sessionStorage`, 1.2s tween on a motion `animate()` value between the painted and target palettes, 45s idle return to live, writes the variables onto `:root`. `SkyLayer` and `SkyDial` read it; `HomeLeaves` halves the leaf wind at night.
- `SkyGL`: ~90-line WebGL1 fragment shader (three-stop gradient, two-octave value-noise haze at .06, hashed twinkling stars gated by `u_stars`, sun and moon orbs), loaded with `next/dynamic` once the footer is within one viewport, drawn at 30fps only while the footer is on screen, capped 1280x800, fades in over 600ms once its first frame lands. Falls back to the CSS gradient without WebGL, under reduced motion or Save-Data.
- Bug found and fixed: React strict mode double-runs the effect, and calling `WEBGL_lose_context.loseContext()` in cleanup left the remounted canvas with a dead context. Cleanup now only deletes the program and buffer.
- `SkyDial`: 36px button bottom-left of the footer, icons SunHorizon / Sun / CloudSun / MoonStars / Moon, click cycles live > dawn > day > golden > dusk > night, arrows step, Home returns to live, label fades for 1.6s, `aria-live`.
- Verified in the browser: night stars, dawn and golden previews, Home key resets, preview persists in sessionStorage.

## 2026-09-23 · Step 9, Ask Vaibhav
- Content: `src/content/assistant-faq.ts` (12 curated Q>A with keywords and follow-ups, 3 marked as chips, 5 off-limits rules, panel copy). `src/shared/pickFallback.ts` scores a question against keywords (off-limits win outright) and `src/shared/assistantOutput.ts` defines the answer format.
- Format change from the plan: the model writes plain text, then a `---` line and up to three follow-ups, instead of JSON. Streaming JSON would have shown brackets mid-stream; this stays readable and the client parses follow-ups once the message completes.
- `convex/knowledge.ts` assembles the system prompt from the content modules at deploy time; `npm run check:prompt` (tsx) reports 23,628 chars against the 24,000 budget, so there is little headroom for new copy.
- `convex/assistant.ts`: `getOrCreateThread`, `listMessages` (ownership check, `listUIMessages` + `syncStreams`), `sendMessage` (length, ban, pause, then limits in order burst > daily > global minute > global daily), `abort`, `generate` internal action. The Agent is built inside the action so a missing `GEMINI_MODEL` cannot break module load. Missing key or any error saves a `pickFallback` answer with `agentName: "fallback"`; missing key or a quota error also pauses live answers for 20 minutes via `siteState`.
- Client: `AskProvider` (open state, page push by the reading column, capped 190px), `AskLauncher` in the header, `AskPanel` (fixed 380px, spring in, full-screen sheet under 768, Escape closes, focus returns to the launcher), `AskThread` (the only component using Convex hooks), `MessageBubble` with `useSmoothText`, `Composer` (Enter sends, Shift+Enter newline, Stop while streaming), `SuggestionChips`, `FallbackNotice` with a live countdown.
- Two bugs cost the most time. First, `useUIMessages` returns a new array every render, so anything derived from it re-registered callbacks forever; items are now derived from a content fingerprint. Second, `ConvexClientProvider` used to switch from bare children to `<ConvexProvider>` on connect, which remounted the whole layout and reset the panel's open state. The provider now only holds the client, and `ConvexScope` wraps the single leaf that uses Convex hooks.
- `useReturnFocus` stole focus to the launcher on page load; it now only restores focus after having been active.
- Home copy switched to the post-assistant variants (intro paragraph 3, opinion block).
- Verified against the local anonymous Convex: chip answers with one WebSocket and no function calls, a typed question saved and answered by the fallback path with the curated tag, the pause notice with countdown, and off-limits detection for the bank name. The agentation devtools toolbar in dev captures clicks when its annotate mode is on; that confused one round of testing.

## 2026-09-23 · Step 10, notes wall
- Shared, pure TS in `src/shared/`: `limits.ts`, `blocklist.ts` (English only, conservative; Hindi/Hinglish pending), `textFilters.ts` (NFKC, control and zero-width strip, repeat collapse, URL and email detection with @handles allowed, leet-folded blocklist, `validateNoteInput`), `strokeCodec.ts` (RDP simplify, 0..1000 integer grid, server-side shape check). Both the client and Convex import these.
- `convex/notes.ts`: `listVisible` (strips visitorId), `wallState`, `post` (honeypot, pause, ban, filters, ten-minute duplicate check, `notePost` 3/hour per visitor then `notePostGlobal` 60/hour, clamped placement), `removeOwn` within 15 minutes, `seedOwnerNotes` internal mutation. `convex/admin.ts`: `verify`, `listAll`, `setHidden`, `banVisitor` (optionally hides that visitor's notes), `unbanVisitor`, `setNotesPaused`, each behind a constant-time token compare; failed attempts consume `adminAttempt` 10/hour, successful ones do not.
- UI: `NotesWallSection` connects Convex only when the section comes within half a viewport; static seed cards when no URL is configured. `NotesWall` (live board, AnimatePresence inserts, "Pinned" hint for 4s), `NoteCard` (absolute on the board, two-column stack under 768), `NoteComposer` (`<dialog>` with name, 280-char note, five paper colours, honeypot, doodle), `DoodleCanvas` (pointer events, quadratic smoothing, ink and moss, eraser, undo, clear), `DoodleSvg` (polylines in a 1000-unit viewBox), `NotesPeek` (right-edge tab, hidden while the sheet or assistant is open), `placement.ts` (emptiest grid cell, bottom-right reserved for the button).
- `/admin/notes/` is noindex and unlinked; the token sits in sessionStorage. Set `ADMIN_TOKEN` locally with `npx convex env set` and seeded the two owner notes with `npx convex run notes:seedOwnerNotes`.
- Tripped over two tooling things: a heredoc turned `\u2028` escapes into the literal characters and broke the regex (rewrote it through Python), and the Convex watcher had stopped on that error so `_generated/api.d.ts` lagged until a manual `--once` push.
- Verified in the browser: seeds render with doodles, a drawn and typed note posts and appears live with Remove, the moderation page lists all three and hides one.

## 2026-09-23 · Step 11, stickers, music, sounds
- No sticker art and no Gemini key, so `scripts/build-sticker-placeholders.mjs` draws ten flat die-cut SVGs (cream, ink, moss, sky, ochre, brick) for the subjects in the plan. `src/content/stickers.ts` keeps the `{ id, src, alt, w, h, kind, interest }` shape, so the illustrated set is a file swap.
- `StickerStack` wraps the 32px avatar in a 44px button with three peeking edges. Scatter portals a layer into `#page-shell`: margin strips beside the intro column (two-row band under the hero buttons below 900px), 40ms stagger, `SPRING_STICKER` from the avatar, drag with momentum, pointer-down z bump, keyboard lift and arrow moves, Escape gathers in reverse. Reduced motion places instantly and fades.
- AnimatePresence left the exit-animated stickers in the DOM at opacity 0, so the layer now also unmounts itself 1.4s after a gather.
- Audio: `ambient.ts` builds the graph only inside `start()` (three detuned triangles under a slow lowpass, 4s pink-noise wind through a bandpass, pentatonic bells into a 0.42s delay, compressor on the master), moods by hour with `setTargetAtTime` glides. `cues.ts` maps the site's cue names onto cuelume with an 80ms hover guard; `audioPrefs.ts` persists `vp.settings.uiSounds` and `vp.settings.ambient`. `AudioProvider` owns both, halves cue volume under music, pauses on hide, and Shift+M mutes everything. `MusicPill` top right (listen / playing / resume, spinning disc), `SoundToggle` bottom right, both tinted by `--control-tint` and translated by `--push`.
- Cues wired: copy email chime, tab toggle, sheet page/release, card tick and press, note success/error, assistant page/loading/ready, dial toggle, sticker sparkle/press/release.
- Header gains right padding for the pill; under 480px the Notes nav link hides so the wordmark stays on one line.
- Verified at 1024: scatter and gather leave no stray elements, no console errors, prefs persist, pill shows playing. The pane's viewport emulation does not fire resize, so mobile sticker positions could only be checked on a fresh load.

## 2026-09-23 · Step 12, cleanup
- Deleted `app/globals.css` (nothing imported it after step 6). Legacy tokens stay in `tokens.css` because the mockups, the playground and the design-repo visual CSS still read `--space-*`, `--color-*` and `--text-*`.
- `data-compass-tokens.css` moved from the root layout into the three Data Compass mockup entries.
- README rewritten for the v2 layout, scripts and environment.
- New scripts: `verify:routes` (every expected page in `out/`, stub points at `/work/`, no em dash on the home page) and `report:bundle` (gzipped first-load JS per route, nomodule polyfill excluded, budgets from the plan). `@next/bundle-analyzer` wired behind `ANALYZE=1`, though under Turbopack `next experimental-analyze -o` is the one that produces output.
- Bundle reality: 315 kB gz on `/` against a 130 kB budget. The attribution pass showed the floor is React DOM (63), the Next client runtime (about 55), motion (about 45) and the polyfill; app code and content are a small slice. Lazy-loading `convex/react` (built inside `connect()`), `AskThread` and `MessageBubble` took 4 kB off every page. Left as an open item with the numbers in state.md.
- The `agentation` devtools chunk (89 kB gz) exists in local builds only; the file is gitignored and the config aliases the stub on Vercel.
- Skipped `npm audit fix` again: it bumps Next and should be its own commit with a full check.
- Sanity check after the lazy client: assistant opens, connects, answers a typed question, no console errors.

## 2026-09-23 · Feedback round: anchors, notes canvas, alignment
- Header and footer Work and Writing point at `/#work` and `/#writing`; Notes is a button. `/work/` and `/writing/` keep their static files but `RedirectHome` replaces the location with the home anchor (a full navigation so the browser scrolls). Case studies keep `/work/[slug]/`.
- With no Work page the sheet mounts in the home `WorkSection`; `useWorkSheetRoute.close()` falls back to `/`. `WorkPage.tsx` deleted.
- Notes wall left the home flow. `NotesDrawer` is an 880px canvas (dot grid, scattered cards, scrim, Escape, focus return) sliding in from the right; phones get a bottom sheet with the stacked layout. `RightPanelProvider` owns which right-edge panel is open so the assistant and the canvas never overlap; only the assistant pushes the page (`lib/panelPush.ts`).
- The canvas sits above the fixed audio controls (`--z-notes-scrim 56`, `--z-notes 57`) after the listen pill covered the first drawer's close button.
- Home sections all use the 582px reading column; `home-bleed` removed. Work and notes had been 760px, which read as inconsistent margins.
- Pane note: while the browser pane is hidden rAF stops, so Motion animations freeze mid-flight. Front the tab before timing an animation.

## 2026-09-23 · v3 begins: the story page
- v2 rejected. Studied five reference films frame by frame and the claude.dev Opus 5.5 article rail. Vaibhav chose the silhouette sky style, scroll-driven scenes, and his own life as the subject.
- Several question rounds settled the facts (Bikaner, engineering, the struggle, the seminar at home) and the rules: the story is not about work, words carry feeling and never narrate visuals, no ketchup bottle, no kite, no friend.
- Built `/story` on a new `portfolio_v3` branch as a canvas engine with separate draw modules, a WebAudio soundscape and a DOM stanza overlay.
- Rewrote the copy three times, landing on Storyworthy structure plus prose-poetry craft: past tense, short stanzas, concrete images, strong line endings.
- Art pass: anatomical figures with a rotating head and rim light, clouds, bloom, paper texture, a fork with a signpost, a lamp-lit journal, his room, and a puddle where his reflection becomes the boy. Also shutters at night, a stray dog, neem trees and foreground carts.
- Bugs found and fixed: a zero-size viewport froze the tab (the scale unit hit zero and the street loops never ended), and the last stanza was cut off before the scroll ended.
- Tooling: the hidden pane gives blank screenshots, so verification uses headless Playwright captures. The dev server lives on 3000.


## 2026-09-23 · v3: second act, home, reader
- Story: split into two acts with their own timelines so the tuned first act kept every number. The second act walks from his street into daylight (the dog follows), past a bench, a family and a lit doorway for Wysa, Ketto and IDfy, through a golden park with a sweets cart, onto green plains at dusk, under stars that join into a constellation linking to the playground, and ends at first light with the boy sitting beside him. New `draw/land.ts` for ridges, trees, grass and props; soundscape follows both acts.
- Art fixes after the first captures: seated arms rest on the knees instead of reaching forward; the treeline uses rounded "puff" waves; mountains take the sky's colour; the last stanza now fully writes in before the scroll ends.
- Home: studied anirudh.info (Inter 32px/500, text darkening from 32%), jaksenc.com (stamp hero, vinyl shelf CSS), benji.org (quiet column). Built the stamp hero, darkening narrative with logo stacks, vinyl shelf and a drifting CSS bloom.
- Reader: studied the claude.dev Opus 5.5 article rail (tree with └ branches, dithered progress, mono labels, figure caption rows). Rebuilt `/work/[slug]/` on it and reused the v2 visual registry inside bloom figure frames.
- Checks: typecheck, production build (28 pages), `verify:routes`, no em dashes in exported HTML, no console errors on the new pages, 375px captures with no horizontal overflow.

## 2026-09-24 · Home rebuilt after jaksenc.com/about
- Vaibhav asked for the home to follow jaksenc.com/about: layout and look, no extras, but in Inter.
- Frame: a fixed rounded box whose outward box-shadow paints the mat, so the page keeps native document scroll. Hidden under 620px.
- Sections: Who I am (lead paragraph, Learn more opens the rest with a 0fr to 1fr grid-row transition, collapsed text is inert), What I've been up to, Projects (the vinyl shelf), Find me cards (LinkedIn, GitHub, X). Resume icon added to the hero meta.
- Removed the darkening narrative, the page bloom and the footer. `Narrative.tsx` and `SiteFoot.tsx` deleted; `RichText` renders linked phrases from `home.ts` tokens.
- Port 3000 was running the Privy app; the portfolio dev server was already on 3001.
- Checked at 1440 and 375: no console errors, no horizontal overflow. Copy is a draft from his facts.
- Second pass the same day: Who I am rewritten on Jaksen's arc (past, present with playground experiments, away from screens, evenings). What I've been up to is now Data Compass with a DPDP Act tooltip and three award notes, learning AI coding and design engineering (GitHub), and the story. Award wording is a draft.
- Custom cursor (`src/components/v3/CustomCursor.tsx`) mounted in the v3 layout, so it covers the home and the reader but not `/story`. Fine pointers only; shrinks over links and buttons; steps aside for text fields.

## 2026-09-24 · Anirudh pieces on the home
- Studied anirudh.info: recorded a scroll with Playwright, split it with ffmpeg, read the markup and CSS. Reading lines fill left to right; the scribble is a GIF; "desirable" turns serif inside a selection box; "people" has a rough-notation underline and opens a blurred field of GIF cards; logos stack and cycle on click; the page card lifts off a fixed hour sky with a dial.
- Built our own versions: `statement/` (per-word reading fill with a left-to-right sweep, a boiling SVG scribble, the desirable tag, the people field with eight code-drawn stop-motion doodles, a tinted logo stack for IDfy, Ketto, Wysa), `InkMark` (hand-drawn underline and marker highlight; "product design" in Who I am is highlighted), `desk/DeskScene` (SVG desk scene with a sleeping dog, chai, sweets jar, awards shelf; CSS loops run only on screen), `footer/` (signature in Mrs Saint Delafield that writes in, nav, socials; contact sky with a tick slider over the v2 SkyProvider).
- v3 layout now wraps SkyProvider and AudioProvider. UI sounds default on (cuelume); a speaker toggle sits top right.
- Bug: the page card and the Find me cards both used `.hm-card`; the page card is `.hm-sheet` now.
- Motion stays on the existing `motion` dependency plus CSS; anime.js was not needed.
- Checked at 1440 and 375: no console errors, no horizontal overflow, the slider previews the day sky.
- Desk scene redone as a risograph print after sevenevesai/riso-windowseat: `desk/riso.ts` is a small printer (a coverage plate per ink, rotated dot screens, soft dot edges, out-of-register offsets, grained paper, multiply), `desk/deskRiso.ts` draws the scene per plate with knockouts and coverage ramps. Four inks: yellow, pink, blue, indigo. He sits at the desk facing a dusk window over Bikaner, rim-lit by the sun; chai steam, lamp flicker, the dog's breath and his nod move at 10 fps while on screen. No long tasks at 2x.
- Bug caught: a module-level `new Path2D()` crashed SSR with a 500; shapes are built inside the draw call now.
- Hero hover cards after jaksenc.com: `hero/HoverCard` (hover or focus, tap on buttons, a bridge over the gap, contents mount on first open), location card with a code-drawn Mumbai street map and his pinned photo, world clock with Mumbai lit, email label, resume card with Drive's first-page preview and a download link. Role line removed from the hero. Resume preview loads from Drive with `referrerPolicy="no-referrer"`.

## 2026-09-24 · Reader in a single narrow column
- Worked in a separate worktree session, then fast-forwarded onto `portfolio_v3` as `8078eb6`.
- The reading column is 550px wide beside a floating contents rail, in 14px type, on a white background.
- The header drops the chip and the metadata grid; the eyebrow and reading time share one line under the title.
- Section titles sit on a hairline with the section number at the end; kicker text is gone.
- Figures frame at column width with centred captions; the cover image sizes to 550px.
- The rail's Next link is removed.
- The outcome stats visual sizes by its container instead of the viewport.

## 2026-09-24 · Projects table, click feedback, white sheet
- Studied anirudh.info's Teams list and click effects from its bundle: rows dim to 0.3 around the hovered one, a three.js logo floats left of the row, a canvas draws six strokes per press, and Web Audio synthesizes the taps.
- Projects is now a table (`Projects.tsx`, rows in `home.ts`); the vinyl shelf and `Shelf.tsx` are gone. The floating mark is CSS 3D instead of three.js: two faces with eight shaded edge slices between them, a spring glide between rows and a 180° flip per change, so the hidden face always takes the new mark.
- Bug caught: a `drop-shadow` filter on the coin flattened its 3D children and the edge slices painted over the logo. The shadow moved to the outer wrapper.
- Playground and A story tiles were blank blooms; they now carry Phosphor icons (shapes, book).
- `ClickFeedback.tsx` in the v3 layout draws the spark and plays `audio/tap.ts` sounds when sounds are on. LogoStack, the people word and field, Learn more and the sound toggle opt out with `data-click-sound="off"`.
- Sheet colour `--hm-paper` changed from #fbfbfb to #fff.
- Checked at 1440 and 375: typecheck clean, no console errors, no horizontal overflow, spark draws and clears on the canvas.

## 2026-09-24 · Reader and home feedback round
- Reader: the eyebrow with reading time and the summary are gone, so the header is the title alone; `readingMinutes` was deleted with them.
- Reader grid follows a reference he shared: rail, gap, document, spacer. Rail widened to 240px so no label wraps on any study; the 160px spacer offsets the gap so the document stays at x=419 at 1505px. Text and figures share 832px.
- The tree drops uncaptioned figures ("Figure 1") instead of numbering them.
- The six Data Compass visuals lose their grey `#eef0f2` frame; the step labels in scan and onboarding get 12px above and below. These components are shared with the unrouted v2 pages.
- `/story`: Work link and its `#work` anchor removed; the name links home.
- Home: rows renamed to My Story (Autobiography) and Playground (Experiment Lab); footer link reads My Story. The email hover card is interactive now with `hero/CopyButton` (chime, "Copied" for 1.6s, mailto if the clipboard is blocked). The IDfy tile uses the full wordmark, contained with 8px padding; the logo stack keeps the square mark.
- Checked with headless Playwright at 1505: no console errors, clipboard holds the address, name link lands on `/`.


## 2026-09-25 · Data Compass story, media slots, mobile All work
- Planned the rewrite from his raw brief, Storyworthy (Matthew Dicks) and the UX Case Study Crisis PDF. Locked with him: two weeks (not three), ₹10Cr ARR, bank anonymised, Discovery and Classification Scan, only the decisions in his brief (the June triage details are out), no note that recordings show the later dc-design redesign.
- Wrote the copy under his style rules plus the writing-whip SKILL and tropes list; he approved it, then reshaped it through page feedback: most paragraphs became a lead-in plus bullets, scan-on-add merged into the three-steps item, the scan setup lead figure went, "None of it was on screen." went.
- Reader: `media` (video or GIF, poster under reduced motion, paused off-screen), `mediaSlot` empty bloom stages for recordings to come, `label` for rail entries, `coverImage` and `ogImage` fields. Footer now shows only a right-aligned "Next" with the next study's name.
- Flat-list mockup built in the portfolio, not dc-design, after he said dc-design must not be touched: stacked cards in Aperture light values read from dc-design. Shown in the case study as a scaled iframe that auto-scrolls and pages on a loop. Bug: the iframe scale was stored as state and went stale when the frame size changed under HMR; it now derives from the measured width. The dev toolbar is skipped inside iframes.
- Recordings added so far: premium scroll, categories and search, add asset in three steps, assets page, Explore hierarchy, info panel. A 36 MB GIF became a 3 MB mp4; every clip is re-encoded to 1536px H.264 with a webp poster. One caption was rewritten after he pointed out it did not match the video; captions are now written only after looking at extracted frames.
- Hero cover and link preview are a light-mode 2x screenshot of the dc-design Assets page (Chrome CLI screenshot; Playwright with the Chrome channel failed under the sandbox, the bundled Chromium works with the sandbox off).
- Mobile All work table after jaksenc.com/about, recorded with Playwright and read frame by frame: fixed thumbnail stack, full-screen table, FLIP flight out and back, current page underlined. Checked in Playwright at 390x844 on a case study and the home: tap opens, Close restores focus and scroll, tapping My Story navigates, hidden at desktop width, no console errors.
- Checks: typecheck clean after every change; no eslint config in the repo.

## 2026-09-25 · Merge to main, author rewrite, docs tracked
- Kept the pre-v3 live site as `v1-backup` at `b8d92a6` and pushed it.
- Committed the day's work, ran `next build` (passes, 29 static pages), fast-forwarded `main` to `portfolio_v3` and pushed.
- 12 of the 19 new commits carried his work identity. Rewrote author and committer to vrarora with `git filter-branch` over `^b8d92a6`, confirmed the trees matched, and force-pushed `main`, `portfolio_v3` and `portfolio_v2`.
- Set repo-local git config to vrarora. Global config stays his work account.
- Deleted the stale `claude/data-compass-case-study-layout-421623` branch and worktree after checking it had no changes and matched `b8ef8ae`.
- At his request, removed `docs/` from `.gitignore` and committed it to `portfolio_v3` and `main`. The repo is public, so the work email and the local dev admin token were stripped from the docs first.

## 2026-09-25 · Scroll blur, see more, people scenes
- Recorded paulfaivret.com/about with Playwright and read it with ffmpeg and computed styles. His blocks blur (up to 8px), fade and shift 4rem right as they near the bottom of the viewport, scroll-linked through Webflow interactions. His reading list clips at 28rem under a gradient overlay with a round arrow.
- Home: `useScrollBlur` applies the same curve (smoothstep, centre from 73% to 115% of the viewport) to every `[data-scroll-blur]` block; sharp blocks carry no inline styles. Who I am now peeks under a fade with a round arrow that opens and, at his request, folds back ("Show less").
- People doodles redrawn as silhouettes under glowing skies, the story page's style. Rectangles draw with straight lines (`linePath`) because duplicated corner points made small loops in the Catmull-Rom curve. He asked to replace the ID scene; it is now a grandmother and child watching rain from lit verandah steps.
- Mobile stack renamed "My work" and hidden while the people field is open.
- The portfolio dev server ran on 3000 this session; 3001 would not start beside it.

## 2026-09-25 · Experiments rail and brand shader cards
- Recorded jaksenc.com/about. "design skills further" is a button that mounts a horizontal rail of dark media cards under the sentence, with no animation. The Find me cards swap to a dark brand colour and fade in a WebGL canvas: the brand mark as a distance field under the pointer, rings, posterised light.
- Built both for the home: `ExperimentsRail` from `playgroundNodes`, reusing `ReaderMedia` (now takes a class name), and `FindMeCard` with its own shader and a chamfer distance field built from the Phosphor logo at first hover.
- Gotcha: `.v3 a { color: inherit }` outranks a single class on a link, so the rail sets text colours on the children.
- Linked the MeitY award note to the Privy result page. Production build passed; committed and pushed `portfolio_v3`. `main` left as is.

## 2026-09-26 · Experiments rail order
- At his request the rail leads with Tøp Løre and drops Pulse and Hover Reveal. The order lives in a `RAIL` id list in `ExperimentsRail.tsx`, so the playground page keeps all seven.


## 2026-09-26 · Data Atlas scroll board
- Studied two references with Playwright: arj's annotated case-study video (dark UI, red hand-drawn strikes, stepped player) and about.senbuzy.com (one sticky scene scrubbed by scroll, with a moving camera). Drawesome was ruled out because it draws for the viewer and cannot replay strokes.
- Locked with him through questions: scroll scrubs and reverses, white dotted board, true pen strokes, red and green ink, real product UI, scroll only, 60 to 90 seconds, reading version kept as the fallback. A grey-box sketch settled the camera: it pans across one board.
- Shipping the real app would publish IDfy's front-end code whatever the repo visibility, so the board shows frozen DOM snapshots instead. He chose the rename to Data Atlas.
- Built the pen font, marks, timeline, board, fallback switch, redirect and rename. A capture agent built the snapshot script; all states match the live app.
- Bugs found while checking: all snapshots in a frame showed at once because the layers were read before the iframes mounted (the effect now reruns when they mount); several notes sat outside the camera's framing (cameras now frame the union of the mark and its note).
- Replaced four onboarding recordings, added Scan Names, and merged the schedule picker and stepped setup into one item with the Cron and Exclusions recording, cut to a lead-in plus bullets.
- Checks: tsc clean, headless Playwright beat screenshots, reversal, phone and reduced-motion fallbacks, `?read=1`, legacy redirect, Home button, Agentation present.

## 2026-09-26 · Data Atlas reading version pass
- Worked through his Agentation notes on `?read=1`. Merged the config chips and Jump to Explore items, removed the "Explore was next" line, and cut the Explore, info panel and Scale copy to the rules in `SKILL (1).md` and `tropes (1).md`. Merged +X chips and level tooltips into one item and removed "What we cut".
- Filled the remaining slots from his recordings (asset chips, level info, file tree) and replaced the tree view and info panel videos. Captions and bullets were changed to match what each recording shows.
- The outcome now has two metrics, ₹10Cr ARR and 2 weeks. The visual takes any metric count, and only the horizontal lines move.
- Gotcha: the 3001 server had been running from the `data-atlas-board` worktree, so the edits landed there first. They were copied into `portfolio_v3` in the main checkout. Next 16 allows one `next dev` per project, and the dev server now runs on 3000 from the main checkout, started by him.
- Committed and pushed to `portfolio_v3` as `438b960`. `main` not updated. The `data-atlas-board` worktree still holds an uncommitted copy of the same changes and can be deleted.
