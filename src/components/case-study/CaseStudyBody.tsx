"use client";

import { useMemo, useRef } from "react";

import type { CaseStudy } from "@/content/case-studies";
import { CaseStudyHero } from "./CaseStudyHero";
import { CaseStudySection, toSectionId } from "./CaseStudySection";
import { CaseStudyToc } from "./CaseStudyToc";
import { useScrollRoot } from "./ScrollRootContext";
import { useReveal } from "./useReveal";

import "./case-study.css";

export type CaseStudyBodyProps = {
  study: CaseStudy;
  variant: "sheet" | "page";
};

/** The case study itself, shared by the reading page and the bottom sheet. */
export function CaseStudyBody({ study, variant }: CaseStudyBodyProps) {
  const ref = useRef<HTMLElement>(null);
  const root = useScrollRoot();
  useReveal(ref, root);

  const toc = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      ...study.sections.map((section) => ({ id: toSectionId(section.title), label: section.title })),
    ],
    [study],
  );

  return (
    <article ref={ref} className={`cs cs--${variant} cs--${study.slug}`}>
      <div className="cs-grid">
        <aside className="cs-rail">
          <CaseStudyToc items={toc} />
        </aside>
        <div className="cs-column">
          <CaseStudyHero study={study} headingLevel={variant === "sheet" ? "h2" : "h1"} />
          {study.sections.map((section, index) => (
            <CaseStudySection key={section.title} section={section} index={index} />
          ))}
        </div>
      </div>
    </article>
  );
}
