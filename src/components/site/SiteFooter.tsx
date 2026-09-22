import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/lib/routes";
import { EMAIL, socialLinks } from "./SocialLinks";

const INTERNAL = [
  { label: "Work", href: routes.work },
  { label: "Experiments", href: routes.experiments },
  { label: "Writing", href: routes.writing },
  { label: "Notes", href: routes.notes },
] as const;

export function SiteFooter({ dial }: { dial?: ReactNode }) {
  return (
    <footer className="site-footer" id="footer">
      <div className="site-footer-inner container">
        <nav className="site-footer-nav" aria-label="Footer">
          <ul className="site-footer-links">
            {INTERNAL.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="site-footer-signature t-serif">
          Designed and built by me, in code, with a few agents doing the typing.
        </p>

        <p className="site-footer-availability">
          Get in touch for senior product design roles at product-led companies.{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>

        <div className="site-footer-bottom">
          <div className="site-footer-dial">{dial}</div>
          <p className="site-footer-small t-caption">© 2026 Vaibhav Arora</p>
          <p className="site-footer-small t-caption">The sky shifts with the hour.</p>
        </div>
      </div>
    </footer>
  );
}
