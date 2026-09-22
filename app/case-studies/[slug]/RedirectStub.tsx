"use client";

import { useEffect } from "react";

export function RedirectStub({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}
