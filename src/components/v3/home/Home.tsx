import { SkyLayer } from "@/components/effects/SkyLayer";
import { SoundToggle } from "../SoundToggle";
import { DeskScene } from "./desk/DeskScene";
import { FindMe } from "./FindMe";
import { CardFooter } from "./footer/CardFooter";
import { Contact } from "./footer/Contact";
import { Hero } from "./Hero";
import { Projects } from "./Projects";
import { ScrollBlurColumn } from "./ScrollBlurColumn";
import { Statement } from "./statement/Statement";
import { UpTo } from "./UpTo";
import { WhoIAm } from "./WhoIAm";
import "@/components/effects/effects.css";
import "./home.css";

export function Home() {
  return (
    <main className="hm">
      {/* The live sky sits behind everything: it edges the card, then opens up below it. */}
      <SkyLayer />
      <div className="hm-sheet">
        <ScrollBlurColumn>
          <Hero />
          <WhoIAm />
          <Statement />
          <UpTo />
          <Projects />
          <FindMe />
        </ScrollBlurColumn>
        <DeskScene />
        <CardFooter />
      </div>
      <Contact />
      <div className="v3-controls">
        <SoundToggle />
      </div>
    </main>
  );
}
