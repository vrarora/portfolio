import type { CaseStudy } from "@/content/case-studies";
import { Figure } from "./Figure";
import { Margin } from "./Margin";
import { isVisualType, visualRegistry } from "./visualRegistry";

type Section = CaseStudy["sections"][number];
type Item = NonNullable<Section["items"]>[number];

export function toSectionId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="cs-bullets">
      {items.map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
  );
}

function Visual({ type, caption, metrics }: { type?: string; caption?: string; metrics?: Section["metrics"] }) {
  if (!isVisualType(type)) return null;
  const Component = visualRegistry[type] as React.ComponentType<{ metrics?: Section["metrics"] }>;
  return (
    <Figure bleed caption={caption} aspect="16 / 10">
      <Component metrics={metrics} />
    </Figure>
  );
}

function SectionItem({ item, metrics }: { item: Item; metrics?: Section["metrics"] }) {
  return (
    <div className="cs-item" data-cs-reveal>
      {item.body ? <Paragraphs text={item.body} /> : null}
      {item.bullets && item.bullets.length > 0 ? <Bullets items={item.bullets} /> : null}
      <Visual type={item.visualType} caption={item.visual} metrics={metrics} />
    </div>
  );
}

export function CaseStudySection({ section, index }: { section: Section; index: number }) {
  const id = toSectionId(section.title);
  return (
    <section className="cs-section" id={id} tabIndex={-1} aria-labelledby={`${id}-title`}>
      <div className="cs-section-head" data-cs-reveal>
        <p className="cs-kicker t-micro">
          <span className="t-num">{String(index + 1).padStart(2, "0")}</span> {section.kicker}
        </p>
        <h2 id={`${id}-title`}>{section.title}</h2>
      </div>
      <div className="cs-prose" data-cs-reveal>
        {section.callout ? <Margin>{section.callout}</Margin> : null}
        <Paragraphs text={section.body} />
        {section.bullets && section.bullets.length > 0 ? <Bullets items={section.bullets} /> : null}
      </div>
      <Visual type={section.visualType} caption={section.visual} metrics={section.metrics} />
      {section.items?.map((item, i) => <SectionItem key={i} item={item} metrics={section.metrics} />)}
    </section>
  );
}
