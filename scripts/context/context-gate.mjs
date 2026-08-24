import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function evaluateContext({ marketingRoot, clientId, request, jobType = request?.request_type || "other" }) {
  const clientRoot = path.join(marketingRoot, "clients", clientId);
  const files = {
    client: path.join(clientRoot, "client.md"),
    brandKit: path.join(clientRoot, "brand-kit.json"),
    strategy: path.join(clientRoot, "outputs", "strategy", "strategy-decision.json"),
    creativeBrief: path.join(clientRoot, "outputs", "creative-direction", "creative-brief.carousel.json"),
  };
  const [clientText, brandKit, strategy, creativeBrief] = await Promise.all([
    readText(files.client),
    readJson(files.brandKit),
    readJson(files.strategy),
    readJson(files.creativeBrief),
  ]);
  const errors = [];
  const warnings = [];
  const reference = request?.reference_snapshot || {};

  if (!clientText) errors.push("client.md ausente.");
  if (!brandKit) warnings.push("brand-kit.json ausente.");
  // Jobs de CONTEÚDO exigem a decisão estratégica; strategy/funnel CRIAM a decisão
  // (o executor grava outputs/strategy/strategy-decision.json ao concluir) — não podem
  // exigir o arquivo, senão a operação fica em deadlock.
  const strategyRequired = new Set(["carousel", "post", "video", "generative_video", "ads", "automation", "publish"]);
  if (!strategy && strategyRequired.has(jobType)) errors.push("strategy-decision.json ausente.");
  if (strategy?.client_slug && strategy.client_slug !== clientId) errors.push(`strategy-decision pertence a ${strategy.client_slug}, não a ${clientId}.`);
  if (creativeBrief?.client_slug && creativeBrief.client_slug !== clientId) errors.push(`creative brief pertence a ${creativeBrief.client_slug}, não a ${clientId}.`);
  if (request?.client_id && request.client_id !== clientId) errors.push(`work_request pertence a ${request.client_id}, não a ${clientId}.`);
  if (!reference.client?.client_id) warnings.push("Pedido sem snapshot de cliente completo.");

  const source = `${clientText} ${JSON.stringify(reference)}`.toLowerCase();
  const strategyText = JSON.stringify(strategy || {}).toLowerCase();
  const conflicts = [
    { source: ["trader", "mercado americano", "ifvg", "ninjatrader"], foreign: ["cabelo", "salão", "beleza", "hidratação", "tratamento capilar"] },
    { source: ["salão", "cabelo", "beleza", "tratamento capilar"], foreign: ["trader", "mercado americano", "ifvg", "ninjatrader"] },
  ];
  for (const pair of conflicts) {
    if (pair.source.some(term => source.includes(term)) && pair.foreign.some(term => strategyText.includes(term))) {
      errors.push("Estratégia incompatível com o domínio do cliente; possível contaminação entre contextos.");
    }
  }

  const snapshot = {
    client_id: clientId,
    client: reference.client || null,
    brand_profile: reference.brand_profile || {},
    voice_profile: reference.voice_profile || {},
    offers: reference.offers || [],
    constraints: reference.constraints || [],
    job_type: jobType,
    strategy_required: strategyRequired.has(jobType),
    strategy_client_slug: strategy?.client_slug || null,
    source_files: Object.fromEntries(Object.entries(files).map(([key, file]) => [key, path.relative(marketingRoot, file).replaceAll("\\", "/")])),
    evaluated_at: new Date().toISOString(),
  };
  const contextHash = crypto.createHash("sha256").update(JSON.stringify({ snapshot, strategy, brandKit })).digest("hex");
  return {
    ok: errors.length === 0,
    status: errors.length === 0 ? "approved" : "blocked",
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    contextHash,
    snapshot,
  };
}

async function readText(file) {
  try { return await readFile(file, "utf8"); } catch { return ""; }
}

async function readJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")); } catch { return null; }
}
