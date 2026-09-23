"use client";

import { useEffect } from "react";

/**
 * Client redirect for retired routes; the static export has no server
 * redirects. A full navigation lets the browser scroll to the anchor.
 */
export function RedirectHome({ hash }: { hash: string }) {
  useEffect(() => {
    window.location.replace(`/#${hash}`);
  }, [hash]);
  return null;
}
