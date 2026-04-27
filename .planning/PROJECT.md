# Vaibhav Arora Portfolio

## What This Is

A static frontend portfolio for Vaibhav Arora, positioned as a Senior Product Designer for hiring managers, design leaders, and recruiters. The site should closely recreate the visual language, layout behavior, motion feel, navigation, cards, and section rhythm of `oriol.design`, while replacing identity, links, assets, and work content with Vaibhav's own material over time.

The first version uses placeholders for projects, imagery, links, resume, and case-study content. It must include public case-study detail pages designed for fast hiring-manager scanning, with an easy path to add lightweight client-side password gates later.

## Core Value

Help hiring managers quickly understand Vaibhav's senior product design judgment, craft, and credibility through a memorable portfolio that feels polished before the final content is available.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Build a static frontend portfolio with a desktop-first, responsive implementation.
- [ ] Recreate the Oriol-inspired homepage structure, navigation, typography scale, color palette, cards, spacing, and motion style.
- [ ] Use `Vaibhav Arora` as the temporary wordmark until a logo exists.
- [ ] Use the placeholder hero headline `KIND DESIGN LEAD FOR MID STAGE START-UPS`, marked for later rewrite.
- [ ] Include Home, Work section, About section, Contact section, and 3 placeholder work cards.
- [ ] Add scan-first public case-study detail pages inspired by Rachel Chen's case-study structure.
- [ ] Use placeholder URLs for Calendly, LinkedIn, Twitter, and Google Drive resume.
- [ ] Include resume access as a nav icon/link and footer link, not as a standalone section.
- [ ] Keep a future client-side password gate path available for case-study pages.
- [ ] Target GitHub Pages deployment.

### Out of Scope

- Full production authentication — client-side case-study gating is sufficient for now because the portfolio is not handling confidential NDA material.
- Final project content and case-study writing — project selection and real content will be handled in a later stage.
- Custom logo design — use text wordmark for v1.
- Licensed commercial fonts — use close free substitutes unless font files are provided.
- Backend/CMS — static app is enough for the current portfolio goal.

## Context

- Reference design extracted from `https://www.oriol.design/` into `.planning/research/oriol-design-extract/`.
- Portfolio strategy notes are captured in `.planning/research/portfolio-reference-notes.md`.
- Oriol extraction showed a flat, high-contrast, white/black visual system with blue links, sharp accent cards, huge uppercase display type, compact floating icon navigation, pill CTAs, and large asymmetric whitespace.
- Oriol appears Framer-generated, but the implementation should use maintainable static frontend code rather than copying generated Framer output.
- Rachel Chen's `OpenAI x Hardware` case-study page is the structural reference for detail pages: overview, problem, opportunity, solution, flows, research, decisions, constraints, reflection.
- The UX case-study PDF argues against generic process templates. Case studies should prioritize context, role, constraints, outcomes, insight, polished visuals, scannable headings, and the designer's point of view.
- For v1, case studies should be scan-first for hiring managers rather than exhaustive process documentation.

## Constraints

- **Design Fidelity**: Match Oriol's visual language as closely as practical — this is the explicit product direction for v1.
- **Content Ownership**: Do not copy another designer's identity or proprietary case-study content verbatim — use placeholders and Vaibhav-specific replacements.
- **Stack**: Use a static frontend stack suitable for GitHub Pages — preferably Next.js static export or Vite/React if simpler.
- **Responsiveness**: Prioritize desktop fidelity first, then adapt for mobile and tablet without breaking usability.
- **Fonts**: Use free substitutes for Oriol's Aeonik/Mabry-like look unless licensed font files are provided.
- **Security**: Future case-study password protection can be client-side and lightweight; it is not a real confidentiality boundary.
- **Assets**: Use clean placeholders for headshot, company marks, project screenshots, and case-study visuals until real assets are provided.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build a static frontend app | The portfolio does not need server-side behavior for v1 and should be easy to deploy. | — Pending |
| Target GitHub Pages | User expects GitHub Pages as likely deployment target. | — Pending |
| Use maintainable code instead of Framer output | Oriol appears Framer-generated, but generated output is not a good engineering base. | — Pending |
| Recreate Oriol's visual system closely | User explicitly wants exact replica behavior, colors, motion, fonts, cards, and navigation. | — Pending |
| Use `Vaibhav Arora` as temporary wordmark | No logo exists yet. | — Pending |
| Keep case studies public for v1 | Faster launch; password protection can be added later. | — Pending |
| Use client-side password gate later | Lightweight enough for portfolio screening and avoids unnecessary backend complexity. | — Pending |
| Use free font substitutes | Oriol uses Aeonik/Mabry-style commercial fonts; free substitutes avoid licensing issues. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-27 after initialization*
