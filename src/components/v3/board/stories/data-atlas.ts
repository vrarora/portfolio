/**
 * The Data Atlas story as a board script. The board is a grid of cells;
 * the camera visits them in order while the pen writes and annotates the
 * product snapshots placed inside them.
 */
import { arrow, bracket, circle, scribble, strike, underline, type Rect } from "../marks";
import { penText } from "../pen/text";
import { CELL_H, CELL_W, CHROME, GAP, SNAP_H, SNAP_W, cell, createKit, fitSize, focus, pad, union, type Anchors } from "../kit";
import type { Frame, Script } from "../timeline";

const FONT = "excalifont";

export function buildScript(anchors: Anchors): Script {
  const { ink, write, frame, cam, draw, show, hold, nextSeed, finish } = createKit(FONT);

  /** World rect of a named element in a snapshot, placed in its frame. */
  const at = (f: Frame, snap: string, name: string, fallback: Rect): Rect => {
    const r = anchors[snap]?.anchors[name];
    if (!r && process.env.NODE_ENV !== "production") console.warn(`[board] missing anchor ${snap}.${name}`);
    const box = r ?? fallback;
    return { x: f.x + box.x, y: f.y + CHROME + box.y, w: box.w, h: box.h };
  };

  const frameRect = (f: Frame): Rect => ({ x: f.x, y: f.y, w: SNAP_W, h: SNAP_H + CHROME });

  /** Right-hand margin beside a frame, where notes go. */
  const margin = (f: Frame) => f.x + SNAP_W + 70;

  // 1. The reader's shoes

  const c1 = cell(0, 0);
  const openCopy = [
    "You run InfoSec at a fintech.",
    "Customer data sits across dozens of databases and buckets.",
    "Do you know where every Aadhaar and PAN is?",
    "Under the DPDP Act, one breach can cost up to ₹250 crore.",
  ];
  const openSize = fitSize(openCopy.reduce((a, b) => (b.length > a.length ? b : a)), CELL_W - 200, 92, FONT);
  const openBoxes = openCopy.map((line, i) => write(`open-${i}`, line, c1.x + 100, c1.y + 220 + i * openSize * 1.9, openSize));
  const openArea: Rect = { x: c1.x, y: c1.y + 100, w: CELL_W, h: openBoxes[3].y + openBoxes[3].h - c1.y };

  cam(openArea, 0.01);
  hold(0.4);
  openCopy.forEach((_, i) => draw(`open-${i}`));
  hold(0.5);

  // 2. The problem

  const c2 = cell(0, 1);
  const problemCopy = [
    "Data Atlas finds that data for you.",
    "The backend worked, but the frontend ignored the people using it.",
    "Then a bank asked for a POC, starting in two weeks.",
  ];
  const problemSize = fitSize(problemCopy[1], CELL_W - 200, 92, FONT);
  problemCopy.forEach((line, i) => write(`problem-${i}`, line, c2.x + 100, c2.y + 320 + i * problemSize * 1.9, problemSize));
  const twoWeeks = penText(problemCopy[2], problemSize, 0, 0, FONT);
  ink("problem-underline", "red", underline({ x: c2.x + 100 + twoWeeks.width * 0.72, y: c2.y + 320 + 2 * problemSize * 1.9, w: twoWeeks.width * 0.28, h: problemSize * 0.9 }, nextSeed()), 4);

  cam(pad(c2, -60));
  problemCopy.forEach((_, i) => draw(`problem-${i}`));
  draw("problem-underline", 0.35);
  hold(0.5);

  // 3. Onboarding

  const c3 = cell(1, 1);
  const onboardTitle = write("onboard-title", "Everything starts with adding an asset.", c3.x + 40, c3.y + 30, 64);
  const fOnboard = frame("onboard", c3.x + 40, c3.y + 200, ["picker", "add-configure", "add-scans"]);
  const noteX = margin(fOnboard);

  const available = at(fOnboard, "picker", "available", { x: 380, y: 150, w: 880, h: 400 });
  const premium = at(fOnboard, "picker", "premiumHeading", { x: 380, y: 620, w: 200, h: 24 });
  ink("pick-bracket", "green", bracket(available, nextSeed()), 4.5, { frame: "onboard", snap: 0 });
  const pickNote = write("pick-note", "what you can\nconnect comes first", noteX, available.y, 50, "green", { frame: "onboard", snap: 0 });
  const premNote = write("prem-note", "the other 200+\nwait here", noteX, premium.y + 60, 50, "red", { frame: "onboard", snap: 0 });
  ink("prem-arrow", "red", arrow([noteX - 20, premium.y + 90], [premium.x + premium.w + 24, premium.y + premium.h / 2], [noteX - 200, premium.y + 140], nextSeed()), 4, { frame: "onboard", snap: 0 });

  cam(focus(pad(union(onboardTitle, frameRect(fOnboard)), 40), 1600));
  draw("onboard-title");
  show(fOnboard, 0);
  cam(focus(union(pad(available, 60), premium, pickNote, premNote), 1500), 0.8);
  draw("pick-bracket", 0.4);
  draw("pick-note");
  draw("prem-note");
  draw("prem-arrow", 0.4);
  hold(0.4);

  const stepRects = [1, 2, 3].map((n) => at(fOnboard, "add-configure", `step${n}`, { x: 20 + (n - 1) * 360, y: 250, w: 160, h: 28 }));
  stepRects.forEach((r, i) => ink(`steps-${i}`, "green", circle(r, nextSeed(), 12), 4, { frame: "onboard", snap: 1 }));
  const stepsNote = write("steps-note", "three short steps\ninstead of one long form", noteX, stepRects[0].y - 20, 50, "green", { frame: "onboard", snap: 1 });

  cam(focus(union(...stepRects, stepsNote), 1500), 0.8);
  show(fOnboard, 1);
  stepRects.forEach((_, i) => draw(`steps-${i}`, 0.3));
  draw("steps-note");
  hold(0.4);

  const toggle = at(fOnboard, "add-scans", "scanToggle", { x: 400, y: 400, w: 300, h: 40 });
  ink("scan-circle", "green", circle(toggle, nextSeed(), 16), 4.5, { frame: "onboard", snap: 2 });
  const scanNote = write("scan-note", "the first scan\nstarts right here", noteX, toggle.y - 30, 50, "green", { frame: "onboard", snap: 2 });

  show(fOnboard, 2);
  cam(focus(union(pad(toggle, 200), scanNote), 1400), 0.7, true);
  draw("scan-circle", 0.35);
  draw("scan-note");
  hold(0.5);

  // 4. Scan setup

  const c4 = cell(1, 0);
  const fScans = frame("scans", c4.x + 40, c4.y + 200, ["scans-before", "scans-after"]);
  const discovery = at(fScans, "scans-before", "discoveryLabel", { x: 352, y: 268, w: 130, h: 22 });
  const classification = at(fScans, "scans-before", "classificationLabel", { x: 352, y: 374, w: 130, h: 22 });
  const schedule = at(fScans, "scans-before", "schedule", { x: 492, y: 267, w: 148, h: 24 });
  const before = { frame: "scans", snap: 0 };

  // Replacements sit in the gap above each struck label; the cron note needs the margin

  ink("scan-strike-1", "red", strike(discovery, nextSeed()), 3.5, before);
  write("scan-new-1", "Discovery Scan", discovery.x - 50, discovery.y - 32, 28, "green", before);
  ink("scan-strike-2", "red", strike(classification, nextSeed()), 3.5, before);
  write("scan-new-2", "Classification Scan", classification.x - 50, classification.y - 32, 28, "green", before);
  ink("cron-strike", "red", strike(schedule, nextSeed()), 3.5, before);
  const namesNote = write("scan-names-note", "named after the job\neach one does", margin(fScans), discovery.y - 60, 50, "green");
  const cronNote = write("cron-new", "pick a time instead", margin(fScans), classification.y + 40, 50, "green", before);
  const rowGap = discovery.y + discovery.h + 16;
  ink("cron-arrow", "green", arrow([cronNote.x - 20, cronNote.y + 30], [schedule.x + schedule.w + 16, schedule.y + schedule.h / 2], [schedule.x + schedule.w + 360, rowGap + 30], nextSeed()), 3.5, before);

  cam(pad(c4, -40));
  show(fScans, 0);
  cam(focus(union({ x: discovery.x - 80, y: discovery.y - 60, w: 10, h: 10 }, classification, schedule), 1000), 0.8);
  draw("scan-strike-1", 0.3);
  draw("scan-new-1");
  draw("scan-strike-2", 0.3);
  draw("scan-new-2");
  cam(focus(union(discovery, namesNote, cronNote), 1400), 0.8);
  draw("scan-names-note");
  draw("cron-strike", 0.3);
  draw("cron-new");
  draw("cron-arrow", 0.4);
  show(fScans, 1, 1);
  hold(0.5);

  // 5. Explore: flat list

  const c5 = cell(2, 0);
  const flatTitle = write("flat-title", "The PM wanted a flat list, because fewer clicks felt faster.", c5.x + 40, c5.y + 30, fitSize("The PM wanted a flat list, because fewer clicks felt faster.", CELL_W - 80, 64, FONT));
  const fFlat = frame("flat", c5.x + 40, c5.y + 200, ["/mockups/data-compass/flat-list/"]);
  const listArea: Rect = { x: fFlat.x + 300, y: fFlat.y + CHROME + 200, w: 1060, h: 560 };
  ink("flat-scribble", "red", scribble(listArea, nextSeed(), 9), 4);
  const flatNote = write("flat-note", "testers got lost\nin pages of columns", margin(fFlat), listArea.y + 120, 50, "red");

  cam(focus(pad(union(flatTitle, frameRect(fFlat), flatNote), 40), 1600));
  draw("flat-title");
  show(fFlat, 0);
  hold(0.4);
  draw("flat-scribble", 0.8);
  draw("flat-note");
  hold(0.4);

  // 5 and 6. Explore: tree view, +X chips and the info panel

  const c6 = cell(2, 1);
  const fTree = frame("tree", c6.x + 40, c6.y + 200, ["explore-root", "explore-tree", "info-panel"]);
  const plus = at(fTree, "explore-root", "plusChip", { x: 1340, y: 226, w: 28, h: 22 });
  ink("plus-circle", "green", circle(plus, nextSeed(), 12), 4, { frame: "tree", snap: 0 });
  const plusNote = write("plus-note", "rows stay one line\ntall at any scale", margin(fTree), plus.y - 20, 50, "green", { frame: "tree", snap: 0 });

  const nodes: Rect[] = [];
  for (let i = 0; i < 8; i++) {
    const r = anchors["explore-tree"]?.anchors[`node${i}`];
    if (r) nodes.push({ x: fTree.x + r.x, y: fTree.y + CHROME + r.y, w: r.w, h: r.h });
  }
  const columnRow = at(fTree, "explore-tree", "column", { x: 560, y: 280, w: 400, h: 44 });
  const column = { ...columnRow, w: Math.min(columnRow.w, 220) };

  // Each click down the tree gets a number, then an arrow lands on the column

  const tree = { frame: "tree", snap: 1 };
  nodes.forEach((r, i) => write(`tree-click-${i}`, String(i + 1), r.x + r.w - 34, r.y - 2, 30, "green", tree));
  const last = nodes[nodes.length - 1] ?? { x: fTree.x + 300, y: fTree.y + 400, w: 200, h: 30 };
  ink("tree-trace", "green", arrow([last.x + last.w - 10, last.y + last.h / 2], [column.x - 12, column.y + column.h / 2], [column.x - 40, last.y - 60], nextSeed()), 4, tree);
  ink("tree-circle", "green", circle(column, nextSeed(), 10), 4, { frame: "tree", snap: 1 });
  const treeNote = write("tree-note", "more clicks, and each one\ngot closer to the risk", margin(fTree), column.y - 30, 50, "green", { frame: "tree", snap: 1 });

  const panelTitle = write("panel-title", "We both thought a side panel was unnecessary. I was wrong.", c6.x + 40, c6.y + 30, fitSize("We both thought a side panel was unnecessary. I was wrong.", CELL_W - 80, 64, FONT));
  const panel = at(fTree, "info-panel", "panel", { x: 1040, y: 50, w: 400, h: 850 });
  const panelNote = write("panel-note", "owners, row counts and\nscan history sit\nwhere you act", margin(fTree), panel.y + 160, 50, "green", { frame: "tree", snap: 2 });
  ink("panel-arrow", "green", arrow([margin(fTree) - 20, panel.y + 190], [panel.x + panel.w - 40, panel.y + 190], [margin(fTree) - 40, panel.y + 120], nextSeed()), 4, { frame: "tree", snap: 2 });

  cam(focus(pad(frameRect(fTree), 60), 1600));
  show(fTree, 0);
  cam(focus(union(pad(plus, 200), plusNote), 1300), 0.7);
  draw("plus-circle", 0.3);
  draw("plus-note");
  cam(focus(union(frameRect(fTree), treeNote), 1600), 0.7);
  show(fTree, 1);
  nodes.forEach((_, i) => draw(`tree-click-${i}`, 0.18));
  draw("tree-trace", 0.4);
  draw("tree-circle", 0.3);
  draw("tree-note");
  hold(0.4);
  cam(focus(pad(union(panelTitle, frameRect(fTree), panelNote), 40), 1600), 0.6);
  draw("panel-title");
  show(fTree, 2);
  draw("panel-arrow", 0.4);
  draw("panel-note");
  hold(0.6);

  // 7. Outcome

  const c7: Rect = { x: 3 * (CELL_W + GAP), y: 0, w: CELL_W, h: CELL_H * 2 + GAP };
  const outCopy = ["It shipped in two weeks.", "We won the bank and ₹10Cr ARR.", "Testing settled the arguments, including mine."];
  const outSize = fitSize(outCopy[2], CELL_W - 200, 96, FONT);
  const outTop = c7.y + c7.h / 2 - outSize * 3;
  const outBoxes = outCopy.map((line, i) => write(`out-${i}`, line, c7.x + 100, outTop + i * outSize * 2, outSize, i === 1 ? "green" : "graphite"));
  ink("out-underline", "green", underline(outBoxes[1], nextSeed()), 5);

  cam(focus(pad({ x: c7.x, y: outTop - 100, w: CELL_W, h: outSize * 6 + 200 }, 0), CELL_W + 200), 1.4);
  draw("out-0");
  draw("out-1");
  draw("out-underline", 0.35);
  draw("out-2");
  hold(0.4);

  const world = { w: c7.x + CELL_W, h: CELL_H * 2 + GAP };
  cam(pad({ x: 0, y: 0, ...world }, 120), 2);
  hold(0.8);

  return finish(world);
}
