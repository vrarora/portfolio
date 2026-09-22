"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

import { useScrollRoot } from "./ScrollRootContext";

export type TocItem = { id: string; label: string };

export function CaseStudyToc({ items }: { items: TocItem[] }) {
  const root = useScrollRoot();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const rootEl = root?.current ?? null;
    const scroller: HTMLElement | Window = rootEl ?? window;
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rootTop = rootEl ? rootEl.getBoundingClientRect().top : 0;
      const viewportH = rootEl ? rootEl.clientHeight : window.innerHeight;
      const threshold = rootTop + viewportH * 0.35;
      let current = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= threshold) current = target;
      }
      setActive((prev) => (prev === current.id ? prev : current.id));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items, root]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    target.focus({ preventScroll: true });
    if (!root?.current) window.history.replaceState(window.history.state, "", `#${id}`);
  };

  return (
    <nav className="cs-toc" aria-label="On this page">
      <p className="cs-toc-label t-micro">On this page</p>
      <ol className="cs-toc-list">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={item.id === active ? "is-active" : undefined}
              aria-current={item.id === active ? "location" : undefined}
              onClick={(event) => onClick(event, item.id)}
            >
              <span className="cs-toc-num t-num">{String(index + 1).padStart(2, "0")}</span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
