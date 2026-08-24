import dotenv from "dotenv";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Configuracao ausente: ${name}`);
  return value;
}

function option(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function flag(name) {
  return process.argv.includes(name);
}

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const envFile = option("--env-file");
dotenv.config({ path: path.join(marketingRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(marketingRoot, "cockpit", ".env"), quiet: true });
dotenv.config({ path: path.join(marketingRoot, "cockpit", ".env.local"), quiet: true });
if (envFile) dotenv.config({ path: path.resolve(envFile), override: true, quiet: true });

function normalizeRestUrl(value) {
  return value.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
}

const restBase = `${normalizeRestUrl(required("SUPABASE_URL"))}/rest/v1`;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || required("SUPABASE_SERVICE_ROLE_KEY");

function headers(extra = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function db(pathname, init = {}) {
  const response = await fetch(`${restBase}/${pathname}`, {
    ...init,
    headers: headers(init.headers || {}),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase HTTP ${response.status}: ${text}`);
  if (!text) return null;
  return JSON.parse(text);
}

async function insertEvent(requestId, eventType, fromStatus, toStatus, message, metadata = {}) {
  await db("work_request_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      request_id: requestId,
      event_type: eventType,
      from_status: fromStatus,
      to_status: toStatus,
      message,
      metadata,
    }),
  });
}

async function patchRequest(id, body) {
  const updated = await db(`work_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
  });
  return updated?.[0] || null;
}

function dispatchLocal(request) {
  const args = [
    path.join(marketingRoot, "scripts", "operations", "dispatch-work-request.mjs"),
    "--client",
    request.client_id,
    "--type",
    request.request_type || "other",
    "--title",
    request.title,
  ];
  if (request.objective) args.push("--objective", request.objective);
  if (["analysis", "data_sync", "ads"].includes(request.request_type)) args.push("--no-production");

  const result = spawnSync(process.execPath, args, {
    cwd: marketingRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw new Error(result.error?.message || output || `operation:dispatch exit=${result.status}`);

  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) throw new Error(`Dispatcher nao retornou JSON: ${output}`);
  return JSON.parse(output.slice(jsonStart));
}

function executeCarouselLocal(correlationId) {
  const result = spawnSync(process.execPath, [path.join(marketingRoot, "scripts", "operations", "execute-carousel-from-operation.mjs"), "--correlation", correlationId, "--render"], {
    cwd: marketingRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw new Error(result.error?.message || output || `operation:execute-carousel exit=${result.status}`);
  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) throw new Error(`Executor de carrossel nao retornou JSON: ${output}`);
  return JSON.parse(output.slice(jsonStart));
}

function executeFluxLocal(correlationId) {
  const fluxRoot = path.resolve(marketingRoot, "..", "FluxOS");
  const result = spawnSync(process.execPath, [path.join(fluxRoot, "node_modules", "tsx", "dist", "cli.mjs"), path.join(fluxRoot, "scripts", "execute-campaign-work-order.ts"), "--correlation", correlationId, "--marketing-root", marketingRoot], {
    cwd: fluxRoot,
    encoding: "utf8",
    windowsHide: true,
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw new Error(result.error?.message || output || `FluxOS ecosystem:execute exit=${result.status}`);
  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) throw new Error(`FluxOS nao retornou JSON: ${output}`);
  return JSON.parse(output.slice(jsonStart));
}

async function processOne(request) {
  console.log(`PROCESS ${request.id} ${request.client_id} ${request.request_type}: ${request.title}`);
  await patchRequest(request.id, { status: "running" });
  await insertEvent(request.id, "worker_started", request.status, "running", "Worker local iniciou despacho para o EcosystemCore.", {
    worker: "marketingos-local-cockpit-worker",
  });

  try {
    const result = dispatchLocal(request);
    const flux = executeFluxLocal(result.correlation_id);
    let execution = null;
    if (request.request_type === "carousel") {
      execution = executeCarouselLocal(result.correlation_id);
    }
    let summary = null;
    try {
      summary = JSON.parse(await readFile(result.summary_file, "utf8"));
    } catch {
      summary = result;
    }
    const payload = {
      ...(request.payload || {}),
      ecosystem_dispatch: {
        correlation_id: result.correlation_id,
        summary_file: result.summary_file,
        contracts: result.contracts,
        work_root: result.work_root,
        dispatched_at: new Date().toISOString(),
      },
      flux,
      execution,
    };
    delete payload.last_worker_error;
    await patchRequest(request.id, { status: "review", payload });
    await insertEvent(request.id, "ecosystem_dispatched", "running", "review", execution ? "Pedido despachado e carrossel operacional gerado para revisao." : "Pedido despachado para os OS e aguardando aprovacao/revisao.", {
      correlation_id: result.correlation_id,
      summary,
      flux,
      execution,
    });
    console.log(`DONE ${request.id} ${result.correlation_id}`);
  } catch (error) {
    await patchRequest(request.id, {
      status: "error",
      payload: {
        ...(request.payload || {}),
        last_worker_error: String(error?.message || error),
      },
    });
    await insertEvent(request.id, "worker_failed", "running", "error", String(error?.message || error), {
      worker: "marketingos-local-cockpit-worker",
    });
    console.error(`ERROR ${request.id} ${error?.message || error}`);
  }
}

async function main() {
  const limit = Number(option("--limit", "5"));
  const requestId = option("--id");
  const query = requestId
    ? `work_requests?id=eq.${encodeURIComponent(requestId)}&select=*`
    : `work_requests?status=in.(queued,routed)&select=*&order=created_at.asc&limit=${Number.isFinite(limit) ? limit : 5}`;

  const requests = await db(query);
  if (!requests?.length) {
    console.log("Nenhum pedido pendente.");
    return;
  }

  for (const request of requests) await processOne(request);

  if (flag("--watch")) {
    const seconds = Number(option("--interval-seconds", "20"));
    setTimeout(() => {
      const args = process.argv.slice(1).filter((arg) => arg !== "--watch");
      spawnSync(process.execPath, [...args, "--watch"], { cwd: marketingRoot, stdio: "inherit", windowsHide: true });
    }, Math.max(5, seconds) * 1000);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
