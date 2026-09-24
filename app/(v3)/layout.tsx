import type { ReactNode } from "react";

import { AudioProvider } from "@/components/audio/AudioProvider";
import { SkyProvider } from "@/components/effects/SkyProvider";
import { ClickFeedback } from "@/components/v3/ClickFeedback";
import { CustomCursor } from "@/components/v3/CustomCursor";
import { WorkTable } from "@/components/v3/worktable/WorkTable";
import "@/styles/typography.css";
import "@/styles/utilities.css";
import "@/components/v3/v3.css";

/** The v3 site: a quiet shell with no chrome, so each page sets its own frame. */
export default function V3Layout({ children }: { children: ReactNode }) {
  return (
    <SkyProvider>
      <AudioProvider>
        <div className="v3">
          {children}
          <WorkTable />
          <ClickFeedback />
          <CustomCursor />
        </div>
      </AudioProvider>
    </SkyProvider>
  );
}
