# Portfolio: state

Updated 2026-09-25 (late): `portfolio_v3` is pushed with the scroll blur, see more, people scenes, experiments rail, brand shader cards and the MeitY link. `main` has not taken these yet, so the live site is behind `portfolio_v3`; fast-forward `main` when he wants them live. The old live site is kept on `v1-backup` (`b8d92a6`). `docs/` is tracked in git and public on GitHub. Keep this lean: what is true now, what is next, what is blocked.

## Start here (next chat)
1. Read this file, then the "Data Compass case study" section below, `Case Study Context/Data Compass Story v3.md` (live copy snapshot with the figure map) and the last entries in `docs/journal.md`.
2. Branch `portfolio_v3`. Repo-local git config is `vrarora <vraroraa@protonmail.com>`; check `git config user.email` before committing, no co-author line. The portfolio dev server runs on port 3001 (3000 is his Privy app; never stop either). dc-design runs on 6174/6175; read it, never edit it. The browser pane is usually hidden, so rAF, video play and screenshots stall there; verify with headless Playwright (`chromium.launch()`, bundled Chromium, needs the sandbox off) and read screenshots back.
3. First task: keep filling the Data Compass figure slots as he sends Cap recordings (workflow below). Commit when he asks. `main` serves the live site, so only fast-forward it to `portfolio_v3` when he wants changes live.
4. Still open from before: his review of home copy drafts (`src/content/home.ts`, `footer/Contact.tsx`, story `AFTER_LINES`), music choice, a real-device mobile pass, delete unrouted v2 code, fix `/writing/`, decide on Ask Vaibhav for the v3 home.

## Branches (2026-09-25)
- `main` and `portfolio_v3` share one history. v3 reached `main` by fast-forward, with no PR. The production build passed before the merge.
- `v1-backup` (`b8d92a6`) is the pre-v3 live site. `portfolio_v2` (`3238924`) is the paused v2 work, already inside v3's history.
- All 19 commits after `b8d92a6` were rewritten to author vrarora and force-pushed to `main`, `portfolio_v3` and `portfolio_v2`. Older commit IDs such as `25fbb04` no longer exist.
- The `claude/data-compass-case-study-layout-421623` branch and its worktree are deleted.
- `docs/` is no longer gitignored. Everything in it is public, so keep secrets, tokens and the work email out.

## Data Compass case study (2026-09-25)
- Copy lives in the `data-compass` entry of `src/content/case-studies.ts`. `Case Study Context/Data Compass Story v3.md` is an exported snapshot with every figure, caption and slot; re-export after edits (a small `npx tsx` script that walks `sections` and prints body, bullets and figures).
- Narrative: Storyworthy arc (reader in the Head of InfoSec's seat, elephant = broken product two weeks before a bank POC, PM fight over tree vs flat list as the spine, "I was wrong about the info panel", cuts named). Locked facts: two weeks, ₹10Cr ARR, bank anonymised as "a major private-sector Indian bank", scans are Discovery Scan and Classification Scan, "up to ₹250 crore" per breach, only the decisions from his 2026-09-24 brief.
- Writing rules for this copy: his CLAUDE.md style rules plus `~/Downloads/SKILL (1).md` and `~/Downloads/tropes (1).md` (no em dashes, colon-hinged sentences, fragments, negative parallelism, Wh- headings, title case, synonym cycling). One noun per thing: info panel, tree view, flat list, asset.
- He prefers a one-line lead-in plus bullets over long paragraphs; he converts paragraphs to bullets one by one through page feedback.
- Captions must match what the recording actually shows. Before captioning a clip, extract frames (`ffmpeg -vf "fps=1/3,scale=380:-2,tile=3x3"`) and look.
- Header: title "₹10Cr ARR in two weeks"; cover `public/images/data-compass-cover.webp` (Assets page from dc-design at 1440x900 @2x, light, bottom strip cropped to drop the dev toolbar); link preview `public/images/data-compass-og.jpg` 1200x630 via `ogImage`. The home has no thumbnails; `thumbnailImage` is only a fallback now.
- Figure map (page numbering):
  - 01 fragmented-landscape visual · 02 Available first `available-first.mp4` (new Sort.mp4, premium scroll) · 03 Categories and search `categories-search.mp4` (first Sort.mp4) · 04 Three steps `three-steps.mp4` (Add Asset.mp4; the scan-on-add item was merged into it) · 05 Assets page `assets-page.mp4` (Asset Master.mp4)
  - 06 Scan names · 07 Schedule picker · 08 Stepped setup · 09 Config chips · 10 Jump to Explore: empty slots
  - 11 Flat list: `flat-list-live` (scaled iframe of the mockup, auto-scrolls) · 12 Tree view `tree-view.mp4` (Explore Hierarchy.mp4) · 13 Info panel `info-panel.mp4` (Right Panel.mp4; shows one column only, the text claims per-node-type details)
  - 14 +X chips · 15 Level tooltips · 16 Search and focus · 17 What we cut: empty slots · 18 outcome-impact (2 weeks, ₹250Cr, ₹10Cr ARR)
- Recording workflow: he drops files in `~/Downloads/Recordings/Asset Onboarding/` and names a slot. Always re-encode, even GIFs: `ffmpeg -i IN -movflags +faststart -pix_fmt yuv420p -vf "scale='min(1536,iw)':-2:flags=lanczos" -c:v libx264 -preset slow -crf 24 -an OUT.mp4`, poster with `-frames:v 1 -c:v libwebp -quality 85 OUT-poster.webp`, both in `public/videos/data-compass/`. Then set `media: { src, poster, alt }` on the item, replacing `mediaSlot: true` or `visualType`. If he names a file that has not changed, check the folder for a newer recording and say which one was used. Replacing a file under the same name needs a hard refresh.
- Reader support: `media` (mp4/webm as muted looping video paused off-screen, gif as lazy img, poster under reduced motion) in `src/components/v3/reader/ReaderMedia.tsx`; `mediaSlot: true` renders an empty 16:10 bloom stage; `label` sets the rail entry without a colon in the caption; `coverImage` and `ogImage` on the study. Footer shows only a right-aligned "Next" plus the next study's name.
- Flat-list mockup: `app/mockups/data-compass/flat-list/` (stacked cards, Aperture light values copied from dc-design, Penguin Bank style data, 48,212 results, filters and paging). Inside an iframe it auto-scrolls and pages forward on a loop (3 pages); standalone it stays still for Cap. `app/agentation-devtools.tsx` skips the dev toolbar inside iframes.
- Open: recordings for the nine empty slots; a clip that switches node types in the info panel if he wants the claim shown; the old visual components (`FlatListMockup`, `HierarchyExplorer`, `InspectorExplorer`, `OnboardingFlowVisual`, `ScanWorkflowVisual`) are now unused by the v3 reader.

## Mobile "My work" table (2026-09-25)
- After jaksenc.com/about on phones: a fixed fanned stack of five thumbnails labelled "My work" (renamed from "All work" on 2026-09-25); tapping opens a full-screen table and each thumbnail flies from the stack to its tilted spot (WAAPI FLIP, 440ms, cubic-bezier(0.22, 0.61, 0.36, 1), 18ms stagger); Close or Escape flies them back. Timing came from recording his site with Playwright.
- Files: `src/components/v3/worktable/WorkTable.tsx` and `work-table.css`, items in `src/content/work-table.ts`, thumbnails in `public/images/work-table/`. Mounted in `app/(v3)/layout.tsx`; renders only on `/` and `/work/*`, and only at `(max-width: 699px), (max-width: 1100px) and (hover: none) and (pointer: coarse)`.
- Items: Data Compass, Design Repo, EqualAll, My Story, Playground, About me (home). The current page is underlined and left out of the stack. Close label is "Close" (Jaksen uses "Return to work"); positions follow his layout. Both wait on his call. The stack hides while the people field is open (`html.is-people-open .wt-collection` in `statement.css`).

## v3 (current work)
- `/story`: both acts built. The header name links home; the Work link is gone. Spec and copy: `docs/PORTFOLIO_V3_STORY.md`.
- `/` home, in Inter: a white sheet floating on the live hour sky. Hero (stamp, name, hover cards for location map, world clock, email with a Copy button, resume), Who I am (Learn more, "product design" highlighted), What I do (reading fill, scribble, desirable tag, people field, logo stack), What I've been up to (Data Compass with DPDP tooltip and award notes), Projects table (hover dims other rows; a thick company mark glides beside the row and flips between projects; IDfy shows its full wordmark), Find me cards, riso desk print, signature footer, then the contact sky with an hour slider. Click sounds (cuelume) on by default with a toggle top right; every press draws a click spark and plays a tap (`ClickFeedback`, `audio/tap.ts`; elements with their own cue set `data-click-sound="off"`); custom cursor on fine pointers.
- Scroll blur and see more (2026-09-25, after paulfaivret.com/about): every `[data-scroll-blur]` block in the home column blurs (8px), fades and shifts 64px right as its centre drops from 73% to 115% of the viewport, eased with smoothstep (`useScrollBlur.ts`, mounted by `ScrollBlurColumn`). The hero is left out. Who I am replaced "Learn more / Show less" with a 96px peek under a white fade and a round arrow button; once open, the button sits under the text and points up to fold it back ("Show less"). Committed 2026-09-25.
- Small experiments and Find me (2026-09-25, after jaksenc.com/about, recorded with Playwright): "small experiments" in Who I am is a button (`reveal` token in `home.ts`) that opens `ExperimentsRail` under its paragraph, a sideways-scrolling row of dark cards with the playground preview clips (play on screen, poster under reduced motion), each opening its live build, and a last card to `/playground/`. The rail shows a curated list (`RAIL` in `ExperimentsRail.tsx`): Tøp Løre, Koyomi, Memento Mori, Atmos, Rolling Paper; Pulse and Hover Reveal stay on the playground page only (2026-09-26). It opens instantly, as on his site. Find me cards (`FindMeCard.tsx`) turn to the brand's night colour on hover and a WebGL shader draws the brand mark (Phosphor icon rasterised into a distance field) under the pointer with rings and stepped, grainy light. Written from scratch after reading how his works. Committed and pushed to `portfolio_v3` 2026-09-25.
- `/work/[slug]/` is the v3 reader: a 240px contents rail, an 84px gap and an 832px document shared by text and figures, white page, title-only header, no grey frames inside the figures. The rail sits left of centre; a 160px spacer on the right keeps the document in place. Home and reader live in the `app/(v3)` route group, which wraps SkyProvider and AudioProvider.
- Open for v3:
  - All home copy and the second act are drafts; each line needs his approval. Award wording under Data Compass needs official names. The MeitY note links to the Privy result page (2026-09-25).
  - Portfolio copy should follow `docs/content-writing-guidelines.md`.
  - Resume preview loads from Drive's thumbnail endpoint; host a local copy if Drive ever blocks it.
  - The people doodles (2026-09-25) are eight small scenes: silhouettes under glowing gradient skies, matching the story page, drawn in code in `statement/doodles.ts` and redrawn at 6fps with a light wobble (`DoodleCard.tsx`). Bench under the moon, family on a dusk hill, grandmother and child on verandah steps watching the rain (replaced the ID scene at his request), dog walk, Bikaner doorway with kites, reading by the window, a breath at the sea, waving to birds. The bench card sits at 37vh, nearer the kite card, for balance.
  - The Ask Vaibhav assistant is not on the v3 home yet.
  - Project rows keep case-study order (2025, 2026, 2025); Playground (Experiment Lab) and My Story (Autobiography) years are set to 2026. Both wait on his call. The tap sounds were never heard in testing, only checked for errors.
  - v2 home components (`src/components/home`, `work`, `notes`, `sheet`, `ReadingPage`, `CaseStudyBody`) are no longer routed. Delete them once v3 is approved; `portfolio_v2` keeps them.
  - `/writing/` still redirects to `/#writing`, which the v3 home does not have.
  - The reader's fixed tracks narrow the document on small desktops (about 730px at 1280, 475px at 1024); tracks may need to shrink with the viewport.
  - The email Copy button is desktop only; on touch the envelope opens mail directly.

## v2 (paused)
These notes predate v3 and the merge. The Convex and Vercel ship steps apply only if v2 features come back.

## Now
- Branch: `portfolio_v2` (from `main`). Step 0 done 2026-09-23 (overnight autonomous run; Convex and Gemini keys arrive later, nothing waits on them).
- Baseline build (HEAD b8d92a6 + import fix): 21 static pages, `out/` 25 MB (2.6 MB `_next`), 27 HTML files. Routes: `/`, `/_not-found`, `/case-studies/{data-compass,design-repo,equalall}`, `/covers/design-repo`, `/mockups/data-compass`, `/mockups/data-compass/assets`, `/mockups/data-compass/assets/[id]` x8, `/mockups/equalall`, `/playground`.
- 2026-09-23 feedback round (uncommitted): nav and footer point at home anchors (`/#work`, `/#writing`); `/work/` and `/writing/` are client redirects to those anchors; the case-study sheet mounts in the home `WorkSection`; the notes wall is a canvas panel (`NotesDrawer`, 880px, dot grid, scattered cards, scrim) sliding in from the right when the peek tab, nav or footer Notes is clicked; `RightPanelProvider` keeps it and the assistant mutually exclusive; every home section shares the 582px column.
- Route groups: `app/(site)/layout.tsx` carries the v2 shell (sky, header, footer). Root `app/layout.tsx` is fonts + tokens + providers only, so mockups, covers and playground stay chrome-free. Legacy pages (old home, case-studies, covers) import `app/globals.css` themselves.
- Local Convex: `CONVEX_AGENT_MODE=anonymous npx convex dev` runs a local backend on 127.0.0.1:3210 with no account. `.env.local` (gitignored) points at it. Once Vaibhav logs in, `npx convex dev --configure new` replaces it with a cloud dev deployment.
- `docs/` was gitignored until 2026-09-25 and is tracked now.
- Plan: `docs/PORTFOLIO_V2_PLAN.md`. Copy and assistant KB: `docs/PORTFOLIO_V2_CONTENT_DRAFTS.md`. Log: `docs/journal.md`.

## Next
Step 13, which needs Vaibhav:
1. `npx convex login` then `npx convex dev --configure new` to replace the anonymous local deployment with a cloud dev deployment (writes `.env.local`).
2. Convex dashboard, both dev and prod deployments: `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL`, `ADMIN_TOKEN` (32+ random chars), optional `ASSISTANT_DAILY_BUDGET`. Run `npx convex run notes:seedOwnerNotes` on prod once.
3. Vercel: build command `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY` for Production and a separate Preview key, Output Directory `out`.
4. Open the PR from `portfolio_v2` to `main`, check the preview, merge.
5. Review the items under "Needs Vaibhav" below and the bundle note under "Open".

## Open
- Bundle: `npm run report:bundle` reads 315 kB gz first-load on `/`, 311 on `/work`, 301 on `/work/equalall`; the untouched `/playground` reads 238. The plan's 130/170/260 budgets sit under the React 19 + Next 16 + motion floor and need revising, or the shell needs a motion-free path. Convex client and the assistant thread already load lazily.
- Sticker art is placeholder SVG. Hindi/Hinglish blocklist terms missing. Live Gemini path untested.
- Mobile checks ran through the pane's viewport emulation only; a real device pass is still due.

## Migration steps
- [x] 0 Branch clean + baseline build
- [x] 1 Hygiene (drop designlang, playwright → dev, remove `omit=optional`, gitignore `.env*.local`, rename `Federal-DP-Main`, delete placeholder links)
- [x] 2 Convex scaffold + guarded provider (Vercel build command + deploy keys still need Vaibhav)
- [x] 3 Tokens, fonts, layout shell, header, footer, CSS sky, no Lenis
- [x] 4 Home (intro, reading-line, leaf shadows, up-to, opinion placeholder, writing list, notes placeholder)
- [x] 5 Work page, tabs, experiments list, bottom sheet, pushState routing
- [x] 6 Case-study template (shared body, visuals moved, CSS extracted, /work/[slug], redirect stub, script paths)
- [x] 7 Writing stub route (built early in step 3 as the shell's smoke test)
- [x] 8 Sky shader, dial, hour palette
- [x] 9 Assistant (knowledge, Convex agent, panel, chips, fallbacks); live model path untested until the Gemini key exists
- [x] 10 Notes wall (schema, post/list, moderation page, composer, doodle)
- [x] 11 Stickers (placeholder SVG art), ambient music, cuelume sounds
- [x] 12 Cleanup (globals.css deleted, README rewritten, route and bundle scripts, analyzer wired)
- [ ] 13 Ship (preview, prod Convex env vars, merge). Blocked on Vaibhav: Convex login, Vercel build command, deploy keys, env vars.

## Needs Vaibhav
- Convex account + project; Vercel build command change; `CONVEX_DEPLOY_KEY` (prod + preview)
- Google AI Studio key in Convex env (`GOOGLE_GENERATIVE_AI_API_KEY`) plus `GEMINI_MODEL`; confirm free-tier Flash model id and RPM/RPD. Until set, `generate` saves a curated fallback and pauses live answers for 20 minutes.
- `ADMIN_TOKEN` for notes moderation (prod).
- Run `npx convex run notes:seedOwnerNotes` once on the prod deployment to insert the two owner notes.
- Content confirmations: case-study `year` values I guessed (Data Compass 2025, Design Repo 2026, EqualAll 2025); Wysa role/dates; city + remote stance; ₹10Cr wording; EqualAll 30% vs 40%; years of experience; `0→1` tag; Disecto/OneThing; og-image deployed?
- 10 sticker images: placeholders live in `public/images/stickers/*.svg` from `scripts/build-sticker-placeholders.mjs`; replace the files or the entries in `src/content/stickers.ts`; 20 to 40 Hindi/Hinglish blocklist words; two seed doodles
- Strong opinion text (later)

## Blockers
None. All known technical blockers are scheduled (`.npmrc omit=optional`, `.gitignore .env*`).
