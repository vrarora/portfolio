# Phase 1: Static App Foundation - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the maintainable static frontend foundation for the portfolio: choose and scaffold the stack, configure static export and GitHub Pages deployment assumptions, add base routing for the homepage and public case-study detail pages, add placeholder link constants for Calendly/LinkedIn/Twitter/resume, and establish design token files from the extracted Oriol reference.

</domain>

<decisions>
## Implementation Decisions

### Stack choice
- **D-01:** Use `Next.js` with the App Router, `TypeScript`, and static export (`output: 'export'`) as the foundation.
- **D-02:** Keep the app fully static for v1; no backend, CMS, or server runtime in Phase 1.

### Routing and page structure
- **D-03:** Use file-based routes for the homepage and placeholder case-study detail pages.
- **D-04:** Keep case-study routes public now, with the structure left ready for later lightweight client-side gating.

### Content and links
- **D-05:** Use placeholder URLs for Calendly, LinkedIn, Twitter, and Google Drive resume.
- **D-06:** Treat all placeholder work and content as intentionally temporary, but make the data shape reusable for later replacement.

### Design tokens and styling base
- **D-07:** Create a local design-token layer from the extracted Oriol reference instead of copying generated Framer output.
- **D-08:** Prefer CSS variables / plain CSS or CSS Modules for the initial design system rather than introducing a heavier styling abstraction in Phase 1.

### the agent's Discretion
- Exact directory layout within the Next.js app.
- Whether placeholder case-study content is modeled in a single data file or split by route.
- Whether deployment helpers are added in Phase 1 or deferred until later planning.

</decisions>

<specifics>
## Specific Ideas

- Temporary wordmark remains `Vaibhav Arora` until a logo exists.
- The hero headline placeholder from PROJECT.md/REQUIREMENTS.md remains the temporary copy until later phases.
- Public case-study pages should be designed for fast hiring-manager scanning, not exhaustive process documentation.

</specifics>

<canonical_refs>
## Canonical References

### Phase requirements and scope
- `.planning/ROADMAP.md` — Phase 1 scope, goal, and done conditions.
- `.planning/REQUIREMENTS.md` — BASE-01, BASE-02, BASE-03, BASE-04 and the project-level constraints.
- `.planning/PROJECT.md` — project direction, constraints, and non-goals.

### Reference design and research
- `.planning/research/portfolio-reference-notes.md` — portfolio strategy notes and reference takeaways.
- `.planning/research/oriol-design-extract/oriol-design-design-language.md` — extracted visual language for the Oriol-inspired system.
- `.planning/research/oriol-design-extract/screenshots/full-page.png` — visual reference for the overall composition and feel.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application code exists yet in the workspace, so there are no reusable runtime components to carry forward into Phase 1.

### Established Patterns
- The planning artifacts already define a static frontend portfolio direction with GitHub Pages deployment.

### Integration Points
- Phase 1 will create the first application source tree and the static export/deployment baseline.

</code_context>

<deferred>
## Deferred Ideas

- Real project content and final case-study writing.
- Optional client-side password gates for selected case studies.
- Real resume, LinkedIn, Twitter, and Calendly URLs.
- Custom logo / wordmark.

</deferred>

---

*Phase: 01-static-app-foundation*
*Context gathered: 2026-04-27*
