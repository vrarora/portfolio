/** A product recording: mp4, webm or gif, with a still for reduced motion. */
export type CaseStudyMedia = { src: string; poster: string; alt: string };

export type CaseStudy = {
  slug: string;
  title: string;
  /** Year shown on work cards. */
  year: string;
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
  /** Hero image at the top of the case study. Falls back to thumbnailImage. */
  coverImage?: { src: string; width: number; height: number };
  /** 1200x630 link preview. Falls back to thumbnailImage. */
  ogImage?: string;
  /** "board" tells the story as a scroll-drawn board, with this reading version as the fallback. */
  experience?: "board";
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
    /** Short serif annotation shown in the margin. */
    callout?: string;
    bullets?: string[];
    visual?: string;
    visualType?: string;
    media?: CaseStudyMedia;
    /** Reserves an empty figure for a recording that isn't exported yet. */
    mediaSlot?: boolean;
    /** Rail label for the figure. Falls back to the caption text before a colon. */
    label?: string;
    metrics?: Array<{ start: string; end: string; desc: string }>;
    items?: Array<{
      body?: string;
      bullets?: string[];
      visual?: string;
      visualType?: string;
      media?: CaseStudyMedia;
      mediaSlot?: boolean;
      label?: string;
    }>;
  }>;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "data-atlas",
    experience: "board",
    year: "2025",
    title: "₹10Cr ARR in two weeks",
    eyebrow: "Case study 01",
    summary:
      "Built to help a major Indian bank stay ahead of up to ₹250 crore in DPDP penalties.",
    homeBrand: "Data Atlas",
    homeHeadline: "Data Atlas turned a 2-week bank POC into ₹10Cr ARR.",
    homeDescription:
      "Drove the product direction for Data Atlas, translating data privacy compliance requirements into an investigation workflow that gave IDfy its first enterprise data client.",
    homeDescriptionShort:
      "Turned bank data-privacy compliance into an investigation workflow that won IDfy its first enterprise data client.",
    homeTags: ["Enterprise", "B2B", "Compliance", "Data Discovery", "Product UX"],
    workAccent: "green",
    workPreview: "screenshot",
    thumbnailImage: "/images/data-compass-thumbnail.webp",
    coverImage: { src: "/images/data-compass-cover.webp", width: 2880, height: 1660 },
    ogImage: "/images/data-compass-og.jpg",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Company", value: "IDfy (Privy suite)" },
      { label: "Product", value: "Data Atlas" },
      { label: "Role", value: "Sole Product Designer" },
      { label: "Timeline", value: "2 weeks" },
      { label: "Team", value: "Senior PM, Tech Architect, 4 senior engineers, CTO" },
      { label: "Outcome", value: "POC won, ₹10Cr ARR" },
    ],
    sections: [
      {
        kicker: "The question",
        title: "So picture this",
        body: "You're the Head of InfoSec at a fintech company. Your team looks after customer data spread across dozens of systems. There are production databases, analytics warehouses, S3 buckets and a data lake or two, and on a normal Tuesday none of it worries you.\n\nSo tell me, do you know where every piece of personal data sits in all of that? Every Aadhaar number, every PAN, every bank account number tucked away in some table or some GCS folder?\n\nIf you don't, your company is exposed. Under India's DPDP Act, failing to protect personal data can cost up to ₹250 crore, and that ceiling applies to each breach. One bad incident can add up to far more.",
        visualType: "fragmented-landscape",
      },
      {
        kicker: "The problem",
        title: "But the answer was broken",
        body: "Data Atlas is the tool that answers that question. It connects to your databases and buckets and finds the personal data inside them, so you can see where it sits and how sensitive it is. On paper the flow is simple. You add an asset and run two scans on it. A Discovery Scan reads the asset's structure, and a Classification Scan finds the personal data in it. Then you open Explore and look at what they found.\n\nWhen I joined IDfy, the developers had already built the backend, and it worked. The frontend had the basic flows, but nobody had thought about the people who would use them.\n\nThen a major private-sector Indian bank asked for a proof of concept. They wanted to deploy Data Atlas inside their own environment and use it on their own data. The product would not have survived a week of real use, and the POC started in two weeks.\n\nWinning meant a bank logo and ₹10Cr of ARR. Compliance tools get bought for years at a time, so losing meant losing that bank for years too.\n\nI was the only designer, working with a senior PM, a tech architect, four engineers and our CTO. With two weeks on the clock, every idea had to be something the team could build before the bank logged in.",
      },
      {
        kicker: "Onboarding",
        title: "Adding an asset and scanning it right away",
        body: "Everything starts with an asset. An IT admin connects a database or a bucket so Data Atlas can scan it, and in the old product that took one long form and a few detours.",
        items: [
          { body: "Data Atlas supports more than 200 asset types.", bullets: ["The business wanted admins to see how big that list was.", "It also wanted to sell the assets a customer hadn't paid for.", "So I put the assets a customer can connect first, and grouped the rest below them under Premium.", "Admins reach what they can use straight away, and the premium assets are still there to tempt them."], visual: "You can connect what comes first. Everything else waits under Premium.", label: "Available first", media: { src: "/videos/data-compass/available-first.mp4", poster: "/videos/data-compass/available-first-poster.webp", alt: "The asset picker, with available assets listed first and premium assets tagged below them" } },
          { body: "Even sorted, 200 cards is a lot to look through. I grouped the assets by category, such as databases, warehouses and object storage, and added a search box. An admin who wants Postgres can type it and move on.", visual: "Admins type a name instead of scanning 200 cards.", label: "Categories and search", media: { src: "/videos/data-compass/categories-search.mp4", poster: "/videos/data-compass/categories-search-poster.webp", alt: "The asset picker, filtered by typing a name and by switching categories in the sidebar" } },
          { body: "Adding an asset used to mean one long form, and admins had to hold every field in their head at once.", bullets: ["I broke it into three steps, and each step asks only for the fields that belong together.", "The next thing every admin does after adding an asset is run a Discovery Scan.", "In the old product, that meant opening the asset, clicking \"Create Metadata Workflow\" and then running it.", "So the last step gives admins the option to start the Discovery Scan as soon as the asset is connected.", "The scan is already running when they land on the asset."], visual: "The form asks for the asset, then the connection, and the first scan starts from the last step.", label: "Three steps", media: { src: "/videos/data-compass/three-steps.mp4", poster: "/videos/data-compass/three-steps-poster.webp", alt: "Adding a PostgreSQL asset in three steps: configure the asset, connect to it with pre-flight checks, then start its scans" } },
          { body: "Admins come back to the assets page to find one asset among hundreds, so I built the top of the page around that search.", bullets: ["A summary shows the total asset count, split into structured and unstructured, and each half filters the table.", "A count for each asset type filters the table below when you click it.", "A card lists the three most recent completed workflows.", "The table has search, filters and a filter for scans that are still running."], visual: "The summary cards double as the first filter.", label: "Assets page", media: { src: "/videos/data-compass/assets-page.mp4", poster: "/videos/data-compass/assets-page-poster.webp", alt: "The assets page, where the summary cards and asset-type chips filter the table below" } },
        ],
      },
      {
        kicker: "Scan setup",
        title: "Naming scans after the job they do",
        body: "After onboarding, an admin opens the asset to set up its scans. This page used the developers' vocabulary, and admins were the ones who had to read it.",
        bullets: ["The two scans were called \"Metadata Workflow\" and \"Profiler Workflow\".", "Those names made sense to the people who built them, but an IT admin couldn't tell which one did what.", "So I named each scan after its job.", "The Discovery Scan discovers the tables, columns and files in an asset.", "The Classification Scan finds and classifies the personal data inside them."],
        items: [
          { visual: "Admins can tell the two scans apart by name alone.", label: "Scan names", media: { src: "/videos/data-compass/scan-names.mp4", poster: "/videos/data-compass/scan-names-poster.webp", alt: "Opening an asset's New scan menu, which offers a Discovery scan that builds the data catalogue and a Classification scan that finds personal data" } },
          { body: "Scan setup had the same long-form problem as onboarding.", bullets: ["Scheduling meant typing a cron expression like 0 9 * * 1, so I replaced it with a picker that writes the cron for you.", "I split the Classification Scan setup into steps.", "Exclusions sit in an accordion that stays closed, because most admins never need them."], visual: "Exclusions wait in a closed accordion, and the schedule is picked instead of typed.", label: "Setup and schedule", media: { src: "/videos/data-compass/setup-schedule.mp4", poster: "/videos/data-compass/setup-schedule-poster.webp", alt: "Setting up a Classification Scan in three steps, opening the exclusions accordion, then picking a frequency and time while the product writes the cron" } },
          { body: "Two gaps were left once a scan was running.", bullets: ["Admins couldn't see where an asset sat or how it was set up, so chips under the asset name show its domain, subdomain, data plane, type and onboarding date, and hovering one explains it.", "Finding an asset's results in Explore took a while, so an Explore chip opens the tree at that asset."], visual: "Each chip names one detail of the asset, and Explore opens at the asset.", label: "Asset chips", media: { src: "/videos/data-compass/asset-chips.mp4", poster: "/videos/data-compass/asset-chips-poster.webp", alt: "Hovering the chips under an asset's name, which show its domain, subdomain, data plane, type and onboarding date, then clicking Explore to open the tree at that asset" } },
        ],
      },
      {
        kicker: "Explore",
        title: "The fight about clicks",
        body: "Go back to being the Head of InfoSec. You open Explore to go from \"something in retail banking looks risky\" to one table and one column.\n\nThe PM wanted Explore to be a flat list, with every column and sampled file in one list and filters on top. A tree view makes people click, he said, and fewer clicks are better.",
        visual: "Filters cut the rows but never showed where the risk was.",
        label: "Flat list",
        visualType: "flat-list-live",
        items: [
          { body: "Fewer clicks help with simple tasks, but narrowing down risk isn't one. People will click when each click gets them closer to the answer. So we built both versions and tested them with our InfoSec team and a few developers." },
          { body: "In the flat list, testers stacked filters and still had pages of columns and files to go through. They lost track of what they had checked, and nobody could say where the risk was." },
          { body: "Then they tried the tree view.", bullets: ["They opened the organisation, then a domain, a subdomain and an asset.", "The structure matched how they already picture a database or a bucket.", "They could name the exact table and column they'd send to the asset owner to clean up.", "The tree view took more clicks, and nobody minded."], visual: "Each click narrows the search, from the organisation down to one column.", label: "Tree view", media: { src: "/videos/data-compass/tree-view.mp4", poster: "/videos/data-compass/tree-view-poster.webp", alt: "Explore narrowing from the organisation through a domain, subdomain, asset, database and schema down to one table's columns" } },
        ],
      },
      {
        kicker: "The info panel",
        title: "I was wrong about the info panel",
        body: "The PM also didn't want a details panel on the right, and I agreed. The tree already showed each asset's location, sensitivity and PII types, and I thought that was enough.",
        items: [
          { body: "Testing proved us both wrong.", bullets: ["Testers could see where the risk was, but they had nothing to act on.", "Data Atlas stores a lot about every level of the hierarchy, like who owns a node and how many rows and columns a Classification Scan covered.", "An InfoSec lead needs those details to troubleshoot a scan, add a missing owner or hand a data migration to the right person."] },
          { body: "So clicking any row in Explore now opens an info panel for that node. A domain, a table and a file each carry different details, so I built the panel to handle every node type we had and any we add later.", visual: "Finding the risk and acting on it happen on the same screen.", label: "Info panel", media: { src: "/videos/data-compass/info-panel.mp4", poster: "/videos/data-compass/info-panel-poster.webp", alt: "Clicking a column in Explore opens the info panel, with tabs for its details, the PII found in it and its scan history" } },
        ],
      },
      {
        kicker: "Scale",
        title: "Built for a thousand assets",
        body: "A single subdomain can hold hundreds of assets, so every pattern in Explore had to work at that size.",
        items: [
          { body: "Big hierarchies make rows tall and make it easy to lose your place.", bullets: ["Each row shows a few asset-type chips with counts, and a \"+X\" chip opens the rest in a flyout. The PII column works the same way.", "Hovering the icon next to the page title names the level you're on, such as a domain, an asset or a schema. The icons in the file tree do the same."], visual: "Rows stay one line tall, and every icon names its level.", label: "+X chips and level tooltips", media: { src: "/videos/data-compass/level-info.mp4", poster: "/videos/data-compass/level-info-poster.webp", alt: "Hovering +X chips on the domains table to open flyouts of every asset type, then clicking down through a domain, subdomain, asset, database and schema while hovering each page icon to show its level" } },
          { body: "The file tree can get huge. I added search and filters to it, so you can find any asset, database, table or bucket by name. Focus mode hides everything outside the domain or subdomain you care about.", visual: "The tree shrinks to the part you're working in.", label: "Search and focus", media: { src: "/videos/data-compass/file-tree.mp4", poster: "/videos/data-compass/file-tree-poster.webp", alt: "Searching the file tree for Payments, filtering the results to assets and opening one, then turning on focus mode so the tree shows only the CASA domain" } },
        ],
      },
      {
        kicker: "Outcome",
        title: "We won the bank",
        body: "All of this shipped inside the two weeks. The bank ran the POC, and we won it. IDfy got a bank as a customer, ₹10Cr of ARR and a stronger position in the market. The bank's team was most impressed by Explore, because it let them find their risk down to a single column.",
        visualType: "outcome-impact",
        metrics: [
          { start: "₹00Cr", end: "₹10Cr", desc: "ARR IDfy won when the bank signed" },
          { start: "0 weeks", end: "2 weeks", desc: "From the first design to the bank's POC" },
        ],
      },
      {
        kicker: "Learnings",
        title: "The lessons I kept",
        body: "",
        items: [
          { bullets: ["In a SaaS product, how easily people can find, filter and search decides most of how the product feels. Most of my decisions here were about helping someone find one thing among thousands.", "Fewer clicks is a good rule until the user's goal changes. When people are narrowing down, a structure that matches the picture in their head matters more than the click count.", "Testing settled the disagreement with the PM faster than arguing would have, and it caught my own wrong call on the info panel too."] },
          { body: "I like solving problems under a deadline, and I like settling a disagreement with evidence. Winning the bank at the end was the cherry on top." },
        ],
      },
    ],
  },
  {
    slug: "design-repo",
    year: "2026",
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
        body: "At IDfy I stopped drawing screens and started shipping them. Designing in code and delivering the frontend myself with AI agents meant backend developers stayed on backend problems. It worked: my pull request was accepted and a Data Atlas module shipped to production.\n\nThen we retired the workflow, and the reason matters.",
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
    year: "2025",
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
