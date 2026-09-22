import type { ReactNode } from "react";

import { SiteHeader } from "./SiteHeader";

export function PageShell({ children, headerTrailing }: { children: ReactNode; headerTrailing?: ReactNode }) {
  return (
    <div className="site-shell" id="page-shell">
      <SiteHeader trailing={headerTrailing} />
      <main id="content" className="site-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
