import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { findMe } from "@/content/home";

export function FindMe() {
  return (
    <section className="hm-section" aria-labelledby="hm-find-title">
      <h2 id="hm-find-title" className="hm-label">
        Find me
      </h2>
      <ul className="hm-cards">
        {findMe.map((card) => (
          <li key={card.id} data-scroll-blur>
            <a className="hm-card" href={card.href} target="_blank" rel="noreferrer">
              <span className="hm-card-label">{card.label}</span>
              <span className="hm-card-line">{card.line}</span>
              <ArrowUpRight className="hm-card-arrow" size={12} weight="bold" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
