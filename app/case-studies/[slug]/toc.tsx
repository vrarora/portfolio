"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  label: string;
};

type CaseStudyNavProps = {
  items: TocItem[];
};

export function CaseStudyNav({ items }: CaseStudyNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    document.documentElement.classList.add("case-motion-ready");

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-case-section-id]"),
    );
    const revealNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-case-reveal]"),
    );

    if (!sections.length) {
      return;
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target instanceof HTMLElement) {
          setActiveId(visibleEntries[0].target.dataset.caseSectionId ?? items[0]?.id ?? "");
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLElement)) {
            return;
          }

          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.18,
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));
    revealNodes.forEach((node) => revealObserver.observe(node));

    return () => {
      sectionObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [items]);

  return (
    <aside className="case-study-rail">
      <div className="case-study-rail-inner">
        <p className="case-rail-label">On this page</p>
        <nav aria-label="Case study table of contents">
          <ol className="case-toc-list">
            {items.map((item, index) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className={item.id === activeId ? "is-active" : undefined}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
