/**
 * One scroll listener for every reading line on the page. Positions are
 * cached at registration and on resize, so a frame does zero layout reads.
 */
export type Band = { center: number; height: number };

type Entry = {
  el: HTMLElement;
  band: Band;
  lockOnce: boolean;
  top: number;
  height: number;
  fill: number;
  active: boolean;
  past: boolean;
};

const entries = new Set<Entry>();
let frame = 0;
let listening = false;
let resizeFrame = 0;

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function measure(entry: Entry) {
  const rect = entry.el.getBoundingClientRect();
  entry.top = rect.top + window.scrollY;
  entry.height = rect.height;
}

function paint(entry: Entry, scrollY: number, vh: number) {
  const bandH = vh * entry.band.height;
  const bandBottom = scrollY + vh * (entry.band.center + entry.band.height / 2);
  const lineCenter = entry.top + entry.height / 2;
  const p = Math.min(1, Math.max(0, (bandBottom - lineCenter) / bandH));
  const fill = easeOutCubic(p);

  if (Math.abs(fill - entry.fill) >= 0.005 || (fill === 1 && entry.fill !== 1) || (fill === 0 && entry.fill !== 0)) {
    entry.fill = fill;
    entry.el.style.setProperty("--line-fill", `${(-14 + fill * 128).toFixed(2)}%`);
  }

  const active = entry.lockOnce ? entry.active || p >= 0.5 : p >= 0.5;
  if (active !== entry.active) {
    entry.active = active;
    entry.el.classList.toggle("is-line-active", active);
  }

  const past = entry.lockOnce ? entry.past || p >= 1 : p >= 1;
  if (past !== entry.past) {
    entry.past = past;
    entry.el.classList.toggle("is-line-past", past);
  }
}

function tick() {
  frame = 0;
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  for (const entry of entries) paint(entry, scrollY, vh);
}

function schedule() {
  if (!frame) frame = window.requestAnimationFrame(tick);
}

function remeasureAll() {
  resizeFrame = 0;
  for (const entry of entries) measure(entry);
  schedule();
}

function onResize() {
  if (!resizeFrame) resizeFrame = window.requestAnimationFrame(remeasureAll);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize);
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", onResize);
  if (frame) window.cancelAnimationFrame(frame);
  if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
  frame = 0;
  resizeFrame = 0;
}

export function registerLine(el: HTMLElement, band: Band, lockOnce: boolean) {
  const entry: Entry = { el, band, lockOnce, top: 0, height: 0, fill: -1, active: false, past: false };
  measure(entry);
  entries.add(entry);
  start();
  paint(entry, window.scrollY, window.innerHeight);
  return () => {
    entries.delete(entry);
    if (entries.size === 0) stop();
  };
}

/** Call after a layout change that moved lines without a window resize. */
export function remeasureLines() {
  onResize();
}
