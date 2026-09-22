import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { caseStudies } from "@/content/case-studies";
import { routes } from "@/lib/routes";
import { RedirectStub } from "./RedirectStub";

/**
 * Legacy URL. Inbound links to /case-studies/<slug>/ land here and move on
 * to /work/<slug>/. Kept as a static page because the export has no server.
 */
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) return {};
  return {
    title: study.homeBrand,
    robots: { index: false, follow: true },
    alternates: { canonical: routes.caseStudy(study.slug) },
  };
}

export default async function LegacyCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) notFound();
  const to = routes.caseStudy(study.slug);
  return (
    <main style={{ padding: 24, fontFamily: "var(--font-sans)" }}>
      <RedirectStub to={to} />
      <p>
        This case study moved. <a href={to}>Continue to {study.homeBrand}</a>.
      </p>
    </main>
  );
}
