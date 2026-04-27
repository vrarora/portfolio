import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies } from "@/content/case-studies";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);

  if (!study) {
    notFound();
  }

  return (
    <main className="page-shell case-study-page">
      <nav className="back-row">
        <Link className="text-link" href="/">
          ← Back home
        </Link>
        <span className="status-pill">{study.visibility}</span>
      </nav>

      <header className="case-hero">
        <p className="eyebrow">{study.eyebrow}</p>
        <h1>{study.title}</h1>
        <p className="lede">{study.summary}</p>
      </header>

      <section className="metadata-grid">
        {study.metadata.map((entry) => (
          <article key={entry.label} className="card">
            <p className="card-kicker">{entry.label}</p>
            <p className="metadata-value">{entry.value}</p>
          </article>
        ))}
      </section>

      <section className="story-grid">
        {study.sections.map((section) => (
          <article key={section.title} className="card story-card">
            <p className="card-kicker">{section.kicker}</p>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.visual ? (
              <div className="visual-placeholder">{section.visual}</div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
