import type { ReactNode } from "react";

import "@/styles/typography.css";
import "@/styles/utilities.css";
import "@/components/v3/v3.css";

/** The v3 site: a quiet shell with no chrome, so each page sets its own frame. */
export default function V3Layout({ children }: { children: ReactNode }) {
  return <div className="v3">{children}</div>;
}
