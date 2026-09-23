"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";

import { LOGOS, narrative, type NarrativeToken } from "@/content/home";

/** Faint until read: each word darkens as it rises past this fraction of the viewport. */
const READ_LINE = 0.72;
/** How far a word travels, as a fraction of the viewport, while it darkens. */
const READ_BAND = 0.16;
const FAINT = 0.28;

function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="hm-word" data-word>
        {word}
      </span>
    </Fragment>
  ));
}

function Token({ token }: { token: NarrativeToken }) {
  if (typeof token === "string") return <Words text={token} />;
  if ("logos" in token) {
    return (
      <>
        {" "}
        {/* Decorative: the company names follow in the text. */}
        <span className="hm-logos" data-word aria-hidden="true">
          {token.logos.map((id) => (
            <Image key={id} src={LOGOS[id].src} alt="" width={48} height={48} />
          ))}
        </span>{" "}
      </>
    );
  }
  return (
    <>
      {" "}
      <Link className="hm-link" href={token.link}>
        <Words text={token.text} />
      </Link>
    </>
  );
}

export function Narrative() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    let tops: number[] = [];
    let last: number[] = [];
    let frame = 0;

    // Positions are measured once per layout, so scrolling only does arithmetic.
    const measure = () => {
      tops = words.map((w) => w.getBoundingClientRect().top + window.scrollY);
      last = words.map(() => -1);
      paint();
    };

    const paint = () => {
      frame = 0;
      const vh = window.innerHeight;
      const line = window.scrollY + vh * READ_LINE;
      words.forEach((word, i) => {
        const t = Math.min(1, Math.max(0, (line - tops[i]) / (vh * READ_BAND)));
        const a = Math.round((FAINT + (1 - FAINT) * t) * 50) / 50;
        if (a === last[i]) return;
        last[i] = a;
        word.style.setProperty("--read", String(a));
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    root.classList.add("is-live");
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hm-narrative hm-col" aria-label="About">
      <div ref={ref}>
        {narrative.map((paragraph, i) => (
          <p key={i}>
            {paragraph.map((token, j) => (
              <Token key={j} token={token} />
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}
