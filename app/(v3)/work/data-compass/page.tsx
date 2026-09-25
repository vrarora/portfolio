import type { Metadata } from "next";

import { RedirectStub } from "../../../case-studies/[slug]/RedirectStub";
import { routes } from "@/lib/routes";

/** The case study moved when the product was renamed Data Atlas. */
const to = routes.caseStudy("data-atlas");

export const metadata: Metadata = {
  title: "Data Atlas",
  robots: { index: false, follow: true },
  alternates: { canonical: to },
};

export default function LegacyDataCompassPage() {
  return (
    <main style={{ padding: 24, fontFamily: "var(--font-sans)" }}>
      <RedirectStub to={to} />
      <p>
        This case study moved. <a href={to}>Continue to Data Atlas</a>.
      </p>
    </main>
  );
}
