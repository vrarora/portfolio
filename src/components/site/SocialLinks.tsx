import { siteLinks } from "@/content/site-links";

export const EMAIL = "vraroraa@protonmail.com";

export const socialLinks = [
  { label: "Resume", href: siteLinks.resume },
  { label: "LinkedIn", href: siteLinks.linkedin },
  { label: "X", href: siteLinks.twitter },
  { label: "GitHub", href: siteLinks.github },
  { label: "Email", href: `mailto:${EMAIL}` },
] as const;

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {socialLinks.map((link) => (
        <li key={link.label}>
          <a href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
