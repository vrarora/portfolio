import { caseStudies } from "./case-studies";

/**
 * Copy for the home page. The narrative is written as tokens so the page can
 * darken it word by word and set company logos inline between the words.
 */

export type LogoId = "idfy" | "ketto" | "wysa";

export type NarrativeToken =
  | string
  | { logos: readonly LogoId[] }
  | { link: string; text: string };

export const hero = {
  name: "Vaibhav Arora",
  role: "Product designer at IDfy",
  location: "India",
  timeZone: "Asia/Kolkata",
} as const;

export const narrative: readonly (readonly NarrativeToken[])[] = [
  ["I design for people in the middle of something hard."],
  [
    "Right now that is privacy at",
    { logos: ["idfy"] },
    "IDfy, where I turn dense compliance systems into workflows people can act on.",
  ],
  [
    "Before that, I worked with teams like",
    { logos: ["ketto", "wysa"] },
    "Ketto and Wysa, on giving and on mental health.",
  ],
  ["I design in code. Most of my work runs, so the idea survives the handoff."],
  [
    "Mostly, I am curious about people. I grew up on a busy street in Bikaner, watching the whole world walk past my door.",
    { link: "/story/", text: "I wrote about it here." },
  ],
];

/** Square marks cut from each wordmark, shown as a small overlapping stack. */
export const LOGOS: Record<LogoId, { src: string; alt: string }> = {
  idfy: { src: "/images/logos/marks/idfy.png", alt: "IDfy" },
  ketto: { src: "/images/logos/marks/ketto.png", alt: "Ketto" },
  wysa: { src: "/images/logos/marks/wysa.png", alt: "Wysa" },
};

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
