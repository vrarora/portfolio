"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";

const ITEMS = [
  { label: "Work", href: routes.work, match: "/work" },
  { label: "Writing", href: routes.writing, match: "/writing" },
  { label: "Notes", href: routes.notes, match: null },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="site-nav-list">
        {ITEMS.map((item) => {
          const active = item.match !== null && pathname.startsWith(item.match);
          return (
            <li key={item.label}>
              <Link
                className="site-nav-link"
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
