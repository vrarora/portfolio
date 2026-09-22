/**
 * Facts about Vaibhav used by the home page and, later, the assistant's
 * knowledge base. Every entry marked VERIFY in docs must be confirmed
 * before it is quoted as fact.
 */
export const EMAIL = "vraroraa@protonmail.com";

export const about = {
  name: "Vaibhav Arora",
  role: "Product Designer at IDfy",
  positioning:
    "I'm a systems-minded product designer who turns technically dense enterprise products into clearer workflows people can actually use.",
  differentiator:
    "Strongest when the problem is technically dense, cross-functional, and hard to operationalize, and the job is to turn that complexity into something users can actually act on.",
  earnedSecret:
    "A solution can look clean on paper and still fail if it is not built around the user's mental model and actual job to be done.",
  location: "India",
  timeline: [
    { company: "IDfy", role: "Product Designer 2", product: "Privy suite", period: "Now" },
    { company: "Ketto", role: "Product Designer", product: "EqualAll", period: "Nov 2024 to Mar 2025" },
    { company: "Wysa", role: "Product Designer", product: "Mental health products", period: "Earlier" },
  ],
  howIWork: [
    "Designs live in a standalone repo deployed on Vercel where every screen runs.",
    "AI agents write most of the code; I own the intent, review and direction.",
    "It is not production code. Engineers own the org stack. A pull is the handoff.",
    "PMs prototype on the repo too.",
    "EqualAll was instrumented in Metabase and watched in Clarity; every change was measured against the version before it.",
  ],
  principles: [
    { name: "Mental model first", line: "Build around how users think, not how the system is structured." },
    { name: "Test the disagreement", line: "Evidence settles debates faster than conviction." },
    { name: "Constraints sharpen", line: "The clearest thinking happens under pressure." },
    { name: "Ship from the IDE", line: "Make the interaction real whenever possible." },
    { name: "Both sides count", line: "A flow that fixes the user problem but breaks the revenue model is not finished." },
    { name: "Punch above", line: "Most design asks are a symptom of something bigger." },
  ],
  closers: [
    "The bottleneck was never how fast I could design. It was how much of my intent survived the handoff.",
    "The challenge was not removing complexity but placing it at the right level.",
    "Design for the decay, not the transaction, and the giving follows.",
    "If you cannot explain your code and own it, you do not write it.",
  ],
  availability: {
    open: true,
    looking: "Senior Product Designer, or PD2 at the right company",
    where: "Product-led companies where design shapes direction",
    location: "India",
  },
  interests: [
    { name: "Twenty One Pilots", lab: "east-is-up" },
    { name: "Stoicism", lab: "memento-mori" },
    { name: "Japan's 72 microseasons", lab: "koyomi" },
    { name: "Weather and skies", lab: "atmos" },
    { name: "Print craft", lab: "rolling-paper" },
    { name: "Personal finance", lab: "pulse" },
    { name: "Generative ambient music", lab: null },
  ],
} as const;

export const upTo = [
  "Designing Privy at IDfy: privacy, DPDP compliance and data governance tools for banks and large companies.",
  "Running the Design Repo, where twenty designers, PMs and developers build designs as running code and a pull is the handoff.",
  "Building small things after hours: a weather instrument, an almanac of Japan's 72 microseasons, a walking museum for a band I like.",
  "Slowly writing three essays. One of them is about handoffs.",
] as const;

export const opinionPlaceholder = {
  beforeAssistant:
    "I'm writing this part. It's about handoffs, and why the artifact was always the problem, not the designer. Check back, or email me and I'll say it out loud.",
  afterAssistant:
    "I'm writing this part. It's about handoffs, and why the artifact was always the problem, not the designer. Until it's done, ask the assistant what I think.",
} as const;

export const workCopy = {
  label: "Work",
  caseStudiesIntro: "Three pieces of work I'd defend in a room. Each opens as a short read; the full page is one tap further.",
  experimentsIntro: "Seven small things built for no reason except wanting them to exist. Hover to preview, open to play.",
} as const;

export const notesCopy = {
  label: "Notes wall",
  subline: "Say hi, leave a thought, or draw one. Two of these are mine.",
  button: "Leave a note",
  empty: "Nobody has written here yet. Go first.",
} as const;

export const logos = {
  idfy: { src: "/images/logos/idfy-mark.webp", alt: "IDfy", width: 60, height: 36 },
  ketto: { src: "/images/logos/ketto-mark.webp", alt: "Ketto", width: 70, height: 36 },
  wysa: { src: "/images/logos/wysa-mark.webp", alt: "Wysa", width: 112, height: 36 },
} as const;
