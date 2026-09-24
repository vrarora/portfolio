"use client";

import { useId } from "react";

/** A term that explains itself in a small tooltip on hover or keyboard focus. */
export function Term({ term, tip }: { term: string; tip: string }) {
  const tipId = useId();

  return (
    <span className="hm-term">
      <button type="button" className="hm-term-trigger" aria-describedby={tipId}>
        {term}
      </button>
      <span role="tooltip" id={tipId} className="hm-tip">
        {tip}
      </span>
    </span>
  );
}
