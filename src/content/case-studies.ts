export type CaseStudy = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  homeBrand: string;
  homeHeadline: string;
  homeDescription: string;
  homeTags: string[];
  workAccent: "green" | "blue" | "orange";
  workPreview: "dashboard" | "workflow" | "commerce" | "screenshot" | "placeholder";
  thumbnailImage?: string;
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
    visualType?: string;
    items?: Array<{
      body: string;
      bullets?: string[];
      visual: string;
      visualType?: string;
    }>;
  }>;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "data-compass",
    title: "₹10Cr ARR from a Three-Week Design Window",
    eyebrow: "Case study 01",
    summary:
      "Built to help a major Indian bank stay ahead of up to Rs. 250 crore in data privacy penalties.",
    homeBrand: "Data Compass",
    homeHeadline: "Data Compass turned a 3-week bank POC into ₹10Cr+ ARR.",
    homeDescription:
      "I drove the product direction for Data Compass, translating data privacy compliance requirements into an investigation workflow that gave IDfy its first enterprise data client.",
    homeTags: ["Enterprise", "B2B", "Compliance", "Data Discovery", "Product UX"],
    workAccent: "green",
    workPreview: "screenshot",
    thumbnailImage: "/images/data-compass-thumbnail.webp",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Company", value: "IDfy (Privy suite)" },
      { label: "Product", value: "Data Compass" },
      { label: "Role", value: "Sole Product Designer" },
      { label: "Timeline", value: "3-week design and build window" },
      { label: "Team", value: "Senior PM, Tech Architect, 4 senior engineers, CTO" },
      { label: "Outcome", value: "POC succeeded; bank converted to client" },
    ],
    sections: [
      {
        kicker: "Context",
        title: "Three Weeks. A Bank POC. Everything On The Line.",
        body: "India's Digital Personal Data Protection (DPDP) Act introduced penalties of up to Rs. 250 crore per violation for companies that could not account for where customer data lived. The bank needed a tool that could answer that question. We had three weeks.",
        visualType: "fragmented-landscape",
      },
      {
        kicker: "The Central Decision",
        title: "Hierarchy Versus a Flat List",
        body: "The compliance officer using this product needed to locate sensitive customer data scattered across dozens of systems, each owned by a different team.",
        items: [
          {
            body: "The first proposal was a flat list: every data asset in a single scrollable view. The argument was simplicity. At enterprise scale, that means thousands of assets with no way to narrow. The PM was not immediately convinced, so we ran user testing. Users in the flat list condition did not know where to start.",
            visual: "Flat list — the original direction",
            visualType: "flat-list-mockup",
          },
          {
            body: "A hierarchy from Organization to Column let users move from broad risk visibility to the exact field under investigation. The hierarchy won the test. We shipped the Explore flow before the POC.",
            visual: "Hierarchy explorer — the shipped Explore module",
            visualType: "hierarchy-explorer",
          },
        ],
      },
      {
        kicker: "Supporting Decisions",
        title: "The Same Principle, Applied Across Every Layer",
        body: "The same logic carried through every remaining module.",
        items: [
          {
            body: "The right inspector adapts to wherever the user is in the hierarchy.",
            bullets: [
              "A compliance leader at the Organization level sees coverage and risk.",
              "An IT admin at the Table level sees metadata, lineage, and scan history.",
            ],
            visual: "Contextual inspector — level-aware details",
            visualType: "inspector-explorer",
          },
          {
            body: "The platform admin managing scan operations needed triage at a glance: which scan failed, who created it, and what to do next.",
            bullets: [
              "Catalogue and classification scans separated into tabs with failure indicators and job status counts.",
              "Cron expressions show as plain-English descriptions on hover.",
              "Workflow IDs copy with one click for log investigation.",
            ],
            visual: "Scan workflow operations — triage view",
            visualType: "scan-workflow",
          },
          {
            body: "Asset onboarding was the entry point before any of this.",
            bullets: [
              "Connector selection shortened to category browsing and search.",
              "The first catalogue scan moved into the onboarding flow itself.",
              "The admin connects a source and immediately sees data, without returning to a separate screen.",
            ],
            visual: "Asset onboarding — connector selection and first scan",
            visualType: "onboarding-flow",
          },
        ],
      },
      {
        kicker: "Outcome",
        title: "POC Succeeded. Bank Became a Client.",
        body: "We shipped the core Data Compass modules in three weeks. The bank's compliance team could locate sensitive data across their estate without needing a guide. The POC succeeded. The bank became a client.",
        visualType: "outcome-impact",
      },
    ],
  },
  {
    slug: "signal",
    title: "Endpoint Protection operating model",
    eyebrow: "Case study 02",
    summary:
      "Endpoint Protection shields employee devices by detecting and quarantining PII before it can surface, protecting organizations from DPDP fines of up to Rs. 250 Cr.",
    homeBrand: "Endpoint Protection",
    homeHeadline: "Protecting employee devices kept Rs. 250 Cr in DPDP fines off the table.",
    homeDescription:
      "I designed the detection and quarantine flows for Endpoint Protection, the device-level security layer of the Data Compass suite, so organizations could prove compliance before a violation occurred.",
    homeTags: ["Enterprise", "B2B", "Compliance", "Security", "Product UX"],
    workAccent: "blue",
    workPreview: "placeholder",
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
    title: "EqualAll donation platform",
    eyebrow: "Case study 03",
    summary:
      "EqualAll opened a new donation-driven revenue stream for Ketto by designing a platform that enterprise CSR teams could actually adopt and deploy.",
    homeBrand: "EqualAll",
    homeHeadline: "EqualAll turned enterprise CSR budgets into a new revenue stream for Ketto.",
    homeDescription:
      "I designed the donation platform experience that helped Ketto unlock corporate giving at scale, creating a new business line by making CSR-driven donation flows simple enough for enterprise teams to own.",
    homeTags: ["Social Impact", "Fintech", "B2B", "CSR", "Platform"],
    workAccent: "orange",
    workPreview: "placeholder",
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
