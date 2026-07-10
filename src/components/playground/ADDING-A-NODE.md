# Adding a new experiment to the Playground

> Working with Claude? There is a matching skill, `add-playground-node`
> (`.claude/skills/add-playground-node/SKILL.md`), that drives this whole
> procedure with the technical gotchas baked in. This file is the plain-English
> version for doing it by hand.

This guide assumes nothing about the codebase. Follow it top to bottom and
a new node appears in the constellation. Total hands-on time is usually
under 30 minutes; most of it is waiting for the build/recording scripts.

You will end up with three things:

1. **A live build** the "Open live ↗" button links to → `public/labs/<slug>/`
2. **A preview loop + poster** for the hover box and stage →
   `public/playground/<slug>/preview.mp4` and `poster.webp`
3. **One new entry** in `src/content/playground.ts`

Pick a **slug** first: a short lowercase name with hyphens, e.g.
`ripple-clock`. It becomes the URL (`/labs/ripple-clock/`), the folder
names, and the deep link (`/playground/#open-ripple-clock`).

---

## Step 1 — Ship the live build

If the experiment lives in a GitHub repo that builds to static files
(Vite, plain HTML, etc.), add one entry to the `LABS` array near the top
of `scripts/build-labs.mjs`, copying whichever existing entry matches:

- Vite + TypeScript project → copy the `koyomi` entry, change the slug and
  repo URL, and make sure the `--base=/labs/<slug>/` flag uses your slug.
- Plain HTML/CSS/JS files, no build step → copy the `hover-reveal` entry
  (it just copies the files).

Then run (needs internet):

```
node scripts/build-labs.mjs <slug>
```

The script clones the repo, builds it, puts the result in
`public/labs/<slug>/`, and **fails loudly** if the build would load files
from outside its own folder (that's the base-path check — if it fails, the
`--base` flag is missing or wrong). Open
`http://localhost:3000/labs/<slug>/` with the dev server running and make
sure the prototype works.

If the experiment is hosted elsewhere instead (a real deployed URL), skip
this step entirely and use that URL as `liveUrl` in Step 3.

## Step 2 — Record the living preview

Add an entry for the slug to the `LABS` array in
`scripts/record-lab-previews.mjs`, copying the existing entry whose shape
is closest (landscape web page → `koyomi`, portrait phone prototype →
`pulse`). The `beats` function is a small Playwright script that "performs"
the prototype for the camera for ~10 seconds — click through the best
moment, let animations settle. Never enable sound UI (videos ship muted).

Then run:

```
node scripts/record-lab-previews.mjs <slug>
```

It records the beats, writes `public/playground/<slug>/preview.mp4`
(fails if over 2.5MB — shorten or calm the beats) and `poster.webp`
(the first frame of the clip window; pick a `posterAt` time that looks
good as a still).

## Step 3 — Add the node to the content file

Open `src/content/playground.ts` and add one object to the
`playgroundNodes` array (copy an existing one). Field by field:

| Field | What to put there |
| --- | --- |
| `id` | The slug. Also the deep link: `#open-<id>`. |
| `title` | Display name, e.g. `"Ripple Clock"`. |
| `index` | The 4-digit code under the label, e.g. `"2741"`. Purely decorative — pick any number that isn't already used. |
| `category` | 2–3 word type label shown on the card, e.g. `"Interaction study"`. |
| `year` | e.g. `"2026"`. |
| `description` | 2–4 sentences for the card's "Show more". Write it in your editorial voice — what it is, what makes it interesting. |
| `type` | `"video"` (normal) or `"image"` if you only have a still. |
| `src` | `"/playground/<slug>/preview.mp4"` from Step 2. |
| `poster` | `"/playground/<slug>/poster.webp"` from Step 2. |
| `aspectRatio` | Width ÷ height of the preview video. Landscape recordings are `960 / 600`; the portrait phone recording is `444 / 960`. Check the mp4's real dimensions if unsure. |
| `home` | Where the node rests: `[x, y]` as fractions of the field, `0` = left/top edge, `1` = right/bottom. Look at the existing four and pick an empty area — e.g. `[0.5, 0.45]` is the middle. |
| `z` | Depth from `-0.6` (far: smaller, dimmer threads) to `0.6` (near: bigger). Vary it so the field feels layered. |
| `liveUrl` | `"/labs/<slug>/"` from Step 1, or a full external URL. |
| `objectPosition` | Optional. Only if the hover-box crop cuts the wrong part of the video — e.g. `"center top"` keeps the top edge visible. Delete the line otherwise. |

## Step 4 — Check and commit

```
npm run typecheck
npm run build
cd out && python3 -m http.server 8788
```

then in a second terminal:

```
env -u PLAYWRIGHT_BROWSERS_PATH BASE_URL=http://localhost:8788 node scripts/verify-playground.mjs
```

All checks should pass (the counter checks say `/04` — they read the total
from the page, so a fifth node is fine). Then look at `/playground` in the
browser: hover the new node, open it, click "Open live ↗", try
`/playground/#open-<slug>`.

Commit everything the steps produced: the two script edits,
`public/labs/<slug>/`, `public/playground/<slug>/`, and
`src/content/playground.ts`.
