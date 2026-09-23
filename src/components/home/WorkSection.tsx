"use client";

import { useCallback, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import { Sheet } from "@/components/sheet/Sheet";
import { useWorkSheetRoute } from "@/components/work/useWorkSheetRoute";
import { WorkTabsPanel } from "@/components/work/WorkTabsPanel";
import type { WorkTab } from "@/components/work/WorkTabs";
import { caseStudies } from "@/content/case-studies";
import { workCopy } from "@/content/about";

import "@/components/work/work.css";

export function WorkSection() {
  const [tab, setTab] = useState<WorkTab>("case-studies");
  const { openSlug, open, close } = useWorkSheetRoute();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const onOpen = useCallback(
    (slug: string, event: MouseEvent<HTMLAnchorElement>) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      open(slug);
    },
    [open],
  );

  const study = openSlug ? caseStudies.find((s) => s.slug === openSlug) ?? null : null;
  const sheetOpen = study !== null;

  return (
    <section className="home-section home-work" id="work" aria-labelledby="work-heading">
      <h2 id="work-heading" ref={headingRef} tabIndex={-1} className="home-section-heading home-work-heading">
        {workCopy.label}
      </h2>
      <WorkTabsPanel tab={tab} onTabChange={setTab} scope="home" onOpen={onOpen} behind={sheetOpen} />

      <Sheet
        open={sheetOpen}
        onClose={close}
        title={study?.homeBrand ?? ""}
        subtitle={study?.summary}
        fallbackFocus={() => headingRef.current}
      >
        {study ? <CaseStudyBody study={study} variant="sheet" /> : null}
      </Sheet>
    </section>
  );
}
