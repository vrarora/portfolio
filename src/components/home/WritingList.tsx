import { writing, writingIntro } from "@/content/writing";

import "./home.css";

type Props = {
  heading?: string;
  headingLevel?: "h1" | "h2";
  id?: string;
};

export function WritingList({ heading = "Writing", headingLevel = "h2", id }: Props) {
  const Heading = headingLevel;
  return (
    <section className="home-section home-writing" id={id} aria-labelledby={`${id ?? "writing"}-heading`}>
      <Heading id={`${id ?? "writing"}-heading`} className="home-section-heading">
        {heading}
      </Heading>
      <p className="home-section-intro">{writingIntro}</p>
      <ol className="home-writing-list">
        {writing.map((item, index) => (
          <li key={item.id} className="home-writing-item">
            <span className="home-writing-index t-micro">{String(index + 1).padStart(2, "0")}</span>
            <span className="home-writing-title">{item.title}</span>
            <span className="home-writing-tag">Drafting</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
