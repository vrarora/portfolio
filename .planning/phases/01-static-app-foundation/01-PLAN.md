---
phase: 1
plan: 01
type: phase
wave: 1
depends_on: []
files_modified:
  - package.json
  - next.config.mjs
  - tsconfig.json
  - app/layout.tsx
  - app/page.tsx
  - app/case-studies/[slug]/page.tsx
  - src/content/site-links.ts
  - src/content/case-studies.ts
  - src/styles/tokens.css
  - app/globals.css
  - README.md
autonomous: false
requirements:
  - BASE-01
  - BASE-02
  - BASE-03
  - BASE-04
---

<objective>
Build the static application foundation for the portfolio in a way that is easy to extend into the homepage and case-study phases later.

This phase must establish the static frontend stack, GitHub Pages deployment assumptions, reusable public routing for the homepage and three placeholder case-study pages, centralized placeholder link data, and a local design-token layer derived from the Oriol extraction.
</objective>

<threat_model>
## Threat Model

- No backend services, auth systems, or personal data handling are introduced in this phase.
- Primary risks are accidental use of server-only Next.js features, broken static export assumptions, and incorrect asset paths for GitHub Pages.
- Placeholder external links can point to unsafe or missing destinations if they are scattered inline; centralize them in one data module to reduce drift.
- The future client-side gate path should remain a presentation-layer concern only; do not introduce any real security boundary in Phase 1.

## Mitigations

- Use `output: 'export'` and keep all routes static-safe.
- Avoid `getServerSideProps`, server actions, and runtime-only APIs.
- Add a single source of truth for external URLs and case-study metadata.
- Keep all placeholder data clearly labeled so later phases can replace it without refactoring route structure.
</threat_model>

<tasks>
### Task 1: Scaffold the static app shell
- type: scaffold
- files:
  - `package.json`
  - `next.config.mjs`
  - `tsconfig.json`
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/case-studies/[slug]/page.tsx`
- action: Initialize a maintainable Next.js App Router app configured for static export, TypeScript, and a clean route structure for the homepage plus public case-study detail pages.
- verify: The app starts locally, TypeScript compiles, and the build/export path does not require a server runtime.
- acceptance_criteria:
  - Static export is the default build target.
  - The route tree exists for `/` and `/case-studies/[slug]`.
  - No server-only Next.js APIs are required for the initial scaffold.

### Task 2: Establish the design-token foundation
- type: design-system
- files:
  - `src/styles/tokens.css`
  - `app/globals.css`
  - `app/layout.tsx`
- action: Encode the extracted Oriol-inspired palette, type scale, spacing, radii, and motion tokens as CSS variables and base styles that the later homepage phase can reuse.
- verify: Token values match the extracted design language closely enough to anchor the visual system, and the app renders with the intended black/white editorial baseline.
- acceptance_criteria:
  - Core colors, type scale, and transition timing are centralized.
  - Global styles do not hard-code one-off visual values that bypass the token layer.
  - Base typography and contrast are usable from the start.

### Task 3: Centralize links and placeholder content
- type: content-model
- files:
  - `src/content/site-links.ts`
  - `src/content/case-studies.ts`
- action: Define reusable placeholder URLs for Calendly, LinkedIn, Twitter, and the resume, plus a case-study data model that includes public visibility and room for future gated metadata.
- verify: Homepage and case-study routes can consume the same data model, and link destinations are declared in one place only.
- acceptance_criteria:
  - Placeholder links are not duplicated inline across components.
  - Three placeholder case-study records are defined with stable slugs.
  - The data model can later support `public` vs `gated` projects without route restructuring.

### Task 4: Configure GitHub Pages assumptions
- type: deployment
- files:
  - `next.config.mjs`
  - `README.md`
- action: Wire the export and asset-path assumptions needed for GitHub Pages, documenting any repo-subpath behavior and keeping deployment logic static-friendly.
- verify: Exported assets resolve under the expected base path and the deployment notes explain how the static build is intended to be hosted.
- acceptance_criteria:
  - The build is compatible with GitHub Pages hosting.
  - Asset prefix or base-path handling is explicit and easy to adjust.
  - No deployment step depends on a backend.

### Task 5: Run static verification and lock the foundation
- type: verification
- files:
  - `package.json`
  - `app/page.tsx`
  - `app/case-studies/[slug]/page.tsx`
- action: Add or confirm scripts and smoke checks for typecheck/build and ensure the home route plus three case-study routes are present and linked correctly.
- verify: `npm run build` succeeds, the static output includes the expected routes, and the placeholder link/content wiring is intact.
- acceptance_criteria:
  - Phase 1 can be built locally without manual fixes.
  - All four required routes are reachable in the static app.
  - BASE-01, BASE-02, BASE-03, and BASE-04 are covered by the implementation plan.
</tasks>

<verification>
## Verification

1. Confirm the scaffold uses a static-export-safe Next.js configuration.
2. Confirm the homepage route exists and renders from shared token and link data.
3. Confirm three placeholder case-study slugs resolve to public detail pages.
4. Confirm the placeholder URL constants are centralized and reused.
5. Confirm the global style layer exposes the Oriol-derived token set.
6. Confirm the project can complete a static build without server-only features.
</verification>

<success_criteria>
## Success Criteria

- The app is scaffolded as a static frontend suitable for GitHub Pages deployment.
- The homepage and three placeholder case-study pages exist as maintainable routes.
- Placeholder links for Calendly, LinkedIn, Twitter, and resume are centralized and reusable.
- A local design-token foundation exists and reflects the extracted Oriol visual language.
- The structure leaves a clean path for later lightweight client-side case-study gating.
- The phase is buildable and ready for the Phase 2 visual implementation work.
</success_criteria>

