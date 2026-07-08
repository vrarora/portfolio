import type { PlaygroundNode } from "@/content/playground";

/** Hover overlay size the dot grows into. */
export const HBOX_W = 236;
export const HBOX_H = 150;
/** The hover box floats this far above the dot. */
export const HBOX_DOT_OFFSET = 14;

export const ZOOM_MIN = 0.72;
export const ZOOM_MAX = 1.35;

export type NodeRuntime = {
  data: PlaygroundNode;
  el: HTMLElement;
  thumbEl: HTMLVideoElement | HTMLImageElement;
  /** Drift oscillator: amplitudes, frequencies, phases. */
  fl: { ax: number; ay: number; fx: number; fy: number; px: number; py: number };
  /** Anchor: where the dot currently sits (display space). */
  ax: number;
  ay: number;
  /** Thread endpoint (snaps to the stage centre for the central node). */
  sx: number;
  sy: number;
  /** Smoothed display position. */
  dx: number;
  dy: number;
  /** Magnetic hover ease, 0..1. */
  m: number;
  /** Drag offset in base (unzoomed) space. */
  ox: number;
  oy: number;
  /** Current scale, read by hit testing. */
  sc: number;
  /** True once the preview src has been assigned (first hover). */
  thumbLoaded: boolean;
};

export type StageGeometry = { x: number; y: number; w: number; h: number };

export type DustParticle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
};

export type ThreadParticle = {
  off: number;
  spd: number;
  amp: number;
  ph: number;
  freq: number;
  size: number;
  a0: number;
};

export type ThreadEdge = { a: NodeRuntime; b: NodeRuntime; parts: ThreadParticle[] };

export type EngineState = {
  W: number;
  H: number;
  dpr: number;
  zoom: number;
  zoomTarget: number;
  mouse: { x: number; y: number; ex: number; ey: number };
  nodes: NodeRuntime[];
  edges: ThreadEdge[];
  dust: DustParticle[];
  /** Field content band (below the intro, above the HUD). */
  fieldTop: number;
  fieldBottom: number;
  fieldHeight: number;
  fieldCenterY: number;
  /** Currently open node. */
  active: NodeRuntime | null;
  /** Node owning the stage: the active one, or the one the stage flies back to. */
  central: NodeRuntime | null;
  closing: boolean;
  stageVisible: boolean;
  /** Stage geometry, lerped toward its target each frame. */
  sg: StageGeometry;
  /** Stage grow progress 0..1 and node/stage crossfade 0..1 for this frame. */
  p: number;
  cf: number;
  hovered: NodeRuntime | null;
  /** The one preview video currently playing. */
  playingThumb: HTMLVideoElement | null;
  drag: {
    candidate: NodeRuntime | null;
    node: NodeRuntime | null;
    startX: number;
    startY: number;
    grabDX: number;
    grabDY: number;
    suppressClick: NodeRuntime | null;
    pointerId: number | null;
  };
  pinch: {
    pointers: Map<number, { x: number; y: number }>;
    startDist: number;
    startZoom: number;
  };
  reducedMotion: boolean;
  coarsePointer: boolean;
  /** Drift clock origin; rebased when the tab returns from hidden. */
  t0: number;
};

export type EngineApi = {
  open: (id: string) => void;
  close: () => void;
  step: (dir: 1 | -1) => void;
  togglePlay: () => void;
};
