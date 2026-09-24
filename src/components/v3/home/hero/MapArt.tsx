"use client";

import { useMemo } from "react";

import { seeded } from "../../sketch";

/**
 * A dark street map drawn in code, loosely Mumbai: the Arabian Sea on the west,
 * a curving seafront, a grid of lanes that bends with it, and a few main roads.
 */
export function MapArt() {
  const { lanes, roads, labels } = useMemo(() => {
    const rand = seeded(19);
    const coast = (y: number) => 70 + Math.sin(y / 60) * 18 + y * 0.12;
    const lanes: string[] = [];
    for (let y = -20; y < 260; y += 11 + rand() * 6) {
      const x0 = coast(y) + 6;
      lanes.push(`M${x0.toFixed(1)} ${y.toFixed(1)} L${(420).toFixed(1)} ${(y + 18 + rand() * 8).toFixed(1)}`);
    }
    for (let x = 90; x < 420; x += 13 + rand() * 8) {
      lanes.push(`M${x.toFixed(1)} -20 L${(x - 22 + rand() * 6).toFixed(1)} 260`);
    }
    const roads = [
      `M${coast(-20) + 4} -20 ${Array.from({ length: 14 }, (_, i) => `L${(coast(i * 20) + 4).toFixed(1)} ${i * 20}`).join(" ")}`,
      "M150 -20 C170 60 190 120 240 260",
      "M90 110 C180 100 280 130 420 120",
      "M300 -20 C290 80 320 160 300 260",
    ];
    const labels = Array.from({ length: 7 }, () => ({ x: 110 + rand() * 280, y: 20 + rand() * 190, n: 1 + Math.floor(rand() * 11) }));
    return { lanes, roads, labels };
  }, []);

  return (
    <svg className="map-art" viewBox="0 0 420 240" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="420" height="240" fill="#2a2b2e" />
      <path d="M-10 -20 H70 C92 40 58 100 86 150 C104 190 90 220 100 260 H-10Z" fill="#1d2126" />
      <g stroke="#3a3c40" strokeWidth="0.8" fill="none">
        {lanes.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g stroke="#4a4c51" strokeWidth="2.2" fill="none" strokeLinecap="round">
        {roads.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="#6d6f74" fontSize="9" fontFamily="var(--font-sans)">
        {labels.map((l, i) => (
          <text key={i} x={l.x} y={l.y}>
            {l.n}
          </text>
        ))}
        <text x="16" y="210" fill="#4f5560" fontSize="10" fontStyle="italic">
          Arabian Sea
        </text>
      </g>
    </svg>
  );
}
