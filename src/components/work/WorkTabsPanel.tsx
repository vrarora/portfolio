"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MouseEvent } from "react";

import { workCopy } from "@/content/about";
import { CaseStudyGrid } from "./CaseStudyGrid";
import { ExperimentsList } from "./ExperimentsList";
import { WorkTabs, panelId, tabId } from "./WorkTabs";
import type { WorkTab } from "./WorkTabs";

type Props = {
  tab: WorkTab;
  onTabChange: (tab: WorkTab) => void;
  scope: string;
  onOpen?: (slug: string, event: MouseEvent<HTMLAnchorElement>) => void;
  behind?: boolean;
};

export function WorkTabsPanel({ tab, onTabChange, scope, onOpen, behind }: Props) {
  return (
    <div className={`work-panel-wrap work-behind${behind ? " is-behind" : ""}`}>
      <div className="work-tabs-row">
        <WorkTabs value={tab} onChange={onTabChange} scope={scope} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          id={panelId(scope, tab)}
          role="tabpanel"
          aria-labelledby={tabId(scope, tab)}
          className="work-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          <p className="work-panel-intro">
            {tab === "case-studies" ? workCopy.caseStudiesIntro : workCopy.experimentsIntro}
          </p>
          {tab === "case-studies" ? <CaseStudyGrid onOpen={onOpen} id={`${scope}-grid`} /> : <ExperimentsList />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
