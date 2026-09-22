import { notesCopy } from "@/content/about";

import "./notes.css";

const SEED = [
  { id: "seed-1", author: "Vaibhav", text: "First note's mine. Say hi, draw something, be kind. I read all of them.", rot: -2 },
  { id: "seed-2", author: "Vaibhav", text: "The sky in the footer is set to your hour. Scroll down and check.", rot: 2.5 },
];

/** Static placeholder until step 10 wires the live wall through Convex. */
export function NotesWallSection() {
  return (
    <section className="home-section home-bleed notes-section" id="notes" aria-labelledby="notes-heading">
      <div className="home-work-head">
        <h2 id="notes-heading" className="home-section-heading">
          {notesCopy.label}
        </h2>
        <p className="home-section-intro">{notesCopy.subline}</p>
      </div>
      <div className="notes-board" role="list" aria-label="Notes">
        {SEED.map((note, i) => (
          <article
            key={note.id}
            role="listitem"
            className="notes-card"
            style={{ ["--rot" as string]: `${note.rot}deg`, ["--x" as string]: `${12 + i * 46}%`, ["--y" as string]: `${18 + i * 30}%` }}
          >
            <p className="notes-card-text">{note.text}</p>
            <p className="notes-card-meta t-caption">
              {note.author} <span className="notes-owner">me</span>
            </p>
          </article>
        ))}
        <div className="notes-board-cta">
          <button type="button" className="home-btn" disabled aria-disabled="true">
            {notesCopy.button}
          </button>
          <span className="t-caption notes-board-hint">Opening soon</span>
        </div>
      </div>
    </section>
  );
}
