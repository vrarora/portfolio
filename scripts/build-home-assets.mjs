// Builds the home avatar crop and the inline company logo marks.
// Run: node scripts/build-home-assets.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "public/images";

async function avatar() {
  // me.webp is 480x720; the face sits around (230, 290).
  for (const px of [64, 96]) {
    await sharp(`${OUT}/me.webp`)
      .extract({ left: 100, top: 160, width: 260, height: 260 })
      .resize(px, px, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(`${OUT}/me-${px}.webp`);
  }
}

async function logo(name, ext, height) {
  const input = `${OUT}/logos/${name}.${ext}`;
  const img = sharp(input).ensureAlpha().trim();
  // Grayscale on the colour channels only, keep alpha.
  await img
    .resize({ height, withoutEnlargement: false })
    .grayscale()
    .webp({ quality: 90, alphaQuality: 90 })
    .toFile(`${OUT}/logos/${name}-mark.webp`);
}

await mkdir(`${OUT}/logos`, { recursive: true });
await avatar();
await logo("idfy", "png", 36);
await logo("ketto", "png", 36);
await logo("wysa", "webp", 36);
console.log("home assets built");
