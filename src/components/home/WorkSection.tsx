import Link from "next/link";

import { CaseStudyGrid } from "@/components/work/CaseStudyGrid";
import { workCopy } from "@/content/about";
import { routes } from "@/lib/routes";

/** Home work section. Step 5 adds the Case studies / Experiments tabs. */
export function WorkSection() {
  return (
    <section className="home-section home-work home-bleed" id="work" aria-labelledby="work-heading">
      <div className="home-work-head">
        <h2 id="work-heading" className="home-section-heading">
          {workCopy.label}
        </h2>
        <p className="home-section-intro">{workCopy.caseStudiesIntro}</p>
      </div>
      <CaseStudyGrid />
      <p className="home-work-more">
        <Link href={routes.experiments}>See the experiments</Link>
      </p>
    </section>
  );
}
