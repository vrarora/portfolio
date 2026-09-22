// Placeholder die-cut stickers until the illustrated set exists.
// Run: node scripts/build-sticker-placeholders.mjs
import { mkdir, writeFile } from "node:fs/promises";

const OUT = "public/images/stickers";
const CREAM = "#f3efe6";
const INK = "#111111";
const MOSS = "#5b7f5e";
const SKY = "#7fa6d6";
const OCHRE = "#d8a855";
const BRICK = "#c67e6c";

const glyphs = {
  torch: `<rect x="118" y="130" width="20" height="90" rx="6" fill="${INK}"/><path d="M128 40c-26 30-40 52-40 74a40 40 0 0 0 80 0c0-22-14-44-40-74z" fill="${OCHRE}"/><path d="M128 70c-12 16-18 28-18 40a18 18 0 0 0 36 0c0-12-6-24-18-40z" fill="${BRICK}"/>`,
  marcus: `<path d="M64 216c8-40 30-56 64-56s56 16 64 56z" fill="${INK}"/><circle cx="128" cy="104" r="46" fill="${CREAM}" stroke="${INK}" stroke-width="6"/><path d="M84 96c-6-24 8-46 44-46s50 22 44 46" fill="none" stroke="${MOSS}" stroke-width="10" stroke-linecap="round"/>`,
  almanac: `<path d="M56 72h64l12 12 12-12h64v112H132l-4 8-4-8H56z" fill="${CREAM}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><line x1="128" y1="84" x2="128" y2="184" stroke="${INK}" stroke-width="4"/><g fill="${BRICK}"><circle cx="176" cy="110" r="9"/><circle cx="192" cy="122" r="9"/><circle cx="176" cy="136" r="9"/><circle cx="160" cy="122" r="9"/><circle cx="176" cy="122" r="6" fill="${OCHRE}"/></g>`,
  barometer: `<circle cx="128" cy="132" r="72" fill="${CREAM}" stroke="${OCHRE}" stroke-width="10"/><circle cx="128" cy="132" r="56" fill="none" stroke="${INK}" stroke-width="4"/><line x1="128" y1="132" x2="164" y2="96" stroke="${BRICK}" stroke-width="6" stroke-linecap="round"/><circle cx="128" cy="132" r="6" fill="${INK}"/><path d="M62 70a18 18 0 0 1 30-14 22 22 0 0 1 40 8h-70z" fill="${SKY}"/>`,
  linocut: `<rect x="60" y="150" width="140" height="60" rx="6" fill="${CREAM}" stroke="${INK}" stroke-width="6"/><rect x="84" y="86" width="90" height="44" rx="22" fill="${MOSS}" stroke="${INK}" stroke-width="6"/><rect x="170" y="60" width="16" height="70" rx="6" fill="${INK}"/><path d="M84 170h60M84 190h40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
  piggy: `<ellipse cx="128" cy="140" rx="72" ry="52" fill="${BRICK}" stroke="${INK}" stroke-width="6"/><rect x="88" y="184" width="18" height="26" rx="6" fill="${INK}"/><rect x="150" y="184" width="18" height="26" rx="6" fill="${INK}"/><circle cx="196" cy="132" r="14" fill="${CREAM}" stroke="${INK}" stroke-width="6"/><rect x="112" y="92" width="34" height="8" rx="4" fill="${INK}"/><circle cx="128" cy="52" r="18" fill="${OCHRE}" stroke="${INK}" stroke-width="6"/>`,
  hourglass: `<path d="M84 56h88v18l-32 50 32 50v18H84v-18l32-50-32-50z" fill="${CREAM}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M104 74h48l-24 38z" fill="${OCHRE}"/><path d="M110 182h36l-18-30z" fill="${OCHRE}"/><rect x="186" y="120" width="22" height="72" rx="4" fill="${CREAM}" stroke="${INK}" stroke-width="6"/><path d="M197 84c-10 12-12 22 0 30 12-8 10-18 0-30z" fill="${BRICK}"/>`,
  roll: `<rect x="56" y="90" width="60" height="80" rx="30" fill="${MOSS}" stroke="${INK}" stroke-width="6"/><path d="M100 96c40 0 60 30 100 30v78H120c-20 0-40-10-40-30" fill="${CREAM}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M132 150h48M132 170h48" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  chai: `<path d="M84 96h88l-10 112H94z" fill="${CREAM}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M92 124h72l-6 66h-60z" fill="${OCHRE}"/><path d="M108 78c-8-12 8-18 0-30M128 76c-8-12 8-18 0-30M148 78c-8-12 8-18 0-30" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
  cursor: `<path d="M52 72a20 20 0 0 1 20-20h112a20 20 0 0 1 20 20v88a20 20 0 0 1-20 20H120l-36 32v-32H72a20 20 0 0 1-20-20z" fill="${SKY}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M84 96l24 20-24 20" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><rect x="122" y="128" width="40" height="8" rx="4" fill="${INK}"/>`,
};

function blob(seed) {
  // Slightly irregular rounded shape so each sticker's die-cut differs.
  const r = 104;
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const wobble = 1 + 0.06 * Math.sin(seed * 3 + i * 2.1);
    pts.push([128 + Math.cos(a) * r * wobble, 128 + Math.sin(a) * r * wobble]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < 8; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % 8];
    const mx = (p1[0] + p2[0]) / 2;
    const my = (p1[1] + p2[1]) / 2;
    const cx = 128 + (mx - 128) * 1.1;
    const cy = 128 + (my - 128) * 1.1;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

await mkdir(OUT, { recursive: true });
let i = 0;
for (const [name, glyph] of Object.entries(glyphs)) {
  const path = blob(i++);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
<path d="${path}" fill="#ffffff"/>
<path d="${path}" fill="${CREAM}" stroke="${INK}" stroke-width="3" transform="translate(128 128) scale(0.93) translate(-128 -128)"/>
<g transform="translate(128 128) scale(0.78) translate(-128 -128)">${glyph}</g>
</svg>
`;
  await writeFile(`${OUT}/${name}.svg`, svg);
}
console.log(`wrote ${i} placeholder stickers`);
