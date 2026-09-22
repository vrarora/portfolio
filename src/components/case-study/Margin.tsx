import type { ReactNode } from "react";

/**
 * A short serif annotation. Sits in the right margin at >=1200px and reads
 * as an inline aside below that.
 */
export function Margin({ children }: { children: ReactNode }) {
  return (
    <aside className="cs-margin-note">
      <span className="cs-margin-text">{children}</span>
    </aside>
  );
}
