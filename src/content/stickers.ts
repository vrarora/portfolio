export type Sticker = {
  id: string;
  src: string;
  alt: string;
  w: number;
  h: number;
  /** "photo" renders a perforated stamp mask instead of a die-cut. */
  kind: "sticker" | "photo";
  interest: string;
};

/**
 * Ten things I like. Placeholder art from scripts/build-sticker-placeholders.mjs
 * until the illustrated set replaces the SVGs; swapping is a data change.
 */
export const stickers: Sticker[] = [
  { id: "torch", src: "/images/stickers/torch.svg", alt: "A torch", w: 256, h: 256, kind: "sticker", interest: "Tøp Løre" },
  { id: "marcus", src: "/images/stickers/marcus.svg", alt: "Marcus Aurelius bust with a laurel", w: 256, h: 256, kind: "sticker", interest: "Stoicism" },
  { id: "almanac", src: "/images/stickers/almanac.svg", alt: "An almanac with plum blossom", w: 256, h: 256, kind: "sticker", interest: "Koyomi" },
  { id: "barometer", src: "/images/stickers/barometer.svg", alt: "A brass barometer with a cloud", w: 256, h: 256, kind: "sticker", interest: "Atmos" },
  { id: "linocut", src: "/images/stickers/linocut.svg", alt: "A linocut roller and pressed sheet", w: 256, h: 256, kind: "sticker", interest: "Print craft" },
  { id: "piggy", src: "/images/stickers/piggy.svg", alt: "A piggy bank with a coin mid-air", w: 256, h: 256, kind: "sticker", interest: "Pulse" },
  { id: "hourglass", src: "/images/stickers/hourglass.svg", alt: "An hourglass beside a candle", w: 256, h: 256, kind: "sticker", interest: "Memento Mori" },
  { id: "roll", src: "/images/stickers/roll.svg", alt: "A printing roll unspooling paper", w: 256, h: 256, kind: "sticker", interest: "Rolling Paper" },
  { id: "chai", src: "/images/stickers/chai.svg", alt: "Chai in a steel glass", w: 256, h: 256, kind: "sticker", interest: "Chai" },
  { id: "cursor", src: "/images/stickers/cursor.svg", alt: "A terminal cursor in a speech bubble", w: 256, h: 256, kind: "sticker", interest: "Designing in code" },
];
