/**
 * Frame-by-frame visual audit of the EqualAll mockup.
 * Captures every steady state plus mid-transition frames at 2x DPR
 * so each screen can be inspected at pixel level.
 *
 * Usage: BASE_URL=http://localhost:3001 node scripts/audit-equalall.mjs [--states-only]
 * Output: .audit/equalall/*.png
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";
const OUT_DIR = new URL("../.audit/equalall/", import.meta.url).pathname;
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto(`${BASE_URL}/mockups/equalall/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2400);

async function shot(name) {
  await page.locator(".ea-viewport").screenshot({
    path: join(OUT_DIR, `${name}.png`),
    animations: "allow",
  });
  console.log(`  ${name}`);
}

async function tap(target) {
  await page.locator(`[data-ea-target="${target}"]`).click();
}

console.log("steady states:");

// --- Story screen ---
await shot("01-story-top");
await page.locator(".ea-scroll").evaluate((el) => {
  el.scrollTo({ top: 520, behavior: "instant" });
});
await page.waitForTimeout(400);
await shot("02-story-mid");
await page.locator(".ea-scroll").evaluate((el) => {
  el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
});
await page.waitForTimeout(400);
await shot("03-story-bottom");
await page.locator(".ea-scroll").evaluate((el) => {
  el.scrollTo({ top: 0, behavior: "instant" });
});
await page.waitForTimeout(400);

// --- Gift sheet ---
await tap("donate-bar");
await page.waitForTimeout(160);
await shot("04-gift-opening-mid");
await page.waitForTimeout(700);
await shot("05-gift-initial");
await tap("tier-t100");
await page.waitForTimeout(600);
await shot("06-gift-t100");
await tap("freq-monthly");
await page.waitForTimeout(160);
await shot("07-gift-monthly-toggle-mid");
await page.waitForTimeout(500);
await shot("08-gift-monthly");
await tap("freq-once");
await page.waitForTimeout(500);

// --- Tangible confirm ---
await tap("gift-continue");
await page.waitForTimeout(150);
await shot("09-confirm-step-mid");
await page.waitForTimeout(900);
await shot("10-confirm-t100");
await tap("confirm-back");
await page.waitForTimeout(700);
await tap("freq-monthly");
await page.waitForTimeout(400);
await tap("gift-continue");
await page.waitForTimeout(1000);
await shot("11-confirm-monthly");
await tap("confirm-back");
await page.waitForTimeout(600);
await tap("freq-once");
await page.waitForTimeout(400);
await tap("gift-continue");
await page.waitForTimeout(900);

// --- Payment ---
await tap("confirm-give");
await page.waitForTimeout(150);
await shot("12-payment-opening-mid");
await page.waitForTimeout(650);
await shot("13-payment-details");
await tap("pay-confirm");
await page.waitForTimeout(700);
await shot("14-payment-processing");
await page.waitForTimeout(1100);
await shot("15-payment-check");

// --- Keepsake --- (mounts 2.5s after pay-confirm; dawn breaks over ~1.6s,
// journey unfolds until ~mount + 4.3s; see keepsakeTiming.ts)
await page.waitForTimeout(1300);
await shot("16-keepsake-dawn");
await page.waitForTimeout(700);
await shot("17-keepsake-entering");
await page.waitForTimeout(1200);
await shot("18-keepsake-journey-drawing");
await page.waitForTimeout(1900);
await shot("19-keepsake-settled");
await tap("invite-accept");
await page.waitForTimeout(900);
await shot("20-keepsake-monthly-upgraded");

// Keepsake scrolled to bottom (check overflow)
await page.locator(".ea-keepsake-content").evaluate((el) => {
  el.scrollTo({ top: el.scrollHeight, behavior: "instant" });
});
await page.waitForTimeout(300);
await shot("21-keepsake-bottom");

// --- Reset loop back to story ---
await tap("keepsake-done");
await page.waitForTimeout(900);
await shot("22-after-reset");

await page.close();

// --- Desktop stage (phone frame on canvas) ---
const desktop = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await desktop.goto(`${BASE_URL}/mockups/equalall/`, { waitUntil: "networkidle" });
await desktop.waitForTimeout(2400);
await desktop.screenshot({ path: join(OUT_DIR, "21-desktop-stage.png") });
console.log("  21-desktop-stage");
await desktop.close();

// --- Case study embeds ---
const cs = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await cs.goto(`${BASE_URL}/case-studies/atlas/`, { waitUntil: "networkidle" });
await cs.waitForTimeout(1000);
const shells = cs.locator(".ea-demo-shell, .ea-demo");
const count = await shells.count();
console.log(`embeds found: ${count}`);
for (let i = 0; i < Math.min(count, 5); i++) {
  const shell = shells.nth(i);
  await shell.scrollIntoViewIfNeeded().catch(() => {});
  await cs.mouse.wheel(0, 120);
  await cs.waitForTimeout(2600);
  await shell.screenshot({
    path: join(OUT_DIR, `22-embed-${i + 1}.png`),
  });
  console.log(`  22-embed-${i + 1}`);
}
await cs.close();

await browser.close();
console.log(`\nwrote captures to ${OUT_DIR}`);
