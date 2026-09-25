"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useId, useState } from "react";

import { cue } from "@/components/audio/cues";
import { whoIAm } from "@/content/home";
import { RichText } from "./RichText";

/** A short introduction; the longer one opens in place under Learn more. */
export function WhoIAm() {
  const [open, setOpen] = useState(false);
  const moreId = useId();

  return (
    <section className="hm-section hm-prose" aria-labelledby="hm-who-title">
      <h2 id="hm-who-title" className="hm-label">
        Who I am
      </h2>
      <p>
        <RichText paragraph={whoIAm.lead} />
      </p>

      {/* Collapsed text stays in the DOM for search, and inert keeps it out of the tab order. */}
      <div id={moreId} className="hm-more" data-open={open} inert={!open}>
        <div className="hm-more-inner">
          {whoIAm.more.map((paragraph, i) => (
            <p key={i}>
              <RichText paragraph={paragraph} />
            </p>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="hm-toggle"
        data-click-sound="off"
        aria-expanded={open}
        aria-controls={moreId}
        onClick={() => {
          cue("toggle");
          setOpen((value) => !value);
        }}
      >
        {open ? "Show less" : "Learn more"}
        <CaretDown size={12} weight="bold" aria-hidden="true" />
      </button>
    </section>
  );
}
