import type { ReactNode } from "react";

import "@/styles/typography.css";
import "@/styles/utilities.css";
import "@/components/site/site.css";
import "@/components/effects/effects.css";

import { AudioProvider } from "@/components/audio/AudioProvider";
import { MusicPill } from "@/components/audio/MusicPill";
import { SoundToggle } from "@/components/audio/SoundToggle";
import { AskLauncher } from "@/components/assistant/AskLauncher";
import { AskPanel } from "@/components/assistant/AskPanel";
import { AskProvider } from "@/components/assistant/AskProvider";
import { SkyDial } from "@/components/effects/SkyDial";
import { NotesPeek } from "@/components/notes/NotesPeek";
import { SkyLayer } from "@/components/effects/SkyLayer";
import { SkyProvider } from "@/components/effects/SkyProvider";
import { PageShell } from "@/components/site/PageShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SkipLink } from "@/components/site/SkipLink";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SkyProvider>
      <AudioProvider>
      <AskProvider>
        <SkipLink />
        <SkyLayer />
        <PageShell headerTrailing={<AskLauncher />}>{children}</PageShell>
        <SiteFooter dial={<SkyDial />} />
        <div id="sheet-root" />
        <NotesPeek />
        <MusicPill />
        <SoundToggle />
        <AskPanel />
      </AskProvider>
      </AudioProvider>
    </SkyProvider>
  );
}
