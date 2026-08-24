import "dotenv/config";
import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const clientId = valueAfter("--client");
const jobId = valueAfter("--job");
const inputFile = valueAfter("--input-json");
if (!clientId || !jobId) throw new Error("research-executor: --client e --job obrigatorios");
const input = inputFile && existsSync(inputFile) ? JSON.parse(await readFile(inputFile, "utf8")) : {};
const brief = String(input.brief || input.question || input.objective || input.prompt || "").trim();
const rawSources = Array.isArray(input.sources) ? input.sources : [];
if (!brief) throw Object.assign(new Error("Pesquisa exige brief ou pergunta."), { retryable: false, blocked: true });
if (!rawSources.length) throw Object.assign(new Error("Pesquisa exige pelo menos uma fonte explícita (URL HTTPS ou arquivo local)."), { retryable: false, blocked: true });

const sources = [];
for (const raw of rawSources.slice(0, 20)) {
  const source = typeof raw === "string" ? { ref: raw } : raw || {};
  const ref = String(source.url || source.path || source.ref || "").trim();
  if (!ref) continue;
  if (/^https:\/\//i.test(ref)) sources.push(await fetchWebSource(ref, source.title));
  else sources.push(await readLocalSource(ref, source.title));
}
if (!sources.length) throw Object.assign(new Error("Nenhuma fonte válida foi coletada."), { retryable: false, blocked: true });

const outputDir = path.join(marketingRoot, "outputs", "mediaos", "research", clientId, jobId);
await mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "research-report.json");
const reportPath = path.join(outputDir, "research-report.md");
const report = {
  schema_version: "1.0",
  result_type: "research",
  client_id: clientId,
  job_id: jobId,
  brief,
  sources,
  findings: Array.isArray(input.findings) ? input.findings : [],
  recommendations: Array.isArray(input.recommendations) ? input.recommendations : [],
  limitations: ["O executor coleta e organiza evidências; síntese estratégica precisa de findings/recommendations ou de uma etapa AI Router configurada."],
  qa: { status: "passed", source_count: sources.length, checks: ["brief_present", "sources_collected", "source_refs_recorded"] },
  generated_at: new Date().toISOString(),
};
await writeFile(outputPath, JSON.stringify(report, null, 2) + "\n", "utf8");
await writeFile(reportPath, toMarkdown(report), "utf8");
console.log(JSON.stringify({ ok: true, result_type: "research", client_id: clientId, job_id: jobId, output_path: outputPath, report_path: reportPath, source_count: sources.length }));

function valueAfter(flag) { const index = process.argv.indexOf(flag); return index >= 0 ? process.argv[index + 1] : null; }

async function fetchWebSource(url, suppliedTitle) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw Object.assign(new Error(`Fonte recusada: somente HTTPS permitido (${url}).`), { retryable: false, blocked: true });
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": "MarketingOS-Research/1.0" } });
  if (!response.ok) throw Object.assign(new Error(`Fonte ${url} respondeu HTTP ${response.status}.`), { retryable: false, blocked: true });
  const contentType = response.headers.get("content-type") || "";
  if (!/text\/(html|plain)|application\/json/i.test(contentType)) throw Object.assign(new Error(`Fonte ${url} nao e texto/HTML.`), { retryable: false, blocked: true });
  const text = (await response.text()).slice(0, 1_000_000);
  return normalizeSource({ ref: url, title: suppliedTitle || extractTitle(text) || url, content_type: contentType, text });
}

async function readLocalSource(ref, suppliedTitle) {
  const candidate = path.resolve(marketingRoot, ref);
  if (!candidate.startsWith(marketingRoot + path.sep) || !existsSync(candidate)) throw Object.assign(new Error(`Fonte local ausente ou fora do workspace: ${ref}`), { retryable: false, blocked: true });
  const text = (await readFile(candidate, "utf8")).slice(0, 1_000_000);
  return normalizeSource({ ref: path.relative(marketingRoot, candidate).replaceAll("\\", "/"), title: suppliedTitle || path.basename(candidate), content_type: "text/plain", text });
}

function normalizeSource({ ref, title, content_type, text }) {
  const clean = text.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { ref, title, content_type, excerpt: clean.slice(0, 1200), sha256: cryptoHash(clean), collected_at: new Date().toISOString() };
}

function extractTitle(text) { return text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim(); }
function cryptoHash(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function toMarkdown(report) { return `# Pesquisa\n\n## Brief\n\n${report.brief}\n\n## Fontes coletadas\n\n${report.sources.map((source, index) => `${index + 1}. **${source.title}** — ${source.ref}\n   - Evidência: ${source.excerpt}`).join("\n")}\n\n## Findings\n\n${report.findings.map(item => `- ${item}`).join("\n") || "Nenhum finding fornecido."}\n\n## Recomendações\n\n${report.recommendations.map(item => `- ${item}`).join("\n") || "Nenhuma recomendação fornecida."}\n`; }
