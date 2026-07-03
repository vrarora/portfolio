"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";

export type FingerHandle = {
  moveTo(x: number, y: number): Promise<void>;
  press(): Promise<void>;
  pressHold(): Promise<void>;
  dragBy(dx: number, ms?: number): Promise<void>;
  release(): void;
  show(): void;
  hide(): void;
};

const MOVE_SPRING = { type: "spring", stiffness: 180, damping: 26 } as const;

/** The synthetic finger: a soft dot that springs between real DOM targets,
 * squeezes on press, and rings a ripple on tap. Lives inside the phone
 * viewport so its coordinates are in logical (unscaled) pixels. */
export const TouchIndicator = forwardRef<FingerHandle>(
  function TouchIndicator(_props, ref) {
    const x = useMotionValue(195);
    const y = useMotionValue(660);
    const [visible, setVisible] = useState(false);
    const [pressing, setPressing] = useState(false);
    const [ripple, setRipple] = useState(0);

    useImperativeHandle(ref, () => ({
      async moveTo(nx: number, ny: number) {
        await Promise.all([
          animate(x, nx, MOVE_SPRING),
          animate(y, ny, MOVE_SPRING),
        ]);
      },
      async press() {
        setPressing(true);
        setRipple((r) => r + 1);
        await new Promise((r) => setTimeout(r, 130));
        setPressing(false);
        await new Promise((r) => setTimeout(r, 130));
      },
      async pressHold() {
        setPressing(true);
        await new Promise((r) => setTimeout(r, 160));
      },
      async dragBy(dx: number, ms = 420) {
        await animate(x, x.get() + dx, {
          duration: ms / 1000,
          ease: [0.3, 0.7, 0.4, 1],
        });
      },
      release() {
        setPressing(false);
      },
      show() {
        setVisible(true);
      },
      hide() {
        setVisible(false);
      },
    }));

    return (
      <motion.div
        className="ea-finger"
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        aria-hidden="true"
      >
        <motion.span
          className="ea-finger-dot"
          animate={{ scale: pressing ? 0.78 : 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 28 }}
        />
        <AnimatePresence>
          {ripple > 0 && (
            <motion.span
              key={ripple}
              className="ea-finger-ripple"
              initial={{ scale: 0.5, opacity: 0.45 }}
              animate={{ scale: 2.1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);
