"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";

import { records, type ShelfRecord } from "@/content/home";
import { Bloom } from "../Bloom";

/** Projects as records on a shelf: each sleeve lifts and its disc slides out when you reach for it. */
export function Shelf() {
  const [active, setActive] = useState<ShelfRecord | null>(null);

  return (
    <section id="work" className="hm-section hm-shelf" aria-labelledby="hm-shelf-title">
      <h2 id="hm-shelf-title" className="hm-label">
        Projects
      </h2>
      <ul className="hm-records" onMouseLeave={() => setActive(null)}>
        {records.map((record) => (
          <li key={record.id} style={{ "--tilt": `${record.tilt}deg` } as CSSProperties}>
            <Link
              className="hm-record"
              href={record.href}
              onMouseEnter={() => setActive(record)}
              onFocus={() => setActive(record)}
              onBlur={() => setActive(null)}
            >
              <span className="hm-disc" aria-hidden="true">
                <span />
              </span>
              <Bloom name={record.bloom} className={`hm-sleeve hm-sleeve--${record.bloom}`}>
                <span className="hm-sleeve-title">{record.title}</span>
                {record.image ? (
                  <Image className="hm-sleeve-shot" src={record.image} alt="" width={360} height={240} sizes="120px" />
                ) : null}
              </Bloom>
              <span className="v3-sr">
                {record.meta}. {record.line}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {/* A visual echo of the focused link, whose name already carries this text. */}
      <div className="hm-detail" aria-hidden="true">
        {active ? (
          <>
            <strong>{active.title}</strong>
            <span>{active.line}</span>
            <em>{active.meta}</em>
          </>
        ) : null}
      </div>
    </section>
  );
}
