import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReadingPage } from "@/components/case-study/ReadingPage";
import { caseStudies } from "@/content/case-studies";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) return {};
  const title = `${study.homeBrand}: ${study.title}`;
  return {
    title,
    description: study.summary,
    alternates: { canonical: `/work/${study.slug}/` },
    openGraph: {
      title,
      description: study.summary,
      url: `/work/${study.slug}/`,
      images: study.thumbnailImage ? [{ url: study.thumbnailImage }] : undefined,
    },
    twitter: { title, description: study.summary },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);
  if (!study) notFound();
  return <ReadingPage study={study} />;
}
