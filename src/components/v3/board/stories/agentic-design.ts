/**
 * The Agentic Design story as a board script. Each beat is one cell: a pen
 * line across the top and a hand-drawn diagram below it. The illustration
 * chapter places the real Soft-Stack art on cards instead of sketches.
 *
 * Every diagram part is tagged with its beat id, so the reading version can
 * crop the same drawings into its figures.
 */
import { arc, jitter, seeded, smoothPath, type Point } from "../../sketch";
import { CELL_W, cell, createKit, fitSize, focus, pad, union } from "../kit";
import { circle, strike, underline, type Rect } from "../marks";
import { penWidth } from "../pen/text";
import { arrowLine, bars, box, cross, dashed, doc, dot, hatch, ICONS, line, person, stack, tick, type IconName } from "../sketchy";
import type { Frame, Ink, Script } from "../timeline";

/** Diagram area inside a cell, below the beat line. */
const AREA = { dx: 100, dy: 300, w: 1800, h: 920 };

const ART = "/agentic/art";

/** Graphite line weight for diagram structure, in world px. */
const W = 4.5;

const FONT = "excalifont";

export function buildAgenticDesign(): Script {
  const kit = createKit(FONT);
  const { ink, write, frame, cam, draw, show, hold, figure, nextSeed, finish } = kit;

  let camera: Rect | null = null;

  /** Moves the camera to a cell, pulling back first when the next cell is more than one step away. */
  const travel = (to: Rect) => {
    const target = focus(pad(to, -40), CELL_W);
    if (camera && Math.hypot(camera.x - target.x, camera.y - target.y) > CELL_W * 1.5) {
      cam(pad(union(camera, target), 200), 0.9);
      cam(target, 0.9);
    } else {
      cam(target, camera ? 1 : 0.01);
    }
    camera = target;
  };

  /** One beat: the cell, its line and the helpers that draw into its diagram area. */
  const beat = (id: string, col: number, row: number, lineText: string, kicker?: string) => {
    const c = cell(col, row);
    const area: Rect = { x: c.x + AREA.dx, y: c.y + AREA.dy, w: AREA.w, h: AREA.h };
    figure(id, pad(area, 40));

    const tag = { figure: id };
    const X = (x: number) => area.x + x;
    const Y = (y: number) => area.y + y;
    const P = (x: number, y: number): Point => [X(x), Y(y)];
    const R = (x: number, y: number, w: number, h: number): Rect => ({ x: area.x + x, y: area.y + y, w, h });

    const pen = (name: string, color: Ink, paths: string[], width = W) => {
      ink(`${id}-${name}`, color, paths, width, tag);
      return `${id}-${name}`;
    };
    const text = (name: string, str: string, x: number, y: number, size = 44, color: Ink = "graphite") => {
      write(`${id}-${name}`, str, area.x + x, area.y + y, size, color, tag);
      return `${id}-${name}`;
    };
    /** Text centred on x. */
    const label = (name: string, str: string, cx: number, y: number, size = 44, color: Ink = "graphite") =>
      text(name, str, cx - penWidth(str, size, FONT) / 2, y, size, color);
    const icon = (name: string, which: IconName, x: number, y: number, size: number, color: Ink = "graphite", width = W) => {
      ink(`${id}-${name}`, color, [...ICONS[which]], width, { ...tag, at: { x: area.x + x, y: area.y + y, scale: size / 24 } });
      return `${id}-${name}`;
    };
    const art = (name: string, src: string, x: number, y: number, w: number, h: number): Frame =>
      frame(`${id}-${name}`, area.x + x, area.y + y, [`${ART}/${src}`], { kind: "art", w, h, figure: id });
    const s = nextSeed;

    travel(c);
    if (kicker) {
      write(`${id}-kicker`, kicker, c.x + 100, c.y + 50, 40, "green");
      draw(`${id}-kicker`, 0.3);
    }
    const size = fitSize(lineText, CELL_W - 200, 66, FONT);
    write(`${id}-line`, lineText, c.x + 100, c.y + 120, size);
    draw(`${id}-line`, 1.1);

    return { X, Y, P, R, pen, text, label, icon, art, s };
  };

  // Title card, also rendered as the case study's cover

  {
    const c = cell(0, 0);
    const X = (x: number) => c.x + 100 + x;
    const Y = (y: number) => c.y + 80 + y;
    travel(c);
    write("cover-title", "Agentic Design", X(0), Y(0), 170);
    draw("cover-title", 1);
    write("cover-sub", "Teaching agents my design judgement", X(10), Y(250), 64, "green");
    draw("cover-sub", 0.7);

    const skills = ["product-design", "privy-ui-standards", "privy-illustration"];
    skills.forEach((name, i) => {
      const r = { x: X(0), y: Y(480 + i * 230), w: 560, h: 180 };
      ink(`cover-skill-${i}`, "green", doc(r, nextSeed()), 5);
      write(`cover-skill-label-${i}`, name, r.x + 36, r.y + 60, 50, "green");
      draw(`cover-skill-${i}`, 0.2);
      draw(`cover-skill-label-${i}`, 0.25);
    });
    ink("cover-reads", "graphite", [0, 1, 2].flatMap((i) => arrowLine([X(590), Y(570 + i * 230)], [X(800), Y(800)], nextSeed(), (1 - i) * 40)), W);
    draw("cover-reads", 0.3);
    const agent = { x: X(820), y: Y(700), w: 340, h: 200 };
    ink("cover-agent", "graphite", [...box(agent, nextSeed()), ...dot(agent.x + 115, agent.y + 80, 20, nextSeed()), ...dot(agent.x + 225, agent.y + 80, 20, nextSeed())], W);
    write("cover-agent-label", "agent", agent.x + 105, agent.y + 115, 50);
    draw("cover-agent", 0.3);
    draw("cover-agent-label", 0.15);
    ink("cover-builds", "graphite", arrowLine([X(1180), Y(800)], [X(1340), Y(800)], nextSeed()), W);
    draw("cover-builds", 0.15);
    const screen = { x: X(1360), y: Y(620), w: 440, h: 360 };
    ink("cover-screen", "graphite", [
      ...box(screen, nextSeed()),
      ...line([screen.x, screen.y + 64], [screen.x + screen.w, screen.y + 64], nextSeed()),
      ...box({ x: screen.x + 36, y: screen.y + 100, w: 170, h: 110 }, nextSeed(), 1),
      ...box({ x: screen.x + 236, y: screen.y + 100, w: 170, h: 110 }, nextSeed(), 1),
      ...bars(screen.x + 36, screen.y + 260, [360, 300], 44, nextSeed()),
    ], W);
    draw("cover-screen", 0.4);
    ink("cover-tick", "green", tick(screen.x + screen.w - 10, screen.y - 10, 90, nextSeed()), 7);
    draw("cover-tick", 0.2);
    hold(0.5);
  }

  // Prologue: the Design Repo

  {
    const b = beat("p1", 1, 0, "A module I built with AI agents went to production. Then I had to stop writing production code.", "Background");
    const branch = b.R(0, 120, 420, 220);
    const ide = b.R(690, 120, 420, 220);
    const pr = b.R(1380, 120, 420, 220);
    draw(b.pen("boxes", "graphite", [...box(branch, b.s()), ...box(ide, b.s()), ...box(pr, b.s())]), 0.5);
    draw(b.label("branch", "pull a branch", 210, 200, 50), 0.25);
    draw(b.pen("a1", "graphite", arrowLine(b.P(440, 230), b.P(675, 230), b.s())), 0.15);
    draw(b.label("ide", "design in code", 900, 172, 50), 0.25);
    draw(b.label("ide-2", "with agents", 900, 240, 40), 0.15);
    draw(b.pen("a2", "graphite", arrowLine(b.P(1130, 230), b.P(1365, 230), b.s())), 0.15);
    draw(b.label("pr", "PR merged", 1590, 200, 50), 0.25);
    draw(b.pen("merged", "green", tick(b.X(1770), b.Y(110), 70, b.s()), 6), 0.15);
    draw(b.pen("loop", "graphite", arrowLine(b.P(1590, 360), b.P(210, 360), b.s(), -230)), 0.4);
    hold(0.2);
    draw(b.pen("strike", "red", strike({ x: branch.x, y: branch.y, w: pr.x + pr.w - branch.x, h: branch.h }, b.s()), 7), 0.3);
    draw(b.text("n1", "Phoenix LiveView: agents write poor code for it", 0, 700, 46, "red"), 0.5);
    draw(b.text("n2", "I couldn't maintain that code, so I stopped", 0, 790, 46, "red"), 0.5);
    hold(0.3);
  }

  {
    const b = beat("p2", 2, 0, "So I built a separate repo where every design runs as code.");
    const mock = b.R(0, 90, 640, 470);
    draw(b.text("mock-label", "static mockup", 0, 10, 46), 0.3);
    draw(b.pen("mock", "graphite", [...box(mock, b.s()), ...bars(mock.x + 60, mock.y + 110, [420, 300, 470, 250], 80, b.s())]), 0.5);
    draw(b.pen("q", "red", [
      ...penQ(b.P(560, 130), b.s()),
      ...penQ(b.P(600, 470), b.s()),
      ...penQ(b.P(90, 500), b.s()),
    ], 5), 0.3);

    const win = b.R(880, 90, 780, 540);
    draw(b.text("repo-label", "design repo, running on Vercel", 880, 10, 46), 0.35);
    draw(b.pen("repo", "graphite", [
      ...box(win, b.s()),
      ...line(b.P(880, 160), b.P(1660, 160), b.s()),
      ...dot(win.x + 40, win.y + 36, 11, b.s()),
      ...dot(win.x + 76, win.y + 36, 11, b.s()),
      ...dot(win.x + 112, win.y + 36, 11, b.s()),
      ...box(b.R(940, 210, 240, 84), b.s()),
      ...bars(win.x + 60, win.y + 280, [640, 560, 600], 72, b.s()),
    ]), 0.6);
    draw(b.text("button", "New scan", 972, 232, 38), 0.2);
    draw(b.pen("runs", "green", tick(b.X(1640), b.Y(80), 70, b.s()), 6), 0.15);

    draw(b.pen("pull", "green", arrowLine(b.P(1250, 650), b.P(1250, 790), b.s(), 40), 5), 0.25);
    draw(b.text("pull-label", "git pull", 1010, 690, 46, "green"), 0.25);
    draw(b.pen("dev", "graphite", person(b.X(1400), b.Y(900), 190, b.s())), 0.3);
    draw(b.text("dev-label", "developer + their agent", 1500, 820, 38), 0.35);
    hold(0.3);
  }

  {
    const b = beat("p3", 3, 0, "20 people work in it now: 8 designers, 5 PMs and 7 developers.");
    const group = (name: string, count: number, x0: number, title: string) => {
      const paths: string[] = [];
      for (let i = 0; i < count; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        paths.push(...person(b.X(x0 + 60 + col * 120), b.Y(190 + row * 150), 110, b.s()));
      }
      draw(b.pen(name, "graphite", paths, 4), 0.45);
      draw(b.text(`${name}-label`, title, x0, 380, 44), 0.25);
    };
    group("designers", 8, 0, "8 designers");
    group("pms", 5, 640, "5 PMs");
    group("devs", 7, 1240, "7 developers");
    const repo = b.R(600, 660, 600, 190);
    draw(b.pen("in", "graphite", [
      ...arrowLine(b.P(260, 460), b.P(700, 650), b.s(), 40),
      ...arrowLine(b.P(820, 460), b.P(880, 645), b.s()),
      ...arrowLine(b.P(1480, 460), b.P(1100, 650), b.s(), -40),
    ]), 0.4);
    draw(b.pen("repo", "graphite", box(repo, b.s())), 0.3);
    draw(b.label("repo-label", "design repo", 900, 725, 56), 0.3);
    draw(b.text("lineage", "Lineage module:\n2 weeks -> 18 hours", 1290, 690, 44, "green"), 0.5);
    hold(0.3);
  }

  {
    const b = beat("pdemo", 4, 0, "Every push to the demo branch updates permanent links for PMs and pre-sales.");
    const repo = b.R(0, 300, 340, 170);
    const branch = b.R(460, 300, 340, 170);
    draw(b.pen("repo", "graphite", box(repo, b.s())), 0.25);
    draw(b.label("repo-label", "design repo", 170, 360, 44), 0.2);
    draw(b.pen("push", "graphite", arrowLine(b.P(350, 385), b.P(450, 385), b.s())), 0.1);
    draw(b.text("push-label", "git push", 330, 250, 36), 0.15);
    draw(b.pen("branch", "green", box(branch, b.s()), 5), 0.25);
    draw(b.label("branch-label", "demo branch", 630, 360, 44, "green"), 0.2);
    const links = ["privy-hub-demo", "privy-compass-demo", "every other app"];
    draw(b.pen("fan", "graphite", links.flatMap((_, i) => arrowLine(b.P(810, 385), b.P(930, 150 + i * 190), b.s(), i === 1 ? 0 : (i - 1) * -30))), 0.25);
    links.forEach((name, i) => {
      draw(b.pen(`link-${i}`, "graphite", box(b.R(940, 90 + i * 190, 520, 120), b.s(), 1)), 0.12);
      draw(b.text(`link-label-${i}`, name, 970, 125 + i * 190, 40), 0.18);
    });
    draw(b.pen("to-people", "graphite", arrowLine(b.P(1470, 340), b.P(1570, 360), b.s())), 0.1);
    draw(b.pen("people", "graphite", [...person(b.X(1650), b.Y(420), 150, b.s()), ...person(b.X(1750), b.Y(420), 150, b.s())]), 0.25);
    draw(b.text("people-label", "PMs and\npre-sales", 1580, 450, 38), 0.2);
    draw(b.text("n1", "16 PMs and pre-sales people use the links", 0, 720, 44), 0.4);
    draw(b.text("n2", "110 demo updates so far, and 4 client POCs built the same way", 0, 810, 44, "green"), 0.5);
    hold(0.3);
  }

  {
    const b = beat("pfeedback", 5, 0, "Anyone reviewing a demo can report an issue from inside the app.");
    const app = b.R(0, 60, 760, 560);
    const button = b.R(540, 520, 190, 70);
    draw(b.pen("app", "graphite", [
      ...box(app, b.s()),
      ...line(b.P(0, 130), b.P(760, 130), b.s()),
      ...box(b.R(40, 170, 300, 170), b.s(), 1),
      ...box(b.R(380, 170, 340, 170), b.s(), 1),
      ...bars(b.X(40), b.Y(390), [620, 540, 600], 44, b.s()),
    ]), 0.5);
    draw(b.pen("button", "green", box(button, b.s()), 5), 0.2);
    draw(b.text("button-label", "feedback", 560, 535, 36, "green"), 0.15);
    const captures = ["screenshot", "screen recording", "voice note", "a box around an element"];
    draw(b.pen("to-captures", "graphite", arrowLine(b.P(770, 330), b.P(880, 300), b.s())), 0.1);
    captures.forEach((name, i) => draw(b.text(`cap-${i}`, name, 900, 130 + i * 95, 40), 0.2));
    draw(b.pen("to-chat", "graphite", arrowLine(b.P(1340, 330), b.P(1420, 330), b.s())), 0.1);
    draw(b.pen("chat", "graphite", box(b.R(1430, 200, 370, 260), b.s())), 0.25);
    draw(b.text("chat-label", "Google Chat\none thread per\napp, per week", 1460, 230, 38), 0.35);
    draw(b.text("n1", "the app, route, browser and screen size attach on their own", 0, 720, 44), 0.5);
    draw(b.text("n2", "on in 11 apps", 0, 810, 44, "green"), 0.2);
    hold(0.3);
  }

  {
    const b = beat("p4", 6, 0, "Their agents used our components but didn't know our decisions.");
    const xs = [60, 700, 1340];
    xs.forEach((x, i) => {
      const head = b.R(x + 40, 40, 300, 190);
      draw(b.pen(`agent-${i}`, "graphite", [
        ...line(b.P(x + 190, 40), b.P(x + 190, -10), b.s()),
        ...dot(b.X(x + 190), b.Y(-22), 12, b.s()),
        ...box(head, b.s()),
        ...dot(head.x + 100, head.y + 85, 18, b.s()),
        ...dot(head.x + 200, head.y + 85, 18, b.s()),
        ...line([head.x + 110, head.y + 145], [head.x + 190, head.y + 145], b.s()),
      ]), 0.3, i > 0);
      draw(b.pen(`down-${i}`, "graphite", arrowLine(b.P(x + 190, 250), b.P(x + 190, 380), b.s())), 0.12);
      const scr = b.R(x, 400, 380, 300);
      draw(b.pen(`screen-${i}`, "graphite", [
        ...box(scr, b.s()),
        ...line([scr.x, scr.y + 56], [scr.x + scr.w, scr.y + 56], b.s()),
        ...box({ x: scr.x + 30, y: scr.y + 90, w: 150, h: 54 }, b.s(), 1),
        ...bars(scr.x + 30, scr.y + 190, [300, 240, 280], 36, b.s()),
      ], 4), 0.3);
    });
    draw(b.pen("same", "red", underline(b.R(0, 700, 1760, 20), b.s()), 6), 0.3);
    draw(b.text("n1", "the same generic choices on every screen, and I reviewed each one", 0, 780, 44, "red"), 0.6);
    hold(0.3);
  }

  // Skill 1: product-design

  {
    const b = beat("s1-1", 0, 1, "For every feature, I repeated the same steps with the agent by hand.", "Skill 1: product-design");
    const steps = ["PRD", "explain it", "competitors", "constraints", "design doc"];
    steps.forEach((name, i) => {
      const r = b.R(i * 372, 80, 320, 150);
      draw(b.pen(`box-${i}`, "graphite", box(r, b.s())), 0.2);
      draw(b.label(`step-${i}`, name, i * 372 + 160, 128, 44), 0.2);
      if (i < steps.length - 1) draw(b.pen(`a-${i}`, "graphite", arrowLine(b.P(i * 372 + 326, 155), b.P(i * 372 + 366, 155), b.s())), 0.08);
    });
    const bar = b.R(0, 440, 1800, 90);
    draw(b.text("ctx-label", "context window", 0, 370, 40), 0.25);
    draw(b.pen("ctx", "graphite", box(bar, b.s())), 0.25);
    draw(b.pen("ctx-fill", "red", hatch({ x: bar.x + 6, y: bar.y + 6, w: bar.w - 12, h: bar.h - 12 }, b.s()), 3.5), 0.6);
    draw(b.text("full", "full", 1680, 550, 42, "red"), 0.15);
    draw(b.pen("again", "red", arrowLine(b.P(1700, 640), b.P(160, 640), b.s(), -140), 5), 0.4);
    draw(b.text("n1", "new chat, explain everything again", 420, 800, 46, "red"), 0.5);
    hold(0.3);
  }

  {
    const b = beat("s1-2", 1, 1, "One feature was built from an outdated PRD, and I rejected the whole build.");
    const sketch = b.R(0, 60, 380, 260);
    const prd = b.R(0, 470, 380, 320);
    draw(b.pen("sketch", "graphite", [...box(sketch, b.s()), ...box(b.R(40, 110, 140, 90), b.s(), 1), ...bars(sketch.x + 210, sketch.y + 70, [120, 90, 130], 40, b.s())]), 0.4);
    draw(b.text("sketch-label", "old sketch", 0, 330, 40), 0.2);
    draw(b.pen("prd", "graphite", [...doc(prd, b.s()), ...bars(prd.x + 40, prd.y + 90, [260, 220, 280, 180], 50, b.s())]), 0.4);
    draw(b.text("prd-label", "PRD, two versions old", 0, 800, 40, "red"), 0.3);
    draw(b.pen("in", "graphite", [...arrowLine(b.P(400, 190), b.P(580, 300), b.s()), ...arrowLine(b.P(400, 630), b.P(580, 520), b.s())]), 0.25);
    const build = b.R(600, 140, 780, 560);
    draw(b.pen("build", "graphite", [
      ...box(build, b.s()),
      ...line([build.x, build.y + 70], [build.x + build.w, build.y + 70], b.s()),
      ...box({ x: build.x + 40, y: build.y + 110, w: 300, h: 180 }, b.s(), 1),
      ...box({ x: build.x + 380, y: build.y + 110, w: 360, h: 180 }, b.s(), 1),
      ...bars(build.x + 40, build.y + 360, [700, 620, 680, 540], 44, b.s()),
    ]), 0.6);
    draw(b.label("build-label", "first build", 990, 60, 44), 0.2);
    hold(0.2);
    draw(b.pen("x", "red", cross(b.X(990), b.Y(420), 460, b.s()), 9), 0.35);
    draw(b.text("rejected", "rejected", 1450, 200, 52, "red"), 0.3);
    draw(b.text("rounds", "4 more rounds\nto fix it", 1450, 330, 44, "red"), 0.4);
    draw(b.pen("loops", "red", [0, 1, 2, 3].flatMap((i) => dot(b.X(1480 + i * 80), b.Y(520), 26, b.s())), 4), 0.3);
    hold(0.3);
  }

  {
    const b = beat("s1-3", 2, 1, "I wanted the design decided and written down before any code.");
    const y = 460;
    draw(b.pen("track", "graphite", line(b.P(0, y), b.P(1800, y), b.s())), 0.4);
    const stops = [
      ["PRD", 60],
      ["questions", 300],
      ["research", 640],
      ["PDD", 980],
    ] as const;
    stops.forEach(([name, x], i) => {
      draw(b.pen(`stop-${i}`, "graphite", dot(b.X(x + 40), b.Y(y), 22, b.s())), 0.08);
      draw(b.text(`stop-label-${i}`, name, x, y - 110, 46), 0.2);
    });
    const gate = b.R(1240, y - 170, 56, 340);
    draw(b.pen("gate", "green", [...box(gate, b.s()), ...hatch(gate, b.s(), 20)], 5), 0.4);
    draw(b.text("approve", "my approval", 1120, y - 250, 46, "green"), 0.3);
    draw(b.pen("code", "graphite", box(b.R(1420, y - 75, 340, 150), b.s())), 0.25);
    draw(b.label("code-label", "code", 1590, y - 28, 50), 0.2);
    draw(b.text("n1", "thinking goes on the left of the gate, on disk", 0, 720, 46), 0.5);
    hold(0.3);
  }

  {
    const b = beat("s1-4", 3, 1, "The skill runs the steps in order and waits for my approval before it builds.");
    const y = 260;
    draw(b.pen("track", "graphite", line(b.P(0, y), b.P(1800, y), b.s())), 0.35);
    const stations = [
      ["explain\nthe PRD", 80],
      ["ask until\n98% clear", 390],
      ["research\ncompetitors", 700],
      ["read 25\nservice repos", 1010],
      ["write\nthe PDD", 1320],
    ] as const;
    stations.forEach(([name, x], i) => {
      draw(b.pen(`dot-${i}`, "graphite", dot(b.X(x + 60), b.Y(y), 44, b.s())), 0.1);
      draw(b.label(`n-${i}`, String(i + 1), x + 60, y - 30, 48), 0.08);
      draw(b.text(`label-${i}`, name, x, y + 80, 40), 0.3);
    });
    draw(b.pen("gate", "green", [...line(b.P(1560, y - 130), b.P(1560, y + 130), b.s()), ...line(b.P(1580, y - 130), b.P(1580, y + 130), b.s())], 6), 0.2);
    draw(b.text("approve", "I approve", 1480, y - 220, 42, "green"), 0.2);
    const phases = [0, 1, 2].map((i) => b.R(1340 + i * 160, 620, 110, 110));
    draw(b.pen("phases", "graphite", phases.flatMap((r) => box(r, b.s()))), 0.3);
    phases.forEach((_, i) => draw(b.label(`ph-${i}`, String(i + 1), 1395 + i * 160, 648, 44), 0.06));
    draw(b.pen("phase-ticks", "green", [0, 1].flatMap((i) => tick(phases[i].x + 135, phases[i].y + 55, 34, b.s())), 4), 0.15);
    draw(b.pen("to-phases", "graphite", arrowLine(b.P(1680, y + 40), b.P(1560, 600), b.s(), -40)), 0.15);
    draw(b.text("phase-label", "build in phases,\neach one approved", 1340, 770, 38), 0.35);
    draw(b.text("check", "a script checks the PDD\nfor missing sections", 0, 640, 40), 0.4);
    hold(0.3);
  }

  {
    const b = beat("s1-5", 4, 1, "A new chat reads STATE.md and JOURNAL.md and continues the work.");
    const left = b.R(0, 60, 620, 780);
    const right = b.R(1180, 60, 620, 780);
    draw(b.text("chat1", "chat 1", 0, -20, 40), 0.15);
    draw(b.pen("left", "graphite", [
      ...box(left, b.s()),
      ...box(b.R(40, 120, 380, 80), b.s(), 1),
      ...box(b.R(200, 240, 380, 80), b.s(), 1),
      ...box(b.R(40, 360, 380, 80), b.s(), 1),
      ...box(b.R(200, 480, 380, 80), b.s(), 1),
    ]), 0.5);
    draw(b.pen("full", "red", hatch(b.R(40, 620, 540, 60), b.s(), 22), 3.5), 0.3);
    draw(b.text("full-label", "context full", 40, 710, 40, "red"), 0.2);
    const state = b.R(720, 110, 360, 250);
    const journal = b.R(720, 480, 360, 250);
    draw(b.pen("files", "graphite", [...doc(state, b.s()), ...doc(journal, b.s())]), 0.4);
    draw(b.text("state", "STATE.md", 750, 180, 44), 0.2);
    draw(b.text("state-note", "where the\nwork stands", 750, 250, 34), 0.2);
    draw(b.text("journal", "JOURNAL.md", 750, 550, 44), 0.2);
    draw(b.text("journal-note", "every decision,\nand why", 750, 620, 34), 0.2);
    draw(b.pen("writes", "graphite", [...arrowLine(b.P(630, 240), b.P(712, 240), b.s()), ...arrowLine(b.P(630, 600), b.P(712, 600), b.s())]), 0.2);
    draw(b.text("chat2", "chat 2", 1180, -20, 40), 0.15);
    draw(b.pen("right", "graphite", [...box(right, b.s()), ...box(b.R(1220, 120, 380, 80), b.s(), 1)]), 0.3);
    draw(b.pen("reads", "green", [...arrowLine(b.P(1090, 240), b.P(1172, 200), b.s()), ...arrowLine(b.P(1090, 600), b.P(1172, 240), b.s(), 40)], 5), 0.25);
    draw(b.text("picks-up", "carries on\nfrom here", 1220, 260, 44, "green"), 0.3);
    hold(0.3);
  }

  {
    const b = beat("s1-6", 5, 1, "No data security tool showed what a scan skipped, so I used a pattern from Datadog.");
    const rowH = 110;
    const header = b.R(0, 40, 1000, rowH);
    draw(b.pen("table", "graphite", [0, 1, 2, 3, 4, 5].flatMap((i) => box({ ...header, y: header.y + i * rowH }, b.s(), 1))), 0.5);
    draw(b.text("head", "shows what a scan skipped?", 24, 70, 42), 0.3);
    [0, 1, 2, 3].forEach((i) => draw(b.text(`tool-${i}`, "data security tool", 24, 70 + (i + 1) * rowH, 42), 0.12));
    draw(b.pen("nos", "red", [0, 1, 2, 3].flatMap((i) => cross(b.X(930), b.Y(95 + (i + 1) * rowH), 44, b.s())), 5), 0.3);
    draw(b.text("datadog", "Datadog APM", 24, 70 + 5 * rowH, 44), 0.15);
    draw(b.pen("yes", "green", tick(b.X(930), b.Y(95 + 5 * rowH), 54, b.s()), 6), 0.12);
    draw(b.pen("ring", "green", circle({ ...header, y: header.y + 5 * rowH }, b.s(), 14), 5), 0.25);
    const strip = b.R(1140, 440, 660, 100);
    draw(b.pen("borrow", "green", arrowLine(b.P(1030, 640), b.P(1180, 560), b.s(), 40), 5), 0.2);
    draw(b.text("strip-label", "coverage strip", 1140, 350, 46, "green"), 0.25);
    draw(b.pen("strip", "graphite", [...box(strip, b.s()), ...line([strip.x + 400, strip.y], [strip.x + 400, strip.y + 100], b.s()), ...line([strip.x + 540, strip.y], [strip.x + 540, strip.y + 100], b.s())]), 0.3);
    draw(b.pen("skipped", "red", [...hatch({ x: strip.x + 404, y: strip.y + 4, w: 132, h: 92 }, b.s(), 18), ...hatch({ x: strip.x + 544, y: strip.y + 4, w: 112, h: 92 }, b.s(), 18)], 3), 0.3);
    draw(b.text("read", "read", 1180, 466, 42), 0.1);
    draw(b.text("why", "skipped, with the reason", 1300, 570, 38, "red"), 0.3);
    hold(0.3);
  }

  {
    const b = beat("s1-7", 6, 1, "PRD to approved design went from about two weeks to two days.");
    const before = b.R(260, 120, 1440, 110);
    const after = b.R(260, 400, 206, 110);
    draw(b.text("before", "before", 0, 142, 46), 0.2);
    draw(b.pen("before-bar", "graphite", [...box(before, b.s()), ...hatch(before, b.s(), 30)]), 0.8);
    draw(b.text("before-n", "about 2 weeks", 1300, 40, 46), 0.3);
    draw(b.text("after", "after", 0, 422, 46, "green"), 0.2);
    draw(b.pen("after-bar", "green", [...box(after, b.s()), ...hatch(after, b.s(), 30)], 5), 0.25);
    draw(b.text("after-n", "2 days", 500, 424, 52, "green"), 0.2);
    draw(b.text("n1", "13 PDDs have used the skill so far", 0, 660, 44), 0.4);
    draw(b.text("n2", "a teammate took one from PRD to built UI in a day", 0, 750, 44), 0.5);
    hold(0.3);
  }

  // Skill 2: privy-ui-standards

  {
    const b = beat("s2-1", 0, 2, "I didn't want design reviews to slow the team down.", "Skill 2: privy-ui-standards");
    const screens = [0, 1, 2, 3, 4, 5, 6].map((i) => b.R(i * 185, 340, 150, 116));
    draw(b.text("waiting", "screens waiting for review", 0, 250, 42), 0.3);
    draw(b.pen("queue", "graphite", screens.flatMap((r) => [...box(r, b.s(), 1), ...bars(r.x + 20, r.y + 36, [100, 70, 90], 26, b.s())]), 4), 0.7);
    draw(b.pen("to-me", "graphite", arrowLine(b.P(1310, 398), b.P(1470, 440), b.s())), 0.15);
    draw(b.pen("me", "graphite", person(b.X(1620), b.Y(620), 280, b.s())), 0.3);
    draw(b.label("me-label", "me", 1620, 650, 46), 0.15);
    draw(b.text("n1", "and each round, the agents repeated old mistakes", 0, 800, 44, "red"), 0.5);
    hold(0.3);
  }

  {
    const b = beat("s2-2", 1, 2, "I rejected an icon in round 36, and an agent used it again in round 43.");
    const k = 1.5;
    const o = 220;

    draw(b.text("r36", "round 36", 0, o - 60, 40, "green"), 0.15);
    const tiles: [IconName, string, boolean][] = [["scanLine", "ScanLine", false], ["fingerprint", "Fingerprint", false], ["idCard", "IdCard", false], ["tag", "Tag", true]];
    tiles.forEach(([which, name, kept], i) => {
      const x = i * 92 * k;
      const y = o + 20;
      draw(b.pen(`tile-${i}`, "graphite", box(b.R(x, y, 74 * k, 74 * k), b.s(), 1)), 0.08);
      draw(b.icon(`icon-${i}`, which, x + 31, y + 31, 48, "graphite", 3.5), 0.1);
      draw(b.pen(`mark-${i}`, kept ? "green" : "red", kept ? tick(b.X(x + 108), b.Y(y + 8), 38, b.s()) : cross(b.X(x + 108), b.Y(y + 8), 30, b.s()), 5), 0.08);
      draw(b.label(`name-${i}`, name, x + 55, y + 128, 28), 0.08);
    });
    draw(b.text("why", "\"it says scanning, and every panel\non this page reports on a scan\"", 0, o + 230, 34), 0.4);

    const front = b.R(690, o + 36, 360, 270);
    draw(b.pen("a1", "graphite", arrowLine(b.P(560, o + 80), b.P(680, o + 110), b.s())), 0.12);
    draw(b.text("log", "UI-CHANGELOG.md", 690, o - 60, 40), 0.2);
    draw(b.pen("pages", "graphite", stack(front, 3, 12, b.s())), 0.35);
    draw(b.text("entry", "round 36", 716, o + 62, 34), 0.12);
    draw(b.pen("entry-bars", "graphite", bars(front.x + 26, front.y + 90, [270, 225, 294], 38, b.s()), 3.5), 0.15);
    draw(b.text("refused", "ScanLine: refused", 716, o + 228, 32, "red"), 0.2);
    draw(b.text("log-note", "written in the changelog", 690, o + 320, 34), 0.25);

    draw(b.pen("a2", "red", dashed(b.P(1080, o + 150), b.P(1190, o + 150), b.s(), 22, 16), 5), 0.1);
    draw(b.pen("a2-head", "red", arrowLine(b.P(1180, o + 150), b.P(1205, o + 150), b.s()), 5), 0.05);
    draw(b.text("unread", "not read", 1086, o + 100, 26, "red"), 0.1);

    draw(b.text("r43", "round 43", 1215, o - 60, 40, "red"), 0.15);
    const panel = b.R(1215, o, 150, 310);
    const infoTile = b.R(1245, o + 30, 90, 90);
    const scanTile = b.R(1245, o + 150, 90, 90);
    draw(b.pen("panel", "graphite", [...box(panel, b.s()), ...box(infoTile, b.s(), 1), ...box(scanTile, b.s(), 1)]), 0.25);
    draw(b.icon("info", "info", 1266, o + 51, 48, "graphite", 3.5), 0.08);
    draw(b.icon("scan", "scanLine", 1266, o + 171, 48, "graphite", 3.5), 0.08);
    draw(b.label("panel-label", "info panel", 1290, o + 330, 28), 0.1);
    draw(b.pen("again", "red", circle(scanTile, b.s(), 14), 5), 0.2);
    draw(b.pen("quote-box", "graphite", box(b.R(1420, o + 10, 380, 230), b.s())), 0.2);
    draw(b.text("quote", "\"We had decided\nsomething else,\nsomewhere else...\nI don't remember.\"", 1444, o + 30, 32), 0.6);
    draw(b.text("who", "me, in review", 1444, o + 250, 28), 0.1);
    draw(b.text("n1", "seven rounds later, nobody had the reason in front of them", 0, 780, 46, "red"), 0.5);
    hold(0.4);
  }

  {
    const b = beat("s2-3", 2, 2, "I based the skill on Vercel's post about teaching agents product design.");
    draw(b.text("vercel", "Vercel's structure", 0, 40, 46), 0.3);
    const parts = ["guidance", "exemplars", "coverage\ngaps"];
    parts.forEach((name, i) => {
      draw(b.pen(`doc-${i}`, "graphite", doc(b.R(i * 300, 140, 250, 220), b.s())), 0.2);
      draw(b.text(`doc-label-${i}`, name, i * 300, 390, 40), 0.2);
    });
    draw(b.label("plus", "+", 1030, 170, 110), 0.15);
    draw(b.text("mine", "what I added", 1150, 40, 46, "green"), 0.3);
    const mine = ["refusals", "rules from\n43 rounds"];
    mine.forEach((name, i) => {
      draw(b.pen(`mine-${i}`, "green", doc(b.R(1150 + i * 330, 140, 250, 220), b.s()), 5), 0.2);
      draw(b.text(`mine-label-${i}`, name, 1150 + i * 330, 390, 40, "green"), 0.2);
    });
    draw(b.text("credit", "source: vercel.com/blog/teaching-agents-product-design-at-vercel", 0, 680, 34), 0.5);
    hold(0.3);
  }

  {
    const b = beat("s2-notes", 3, 2, "I leave notes on the live screen with Agentation, and the agent reads them.");
    const scr = b.R(0, 60, 900, 600);
    draw(b.pen("screen", "graphite", [
      ...box(scr, b.s()),
      ...line(b.P(0, 130), b.P(900, 130), b.s()),
      ...box(b.R(40, 170, 380, 160), b.s(), 1),
      ...box(b.R(460, 170, 400, 160), b.s(), 1),
      ...bars(b.X(40), b.Y(390), [780, 700, 740, 620], 52, b.s()),
    ]), 0.5);
    const pins: [number, number, string][] = [
      [400, 190, "looks squished"],
      [820, 250, "use the Assets page search"],
      [700, 480, "wrong icon"],
    ];
    pins.forEach(([x, y], i) => {
      draw(b.pen(`pin-${i}`, "green", dot(b.X(x), b.Y(y), 30, b.s()), 5), 0.1);
      draw(b.label(`pin-n-${i}`, String(i + 1), x, y - 20, 34, "green"), 0.06);
    });
    pins.forEach(([, , note], i) => draw(b.text(`note-${i}`, `${i + 1}. ${note}`, 0, 700 + i * 70, 40, "green"), 0.25));
    draw(b.pen("to-agent", "graphite", arrowLine(b.P(920, 360), b.P(1130, 360), b.s())), 0.15);
    draw(b.text("mcp", "reads the notes\nover MCP", 930, 230, 36), 0.25);
    const agent = b.R(1150, 270, 320, 180);
    draw(b.pen("agent", "graphite", [...box(agent, b.s()), ...dot(agent.x + 110, agent.y + 70, 18, b.s()), ...dot(agent.x + 210, agent.y + 70, 18, b.s())]), 0.3);
    draw(b.label("agent-label", "agent", 1310, 370, 42), 0.15);
    draw(b.text("fixes", "fixes each note,\nreplies in one line,\nmarks it resolved", 1150, 510, 38), 0.45);
    draw(b.text("apps", "on in 9 apps", 1150, 760, 42, "green"), 0.2);
    hold(0.3);
  }

  {
    const b = beat("s2-4", 4, 2, "After each round, approved choices become rules and rejected ones become refusals.");
    const log = b.R(0, 220, 300, 380);
    draw(b.pen("log", "graphite", [...stack(log, 3, 14, b.s()), ...bars(log.x + 30, log.y + 70, [220, 180, 240, 160, 200], 56, b.s())]), 0.5);
    draw(b.text("log-label", "feedback round", 0, 640, 40), 0.2);
    draw(b.pen("to-agent", "graphite", arrowLine(b.P(340, 410), b.P(500, 410), b.s())), 0.12);
    const agent = b.R(520, 320, 320, 180);
    draw(b.pen("agent", "graphite", [...box(agent, b.s()), ...dot(agent.x + 110, agent.y + 70, 18, b.s()), ...dot(agent.x + 210, agent.y + 70, 18, b.s())]), 0.3);
    draw(b.label("agent-label", "agent", 680, 420, 42), 0.15);
    draw(b.pen("split", "graphite", [...arrowLine(b.P(860, 360), b.P(1080, 220), b.s(), 30), ...arrowLine(b.P(860, 460), b.P(1080, 620), b.s(), -30)]), 0.25);
    draw(b.pen("rules", "green", doc(b.R(1100, 80, 300, 240), b.s()), 5), 0.2);
    draw(b.text("rules-label", "rules", 1130, 150, 48, "green"), 0.15);
    draw(b.text("rules-note", "what I\napproved", 1440, 130, 40), 0.25);
    draw(b.pen("refusals", "red", doc(b.R(1100, 500, 300, 240), b.s()), 5), 0.2);
    draw(b.text("refusals-label", "refusals", 1130, 570, 48, "red"), 0.15);
    draw(b.text("refusals-note", "what I rejected,\nwith the reason", 1440, 550, 40), 0.3);
    draw(b.text("n1", "the agent pushes back on a rule once, then follows it", 0, 820, 42), 0.5);
    hold(0.3);
  }

  {
    const b = beat("s2-5", 5, 2, "I rejected seven low-confidence markers before we picked a \"Low\" tag.");
    const cx = 230;
    const cy = 330;
    draw(b.pen("gauge", "graphite", [...line(b.P(cx - 200, cy), b.P(cx + 200, cy), b.s()), ...[arcPath(b.P(cx, cy), 200, b.s())], ...arrowLine(b.P(cx, cy), b.P(cx + 110, cy - 150), b.s())]), 0.4);
    draw(b.label("gauge-label", "risk gauge", cx, cy + 40, 40), 0.2);
    const forms = ["LOW", "Lo", "Low.", "", "", "", "~"];
    const names = ["uppercase", "short form", "full stop", "triangle", "curved", "dashed arc", "tilde"];
    forms.forEach((f, i) => {
      const x = 520 + i * 185;
      const r = b.R(x, 120, 160, 140);
      draw(b.pen(`tile-${i}`, "graphite", box(r, b.s(), 1), 4), 0.06);
      if (f) draw(b.label(`form-${i}`, f, x + 80, 160, 40), 0.06);
      if (i === 3) draw(b.icon("tri", "triangleAlert", x + 50, 140, 60, "graphite", 3.5), 0.06);
      if (i === 4) draw(b.pen("curved", "graphite", [arcPath(b.P(x + 80, 250), 60, b.s(), 0.9)], 3.5), 0.06);
      if (i === 5) draw(b.pen("dashed", "graphite", dashed(b.P(x + 25, 230), b.P(x + 135, 150), b.s(), 14, 12), 3.5), 0.06);
      draw(b.label(`name-${i}`, names[i], x + 80, 285, 26), 0.06);
    });
    draw(b.pen("crosses", "red", forms.flatMap((_, i) => cross(b.X(520 + i * 185 + 80), b.Y(190), 90, b.s())), 5), 0.5);
    const tag = b.R(900, 480, 240, 110);
    draw(b.pen("tag", "green", box(tag, b.s()), 5), 0.2);
    draw(b.label("tag-label", "Low", 1020, 505, 56, "green"), 0.15);
    draw(b.pen("tag-tick", "green", tick(b.X(1190), b.Y(535), 60, b.s()), 6), 0.12);
    draw(b.text("landed", "a small tag", 1250, 505, 44, "green"), 0.2);
    draw(b.text("n1", "all seven are in the refusals list,\nso no agent suggests them again", 520, 690, 42), 0.6);
    hold(0.3);
  }

  {
    const b = beat("s2-6", 6, 2, "Two teammates now add their own rules.");
    const file = b.R(650, 40, 500, 620);
    draw(b.pen("file", "graphite", [...doc(file, b.s()), ...bars(file.x + 50, file.y + 170, [380, 320, 400, 300, 360, 280], 64, b.s())]), 0.6);
    draw(b.text("file-label", "privy-ui-standards", 690, 90, 38), 0.25);
    draw(b.pen("me", "graphite", person(b.X(260), b.Y(520), 240, b.s())), 0.25);
    draw(b.label("me-label", "me", 260, 550, 44), 0.1);
    draw(b.pen("me-arrow", "graphite", arrowLine(b.P(420, 380), b.P(630, 340), b.s(), 30)), 0.15);
    draw(b.pen("mates", "green", [...person(b.X(1500), b.Y(300), 200, b.s()), ...person(b.X(1500), b.Y(640), 200, b.s())], 5), 0.3);
    draw(b.text("mates-label", "teammates", 1600, 450, 44, "green"), 0.2);
    draw(b.pen("mates-arrows", "green", [...arrowLine(b.P(1380, 220), b.P(1170, 250), b.s(), -30), ...arrowLine(b.P(1380, 560), b.P(1170, 500), b.s(), 30)], 5), 0.2);
    draw(b.text("rules", "rules: 129 -> 270", 0, 780, 50), 0.35);
    draw(b.text("refusals", "refusals: 33 -> 141", 900, 780, 50), 0.35);
    hold(0.3);
  }

  // Skill 3: privy-illustration

  {
    const b = beat("s3-1", 0, 3, "Our illustrations came from Storyset and didn't look like one product.", "Skill 3: privy-illustration");
    const a = b.R(0, 80, 500, 420);
    const c2 = b.R(650, 80, 500, 420);
    const c3 = b.R(1300, 80, 500, 420);
    draw(b.pen("a", "graphite", [...box(a, b.s(), 3), ...person(a.x + 250, a.y + 360, 260, b.s())], 7), 0.5);
    draw(b.pen("b", "graphite", [...box(c2, b.s(), 1), ...hatch({ x: c2.x + 60, y: c2.y + 60, w: 380, h: 300 }, b.s(), 34), ...doc({ x: c2.x + 150, y: c2.y + 90, w: 200, h: 240 }, b.s())], 3), 0.5);
    draw(b.pen("c", "graphite", [...box(c3, b.s()), ...[0, 1, 2, 3, 4].flatMap((i) => dot(c3.x + 90 + i * 80, c3.y + 210 + (i % 2) * 70, 30 + (i % 3) * 8, b.s()))], 4.5), 0.5);
    draw(b.text("hours", "every edit took hours", 0, 620, 46, "red"), 0.4);
    draw(b.text("mixed", "and no two pieces looked like the same product", 0, 710, 46, "red"), 0.5);
    hold(0.3);
  }

  {
    const b = beat("s3-2", 1, 3, "I tried Gemini first and kept 5 of 24 images.");
    const size = 200;
    for (let i = 0; i < 24; i++) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      const f = b.art(`g-${i}`, `../gemini/gemini-${String(i + 1).padStart(2, "0")}.webp`, col * 225, 20 + row * 225, size, size);
      show(f, 0, 0.08, i % 8 !== 0);
    }
    draw(b.text("kept", "kept 5 of 24", 0, 720, 54), 0.3);
    draw(b.text("blue", "the brand blue was wrong in every image", 0, 820, 44, "red"), 0.5);
    hold(0.4);
  }

  {
    const b = beat("s3-3", 2, 3, "I drew six styles and picked isometric.");
    const names = ["geometric", "fine-line", "isometric", "layered", "data-as-form", "duotone"];
    const files = ["direction-1-geometric", "direction-2-fine-line", "direction-3-isometric", "direction-4-layered", "direction-5-data-form", "direction-6-duotone"];
    const w = 560;
    const h = 296;
    files.forEach((file, i) => {
      const x = (i % 3) * 620;
      const y = 20 + Math.floor(i / 3) * 420;
      const f = b.art(`d-${i}`, `${file}.svg`, x, y, w, h);
      show(f, 0, 0.25);
      draw(b.text(`name-${i}`, names[i], x, y + h + 20, 38), 0.12);
    });
    draw(b.pen("pick", "green", circle(b.R(1240, 20, w, h), b.s(), 22), 6), 0.4);
    draw(b.text("depth", "it added depth", 1240 + 200, 20 + h + 20, 38, "green"), 0.25);
    hold(0.4);
  }

  {
    const b = beat("s3-4", 3, 3, "After a review with my manager, I dropped isometric for a flat style.");
    const iso = b.R(0, 140, 720, 381);
    draw(b.text("iso-label", "isometric", 0, 70, 44), 0.2);
    show(b.art("iso", "direction-3-isometric.svg", 0, 140, 720, 381), 0, 0.4);
    hold(0.2);
    draw(b.pen("strike", "red", strike(iso, b.s()), 8), 0.3);
    draw(b.text("review", "retired 9 days later,\nafter a review with my manager", 0, 580, 42, "red"), 0.5);
    draw(b.text("glass", "a frosted-glass version was reverted the same day", 0, 760, 36, "red"), 0.45);
    draw(b.pen("to-soft", "green", arrowLine(b.P(760, 330), b.P(1150, 310), b.s(), 60), 6), 0.25);
    show(b.art("soft", "soft-stack-anatomy.svg", 1180, 40, 540, 540), 0, 0.4);
    draw(b.label("soft-label", "Soft-Stack", 1450, 610, 52, "green"), 0.25);
    hold(0.4);
  }

  {
    const b = beat("s3-5", 4, 3, "The content changes for each illustration, but the style rules don't.");
    show(b.art("anatomy", "soft-stack-anatomy.svg", 640, 60, 520, 520), 0, 0.4);
    draw(b.text("ask", "asked each time", 0, 80, 44), 0.25);
    draw(b.text("ask-list", "the moment\nthe feeling\nthe one message", 0, 170, 42), 0.5);
    draw(b.pen("ask-arrow", "graphite", arrowLine(b.P(420, 280), b.P(620, 300), b.s(), -30)), 0.15);
    draw(b.text("fixed", "never changes", 1250, 80, 44, "green"), 0.25);
    draw(b.text("fixed-list", "one soft shadow\na grid underneath\none accent colour,\npicked by meaning", 1250, 170, 42, "green"), 0.6);
    draw(b.pen("fixed-arrow", "green", arrowLine(b.P(1230, 300), b.P(1180, 320), b.s()), 5), 0.1);
    const meanings = ["neutral", "brand", "success", "error", "warning", "info"];
    meanings.forEach((m, i) => show(b.art(`m-${i}`, `meaning-${m}.svg`, 280 + i * 210, 660, 180, 180), 0, 0.1, i > 0));
    draw(b.text("meaning", "green for success, red for errors", 280, 860, 36, "green"), 0.35);
    hold(0.4);
  }

  {
    const b = beat("s3-6", 5, 3, "The illustrations now ship in consent screens and Data Compass.");
    show(b.art("empty", "proof-connections-empty.svg", 0, 40, 520, 520), 0, 0.4);
    draw(b.text("empty-label", "empty state", 0, 590, 40), 0.15);
    show(b.art("revoked", "proof-revoked.svg", 600, 40, 520, 520), 0, 0.4);
    draw(b.text("revoked-label", "consent revoked", 600, 590, 40), 0.15);
    draw(b.text("decisions", "59 decisions\nin 15 days", 1240, 80, 46), 0.35);
    draw(b.text("mate", "a teammate added\n2 rules to it", 1240, 300, 46), 0.35);
    draw(b.text("leaders", "leadership liked\nthis skill the most", 1240, 520, 46, "green"), 0.35);
    hold(0.4);
  }

  // Outcome

  {
    const b = beat("c1", 0, 4, "Every decision I make goes into a file the next agent reads.", "Outcome");
    const nodes: [string, number, number, Ink][] = [
      ["feedback", 900, 60, "graphite"],
      ["rule or refusal", 1480, 400, "green"],
      ["next agent reads it", 900, 740, "graphite"],
      ["fewer rounds", 320, 400, "green"],
    ];
    nodes.forEach(([name, x, y, color], i) => {
      draw(b.label(`node-${i}`, name, x, y, 48, color), 0.25);
      const [, nx, ny] = nodes[(i + 1) % nodes.length];
      const from = b.P(x + (nx - x) * 0.3, y + 40 + (ny - y) * 0.3);
      const to = b.P(x + (nx - x) * 0.7, y + 40 + (ny - y) * 0.7);
      draw(b.pen(`arrow-${i}`, "graphite", arrowLine(from, to, b.s(), -60)), 0.18);
    });
    draw(b.pen("mates", "green", [...person(b.X(1640), b.Y(700), 130, b.s()), ...person(b.X(1760), b.Y(700), 130, b.s())], 4), 0.2);
    draw(b.text("mates-label", "teammates add rules too", 1280, 730, 36, "green"), 0.3);
    hold(0.4);
  }

  {
    const b = beat("c2", 1, 4, "Results");
    const cols: [string, string, number][] = [
      ["20", "people working\nin the repo", 0],
      ["2 weeks -> 2 days", "one feature, PRD\nto built UI", 560],
      ["2", "teammates\nadding rules", 1420],
    ];
    cols.forEach(([big, small, x], i) => {
      draw(b.text(`big-${i}`, big, x, 120, i === 1 ? 84 : 170, "green"), 0.35);
      draw(b.text(`small-${i}`, small, x, 400, 44), 0.3);
    });
    draw(b.pen("rule", "green", underline(b.R(0, 300, 1780, 10), b.s()), 5), 0.3);
    hold(0.5);
  }

  const world = { w: cell(7, 0).x, h: cell(0, 5).y };
  cam(pad({ x: 0, y: 0, ...world }, 160), 2);
  hold(0.8);

  return finish(world);
}

/** A hand-drawn question mark with its top-left near `at`. */
function penQ(at: Point, seed: number): string[] {
  const [x, y] = at;
  const hook: Point[] = [...arc(x + 28, y + 28, 28, 28, Math.PI * 1.05, Math.PI * 2.35, 8), [x + 32, y + 72], [x + 32, y + 92]];
  return [smoothPath(jitter(hook, 1.5, seeded(seed))), ...dot(x + 32, y + 118, 4, seed)];
}

/** The upper part of a circle, for the gauge and the curved caption. */
function arcPath(center: Point, r: number, seed: number, sweep = 1): string {
  const [cx, cy] = center;
  const start = Math.PI + (Math.PI * (1 - sweep)) / 2;
  const end = Math.PI * 2 - (Math.PI * (1 - sweep)) / 2;
  return smoothPath(jitter(arc(cx, cy, r, r, start, end, 14), 1.5, seeded(seed)));
}
