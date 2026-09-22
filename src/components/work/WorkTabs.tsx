"use client";

import { motion } from "motion/react";
import { useId } from "react";
import type { KeyboardEvent } from "react";

export type WorkTab = "case-studies" | "experiments";

export const WORK_TABS: Array<{ id: WorkTab; label: string }> = [
  { id: "case-studies", label: "Case studies" },
  { id: "experiments", label: "Experiments" },
];

type Props = {
  value: WorkTab;
  onChange: (tab: WorkTab) => void;
  /** Distinguishes several tablists on one page (home and /work). */
  scope: string;
};

export function tabId(scope: string, tab: WorkTab) {
  return `${scope}-tab-${tab}`;
}

export function panelId(scope: string, tab: WorkTab) {
  return `${scope}-panel-${tab}`;
}

export function WorkTabs({ value, onChange, scope }: Props) {
  const layoutId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = WORK_TABS.findIndex((t) => t.id === value);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % WORK_TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + WORK_TABS.length) % WORK_TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = WORK_TABS.length - 1;
    else return;
    event.preventDefault();
    const tab = WORK_TABS[next].id;
    onChange(tab);
    document.getElementById(tabId(scope, tab))?.focus();
  };

  return (
    <div className="work-tabs" role="tablist" aria-label="Work" onKeyDown={onKeyDown}>
      {WORK_TABS.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            id={tabId(scope, tab.id)}
            type="button"
            role="tab"
            className="work-tab"
            aria-selected={selected}
            aria-controls={panelId(scope, tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {selected ? (
              <motion.span
                className="work-tab-underline"
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
