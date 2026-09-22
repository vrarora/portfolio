import { LeafShadow } from "@/components/effects/LeafShadow";
import { NotesWallSection } from "@/components/notes/NotesWallSection";
import { Intro } from "./Intro";
import { Opinion } from "./Opinion";
import { UpTo } from "./UpTo";
import { WorkSection } from "./WorkSection";
import { WritingList } from "./WritingList";

import "./home.css";

export function HomePage() {
  return (
    <div className="home">
      <div className="home-hero-wrap">
        <LeafShadow />
        <div className="home-col">
          <Intro />
          <UpTo />
        </div>
      </div>
      <div className="home-col">
        <Opinion />
        <WorkSection />
        <WritingList id="writing" />
        <NotesWallSection />
      </div>
    </div>
  );
}
