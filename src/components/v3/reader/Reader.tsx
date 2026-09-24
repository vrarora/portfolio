import Image from "next/image";
import Link from "next/link";

import type { CaseStudy } from "@/content/case-studies";
import type { BloomName } from "@/content/home";
import { Bloom } from "../Bloom";
import { readerMono } from "./fonts";
import { outline, type OutlineFigure } from "./outline";
import { Rail } from "./Rail";
import { ReaderMedia } from "./ReaderMedia";
import { ReaderVisual } from "./ReaderVisual";
import "./reader.css";

type Section = CaseStudy["sections"][number];

const DOC_ID = "rd-doc";

function Paragraphs({ text }: { text: string }) {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((paragraph, i) => <p key={i}>{paragraph}</p>);
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

/** A mockup or recording set on a bloom, with a numbered caption centred beneath it. */
function Figure({ figure, bloom, metrics }: { figure: OutlineFigure; bloom: BloomName; metrics?: Section["metrics"] }) {
  return (
    <figure id={figure.id} className="rd-fig" tabIndex={-1}>
      <Bloom name={bloom} className="rd-fig-stage">
        {figure.media ? (
          <div className="rd-fig-card">
            <ReaderMedia media={figure.media} />
          </div>
        ) : figure.type ? (
          <div className="rd-fig-card">
            <ReaderVisual type={figure.type} metrics={metrics} />
          </div>
        ) : (
          <div className="rd-fig-slot" aria-hidden="true" />
        )}
      </Bloom>
      <figcaption>
        <span className="rd-fig-n">{figNumber(figure.n)}</span>
        {figure.caption}
      </figcaption>
    </figure>
  );
}

/** A case study laid out like a long note: a floating contents rail beside one column of reading. */
export function Reader({ study, next }: { study: CaseStudy; next?: CaseStudy }) {
  const sections = outline(study);
  const bloom = study.workAccent;
  const cover = study.coverImage ?? (study.thumbnailImage ? { src: study.thumbnailImage, width: 1440, height: 900 } : undefined);
  const rail = [
    { id: "overview", label: "Overview", subs: [] },
    ...sections.map((s, i) => ({
      id: s.id,
      label: `${i + 1}. ${s.kicker}`,
      subs: s.figures.flatMap((f) => (f.label ? [{ id: f.id, label: f.label }] : [])),
    })),
  ];

  return (
    <div className={`rd ${readerMono.variable}`}>
      <Rail
        title={study.homeBrand}
        items={rail}
        docId={DOC_ID}
      />

      <article id={DOC_ID} className="rd-doc">
        <header id="overview" className="rd-head" tabIndex={-1}>
          <h1>{study.title}</h1>
        </header>

        {cover ? (
          <figure className="rd-fig rd-fig--cover">
            <Bloom name={bloom} live className="rd-fig-stage">
              <Image className="rd-cover" src={cover.src} alt={`${study.homeBrand}, the product`} width={cover.width} height={cover.height} sizes="(max-width: 960px) 100vw, 832px" priority />
            </Bloom>
          </figure>
        ) : null}

        {sections.map(({ id, title, section, lead, itemFigures }, i) => (
          <section key={id} id={id} className="rd-section" tabIndex={-1} aria-labelledby={`${id}-title`}>
            <div className="rd-section-head">
              <h2 id={`${id}-title`}>{title}</h2>
              <span className="rd-section-rule" aria-hidden="true" />
              <span className="rd-kicker" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
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
              <span className="rd-end-label">Next</span>
              <span className="rd-end-title">{next.homeBrand}</span>
            </Link>
          ) : null}
        </footer>
      </article>
    </div>
  );
}
