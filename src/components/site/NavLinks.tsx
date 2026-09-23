import Link from "next/link";

import { NotesLink } from "@/components/notes/NotesLink";
import { routes } from "@/lib/routes";

const SECTIONS = [
  { label: "Work", href: routes.work },
  { label: "Writing", href: routes.writing },
] as const;

/** Home sections plus the notes drawer. None of these has a page of its own. */
export function NavLinks() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="site-nav-list">
        {SECTIONS.map((item) => (
          <li key={item.label}>
            <Link className="site-nav-link" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <NotesLink className="site-nav-link">Notes</NotesLink>
        </li>
      </ul>
    </nav>
  );
}
