# Design Language: Oriol.Design | Kind Design Lead – Design Leader, Design Manager, Design Mentor

> Extracted from `https://www.oriol.design/` on April 27, 2026
> 1681 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#0000ee` | rgb(0, 0, 238) | hsl(240, 100%, 47%) | 218 |
| Secondary | `#ffb800` | rgb(255, 184, 0) | hsl(43, 100%, 50%) | 9 |
| Accent | `#664900` | rgb(102, 73, 0) | hsl(43, 100%, 20%) | 3 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 2928 |
| `#808080` | hsl(0, 0%, 50%) | 97 |
| `#5b5b5b` | hsl(0, 0%, 36%) | 62 |
| `#ffffff` | hsl(0, 0%, 100%) | 59 |
| `#dedbd9` | hsl(24, 7%, 86%) | 18 |
| `#f4f4f4` | hsl(0, 0%, 96%) | 7 |
| `#0a0a0a` | hsl(0, 0%, 4%) | 2 |

### Background Colors

Used on large-area elements: `#ffffff`, `#f4f4f4`, `#fd431d`, `#0a0a0a`, `#f7f7f7`

### Text Colors

Text color palette: `#000000`, `#0000ee`, `#808080`, `#ffffff`, `#f5af00`, `#fd431d`, `#791501`, `#5b5b5b`, `#037b48`, `#ff6900`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#000000` | text, border, background | 2928 |
| `#0000ee` | text, border | 218 |
| `#808080` | text, border, background | 97 |
| `#5b5b5b` | text, border, background | 62 |
| `#ffffff` | background, text, border | 59 |
| `#791501` | text, border | 22 |
| `#dedbd9` | background | 18 |
| `#02ab4e` | text, border | 18 |
| `#fd431d` | background, text, border | 14 |
| `#ffb800` | background, text, border | 9 |
| `#f4f4f4` | background | 7 |
| `#013d1c` | background, text, border | 6 |
| `#037b48` | text, border | 4 |
| `#664900` | background, text, border | 3 |
| `#0a0a0a` | background | 2 |
| `#ff6900` | text, border | 2 |

## Typography

### Font Families

- **sans-serif** — used for all (1427 elements)
- **Aeonik Regular** — used for all (184 elements)
- **Times** — used for body (33 elements)
- **Aeonik Bold** — used for all (21 elements)
- **Mabry Pro Black** — used for headings (8 elements)
- **Aeonik Medium** — used for all (6 elements)
- **Aeonik Black** — used for headings (1 elements)
- **Mabry Pro Regular** — used for headings (1 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 72px | 4.5rem | 400 | 61.2px | -2px | h1 |
| 40px | 2.5rem | 400 | 40px | normal | h3, h4 |
| 34px | 2.125rem | 400 | 34px | normal | h2, br |
| 30px | 1.875rem | 400 | 30px | normal | h3 |
| 24px | 1.5rem | 400 | 27.36px | normal | p |
| 20px | 1.25rem | 400 | 21.6px | normal | h4, span, p, br |
| 16px | 1rem | 400 | normal | normal | html, head, meta, script |
| 14px | 0.875rem | 400 | 14px | normal | h5, h4, p, h6 |
| 12px | 0.75rem | 400 | normal | normal | body, script, div, section |

### Heading Scale

```css
h1 { font-size: 72px; font-weight: 400; line-height: 61.2px; }
h3 { font-size: 40px; font-weight: 400; line-height: 40px; }
h2 { font-size: 34px; font-weight: 400; line-height: 34px; }
h3 { font-size: 30px; font-weight: 400; line-height: 30px; }
h4 { font-size: 20px; font-weight: 400; line-height: 21.6px; }
h6 { font-size: 16px; font-weight: 400; line-height: normal; }
h5 { font-size: 14px; font-weight: 400; line-height: 14px; }
h6 { font-size: 12px; font-weight: 400; line-height: normal; }
```

### Body Text

```css
body { font-size: 20px; font-weight: 400; line-height: 21.6px; }
```

### Font Weights in Use

`400` (1681x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-1 | 1px | 0.0625rem |
| spacing-32 | 32px | 2rem |
| spacing-40 | 40px | 2.5rem |
| spacing-48 | 48px | 3rem |
| spacing-51 | 51px | 3.1875rem |
| spacing-55 | 55px | 3.4375rem |
| spacing-60 | 60px | 3.75rem |
| spacing-80 | 80px | 5rem |
| spacing-86 | 86px | 5.375rem |
| spacing-120 | 120px | 7.5rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| md | 8px | 18 |
| lg | 12px | 11 |
| lg | 16px | 40 |
| xl | 20px | 1 |
| full | 40px | 14 |
| full | 50px | 8 |
| full | 100px | 20 |

## CSS Custom Properties

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| lg | 1023px | max-width |
| lg | 1024px | min-width |
| 1365px | 1365px | max-width |
| 1366px | 1366px | min-width |
| 1919px | 1919px | max-width |

## Transitions & Animations

**Easing functions:** `[object Object]`

**Durations:** `0.3s`

### Common Transitions

```css
transition: all;
transition: color 0.3s cubic-bezier(0.44, 0, 0.56, 1);
```

### Keyframe Animations

**__framer-loading-spin**
```css
@keyframes __framer-loading-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (18 instances)

```css
.button {
  background-color: rgba(0, 0, 0, 0.2);
  color: rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Links (57 instances)

```css
.link {
  color: rgb(0, 0, 238);
  font-size: 12px;
  font-weight: 400;
}
```

### Navigation (1 instances)

```css
.navigatio {
  background-color: rgba(244, 244, 244, 0.9);
  color: rgb(0, 0, 0);
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 12px;
  padding-right: 12px;
  position: relative;
}
```

### Footer (1 instances)

```css
.foote {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 12px;
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 14 instances, 1 variant

**Variant 1** (14 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px outset rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

### Button — 4 instances, 2 variants

**Variant 1** (2 instances)

```css
  background: rgba(0, 0, 0, 0.2);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 16px;
  border: 0px none rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

**Variant 2** (2 instances)

```css
  background: rgba(128, 128, 128, 0.2);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 16px;
  border: 0px none rgb(0, 0, 0);
  font-size: 12px;
  font-weight: 400;
```

## Layout System

**3 grid containers** and **516 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 700px | 0px |
| 650px | 0px |
| 1373px | 0px |
| 100% | 0px |
| 720px | 0px |
| 544px | 0px |

### Grid Column Patterns

| Columns | Usage Count |
|---------|-------------|
| 2-column | 3x |

### Grid Templates

```css
grid-template-columns: 430px 430px;
gap: 20px;
grid-template-columns: 610px 610px;
gap: 20px;
grid-template-columns: 430px 430px;
gap: 20px;
```

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| column/nowrap | 286x |
| row/nowrap | 230x |

**Gap values:** `10px`, `12px`, `14px`, `16px`, `1px`, `20px`, `21px`, `24px`, `2px`, `32px`, `3px`, `48px`, `4px`, `51px`, `548px`, `55px`, `5px`, `6px`, `86px`, `8px`

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 0 passing, 0 failing color pairs

## Design System Score

**Overall: 79/100 (Grade: C)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 50/100 |
| Spacing System | 85/100 |
| Shadow Consistency | 85/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 50/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance

**Issues:**
- 8 font families — consider limiting to 2 (heading + body)
- 13 !important rules — prefer specificity over overrides
- 69% of CSS is unused — consider purging
- 6650 duplicate CSS declarations

## Z-Index Map

**8 unique z-index values** across 3 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 2147483647,2147483647 | iframe.s.t.a.t.u.s._.h.i.d.d.e.n |
| sticky | 10,10 | div.f.r.a.m.e.r.-.1.2.r.n.d.5.j.-.c.o.n.t.a.i.n.e.r |
| base | 0,5 | div.f.r.a.m.e.r.-.1.2.o.9.5.z.f, div, div.f.r.a.m.e.r.-.1.o.x.c.p.w.k.-.c.o.n.t.a.i.n.e.r |

**Issues:**
- [object Object]

## SVG Icons

**83 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| xs | 1 |
| sm | 22 |
| md | 24 |
| lg | 1 |
| xl | 35 |

**Icon colors:** `rgb(0, 0, 0)`, `#000`, `#fff`, `gray`, `#047B48`, `#FF6900`, `#FD431D`, `#A6A1FB`, `#FFB800`, `#02AB4E`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Mabry Pro Black | self-hosted | 400, normal | normal |
| Aeonik Regular | self-hosted | 400, normal | normal |
| Aeonik Bold | self-hosted | 400, normal | normal |
| Aeonik Medium | self-hosted | 400, normal | normal |
| Aeonik Black | self-hosted | 400, normal | normal |
| Mabry Pro Regular | self-hosted | 400, normal | normal |
| Inter | self-hosted | 400, 700 | normal, italic |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 76 | objectFit: fill, borderRadius: 0px, shape: square |
| general | 30 | objectFit: fill, borderRadius: 0px, shape: square |
| avatar | 6 | objectFit: cover, borderRadius: 100px, shape: circular |
| gallery | 1 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 1:1 (46x), 21:9 (24x), 3:2 (9x), 16:9 (6x), 4:3 (4x), 4.29:1 (3x), 4.7:1 (3x), 2.97:1 (3x)

## Motion Language

**Feel:** mixed · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `md` | `300ms` | 300 |

### Easing Families

- **custom** (7 uses) — `cubic-bezier(0.44, 0, 0.56, 1)`

## Component Anatomy

### button — 18 instances

**Slots:** label, icon

## Brand Voice

**Tone:** neutral · **Pronoun:** you-only · **Headings:** Title Case (tight)

### Top CTA Verbs

- **watch** (2)
- **read** (2)
- **view** (1)

### Button Copy Patterns

- "watch talk" (2×)
- "read article" (2×)
- "view resume" (1×)

### Sample Headings

> NEED KIND LEADERSHIP?
> NEED KIND LEADERSHIP?
> KIND DESIGN LEAD
> FOR MID STAGE
> START-UPS
> 

> Design Leader
> KIND DESIGN LEAD
> FOR MID STAGE
> START-UPS

## Page Intent

**Type:** `landing` (confidence 0.45)
**Description:** Product design leader with 15+ years of experience leading start-ups and teams growth. Reach out for work & collab proposals in Barcelona and remotely as: Design Leader, Design Manager, Design Mentor.

## Section Roles

Reading order (top→bottom): content → content → nav → nav → pricing-table → content → nav → content → content → footer → content → content → content → pricing-table → pricing-table → feature-grid → feature-grid → content → content → content → content → pricing → pricing → content → content → content → testimonial → content

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | content | — | 0.3 |
| 1 | content | — | 0.3 |
| 2 | nav | — | 0.4 |
| 3 | nav | — | 0.9 |
| 4 | content | — | 0.3 |
| 5 | footer | NEED KIND LEADERSHIP? | 0.95 |
| 6 | content | NEED KIND LEADERSHIP? | 0.3 |
| 7 | nav | — | 0.4 |
| 8 | content | — | 0.3 |
| 9 | pricing-table | KIND DESIGN LEAD | 0.9 |
| 10 | content | KIND DESIGN LEAD | 0.3 |
| 11 | content | — | 0.3 |
| 12 | content | KIND DESIGN LEAD | 0.3 |
| 13 | pricing-table | 
 | 0.9 |
| 14 | pricing-table | 
 | 0.9 |
| 15 | feature-grid | — | 0.8 |
| 16 | feature-grid | — | 0.8 |
| 17 | content | — | 0.3 |
| 18 | content | — | 0.3 |
| 19 | content | — | 0.3 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.553 |
| Shadow profile | none |
| Avg shadow blur | 0px |
| Max radius | 100px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Imagery Style

**Label:** `photography` (confidence 0.016)
**Counts:** total 113, svg 4, icon 38, screenshot-like 0, photo-like 3
**Dominant aspect:** square-ish
**Radius profile on images:** soft

## Component Library

**Detected:** `vuetify` (confidence 0.46)

Evidence:
- 8 v-* classes

## Component Screenshots

3 retina crops written to `screenshots/`. Index: `*-screenshots.json`.

| Cluster | Variant | Size (px) | File |
|---------|---------|-----------|------|
| button--default | 0 | 92 × 40 | `screenshots/button-default-0.png` |
| button--default | 1 | 620 × 25 | `screenshots/button-default-1.png` |
| button--default | 2 | 40 × 40 | `screenshots/button-default-2.png` |

Full-page: `screenshots/full-page.png`

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `sans-serif` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
