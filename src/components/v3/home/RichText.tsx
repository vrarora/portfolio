import Link from "next/link";

import type { RichParagraph } from "@/content/home";
import { InkMark } from "../InkMark";
import { Term } from "./Term";

/** One paragraph of home copy, with its linked phrases, explained terms and highlights. */
export function RichText({ paragraph }: { paragraph: RichParagraph }) {
  return paragraph.map((token, i) => {
    if (typeof token === "string") return token;

    if ("term" in token) return <Term key={i} term={token.term} tip={token.tip} />;

    if ("mark" in token) {
      return (
        <InkMark key={i} kind="highlight" seed={i + 11}>
          {token.mark}
        </InkMark>
      );
    }

    if (token.link.startsWith("http")) {
      return (
        <a key={i} className="hm-link" href={token.link} target="_blank" rel="noreferrer">
          {token.text}
        </a>
      );
    }

    return (
      <Link key={i} className="hm-link" href={token.link}>
        {token.text}
      </Link>
    );
  });
}
