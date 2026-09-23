import Image from "next/image";
import Link from "next/link";

import type { CaseStudy } from "@/content/case-studies";
import type { BloomName } from "@/content/home";
import { Bloom } from "../Bloom";
import { readerMono } from "./fonts";
import { outline, readingMinutes, type OutlineFigure } from "./outline";
import { Rail } from "./Rail";
import { ReaderVisual } from "./ReaderVisual";
import "./reader.css";

type Section = CaseStudy["sections"][number];

const DOC_ID = "rd-doc";

function Paragraphs({ text }: { text: string }) {
  return text.split("\n\n").map((paragraph, i) => <p key={i}>{paragraph}</p>);
}

function Bullets({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

const figNumber = (n: number) => `Fig ${String(n).padStart(2, "0")}`;

/** A mockup set on a bloom, with a numbered caption row beneath it. */
function Figure({ figure, bloom, metrics }: { figure: OutlineFigure; bloom: BloomName; metrics?: Section["metrics"] }) {
  return (
    <figure id={figure.id} className="rd-fig" tabIndex={-1}>
      <Bloom name={bloom} className="rd-fig-stage">
        <div className="rd-fig-card">
          <ReaderVisual type={figure.type} metrics={metrics} />
        </div>
      </Bloom>
      <figcaption>
        <span className="rd-fig-n">{figNumber(figure.n)}</span>
        <span>{figure.caption}</span>
      </figcaption>
    </figure>
  );
}

/** A case study laid out like a long technical document: a rail on the left, one calm column of reading. */
export function Reader({ study, next }: { study: CaseStudy; next?: CaseStudy }) {
  const sections = outline(study);
  const bloom = study.workAccent;
  const rail = [
    { id: "overview", label: "Overview", subs: [] },
    ...sections.map((s, i) => ({
      id: s.id,
      label: `${i + 1}. ${s.kicker}`,
      subs: s.figures.map((f) => ({ id: f.id, label: f.label })),
    })),
  ];

  return (
    <div className={`rd ${readerMono.variable}`}>
      <Rail
        title={study.homeBrand}
        items={rail}
        docId={DOC_ID}
        next={next ? { href: `/work/${next.slug}/`, title: next.homeBrand } : undefined}
      />

      <article id={DOC_ID} className="rd-doc">
        <header id="overview" className="rd-head" tabIndex={-1}>
          <p className="rd-chip">{study.eyebrow}</p>
          <h1>{study.title}</h1>
          <p className="rd-summary">{study.summary}</p>
          <dl className="rd-meta">
            {study.metadata.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>
                  <span className="rd-br" aria-hidden="true">└</span>
                  {m.value}
                </dd>
              </div>
            ))}
            <div>
              <dt>Reading time</dt>
              <dd>
                <span className="rd-br" aria-hidden="true">└</span>
                {readingMinutes(study)} min
              </dd>
            </div>
          </dl>
        </header>

        {study.thumbnailImage ? (
          <figure className="rd-fig rd-fig--cover">
            <Bloom name={bloom} live className="rd-fig-stage">
              <Image className="rd-cover" src={study.thumbnailImage} alt={`${study.homeBrand}, the product`} width={1440} height={900} sizes="(max-width: 960px) 100vw, 760px" priority />
            </Bloom>
          </figure>
        ) : null}

        {sections.map(({ id, kicker, title, section, lead, itemFigures }, i) => (
          <section key={id} id={id} className="rd-section" tabIndex={-1} aria-labelledby={`${id}-title`}>
            <p className="rd-kicker">
              {String(i + 1).padStart(2, "0")} · {kicker}
            </p>
            <h2 id={`${id}-title`}>{title}</h2>
            <div className="rd-prose">
              {section.callout ? <p className="rd-note">{section.callout}</p> : null}
              <Paragraphs text={section.body} />
              <Bullets items={section.bullets} />
            </div>
            {lead ? <Figure figure={lead} bloom={bloom} metrics={section.metrics} /> : null}
            {section.items?.map((item, j) => (
              <div key={j} className="rd-item">
                {item.body || item.bullets?.length ? (
                  <div className="rd-prose">
                    {item.body ? <Paragraphs text={item.body} /> : null}
                    <Bullets items={item.bullets} />
                  </div>
                ) : null}
                {itemFigures[j] ? <Figure figure={itemFigures[j]} bloom={bloom} metrics={section.metrics} /> : null}
              </div>
            ))}
          </section>
        ))}

        <footer className="rd-end">
          {next ? (
            <Link className="rd-end-next" href={`/work/${next.slug}/`}>
              <span className="rd-th">Next case study</span>
              <span className="rd-end-title">{next.homeBrand}</span>
              <span className="rd-end-line">{next.title}</span>
            </Link>
          ) : null}
          <Link className="rd-end-home" href="/#work">
            Back to all projects
          </Link>
        </footer>
      </article>
    </div>
  );
}
