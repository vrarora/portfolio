import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  caption?: string;
  /** Extend to the 760px bleed width instead of the reading column. */
  bleed?: boolean;
  /** Reserve this aspect ratio while a lazy visual loads. */
  aspect?: string;
  className?: string;
};

export function Figure({ children, caption, bleed, aspect, className }: Props) {
  return (
    <figure
      className={["cs-figure", bleed ? "cs-figure--bleed" : "", className].filter(Boolean).join(" ")}
      data-cs-reveal
    >
      <div className="cs-figure-frame" style={aspect ? { aspectRatio: aspect } : undefined}>
        {children}
      </div>
      {caption ? <figcaption className="cs-caption t-caption">{caption}</figcaption> : null}
    </figure>
  );
}
