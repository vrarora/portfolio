import { NOTE_COORD_MAX } from "@/shared/limits";
import { strokeToPolyline } from "@/shared/strokeCodec";
import type { Stroke } from "@/shared/strokeCodec";

export function DoodleSvg({ strokes, className }: { strokes: Stroke[]; className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${NOTE_COORD_MAX} ${NOTE_COORD_MAX}`}
      role="img"
      aria-label="Doodle"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {strokes.map((s, i) => (
        <polyline key={i} points={strokeToPolyline(s)} stroke={s.c} strokeWidth={s.w * 6} />
      ))}
    </svg>
  );
}
