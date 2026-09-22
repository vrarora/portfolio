"use client";

import { useEffect, useRef } from "react";
import "./townsquare.css";

const SERVER_ORIGIN = "https://townsquare.cauenapier.com";
const SITE_KEY = "site_RXG29Axg_9zA7MTB";
const MODULE_URL = `${SERVER_ORIGIN}/townsquare.mjs`;
const WIDGET_CSS = `${SERVER_ORIGIN}/widget.css`;
const SITE_CSS = `${SERVER_ORIGIN}/api/sites/${SITE_KEY}/style.css`;

type TownSquareHandle = {
  destroy: () => void;
};

type TownSquareScene = {
  benches: number;
  trees: number;
  lamps: number;
  birds: number;
  benchXs: number[];
  treeXs: number[];
  lampXs: number[];
};

type TownSquareMountOptions = {
  serverOrigin: string;
  siteKey: string;
  theme: "host";
  scene?: TownSquareScene;
};

type TownSquareModule = {
  mountTownSquare: (
    root: HTMLElement,
    options: TownSquareMountOptions,
  ) => TownSquareHandle;
};

// Matches the scene published in TownSquare admin. Inline only on localhost so
// production still receives live scene updates from the hosted hello payload.
const LOCAL_PREVIEW_SCENE: TownSquareScene = {
  benches: 2,
  trees: 1,
  lamps: 1,
  birds: 2,
  benchXs: [0.2, 0.72],
  treeXs: [0.8],
  lampXs: [0.12],
};

function isLocalHost() {
  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function ensureStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadTownSquareModule(): Promise<TownSquareModule> {
  // Bypass the bundler so the hosted ESM URL is imported at runtime.
  const importModule = new Function(
    "url",
    "return import(url)",
  ) as (url: string) => Promise<TownSquareModule>;
  return importModule(MODULE_URL);
}

export function TownSquareEmbed() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let handle: TownSquareHandle | null = null;

    ensureStylesheet(WIDGET_CSS);
    ensureStylesheet(SITE_CSS);

    // Force portfolio palette on the mount node so hosted style.css cannot
    // paint a mismatched action-zone band behind the chat composer.
    const portfolioTokens: Record<string, string> = {
      "--scene": "transparent",
      "--ground-fill": "transparent",
      "--page": "transparent",
      "--action-zone-fill": "transparent",
      "--surface": "#ffffff",
      "--ink": "#000000",
      "--you": "#fd431d",
      "--tree-trunk": "#6b7280",
      "--tree-canopy": "#d1d5db",
      "--other": "#000000",
      "--ground-line": "rgba(0, 0, 0, 0.12)",
      "--ground": "rgba(0, 0, 0, 0.12)",
    };
    for (const [name, value] of Object.entries(portfolioTokens)) {
      root.style.setProperty(name, value);
    }

    void loadTownSquareModule()
      .then((mod) => {
        if (cancelled || !rootRef.current) return;
        const options: TownSquareMountOptions = {
          serverOrigin: SERVER_ORIGIN,
          siteKey: SITE_KEY,
          theme: "host",
        };
        if (isLocalHost()) {
          options.scene = LOCAL_PREVIEW_SCENE;
        }
        const next = mod.mountTownSquare(rootRef.current, options);
        if (cancelled) {
          next.destroy();
          return;
        }
        handle = next;
      })
      .catch(() => {
        // Hosted widget unavailable; leave the mount root empty.
      });

    return () => {
      cancelled = true;
      handle?.destroy();
      handle = null;
    };
  }, []);

  return (
    <section className="townsquare-section" aria-label="TownSquare">
      <div
        id="townsquare-root"
        ref={rootRef}
        className="townsquare-root"
       
      />
    </section>
  );
}
