import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { StickerStack } from "@/components/effects/StickerStack";
import { InlineLogo, Reading, Serif } from "@/components/reading/Reading";
import { EMAIL, about, logos } from "@/content/about";
import { siteLinks } from "@/content/site-links";
import { CopyEmailButton } from "./CopyEmailButton";

export function Intro() {
  return (
    <section className="home-intro" aria-labelledby="intro-name">
      <div className="home-byline">
        <StickerStack>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/me-64.webp"
            srcSet="/images/me-64.webp 1x, /images/me-96.webp 1.5x"
            alt=""
            width={32}
            height={32}
            decoding="async"
            fetchPriority="high"
          />
        </StickerStack>
        <div className="home-byline-text">
          <h1 id="intro-name">{about.name}</h1>
          <p className="home-role">{about.role}</p>
        </div>
      </div>

      <Reading className="home-intro-copy">
        <p>
          I&apos;m Vaibhav, a product designer at <InlineLogo {...logos.idfy} />. I work on Privy, a suite that
          helps companies find personal data, govern it, and stay ahead of India&apos;s privacy law. Most days that
          means making dense systems <Serif>navigable</Serif>.
        </p>
        <p>
          Previously I designed EqualAll at <InlineLogo {...logos.ketto} />, a donation platform for Western donors,
          and worked on mental health products at <InlineLogo {...logos.wysa} />. I ship <Serif>in code</Serif> with
          AI agents, which is how this site and its experiments were built.
        </p>
        <p>
          You can reach me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, or find me on{" "}
          <a href={siteLinks.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>{" "}
          and{" "}
          <a href={siteLinks.twitter} target="_blank" rel="noreferrer">
            X
          </a>
          . If you&apos;d rather not wait, the assistant answers in my voice, and I read every note left on the
          wall.
        </p>
      </Reading>

      <div className="home-actions">
        <CopyEmailButton email={EMAIL} />
        <a className="home-btn" href={siteLinks.resume} target="_blank" rel="noreferrer">
          <span>Resume</span>
          <ArrowUpRight size={14} weight="bold" />
        </a>
      </div>
    </section>
  );
}
