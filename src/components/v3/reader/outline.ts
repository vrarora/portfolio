import type { CaseStudy } from "@/content/case-studies";

type Section = CaseStudy["sections"][number];

export type OutlineFigure = { id: string; n: number; type: string; caption?: string; label: string };

export type OutlineSection = {
  id: string;
  kicker: string;
  title: string;
  section: Section;
  /** The figure after the section's opening prose. */
  lead?: OutlineFigure;
  /** One entry per item, in order; undefined where an item has no visual. */
  itemFigures: (OutlineFigure | undefined)[];
  /** Every figure in the section, numbered through the whole study. */
  figures: OutlineFigure[];
};

export const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** The tree shows a figure by the words before its colon. */
const shortLabel = (caption: string | undefined, n: number) => caption?.split(":")[0].trim() || `Figure ${n}`;

export function outline(study: CaseStudy): OutlineSection[] {
  let n = 0;
  const figure = (type: string | undefined, caption: string | undefined): OutlineFigure | undefined => {
    if (!type) return undefined;
    n += 1;
    return { id: `fig-${n}`, n, type, caption, label: shortLabel(caption, n) };
  };
  return study.sections.map((section) => {
    const lead = figure(section.visualType, section.visual);
    const itemFigures = (section.items ?? []).map((item) => figure(item.visualType, item.visual));
    return {
      id: slug(section.title),
      kicker: section.kicker,
      title: section.title,
      section,
      lead,
      itemFigures,
      figures: [lead, ...itemFigures].filter((f): f is OutlineFigure => f !== undefined),
    };
  });
}

/** Rough reading time at 230 words a minute. */
export function readingMinutes(study: CaseStudy) {
  const text = study.sections
    .flatMap((s) => [s.body, ...(s.bullets ?? []), ...(s.items ?? []).flatMap((i) => [i.body ?? "", ...(i.bullets ?? [])])])
    .join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 230));
}
