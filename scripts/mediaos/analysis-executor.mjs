import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const projectsRoot = path.resolve(marketingRoot, "..");
const clientId = process.argv[process.argv.indexOf("--client") + 1];
const jobId = process.argv[process.argv.indexOf("--job") + 1] || `analysis-${Date.now()}`;
if (!clientId) throw Object.assign(new Error("analysis-executor: --client obrigatorio"), { retryable: false });

const dataNow = path.join(projectsRoot, "GrowthOS", "data-now", "cli.js");
const statusDir = path.join(projectsRoot, "GrowthOS", "data-now", "data", "clients", clientId, "status");
if (!existsSync(dataNow) || !existsSync(statusDir)) throw Object.assign(new Error(`GrowthOS sem dados sincronizados para client_id=${clientId}.`), { retryable: false, blocked: true });

const result = spawnSync(process.execPath, [dataNow, "status", clientId], { cwd: path.dirname(dataNow), encoding: "utf8", windowsHide: true });
if (result.status !== 0) throw Object.assign(new Error(result.stderr || result.stdout || "GrowthOS analysis falhou"), { retryable: false });
let data;
try { data = JSON.parse(result.stdout); } catch { throw Object.assign(new Error("GrowthOS retornou dados invalidos."), { retryable: false }); }

const outputDir = path.join(marketingRoot, "outputs", "mediaos", "analysis", clientId, jobId);
await mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "analysis-result.json");
await writeFile(outputPath, JSON.stringify({ schema_version: "1.0", result_type: "data_analysis", client_id: clientId, generated_at: new Date().toISOString(), source: "GrowthOS/data-now", data }, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, client_id: clientId, output_path: outputPath, result_type: "data_analysis", source: "GrowthOS/data-now" }));
