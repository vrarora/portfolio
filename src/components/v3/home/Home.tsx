import { SkyLayer } from "@/components/effects/SkyLayer";
import { SoundToggle } from "../SoundToggle";
import { DeskScene } from "./desk/DeskScene";
import { FindMe } from "./FindMe";
import { CardFooter } from "./footer/CardFooter";
import { Contact } from "./footer/Contact";
import { Hero } from "./Hero";
import { Shelf } from "./Shelf";
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
        <div className="hm-col">
          <Hero />
          <WhoIAm />
          <Statement />
          <UpTo />
          <Shelf />
          <FindMe />
        </div>
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
