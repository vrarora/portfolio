"use client";

import { useId, useState } from "react";

import { cue } from "@/components/audio/cues";
import { whoIAm } from "@/content/home";
import { RichText } from "./RichText";

/**
 * A short introduction. The longer one peeks out under a fade and opens in place
 * from a round arrow, after paulfaivret.com/about. The same arrow folds it away.
 */
export function WhoIAm() {
  const [open, setOpen] = useState(false);
  const moreId = useId();

  const toggle = () => {
    cue("toggle");
    setOpen((value) => !value);
  };

  return (
    <section className="hm-section hm-prose" aria-labelledby="hm-who-title">
      <h2 id="hm-who-title" className="hm-label">
        Who I am
      </h2>
      <p data-scroll-blur>
        <RichText paragraph={whoIAm.lead} />
      </p>

      <div className="hm-read" data-open={open}>
        {/* Collapsed text stays in the DOM for search, and inert keeps it out of the tab order. */}
        <div id={moreId} className="hm-read-body" inert={!open}>
          {whoIAm.more.map((paragraph, i) => (
            <p key={i} data-scroll-blur>
              <RichText paragraph={paragraph} />
            </p>
          ))}
        </div>

        <div className="hm-read-fade">
          <button
            type="button"
            className="hm-read-more"
            data-scroll-blur
            data-click-sound="off"
            aria-label={open ? "Show less" : "Read more"}
            aria-expanded={open}
            aria-controls={moreId}
            onClick={toggle}
          >
            <span className="hm-read-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6v8m0 0-4-4m4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
