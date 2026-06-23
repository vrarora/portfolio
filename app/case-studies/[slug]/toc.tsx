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

    const revealNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-case-reveal]"),
    );

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!(entry.target instanceof HTMLElement)) return;
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 },
    );

    revealNodes.forEach((node) => revealObserver.observe(node));

    const handleScroll = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-case-section-id]"),
      );
      if (!sections.length) return;

      const threshold = window.innerHeight * 0.35;
      let current = sections[0];

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= threshold) {
          current = section;
        }
      }

      const id = current.dataset.caseSectionId ?? items[0]?.id ?? "";
      setActiveId(id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
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
