import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import path from "node:path";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const clientId = valueAfter("--client");
const jobId = valueAfter("--job");
const inputFile = valueAfter("--input-json");
if (!clientId || !jobId) throw new Error("post-executor: --client e --job obrigatorios");

const input = inputFile && existsSync(inputFile) ? JSON.parse(await readFile(inputFile, "utf8")) : {};
const clientRoot = path.join(marketingRoot, "clients", clientId);
const brandKit = await readJson(path.join(clientRoot, "brand-kit.json"));
const reference = input.reference_snapshot || {};
const brand = brandKit || reference.brand_profile || {};
const name = String(brand.name || reference.client?.display_name || clientId).trim();
const palette = normalizePalette(brand);
const title = String(input.headline || input.title || "Uma decisão melhor começa aqui.").trim();
const body = String(input.body || input.objective || input.prompt || "Clareza para transformar atenção em próxima ação.").trim();
const cta = String(input.cta || "Saiba mais").trim();
const caption = String(input.caption || `${title}\n\n${body}\n\n${cta}`).trim();
const outputDir = path.join(marketingRoot, "outputs", "mediaos", clientId, jobId);
await mkdir(outputDir, { recursive: true });
const htmlPath = path.join(outputDir, "post.html");
const imagePath = path.join(outputDir, "post.png");
await writeFile(htmlPath, buildHtml({ name, title, body, cta, palette }), "utf8");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${htmlPath.replaceAll("\\", "/")}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: imagePath, fullPage: false });
} finally {
  await browser.close();
}

const size = (await import("node:fs")).statSync(imagePath).size;
if (size < 10_000) throw Object.assign(new Error("Post renderizado com arquivo inválido ou vazio."), { retryable: false, blocked: true });
const manifestPath = path.join(outputDir, "post-manifest.json");
await writeFile(manifestPath, JSON.stringify({
  schema_version: "1.0",
  result_type: "post",
  client_id: clientId,
  job_id: jobId,
  renderer: "mediaos-post-renderer-v1",
  dimensions: { width: 1080, height: 1350 },
  files: { image: imagePath, html: htmlPath },
  copy: { title, body, cta, caption },
  brand: { name, palette },
  qa: { status: "passed", checks: ["png_exists", "png_non_empty", "1080x1350_viewport"] },
  generated_at: new Date().toISOString(),
}, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, result_type: "post", client_id: clientId, job_id: jobId, image_path: imagePath, manifest_path: manifestPath, caption }));

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function readJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")); } catch { return null; }
}

function normalizePalette(kit) {
  const colors = kit?.colors || kit?.palette || kit?.brand_colors || {};
  return {
    ink: String(colors.ink || colors.primary || kit?.primary_color || "#171717"),
    paper: String(colors.paper || colors.background || kit?.background_color || "#f4efe7"),
    accent: String(colors.accent || colors.secondary || kit?.accent_color || "#e4572e"),
  };
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function buildHtml({ name, title, body, cta, palette }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;background:${palette.paper};color:${palette.ink};font-family:Arial,Helvetica,sans-serif}body{padding:88px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}.kicker{font-size:25px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:${palette.accent};max-width:700px}.brand{font-size:25px;font-weight:700;letter-spacing:.02em}.title{font-size:94px;line-height:.96;letter-spacing:-.055em;font-weight:800;max-width:900px;margin:36px 0 30px}.body{font-size:32px;line-height:1.18;max-width:760px;color:${palette.ink};opacity:.82}.bottom{display:flex;align-items:end;justify-content:space-between;gap:30px}.cta{font-size:26px;font-weight:700;padding:19px 25px;border:3px solid ${palette.ink};border-radius:999px}.mark{width:112px;height:112px;border-radius:50%;background:${palette.accent};display:grid;place-items:center;color:${palette.paper};font-size:38px;font-weight:800}.rule{height:7px;width:190px;background:${palette.accent};margin-top:42px}
  </style></head><body><div><div class="kicker">${escapeHtml(name)}</div><div class="rule"></div><div class="title">${escapeHtml(title)}</div><div class="body">${escapeHtml(body)}</div></div><div class="bottom"><div class="brand">${escapeHtml(name)}</div><div class="cta">${escapeHtml(cta)}</div><div class="mark">→</div></div></body></html>`;
}
