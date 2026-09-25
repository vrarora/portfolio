import Link from "next/link";

import type { RichParagraph } from "@/content/home";
import { InkMark } from "../InkMark";
import { Term } from "./Term";

/** State for a phrase that opens a panel below its paragraph. */
export type Reveal = { open: boolean; controls: string; onToggle: () => void };

/** One paragraph of home copy, with its linked phrases, explained terms, highlights and panel triggers. */
export function RichText({ paragraph, reveal }: { paragraph: RichParagraph; reveal?: Reveal }) {
  return paragraph.map((token, i) => {
    if (typeof token === "string") return token;

    if ("term" in token) return <Term key={i} term={token.term} tip={token.tip} />;

    if ("mark" in token && typeof token.mark === "string") {
      return (
        <InkMark key={i} kind="highlight" seed={i + 11}>
          {token.mark}
        </InkMark>
      );
    }

    const content = token.mark ? (
      <InkMark kind="highlight" seed={i + 11}>
        {token.text}
      </InkMark>
    ) : token.text;

    if ("reveal" in token) {
      if (!reveal) return content;
      return (
        <button
          key={i}
          type="button"
          className="hm-reveal"
          aria-expanded={reveal.open}
          aria-controls={reveal.controls}
          onClick={reveal.onToggle}
        >
          {content}
        </button>
      );
    }

    const href = token.link;

    if (href.startsWith("http")) {
      return (
        <a key={i} className="hm-link" href={href} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }

    return (
      <Link key={i} className="hm-link" href={href}>
        {content}
      </Link>
    );
  });
}
