import type { Metadata } from "next";

import { RedirectStub } from "../../../case-studies/[slug]/RedirectStub";
import { routes } from "@/lib/routes";

/** The Design Repo case study grew into Agentic Design. */
const to = routes.caseStudy("agentic-design");

export const metadata: Metadata = {
  title: "Agentic Design",
  robots: { index: false, follow: true },
  alternates: { canonical: to },
};

export default function LegacyDesignRepoPage() {
  return (
    <main style={{ padding: 24, fontFamily: "var(--font-sans)" }}>
      <RedirectStub to={to} />
      <p>
        This case study moved. <a href={to}>Continue to Agentic Design</a>.
      </p>
    </main>
  );
}
