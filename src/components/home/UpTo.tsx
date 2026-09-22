import { upTo } from "@/content/about";

export function UpTo() {
  return (
    <section className="home-section home-upto" aria-labelledby="upto-heading">
      <h2 id="upto-heading" className="t-micro home-label">
        What I&apos;ve been up to
      </h2>
      <ul className="home-upto-list">
        {upTo.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
