"use client";

import { Clock } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

/** His local time. Checked every 15s so the minute turns over on time; empty on the server so hydration agrees. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const label = now
    ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: "short" }).format(now)
    : "";

  return (
    <>
      <Clock size={14} aria-hidden="true" />
      <time dateTime={now?.toISOString()} className="hm-time">
        {label}
      </time>
    </>
  );
}
