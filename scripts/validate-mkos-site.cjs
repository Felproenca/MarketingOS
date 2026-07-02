const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const sitePath = path.join(root, "site", "index.html");
const captureDir = path.join(
  root,
  "clients",
  "felipe-proenca",
  "outputs",
  "site",
  "mkos-main",
  "captures"
);

fs.mkdirSync(captureDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 }
  ]) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1
    });
    const errors = [];

    page.on("pageerror", (error) => errors.push(`pageerror:${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console:${message.text()}`);
    });

    await page.goto(`file:///${sitePath.replace(/\\/g, "/")}`, {
      waitUntil: "load"
    });
    await page.waitForTimeout(350);

    const baseline = await page.evaluate(() => {
      const hero = document.querySelector(".hero");
      const primary = document.querySelector(".hero .btn");
      const canvas = document.querySelector("#signal-canvas");
      const h1 = document.querySelector("h1");
      const interactive = document.querySelectorAll("button, a[href], input, textarea");
      return {
        title: document.title,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        heroHeight: hero?.getBoundingClientRect().height || 0,
        primaryVisible:
          Boolean(primary) &&
          primary.getBoundingClientRect().top < window.innerHeight &&
          primary.getBoundingClientRect().bottom > 0,
        canvasReady: Boolean(canvas && canvas.width > 0 && canvas.height > 0),
        h1Text: h1?.textContent?.trim() || "",
        interactiveCount: interactive.length,
        missingLabels: Array.from(document.querySelectorAll("input:not([type=hidden]), textarea"))
          .filter((field) => !field.closest("label")).length
      };
    });

    await page.locator('[data-key="previsibilidade"]').click();
    const detailChanged = await page
      .locator("#detail-title")
      .textContent()
      .then((text) => text.includes("próximo mês"));

    const lastChoice = page.locator(".choice").last();
    await lastChoice.click();
    const symptomSelected = await page
      .locator("#selected-symptom")
      .inputValue()
      .then((value) => value.includes("meses bons"));

    await page.getByPlaceholder("Como você prefere ser chamado").fill("Teste");
    await page.getByPlaceholder("Empresa ou segmento").fill("Negócio teste");

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < scrollHeight; y += Math.floor(viewport.height * 0.7)) {
      await page.evaluate((position) => window.scrollTo(0, position), y);
      await page.waitForTimeout(45);
    }
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        element.classList.add("visible");
      });
    });
    await page.waitForTimeout(180);

    const screenshot = path.join(captureDir, `${viewport.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    results.push({
      viewport: viewport.name,
      ...baseline,
      detailChanged,
      symptomSelected,
      errors,
      screenshot
    });

    await page.close();
  }

  await browser.close();

  const failures = results.flatMap((result) => {
    const issues = [];
    if (result.overflow > 1) issues.push(`${result.viewport}:horizontal-overflow:${result.overflow}`);
    if (!result.primaryVisible) issues.push(`${result.viewport}:primary-cta-below-fold`);
    if (!result.canvasReady) issues.push(`${result.viewport}:canvas-not-ready`);
    if (!result.detailChanged) issues.push(`${result.viewport}:bottleneck-interaction-failed`);
    if (!result.symptomSelected) issues.push(`${result.viewport}:diagnostic-choice-failed`);
    if (result.missingLabels) issues.push(`${result.viewport}:missing-labels:${result.missingLabels}`);
    issues.push(...result.errors.map((error) => `${result.viewport}:${error}`));
    return issues;
  });

  console.log(JSON.stringify({ results, failures }, null, 2));
  if (failures.length) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
