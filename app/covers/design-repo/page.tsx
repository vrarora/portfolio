import type { Metadata } from "next";

/**
 * Capture-only route for the design-repo cover asset (home card + case hero).
 * Not linked from anywhere and excluded from indexing; the shipped artifact is
 * public/images/design-repo/design-repo-cover.webp, baked by
 * scripts/capture-designrepo-cover.mjs against the production build.
 *
 * Concept (Vaibhav's reference, July 6): a calm chrome-less git graph on the
 * portfolio's light canvas — several colored branches forking off and merging
 * back into main, bookended by "design → iterate" and "→ developers pull from
 * main". The graph alone narrates the case: design happens on branches, main
 * is the published design, a pull is the handoff.
 *
 * Two variants render on this page: with a Figma-style multiplayer cursor on
 * the exploration branch ("cursor", the default bake) and without ("plain"),
 * so both can be captured and compared.
 */

export const metadata: Metadata = {
  title: "Design repo cover capture",
  robots: { index: false, follow: false },
};

function GraphCover({ cursor }: { cursor: boolean }) {
  return (
    <div className="drcov-canvas" data-drcov-canvas={cursor ? "cursor" : "plain"}>
      <svg className="drcov-graph" viewBox="0 0 1180 900" fill="none" aria-hidden="true">
        {/* main line, broken for the inline label */}
        <text className="drcov-mono" x="60" y="437" fontSize="18" fill="#4b5563">
          design → iterate
        </text>
        <path d="M250 430 H630" stroke="#a5adba" strokeWidth="3" />
        <text className="drcov-mono" x="790" y="437" fontSize="18" fill="#4b5563" textAnchor="middle">
          main · the published design
        </text>
        <path d="M950 430 H1120" stroke="#a5adba" strokeWidth="3" />
        <text className="drcov-mono" x="1120" y="386" fontSize="18" fill="#4b5563" textAnchor="end">
          → developers pull from main
        </text>

        {/* fork annotations */}
        <text className="drcov-mono" x="288" y="404" fontSize="13" fill="#98a2b3" textAnchor="end">
          explore here
        </text>
        <text className="drcov-mono" x="288" y="464" fontSize="13" fill="#98a2b3" textAnchor="end">
          safe to break
        </text>

        {/* branch: ananya/lineage-redesign (blue, above) */}
        <path
          d="M300 430 C336 430 344 300 400 300 H500 C556 300 564 430 600 430"
          stroke="#2272b4"
          strokeWidth="3"
        />
        <text className="drcov-mono" x="450" y="268" fontSize="18" fill="#2272b4" textAnchor="middle">
          ananya/lineage-redesign
        </text>

        {/* branch: vaibhav/scan-queue (amber, below) */}
        <path
          d="M300 430 C336 430 344 530 400 530 H500 C556 530 564 430 600 430"
          stroke="#c9891b"
          strokeWidth="3"
        />
        <text className="drcov-mono" x="450" y="576" fontSize="18" fill="#c9891b" textAnchor="middle">
          vaibhav/scan-queue
        </text>

        {/* branch: exploration (green, wide sweep, merges later) */}
        <path
          d="M300 430 C350 430 360 650 460 650 H860 C960 650 940 430 1020 430"
          stroke="#2da06c"
          strokeWidth="3"
        />
        <text className="drcov-mono" x="660" y="694" fontSize="18" fill="#2da06c" textAnchor="middle">
          exploration
        </text>

        {/* fork + merge dots (gray) and commit dots (branch colors) */}
        <circle cx="300" cy="430" r="7" fill="#8b93a7" stroke="#ffffff" strokeWidth="3" />
        <circle cx="600" cy="430" r="7" fill="#8b93a7" stroke="#ffffff" strokeWidth="3" />
        <circle cx="1020" cy="430" r="7" fill="#8b93a7" stroke="#ffffff" strokeWidth="3" />
        <circle cx="450" cy="300" r="7" fill="#2272b4" stroke="#ffffff" strokeWidth="3" />
        <circle cx="450" cy="530" r="7" fill="#c9891b" stroke="#ffffff" strokeWidth="3" />
        <circle cx="660" cy="650" r="7" fill="#2da06c" stroke="#ffffff" strokeWidth="3" />
      </svg>

      {cursor && (
        <span className="drcov-cursor" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M5 3l14 8-6.6 1.5L9 19 5 3z" fill="#e0559a" stroke="#ffffff" strokeWidth="1.6" />
          </svg>
          <span className="drcov-cursor-pill">ananya</span>
        </span>
      )}
    </div>
  );
}

export default function DesignRepoCoverPage() {
  return (
    <main className="drcov-page">
      <GraphCover cursor />
      <GraphCover cursor={false} />
    </main>
  );
}
