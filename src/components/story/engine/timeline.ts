import { clamp01, hex, mix, lerp, smooth, type RGB } from "./math";

/**
 * The story runs in two acts, each with its own 0..1 timeline.
 * The first finds design; the second is the life he built after.
 */
const FIRST_VH = 2000;
const AFTER_VH = 1600;

/** Scroll length of the story, in viewport heights. */
export const STORY_LENGTH_VH = FIRST_VH + AFTER_VH;

/** Where the second act begins, as a fraction of total scroll. */
export const SPLIT = FIRST_VH / STORY_LENGTH_VH;

/** Progress through the first act; runs past 1 once the second act begins. */
export const firstProgress = (p: number) => p / SPLIT;

/** Progress through the second act; negative before it begins. */
export const afterProgress = (p: number) => (p - SPLIT) / (1 - SPLIT);

/** Total scroll fraction for a point on the second act's timeline. */
export const afterToStory = (q: number) => SPLIT + q * (1 - SPLIT);

export type StoryLine = { id: string; text: string; start: number; end: number };

/** Each entry is one stanza; "\n" marks a line break within it. Times are first-act progress. */
const FIRST_LINES: readonly StoryLine[] = [
  { id: "street-1", text: "He grew up on a busy street in Bikaner,\nwhere the whole world walked past his door.", start: 0.012, end: 0.07 },
  { id: "street-2", text: "He watched them all.\nThe hurried ones. The tired ones.\nThe ones who smiled at no one.", start: 0.07, end: 0.13 },
  { id: "street-3", text: "What were they thinking?\nWhat made them feel that way?", start: 0.13, end: 0.19 },
  { id: "street-4", text: "He didn't know it yet,\nbut those questions would find him again.", start: 0.19, end: 0.25 },
  { id: "fork-1", text: "Then the road split in two.", start: 0.265, end: 0.3 },
  { id: "fork-2", text: "One was paved, crowded, certain.\nThe other wandered off into the hills.", start: 0.3, end: 0.335 },
  { id: "fork-3", text: "Everyone said to take the safe one.\nSo he did.", start: 0.335, end: 0.37 },
  { id: "road-1", text: "He tried to love it.\nHe tried so hard.", start: 0.37, end: 0.405 },
  { id: "road-2", text: "But the harder he tried,\nthe smaller he became.", start: 0.405, end: 0.44 },
  { id: "night-1", text: "Some nights,\nhe couldn't see tomorrow at all.", start: 0.445, end: 0.485 },
  { id: "night-2", text: "So he wrote.\nNight after night, he wrote his way through the dark.", start: 0.485, end: 0.53 },
  { id: "room-1", text: "In his third year, alone in his room,\nhe opened a seminar, expecting nothing.", start: 0.555, end: 0.595 },
  { id: "room-2", text: "Then someone began to talk about people.", start: 0.595, end: 0.63 },
  { id: "room-3", text: "Empathy. Behaviour.\nThe why behind every choice.", start: 0.63, end: 0.665 },
  { id: "room-4", text: "How to make their lives easier.", start: 0.665, end: 0.7 },
  { id: "room-5", text: "His heart raced with excitement.\nFor once, not with fear.", start: 0.7, end: 0.745 },
  { id: "street-return", text: "He couldn't sit still.\nHe stepped out into the street where he grew up.", start: 0.755, end: 0.815 },
  { id: "puddle-1", text: "In a puddle, the boy from that busy street\nlooked back at him.", start: 0.82, end: 0.855 },
  { id: "puddle-2", text: "All those questions.\nAll those strangers he had wondered about.", start: 0.855, end: 0.885 },
  { id: "puddle-3", text: "He had been this all along.", start: 0.885, end: 0.91 },
  { id: "dawn-1", text: "Everything became clear.", start: 0.91, end: 0.945 },
  { id: "dawn-2", text: "For the first time in years,\nhe couldn't wait for tomorrow.", start: 0.945, end: 1 },
];

/** Times are second-act progress. The present tense is saved for the last two stanzas. */
const AFTER_LINES: readonly StoryLine[] = [
  { id: "work-1", text: "He went looking for the people\nhe used to wonder about.", start: 0.035, end: 0.085 },
  { id: "work-2", text: "At Wysa, they were people carrying something heavy,\nlooking for someone to talk to.", start: 0.085, end: 0.14 },
  { id: "work-3", text: "At Ketto, they were families\nasking strangers for help.", start: 0.14, end: 0.195 },
  { id: "work-4", text: "At IDfy, they were people\ntrying to prove they were themselves.", start: 0.195, end: 0.25 },
  { id: "work-5", text: "Strangers, like the ones outside his door.\nHe still wondered what they were feeling.", start: 0.25, end: 0.31 },
  { id: "love-1", text: "He never walked past a dog without stopping.", start: 0.33, end: 0.38 },
  { id: "love-2", text: "He read before sleep.\nHe walked whenever his head got loud.", start: 0.38, end: 0.43 },
  { id: "love-3", text: "Soft songs in his ears.\nHeavy weights in his hands.", start: 0.43, end: 0.48 },
  { id: "love-4", text: "Films, games, good food.\nAnd sweets. Always sweets.", start: 0.48, end: 0.53 },
  { id: "love-5", text: "He still wrote at night.\nThe pages were lighter now.", start: 0.53, end: 0.58 },
  { id: "peace-1", text: "He learned to be where his feet were.", start: 0.61, end: 0.66 },
  { id: "peace-2", text: "Nothing to chase. Nothing to prove.\nJust one slow breath, then another.", start: 0.66, end: 0.71 },
  { id: "peace-3", text: "He came to believe that life means\nwhatever we make it mean.", start: 0.71, end: 0.76 },
  { id: "peace-4", text: "So he made his out of wonder and growing,\nout of making things, and the people he loved.", start: 0.76, end: 0.81 },
  { id: "stars", text: "And on quiet nights, he still made small things,\njust to see what would happen.", start: 0.81, end: 0.87 },
  { id: "end-1", text: "Somewhere on a busy street in Bikaner,\na curious boy once watched the whole world walk by.", start: 0.875, end: 0.915 },
  { id: "end-2", text: "That boy is me.", start: 0.915, end: 0.95 },
  // Ends past 1 so the last stanza is fully written and still holding when the scroll runs out.
  { id: "end-3", text: "You are going to do great in your life.", start: 0.95, end: 1.04 },
];

/** Every stanza, timed as a fraction of total scroll. */
export const LINES: readonly StoryLine[] = [
  ...FIRST_LINES.map((line) => ({ ...line, start: line.start * SPLIT, end: line.end * SPLIT })),
  ...AFTER_LINES.map((line) => ({ ...line, start: afterToStory(line.start), end: afterToStory(line.end) })),
];

/** Where each first-act beat happens, as first-act progress. */
export const BEATS = {
  streetPan: [0, 0.26],
  curiosity: [0.12, 0.16, 0.3, 0.36],
  streetFade: [0.25, 0.3],
  hillRise: [0.26, 0.32],
  growUp: [0.26, 0.33],
  fork: [0.27, 0.3, 0.38, 0.42],
  crowd: [0.29, 0.4],
  roadWalk: [0.37, 0.48],
  poles: [0.36, 0.39, 0.46, 0.49],
  rain: [0.43, 0.46, 0.52, 0.55],
  writing: [0.485, 0.495, 0.525, 0.535],
  room: [0.53, 0.565, 0.79, 0.81],
  wonder: [0.595, 0.63, 0.77, 0.8],
  racing: [0.7, 0.745],
  standUp: [0.755, 0.78],
  outside: [0.795, 0.815],
  walkOut: [0.8, 0.805, 0.82, 0.825],
  reflection: [0.822, 0.855],
  dawn: [0.9, 1],
  lookUp: [0.91, 0.94],
} as const;

/** Where each second-act beat happens, as second-act progress. */
export const AFTER_BEATS = {
  leave: [0, 0.045],
  walk: [0.005, 0.63],
  landIn: [0.005, 0.045],
  plainsIn: [0.575, 0.625],
  sit: [0.625, 0.66],
  fireflies: [0.72, 0.77, 0.84, 0.9],
  stars: [0.8, 0.84, 0.9, 0.94],
  starsLink: [0.815, 0.835, 0.885, 0.905],
  boy: [0.91, 0.94],
} as const;

/** The middle of the stanza each place belongs to; the place is in front of him then. */
export const PLACES = {
  bench: 0.1125,
  family: 0.1675,
  gate: 0.2225,
  strangers: 0.28,
  cart: 0.505,
  lone: 0.64,
} as const;

export type Sky = {
  zenith: RGB;
  upper: RGB;
  lower: RGB;
  horizon: RGB;
  sun: RGB;
  /** Sun centre, as fractions of the viewport. */
  sunX: number;
  sunY: number;
  glow: number;
  stars: number;
  rays: number;
  haze: number;
};

type SkyKey = { at: number; sky: Sky };

const key = (
  at: number,
  colors: [string, string, string, string, string],
  sunX: number,
  sunY: number,
  glow: number,
  stars: number,
  rays: number,
  haze: number,
): SkyKey => ({
  at,
  sky: {
    zenith: hex(colors[0]),
    upper: hex(colors[1]),
    lower: hex(colors[2]),
    horizon: hex(colors[3]),
    sun: hex(colors[4]),
    sunX,
    sunY,
    glow,
    stars,
    rays,
    haze,
  },
});

const SKY_KEYS: readonly SkyKey[] = [
  key(0, ["#34437a", "#b27a86", "#f0a868", "#ffd89a", "#fff2c8"], 0.72, 0.66, 0.9, 0, 0.12, 0.6),
  key(0.18, ["#2b336e", "#a45f7c", "#ec8c5c", "#ffc587", "#ffe3ab"], 0.74, 0.72, 0.85, 0, 0.08, 0.55),
  key(0.3, ["#1a1946", "#5b397c", "#cc5e79", "#ff9c69", "#ffb07a"], 0.76, 0.86, 0.45, 0.2, 0, 0.3),
  key(0.41, ["#0b1026", "#1d2146", "#3a3060", "#4d3a66", "#ffffff"], 0.5, 1.3, 0, 0.7, 0, 0.15),
  key(0.46, ["#0a0d1c", "#141a31", "#1d2440", "#262d4a", "#ffffff"], 0.5, 1.3, 0, 0.25, 0, 0.1),
  key(0.55, ["#070b1e", "#0f1733", "#1a2448", "#28305c", "#ffffff"], 0.5, 1.3, 0, 0.7, 0, 0.1),
  key(0.82, ["#060a1c", "#101a3a", "#1c2752", "#2c3566", "#ffffff"], 0.5, 1.3, 0, 1, 0, 0.1),
  key(0.92, ["#1b2150", "#48367a", "#b8628a", "#ffa070", "#ffd9a0"], 0.62, 0.8, 0.55, 0.35, 0.2, 0.3),
  key(1, ["#5a4f9a", "#d58aa0", "#ffc18a", "#fff1c9", "#fffbe8"], 0.62, 0.62, 0.95, 0, 0.55, 0.55),
];

/** The second act's first key is the first act's last, so the sky never jumps. */
const AFTER_SKY_KEYS: readonly SkyKey[] = [
  { at: 0, sky: SKY_KEYS[SKY_KEYS.length - 1].sky },
  key(0.08, ["#4b78b8", "#8db2da", "#d6e2e2", "#f6e6c4", "#fffcf0"], 0.7, 0.3, 0.7, 0, 0.3, 0.5),
  key(0.3, ["#4371b4", "#84aad6", "#d9e1da", "#f4e0b8", "#fff8e2"], 0.66, 0.24, 0.65, 0, 0.25, 0.45),
  key(0.45, ["#4e5f9e", "#b88a92", "#f0b47e", "#ffd9a2", "#fff0c8"], 0.7, 0.5, 0.8, 0, 0.3, 0.55),
  key(0.58, ["#3b3f84", "#b06e86", "#f09a6a", "#ffc88e", "#ffe1a8"], 0.72, 0.66, 0.9, 0, 0.25, 0.6),
  key(0.68, ["#262a66", "#6b4a86", "#d2789a", "#ffb38a", "#ffd0a0"], 0.72, 0.8, 0.65, 0.08, 0.12, 0.45),
  key(0.76, ["#141a44", "#34306a", "#7a4c80", "#c9788a", "#ffc090"], 0.72, 0.94, 0.22, 0.45, 0, 0.3),
  key(0.83, ["#070b1e", "#0f1733", "#1a2448", "#2c3566", "#ffffff"], 0.5, 1.3, 0, 1, 0, 0.12),
  key(0.93, ["#080c20", "#121a38", "#1e2750", "#303a6c", "#ffffff"], 0.5, 1.3, 0, 1, 0, 0.12),
  key(1, ["#2a2c66", "#6b4f8e", "#d88a96", "#ffc49a", "#ffe6bf"], 0.66, 0.84, 0.55, 0.25, 0.18, 0.4),
];

export function blendSky(a: Sky, b: Sky, t: number): Sky {
  return {
    zenith: mix(a.zenith, b.zenith, t),
    upper: mix(a.upper, b.upper, t),
    lower: mix(a.lower, b.lower, t),
    horizon: mix(a.horizon, b.horizon, t),
    sun: mix(a.sun, b.sun, t),
    sunX: lerp(a.sunX, b.sunX, t),
    sunY: lerp(a.sunY, b.sunY, t),
    glow: lerp(a.glow, b.glow, t),
    stars: lerp(a.stars, b.stars, t),
    rays: lerp(a.rays, b.rays, t),
    haze: lerp(a.haze, b.haze, t),
  };
}

function sample(keys: readonly SkyKey[], t: number): Sky {
  if (t <= keys[0].at) return keys[0].sky;
  for (let i = 1; i < keys.length; i += 1) {
    const b = keys[i];
    if (t <= b.at) {
      const a = keys[i - 1];
      return blendSky(a.sky, b.sky, smooth((t - a.at) / (b.at - a.at)));
    }
  }
  return keys[keys.length - 1].sky;
}

/** The first act's sky, by first-act progress. */
export const skyAt = (p: number) => sample(SKY_KEYS, p);

/** The second act's sky, by second-act progress. */
export const skyAfter = (q: number) => sample(AFTER_SKY_KEYS, clamp01(q));
