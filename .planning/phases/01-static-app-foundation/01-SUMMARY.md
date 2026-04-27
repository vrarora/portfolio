---
phase: 01-static-app-foundation
plan: 01
subsystem: infra
tags: [nextjs, static-export, github-pages, typescript, css, routing]
requires: []
provides:
  - Static export-safe Next.js App Router scaffold
  - Homepage route and three public case-study routes
  - Centralized placeholder links and case-study data
  - Oriol-derived CSS token foundation
  - GitHub Pages base-path documentation and setup notes
affects:
  - Phase 2 homepage replica
  - Phase 3 case-study expansion
  - Phase 4 responsive polish
tech-stack:
  added:
    - next.js
    - react
    - react-dom
    - typescript
  patterns:
    - Static export with `output: 'export'`
    - Centralized content model for links and case-study metadata
    - Token-first CSS variables for palette, spacing, and motion
    - File-based static route generation with `generateStaticParams`
key-files:
  created:
    - package.json
    - package-lock.json
    - next.config.mjs
    - next-env.d.ts
    - tsconfig.json
    - app/layout.tsx
    - app/page.tsx
    - app/case-studies/[slug]/page.tsx
    - src/content/site-links.ts
    - src/content/case-studies.ts
    - src/styles/tokens.css
    - app/globals.css
    - README.md
    - .gitignore
  modified:
    - .planning/STATE.md
    - .planning/ROADMAP.md
key-decisions:
  - "Use Next.js App Router with static export so the portfolio remains GitHub Pages friendly."
  - "Keep placeholder external links and case-study metadata centralized in shared content modules."
  - "Model public case-study routes with static generation so future client-side gating can be added later without route reshaping."
  - "Encode the extracted Oriol palette, spacing, and motion values as CSS variables instead of copying generated Framer output."
patterns-established:
  - "Pattern 1: shared placeholder content powers both homepage and case-study routes."
  - "Pattern 2: static route generation uses `generateStaticParams` for all public case-study slugs."
  - "Pattern 3: global CSS consumes token variables for a consistent editorial baseline."
requirements-completed: [BASE-01, BASE-02, BASE-03, BASE-04]

# Metrics
duration: 1h 10m
completed: 2026-04-27T10:43:33Z
---

# Phase 1: Static App Foundation Summary

**Static-export-safe Next.js scaffold with shared placeholder content, Oriol-derived design tokens, and public case-study routing**

## Performance

- **Duration:** 1h 10m
- **Started:** 2026-04-27T09:33:00Z
- **Completed:** 2026-04-27T10:43:33Z
- **Tasks:** 4 implementation tasks plus verification/bookkeeping
- **Files modified:** 15 tracked implementation files plus planning state updates

## Accomplishments
- Built a static Next.js App Router foundation configured for export-only deployment.
- Added homepage and three public case-study routes with static generation.
- Centralized placeholder links and case-study metadata in reusable content modules.
- Established an Oriol-inspired CSS token layer and global editorial baseline.
- Documented GitHub Pages base-path handling for future deployment.

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold the static app shell** - `58c5383` (feat)
2. **Task 2: Establish the design-token foundation** - `6fb4c96` (style)
3. **Task 3: Centralize links and placeholder content** - `c7b61f7` (feat)
4. **Task 4: Configure GitHub Pages assumptions** - `eead052` (docs)

**Plan metadata:** `58c5383` (initial scaffold commit)

## Files Created/Modified
- `package.json` - project manifest and scripts
- `next.config.mjs` - static export and base-path configuration
- `tsconfig.json` - TypeScript compiler settings
- `next-env.d.ts` - Next.js ambient type shim
- `app/layout.tsx` - root document shell and metadata
- `app/page.tsx` - homepage scaffold
- `app/case-studies/[slug]/page.tsx` - public case-study route
- `src/content/site-links.ts` - centralized placeholder URLs
- `src/content/case-studies.ts` - placeholder case-study dataset
- `src/styles/tokens.css` - Oriol-derived tokens
- `app/globals.css` - global editorial styles and responsive layout
- `README.md` - GitHub Pages setup notes
- `.gitignore` - ignores build and install artifacts
- `.planning/STATE.md` - updated to Phase 2 focus
- `.planning/ROADMAP.md` - marked Phase 1 complete

## Decisions Made
- Used Next.js App Router with static export so the portfolio can be hosted on GitHub Pages without a runtime.
- Kept `NEXT_PUBLIC_BASE_PATH` as the explicit deployment knob for subpath hosting.
- Generated case-study routes from shared data so the route structure stays stable when real content arrives.
- Kept the visual language intentionally editorial and minimal, but tokenized, so Phase 2 can refine the homepage without rebuilding the foundation.

## Deviations from Plan

None - followed plan as specified.

## Issues Encountered
- `next build` initially failed because Next 15 expected async `params` on the dynamic route; fixed by making the case-study page async and awaiting `params`.
- `next build` also warned about `align-items: end`; changed that to `flex-end`.
- `npm install` required approval to run outside the sandbox before dependencies could be fetched.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 is complete and buildable.
- Phase 2 can now layer the full Oriol-inspired homepage on top of the static scaffold.
- Phase 3 can reuse the public case-study route and shared dataset without route changes.

---
*Phase: 01-static-app-foundation*
*Completed: 2026-04-27*
