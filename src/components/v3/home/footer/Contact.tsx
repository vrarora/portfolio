import { EMAIL } from "@/content/about";
import { SkyScrub } from "./SkyScrub";

/** The sky under the page: revealed as the card scrolls away, with a way to write to him. */
export function Contact() {
  return (
    <section id="footer" className="hm-contact" aria-label="Get in touch">
      <p className="hm-contact-copy">
        <a href={`mailto:${EMAIL}`}>Get in touch</a>
        <span> if you want to build something together, or just say hi.</span>
      </p>
      <SkyScrub />
    </section>
  );
}
