import { caseStudies } from "./case-studies";
import { siteLinks } from "./site-links";

/**
 * Copy for the home page. Paragraphs are written as tokens so a phrase can
 * carry a link without the page parsing markup.
 */

export type RichToken =
  | string
  | { link: string; text: string }
  /** A term with a short explanation shown on hover or focus. */
  | { term: string; tip: string }
  /** A phrase with a hand-drawn marker highlight. */
  | { mark: string };
export type RichParagraph = readonly RichToken[];

export const hero = {
  name: "Vaibhav Arora",
  role: "Product designer at IDfy",
  location: "India",
  city: "Mumbai, India",
  timeZone: "Asia/Kolkata",
} as const;

export type LogoId = "idfy" | "ketto" | "wysa";

/** Square marks cut from each wordmark, stacked as tiles in the statement; the tint shows through the mark's white. */
export const LOGOS: Record<LogoId, { src: string; alt: string; tint: string }> = {
  idfy: { src: "/images/logos/marks/idfy.png", alt: "IDfy", tint: "#fde9e7" },
  ketto: { src: "/images/logos/marks/ketto.png", alt: "Ketto", tint: "#e3f5f2" },
  wysa: { src: "/images/logos/marks/wysa.png", alt: "Wysa", tint: "#eceffd" },
};

/** Inline pieces the statement sets between its words. */
export type StatementToken =
  | string
  | { scribble: string }
  | { tag: string }
  | { people: string }
  | { logos: readonly LogoId[] };

/** The large statement under the hero; words fill in as they are read. */
export const statement: readonly (readonly StatementToken[])[] = [
  ["My work is about making", { scribble: "complexity" }, "feel", { tag: "desirable" }, "without dumbing it down."],
  ["Usually for privacy teams. Always for", { people: "people" }, "."],
  ["Over the last few years, I have designed", { logos: ["idfy", "ketto", "wysa"] }, "products for privacy, giving and mental health."],
];

/** "Who I am": where he comes from shows; now, side projects and life away from screens open under Learn more. */
export const whoIAm: { lead: RichParagraph; more: readonly RichParagraph[] } = {
  lead: [
    "I grew up in Bikaner, Rajasthan, in a house on the main street of a busy market. I spent my childhood watching the whole world walk past my door and wondering what people were thinking. That curiosity carried me through engineering, until a seminar in my third year showed me it had a name: ",
    { mark: "product design" },
    ".",
  ],
  more: [
    [
      "These days, I'm a Product Designer at IDfy, working on Privy, our suite of privacy and data governance tools for banks and large companies. I ",
      { link: "/work/design-repo/", text: "design in code" },
      ", so most of my work runs. Outside work, I'm usually building ",
      { link: "/playground/", text: "small experiments" },
      ", like a weather instrument or an almanac of Japan's 72 microseasons, just to see what happens.",
    ],
    [
      "Away from screens, I walk whenever my head gets loud, read before sleep, and still keep a journal. I lift, I meditate, and I never pass a dog without stopping.",
    ],
    [
      "Evenings are dim warm lights, soft songs, and a film or a console game. When I'm out, I'm hunting for good food, and sweets. Always sweets.",
    ],
  ],
};

/** A line in "What I've been up to", with optional smaller notes beneath it. */
export type UpToItem = { line: RichParagraph; notes?: readonly RichParagraph[] };

export const upTo: readonly UpToItem[] = [
  {
    line: [
      "Designing ",
      { link: "/work/data-compass/", text: "Data Compass" },
      ", Privy's data discovery suite that helps organisations become compliant with the ",
      {
        term: "DPDP Act",
        tip: "India's Digital Personal Data Protection Act, 2023, which sets how companies collect, store and use personal data.",
      },
      ".",
    ],
    notes: [
      ["Awarded for winning the MeitY challenge hackathon."],
      [
        "Awarded for ",
        {
          link: "https://www.linkedin.com/posts/vaibhavrarora_got-awared-circle-of-champions-for-bringing-activity-7461114287877603328-jNfe",
          text: "bringing an AI-powered design process to the team",
        },
        ".",
      ],
      [
        "Awarded for ",
        {
          link: "https://www.linkedin.com/posts/vaibhavrarora_ever-since-i-was-a-kid-i-knew-i-wanted-to-activity-7503480222948769792-oHnE",
          text: "raising the design standard at IDfy",
        },
        ".",
      ],
    ],
  },
  { line: ["Learning ", { link: siteLinks.github, text: "AI coding and design engineering" }, "."] },
  { line: ["Telling ", { link: "/story/", text: "my story" }, ", from a busy street in Bikaner to where I am now."] },
];

export type FindMeCard = { id: string; label: string; line: string; href: string };

export const findMe: readonly FindMeCard[] = [
  { id: "linkedin", label: "LinkedIn", line: "Say hello", href: siteLinks.linkedin },
  { id: "github", label: "GitHub", line: "Read the code", href: siteLinks.github },
  { id: "x", label: "X", line: "Small thoughts", href: siteLinks.twitter },
];

/** Bloom colours for a sleeve or a figure background: three soft lights over a base. */
export type Bloom = { base: string; a: string; b: string; c: string };

export const BLOOMS = {
  green: { base: "#e9efe4", a: "#9fd4a8", b: "#f4d58a", c: "#7fb7c9" },
  blue: { base: "#e6eaf4", a: "#8fb0f0", b: "#c9a6f0", c: "#f2c4a4" },
  orange: { base: "#f6ebe2", a: "#ffb27a", b: "#f59ab0", c: "#ffd88a" },
  dusk: { base: "#ece6f2", a: "#b59ce6", b: "#ff9f86", c: "#ffd49a" },
  night: { base: "#1d2040", a: "#4d4f9a", b: "#d98aa8", c: "#ffc38e" },
} as const satisfies Record<string, Bloom>;

export type BloomName = keyof typeof BLOOMS;

/** One sleeve on the project shelf. */
export type ShelfRecord = {
  id: string;
  title: string;
  line: string;
  meta: string;
  href: string;
  bloom: BloomName;
  /** Tilt of the sleeve on the shelf, in degrees. */
  tilt: number;
  image?: string;
};

const LINES: Record<string, string> = {
  "data-compass": "A three-week bank POC that became IDfy's first enterprise data client.",
  "design-repo": "Design that runs, so a pull became the handoff.",
  equalall: "Designing a gift against a fading feeling.",
};

const TILTS = [-3, 2, -2, 3, -1];

const shelf: readonly Omit<ShelfRecord, "tilt">[] = [
  ...caseStudies.map((study) => ({
    id: study.slug,
    title: study.homeBrand,
    line: LINES[study.slug] ?? study.summary,
    meta: `Case study · ${study.year}`,
    href: `/work/${study.slug}/`,
    bloom: study.workAccent,
    image: study.thumbnailImage,
  })),
  { id: "playground", title: "Playground", line: "Small things made on quiet nights, to see what would happen.", meta: "Experiments", href: "/playground/", bloom: "dusk" },
  { id: "story", title: "A story", line: "A boy from a busy street in Bikaner.", meta: "Scroll story", href: "/story/", bloom: "night" },
];

export const records: readonly ShelfRecord[] = shelf.map((record, i) => ({ ...record, tilt: TILTS[i % TILTS.length] }));
