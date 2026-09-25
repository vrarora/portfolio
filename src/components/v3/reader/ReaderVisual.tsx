"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import { isVisualType, visualRegistry } from "@/components/case-study/visualRegistry";
import type { CaseStudy } from "@/content/case-studies";

type Metrics = CaseStudy["sections"][number]["metrics"];

const PenFigure = dynamic(() => import("@/components/v3/board/PenFigure").then((m) => m.PenFigure), { ssr: false, loading: () => null });

/** A `pen:<figure>` type crops a diagram from the Agentic Design board. */
const PEN = "pen:";

/** Visuals load lazily on the client, so this is the one piece of the page that must be a client component. */
export function ReaderVisual({ type, metrics }: { type: string; metrics?: Metrics }) {
  if (type.startsWith(PEN)) return <PenFigure story="agentic-design" id={type.slice(PEN.length)} />;
  if (!isVisualType(type)) return null;
  const Component = visualRegistry[type] as ComponentType<{ metrics?: Metrics }>;
  return <Component metrics={metrics} />;
}
