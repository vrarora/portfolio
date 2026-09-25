/** Every case study told as a board, by slug. */
import type { Anchors } from "../kit";
import type { Script } from "../timeline";
import { buildAgenticDesign } from "./agentic-design";
import { buildScript as buildDataAtlas } from "./data-atlas";

type Story = {
  /** Product name, used to label snapshot frames for assistive tech. */
  name: string;
  build: (anchors: Anchors) => Script;
  /** Viewport heights of scroll per timeline unit. */
  pace: number;
};

export const STORIES = {
  "data-atlas": { name: "Data Atlas", build: buildDataAtlas, pace: 0.7 },
  "agentic-design": { name: "Agentic Design", build: () => buildAgenticDesign(), pace: 0.4 },
} satisfies Record<string, Story>;

export type StoryId = keyof typeof STORIES;

export const isStory = (slug: string): slug is StoryId => slug in STORIES;
