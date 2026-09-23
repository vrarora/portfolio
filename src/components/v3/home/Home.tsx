import { Bloom } from "../Bloom";
import { Hero } from "./Hero";
import { Narrative } from "./Narrative";
import { Shelf } from "./Shelf";
import { SiteFoot } from "./SiteFoot";
import "./home.css";

export function Home() {
  return (
    <main className="hm">
      <Bloom name="dusk" live className="hm-bloom" />
      <Hero />
      <Narrative />
      <Shelf />
      <SiteFoot />
    </main>
  );
}
