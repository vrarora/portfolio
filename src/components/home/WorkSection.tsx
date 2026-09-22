"use client";

import { useState } from "react";

import { WorkTabsPanel } from "@/components/work/WorkTabsPanel";
import type { WorkTab } from "@/components/work/WorkTabs";
import { workCopy } from "@/content/about";

import "@/components/work/work.css";

export function WorkSection() {
  const [tab, setTab] = useState<WorkTab>("case-studies");
  return (
    <section className="home-section home-work home-bleed" id="work" aria-labelledby="work-heading">
      <h2 id="work-heading" className="home-section-heading home-work-heading">
        {workCopy.label}
      </h2>
      <WorkTabsPanel tab={tab} onTabChange={setTab} scope="home" />
    </section>
  );
}
