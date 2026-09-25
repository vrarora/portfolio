import { upTo } from "@/content/home";
import { RichText } from "./RichText";

export function UpTo() {
  return (
    <section className="hm-section" aria-labelledby="hm-upto-title">
      <h2 id="hm-upto-title" className="hm-label">
        What I&rsquo;ve been up to
      </h2>
      {upTo.map((item, i) => (
        <div key={i} className="hm-upto">
          <p data-scroll-blur>
            <RichText paragraph={item.line} />
          </p>
          {item.notes ? (
            <ul className="hm-notes">
              {item.notes.map((note, j) => (
                <li key={j} data-scroll-blur>
                  <RichText paragraph={note} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </section>
  );
}
