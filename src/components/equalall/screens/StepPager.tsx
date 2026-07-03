"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { SPRING_STEP } from "../motionTokens";

type Direction = 1 | -1 | 0;

const SLIDE = 44;

const paneVariants = {
  enter: (dir: Direction) => ({ x: dir * SLIDE, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { ...SPRING_STEP, opacity: { duration: 0.22, delay: 0.04 } },
  },
  // The fade leads the slide so the leaving pane is invisible before it
  // could poke past the animating container (the pager doesn't clip).
  exit: (dir: Direction) => ({
    x: dir * -SLIDE,
    opacity: 0,
    transition: { ...SPRING_STEP, opacity: { duration: 0.13 } },
  }),
};

function StepPane({
  direction,
  paneRef,
  children,
}: {
  direction: Direction;
  paneRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  // The leaving pane leaves flow immediately (the incoming pane defines the
  // container's target height) and must never intercept taps meant for the
  // step replacing it.
  const isPresent = useIsPresent();

  return (
    <motion.div
      ref={isPresent ? paneRef : undefined}
      className={isPresent ? "ea-step-pane" : "ea-step-pane ea-step-pane-out"}
      custom={direction}
      variants={paneVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

/** Sheet step container that crossfades/slides between steps while animating
 * its own height with the shared step spring. The exiting pane is removed
 * from flow the moment it starts leaving, so the sheet never stacks two
 * steps or flashes at the wrong size (the failure mode of `popLayout`
 * inside a bottom-anchored sheet). `direction` is the horizontal travel of
 * the incoming pane: 1 = forward (enters from the right), -1 = back,
 * 0 = pure crossfade. */
export function StepPager({
  stepKey,
  direction = 0,
  children,
}: {
  stepKey: string;
  direction?: Direction;
  children: ReactNode;
}) {
  const paneRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const measure = () => setHeight(pane.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [stepKey]);

  return (
    <motion.div
      className="ea-step-pager"
      initial={false}
      animate={height === null ? undefined : { height }}
      transition={SPRING_STEP}
    >
      <AnimatePresence initial={false} custom={direction}>
        <StepPane key={stepKey} direction={direction} paneRef={paneRef}>
          {children}
        </StepPane>
      </AnimatePresence>
    </motion.div>
  );
}
