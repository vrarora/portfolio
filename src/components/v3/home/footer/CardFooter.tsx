"use client";

import { EnvelopeSimple, GithubLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

import { EMAIL } from "@/content/about";
import { siteLinks } from "@/content/site-links";
import { signatureFont } from "./signatureFont";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/#work" },
  { label: "My Story", href: "/story/" },
  { label: "Playground", href: "/playground/" },
] as const;

const SOCIAL = [
  { label: "GitHub", href: siteLinks.github, Icon: GithubLogo },
  { label: "X", href: siteLinks.twitter, Icon: XLogo },
  { label: "LinkedIn", href: siteLinks.linkedin, Icon: LinkedinLogo },
  { label: `Email ${EMAIL}`, href: `mailto:${EMAIL}`, Icon: EnvelopeSimple },
] as const;

/** The card's last row: his signature, the site, and where else to find him. */
export function CardFooter() {
  const signRef = useRef<HTMLParagraphElement>(null);
  const [signed, setSigned] = useState(false);

  // The signature writes itself in the first time it comes into view.
  useEffect(() => {
    const el = signRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSigned(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer className="cf">
      <p ref={signRef} className={`cf-sign ${signatureFont.className}`} data-signed={signed ? "" : undefined}>
        Vaibhav
      </p>
      <nav className="cf-nav" aria-label="Site">
        {NAV.map((item, i) => (
          <Fragment key={item.href}>
            {i > 0 ? <span className="cf-dot" aria-hidden="true" /> : null}
            <Link href={item.href}>{item.label}</Link>
          </Fragment>
        ))}
      </nav>
      <ul className="cf-social">
        {SOCIAL.map(({ label, href, Icon }) => (
          <li key={label}>
            <a href={href} aria-label={label} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
              <Icon size={21} weight="light" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
