import { caseStudies } from "./case-studies";

/** One object on the mobile "All work" table. */
export type WorkTableItem = {
  id: string;
  label: string;
  href: string;
  image: { src: string; width: number; height: number };
};

const STUDY_IMAGES: Record<string, WorkTableItem["image"]> = {
  "data-atlas": { src: "/images/work-table/data-compass.webp", width: 720, height: 416 },
  "design-repo": { src: "/images/work-table/design-repo.webp", width: 720, height: 550 },
  equalall: { src: "/images/work-table/equalall.webp", width: 720, height: 560 },
};

/** Table order matters: each index has a fixed spot and tilt in work-table.css. */
export const workTable: readonly WorkTableItem[] = [
  ...caseStudies.flatMap((study) => {
    const image = STUDY_IMAGES[study.slug];
    return image ? [{ id: study.slug, label: study.homeBrand, href: `/work/${study.slug}/`, image }] : [];
  }),
  { id: "story", label: "My Story", href: "/story/", image: { src: "/images/work-table/story.webp", width: 360, height: 684 } },
  { id: "playground", label: "Playground", href: "/playground/", image: { src: "/images/work-table/playground.webp", width: 360, height: 684 } },
  { id: "about", label: "About me", href: "/", image: { src: "/images/work-table/about.webp", width: 400, height: 400 } },
];
