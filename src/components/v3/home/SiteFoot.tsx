import Link from "next/link";

import { EMAIL } from "@/content/about";

export function SiteFoot() {
  return (
    <footer className="hm-foot hm-col">
      <p>Vaibhav Arora</p>
      <nav aria-label="Elsewhere">
        <Link href="/story/">Story</Link>
        <Link href="/playground/">Playground</Link>
        <a href={`mailto:${EMAIL}`}>Email</a>
      </nav>
    </footer>
  );
}
