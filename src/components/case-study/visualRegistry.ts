import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { OutcomeMetric } from "./visuals/OutcomeImpactVisual";

type Loader<P> = () => Promise<{ default: ComponentType<P> }>;

function lazy<P extends object>(loader: Loader<P>) {
  return dynamic(loader, { ssr: false, loading: () => null }) as ComponentType<P>;
}

const equalAll = (experiment: "anchor" | "impact" | "tangible" | "carousel" | "recurring") =>
  lazy<Record<string, never>>(() =>
    import("./visuals/EqualAllExperimentVisual").then((m) => ({
      default: () => m.EqualAllExperimentVisual({ experiment }),
    })),
  );

/**
 * Maps a content `visualType` to a lazily loaded component. Each visual is its
 * own chunk, so /work downloads one only when its case study opens.
 */
export const visualRegistry = {
  "fragmented-landscape": lazy(() => import("./visuals/DataStreamVisual")),
  "flat-list-mockup": lazy(() => import("./visuals/FlatListMockup")),
  "hierarchy-explorer": lazy(() => import("./visuals/HierarchyExplorer")),
  "inspector-explorer": lazy(() => import("./visuals/InspectorExplorer")),
  "scan-workflow": lazy(() => import("./visuals/ScanWorkflowVisual")),
  "onboarding-flow": lazy(() => import("./visuals/OnboardingFlowVisual")),
  "outcome-impact": lazy<{ metrics?: OutcomeMetric[] }>(() => import("./visuals/OutcomeImpactVisual")),
  "equalall-context-gap": lazy(() => import("./visuals/EqualAllContextGapVisual")),
  "equalall-fading-feeling": lazy(() => import("./visuals/EqualAllFadingFeelingVisual")),
  "equalall-anchor": equalAll("anchor"),
  "equalall-impact": equalAll("impact"),
  "equalall-tangible": equalAll("tangible"),
  "equalall-carousel": equalAll("carousel"),
  "equalall-recurring": equalAll("recurring"),
  "designrepo-playbook": lazy(() => import("./visuals/DesignRepoPlaybookCards")),
  "designrepo-contrast": lazy(() => import("./visuals/DesignRepoContrastVisual")),
  "designrepo-loop": lazy(() => import("./visuals/DesignRepoLoopVisual")),
  "designrepo-pipeline": lazy(() => import("./visuals/DesignRepoPipelineVisual")),
  "designrepo-demo": lazy(() => import("./visuals/DesignRepoDemoVisual")),
} as const;

export type VisualType = keyof typeof visualRegistry;

export function isVisualType(value: string | undefined): value is VisualType {
  return value !== undefined && value in visualRegistry;
}
