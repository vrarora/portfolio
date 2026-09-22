import Link from "next/link";
import type { ReactNode } from "react";

import { NavLinks } from "./NavLinks";

export function SiteHeader({ trailing }: { trailing?: ReactNode }) {
  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link className="site-wordmark link-quiet" href="/">
          Vaibhav Arora
        </Link>
        <div className="site-header-right">
          <NavLinks />
          {trailing}
        </div>
      </div>
    </header>
  );
}
