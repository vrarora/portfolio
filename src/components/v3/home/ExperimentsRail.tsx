import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { playgroundNodes } from "@/content/playground";
import { ReaderMedia } from "../reader/ReaderMedia";

/** Every clip shares one height; its width follows its own shape. */
const CLIP_HEIGHT = 200;
const MIN_WIDTH = 184;

/** The experiments shown here, in order. The playground page still lists them all. */
const RAIL = ["east-is-up", "koyomi", "memento-mori", "atmos", "rolling-paper"];
const railNodes = RAIL.flatMap((id) => playgroundNodes.filter((node) => node.id === id));

/**
 * The side projects behind "small experiments", after jaksenc.com/about: a row
 * of dark cards that scrolls sideways under the sentence that opened it. Each
 * clip plays while it is on screen, and a card opens its live build.
 */
export function ExperimentsRail({ id }: { id: string }) {
  return (
    <div id={id} className="hm-rail" role="region" aria-label="Small experiments" data-scroll-blur>
      <ul className="hm-rail-track">
        {railNodes.map((node) => (
          <li key={node.id} style={{ width: Math.max(MIN_WIDTH, Math.round(CLIP_HEIGHT * node.aspectRatio)) }}>
            <a className="hm-rail-card" href={node.liveUrl}>
              <span className="hm-rail-clip">
                <ReaderMedia
                  className="hm-rail-media"
                  media={{ src: node.src, poster: node.poster, alt: `${node.title}, ${node.blurb.toLowerCase()}` }}
                />
              </span>
              <span className="hm-rail-caption">
                <span className="hm-rail-name">{node.title}</span>
                {node.category}
              </span>
            </a>
          </li>
        ))}
        <li style={{ width: MIN_WIDTH }}>
          <a className="hm-rail-card hm-rail-more" href="/playground/">
            <span>See them all in the playground</span>
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  );
}
