import type { ReactNode } from "react";

/** Footnote marker whose note mirrors into the margin at >=1200px. */
export function Fn({ n, children }: { n: number; children: ReactNode }) {
  const id = `fn-${n}`;
  return (
    <span className="cs-fn">
      <sup className="cs-fn-mark">
        <a href={`#${id}`} aria-describedby={id}>
          {n}
        </a>
      </sup>
      <span id={id} role="note" className="cs-fn-note t-caption">
        <span className="cs-fn-num">{n}</span> {children}
      </span>
    </span>
  );
}
