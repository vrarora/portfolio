import type { CSSProperties, ReactNode } from "react";

import { BLOOMS, type BloomName } from "@/content/home";

type Props = {
  name: BloomName;
  /** Let the lights drift slowly. Off by default, since many blooms can share a screen. */
  live?: boolean;
  className?: string;
  children?: ReactNode;
};

/** Three soft lights over a base colour, blurred together. Pure CSS, so it costs no script. */
export function Bloom({ name, live = false, className, children }: Props) {
  const b = BLOOMS[name];
  const style = { "--b-base": b.base, "--b-a": b.a, "--b-b": b.b, "--b-c": b.c } as CSSProperties;
  return (
    <div className={["bloom", live ? "bloom--live" : "", className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}
