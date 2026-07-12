export type PlaygroundNodeType = "video" | "image";

export type PlaygroundNode = {
  id: string;
  title: string;
  /** Display code rendered under the label as "[ 0072 ]". */
  index: string;
  category: string;
  year: string;
  description: string;
  type: PlaygroundNodeType;
  /** Preview media: a muted looping MP4 (video) or a still (image). */
  src: string;
  /** Poster shown before the preview loads and under reduced motion. */
  poster: string;
  /** Width / height of the preview media. */
  aspectRatio: number;
  /** Resting position in the field, as fractions of field width and height. */
  home: [number, number];
  /** Depth, -0.6 (far) to 0.6 (near). Drives parallax, scale and thread dimming. */
  z: number;
  /** Same-domain live build, opened by the stage's "Open live" link. */
  liveUrl: string;
  /** Optional object-position override for the hover preview crop. */
  objectPosition?: string;
};

export const playgroundNodes: PlaygroundNode[] = [
  {
    id: "koyomi",
    title: "Koyomi",
    index: "0072",
    category: "Generative almanac",
    year: "2026",
    description:
      "A living almanac of Japan's 72 microseasons. Every five days the calendar turns and the whole scene follows: a generative particle field, an OKLab palette, typography that page-turns between seasons, and a quiet Web Audio ambience.",
    type: "video",
    src: "/playground/koyomi/preview.mp4",
    poster: "/playground/koyomi/poster.webp",
    aspectRatio: 960 / 600,
    home: [0.22, 0.2],
    z: 0.35,
    liveUrl: "/labs/koyomi/",
  },
  {
    id: "memento-mori",
    title: "Memento Mori",
    index: "4160",
    category: "Interactive story",
    year: "2026",
    description:
      "A human life, in weeks. Enter a birthday and a field of week-lights burns in, one for every week already spent, then the piece counts what is left. Staged like a ritual: threshold, birth, the burn, the ledger, the turn, the vigil.",
    type: "video",
    src: "/playground/memento-mori/preview.mp4",
    poster: "/playground/memento-mori/poster.webp",
    aspectRatio: 960 / 600,
    home: [0.76, 0.24],
    z: -0.3,
    liveUrl: "/labs/memento-mori/",
  },
  {
    id: "pulse",
    title: "Pulse",
    index: "0390",
    category: "Product concept",
    year: "2026",
    description:
      "An AI-native personal finance prototype. A spending pulse that projects where the month is heading, a budget breakdown that names the leaks, and a planning conversation that drafts a recovery plan in front of you.",
    type: "video",
    src: "/playground/pulse/preview.mp4",
    poster: "/playground/pulse/poster.webp",
    aspectRatio: 444 / 960,
    home: [0.32, 0.74],
    z: -0.1,
    liveUrl: "/labs/pulse/",
    objectPosition: "center top",
  },
  {
    id: "hover-reveal",
    title: "Hover Reveal",
    index: "1054",
    category: "Shader study",
    year: "2026",
    description:
      "A clay relief of Marcus Aurelius that turns to polished metal under the cursor. The brush widens with pointer speed, the metal cools back to clay when you stop, and leaving the frame resets the sculpt.",
    type: "video",
    src: "/playground/hover-reveal/preview.mp4",
    poster: "/playground/hover-reveal/poster.webp",
    aspectRatio: 678 / 960,
    home: [0.7, 0.68],
    z: 0.45,
    liveUrl: "/labs/hover-reveal/",
  },
  {
    id: "atmos",
    title: "Atmos",
    index: "0288",
    category: "Weather instrument",
    year: "2026",
    description:
      "A full-bleed weather app where the sky is the interface. Every condition and time of day is an art-directed composition of live WebGL shaders driven by real forecasts. Press the temperature curve and the whole sky time-travels to that hour, sun and moon gliding along their arc.",
    type: "video",
    src: "/playground/atmos/preview.mp4",
    poster: "/playground/atmos/poster.webp",
    aspectRatio: 444 / 960,
    // Lower-centre, kept clear of the viewport centre so it does not auto-hover
    // on load (the engine seeds the cursor at centre until the first move).
    home: [0.5, 0.66],
    z: -0.15,
    liveUrl: "/labs/atmos/",
  },
  {
    id: "east-is-up",
    title: "East Is Up",
    index: "0921",
    category: "Walking museum",
    year: "2026",
    description:
      "A scroll-driven walking museum through the complete Twenty One Pilots mythology, Blurryface to Breach. One continuous camera glides through seven rooms, each with its own palette, fog, typography, and a sixteen-song score that turns with the story. Every monument is hand-drawn to canvas at boot, no image assets anywhere. It ends in darkness, with one lit torch.",
    type: "video",
    src: "/playground/east-is-up/preview.mp4",
    poster: "/playground/east-is-up/poster.webp",
    aspectRatio: 960 / 600,
    // Top-centre pocket, well above the auto-hover dead zone at [0.5, ~0.45].
    home: [0.48, 0.16],
    z: 0.25,
    liveUrl: "/labs/east-is-up/",
  },
];
