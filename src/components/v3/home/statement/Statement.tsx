"use client";

import dynamic from "next/dynamic";
import { Fragment, useCallback, useRef, useState } from "react";

import { cue } from "@/components/audio/cues";
import { statement, type StatementToken } from "@/content/home";
import { InkMark } from "../../InkMark";
import { LogoStack } from "./LogoStack";
import { Scribble } from "./Scribble";
import { useReading } from "./useReading";
import "./statement.css";

const PeopleField = dynamic(() => import("./PeopleField").then((m) => m.PeopleField), { ssr: false });

function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="st-word" data-word>
        {word}
      </span>
    </Fragment>
  ));
}

/** "What I do": words fill as they are read, and the inline pieces arrive with them. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const peopleRef = useRef<HTMLButtonElement>(null);
  const [peopleOpen, setPeopleOpen] = useState(false);
  useReading(ref);

  const openPeople = () => {
    cue("sparkle");
    setPeopleOpen(true);
  };

  const closePeople = useCallback(() => {
    cue("release");
    setPeopleOpen(false);
    peopleRef.current?.focus({ preventScroll: true });
  }, []);

  const renderToken = (token: StatementToken, key: number) => {
    if (typeof token === "string") return <Words key={key} text={token} />;

    if ("scribble" in token) {
      return (
        <span key={key} className="st-run">
          <span className="st-scribble-wrap" data-word>
            <Scribble />
          </span>
          <span className="st-word" data-word>
            {token.scribble}
          </span>
        </span>
      );
    }

    if ("tag" in token) {
      return (
        <span key={key} className="st-tag" data-word>
          <span>{token.tag}</span>
        </span>
      );
    }

    if ("logos" in token) return <LogoStack key={key} ids={token.logos} />;

    return (
      <button
        key={key}
        ref={peopleRef}
        type="button"
        className="st-people"
        data-word
        aria-expanded={peopleOpen}
        aria-haspopup="dialog"
        onClick={openPeople}
      >
        <InkMark kind="underline" seed={5}>
          {token.people}
        </InkMark>
      </button>
    );
  };

  return (
    <section ref={ref} className="hm-section st" aria-labelledby="hm-do-title">
      <h2 id="hm-do-title" className="hm-label">
        What I do
      </h2>
      {statement.map((paragraph, i) => (
        <p key={i}>
          {paragraph.map((token, j) => (
            <Fragment key={j}>
              {/* Words and pieces are spaced like words, except before closing punctuation. */}
              {j > 0 && !(typeof token === "string" && /^[.,]/.test(token)) ? " " : null}
              {renderToken(token, j)}
            </Fragment>
          ))}
        </p>
      ))}
      {peopleOpen ? <PeopleField anchor={peopleRef} onClose={closePeople} /> : null}
    </section>
  );
}
