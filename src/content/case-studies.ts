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
    slug: "agentic-design",
    experience: "board",
    year: "2026",
    title: "Teaching agents my design judgement",
    eyebrow: "Case study 02",
    summary: "A design repo and three Claude Code skills that help AI agents design the way I do at IDfy.",
    homeBrand: "Agentic Design",
    homeHeadline: "I built a design repo and three Claude Code skills that help AI agents design the way I do.",
    homeDescription:
      "Every design at IDfy now lives in one repo as working code. Three skills give the AI agents in that repo my design process, my UI rules and my illustration style, and my teammates add their own rules to them.",
    homeDescriptionShort: "A design repo and three skills that help AI agents design the way I do.",
    homeTags: ["AI-Native", "Design Systems", "DesignOps", "Claude Code", "Illustration"],
    workAccent: "blue",
    workPreview: "cover",
    thumbnailImage: "/images/agentic-design/thumbnail.webp",
    coverImage: { src: "/images/agentic-design/cover.webp", width: 2880, height: 1660 },
    ogImage: "/images/agentic-design/og.jpg",
    status: "Placeholder case study",
    visibility: "public",
    metadata: [
      { label: "Company", value: "IDfy (Privy suite)" },
      { label: "Work", value: "Design Repo and three Claude Code skills" },
      { label: "Role", value: "Product Designer 2" },
      { label: "Timeline", value: "Apr to Sep 2026" },
      { label: "Outcome", value: "20 people in the repo, features designed in days" },
    ],
    sections: [
      {
        kicker: "Background",
        title: "Designing in code at IDfy",
        body: "At IDfy I design in code. I used AI agents to build the frontend of a Data Atlas module myself, and my pull request went to production.\n\nIDfy's product runs on Elixir and Phoenix LiveView. AI agents don't write good code for this stack, and our tech lead has a rule that you only write code you can explain and maintain. I couldn't maintain Elixir code, so I stopped writing production code.",
        visual: "The loop that stopped: pull a branch, design in code with agents, merge the PR",
        label: "The loop that stopped",
        visualType: "pen:p1",
      },
      {
        kicker: "The Design Repo",
        title: "Moving every design into one repo",
        body: "I still wanted developers to get a working design instead of a static mockup, so I built a separate repo for design.",
        items: [
          {
            bullets: [
              "Every design lives in the repo as running code, deployed on Vercel.",
              "It is not production code. Engineers still build the real product in Phoenix.",
              "A developer pulls the latest design and gives it to their AI agent with the PRD. The agent builds the feature in Phoenix from that.",
            ],
            visual: "A static mockup next to the running design, which a developer pulls",
            label: "Mockup and running design",
            visualType: "pen:p2",
          },
          {
            body: "Designers started using the repo first, then PMs.",
            bullets: [
              "Today 20 people work in it: 8 designers, 5 PMs and 7 developers.",
              "All new feature design at IDfy goes through the repo.",
              "The Lineage module (four screens, multi-level flows and a graph view) took under 18 hours from brief to finished design. Before the repo, two weeks got us only the basic structure.",
            ],
            visual: "Designers, PMs and developers working in one repo",
            label: "20 people in the repo",
            visualType: "pen:p3",
          },
          {
            body: "Every push to the demo branch updates permanent Vercel links for each app.",
            bullets: [
              "PMs and pre-sales demo designs from these links, one to two weeks ahead of the real product.",
              "16 PMs and pre-sales people use them.",
              "The demo changelog has 110 entries so far, and four client POCs were built the same way.",
            ],
            visual: "A push to the demo branch updates the links PMs and pre-sales use",
            label: "Demo links",
            visualType: "pen:pdemo",
          },
          {
            body: "Anyone reviewing a demo can report an issue from inside the app.",
            bullets: [
              "They can attach a screenshot, a screen recording, a voice note or a box drawn around an element.",
              "The app, route, browser and screen size attach on their own.",
              "Each report posts to a Google Chat thread for that app. The feedback widget is in 11 apps.",
            ],
            visual: "A report from inside the app, posted to Google Chat",
            label: "In-app feedback",
            visualType: "pen:pfeedback",
          },
        ],
      },
      {
        kicker: "The problem",
        title: "Agents didn't know our decisions",
        body: "Everyone in the repo designs with AI agents. The agents could use our components, but they didn't know the decisions behind them. They made the same generic choices again and again, and I had to review and correct every screen.\n\nI fixed this with Claude Code skills. A skill is a folder of instruction files that the agent reads before it starts a task. I wrote one skill for my design process, one for UI rules and one for illustrations.",
        visual: "Three agents, three copies of the same generic screen",
        label: "Same generic screens",
        visualType: "pen:p4",
      },
      {
        kicker: "Skill 1",
        title: "A design process the agent follows",
        body: "For every feature I did the same steps by hand. I gave the agent the PRD and explained it. I asked it to research competitors and find technical constraints, and then to write a design document. Long sessions filled the context window, so I had to start new chats and explain everything again.",
        items: [
          {
            body: "Skipping steps was expensive.",
            bullets: ["One feature was built from an old sketch and a PRD that was two versions out of date.", "I rejected the whole build, and it took four more rounds to fix."],
            visual: "The first build, made from an old sketch and an outdated PRD",
            label: "The rejected build",
            visualType: "pen:s1-2",
          },
          {
            body: "The product-design skill runs the steps in order, and the agent writes no code before I approve the Product Design Document (PDD).",
            bullets: [
              "It explains the PRD in plain language, so I understand the problem before I design.",
              "It asks me questions until nine things are clear, such as the goal, the user scenarios, the scope and what \"done\" means. It asks up to four questions at a time and suggests an answer for each.",
              "It researches competitors.",
              "It reads the backend code in 25 service repos to check what the data can support.",
              "It writes the PDD. A script checks the PDD for missing sections and claims without a source.",
              "It builds in phases after I approve the PDD, and I approve each phase before the next one.",
            ],
            visual: "The steps in order, with my approval before the build",
            label: "The steps",
            visualType: "pen:s1-4",
          },
          {
            body: "Two files keep the work going across chats.",
            bullets: ["STATE.md says where the work stands.", "JOURNAL.md records every decision, including the options I dropped and why.", "A new chat reads both files and continues from there."],
            visual: "A full chat hands over to a new one through STATE.md and JOURNAL.md",
            label: "STATE and JOURNAL",
            visualType: "pen:s1-5",
          },
          {
            body: "The competitor research changes the design.",
            bullets: [
              "On the unstructured asset page, users needed to see how much of a bucket a scan actually read.",
              "None of the data security tools I looked at showed this.",
              "Datadog APM shows why each piece of data was dropped, so I used that pattern for a coverage strip.",
            ],
            visual: "The research table, and the coverage strip that came from it",
            label: "Coverage strip",
            visualType: "pen:s1-6",
          },
          {
            body: "A feature used to take about two weeks from PRD to approved design.",
            bullets: [
              "The unstructured asset page went from kickoff to an approved PDD and all six build phases in two days.",
              "13 PDDs have used the skill so far.",
              "A teammate took one feature from PRD to built UI in one day.",
            ],
            visual: "About two weeks before the skill, two days after",
            label: "Two weeks to two days",
            visualType: "pen:s1-7",
          },
        ],
      },
      {
        kicker: "Skill 2",
        title: "UI rules and refusals",
        body: "I didn't want design reviews to slow the team down. But the agents had no record of what we had fixed or rejected before, so they kept repeating old mistakes.",
        items: [
          {
            body: "The ScanLine icon is one example.",
            bullets: [
              "In feedback round 36, I rejected the ScanLine icon for a tab and wrote the reason in the changelog.",
              "Seven rounds later, an agent used ScanLine again.",
              "I couldn't remember what we had picked instead.",
            ],
            visual: "ScanLine, rejected in round 36 and used again in round 43",
            label: "ScanLine",
            visualType: "pen:s2-2",
          },
          {
            body: "I based the privy-ui-standards skill on Vercel's post about teaching agents product design. It uses the same parts: guidance files, examples of past work and a list of known gaps. I added refusals and rules from my own feedback.",
            bullets: [
              "A list of refusals. Each rejected option has its reason and the feedback round it came from.",
              "Rules taken from my past feedback, starting with 43 rounds from the Data Compass changelog.",
            ],
            visual: "Vercel's structure, and the parts I added to it",
            label: "Vercel's structure",
            visualType: "pen:s2-3",
          },
          {
            body: "Most of my feedback starts as notes on the live screen. I use Agentation, which lets me click an element and write a note, and the agent reads the notes directly.",
            bullets: ["The agent works through each note, replies in one line and marks it resolved.", "Agentation is on in 9 apps in the repo."],
            visual: "Notes on the live screen, read by the agent",
            label: "Agentation notes",
            visualType: "pen:s2-notes",
          },
          {
            body: "The agent keeps the skill up to date. After each feedback round, it adds what I approved as a rule and what I rejected as a refusal.",
            visual: "A feedback round becomes rules and refusals",
            label: "Rules and refusals",
            visualType: "pen:s2-4",
          },
          {
            body: "For a low-confidence marker on the risk gauge, I rejected seven options before we chose a small \"Low\" tag. All seven are in the refusals list, so no agent suggests them again.",
            visual: "Seven rejected markers and the tag that stayed",
            label: "Low-confidence marker",
            visualType: "pen:s2-5",
          },
          {
            body: "The skill has no workflow in it, so designers, PMs and engineers can all use it.",
            bullets: ["Rules went from 129 to 270, and refusals from 33 to about 141.", "Two teammates now add their own rules.", "Features need fewer feedback rounds, because the agent checks the refusals first."],
            visual: "Me and two teammates writing into the same skill",
            label: "Teammates add rules",
            visualType: "pen:s2-6",
          },
        ],
      },
      {
        kicker: "Skill 3",
        title: "An illustration system",
        body: "Privy's illustrations came from Storyset. Editing them took hours, and they didn't look like one product.",
        items: [
          {
            body: "First I tried generating illustrations with Gemini.",
            bullets: ["I kept 5 of 24 images.", "The brand blue was wrong in every image, and some had over 4,000 colours."],
            visual: "The 24 images Gemini generated",
            label: "Gemini images",
            visualType: "pen:s3-2",
          },
          {
            body: "Then I drew six style options as SVG, and chose isometric because it added depth.",
            visual: "The six style options, drawn as SVG",
            label: "Six styles",
            visualType: "pen:s3-3",
          },
          {
            body: "Nine days later, after a review with my manager, I dropped isometric for a flat style.",
            bullets: [
              "A frosted-glass version was also reverted the same day it shipped.",
              "The final style, Soft-Stack, uses flat front-facing objects, one soft shadow and a light grid underneath.",
            ],
            visual: "Isometric retired, Soft-Stack in its place",
            label: "Soft-Stack",
            visualType: "pen:s3-4",
          },
          {
            body: "The privy-illustration skill keeps what an illustration shows separate from how it looks.",
            bullets: [
              "What it shows changes each time. The agent asks me about the moment, the feeling and the one message the picture must get across.",
              "How it looks stays fixed: one soft shadow, a grid underneath and one pastel accent colour picked by meaning, like green for success.",
              "Each lesson is saved as a numbered decision. I saved 59 in 15 days.",
            ],
            visual: "What the agent asks each time, and the style rules that never change",
            label: "Content and style",
            visualType: "pen:s3-5",
          },
          {
            body: "The illustrations now ship in the consent notice screens and in Data Compass.",
            bullets: ["A teammate used the skill for Incident Management and added two rules to it.", "Leadership liked this skill the most out of all the experiments."],
            visual: "Two Soft-Stack pieces from the product",
            label: "Shipped pieces",
            visualType: "pen:s3-6",
          },
        ],
      },
      {
        kicker: "Outcome",
        title: "Results",
        body: "Each decision I make is saved in a file that the next agent reads, and my teammates add to the same files.",
        visual: "Feedback becomes a rule, the next agent reads it, and rounds get fewer",
        label: "The loop",
        visualType: "pen:c1",
        metrics: [
          { start: "0", end: "20", desc: "Designers, PMs and developers working in the repo" },
          { start: "2 wks", end: "2 days", desc: "One feature, from PRD to approved design and built UI" },
          { start: "0", end: "2", desc: "Teammates adding rules to the skills" },
        ],
        items: [{ visual: "Outcome metrics", visualType: "outcome-impact" }],
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
