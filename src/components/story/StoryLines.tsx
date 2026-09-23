import { Fragment, type Ref } from "react";
import type { StoryLine } from "./engine/timeline";

type Props = { lines: readonly StoryLine[]; ref?: Ref<HTMLDivElement> };

/**
 * Every stanza is real text in the DOM, so it can be read, selected
 * and heard by a screen reader. The canvas behind it is decoration only.
 */
export function StoryLines({ lines, ref }: Props) {
  return (
    <div ref={ref} className="story-lines">
      {lines.map((line) => (
        <p key={line.id} className="story-line">
          {line.text.split("\n").map((row, r) => (
            <span key={r} className="story-row" aria-hidden="true">
              {row.split(" ").map((word, w) => (
                <Fragment key={w}>
                  {w > 0 && " "}
                  <span className="story-word">
                    {Array.from(word).map((ch, c) => (
                      <span key={c} className="story-char">
                        {ch}
                      </span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
          ))}
          <span className="story-sr">{line.text.replace(/\n/g, " ")}</span>
        </p>
      ))}
    </div>
  );
}
