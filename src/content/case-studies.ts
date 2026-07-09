export type CaseStudy = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  homeBrand: string;
  homeHeadline: string;
  homeDescription: string;
  /** Condensed one-line variant shown on the work card at <=767px. */
  homeDescriptionShort: string;
  homeTags: string[];
  workAccent: "green" | "blue" | "orange";
  workPreview: "dashboard" | "workflow" | "commerce" | "screenshot" | "placeholder" | "cover";
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
    bullets?: string[];
    visual?: string;
    visualType?: string;
    metrics?: Array<{ start: string; end: string; desc: string }>;
    items?: Array<{
      body?: string;
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
      "Drove the product direction for Data Compass, translating data privacy compliance requirements into an investigation workflow that gave IDfy its first enterprise data client.",
    homeDescriptionShort:
      "Turned bank data-privacy compliance into an investigation workflow that won IDfy its first enterprise data client.",
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
        body: "The same logic carried through every remaining module. The right inspector adapts to wherever the user is in the hierarchy.",
        items: [
          {
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
    slug: "design-repo",
    title: "The Workflow That Rewrote Design's Job Description",
    eyebrow: "Case study 02",
    summary:
      "An AI-native design workflow at IDfy where every design runs as code: handoff became a git pull, turnaround fell from weeks to days, and twenty designers, PMs, and developers build inside one repo.",
    homeBrand: "Design Repo",
    homeHeadline: "The design repo cut design turnaround at IDfy from weeks to days.",
    homeDescription:
      "Built and rolled out an AI-native design workflow at IDfy: a standalone repo where every design runs as code, a pull is the handoff, and twenty designers, PMs, and developers now build inside it.",
    homeDescriptionShort:
      "An AI-native workflow where every design runs as code and a git pull is the handoff, now used by twenty builders.",
    homeTags: ["AI-Native", "Design Systems", "DesignOps", "Infrastructure", "Product UX"],
    workAccent: "blue",
    workPreview: "cover",
    thumbnailImage: "/images/design-repo/design-repo-cover.webp",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Company", value: "IDfy" },
      { label: "Product", value: "Privy Design Repo" },
      { label: "Role", value: "Product Designer 2" },
      { label: "Timeline", value: "Apr – Jun 2026" },
      { label: "Outcome", value: "Design turnaround from weeks to days" },
    ],
    sections: [
      {
        kicker: "Context",
        title: "The Fastest Workflow at IDfy Died the Day It Worked",
        body: "At IDfy I stopped drawing screens and started shipping them. Designing in code and delivering the frontend myself with AI agents meant backend developers stayed on backend problems. It worked: my pull request was accepted and a Data Compass module shipped to production.\n\nThen we retired the workflow, and the reason matters.",
        items: [
          {
            bullets: [
              "IDfy runs on Elixir and Phoenix LiveView, a stack AI agents handle poorly.",
              "The tech lead held a principle I still agree with: if you cannot explain your code and own it, you do not write it.",
              "I could ship the code. I could not own it. The honest move was to stop.",
              "But the experiment had proven something that would not go away: the speed was real, and it had nothing to do with me typing code.",
            ],
            visual: "The loop that died: Figma to IDE to a merged PR, then retired",
            visualType: "designrepo-loop",
          },
        ],
      },
      {
        kicker: "The Insight",
        title: "If I Could Not Own the Code, I Could Make the Design Run",
        body: "The real bottleneck was never design speed. It was the handoff artifact.\n\nA static mockup forces everyone downstream to re-derive intent. The developer measures spacing off a picture. The PM re-explains the flow in comments. An AI agent guesses at everything the picture cannot say. A design that runs carries its own intent.",
        items: [
          {
            bullets: [
              "I built a standalone design repo: every design migrated out of Figma into running code, organized around Privy's product language, deployed on Vercel.",
              "It is deliberately not production code. The org stack stays with the engineers who own it.",
              "It is the design itself, kept in the only format that answers questions without me in the room.",
            ],
            visual: "What a developer receives: the same screen, static versus running",
            visualType: "designrepo-contrast",
          },
        ],
      },
      {
        kicker: "The Work",
        title: "A Pull Became the Handoff",
        body: "Handoff stopped being a ceremony. Developers clone the repo, and the pull is the handoff.",
        items: [
          {
            bullets: [
              "A dev agent pointed at the design-as-code plus the PRD and TRD builds the production feature in the org stack, because nothing is left to interpretation.",
              "Designers adopted first. They watched modules ship in days and started building inside the repo themselves.",
              "Then I saw the gap in how PMs prototyped and taught them to build on the repo itself, so their Claude mockups come out true to Privy's design language.",
              "I formalized it with enablement sessions, the design team first and then PMs, plus a CONTRIBUTING guide and README that treat the repo as a product.",
              "Today twenty people build inside it: eight designers, five product managers, and seven developers.",
            ],
            visual: "The pipeline: the Figma chain versus a repo pull, and twenty builders arriving",
            visualType: "designrepo-pipeline",
          },
          {
            body: "The playbook that formalized it treats the repo as a product. It onboards designers in the language they already speak.",
            visual: "The playbook: real excerpts from the repo docs, lightly anonymized",
            visualType: "designrepo-playbook",
          },
        ],
      },
      {
        kicker: "Outcome",
        title: "Design Became Something the Company Demos",
        body: "Design at IDfy used to be something stakeholders reviewed. Now it is something the company demos.",
        metrics: [
          { start: "2 wks", end: "18 hrs", desc: "One full module, brief to delivered design" },
          { start: "0", end: "20", desc: "Designers, PMs, and devs building in the repo" },
          { start: "0%", end: "100%", desc: "New feature design now ships through the repo" },
        ],
        items: [
          {
            bullets: [
              "Pre-sales walks clients through working prototypes built on the repo, seeded with mock data while the real backend is wired in. Trust gets built before a contract exists.",
              "The Lineage module, four base screens with multi-level flows and a full graph view, was delivered end to end in under 18 hours. Before the repo, two weeks bought only its base structure.",
              "The repo is our bread and butter now. Countless designs have shipped through it, and the pattern holds: what took weeks now takes days.",
              "The bottleneck was never how fast I could design. It was how much of my intent survived the handoff.",
              "One proof is on this site: every interactive screen in the other two case studies was designed and built through this same workflow.",
            ],
            visual: "The client demo: a working prototype in a live call",
            visualType: "designrepo-demo",
          },
          {
            visual: "Outcome metrics",
            visualType: "outcome-impact",
          },
        ],
      },
    ],
  },
  {
    slug: "equalall",
    title: "40% More Revenue From Every Donor",
    eyebrow: "Case study 03",
    summary:
      "Owning revenue per donor on Ketto's 0→1 bet to win Western donors, where a gift is a race against a feeling that fades.",
    homeBrand: "EqualAll",
    homeHeadline: "EqualAll's 40% Lift in Revenue Per Donor",
    homeDescription:
      "Designed and owned EqualAll, Ketto's 0→1 donation platform for Western donors, taking revenue per donor from launch through a 40% lift by designing for the fading emotion behind every gift.",
    homeDescriptionShort:
      "Owned Ketto's 0→1 donation platform for Western donors, lifting revenue per donor 40% by designing for the emotion behind each gift.",
    homeTags: ["Social Impact", "0→1", "Growth", "Consumer", "Product UX"],
    workAccent: "orange",
    workPreview: "cover",
    thumbnailImage: "/images/equalall/equalall-cover.webp",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Company", value: "Ketto" },
      { label: "Product", value: "EqualAll" },
      { label: "Role", value: "Product Designer" },
      { label: "Timeline", value: "Nov 2024 – Mar 2025" },
      { label: "Team", value: "CMO, VP of Product, Senior PM" },
      { label: "Outcome", value: "+40% revenue per donor" },
    ],
    sections: [
      {
        kicker: "Context",
        title: "Ketto Bet on the West, and the Numbers Came Back Low",
        body: "Ketto is India's largest crowdfunding platform, built on millions of small gifts from donors across the country. EqualAll was its next bet: a platform aimed at the West, where people give more and give more readily, opening a new and larger revenue stream.\n\nThe way in is an ad. Someone scrolling sees children caught in the war in Gaza, feels something, and taps. A second later they are on EqualAll, a platform they have never heard of, being asked to give money to strangers online.\n\nWe launched with everything a donation page is supposed to have, and the first numbers came back below Ketto's own benchmark. People were arriving, scrolling deep, clearly moved, and still not giving the way the model predicted.",
        visualType: "equalall-context-gap",
      },
      {
        kicker: "The Insight",
        title: "A Gift Is a Race Against a Fading Feeling",
        body: "The easy explanations were about traffic, and some of that was true. But the thing I kept returning to was the donor's state of mind.\n\nThey had not come to research a cause or weigh their options against alternatives. They had arrived on a wave of feeling an ad created moments earlier, and a feeling like that does not last. By the time the page asked them to choose an amount, confirm the details, and enter payment, the wave was already receding.\n\nSo the goal I had been handed, raise revenue per donor, was really a single problem in disguise: catch the feeling at its peak and turn it into a gift before it cooled, and wherever possible, turn that one moment into a commitment that would outlast it.",
        visualType: "equalall-fading-feeling",
      },
      {
        kicker: "The Work",
        title: "Designing Against the Clock",
        body: "Every change I made after that either protected the feeling or converted it before it cooled. None of these was the win on its own. Their culmination was.",
        items: [
          {
            body: "The amount was where doubt first crept in. \"How much is right?\" is paralyzing when you are giving to strangers with nothing to compare against, so a \"Most chosen\" amount answered it instantly and kept a moved donor from cooling off while deciding.",
            visual: "The Most chosen anchor: doubt answered instantly",
            visualType: "equalall-anchor",
          },
          {
            body: "The amounts were bare numbers, so I gave each one meaning. \"$100\" became \"$100 helps feed five children for a week,\" and gifts started moving up the ladder because the ladder finally meant something.",
            visual: "Impact amounts: every rung of the ladder carries meaning",
            visualType: "equalall-impact",
          },
          {
            body: "The final step before payment showed an abstract total, the least emotional moment in the flow. I changed it to show what the money became, a medical kit that helps save a life, so the last click felt like the feeling rather than a checkout.",
            visual: "The tangible confirm: the gift becomes the thing it buys",
            visualType: "equalall-tangible",
          },
          {
            body: "Donors kept clicking the campaign photo as if it would open, reaching for the feeling. Instead of a dead end, I turned it into a carousel with a Donate button docked inside, so looking closer led straight into giving.",
            visual: "The hero carousel: looking closer leads into giving",
            visualType: "equalall-carousel",
          },
          {
            body: "Recurring giving came from the same read. The donors most moved to give were often the ones least willing to come back and feel it again, so I let them turn a single gift into a monthly one and offered recurring giving right after donating, a way to keep doing good without re-living what hurt.",
            visual: "Recurring giving: one peak becomes a standing commitment",
            visualType: "equalall-recurring",
          },
        ],
      },
      {
        kicker: "Outcome",
        title: "Owning the Number, Not Just the Screens",
        body: "I owned the number, not just the screens: instrumenting the funnel in Metabase, watching real sessions in Clarity, and measuring every change against the version before it. Design for the decay, not the transaction, and the giving follows.",
        visualType: "outcome-impact",
        metrics: [
          { start: "0%",   end: "40%",  desc: "Lift in revenue per donor" },
          { start: "0",    end: "5",    desc: "Experiments shipped as one system" },
          { start: "0 mo", end: "5 mo", desc: "Nov 2024 to Mar 2025 build window" },
        ],
      },
    ],
  },
];
