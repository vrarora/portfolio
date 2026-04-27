# Roadmap: Vaibhav Arora Portfolio

**Created:** 2026-04-27
**Project:** Vaibhav Arora Portfolio
**Current milestone:** v1 static portfolio

## Phase 1: Static App Foundation

**Goal:** Create the maintainable static frontend foundation for the portfolio.

**Scope:**
- Choose and scaffold the static frontend stack.
- Configure static export/deployment assumptions for GitHub Pages.
- Add base routing for homepage and case-study detail pages.
- Add placeholder link constants for Calendly, LinkedIn, Twitter, and resume.
- Establish design token files using the extracted Oriol reference as source material.

**Requirements:** BASE-01, BASE-02, BASE-03

**Done When:**
- App runs locally.
- Static build succeeds.
- Routes exist for homepage and 3 placeholder case studies.

**Completed:** 2026-04-27

## Phase 2: Oriol-Inspired Homepage Replica

**Goal:** Build the desktop-first homepage with close visual fidelity to the Oriol reference.

**Scope:**
- Implement wordmark, floating navigation, top-right resume/social actions, hero, service/role cards, work rows, about, contact, testimonials/principles-style placeholders, and footer.
- Use `Vaibhav Arora` and the temporary hero headline.
- Use free font substitutes for Aeonik/Mabry-style typography.
- Match the color palette, card treatments, pill CTAs, spacing, and subtle transitions from the design extraction.
- Skip the reference site's initial loader animation.

**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06, HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07

**Done When:**
- Homepage visually matches the reference direction at desktop size.
- Placeholder content is clearly marked and easy to replace.
- Main CTAs and nav actions exist with placeholder URLs.

**Completed:** 2026-04-27

## Phase 3: Scan-First Case Study Pages

**Goal:** Add public case-study detail pages that are optimized for fast hiring-manager review.

**Scope:**
- Create reusable case-study data and template.
- Add 3 placeholder public case-study pages.
- Use Rachel Chen's page structure as reference, adapted into a more concise scan-first flow.
- Include project metadata, overview, problem, opportunity, solution, decisions/tradeoffs, impact placeholder, visuals, and reflection.
- Leave a clean path for later client-side password gating.

**Requirements:** BASE-04, CASE-01, CASE-02, CASE-03, CASE-04, CASE-05

**Done When:**
- Each work card opens a case-study page.
- Case-study pages feel visually cohesive with the homepage.
- Future `public` vs `gated` project metadata can be added without route restructuring.

## Phase 4: Responsive Polish and Verification

**Goal:** Make the portfolio usable across desktop, tablet, and mobile without losing the design's character.

**Scope:**
- Tune desktop spacing and interaction details.
- Adapt tablet and mobile layouts.
- Check keyboard navigation, color contrast, overflow, image placeholders, and link states.
- Run build verification.

**Requirements:** RESP-01, RESP-02, RESP-03

**Done When:**
- Desktop preserves the primary reference feel.
- Tablet/mobile have no horizontal overflow or unusable navigation.
- Build passes and the site is ready for GitHub Pages deployment setup.

## Deferred Work

- Replace placeholder work with real projects and case-study content.
- Rewrite the hero headline and positioning.
- Add real assets and URLs.
- Add optional client-side password gates for selected case studies.
- Add custom logo/wordmark if desired.

---
*Roadmap created: 2026-04-27*
*Last updated: 2026-04-27 after initialization*
