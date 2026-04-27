# Vaibhav Arora Portfolio

Static portfolio scaffold for Phase 1.

## What this phase sets up

- Next.js App Router with static export enabled
- Home route plus three public case-study routes
- Shared placeholder URLs and case-study data
- Oriol-inspired token layer in CSS variables
- GitHub Pages-friendly base path support

## Development

```bash
npm install
npm run dev
```

## Static build

```bash
npm run build
```

## GitHub Pages base path

Set `NEXT_PUBLIC_BASE_PATH` if the site is hosted in a GitHub Pages subpath.
For example:

```bash
NEXT_PUBLIC_BASE_PATH=/repo-name npm run build
```

If the site is hosted at the root of a custom domain or user site, leave the
variable unset.
