"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

import { CaseStudyBody } from "@/components/case-study/CaseStudyBody";
import { Sheet } from "@/components/sheet/Sheet";
import { caseStudies } from "@/content/case-studies";
import { useWorkSheetRoute } from "./useWorkSheetRoute";
import { WorkTabsPanel } from "./WorkTabsPanel";
import type { WorkTab } from "./WorkTabs";

import "./work.css";

function readTab(value: string | null): WorkTab {
  return value === "experiments" ? "experiments" : "case-studies";
}

export function WorkPage() {
  const params = useSearchParams();
  const [tab, setTab] = useState<WorkTab>(() => readTab(params.get("tab")));
  const { openSlug, open, close } = useWorkSheetRoute();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setTab(readTab(params.get("tab")));
  }, [params]);

  const onTabChange = useCallback((next: WorkTab) => {
    setTab(next);
    const url = next === "experiments" ? "/work/?tab=experiments" : "/work/";
    window.history.replaceState(window.history.state, "", url);
  }, []);

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
    <section className="work-page container">
      <header className="work-page-head">
        <h1 ref={headingRef} tabIndex={-1}>
          Work
        </h1>
      </header>

      <WorkTabsPanel tab={tab} onTabChange={onTabChange} scope="work" onOpen={onOpen} behind={sheetOpen} />

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
