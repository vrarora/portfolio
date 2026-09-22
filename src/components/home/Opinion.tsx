import { opinionPlaceholder } from "@/content/about";

export function Opinion({ variant = "beforeAssistant" }: { variant?: keyof typeof opinionPlaceholder }) {
  return (
    <section className="home-section home-opinion" aria-labelledby="opinion-heading">
      <h2 id="opinion-heading" className="t-micro home-label">
        One strong opinion
      </h2>
      <blockquote className="home-opinion-block">
        <p>{opinionPlaceholder[variant]}</p>
      </blockquote>
    </section>
  );
}
