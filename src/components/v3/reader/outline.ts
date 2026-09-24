import type { CaseStudy, CaseStudyMedia } from "@/content/case-studies";

type Section = CaseStudy["sections"][number];

type FigureSource = Pick<Section, "visual" | "visualType" | "media" | "mediaSlot" | "label">;

export type OutlineFigure = { id: string; n: number; type?: string; media?: CaseStudyMedia; caption?: string; label?: string };

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

/** The tree lists a figure by the words before its colon; a figure without a caption stays out of it. */
const shortLabel = (caption: string | undefined) => caption?.split(":")[0].trim() || undefined;

export function outline(study: CaseStudy): OutlineSection[] {
  let n = 0;
  const figure = (source: FigureSource): OutlineFigure | undefined => {
    if (!source.visualType && !source.media && !source.mediaSlot) return undefined;
    n += 1;
    return {
      id: `fig-${n}`,
      n,
      type: source.visualType,
      media: source.media,
      caption: source.visual,
      label: source.label ?? shortLabel(source.visual),
    };
  };
  return study.sections.map((section) => {
    const lead = figure(section);
    const itemFigures = (section.items ?? []).map((item) => figure(item));
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
