# Portfolio v3: the story page

Updated 2026-09-23 (late). Branch `portfolio_v3` (from `portfolio_v2`), committed and pushed.

## Why v3
- Vaibhav rejected v2: it felt like a template, had too many features, didn't feel like him, and looked lifeless.
- v3 splits the site in two:
  - `/story`, an illustrated scroll story of his life.
  - `/`, a simple and elegant portfolio, with case studies at `/work/[slug]/` (see "Home and case studies").

## Locked decisions
| Area | Decision |
|---|---|
| Style | Silhouette figures under glowing gradient skies (the kite film reference). All art drawn in canvas JS, original, no third-party characters or brands |
| Format | Scroll-driven scenes; scroll is walking; one stanza on screen at a time |
| Subject | His life, not his work. Work metaphors are banned from the story |
| Voice | Short poem stanzas, past tense, memoir voice. The present-tense turn is saved for the full ending: "That boy is me." |
| Copy rules | Words carry feeling; visuals support the words; never narrate the picture. No em dashes. Storyworthy checks: five-second moment, start at the opposite, make it little, no lying |
| Figure | A boy who grows into a lean, athletic young man |
| Sound | Generated in code, off until the visitor taps. Currently the first version (piano arpeggio plus market, crickets, rain, birds). A calmer pad version is kept at `docs/reference/soundscape-calm.ts.txt` for comparison |
| Progress | A sun on a small arc at the bottom. The "Work" link sits top right |
| Case studies | Short sky scene, then a calm reading page with the claude.dev-style rail (tree expands per section, filling progress bar) in site type |
| Keep from v2 | Ask Vaibhav assistant, playground experiments |
| Drop from v2 | Stickers, notes wall |

## Facts from Vaibhav (source of truth for copy)
- Born in Bikaner, Rajasthan. House on the main street of a busy market.
- Curious kid: random facts, wanting to be 1% better, wondering why people behave, think and feel as they do.
- Took engineering because it's the safe path in India. Tried cybersecurity (looked cool, couldn't see a life in it). Struggled hard with coding and DSA; felt hopeless about interviews.
- Journaling and reflecting helped. His best friend Chirag guided him through life, but Chirag had no part in finding design; the friend is no longer in the story.
- Third year: a virtual seminar on specialisations, watched at home in his room. Product Design clicked at once. Excited, certain right away.
- Loves: dogs, nature walks, books, journaling, meditation, gym, soft songs (Jeremy Zucker), films, good food, sweets, console games.
- Peace: being in the moment; dim warm lights at home; green mountain plains with a soft breeze.
- Belief: childlike curiosity, learning, growing, creating, and time with the people you love make meaning. We make our own meaning.
- What visitors should feel at the end: calm, serenity.
- The line he'd tell his younger self: "You are going to do great in your life." It goes at the very end of the full story.

## The story (current stanzas)
The story runs in two acts, each on its own 0..1 timeline (`FIRST_LINES`, `AFTER_LINES` in `src/components/story/engine/timeline.ts`); "\n" marks a line break.

First act:
1. Street, golden hour: "He grew up on a busy street in Bikaner, / where the whole world walked past his door." / "He watched them all..." / "What were they thinking?..." / "He didn't know it yet, / but those questions would find him again."
2. The fork (signpost; crowd on the paved road; winding path up a lit hill): "Then the road split in two." / "One was paved, crowded, certain..." / "Everyone said to take the safe one. / So he did." / "He tried to love it..." / "...the smaller he became."
3. Heavy night, rain, lamp, open journal: "Some nights, / he couldn't see tomorrow at all." / "So he wrote..."
4. His room, laptop, rain on the window: "In his third year, alone in his room..." / "Then someone began to talk about people." / "Empathy. Behaviour. / The why behind every choice." / "How to make their lives easier." / "His heart raced with excitement. / For once, not with fear."
5. He walks out of his front door into the rain-washed street: "He couldn't sit still..." / "In a puddle, the boy from that busy street / looked back at him." / "All those questions..." / "He had been this all along."
6. Dawn over Bikaner, he lifts his face: "Everything became clear." / "For the first time in years, / he couldn't wait for tomorrow."

Second act (drafts, need Vaibhav's approval):
7. Daylight walk, the dog follows him: "He went looking for the people / he used to wonder about." / "At Wysa, they were people carrying something heavy, / looking for someone to talk to." (a figure alone on a bench, lit by a phone) / "At Ketto, they were families / asking strangers for help." (a family standing close) / "At IDfy, they were people / trying to prove they were themselves." (a queue at a lit doorway) / "Strangers, like the ones outside his door. / He still wondered what they were feeling." (a crowd passing both ways)
8. Golden park, what he loves: "He never walked past a dog without stopping." / "He read before sleep. / He walked whenever his head got loud." / "Soft songs in his ears. / Heavy weights in his hands." / "Films, games, good food. / And sweets. Always sweets." (a sweets cart) / "He still wrote at night. / The pages were lighter now."
9. Green plains under mountains at dusk, he sits with the dog: "He learned to be where his feet were." / "Nothing to chase. Nothing to prove. / Just one slow breath, then another." / "He came to believe that life means / whatever we make it mean." (fireflies) / "So he made his out of wonder and growing, / out of making things, and the people he loved." / "And on quiet nights, he still made small things, / just to see what would happen." (seven stars join into a constellation; a Playground link sits under it)
10. Ending, first light: "Somewhere on a busy street in Bikaner, / a curious boy once watched the whole world walk by." / "That boy is me." (the boy appears, sitting beside him) / "You are going to do great in your life."

The header's name links back to the home page; the sound toggle sits at the right. There is no Work link.

## Architecture
| Path | Role |
|---|---|
| `app/story/page.tsx` | Route, noindex while in progress |
| `src/components/story/Story.tsx` | Canvas, rAF loop, scroll to progress (smoothed), stanza reveal, sun meter, sound toggle |
| `StoryLines.tsx` | Stanzas as real DOM text (screen readers get the full story) |
| `engine/timeline.ts` | Two acts: `SPLIT`, `firstProgress`, `afterProgress`; `LINES` (both acts, mapped to total scroll), `BEATS` and `AFTER_BEATS`, `PLACES`, both acts' sky keyframes |
| `engine/scene.ts` | `StoryScene`: `first()` and `after()` compose each act; one method per scene |
| `engine/constellation.ts` | Star positions shared by the canvas and the Playground link |
| `draw/land.ts` | Second-act country: wave ridges (roll, peak, puff), trees, wrapping grass, bench, gate, sweets cart |
| `engine/math.ts` | Easing, ranges, colour mix, seeded RNG |
| `draw/figure.ts` | Pose rig, anatomy, rotating head, rim light, `hipHeight` |
| `draw/street.ts` | Bikaner street (fort, havelis, neem trees, shops with shutters, bulbs, crowd, cows, dogs, foreground carts) |
| `draw/hill.ts` | Hill, grass, tree, lamp post, telegraph poles, signpost, far hill with path |
| `draw/room.ts` | His room: window with rain, desk, lamp, shelf, laptop, chair |
| `draw/puddle.ts` | Puddle reflection; the man's reflection becomes the boy under a golden sky |
| `draw/sky.ts` | Gradient, sun, rays, stars, moon, birds, clouds, bloom |
| `draw/atmosphere.ts` | Rain, curiosity lights, grain, paper texture, vignette, glow |
| `audio/soundscape.ts` | WebAudio soundscape; layer gains follow progress |

Rules the code relies on:
- `StoryScene.resize` ignores zero sizes. At zero scale the street builder loops never end, which froze the tab once.
- Silhouettes stay darker than whatever sits behind them; the road and building layers are lifted for that reason.

## Verification notes
- The browser pane pauses rAF while hidden, so its screenshots come back blank. Use headless Playwright instead: `node docs/reference/story-shots.cjs <outDir> <p1> <p2>...` screenshots `localhost:3000/story/` at each scroll fraction.
- The dev server for this repo runs on port 3000. Starting a second `next dev` on 3001 exits because Next allows one per directory.
- Typecheck: `npx tsc --noEmit`, clean at the end of this session.

## Open items for next chat
- Vaibhav to review the latest art pass (child proportions, athletic adult, journal, chair height, look down then up) and the poem copy.
- Music decision: the first version (live) versus the calm pad version (`docs/reference/soundscape-calm.ts.txt`; its timings need retuning to `BEATS` before it replaces `audio/soundscape.ts`).
- Review the second act's copy and art (list above).
- Music: the soundscape now follows both acts (breeze and birds by day, wind and crickets on the plains), but the calm version still needs retuning to both timelines if he picks it.
- Real-device mobile pass. Headless checks at 375px look right for every scene.

## Home and case studies
Route group `app/(v3)`: a quiet shell with SkyProvider, AudioProvider and the custom cursor. Rebuilt 2026-09-24 from his feedback.

| Piece | Reference | What it does |
|---|---|---|
| Frame | anirudh.info, jaksenc.com | A rounded white sheet (`.hm-sheet`, `--hm-paper: #fff`) on the fixed live-hour sky; the sky edges the sheet and opens up under it at the end |
| Layout | jaksenc.com/about, set in Inter | 552px column, 14px body in #565555, 13px section labels |
| Hero | jaksenc.com/about | Perforated stamp photo, name, then India, live IST time, email and resume, each with a dark hover card: a code-drawn Mumbai map with his pinned photo, a world clock with Mumbai lit, the email address with a Copy button, and Drive's first-page resume preview with a download link |
| Who I am | jaksenc.com | Past lead paragraph; Learn more opens present work with playground experiments, life away from screens, evenings. "product design" gets a marker highlight |
| What I do | anirudh.info | Words fill left to right as read; a boiling SVG scribble before "complexity"; "desirable" turns serif in a selection box; "people" has a drawn underline and opens a blurred field of eight stop-motion doodle cards; an IDfy, Ketto, Wysa logo stack cycles on click |
| What I've been up to | jaksenc.com | Data Compass with a DPDP Act tooltip and three award notes (two link to LinkedIn), AI coding and design engineering (GitHub), the story |
| Projects | anirudh.info "Teams" | Table of year, project, role. Hover dims the other rows to 30% and nudges the row 2px. A thick tile glides beside the hovered row and flips like a coin to the next face: IDfy (full wordmark) or Ketto logo for case studies, a bloom with a Phosphor icon for Playground (shapes, role Experiment Lab) and My Story (book, role Autobiography). The tile shows only on fine pointers at 860px and up |
| Click feedback | anirudh.info | Every press draws six strokes bursting from the pointer (320ms, difference blend so it reads on paper and sky). With sounds on, links blip, buttons blip sharper, anything else ticks. Elements with their own cue set `data-click-sound="off"` |
| Find me | jaksenc.com | LinkedIn, GitHub, X cards |
| Desk print | sevenevesai/riso-windowseat | Canvas 2D risograph: four inks (yellow, pink, blue, indigo) screened into dots, out of register, on grained paper. He sits at the desk facing a dusk window over Bikaner, rim-lit; chai, sweets jar, awards shelf, plant, sleeping dog. Reprints at 10 fps while on screen |
| Footer | anirudh.info | Signature in Mrs Saint Delafield that writes in, nav, social icons; then the contact sky ("Get in touch if you want to build something together, or just say hi.") with an hour slider |
| Reader | claude.dev article | White page. A centred grid: a 240px Contents rail (tree and dithered progress bar, no Next link), an 84px gap, an 832px document, and a 160px spacer that keeps the document where a 40px gap would put it. Text and figures share the 832px width. The tree lists only captioned figures. Header is the title alone. Sections sit 58px apart; titles sit on a hairline with the section number. Figures sit on the study's bloom with centred numbered captions and no grey frame inside the card; the outcome stats visual sizes by its container |

Files:
| Path | Role |
|---|---|
| `src/content/home.ts` | Hero facts, statement tokens, logo marks, Who I am, up-to items, Find me cards, bloom palettes, project rows and marks |
| `src/components/v3/v3.css`, `sketch.ts`, `useBoil.ts`, `InkMark.tsx`, `CustomCursor.tsx`, `ClickFeedback.tsx`, `SoundToggle.tsx` | Shared v3 shell styles, hand-drawn line helpers, boiling frame counter, underline and highlight marks, cursor, click spark and tap, sound toggle |
| `src/components/audio/tap.ts` | Synthesized tap sounds (link, action, plain), ducked under music via `cues.ts` |
| `src/components/v3/home/*` | `Home`, `Hero`, `LocalTime`, `WhoIAm`, `UpTo`, `Projects`, `FindMe`, `RichText`, `Term`, `home.css` |
| `src/components/v3/home/hero/*` | `HoverCard`, `MapArt`, `WorldClock` |
| `src/components/v3/home/statement/*` | `Statement`, `useReading`, `Scribble`, `LogoStack`, `PeopleField`, `DoodleCard`, `doodles.ts`, `statement.css` |
| `src/components/v3/home/desk/*` | `DeskScene`, `riso.ts` (the printer), `deskRiso.ts` (the scene), `desk.css` |
| `src/components/v3/home/footer/*` | `CardFooter`, `Contact`, `SkyScrub`, `signatureFont.ts` |
| `src/components/v3/reader/*` | `Reader`, `Rail`, `ReaderVisual`, `outline.ts`, `fonts.ts`, `reader.css` |

Notes:
- All home copy is a draft built from his facts and needs his approval. Follow `docs/content-writing-guidelines.md` for future copy edits.
- Anything that touches `Path2D` or `window` stays inside effects or draw calls; a module-level `new Path2D()` crashed SSR once.
- The home reuses v2's `SkyProvider`, `SkyLayer` and `cues.ts`; UI sounds default on.
