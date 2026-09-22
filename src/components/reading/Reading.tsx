"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/prefersReducedMotion";
import { registerLine } from "./scrollDriver";
import type { Band } from "./scrollDriver";

import "./reading.css";

export type ReadingProps = {
  band?: Band;
  lock?: "once" | "live";
  className?: string;
  children: ReactNode;
};

const DEFAULT_BAND: Band = { center: 0.42, height: 0.22 };

type Token = { key: string; node: ReactNode; atom: boolean };

/** Splits paragraph children into word tokens; elements stay whole. */
function tokenize(children: ReactNode): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const push = (node: ReactNode, atom: boolean) => tokens.push({ key: `t${i++}`, node, atom });

  const walk = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (child === null || child === undefined || typeof child === "boolean") return;
      if (typeof child === "string" || typeof child === "number") {
        const parts = String(child).split(/(\s+)/);
        for (let p = 0; p < parts.length; p += 2) {
          const word = parts[p];
          const space = parts[p + 1] ?? "";
          if (word === "" && space === "") continue;
          if (word === "") {
            // Leading whitespace attaches to the previous token.
            const prev = tokens[tokens.length - 1];
            if (prev && !prev.atom && typeof prev.node === "string") prev.node = `${prev.node}${space}`;
            else push(space, false);
            continue;
          }
          push(word + space, false);
        }
        return;
      }
      if (isValidElement(child) && child.type === Fragment) {
        walk((child.props as { children?: ReactNode }).children);
        return;
      }
      push(child, true);
    });
  };

  walk(children);
  return tokens;
}

type ParagraphProps = {
  band: Band;
  lockOnce: boolean;
  enabled: boolean;
  element: ReactElement<{ children?: ReactNode; className?: string }>;
};

function ReadingParagraph({ band, lockOnce, enabled, element }: ParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const tokens = useRef<Token[]>([]);
  const [lines, setLines] = useState<number[][] | null>(null);
  const [fallback, setFallback] = useState(false);
  const measuredHeight = useRef(0);
  const [generation, setGeneration] = useState(0);

  const props = element.props;
  tokens.current = tokenize(props.children);

  const resplit = useCallback(() => {
    setLines(null);
    setFallback(false);
    setGeneration((g) => g + 1);
  }, []);

  // Phase 1: measure token offsets and group into lines.
  useLayoutEffect(() => {
    if (!enabled || lines !== null) return;
    const p = ref.current;
    if (!p) return;
    const spans = Array.from(p.querySelectorAll<HTMLElement>(":scope > .rt"));
    measuredHeight.current = p.getBoundingClientRect().height;
    const grouped: number[][] = [];
    let lastTop: number | null = null;
    spans.forEach((span, index) => {
      const top = span.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        grouped.push([index]);
        lastTop = top;
      } else {
        grouped[grouped.length - 1].push(index);
      }
    });
    setLines(grouped);
  }, [enabled, lines, generation]);

  // Phase 2: verify the grouped render did not re-wrap.
  useLayoutEffect(() => {
    if (!enabled || lines === null || fallback) return;
    const p = ref.current;
    if (!p) return;
    const height = p.getBoundingClientRect().height;
    if (Math.abs(height - measuredHeight.current) > 1) setFallback(true);
  }, [enabled, lines, fallback]);

  // Re-split on width change and once fonts settle.
  useEffect(() => {
    if (!enabled) return;
    const p = ref.current;
    if (!p) return;
    let width = p.getBoundingClientRect().width;
    let raf = 0;
    const observer = new ResizeObserver(() => {
      const next = p.getBoundingClientRect().width;
      if (Math.abs(next - width) < 1) return;
      width = next;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(resplit);
    });
    observer.observe(p);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) resplit();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, resplit]);

  const renderToken = (token: Token) => (
    <span key={token.key} className={token.atom ? "rt rt-atom" : "rt"}>
      {token.node}
    </span>
  );

  const className = ["reading-p", props.className].filter(Boolean).join(" ");

  if (!enabled) {
    return (
      <p className={`${className} is-static`}>
        <span className="reading-line is-line-active is-line-past">{tokens.current.map(renderToken)}</span>
      </p>
    );
  }

  if (lines === null) {
    return (
      <p ref={ref} className={className} data-measuring="">
        {tokens.current.map(renderToken)}
      </p>
    );
  }

  const groups = fallback ? [tokens.current.map((_, i) => i)] : lines;

  return (
    <p ref={ref} className={className}>
      {groups.map((group, li) => (
        <ReadingLine key={`${generation}-${li}`} band={band} lockOnce={lockOnce}>
          {group.map((i) => tokens.current[i]).filter(Boolean).map(renderToken)}
        </ReadingLine>
      ))}
    </p>
  );
}

function ReadingLine({ band, lockOnce, children }: { band: Band; lockOnce: boolean; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerLine(el, band, lockOnce);
  }, [band, lockOnce]);
  return (
    <span ref={ref} className="reading-line">
      {children}
    </span>
  );
}

/**
 * Wraps paragraphs so each visual line darkens as it enters the reading
 * band. Children must be <p> elements; other nodes render untouched.
 */
export function Reading({ band = DEFAULT_BAND, lock = "once", className, children }: ReadingProps) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const enabled = mounted && !reduced;

  return (
    <div className={["reading", enabled ? "" : "is-static", className].filter(Boolean).join(" ")}>
      {Children.map(children, (child) => {
        if (isValidElement(child) && child.type === "p") {
          return (
            <ReadingParagraph
              band={band}
              lockOnce={lock === "once"}
              enabled={enabled}
              element={child as ReactElement<{ children?: ReactNode; className?: string }>}
            />
          );
        }
        return child;
      })}
    </div>
  );
}

export { Serif, Blur, Tag, InlineLogo, LogoStack } from "./Treatments";
