import type { CaseStudy } from "@/content/case-studies";
import { Figure } from "./Figure";

export function CaseStudyHero({ study, headingLevel = "h1" }: { study: CaseStudy; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <header className="cs-hero" id="overview" tabIndex={-1}>
      <p className="cs-eyebrow t-micro">{study.eyebrow}</p>
      <Heading className="cs-title">{study.title}</Heading>
      <p className="cs-lede">{study.summary}</p>
      <dl className="cs-meta">
        {study.metadata.map((row) => (
          <div key={row.label} className="cs-meta-row">
            <dt className="t-caption">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      {study.thumbnailImage ? (
        <Figure bleed className="cs-hero-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={study.thumbnailImage} alt={`${study.homeBrand} interface`} loading="eager" decoding="async" />
        </Figure>
      ) : null}
    </header>
  );
}
