import { findMe } from "@/content/home";
import { FindMeCard } from "./FindMeCard";

export function FindMe() {
  return (
    <section className="hm-section" aria-labelledby="hm-find-title">
      <h2 id="hm-find-title" className="hm-label">
        Find me
      </h2>
      <ul className="hm-cards">
        {findMe.map((card) => (
          <li key={card.id} data-scroll-blur>
            <FindMeCard card={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
