"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import { DonationExperience } from "../DonationExperience";
import { PhoneFrame } from "../chrome/PhoneFrame";
import {
  DonationFlowProvider,
  useDonationFlow,
} from "../flow/DonationFlowProvider";
import { fraunces } from "../fonts";
import { DemoAborted, runScript, sleep } from "./runner";
import { SCRIPTS, type ExperimentId } from "./scripts";
import { acquireSlot } from "./scheduler";
import { TouchIndicator, type FingerHandle } from "./TouchIndicator";
import type { DemoScript } from "./runner";

function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

function DemoStage({
  script,
  playing,
  caption,
  setCaption,
}: {
  script: DemoScript;
  playing: boolean;
  caption: string;
  setCaption: (text: string) => void;
}) {
  const { dispatch, viewportRef } = useDonationFlow();
  const fingerRef = useRef<FingerHandle | null>(null);
  const [fading, setFading] = useState(false);
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setViewportEl(viewportRef.current);
  }, [viewportRef]);

  useEffect(() => {
    if (!playing) return;

    const abort = new AbortController();
    const signal = abort.signal;

    (async () => {
      try {
        while (!signal.aborted) {
          const finger = fingerRef.current;
          if (!finger) {
            await sleep(120, signal);
            continue;
          }
          await runScript(
            script,
            {
              dispatch,
              finger,
              setCaption,
              getViewport: () => viewportRef.current,
            },
            signal,
          );
          setFading(true);
          await sleep(320, signal);
          dispatch({ type: "HYDRATE", state: script.pose });
          setCaption(script.caption);
          await sleep(140, signal);
          setFading(false);
          await sleep(500, signal);
        }
      } catch (error) {
        if (!(error instanceof DemoAborted)) throw error;
      }
    })();

    return () => {
      abort.abort();
      fingerRef.current?.hide();
      setFading(false);
      dispatch({ type: "HYDRATE", state: script.pose });
      setCaption(script.caption);
    };
  }, [playing, script, dispatch, setCaption, viewportRef]);

  return (
    <>
      <div className="ea-demo-frame">
        <PhoneFrame>
          <DonationExperience />
        </PhoneFrame>
        {viewportEl &&
          createPortal(
            <>
              <TouchIndicator ref={fingerRef} />
              <div
                className={
                  fading ? "ea-demo-fade ea-fading" : "ea-demo-fade"
                }
                aria-hidden="true"
              />
            </>,
            viewportEl,
          )}
      </div>
      <p className="ea-demo-caption" aria-live="polite">
        {caption}
      </p>
    </>
  );
}

/** Scripted host for one experiment demo: the real product in a phone frame,
 * auto-playing a micro-story. Starts when 35% visible, pauses off-screen or
 * on hidden tabs, and never exceeds the global two-players budget. */
export function EqualAllDemo({ experiment }: { experiment: ExperimentId }) {
  const script = SCRIPTS[experiment];
  const uid = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const documentVisible = useDocumentVisible();
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaptionState] = useState(script.caption);
  const setCaption = useCallback((text: string) => setCaptionState(text), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35] },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const wantPlay = inView && documentVisible && !reducedMotion;

  useEffect(() => {
    if (!wantPlay) return;
    const release = acquireSlot(`${experiment}-${uid}`, () =>
      setPlaying(true),
    );
    return () => {
      release();
      setPlaying(false);
    };
  }, [wantPlay, experiment, uid]);

  return (
    <div
      ref={rootRef}
      className={`ea-root ea-demo ${fraunces.variable}`}
      data-experiment={experiment}
    >
      <DonationFlowProvider mode="scripted" initialState={script.pose}>
        <DemoStage
          script={script}
          playing={playing}
          caption={caption}
          setCaption={setCaption}
        />
      </DonationFlowProvider>
    </div>
  );
}
