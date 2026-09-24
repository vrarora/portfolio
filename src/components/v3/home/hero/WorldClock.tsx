"use client";

import { useEffect, useState } from "react";

const CITIES = [
  { name: "San Francisco", zone: "America/Los_Angeles" },
  { name: "New York", zone: "America/New_York" },
  { name: "London", zone: "Europe/London" },
  { name: "Paris", zone: "Europe/Paris" },
  { name: "Dubai", zone: "Asia/Dubai" },
  { name: "Mumbai", zone: "Asia/Kolkata", home: true },
  { name: "Singapore", zone: "Asia/Singapore" },
  { name: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Sydney", zone: "Australia/Sydney" },
] as const;

/** His time against the rest of the world; his own row is lit. */
export function WorldClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="wc">
      <span className="wc-head">
        <span>Around the world</span>
        <span className="wc-muted">Right now</span>
      </span>
      {CITIES.map((city) => {
        const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: city.zone }).format(now);
        const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: city.zone }).format(now);
        return (
          <span key={city.name} className="wc-row" data-home={"home" in city ? "" : undefined}>
            <span>{city.name}</span>
            <span className="wc-muted">{day}</span>
            <span className="wc-time">{time}</span>
          </span>
        );
      })}
    </span>
  );
}
