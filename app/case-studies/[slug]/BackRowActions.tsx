"use client";

import { LinkedinLogo, GithubLogo, FileText, XLogo } from "@phosphor-icons/react";
import { siteLinks } from "@/content/site-links";

const actionItems = [
  { label: "LinkedIn", href: siteLinks.linkedin, icon: LinkedinLogo },
  { label: "GitHub", href: siteLinks.github, icon: GithubLogo },
  { label: "Resume", href: siteLinks.resume, icon: FileText },
  { label: "Twitter", href: siteLinks.twitter, icon: XLogo },
] as const;

export function BackRowActions() {
  return (
    <div className="back-row-actions">
      {actionItems.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          className="top-action"
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}
