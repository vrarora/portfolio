const { chromium } = require("/Users/vaibhavarora/Port 3/node_modules/playwright");
const points = process.argv.slice(3).map(Number);
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000/story/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  for (const p of points) {
    await page.evaluate((p) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p), p);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/p${String(p).replace(".", "_")}.png` });
  }
  await browser.close();
})();
