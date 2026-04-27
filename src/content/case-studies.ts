export type CaseStudy = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  status: "Placeholder case study";
  visibility: "public";
  metadata: Array<{
    label: string;
    value: string;
  }>;
  sections: Array<{
    kicker: string;
    title: string;
    body: string;
    visual?: string;
  }>;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "northstar",
    title: "Northstar growth system",
    eyebrow: "Case study 01",
    summary:
      "A placeholder growth story arranged for quick review: role, constraints, decisions, and a clear route to future results.",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Role", value: "Senior Product Designer" },
      { label: "Timeline", value: "8 weeks" },
      { label: "Team", value: "Product, engineering, research" },
      { label: "Skills", value: "Systems thinking, IA, UI direction" },
      { label: "Status", value: "Placeholder / public" },
    ],
    sections: [
      {
        kicker: "Overview",
        title: "Fast context for a hiring manager",
        body: "Lead with the problem, the designer's role, the constraints, and why the work mattered before diving into process.",
      },
      {
        kicker: "Problem",
        title: "What needed to change",
        body: "This area will eventually hold the real product situation. For now it confirms the scan-first structure is in place.",
        visual: "Visual placeholder",
      },
      {
        kicker: "Reflection",
        title: "What this page is designed to support",
        body: "The route should later carry case-study depth without changing the route structure or introducing a gate rewrite.",
      },
    ],
  },
  {
    slug: "signal",
    title: "Signal onboarding journey",
    eyebrow: "Case study 02",
    summary:
      "A second placeholder case study focused on concise narrative sections and a large visual region for later project imagery.",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Role", value: "Product design lead" },
      { label: "Timeline", value: "6 weeks" },
      { label: "Team", value: "Design, engineering" },
      { label: "Skills", value: "Flows, prototyping, storytelling" },
      { label: "Status", value: "Placeholder / public" },
    ],
    sections: [
      {
        kicker: "Opportunity",
        title: "Why the project exists",
        body: "The structure should reward skimming while still leaving room for deeper content once real work is selected.",
        visual: "Visual placeholder",
      },
      {
        kicker: "Solution",
        title: "What the interface would show",
        body: "Later phases can replace this with real artifacts while preserving the section order and metadata cadence.",
      },
      {
        kicker: "Tradeoffs",
        title: "Where the judgment lives",
        body: "The layout keeps decisions visible so the designer's thinking remains legible, even when only placeholder content is present.",
      },
    ],
  },
  {
    slug: "atlas",
    title: "Atlas operations dashboard",
    eyebrow: "Case study 03",
    summary:
      "The third placeholder page ensures routing, static generation, and public case-study structure are all wired before the later content phase.",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Role", value: "Design owner" },
      { label: "Timeline", value: "10 weeks" },
      { label: "Team", value: "Cross-functional squad" },
      { label: "Skills", value: "IA, content hierarchy, systems" },
      { label: "Status", value: "Placeholder / public" },
    ],
    sections: [
      {
        kicker: "Impact",
        title: "Placeholder for future outcomes",
        body: "This section will later hold measurable results. The important part in Phase 1 is that the route exists and is public.",
        visual: "Visual placeholder",
      },
      {
        kicker: "Decisions",
        title: "A route ready for gating later",
        body: "Future client-side gating can be layered in without changing the slug structure or the content shape.",
      },
      {
        kicker: "Reflection",
        title: "Keep the structure reusable",
        body: "The content model is intentionally simple so later phases can swap in real projects without reworking the route system.",
      },
    ],
  },
];
