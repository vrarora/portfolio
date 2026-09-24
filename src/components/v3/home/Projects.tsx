"use client";

import { BookOpen, Shapes, type Icon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState, type CSSProperties, type FocusEvent } from "react";

import { cue } from "@/components/audio/cues";
import { LOGOS, projects, type ProjectGlyph, type ProjectMark } from "@/content/home";
import { Bloom } from "../Bloom";

/** Thickness of the floating mark, drawn as stacked slices between its two faces. Matches --depth in home.css. */
const EDGE_SLICES = 8;
const DEPTH = 8;

/** Each slice sits at its depth, shaded darkest at the middle of the rim. */
const EDGES = Array.from({ length: EDGE_SLICES }, (_, i) => ({
  "--z": `${DEPTH / 2 - (DEPTH * (i + 0.5)) / EDGE_SLICES}px`,
  "--shade": 1 - Math.abs((2 * i) / (EDGE_SLICES - 1) - 1),
})) as CSSProperties[];

const GLIDE = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;
const FLIP = { type: "spring", stiffness: 160, damping: 17 } as const;

const GLYPHS: Record<ProjectGlyph, Icon> = { shapes: Shapes, book: BookOpen };

type Coin = { faces: [ProjectMark, ProjectMark]; turns: number };

function Face({ mark, back }: { mark: ProjectMark; back?: boolean }) {
  const className = back ? "hm-mark-face hm-mark-face--back" : "hm-mark-face";
  if ("bloom" in mark) {
    const Glyph = GLYPHS[mark.glyph];
    return (
      <Bloom name={mark.bloom} className={`${className} hm-mark-face--bloom hm-mark-face--${mark.bloom}`}>
        <Glyph className="hm-mark-glyph" size={24} weight="duotone" aria-hidden="true" />
      </Bloom>
    );
  }
  const logo = LOGOS[mark.logo];
  const { wordmark } = logo;
  return (
    <span className={`${className} hm-mark-face--logo`} style={{ "--tint": logo.tint } as CSSProperties}>
      {wordmark ? (
        <Image className="hm-mark-wordmark" src={wordmark.src} alt="" width={wordmark.width} height={wordmark.height} sizes="40px" />
      ) : (
        <Image src={logo.src} alt="" width={112} height={112} sizes="56px" />
      )}
    </span>
  );
}

/**
 * Projects as a quiet table. Hovering a row dims the rest, and a thick mark for
 * the project glides alongside it, flipping over like a coin to show the new face.
 */
export function Projects() {
  const reduceMotion = useReducedMotion();
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [centre, setCentre] = useState(0);
  const [coin, setCoin] = useState<Coin>({ faces: [projects[0].mark, projects[0].mark], turns: 0 });

  const enter = (index: number) => {
    const row = rowRefs.current[index];
    if (row) setCentre(row.offsetTop + row.offsetHeight / 2);
    setActive(index);
    if (index === shown && active !== null) return;

    const mark = projects[index].mark;
    if (active === null) {
      // Arriving from nowhere: the visible face takes the new mark, with no flip.
      setCoin(({ faces, turns }) => {
        const next: Coin["faces"] = [...faces];
        next[turns % 2] = mark;
        return { faces: next, turns };
      });
    } else {
      // Moving between rows: the hidden face takes the new mark, then the coin turns to it.
      setCoin(({ faces, turns }) => {
        const next: Coin["faces"] = [...faces];
        next[(turns + 1) % 2] = mark;
        return { faces: next, turns: turns + 1 };
      });
    }
    setShown(index);
  };

  const leave = () => setActive(null);

  const onBlur = (event: FocusEvent<HTMLUListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) leave();
  };

  const visible = active !== null;

  return (
    <section id="work" className="hm-section hm-projects" aria-labelledby="hm-projects-title">
      <h2 id="hm-projects-title" className="hm-label">
        Projects
      </h2>
      <div className="hm-projects-body">
        <motion.div
          className="hm-mark"
          aria-hidden="true"
          initial={false}
          animate={{ y: centre, opacity: visible ? 1 : 0, scale: visible ? 1 : 0.72 }}
          transition={{
            y: reduceMotion ? { duration: 0 } : GLIDE,
            scale: reduceMotion ? { duration: 0 } : GLIDE,
            opacity: { duration: 0.2, ease: "easeOut" },
          }}
        >
          <div className="hm-mark-bob">
            <motion.div
              className="hm-mark-coin"
              initial={false}
              animate={{ rotateY: coin.turns * 180 }}
              transition={reduceMotion ? { duration: 0 } : FLIP}
            >
              <Face mark={coin.faces[0]} />
              {EDGES.map((edge, i) => (
                <span key={i} className="hm-mark-edge" style={edge} />
              ))}
              <Face mark={coin.faces[1]} back />
            </motion.div>
          </div>
        </motion.div>

        <ul className="hm-rows" data-hovering={visible || undefined} onPointerLeave={leave} onBlur={onBlur}>
          {projects.map((project, index) => (
            <li
              key={project.id}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
            >
              <Link
                className="hm-row"
                href={project.href}
                data-active={active === index || undefined}
                onPointerEnter={(event) => {
                  if (event.pointerType !== "mouse") return;
                  cue("tick");
                  enter(index);
                }}
                onFocus={() => enter(index)}
              >
                <span className="hm-row-year">{project.year}</span>
                <span className="hm-row-title">{project.title}</span>
                <span className="hm-row-role">{project.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
