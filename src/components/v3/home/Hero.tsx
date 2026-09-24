"use client";

import { EnvelopeSimple, FileText, MapPin } from "@phosphor-icons/react";
import Image from "next/image";

import { EMAIL } from "@/content/about";
import { hero } from "@/content/home";
import { siteLinks } from "@/content/site-links";
import { CopyButton } from "./hero/CopyButton";
import { HoverCard } from "./hero/HoverCard";
import { MapArt } from "./hero/MapArt";
import { WorldClock } from "./hero/WorldClock";
import { LocalTime } from "./LocalTime";

/** A stamp, a name, and where and when he is; each detail opens a card on hover. */
export function Hero() {
  return (
    <header className="hm-hero">
      <div className="hm-stamp">
        <span className="hm-stamp-paper">
          <Image src="/images/me-96.webp" alt="" width={60} height={60} priority />
        </span>
      </div>
      <div className="hm-id">
        <h1 className="hm-name">{hero.name}</h1>
        <ul className="hm-meta">
          <li>
            <HoverCard
              tapToggle
              align="start"
              className="hc-map"
              trigger={(props) => (
                <button type="button" className="hm-trigger" {...props}>
                  <MapPin size={14} aria-hidden="true" />
                  {hero.location}
                </button>
              )}
            >
              <span className="hc-map-art">
                <MapArt />
                <span className="hc-pin" aria-hidden="true">
                  <span className="hc-pin-ring" />
                  <Image src="/images/me-96.webp" alt="" width={48} height={48} />
                </span>
              </span>
              <span className="hc-caption">{hero.city}</span>
            </HoverCard>
          </li>
          <li>
            <HoverCard
              tapToggle
              className="hc-clock"
              trigger={(props) => (
                <button type="button" className="hm-trigger" {...props}>
                  <LocalTime timeZone={hero.timeZone} />
                </button>
              )}
            >
              <WorldClock />
            </HoverCard>
          </li>
          <li>
            <HoverCard
              align="end"
              interactive
              label="Email"
              className="hc-email"
              trigger={(props) => (
                <a className="hm-icon" href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`} {...props}>
                  <EnvelopeSimple size={16} aria-hidden="true" />
                </a>
              )}
            >
              <span>
                Email <span className="hc-muted">{EMAIL}</span>
              </span>
              <CopyButton value={EMAIL} fallbackHref={`mailto:${EMAIL}`} />
            </HoverCard>
          </li>
          <li>
            <HoverCard
              align="end"
              interactive
              label="Resume preview"
              className="hc-resume"
              trigger={(props) => (
                <a className="hm-icon" href={siteLinks.resume} target="_blank" rel="noreferrer" aria-label="Resume" {...props}>
                  <FileText size={16} aria-hidden="true" />
                </a>
              )}
            >
              {/* Drive serves the preview, so it stays in step with the shared PDF. */}
              <img className="hc-resume-page" src={siteLinks.resumePreview} alt="First page of Vaibhav's resume" width={360} height={466} referrerPolicy="no-referrer" />
              <a className="hc-resume-row" href={siteLinks.resumeDownload}>
                <span>Download resume</span>
                <span className="hc-muted">PDF</span>
              </a>
            </HoverCard>
          </li>
        </ul>
      </div>
    </header>
  );
}
