"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { HandHeart, MapPin } from "@phosphor-icons/react";
import { campaign } from "../data/campaign";
import { useDonationFlow } from "../flow/DonationFlowProvider";

const SNAP_SPRING = { type: "spring", stiffness: 280, damping: 32 } as const;

/** Swipeable hero with the Donate CTA docked inside the frame (experiment 4):
 * looking closer at the photos leads straight into giving. */
export function HeroCarousel() {
  const { state, dispatch, mode, reducedMotion } = useDonationFlow();
  const interactive = mode === "interactive";
  const slides = campaign.heroImages;

  const frameRef = useRef<HTMLDivElement | null>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setSlideWidth(frame.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (slideWidth === 0) return;
    const target = -state.heroIndex * slideWidth;
    if (reducedMotion) {
      x.set(target);
      return;
    }
    const controls = animate(x, target, SNAP_SPRING);
    return () => controls.stop();
  }, [state.heroIndex, slideWidth, reducedMotion, x]);

  function settleDrag(offsetX: number, velocityX: number) {
    const projected = offsetX + velocityX * 0.2;
    let target = state.heroIndex;
    if (projected < -slideWidth * 0.28) target += 1;
    else if (projected > slideWidth * 0.28) target -= 1;
    target = Math.max(0, Math.min(slides.length - 1, target));

    if (target !== state.heroIndex) {
      dispatch({ type: "SET_HERO_INDEX", index: target });
    } else {
      animate(x, -target * slideWidth, SNAP_SPRING);
    }
  }

  return (
    <div className="ea-hero" ref={frameRef}>
      <motion.div
        className="ea-hero-track"
        style={{ x }}
        drag={interactive ? "x" : false}
        dragConstraints={{
          left: -(slides.length - 1) * slideWidth,
          right: 0,
        }}
        dragElastic={0.12}
        onDragEnd={(_, info) => settleDrag(info.offset.x, info.velocity.x)}
      >
        {slides.map((slide, i) => (
          <div className="ea-hero-slide" key={slide.src}>
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </motion.div>

      <span className="ea-hero-location">
        <MapPin size={12} weight="fill" />
        {campaign.location}
      </span>

      <div className="ea-hero-dots" aria-hidden="true">
        {slides.map((slide, i) => (
          <span
            key={slide.src}
            className={
              i === state.heroIndex ? "ea-hero-dot ea-active" : "ea-hero-dot"
            }
          />
        ))}
      </div>

      <motion.button
        type="button"
        className="ea-hero-donate"
        data-ea-target="hero-donate"
        whileTap={interactive ? { scale: 0.94 } : undefined}
        onClick={() => dispatch({ type: "OPEN_GIFT" })}
      >
        <HandHeart size={17} weight="fill" />
        Donate
      </motion.button>
    </div>
  );
}
