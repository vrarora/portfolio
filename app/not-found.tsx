import Link from "next/link";

import "@/styles/typography.css";
import "@/styles/utilities.css";
import "@/components/site/site.css";
import "@/components/effects/effects.css";

import { SkyLayer } from "@/components/effects/SkyLayer";
import { PageShell } from "@/components/site/PageShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SkipLink } from "@/components/site/SkipLink";

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SkyLayer />
      <PageShell>
        <section className="container" style={{ paddingTop: "var(--s-12)" }}>
          <h1>Nothing here.</h1>
          <p style={{ color: "var(--ink-2)", marginTop: "var(--s-5)" }}>
            That page moved or never existed. <Link href="/">Back to the start</Link>, or{" "}
            <Link href="/work/">see the work</Link>.
          </p>
        </section>
      </PageShell>
      <SiteFooter />
    </>
  );
}
