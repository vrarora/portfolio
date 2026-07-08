# Marcus Aurelius Hover Reveal

Interactive clay-to-metal reveal using two authored images:

- Base clay image: `assets/ChatGPT Image May 16, 2026, 08_03_57 PM.png`
- Metal image: `assets/ChatGPT Image May 17, 2026, 04_29_42 PM.png`

## What this build does

- Renders the clay image as default state
- Reveals the metal image inside a soft hover brush
- Uses a larger hover radius for easier discovery
- Clears reveal immediately on pointer leave (returns to full clay state)
- Uses default cursor style

## Files

- `index.html` - page structure and asset wiring
- `styles.css` - layout/styling
- `script.js` - canvas hover reveal logic

## Run locally

From project root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open:

`http://127.0.0.1:4173/?v=23`
