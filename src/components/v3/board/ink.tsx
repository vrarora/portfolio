import type { SVGProps } from "react";

import type { Drawing, Ink } from "./timeline";

/** Ink colours, set as CSS variables by the board and by reading-version figures. */
export const INK: Record<Ink, string> = { graphite: "var(--board-graphite)", red: "var(--board-red)", green: "var(--board-green)" };

/** A drawing placed with `at` is drawn in its own units, so its stroke is divided back to world px. */
export const groupProps = (d: Drawing) =>
  d.at
    ? { transform: `translate(${d.at.x} ${d.at.y}) scale(${d.at.scale})`, strokeWidth: d.width / d.at.scale }
    : { strokeWidth: d.width };

type Props = { drawing: Drawing; maskId: string; penLength?: number } & SVGProps<SVGGElement>;

/**
 * One drawing. Its `data-pen` paths are what the pen draws. Outline text keeps
 * those paths inside a mask, so the filled letters appear wherever the pen has been.
 */
export function InkDrawing({ drawing: d, maskId, penLength, ...rest }: Props) {
  const pens = (stroke?: (i: number) => number) =>
    d.paths.map((p, i) => <path key={i} d={p} data-pen="" pathLength={penLength} strokeWidth={stroke?.(i)} />);

  if (!d.outline) {
    return (
      <g stroke={INK[d.ink]} {...groupProps(d)} {...rest}>
        {pens()}
      </g>
    );
  }

  const { reveal } = d.outline;
  return (
    <g stroke={INK[d.ink]} fill={INK[d.ink]} {...groupProps(d)} {...rest}>
      <mask id={maskId}>
        <g stroke="#fff">{pens((i) => reveal[i])}</g>
      </mask>
      <path d={d.outline.d} data-letters="" mask={`url(#${maskId})`} />
    </g>
  );
}
