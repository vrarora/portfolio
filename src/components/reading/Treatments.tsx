import type { ReactNode } from "react";

/** Instrument Serif italic accent. At most three words per screen. */
export function Serif({ children }: { children: ReactNode }) {
  return <span className="rt-serif t-serif">{children}</span>;
}

/** Text that stays soft until its line is read. */
export function Blur({ children }: { children: ReactNode }) {
  return <span className="rt-blur">{children}</span>;
}

/** Small bordered pill with corner dots. */
export function Tag({ children }: { children: ReactNode }) {
  return <span className="rt-tag">{children}</span>;
}

export type InlineLogoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Rendered height in px. Defaults to 16. */
  size?: number;
};

/** A company wordmark that stands in for the company's name inside a sentence. */
export function InlineLogo({ src, alt, width, height, size = 15 }: InlineLogoProps) {
  const w = Math.round((width / height) * size);
  return (
    <span className="rt-logo" style={{ width: w, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={size} loading="eager" decoding="async" />
    </span>
  );
}

export type StackLogo = { src: string; alt: string };

/** Up to three small marks that sit stacked and fan out once their line is read. */
export function LogoStack({ logos }: { logos: StackLogo[] }) {
  const shown = logos.slice(0, 3);
  return (
    <span className="rt-logos" style={{ ["--n" as string]: shown.length }} aria-label={shown.map((l) => l.alt).join(", ")}>
      {shown.map((logo, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={logo.alt} src={logo.src} alt="" width={16} height={16} style={{ ["--i" as string]: i }} />
      ))}
    </span>
  );
}
