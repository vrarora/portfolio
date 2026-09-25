import { caseStudies, type CaseStudy } from "./case-studies";
import { siteLinks } from "./site-links";

/**
 * Copy for the home page. Paragraphs are written as tokens so a phrase can
 * carry a link without the page parsing markup.
 */

export type RichToken =
  | string
  | { link: string; text: string; mark?: boolean }
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
/** The full wordmark, for the project tile where a cropped mark would lose half the name. */
type Wordmark = { src: string; width: number; height: number };

export const LOGOS: Record<LogoId, { src: string; alt: string; tint: string; wordmark?: Wordmark }> = {
  idfy: {
    src: "/images/logos/marks/idfy.png",
    alt: "IDfy",
    tint: "#fde9e7",
    wordmark: { src: "/images/logos/idfy.png", width: 1080, height: 653 },
  },
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
    "I grew up on the streets of Bikaner, Rajasthan, always curious, wanting to learn and grow, and to connect with people on a deeper level.",
  ],
  more: [
    [
      "These days, I design products at IDfy, helping people make sense of privacy and data governance. Outside work, I’m exploring agentic coding through ",
      { link: "/playground/", text: "small experiments", mark: true },
      ", following my curiosity one idea at a time.",
    ],
    ["Away from screens, you’ll find me reading, journaling, at the gym, playing video games, or philosophising with people. Give me good company and a big question, and I can philosophise well into the evening."],
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

/** Icons drawn on the bloom tiles of personal work. */
export type ProjectGlyph = "shapes" | "book";

/** The mark that floats beside a hovered project row: a company logo, or a bloom with an icon for personal work. */
export type ProjectMark = { logo: LogoId } | { bloom: BloomName; glyph: ProjectGlyph };

/** One row in the Projects list. */
export type ProjectRow = {
  id: string;
  year: string;
  title: string;
  role: string;
  href: string;
  mark: ProjectMark;
};

const COMPANY_LOGOS: Partial<Record<string, LogoId>> = {
  "data-compass": "idfy",
  "design-repo": "idfy",
  equalall: "ketto",
};

const markOf = (study: CaseStudy): ProjectMark => {
  const logo = COMPANY_LOGOS[study.slug];
  return logo ? { logo } : { bloom: study.workAccent, glyph: "book" };
};

const roleOf = (study: CaseStudy) =>
  study.metadata.find((item) => item.label === "Role")?.value ?? "Case study";

export const projects: readonly ProjectRow[] = [
  ...caseStudies.map((study) => ({
    id: study.slug,
    year: study.year,
    title: study.homeBrand,
    role: roleOf(study),
    href: `/work/${study.slug}/`,
    mark: markOf(study),
  })),
  { id: "playground", year: "2026", title: "Playground", role: "Experiment Lab", href: "/playground/", mark: { bloom: "dusk", glyph: "shapes" } },
  { id: "story", year: "2026", title: "My Story", role: "Autobiography", href: "/story/", mark: { bloom: "night", glyph: "book" } },
];
