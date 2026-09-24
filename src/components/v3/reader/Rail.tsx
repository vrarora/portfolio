"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";

export type RailItem = { id: string; label: string; subs: { id: string; label: string }[] };

type Props = {
  title: string;
  items: RailItem[];
  /** The element whose scroll the progress bar measures. */
  docId: string;
};

/** How far down the viewport a heading must rise before its section counts as current. */
const LINE = 0.3;

/**
 * The reading rail: a tree of sections whose figures unfold under the one
 * being read, and a dithered bar that fills as the page is read.
 */
export function Rail({ title, items, docId }: Props) {
  const [active, setActive] = useState({ item: items[0]?.id ?? "", sub: "" });
  const fillRefs = useRef<HTMLSpanElement[]>([]);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const doc = document.getElementById(docId);
    if (!doc) return;
    type Mark = { id: string; top: number; subs: { id: string; top: number }[] };
    let marks: Mark[] = [];
    let docTop = 0;
    let docHeight = 0;
    let frame = 0;
    let lastPct = -1;

    const top = (id: string) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY;

    // Visuals load lazily and grow the page, so positions are re-read whenever the document resizes.
    const measure = () => {
      const rect = doc.getBoundingClientRect();
      docTop = rect.top + window.scrollY;
      docHeight = rect.height;
      marks = items.map((item) => ({ id: item.id, top: top(item.id), subs: item.subs.map((s) => ({ id: s.id, top: top(s.id) })) }));
      update();
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const line = window.scrollY + vh * LINE;
      let current = marks[0];
      for (const mark of marks) if (mark.top <= line) current = mark;
      let sub = "";
      for (const s of current?.subs ?? []) if (s.top <= line + vh * 0.2) sub = s.id;
      setActive((prev) => (prev.item === current?.id && prev.sub === sub ? prev : { item: current?.id ?? "", sub }));

      const span = Math.max(1, docHeight - vh);
      const pct = Math.round(Math.min(1, Math.max(0, (window.scrollY - docTop) / span)) * 100);
      if (pct === lastPct) return;
      lastPct = pct;
      fillRefs.current.forEach((el) => el && (el.style.width = `${pct}%`));
      if (pctRef.current) pctRef.current.textContent = `${String(pct).padStart(2, "0")}%`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(doc);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [docId, items]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
    window.history.replaceState(window.history.state, "", `#${id}`);
  };

  const meter = (i: number) => (
    <span className="rd-meter" aria-hidden="true">
      <span
        ref={(el) => {
          if (el) fillRefs.current[i] = el;
        }}
      />
    </span>
  );

  return (
    <>
      {/* Narrow screens: a slim bar in place of the rail. */}
      <div className="rd-bar">
        <Link className="rd-back" href="/#work">
          <ArrowLeft size={14} aria-hidden="true" /> Projects
        </Link>
        <span className="rd-bar-title">{title}</span>
        {meter(0)}
      </div>

      <aside className="rd-rail" aria-label="Case study">
        <div className="rd-rail-in">
          <Link className="rd-back" href="/#work">
            <ArrowLeft size={14} aria-hidden="true" /> All projects
          </Link>
          <p className="rd-rail-title">{title}</p>

          <p className="rd-th">Contents</p>
          <nav aria-label="On this page">
            <ol className="rd-tree">
              {items.map((item) => {
                const open = item.id === active.item;
                return (
                  <li key={item.id} className={open ? "is-open" : undefined}>
                    <a href={`#${item.id}`} aria-current={open ? "location" : undefined} onClick={(e) => jump(e, item.id)}>
                      <span className="rd-br" aria-hidden="true">└</span>
                      {item.label}
                    </a>
                    {item.subs.length > 0 ? (
                      <div className="rd-subs">
                        <ol>
                          {item.subs.map((sub) => (
                            <li key={sub.id}>
                              <a
                                href={`#${sub.id}`}
                                className={sub.id === active.sub ? "is-on" : undefined}
                                tabIndex={open ? undefined : -1}
                                onClick={(e) => jump(e, sub.id)}
                              >
                                <span className="rd-br" aria-hidden="true">└</span>
                                {sub.label}
                              </a>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="rd-progress">
            {meter(1)}
            <span ref={pctRef} className="rd-pct">
              00%
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
