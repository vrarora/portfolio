# Requirements: Vaibhav Arora Portfolio

**Defined:** 2026-04-27
**Core Value:** Help hiring managers quickly understand Vaibhav's senior product design judgment, craft, and credibility through a memorable portfolio that feels polished before the final content is available.

## v1 Requirements

### Foundation

- [x] **BASE-01**: App uses a static frontend architecture suitable for GitHub Pages deployment.
- [x] **BASE-02**: App has maintainable routing for homepage and case-study detail pages.
- [x] **BASE-03**: App uses placeholder URLs for Calendly, LinkedIn, Twitter, and Google Drive resume.
- [ ] **BASE-04**: App can later add a lightweight client-side password gate per case study without restructuring routes.

### Visual System

- [x] **VIS-01**: Homepage closely matches Oriol-inspired white/black editorial layout, asymmetry, and large negative space.
- [x] **VIS-02**: Typography uses free substitutes that approximate Oriol's Aeonik/Mabry-style grotesk and bold display fonts.
- [x] **VIS-03**: Color system includes white, black, link blue, muted grays, and sharp accent colors based on the extracted reference.
- [x] **VIS-04**: Navigation uses compact floating icon buttons with top-right resume/social affordances.
- [x] **VIS-05**: Cards, pills, work rows, testimonial blocks, and CTA buttons match the reference site's flat, high-contrast style.
- [x] **VIS-06**: Motion uses subtle 300ms transitions and scroll/reveal behavior while skipping the initial loader animation.

### Homepage Content

- [x] **HOME-01**: Header uses `Vaibhav Arora` as temporary wordmark.
- [x] **HOME-02**: Hero uses the placeholder headline `KIND DESIGN LEAD FOR MID STAGE START-UPS`.
- [x] **HOME-03**: Hero includes `Book Intro` and `Let's connect` CTAs.
- [x] **HOME-04**: Work section includes 3 placeholder project cards.
- [x] **HOME-05**: About section introduces Vaibhav as a Senior Product Designer using placeholder copy.
- [x] **HOME-06**: Contact section includes Book Intro, Let's connect, LinkedIn, Twitter, and resume links.
- [x] **HOME-07**: Resume appears as a top-right/nav action and footer link, not a standalone section.

### Case Studies

- [ ] **CASE-01**: Each placeholder project links to a public case-study detail page.
- [ ] **CASE-02**: Case-study detail pages use a scan-first structure for hiring managers.
- [ ] **CASE-03**: Case-study detail pages include project metadata: role, timeline, team, skills, and status.
- [ ] **CASE-04**: Case-study detail pages include overview, problem, opportunity, solution, decisions/tradeoffs, impact placeholder, and reflection sections.
- [ ] **CASE-05**: Case-study pages use large visual placeholders and scannable headings rather than dense process writing.

### Responsive Behavior

- [ ] **RESP-01**: Desktop layout preserves the reference site's spacing and composition as the primary design target.
- [ ] **RESP-02**: Tablet layout adapts major sections without horizontal overflow.
- [ ] **RESP-03**: Mobile layout remains usable, readable, and navigable even when exact desktop composition cannot be preserved.

## v2 Requirements

### Content

- **CONT-01**: Replace placeholders with real selected projects, outcomes, visuals, and case-study writing.
- **CONT-02**: Rewrite hero positioning from placeholder copy to Vaibhav's real value proposition.
- **CONT-03**: Add real resume, LinkedIn, Twitter, and Calendly URLs.
- **CONT-04**: Replace placeholder avatar, logos, and project imagery with real assets.

### Protection

- **LOCK-01**: Add optional client-side password gate for selected case-study pages.
- **LOCK-02**: Add per-project metadata to mark case studies as public or gated.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend authentication | Too heavy for current portfolio need; client-side gate is enough later. |
| CMS editing | Static files are simpler and adequate for v1. |
| Final case-study content | Project details will be discussed later. |
| Logo design | Text wordmark is sufficient for v1. |
| Pixel-copying proprietary assets/text | Must use Vaibhav-owned content or placeholders. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BASE-01 | Phase 1 | Complete |
| BASE-02 | Phase 1 | Complete |
| BASE-03 | Phase 1 | Complete |
| BASE-04 | Phase 3 | Pending |
| VIS-01 | Phase 2 | Complete |
| VIS-02 | Phase 2 | Complete |
| VIS-03 | Phase 2 | Complete |
| VIS-04 | Phase 2 | Complete |
| VIS-05 | Phase 2 | Complete |
| VIS-06 | Phase 2 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Phase 2 | Complete |
| HOME-04 | Phase 2 | Complete |
| HOME-05 | Phase 2 | Complete |
| HOME-06 | Phase 2 | Complete |
| HOME-07 | Phase 2 | Complete |
| CASE-01 | Phase 3 | Pending |
| CASE-02 | Phase 3 | Pending |
| CASE-03 | Phase 3 | Pending |
| CASE-04 | Phase 3 | Pending |
| CASE-05 | Phase 3 | Pending |
| RESP-01 | Phase 4 | Pending |
| RESP-02 | Phase 4 | Pending |
| RESP-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-04-27 after initialization*
