import type { MouseEvent } from "react";

import { caseStudies } from "@/content/case-studies";
import { WorkCard } from "./WorkCard";

import "./work.css";

type Props = {
  onOpen?: (slug: string, event: MouseEvent<HTMLAnchorElement>) => void;
  id?: string;
};

export function CaseStudyGrid({ onOpen, id }: Props) {
  return (
    <div className="work-grid" id={id}>
      {caseStudies.map((study, index) => (
        <WorkCard key={study.slug} study={study} onOpen={onOpen} priority={index === 0} />
      ))}
    </div>
  );
}
