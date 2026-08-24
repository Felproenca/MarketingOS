import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function option(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function flag(name) {
  return process.argv.includes(name);
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "pedido";
}

function nowForId(date = new Date()) {
  return date.toISOString().replace(/[-:.]/g, "").replace("T", "t").replace("Z", "z").toLowerCase();
}

function execCore(coreCli, args, cwd) {
  const result = spawnSync(process.execPath, [coreCli, ...args], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `EcosystemCore falhou: ${args.join(" ")}`);
  }
  return result.stdout.trim();
}

async function readOptional(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
}

async function readJsonOptional(file) {
  const raw = await readOptional(file);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { parse_error: true, source_file: file };
  }
}

function excerpt(value, max = 2400) {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max)}\n...[truncated]` : text;
}

function demandType(type) {
  const normalized = slugify(type);
  if (["carousel", "carrossel", "post", "blog", "roteiro", "script"].includes(normalized)) return "content";
  if (["funil", "funnel", "sales-funnel"].includes(normalized)) return "sales_funnel";
  if (["diagnostic", "diagnostico", "auditoria"].includes(normalized)) return "diagnostic";
  if (["instagram", "instagram-analysis"].includes(normalized)) return "instagram_analysis";
  return "other";
}

function primaryMetric(type) {
  const normalized = slugify(type);
  if (["carousel", "carrossel"].includes(normalized)) return "saves";
  if (["reel", "video", "roteiro", "script"].includes(normalized)) return "retention";
  if (["funil", "funnel", "sales-funnel"].includes(normalized)) return "qualified_leads";
  return "engagement";
}

function productionTarget(type) {
  const normalized = slugify(type);
  if (["reel", "video", "roteiro", "script"].includes(normalized)) return "EditorOS";
  if (["carousel", "carrossel", "post", "blog", "site"].includes(normalized)) return "DesingOS";
  return "";
}

function formatFor(type) {
  const normalized = slugify(type);
  if (["reel", "video", "roteiro", "script"].includes(normalized)) return { kind: "video", platform: "instagram" };
  if (["blog"].includes(normalized)) return { kind: "article", platform: "owned_media" };
  if (["site"].includes(normalized)) return { kind: "site", platform: "web" };
  return { kind: "carousel", platform: "instagram" };
}

function audienceDescription(audience, brandKit) {
  if (typeof audience?.description === "string" && audience.description.trim()) return audience.description.trim();
  const profile = audience?.profile;
  if (profile && typeof profile === "object") {
    const parts = [
      profile.nicho ? `Nicho: ${profile.nicho}` : "",
      Array.isArray(profile.dores) && profile.dores.length ? `Dores: ${profile.dores.slice(0, 3).join("; ")}` : "",
      Array.isArray(profile.desejos) && profile.desejos.length ? `Desejos: ${profile.desejos.slice(0, 3).join("; ")}` : "",
      Array.isArray(profile.linguagem) && profile.linguagem.length ? `Linguagem: ${profile.linguagem.slice(0, 6).join(", ")}` : "",
    ].filter(Boolean);
    if (parts.length) return parts.join(". ");
  }
  if (typeof brandKit?.audience === "string" && brandKit.audience.trim()) return brandKit.audience.trim();
  return "Publico definido em client_truth; revisar briefing do cliente antes de produzir.";
}

async function main() {
  const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
  const projectsRoot = path.resolve(marketingRoot, "..");
  const ecosystemRoot = path.join(projectsRoot, "EcosystemCore");
  const coreCli = path.join(ecosystemRoot, "src", "cli.js");
  const mailboxRoot = option("--mailbox-root", path.join(ecosystemRoot, "runtime", "mailbox"));
  const stateRoot = option("--state-root", path.join(ecosystemRoot, "runtime", "state"));
  const workRoot = option("--work-root", path.join(ecosystemRoot, "runtime", "work-orders"));

  const clientId = slugify(option("--client"));
  const type = option("--type", "content");
  const title = option("--title", option("--request"));
  const rawObjective = option("--objective", title);
  const objective = rawObjective.trim().length >= 12 ? rawObjective : title;
  const requestedOutcome = option("--outcome", "Criar intake operacional para os sistemas executarem com aprovacao humana.");
  const includeProduction = !flag("--no-production");
  const explicitTarget = option("--target");
  const targetSystem = explicitTarget || productionTarget(type);

  if (!clientId || !title) {
    throw new Error("Uso: npm run operation:dispatch -- --client <cliente> --type <tipo> --title <pedido> [--objective <objetivo>] [--target DesingOS|EditorOS] [--no-production]");
  }
  if (!existsSync(coreCli)) throw new Error(`EcosystemCore nao encontrado: ${coreCli}`);

  const clientRoot = path.join(marketingRoot, "clients", clientId);
  if (!existsSync(clientRoot)) throw new Error(`Cliente nao encontrado em MarketingOS/clients: ${clientId}`);

  const createdAt = new Date().toISOString();
  const correlationId = `ops-${clientId}-${nowForId()}`;
  const operationRoot = path.join(clientRoot, "outputs", "operations", correlationId);
  const contractsRoot = path.join(operationRoot, "contracts");
  await mkdir(contractsRoot, { recursive: true });

  const clientMd = await readOptional(path.join(clientRoot, "client.md"));
  const strategyMd = await readOptional(path.join(clientRoot, "estrategia.md"));
  const notesMd = await readOptional(path.join(clientRoot, "notes.md"));
  const brandKit = await readJsonOptional(path.join(clientRoot, "brand-kit.json"));
  const audience = await readJsonOptional(path.join(clientRoot, "audience.json"));

  const common = {
    schema_version: "1.0",
    correlation_id: correlationId,
    status: "approved",
    created_at: createdAt,
  };

  const demand = {
    ...common,
    contract_type: "demand",
    contract_id: `demand-${correlationId}`,
    source_system: "MarketingOS",
    demand_type: demandType(type),
    requester: { system: "MarketingOS", interface: "operation-dispatch-cli" },
    client: { client_id: clientId, source_path: path.relative(marketingRoot, clientRoot).replaceAll("\\", "/") },
    request: { title, type, objective, raw_objective: rawObjective, raw_text: title },
    requested_outcome: requestedOutcome,
    authority: { external_action_allowed: false, human_approval_required: true },
    risk: { level: "low", notes: "Internal intake only. No external publishing or campaign mutation." },
  };

  const truthContractId = `truth-${correlationId}`;
  const clientTruth = {
    ...common,
    contract_type: "client_truth",
    contract_id: truthContractId,
    source_system: "MarketingOS",
    client_id: clientId,
    brand_id: brandKit?.brand_name ? slugify(brandKit.brand_name) : `brand-${clientId}`,
    version: brandKit?.version || "1.0",
    owner: { system: "MarketingOS", source: "clients" },
    truth: {
      brand_kit: brandKit,
      audience,
      client_brief_excerpt: excerpt(clientMd),
      strategy_excerpt: excerpt(strategyMd),
      notes_excerpt: excerpt(notesMd, 1200),
      reference_paths: {
        client: path.relative(marketingRoot, path.join(clientRoot, "client.md")).replaceAll("\\", "/"),
        brand_kit: path.relative(marketingRoot, path.join(clientRoot, "brand-kit.json")).replaceAll("\\", "/"),
        strategy: path.relative(marketingRoot, path.join(clientRoot, "estrategia.md")).replaceAll("\\", "/"),
        notes: path.relative(marketingRoot, path.join(clientRoot, "notes.md")).replaceAll("\\", "/"),
      },
    },
  };

  const campaignBrief = {
    ...common,
    contract_type: "campaign_brief",
    contract_id: `campaign-${correlationId}`,
    source_system: "MarketingOS",
    client_id: clientId,
    brand_truth_ref: truthContractId,
    objective,
    audience: { ...(audience || {}), description: audienceDescription(audience, brandKit) },
    offer: { name: brandKit?.offer || "Oferta principal do cliente", source: "client_truth" },
    cta: { intent: "Gerar peca pronta para aprovacao humana", channel: brandKit?.canal_venda || "a definir", route_status: "requires_human_review" },
    channel: { primary: formatFor(type).platform, content_type: type, stage: rawObjective, publication_status: "blocked_until_human_approval" },
    metric: { primary: primaryMetric(type), semantics: "operational-intake-v1", baseline_status: "stale_recollection_required" },
    authority: { external_action_allowed: false, human_approval_required: true },
  };

  const contracts = [demand, clientTruth, campaignBrief];
  if (includeProduction && targetSystem) {
    contracts.push({
      ...common,
      contract_type: "production_request",
      contract_id: `request-${slugify(targetSystem)}-${correlationId}`,
      source_system: "FluxOS",
      target_system: targetSystem,
      source_package_ref: campaignBrief.contract_id,
      objective: `Produzir asset para: ${objective}`,
      format: formatFor(type),
      deliverables: [`${type} para ${clientId}`],
      acceptance_criteria: [
        "Usar client_truth como referencia principal.",
        "Nao publicar automaticamente.",
        "Entregar work-order para aprovacao humana.",
      ],
      authority: { external_action_allowed: false, human_approval_required: true },
    });
  }

  const contractFiles = [];
  for (const contract of contracts) {
    const file = path.join(contractsRoot, `${contract.contract_id}.json`);
    await writeFile(file, JSON.stringify(contract, null, 2) + "\n", "utf8");
    contractFiles.push(file);
  }

  const routeLogs = [];
  const operationLogs = [];
  for (const file of contractFiles) {
    routeLogs.push(execCore(coreCli, ["route", file, "--mailbox-root", mailboxRoot], marketingRoot));
    operationLogs.push(execCore(coreCli, ["operation", file, "--state-root", stateRoot], marketingRoot));
  }

  const dispatchLog = execCore(coreCli, [
    "dispatch",
    correlationId,
    "--state-root",
    stateRoot,
    "--mailbox-root",
    mailboxRoot,
    "--work-root",
    workRoot,
    "--projects-root",
    projectsRoot,
  ], marketingRoot);

  const summary = {
    schema_version: "1.0",
    correlation_id: correlationId,
    client_id: clientId,
    type,
    title,
    created_at: createdAt,
    contracts: contractFiles.map((file) => path.relative(marketingRoot, file).replaceAll("\\", "/")),
    mailbox_root: path.relative(projectsRoot, mailboxRoot).replaceAll("\\", "/"),
    state_root: path.relative(projectsRoot, stateRoot).replaceAll("\\", "/"),
    work_root: path.relative(projectsRoot, workRoot).replaceAll("\\", "/"),
    route_logs: routeLogs,
    operation_logs: operationLogs,
    dispatch_log: dispatchLog,
    external_action_allowed: false,
  };
  const summaryFile = path.join(operationRoot, "operation-summary.json");
  await writeFile(summaryFile, JSON.stringify(summary, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({ ok: true, summary_file: summaryFile, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
