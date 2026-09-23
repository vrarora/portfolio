export const PANEL_PUSH_MAX = 190;

const READING_MAX = 582;

/**
 * How far (in px, negative) the page shell shifts left so a right-edge panel
 * of `panelWidth` does not cover the reading column. Zero on small screens.
 */
export function computePanelPush(panelWidth: number) {
  const vw = window.innerWidth;
  if (vw < 768) return 0;
  const contentRight = vw / 2 + Math.min(vw, READING_MAX) / 2;
  return -Math.min(PANEL_PUSH_MAX, Math.max(0, contentRight + 24 - (vw - panelWidth)));
}

/**
 * Applies `--push` and an open-state class on <html> while a panel is open.
 * Returns the cleanup that removes both.
 */
export function applyPanelPush(className: string, panelWidth: number) {
  const root = document.documentElement;
  root.classList.add(className);
  const apply = () => root.style.setProperty("--push", `${computePanelPush(panelWidth)}px`);
  apply();
  window.addEventListener("resize", apply);
  return () => {
    window.removeEventListener("resize", apply);
    root.style.removeProperty("--push");
    root.classList.remove(className);
  };
}
