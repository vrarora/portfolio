import { EnvelopeSimple, MapPin } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { EMAIL } from "@/content/about";
import { hero } from "@/content/home";
import { LocalTime } from "./LocalTime";

/** A stamp, a name, and where and when he is. */
export function Hero() {
  return (
    <header className="hm-hero hm-col">
      <div className="hm-stamp">
        <span className="hm-stamp-paper">
          <Image src="/images/me-96.webp" alt="" width={84} height={84} priority />
        </span>
      </div>
      <div className="hm-id">
        <div>
          <h1 className="hm-name">{hero.name}</h1>
          <p className="hm-role">{hero.role}</p>
        </div>
        <ul className="hm-meta">
          <li>
            <MapPin size={14} aria-hidden="true" />
            {hero.location}
          </li>
          <li>
            <LocalTime timeZone={hero.timeZone} />
          </li>
          <li>
            <a className="hm-icon" href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
              <EnvelopeSimple size={16} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
