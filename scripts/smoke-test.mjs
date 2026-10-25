import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000";
mkdirSync("scripts/shots", { recursive: true });

const browser = await chromium.launch({
  // Use full Chromium (new headless) rather than the headless shell. The shell's
  // GL backend logs a "GPU stall due to ReadPixels" driver warning for *any*
  // WebGL canvas (verified with a minimal page), which is noise, not app output.
  channel: "chromium",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));

await page.goto(url, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(4000);
await page.screenshot({ path: "scripts/shots/hero.png" });

const report = {};
report.heroVideo = await page
  .$eval("section#top video", (v) => ({ readyState: v.readyState, opacity: getComputedStyle(v).opacity }))
  .catch(() => "MISSING");
report.capabilitiesVideo = await page
  .$eval("section#capabilities video", (v) => ({ readyState: v.readyState, opacity: getComputedStyle(v).opacity }))
  .catch(() => "MISSING");
report.processMode = (await page.$("section#process.work-gallery--static")) ? "STATIC (animation off)" : "pinned";
report.processCanvas = await page
  .$eval("section#process canvas", (c) => ({ width: c.width, height: c.height }))
  .catch(() => "MISSING");

await page.evaluate(() => document.querySelector("#process")?.scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(800);
report.stageBefore = await page.textContent(".work-gallery__stagetop").catch(() => null);
await page.mouse.wheel(0, 1500);
await page.waitForTimeout(1500);
report.stageAfter = await page.textContent(".work-gallery__stagetop").catch(() => null);
await page.screenshot({ path: "scripts/shots/process.png" });

await page.evaluate(() => document.querySelector(".price")?.scrollIntoView({ behavior: "instant", block: "start" }));
await page.waitForTimeout(1200);
await page.screenshot({ path: "scripts/shots/pricing.png" });

report.failedSectionMessage = (await page.content()).includes("failed to load");
report.problems = problems;
console.log(JSON.stringify(report, null, 2));
await browser.close();
