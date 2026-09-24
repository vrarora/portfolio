import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Reader } from "@/components/v3/reader/Reader";
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
      images: study.ogImage
        ? [{ url: study.ogImage, width: 1200, height: 630 }]
        : study.thumbnailImage
          ? [{ url: study.thumbnailImage }]
          : undefined,
    },
    twitter: { title, description: study.summary },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const index = caseStudies.findIndex((s) => s.slug === slug);
  if (index < 0) notFound();
  const next = caseStudies.length > 1 ? caseStudies[(index + 1) % caseStudies.length] : undefined;
  return <Reader study={caseStudies[index]} next={next} />;
}
