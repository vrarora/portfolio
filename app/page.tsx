import Link from "next/link";
import type { ReactNode } from "react";
import { caseStudies } from "@/content/case-studies";
import { siteLinks } from "@/content/site-links";

const navItems = [
  { label: "Home", href: "#top", icon: HomeIcon },
  { label: "Work", href: "#work", icon: GridIcon },
  { label: "About", href: "#about", icon: PersonIcon },
  { label: "Contact", href: "#contact", icon: MailIcon },
] as const;

const principles = [
  {
    title: "Context first",
    body: "The page should explain the work fast: role, constraints, decisions, and why it mattered.",
  },
  {
    title: "Systems over screens",
    body: "Visual polish matters, but repeatable structure matters more for a portfolio that will keep changing.",
  },
  {
    title: "Judgment stays visible",
    body: "The layout keeps decisions legible so hiring managers can scan without losing the designer's point of view.",
  },
] as const;

const supportedTeams = ["Zalando", "Google", "Urban Sports Club"] as const;

function SectionReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal ${className}`.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11V10.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M6 20c1.6-3.9 4.1-5.8 6-5.8s4.4 1.9 6 5.8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="1.5" />
      <path d="m5.5 7.5 6.5 5 6.5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M10 7h7v7" />
    </svg>
  );
}

function DownArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v13" />
      <path d="M7 13.5 12 18l5-4.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 10v7" />
      <circle cx="7.5" cy="7" r="1.25" />
      <path d="M11 17v-4.2c0-1.7 1.1-2.8 2.7-2.8S16.4 11.1 16.4 13V17" />
      <path d="M11 13.6V17" />
      <path d="M17.5 10v7" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10l2 2v14H7z" />
      <path d="M9 10h6" />
      <path d="M9 14h5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="portfolio-page" id="top">
      <header className="floating-header">
        <a className="wordmark" href="#top">
          Vaibhav Arora
        </a>

        <nav className="nav-rail nav-rail-shell" aria-label="Primary">
          {navItems.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              className="nav-button"
              href={href}
              aria-label={label}
              title={label}
            >
              <Icon />
            </a>
          ))}
        </nav>

        <div className="top-actions" aria-label="Social and resume links">
          <a className="top-action" href={siteLinks.resume} target="_blank" rel="noreferrer" aria-label="Resume">
            <ResumeIcon />
          </a>
          <a className="top-action" href={siteLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
          <a className="top-action" href={siteLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
            <XIcon />
          </a>
        </div>
      </header>

      <section className="hero" aria-label="Hero">
        <SectionReveal className="hero-copy">
          <div className="status-line">
            <span className="status-line-label">Vaibhav is</span>
            <span className="status-avatar" aria-hidden="true">
              VA
            </span>
            <span className="status-line-copy">
              <strong>Senior Product Designer</strong> - shaping product systems
              for mid-stage startups.
            </span>
          </div>
          <h1>KIND DESIGN LEAD FOR MID STAGE START-UPS</h1>
          <p className="lede">
            A static, scan-first portfolio shaped for hiring managers. The
            layout keeps the work public, the hierarchy crisp, and the eventual
            content rewrite path intact.
          </p>
          <div className="cta-row">
            <a className="button button-primary" href={siteLinks.bookIntro} target="_blank" rel="noreferrer">
              Book Intro
            </a>
            <a className="button" href={siteLinks.connect} target="_blank" rel="noreferrer">
              Let&apos;s connect
            </a>
          </div>
        </SectionReveal>

        <aside className="trust-cluster">
          <p className="trust-label">Supported world-class teams</p>
          <div className="trust-logos">
            {supportedTeams.map((team) => (
              <span key={team}>{team}</span>
            ))}
          </div>
          <a className="scroll-chip" href="#work" aria-label="Scroll to selected work">
            <DownArrowIcon />
          </a>
        </aside>
      </section>

      <section className="hero-secondary" aria-label="Supporting context">
        <article className="hero-note">
          <p className="card-kicker">Current focus</p>
          <h2>Phase 2 is all about the homepage composition.</h2>
          <p>
            The implementation mirrors the Oriol-inspired reference with
            compact navigation, sharp edges, and editorial whitespace.
          </p>
        </article>

        <article className="hero-note">
          <p className="card-kicker">Active status</p>
          <p>
            Temporary wordmark in place, three public case studies wired, and
            resume access kept in the nav and footer.
          </p>
        </article>
      </section>

      <section className="section" id="work">
        <SectionReveal className="section-head">
          <div>
            <p className="section-label">Selected work</p>
            <h2>Three public case studies structured for fast scanning.</h2>
          </div>
          <p className="section-note">
            Each route keeps the future client-side gate path open without
            changing the slug structure.
          </p>
        </SectionReveal>

        <div className="work-stack">
          {caseStudies.map((study, index) => (
            <SectionReveal key={study.slug} delay={index * 90}>
              <Link
                className={`card work-row work-row-${index + 1}`}
                href={`/case-studies/${study.slug}`}
              >
                <div className="work-index">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>

                <div className="work-main">
                  <p className="card-kicker">{study.eyebrow}</p>
                  <h3>{study.title}</h3>
                  <p>{study.summary}</p>
                </div>

                <div className="work-meta">
                  {study.metadata.slice(0, 3).map((entry) => (
                    <div key={entry.label}>
                      <span className="meta-label">{entry.label}</span>
                      <span className="meta-value">{entry.value}</span>
                    </div>
                  ))}
                </div>

                <span className="work-cta">
                  Open case study
                  <ArrowIcon />
                </span>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section className="section about-section" id="about">
        <SectionReveal className="about-copy">
          <p className="section-label">About</p>
          <h2>Senior Product Designer focused on clarity, systems, and launch readiness.</h2>
          <p>
            Placeholder biography for the v1 portfolio. The point of the page is
            to feel finished before the content is final, so hiring managers can
            read the structure without waiting for the rewrite.
          </p>
        </SectionReveal>

        <div className="about-grid">
          {principles.map((item, index) => (
            <SectionReveal key={item.title} delay={index * 90}>
              <article className="card principle-card">
                <p className="card-kicker">Working principle</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section className="section contact-section" id="contact">
        <SectionReveal className="contact-copy">
          <p className="section-label">Contact</p>
          <h2>Open for product design roles, portfolio reviews, and good project bets.</h2>
          <p>
            The contact area keeps the CTA paths simple: book time, connect, or
            review work through the public case studies.
          </p>
        </SectionReveal>

        <SectionReveal delay={120}>
          <article className="card contact-panel">
            <a className="contact-link" href={siteLinks.bookIntro} target="_blank" rel="noreferrer">
              <span>Book Intro</span>
              <ArrowIcon />
            </a>
            <a className="contact-link" href={siteLinks.connect} target="_blank" rel="noreferrer">
              <span>Let&apos;s connect</span>
              <ArrowIcon />
            </a>
            <a className="contact-link" href={siteLinks.linkedin} target="_blank" rel="noreferrer">
              <span>LinkedIn</span>
              <ArrowIcon />
            </a>
            <a className="contact-link" href={siteLinks.twitter} target="_blank" rel="noreferrer">
              <span>Twitter</span>
              <ArrowIcon />
            </a>
            <a className="contact-link" href={siteLinks.resume} target="_blank" rel="noreferrer">
              <span>Resume</span>
              <ArrowIcon />
            </a>
          </article>
        </SectionReveal>
      </section>

      <footer className="footer">
        <span>Vaibhav Arora</span>
        <span className="footer-note">Phase 2 homepage replica</span>
        <a href={siteLinks.resume} target="_blank" rel="noreferrer">
          Resume
        </a>
      </footer>
    </main>
  );
}
