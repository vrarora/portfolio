"use client";

import type { ComponentType } from "react";

import { isVisualType, visualRegistry } from "@/components/case-study/visualRegistry";
import type { CaseStudy } from "@/content/case-studies";

type Metrics = CaseStudy["sections"][number]["metrics"];

/** Visuals load lazily on the client, so this is the one piece of the page that must be a client component. */
export function ReaderVisual({ type, metrics }: { type: string; metrics?: Metrics }) {
  if (!isVisualType(type)) return null;
  const Component = visualRegistry[type] as ComponentType<{ metrics?: Metrics }>;
  return <Component metrics={metrics} />;
}
