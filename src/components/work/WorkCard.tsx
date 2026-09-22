import Link from "next/link";
import type { MouseEvent } from "react";

import { cue } from "@/components/audio/cues";

import type { CaseStudy } from "@/content/case-studies";
import { routes } from "@/lib/routes";

type Props = {
  study: CaseStudy;
  onOpen?: (slug: string, event: MouseEvent<HTMLAnchorElement>) => void;
  priority?: boolean;
};

export function WorkCard({ study, onOpen, priority }: Props) {
  return (
    <Link
      className="work-card"
      href={routes.caseStudy(study.slug)}
      onClick={onOpen ? (event) => onOpen(study.slug, event) : undefined}
      data-slug={study.slug}
      onMouseEnter={() => cue("tick")}
      onPointerDown={() => cue("press")}
    >
      <span className="work-card-cover">
        {study.thumbnailImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={study.thumbnailImage}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : undefined}
          />
        ) : null}
      </span>
      <span className="work-card-row">
        <span className="work-card-title">{study.homeBrand}</span>
        <span className="work-card-year t-caption t-num">{study.year}</span>
      </span>
      <span className="work-card-sub t-caption">{study.homeDescriptionShort}</span>
    </Link>
  );
}
