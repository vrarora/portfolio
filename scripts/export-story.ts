/**
 * Writes a Markdown snapshot of a case study's live copy.
 * Usage: npx tsx scripts/export-story.ts <slug> <out.md>
 */
import { writeFileSync } from "node:fs";

import { caseStudies } from "../src/content/case-studies";
import { outline, type OutlineFigure } from "../src/components/v3/reader/outline";

const [slugArg, outPath] = process.argv.slice(2);
const study = caseStudies.find((s) => s.slug === slugArg);
if (!study || !outPath) {
  console.error("Usage: npx tsx scripts/export-story.ts <slug> <out.md>");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const out: string[] = [];
const para = (text?: string) => {
  if (text) text.split("\n\n").forEach((p) => out.push(p, ""));
};
const list = (bullets?: string[]) => {
  if (!bullets?.length) return;
  bullets.forEach((b) => out.push(`- ${b}`));
  out.push("");
};
const fig = (f?: OutlineFigure) => {
  if (!f) return;
  const n = `Fig ${String(f.n).padStart(2, "0")}`;
  const rail = f.label ? ` · rail "${f.label}"` : "";
  const what = f.media ? `video ${f.media.src}` : f.type ? `visual \`${f.type}\`` : "EMPTY SLOT";
  out.push(`> ${n}${rail} · ${what}`);
  if (f.caption) out.push(`> Caption: ${f.caption}`);
  out.push("");
};

out.push(
  "<!--",
  `Snapshot of the live copy, exported ${today} from src/content/case-studies.ts.`,
  "The .ts entry is the source of truth; edit copy there, then re-export this file with",
  `npx tsx scripts/export-story.ts ${study.slug} "<this file>".`,
  "Figures are numbered as the page numbers them. EMPTY SLOT means an empty",
  "figure is on the page and waits for a Cap recording.",
  "-->",
  "",
  `# ${study.title}`,
  "",
  study.summary,
  "",
);
if (study.coverImage) out.push(`Cover: ${study.coverImage.src}${study.ogImage ? ` · Link preview: ${study.ogImage}` : ""}`, "");

outline(study).forEach((s, i) => {
  const { section } = s;
  out.push("---", "", `## ${i + 1}. ${s.title}`, "", `Kicker: ${s.kicker}`, "");
  para(section.body);
  list(section.bullets);
  fig(s.lead);
  section.metrics?.forEach((m) => out.push(`- Metric: **${m.end}** · ${m.desc}`));
  if (section.metrics?.length) out.push("");
  (section.items ?? []).forEach((item, j) => {
    para(item.body);
    list(item.bullets);
    fig(s.itemFigures[j]);
  });
});

writeFileSync(outPath, out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
console.log(`Wrote ${outPath}`);
