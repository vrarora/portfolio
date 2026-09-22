import type { ReactNode } from "react";

import "@/styles/typography.css";
import "@/styles/utilities.css";
import "@/components/site/site.css";
import "@/components/effects/effects.css";

import { SkyDial } from "@/components/effects/SkyDial";
import { SkyLayer } from "@/components/effects/SkyLayer";
import { SkyProvider } from "@/components/effects/SkyProvider";
import { PageShell } from "@/components/site/PageShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SkipLink } from "@/components/site/SkipLink";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SkyProvider>
      <SkipLink />
      <SkyLayer />
      <PageShell>{children}</PageShell>
      <SiteFooter dial={<SkyDial />} />
      <div id="sheet-root" />
      <div id="ask-root" />
    </SkyProvider>
  );
}
