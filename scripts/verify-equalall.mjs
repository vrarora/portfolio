/**
 * End-to-end verification of the EqualAll mockup and its case-study demos.
 *
 * Usage:
 *   BASE_URL=http://localhost:3001 node scripts/verify-equalall.mjs
 *
 * Asserts the full interactive donation flow, the live embeds on the atlas
 * case study (playing via Lenis-native wheel scrolling), the reduced-motion
 * fallback, and the two-player scheduler cap.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";
let failures = 0;

function check(label, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures += 1;
}

const browser = await chromium.launch();

// ---- Interactive flow -----------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE_URL}/mockups/equalall/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);

  await page.locator('[data-ea-target="donate-bar"]').click();
  await page.waitForTimeout(600);
  check("gift sheet opens from dock", await page.locator(".ea-sheet").isVisible());
  check(
    "CTA disabled before selection",
    await page.locator('[data-ea-target="gift-continue"]').isDisabled(),
  );

  await page.locator('[data-ea-target="tier-t100"]').click();
  await page.waitForTimeout(450);
  const armed = await page.locator('[data-ea-target="gift-continue"]').innerText();
  // slot-text renders each character in its own span; normalize before matching
  check("tier selection arms CTA with amount", armed.replace(/\s+/g, "").includes("$100"));

  await page.locator('[data-ea-target="freq-monthly"]').click();
  await page.waitForTimeout(450);
  const monthly = await page.locator('[data-ea-target="gift-continue"]').innerText();
  check("monthly toggle reframes CTA", monthly.includes("monthly"));
  await page.locator('[data-ea-target="freq-once"]').click();
  await page.waitForTimeout(350);

  await page.locator('[data-ea-target="gift-continue"]').click();
  await page.waitForTimeout(700);
  check("confirm shows the tangible card", await page.locator(".ea-tangible-card").isVisible());

  await page.locator('[data-ea-target="confirm-give"]').click();
  await page.waitForTimeout(600);
  check("payment sheet appears", await page.locator(".ea-pay-sheet").isVisible());

  // processing (2.5s) + dawn + journey choreography + reference roll
  // (reference settles ~mount + 4.25s; see keepsakeTiming.ts)
  await page.locator('[data-ea-target="pay-confirm"]').click();
  await page.waitForTimeout(7300);
  const ref = await page.locator(".ea-keepsake-meta dd").first().innerText();
  check(
    "keepsake shows a reference number",
    /EA-\d{6}/.test(ref.replace(/\s+/g, "")),
  );

  await page.waitForTimeout(1400);
  await page.locator('[data-ea-target="invite-accept"]').click();
  await page.waitForTimeout(700);
  const upgraded = await page.locator(".ea-invite-set").innerText();
  check("recurring invite upgrades to monthly", upgraded.includes("monthly"));

  await page.locator('[data-ea-target="keepsake-done"]').click();
  await page.waitForTimeout(700);
  check("reset returns to the story", await page.locator(".ea-hero").isVisible());
  check("no page errors in flow", errors.length === 0);
  await page.close();
}

// ---- Case-study embeds ----------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE_URL}/case-studies/atlas/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(6500);
  const demos = await page.locator(".ea-demo").count();
  check("demos mount on scroll", demos >= 2);

  const progressed = await page.evaluate(() => {
    const initial = {
      anchor: "Doubt starts at the amount",
      impact: "Amounts were bare numbers",
      tangible: "A checkout ends on an abstract total",
      carousel: "Donors reached for the photo",
      recurring: "The most moved donors will not come back",
    };
    return [...document.querySelectorAll(".ea-demo")].filter((d) => {
      const caption = d.querySelector(".ea-demo-caption")?.textContent;
      return caption !== initial[d.dataset.experiment];
    }).length;
  });
  check("at least one demo is playing", progressed >= 1);
  check("scheduler caps playback at two", progressed <= 2);
  check("no page errors on case study", errors.length === 0);
  await page.close();
}

// ---- Reduced motion -------------------------------------------------------
{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.goto(`${BASE_URL}/case-studies/atlas/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 420);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(2500);
  const fingers = await page.evaluate(
    () =>
      [...document.querySelectorAll(".ea-finger")].filter(
        (f) => getComputedStyle(f).opacity !== "0",
      ).length,
  );
  check("reduced motion shows no synthetic finger", fingers === 0);
  await page.close();
}

await browser.close();

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
