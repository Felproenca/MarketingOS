import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const projectsRoot = path.resolve(marketingRoot, "..");
const clientId = process.argv[process.argv.indexOf("--client") + 1];
const jobId = process.argv[process.argv.indexOf("--job") + 1];
const type = process.argv[process.argv.indexOf("--type") + 1];
const inputFile = process.argv[process.argv.indexOf("--input-json") + 1];
const input = inputFile && existsSync(inputFile) ? JSON.parse(await readFile(inputFile, "utf8")) : {};
if (!clientId || !jobId || !type) throw new Error("structured-executor: --client, --job e --type obrigatorios");

function run(command, args, cwd = marketingRoot) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) throw Object.assign(new Error(result.stderr || result.stdout || `${command} falhou`), { retryable: false, blocked: true });
  return result.stdout.trim();
}

let source;
let result;
if (type === "strategy") {
  const file = path.join(marketingRoot, "clients", clientId, "outputs", "strategy", "strategy-decision.json");
  if (!existsSync(file)) throw Object.assign(new Error(`Decision estrategica ausente para ${clientId}.`), { retryable: false, blocked: true });
  run(process.execPath, [path.join(marketingRoot, "scripts", "strategy", "validate-decision.js"), "--slug", clientId]);
  source = file;
  result = JSON.parse(await readFile(file, "utf8"));
} else if (type === "funnel") {
  const output = run(process.execPath, [path.join(marketingRoot, "scripts", "funnel", "audit.js"), "audit", "--slug", clientId, "--json"]);
  result = JSON.parse(output);
  source = path.join(marketingRoot, "clients", clientId, "outputs", "acquisition", "funnel-operational-audit.json");
} else if (type === "data_sync") {
  const cli = path.join(projectsRoot, "GrowthOS", "data-now", "cli.js");
  if (!existsSync(cli)) throw Object.assign(new Error("GrowthOS data-now nao encontrado."), { retryable: false, blocked: true });
  result = JSON.parse(run(process.execPath, [cli, "status", clientId], path.dirname(cli)));
  source = cli;
} else if (type === "prospecting") {
  const nicheId = String(input.niche_id || input.niche || "").trim();
  if (!nicheId) throw Object.assign(new Error("Prospeccao exige niche_id."), { retryable: false, blocked: true });
  const script = path.join(marketingRoot, "scripts", "discovery-engine", "index.js");
  const max = Math.max(1, Number(input.max_results || input.max || 5));
  const output = run(process.execPath, [script, `--niche=${nicheId}`, `--max=${max}`]);
  const file = path.join(marketingRoot, "agency", "discovery-leads", `${nicheId}.json`);
  if (!existsSync(file)) throw Object.assign(new Error(`Discovery terminou sem dataset em ${file}.`), { retryable: false, blocked: true });
  source = file;
  result = { niche_id: nicheId, max_results: max, output_tail: output.slice(-4000), leads: JSON.parse(await readFile(file, "utf8")) };
} else if (type === "publish") {
  const artifactId = String(input.artifact_id || "").trim();
  if (!artifactId) throw Object.assign(new Error("Publicacao exige artifact_id."), { retryable: false, blocked: true });
  const supabase = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(`${supabase}/rest/v1/artifacts?id=eq.${encodeURIComponent(artifactId)}&client_id=eq.${encodeURIComponent(clientId)}&select=id,status,title,artifact_type,metadata&limit=1`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
  if (!response.ok) throw Object.assign(new Error(`Nao foi possivel consultar artifact: ${response.status}`), { retryable: false });
  const artifact = (await response.json())?.[0];
  if (!artifact) throw Object.assign(new Error(`Artifact nao encontrado para ${clientId}: ${artifactId}`), { retryable: false, blocked: true });
  if (artifact.status !== "approved") throw Object.assign(new Error(`Publicacao bloqueada: artifact esta em status ${artifact.status}, exige approved.`), { retryable: false, blocked: true });
  const previewUrl = artifact.metadata?.preview_url;
  if (!previewUrl || !/^https:\/\//i.test(previewUrl)) throw Object.assign(new Error("Publicacao bloqueada: artifact nao possui preview_url HTTPS."), { retryable: false, blocked: true });
  const caption = String(input.caption || artifact.title || "").trim();
  if (!caption) throw Object.assign(new Error("Publicacao exige caption."), { retryable: false, blocked: true });
  const dryRun = input.dry_run !== false;
  const publisher = path.join(marketingRoot, "scripts", "publisher", "index.js");
  const args = [publisher, "--slug", clientId, "--file", previewUrl, "--caption", caption, "--format", input.format || "feed", "--channel", input.channel || "instagram"];
  if (dryRun || input.external_confirmation !== true) args.push("--dry-run");
  const output = run(process.execPath, args);
  source = artifactId;
  result = { artifact_id: artifactId, mode: dryRun || input.external_confirmation !== true ? "dry_run" : "published", channel: input.channel || "instagram", format: input.format || "feed", preview_url: previewUrl, publisher_output_tail: output.slice(-4000) };
} else if (type === "ads") {
  const objective = String(input.objective || input.prompt || "gerar demanda qualificada").trim();
  const audience = input.audience || input.target_audience || {};
  const budget = input.budget || null;
  const channels = Array.isArray(input.channels) && input.channels.length ? input.channels : ["Meta Ads"];
  source = path.join(marketingRoot, "clients", clientId, "client.md");
  result = {
    mode: "plan_only",
    approval_required: true,
    objective,
    audience,
    channels,
    budget,
    campaign_structure: { campaign: "objective_and_measurement", ad_sets: "audience_and_placement_tests", ads: "creative_variants_with_utm" },
    measurement: ["spend", "reach", "clicks", "ctr", "cpc", "conversions", "roas"],
    next_step: "Aprovar plano, confirmar conexão Meta e orçamento antes de qualquer criação/publicação externa.",
  };
} else if (type === "automation") {
  const trigger = String(input.trigger || input.prompt || "novo lead qualificado").trim();
  const consent = input.consent === true;
  source = path.join(marketingRoot, "clients", clientId, "client.md");
  result = {
    mode: "queue_only",
    approval_required: true,
    external_send: false,
    trigger,
    routing: input.routing || { owner: "operator", next_step: "revisar e aprovar fila" },
    consent,
    queue: Array.isArray(input.messages) ? input.messages.map((message, index) => ({ id: `message-${index + 1}`, message, status: consent ? "awaiting_approval" : "blocked_without_consent" })) : [],
    next_step: consent ? "Aprovar a fila e confirmar canal/conexão antes do envio." : "Registrar consentimento válido antes de criar mensagens enviáveis.",
  };
} else {
  throw Object.assign(new Error(`structured-executor nao conectado para ${type}.`), { retryable: false, blocked: true });
}

const outputDir = path.join(marketingRoot, "outputs", "mediaos", "structured", clientId, jobId);
await mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `${type}-result.json`);
await writeFile(outputPath, JSON.stringify({ schema_version: "1.0", result_type: type, client_id: clientId, source, generated_at: new Date().toISOString(), data: result }, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ok: true, result_type: type, client_id: clientId, output_path: outputPath, source }));
