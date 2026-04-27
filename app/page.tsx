import Link from "next/link";
import { caseStudies } from "@/content/case-studies";
import { siteLinks } from "@/content/site-links";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow-row">
          <span className="eyebrow">Vaibhav Arora</span>
          <span className="status-pill">Static foundation</span>
        </div>
        <h1>KIND DESIGN LEAD FOR MID STAGE START-UPS</h1>
        <p className="lede">
          Phase 1 establishes the static portfolio system: export-safe routing,
          shared content, and design tokens that mirror the extracted Oriol
          reference.
        </p>
        <div className="cta-row">
          <a className="button button-primary" href={siteLinks.bookIntro}>
            Book Intro
          </a>
          <a className="button" href={siteLinks.connect}>
            Let&apos;s connect
          </a>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Selected work</h2>
          <p>Three placeholder case studies, wired for public scanning.</p>
        </div>
        <div className="grid work-grid">
          {caseStudies.map((study) => (
            <article key={study.slug} className="card work-card">
              <p className="card-kicker">{study.status}</p>
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
              <Link className="text-link" href={`/case-studies/${study.slug}`}>
                View case study
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <article className="card">
          <p className="card-kicker">About</p>
          <h2>Senior Product Designer</h2>
          <p>
            Placeholder positioning for the v1 portfolio. The phase-one goal is
            to create the infrastructure that lets later phases tell the story
            cleanly.
          </p>
        </article>
        <article className="card">
          <p className="card-kicker">Contact</p>
          <ul className="link-list">
            <li>
              <a href={siteLinks.bookIntro}>Book Intro</a>
            </li>
            <li>
              <a href={siteLinks.connect}>Let&apos;s connect</a>
            </li>
            <li>
              <a href={siteLinks.linkedin}>LinkedIn</a>
            </li>
            <li>
              <a href={siteLinks.twitter}>Twitter</a>
            </li>
            <li>
              <a href={siteLinks.resume}>Resume</a>
            </li>
          </ul>
        </article>
      </section>

      <footer className="footer">
        <span>Vaibhav Arora</span>
        <a href={siteLinks.resume}>Resume</a>
      </footer>
    </main>
  );
}
