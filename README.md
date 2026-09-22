# vrarora.vercel.app

Vaibhav Arora's portfolio. Next.js 16 App Router as a static export, plain CSS with
design tokens, Convex for the two live features (the "Ask Vaibhav" assistant and the
notes wall), deployed on Vercel.

## Run it

```bash
npm install
npm run dev          # site on :3000
npm run dev:convex   # Convex functions, in a second terminal
```

Without a Convex deployment the site still builds and runs; the assistant answers
from its curated set and the notes wall shows two static cards.

For a local backend with no account:

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Static export to `out/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:prompt` | Fails if the assistant system prompt is over 24,000 chars |
| `npm run report:bundle` | Gzipped first-load JS per route from `out/` |
| `npm run verify:routes` | Every expected route exists in `out/` |
| `ANALYZE=1 npm run build` | Opens the bundle analyzer |

## Layout of the code

```
app/                 routes; (site) carries the shell (sky, header, footer, controls)
  (site)/            home, /work, /work/[slug], /writing, /admin/notes
  case-studies/      legacy URLs, redirect to /work/[slug]
  mockups/ covers/ playground/   standalone artifacts, no site chrome
src/content/         copy and data (case studies, labs, about, FAQ, stickers, seeds)
src/shared/          pure TS shared by the app and convex/ (filters, limits, strokes)
src/components/      one folder per subsystem, CSS beside the components
src/styles/          tokens, reset, typography, layers, utilities, fonts, motion
convex/              schema, rate limits, assistant, notes, admin, knowledge (prompt)
scripts/             asset builders, verification and audits
```

CSS is plain and prefixed per subsystem (`site-`, `home-`, `work-`, `cs-`, `sheet-`,
`ask-`, `notes-`, `fx-`, `audio-`). Legacy `--color-*`, `--space-*` and `--text-*`
tokens remain in `tokens.css` for the mockups, the playground and the case-study
visuals.

## Environment

Vercel: `CONVEX_DEPLOY_KEY` (production and preview), build command
`npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL`.

Convex deployment: `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_MODEL`, `ADMIN_TOKEN`,
optional `ASSISTANT_DAILY_BUDGET`. Seed the wall once with
`npx convex run notes:seedOwnerNotes`.

Local: `.env.local` is written by `npx convex dev` and is gitignored.

## Content notes

No em dashes in site copy. Case-study facts flagged in `docs/` need confirmation
before they are quoted by the assistant.
