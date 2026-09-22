"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

const SLUG = /^\/work\/([^/]+)\/?$/;

type SheetState = { vpSheet?: boolean };

/**
 * Sheet open state lives in the URL. Opening pushes /work/<slug>/ with
 * history.pushState (Next syncs usePathname), so Back closes the sheet and
 * a reload lands on the prerendered reading page.
 */
export function useWorkSheetRoute() {
  const pathname = usePathname();
  const router = useRouter();
  const pushed = useRef(false);

  const openSlug = pathname.match(SLUG)?.[1] ?? null;

  const open = useCallback((slug: string) => {
    pushed.current = true;
    window.history.pushState({ vpSheet: true } satisfies SheetState, "", `/work/${slug}/`);
  }, []);

  const close = useCallback(() => {
    const state = window.history.state as SheetState | null;
    if (pushed.current && state?.vpSheet) {
      window.history.back();
    } else {
      router.replace("/work/", { scroll: false });
    }
    pushed.current = false;
  }, [router]);

  return { openSlug, open, close };
}
