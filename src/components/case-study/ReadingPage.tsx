import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import type { CaseStudy } from "@/content/case-studies";
import { routes } from "@/lib/routes";
import { CaseStudyBody } from "./CaseStudyBody";

/** Direct visits to /work/[slug]/ render the case study as a full reading page. */
export function ReadingPage({ study }: { study: CaseStudy }) {
  return (
    <div className="cs-page">
      <div className="cs-page-top container">
        <Link className="cs-back link-quiet" href={routes.work}>
          <ArrowLeft size={14} weight="bold" /> All work
        </Link>
      </div>
      <CaseStudyBody study={study} variant="page" />
    </div>
  );
}
