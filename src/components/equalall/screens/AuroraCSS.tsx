"use client";

/** Warm iridescence for the thank-you peak — pure CSS layers, transform-only
 * animation. Always used inside embeds; the mockup route upgrades to the
 * WebGL shader when available. */
export function AuroraCSS() {
  return (
    <div className="ea-aurora" aria-hidden="true">
      <span className="ea-aurora-blob ea-aurora-a" />
      <span className="ea-aurora-blob ea-aurora-b" />
      <span className="ea-aurora-blob ea-aurora-c" />
    </div>
  );
}
