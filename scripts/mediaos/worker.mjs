import "dotenv/config";
import crypto from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, unlinkSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { evaluateContext } from "../context/context-gate.mjs";
import { ensureClientContext } from "../context/ensure-client-context.mjs";
import { generateImage, generateVideo, externalPrompt } from "./ai-runtime.mjs";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const cockpitWorker = path.join(marketingRoot, "scripts", "operations", "cockpit-worker.mjs");
const videoExecutor = path.join(marketingRoot, "scripts", "mediaos", "editoros-executor.mjs");
const postExecutor = path.join(marketingRoot, "scripts", "mediaos", "post-executor.mjs");
const researchExecutor = path.join(marketingRoot, "scripts", "mediaos", "research-executor.mjs");
const analysisExecutor = path.join(marketingRoot, "scripts", "mediaos", "analysis-executor.mjs");
const structuredExecutor = path.join(marketingRoot, "scripts", "mediaos", "structured-executor.mjs");
const supabaseUrl = required("SUPABASE_URL").replace(/\/$/, "");
const restBase = `${supabaseUrl}/rest/v1`;
const serviceKey = process.env.SUPABASE_SECRET_KEY || required("SUPABASE_SERVICE_ROLE_KEY");
const storageBucket = process.env.MEDIAOS_STORAGE_BUCKET || "media";
const workerId = process.env.MEDIAOS_WORKER_ID || `mediaos-${process.pid}`;
const executorTimeoutMs = Math.max(1000, Number(process.env.MEDIAOS_EXECUTOR_TIMEOUT_MS || 120000));

function spawnExecutor(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: marketingRoot,
    encoding: "utf8",
    windowsHide: true,
    timeout: executorTimeoutMs,
    killSignal: "SIGTERM",
    ...options,
  });
}

function required(name) {
  if (!process.env[name]) throw new Error(`Configuracao ausente: ${name}`);
  return process.env[name];
}

function headers(extra = {}) {
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...extra };
}

async function db(resource, options = {}) {
  const endpoint = `${restBase}/${resource}`;
  let response;
  try {
    response = await fetch(endpoint, { ...options, headers: headers(options.headers || {}) });
  } catch (error) {
    throw new Error(`Supabase fetch failed (${options.method || "GET"} ${resource.split("?")[0]}): ${error?.cause?.message || error?.message || error}`);
  }
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

async function storage(pathname, options = {}) {
  const response = await fetch(`${supabaseUrl}/storage/v1/${pathname}`, { ...options, headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...(options.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Storage ${response.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

async function ensureBucket() {
  try {
    await storage(`bucket/${encodeURIComponent(storageBucket)}`);
  } catch (error) {
    if (!/Storage (400|404)|NoSuchBucket|Bucket not found/i.test(String(error.message))) throw error;
    await storage("bucket", { method: "POST", body: JSON.stringify({ id: storageBucket, name: storageBucket, public: true }) });
  }
}

async function uploadFile(file, objectPath) {
  const body = await readFile(file);
  const contentType = file.toLowerCase().endsWith(".png") ? "image/png" : file.toLowerCase().endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream";
  await storage(`object/${encodeURIComponent(storageBucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`, {
    method: "POST",
    headers: { "Content-Type": contentType, "x-upsert": "true" },
    body,
  });
  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${objectPath}`;
}

async function claimJob(job) {
  try {
    const rows = await db("rpc/claim_media_job", {
      method: "POST",
      body: JSON.stringify({ p_worker_id: workerId, p_job_id: job.id, p_lease_seconds: Number(process.env.MEDIAOS_LEASE_SECONDS || 900) }),
    });
    return rows?.[0] || null;
  } catch (error) {
    if (!/404|claim_media_job|function/i.test(String(error.message))) throw error;
    if (process.env.MEDIAOS_ALLOW_SCHEMA_FALLBACK !== "1") {
      throw new Error("MediaOS hardening ausente: public.claim_media_job nao esta disponivel. Worker nao executara jobs sem claim atomico. Aplique 003-production-hardening-repair.sql ou defina MEDIAOS_ALLOW_SCHEMA_FALLBACK=1 apenas para emergencia controlada.");
    }
    // Emergency compatibility mode only. It must be explicitly enabled.
    const rows = await db(`media_jobs?id=eq.${encodeURIComponent(job.id)}&status=eq.queued`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status: "running", started_at: new Date().toISOString(), locked_by: workerId, updated_at: new Date().toISOString() }),
    });
    return rows?.[0] || null;
  }
}

async function event(jobId, eventType, fromStatus, toStatus, message, metadata = {}) {
  await db("media_job_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ job_id: jobId, event_type: eventType, from_status: fromStatus, to_status: toStatus, message, metadata }) });
}

async function patchJob(id, body) {
  try {
    const rows = await db(`media_jobs?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }) });
    return rows?.[0] || null;
  } catch (error) {
    if (!/column .*?(heartbeat_at|lease_expires_at|last_error|locked_at|locked_by)|schema cache/i.test(String(error.message))) throw error;
    const compatibilityBody = { ...body };
    for (const field of ["heartbeat_at", "lease_expires_at", "last_error", "locked_at", "locked_by"]) delete compatibilityBody[field];
    const rows = await db(`media_jobs?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...compatibilityBody, updated_at: new Date().toISOString() }) });
    return rows?.[0] || null;
  }
}

async function ingestExecutionResult(job, result, executor) {
  const cockpitUrl = String(process.env.MARKETINGOS_COCKPIT_URL || "").replace(/\/$/, "");
  const secret = process.env.MEDIAOS_EXECUTION_INGEST_SECRET;
  if (!cockpitUrl || !secret) {
    console.warn(`execution_bridge_skipped ${job.id}: MARKETINGOS_COCKPIT_URL ou MEDIAOS_EXECUTION_INGEST_SECRET ausente`);
    return;
  }
  const execution = {
    schema_version: "1.0",
    contract_type: "execution_result",
    contract_id: `execution-mediaos-${job.id}`,
    correlation_id: job.id,
    source_system: "MediaOS",
    status: "review",
    created_at: new Date().toISOString(),
    executor,
    result: "completed",
    artifact_refs: (result.assets || []).map(asset => asset.url).filter(Boolean),
    quality_refs: [`artifact:${result.artifact.id}:v${result.artifact.current_version || 1}`],
    blockers: [],
    next_action: "Aguardar aprovação humana do artifact antes de publicar.",
  };
  const response = await fetch(`${cockpitUrl}/api/admin/operations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-mediaos-execution-secret": secret },
    body: JSON.stringify({ action: "ingest_execution_result", executionResult: execution, jobId: job.id, clientId: job.client_id }),
  });
  if (!response.ok) throw new Error(`execution_bridge_http_${response.status}`);
}

function runExistingCarousel(requestId) {
    const result = spawnExecutor(process.execPath, [cockpitWorker, "--id", requestId]);
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw new Error(result.error?.message || output || "cockpit-worker falhou");
  if (/ERROR\s+[0-9a-f-]+/i.test(output)) throw new Error(output.slice(-2000));
  return output;
}

function runVideo(job) {
  if (job.job_type === "generative_video") {
    throw Object.assign(new Error("Video generativo ainda nao possui adapter configurado; job bloqueado sem simular resultado."), { retryable: false, blocked: true });
  }
  const inputFile = path.join(marketingRoot, "tmp", "mediaos", `${job.id}.json`);
  const output = path.dirname(inputFile);
  mkdirSync(output, { recursive: true });
  writeFileSync(inputFile, JSON.stringify({ ...(job.input || {}), job_id: job.id, output_dir: path.join(marketingRoot, "outputs", "mediaos", job.client_id, job.id) }));
  const args = [videoExecutor, "--input-json", inputFile];
    const result = spawnExecutor(process.execPath, args);
  try { unlinkSync(inputFile); } catch {}
  const outputText = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw Object.assign(new Error(outputText || "video-executor falhou"), { retryable: false });
  return parseLastJsonLine(outputText, "video-executor");
}

function runAnalysis(job) {
    const result = spawnExecutor(process.execPath, [analysisExecutor, "--client", job.client_id, "--job", job.id]);
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw Object.assign(new Error(output || "analysis-executor falhou"), { retryable: false, blocked: /sem dados sincronizados/i.test(output) });
  return parseLastJsonLine(output, "analysis-executor", { retryable: false });
}

function runPost(job) {
  const inputFile = path.join(marketingRoot, "tmp", "mediaos", `${job.id}.post.json`);
  mkdirSync(path.dirname(inputFile), { recursive: true });
  writeFileSync(inputFile, JSON.stringify({ ...(job.input || {}), reference_snapshot: job.reference_snapshot || null }));
    const result = spawnExecutor(process.execPath, [postExecutor, "--client", job.client_id, "--job", job.id, "--input-json", inputFile]);
  try { unlinkSync(inputFile); } catch {}
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw Object.assign(new Error(output || "post-executor falhou"), { retryable: false, blocked: true });
  return parseLastJsonLine(output, "post-executor", { retryable: false });
}

function runResearch(job) {
  const inputFile = path.join(marketingRoot, "tmp", "mediaos", `${job.id}.research.json`);
  mkdirSync(path.dirname(inputFile), { recursive: true });
  writeFileSync(inputFile, JSON.stringify(job.input || {}));
    const result = spawnExecutor(process.execPath, [researchExecutor, "--client", job.client_id, "--job", job.id, "--input-json", inputFile]);
  try { unlinkSync(inputFile); } catch {}
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw Object.assign(new Error(output || "research-executor falhou"), { retryable: false, blocked: true });
  return parseLastJsonLine(output, "research-executor", { retryable: false });
}

function runStructured(job) {
  const type = job.job_type;
  const inputFile = path.join(marketingRoot, "tmp", "mediaos", `${job.id}.structured.json`);
  mkdirSync(path.dirname(inputFile), { recursive: true });
  writeFileSync(inputFile, JSON.stringify(job.input || {}));
    const result = spawnExecutor(process.execPath, [structuredExecutor, "--client", job.client_id, "--job", job.id, "--type", type, "--input-json", inputFile]);
  try { unlinkSync(inputFile); } catch {}
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (result.status !== 0) throw Object.assign(new Error(output || "structured-executor falhou"), { retryable: false, blocked: /ausente|nao encontrado|nao conectado/i.test(output) });
  return parseLastJsonLine(output, "structured-executor", { retryable: false });
}

function inspectVideoQa(file) {
  const probe = spawnSync(process.env.FFPROBE_BIN || "ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", file], { encoding: "utf8", windowsHide: true });
  if (probe.status !== 0) return { status: "failed", reason: probe.stderr || "ffprobe failed" };
  try {
    const data = JSON.parse(probe.stdout || "{}");
    const duration = Number(data.format?.duration || 0);
    const video = (data.streams || []).find(stream => stream.width && stream.height);
    const valid = duration > 0 && Number(video?.width || 0) > 0 && Number(video?.height || 0) > 0;
    return { status: valid ? "passed" : "failed", duration_seconds: duration, width: video?.width || null, height: video?.height || null, file_bytes: statSync(file).size };
  } catch (error) {
    return { status: "failed", reason: error.message };
  }
}

function parseLastJsonLine(output, producer, errorProperties = {}) {
  const lines = String(output || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean).reverse();
  for (const line of lines) {
    if (!line.startsWith("{")) continue;
    try { return JSON.parse(line); } catch {}
  }
  throw Object.assign(new Error(`${producer} nao retornou uma linha JSON valida`), errorProperties);
}

async function findSlideFiles(execution) {
  const listed = execution?.preview?.slide_files || [];
  const existing = listed.filter(file => existsSync(file));
  if (existing.length) return existing;
  const jobDir = execution?.carousel_job_dir;
  const instagramDir = jobDir ? path.join(jobDir, "instagram") : "";
  if (!instagramDir || !existsSync(instagramDir)) return [];
  const names = (await readdir(instagramDir)).filter(name => /^slide-\d+\.png$/i.test(name)).sort();
  return names.map(name => path.join(instagramDir, name));
}

async function createArtifact(job, request, execution) {
  const files = await findSlideFiles(execution);
  if (!files.length) throw new Error("Executor concluiu sem encontrar slides PNG para registrar como artifact.");
  await ensureBucket();
  const existingArtifacts = await db(`artifacts?job_id=eq.${encodeURIComponent(job.id)}&select=id,current_version&order=current_version.desc&limit=1`);
  const existingArtifact = existingArtifacts?.[0] || null;
  const version = Number(existingArtifact?.current_version || 0) + 1;
  const assets = [];
  for (const file of files) {
    const url = await uploadFile(file, `artifacts/${job.client_id}/${job.id}/v${version}/${path.basename(file)}`);
    assets.push({ kind: "image", local_path: file, url });
  }
  const previewUrl = assets[0]?.url || null;
  let commercialQa = null;
  try { commercialQa = JSON.parse(await readFile(path.join(execution.carousel_job_dir, "commercial-render-qa.json"), "utf8")); } catch {}
  const artifactRows = existingArtifact
    ? await db(`artifacts?id=eq.${encodeURIComponent(existingArtifact.id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status: "review", current_version: version, metadata: { preview_url: previewUrl, assets, execution: { carousel_job_dir: execution.carousel_job_dir, slide_count: execution.preview?.slide_count || assets.length, draft_quality: execution.preview?.draft_quality || null, commercial_renderer_required: Boolean(execution.preview?.commercial_renderer_required) }, updated_by: "mediaos-commercial-renderer-v1" }, updated_at: new Date().toISOString() }) })
    : await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: job.job_type, title: request.title, status: "review", current_version: version, metadata: { preview_url: previewUrl, assets, execution: { carousel_job_dir: execution.carousel_job_dir, slide_count: execution.preview?.slide_count || assets.length, draft_quality: execution.preview?.draft_quality || null, commercial_renderer_required: Boolean(execution.preview?.commercial_renderer_required) } } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw new Error("Artifact nao foi criado.");
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version, kind: "carousel", preview_url: previewUrl, manifest: { assets, caption: execution.preview?.caption || null, copy_md: execution.preview?.copy_md || null }, qa: { status: execution.render_error ? "failed" : commercialQa?.qa?.status || "pending", render_error: execution.render_error || null, commercial_renderer_required: Boolean(execution.preview?.commercial_renderer_required), renderer: commercialQa?.renderer || null, checks: commercialQa?.qa?.checks || [] } }) });
  return { artifact, assets };
}

async function createVideoArtifact(job, request, execution) {
  const file = execution?.video_path;
  if (!file || !existsSync(file)) throw Object.assign(new Error("Executor de video concluiu sem arquivo MP4."), { retryable: false });
  const videoQa = inspectVideoQa(file);
  if (videoQa.status !== "passed") throw Object.assign(new Error(`QA de video falhou: ${videoQa.reason || "arquivo sem duracao ou dimensoes validas"}`), { retryable: false });
  await ensureBucket();
  const version = 1;
  const url = await uploadFile(file, `artifacts/${job.client_id}/${job.id}/v${version}/${path.basename(file)}`);
  const artifactRows = await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: job.job_type, title: request.title, status: "review", current_version: version, metadata: { preview_url: url, assets: [{ kind: "video", url }], execution } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw Object.assign(new Error("Artifact de video nao foi criado."), { retryable: false });
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version, kind: "video", storage_path: `artifacts/${job.client_id}/${job.id}/v${version}/${path.basename(file)}`, preview_url: url, manifest: { assets: [{ kind: "video", url }], pipeline: execution.pipeline }, qa: videoQa }) });
  return { artifact, assets: [{ kind: "video", url }] };
}

async function createImageArtifact(job, request, execution) {
  if (!execution?.sourceUrl) throw Object.assign(new Error("Executor de imagem concluiu sem URL."), { retryable: false });
  const response = await fetch(execution.sourceUrl);
  if (!response.ok) throw Object.assign(new Error(`Não foi possível baixar a imagem gerada (${response.status}).`), { retryable: false });
  const contentType = response.headers.get("content-type") || "image/png";
  if (!/^image\/(png|jpeg|jpg|webp)$/i.test(contentType)) throw Object.assign(new Error("Provider retornou um arquivo que não é imagem suportada."), { retryable: false });
  const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : contentType.includes("webp") ? "webp" : "png";
  const localFile = path.join(marketingRoot, "tmp", "mediaos", `${job.id}.generated.${ext}`);
  mkdirSync(path.dirname(localFile), { recursive: true });
  writeFileSync(localFile, Buffer.from(await response.arrayBuffer()));
  await ensureBucket();
  const version = 1;
  const url = await uploadFile(localFile, `artifacts/${job.client_id}/${job.id}/v${version}/generated-image.${ext}`);
  const artifactRows = await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: "image", title: request.title, status: "review", current_version: version, metadata: { preview_url: url, assets: [{ kind: "image", url }], execution: { provider: execution.provider, model: execution.model, request_id: execution.requestId || null, prompt_hash: execution.prompt ? crypto.createHash("sha256").update(execution.prompt).digest("hex") : null } } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw Object.assign(new Error("Artifact de imagem não foi criado."), { retryable: false });
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version, kind: "image", storage_path: `artifacts/${job.client_id}/${job.id}/v${version}/generated-image.${ext}`, preview_url: url, manifest: { assets: [{ kind: "image", url }], prompt: execution.prompt || null, provider: execution.provider, model: execution.model }, qa: { status: "passed", checks: ["image_downloaded", "supported_mime", "storage_uploaded"] } }) });
  return { artifact, assets: [{ kind: "image", url }] };
}

async function createGeneratedVideoArtifact(job, request, execution) {
  if (!execution?.sourceUrl) throw Object.assign(new Error("Executor de vídeo generativo concluiu sem URL."), { retryable: false });
  const response = await fetch(execution.sourceUrl);
  if (!response.ok) throw Object.assign(new Error(`Não foi possível baixar o vídeo gerado (${response.status}).`), { retryable: false });
  const localFile = path.join(marketingRoot, "tmp", "mediaos", `${job.id}.generated.mp4`);
  mkdirSync(path.dirname(localFile), { recursive: true });
  writeFileSync(localFile, Buffer.from(await response.arrayBuffer()));
  return createVideoArtifact(job, request, { ...execution, video_path: localFile, pipeline: `ai-${execution.provider}` });
}

async function createAnalysisArtifact(job, request, execution) {
  const file = execution?.output_path;
  if (!file || !existsSync(file)) throw Object.assign(new Error("Analysis executor concluiu sem arquivo JSON."), { retryable: false });
  await ensureBucket();
  const version = 1;
  const url = await uploadFile(file, `artifacts/${job.client_id}/${job.id}/v${version}/${path.basename(file)}`);
  const artifactRows = await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: "analysis", title: request.title, status: "review", current_version: version, metadata: { preview_url: url, assets: [{ kind: "json", url }], execution } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw Object.assign(new Error("Artifact de analise nao foi criado."), { retryable: false });
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version, kind: "analysis", storage_path: `artifacts/${job.client_id}/${job.id}/v${version}/${path.basename(file)}`, preview_url: url, manifest: { result_type: execution.result_type, source: execution.source }, qa: { status: "passed", source_verified: true } }) });
  return { artifact, assets: [{ kind: "json", url }] };
}

async function createPostArtifact(job, request, execution) {
  const file = execution?.image_path;
  const manifestFile = execution?.manifest_path;
  if (!file || !existsSync(file) || !manifestFile || !existsSync(manifestFile)) throw Object.assign(new Error("Post executor concluiu sem PNG e manifesto."), { retryable: false });
  await ensureBucket();
  const version = 1;
  const imageUrl = await uploadFile(file, `artifacts/${job.client_id}/${job.id}/v${version}/post.png`);
  const manifestUrl = await uploadFile(manifestFile, `artifacts/${job.client_id}/${job.id}/v${version}/post-manifest.json`);
  const artifactRows = await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: "post", title: request.title, status: "review", current_version: version, metadata: { preview_url: imageUrl, assets: [{ kind: "image", url: imageUrl }, { kind: "manifest", url: manifestUrl }], execution } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw Object.assign(new Error("Artifact de post nao foi criado."), { retryable: false });
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version, kind: "post", storage_path: `artifacts/${job.client_id}/${job.id}/v${version}/post.png`, preview_url: imageUrl, manifest: { image_url: imageUrl, manifest_url: manifestUrl, copy: manifest.copy, renderer: manifest.renderer }, qa: manifest.qa }) });
  return { artifact, assets: [{ kind: "image", url: imageUrl }, { kind: "manifest", url: manifestUrl }] };
}

async function createResearchArtifact(job, request, execution) {
  const file = execution?.output_path;
  const reportFile = execution?.report_path;
  if (!file || !existsSync(file) || !reportFile || !existsSync(reportFile)) throw Object.assign(new Error("Research executor concluiu sem JSON e relatório Markdown."), { retryable: false });
  await ensureBucket();
  const version = 1;
  const jsonUrl = await uploadFile(file, `artifacts/${job.client_id}/${job.id}/v${version}/research-report.json`);
  const reportUrl = await uploadFile(reportFile, `artifacts/${job.client_id}/${job.id}/v${version}/research-report.md`);
  const report = JSON.parse(await readFile(file, "utf8"));
  const artifactRows = await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: "research", title: request.title, status: "review", current_version: version, metadata: { preview_url: reportUrl, assets: [{ kind: "report", url: reportUrl }, { kind: "json", url: jsonUrl }], execution } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw Object.assign(new Error("Artifact de pesquisa nao foi criado."), { retryable: false });
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version, kind: "research", storage_path: `artifacts/${job.client_id}/${job.id}/v${version}/research-report.md`, preview_url: reportUrl, manifest: { json_url: jsonUrl, source_count: report.sources.length, brief: report.brief }, qa: report.qa }) });
  return { artifact, assets: [{ kind: "report", url: reportUrl }, { kind: "json", url: jsonUrl }] };
}

async function createStructuredArtifact(job, request, execution) {
  const file = execution?.output_path;
  if (!file || !existsSync(file)) throw Object.assign(new Error("Structured executor concluiu sem JSON."), { retryable: false });
  await ensureBucket();
  const url = await uploadFile(file, `artifacts/${job.client_id}/${job.id}/v1/${path.basename(file)}`);
  const artifactRows = await db("artifacts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ client_id: job.client_id, job_id: job.id, artifact_type: job.job_type, title: request.title, status: "review", current_version: 1, metadata: { preview_url: url, assets: [{ kind: "json", url }], execution } }) });
  const artifact = artifactRows?.[0];
  if (!artifact?.id) throw Object.assign(new Error("Artifact estruturado nao foi criado."), { retryable: false });
  await db("artifact_versions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ artifact_id: artifact.id, version: 1, kind: job.job_type, storage_path: `artifacts/${job.client_id}/${job.id}/v1/${path.basename(file)}`, preview_url: url, manifest: { result_type: execution.result_type, source: execution.source }, qa: { status: "passed", source_verified: true } }) });
  return { artifact, assets: [{ kind: "json", url }] };
}

async function processJob(job) {
  const claimed = await claimJob(job);
  if (!claimed) return { skipped: true, reason: "job_already_claimed" };
  await event(job.id, "worker_started", "queued", "running", "MediaOS worker iniciou a execucao.", { worker: "mediaos-worker-v1" });
  try {
    const requests = await db(`work_requests?id=eq.${encodeURIComponent(job.request_id)}&select=*&limit=1`);
    const request = requests?.[0];
    if (!request) throw new Error("work_request associado ao job não foi encontrado.");
    // Garante o contexto local (client.md / brand-kit / strategy-decision) a partir do
    // client_references no Supabase — clientes criados pelo frontend não têm arquivos locais.
    const contextBootstrap = await ensureClientContext({ marketingRoot, clientId: job.client_id }).catch(error => ({ ok: false, error: error.message }));
    if (!contextBootstrap.ok) throw Object.assign(new Error(`Contexto do cliente indisponível: ${contextBootstrap.error || "sem client_references"}`), { retryable: false, blocked: true });
    const contextGate = await evaluateContext({ marketingRoot, clientId: job.client_id, request, jobType: job.job_type });
    try {
      await patchJob(job.id, { input: { ...(job.input || {}), context_gate: contextGate }, context_hash: contextGate.contextHash, context_status: contextGate.status });
    } catch {
      // Compatibility while 002-production-hardening.sql has not reached the database yet.
      await patchJob(job.id, { input: { ...(job.input || {}), context_gate: contextGate } });
    }
    if (!contextGate.ok) throw Object.assign(new Error(`Context Gate bloqueou o job: ${contextGate.errors.join(" | ")}`), { retryable: false, blocked: true });
    if (!["carousel", "post", "image", "image_generate", "research", "ads", "automation", "video", "generative_video", "analysis", "strategy", "funnel", "data_sync", "prospecting", "publish"].includes(job.job_type)) throw Object.assign(new Error(`Executor ainda nao conectado para job_type=${job.job_type}.`), { retryable: false });
    job.input = { ...(job.input || {}), context_gate: contextGate };
    const videoExecution = job.job_type === "video" ? runVideo(job) : null;
    const generatedVideoExecution = job.job_type === "generative_video" ? await generateVideo({ clientId: job.client_id, job }) : null;
    const imageExecution = ["image", "image_generate"].includes(job.job_type) ? await generateImage({ clientId: job.client_id, job }) : null;
    const postExecution = job.job_type === "post" ? runPost({ ...job, reference_snapshot: request.reference_snapshot }) : null;
    const researchExecution = job.job_type === "research" ? runResearch(job) : null;
    const analysisExecution = job.job_type === "analysis" ? runAnalysis(job) : null;
    const structuredExecution = ["strategy", "funnel", "data_sync", "prospecting", "publish", "ads", "automation"].includes(job.job_type) ? runStructured(job) : null;
    if (!videoExecution && !generatedVideoExecution && !imageExecution && !postExecution && !researchExecution && !analysisExecution && !structuredExecution) runExistingCarousel(job.request_id);
    const refreshedRequests = await db(`work_requests?id=eq.${encodeURIComponent(job.request_id)}&select=*&limit=1`);
    const refreshedRequest = refreshedRequests?.[0];
    const execution = refreshedRequest?.payload?.execution;
    if (!refreshedRequest) throw new Error("work_request nao encontrado apos execucao.");
    if (!videoExecution && !generatedVideoExecution && !imageExecution && !postExecution && !researchExecution && !analysisExecution && !structuredExecution && !execution) throw new Error("O executor terminou sem payload de execucao no work_request.");
    const result = videoExecution
      ? await createVideoArtifact(job, refreshedRequest, videoExecution)
      : generatedVideoExecution
      ? await createGeneratedVideoArtifact(job, refreshedRequest, generatedVideoExecution)
      : imageExecution
      ? await createImageArtifact(job, refreshedRequest, imageExecution)
      : postExecution
      ? await createPostArtifact(job, refreshedRequest, postExecution)
      : researchExecution
        ? await createResearchArtifact(job, refreshedRequest, researchExecution)
      : analysisExecution
        ? await createAnalysisArtifact(job, refreshedRequest, analysisExecution)
        : structuredExecution
          ? await createStructuredArtifact(job, refreshedRequest, structuredExecution)
      : await createArtifact(job, refreshedRequest, execution);
    await db(`ai_runs?job_id=eq.${encodeURIComponent(job.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString(), metadata: { artifact_id: result.artifact.id, execution_mode: (imageExecution || generatedVideoExecution) ? "customer_connection" : "local_pipeline", ai_provider_called: Boolean(imageExecution || generatedVideoExecution), route_provider: imageExecution?.provider || generatedVideoExecution?.provider || job.input?.route?.provider || "pipeline", route_model: imageExecution?.model || generatedVideoExecution?.model || null, skill_id: job.skill_id || job.input?.skill_id || null } }) });
    const externalExecution = imageExecution || generatedVideoExecution;
    if (externalExecution) await db("ai_usage_events", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ client_id: job.client_id, connection_id: externalExecution.connectionId || null, job_id: job.id, provider: externalExecution.provider, model: externalExecution.model || null, event_type: "inference", estimated_cost: Number(externalExecution.estimatedCost || 0), metadata: { request_id: externalExecution.requestId || null, prompt_hash: externalExecution.prompt ? crypto.createHash("sha256").update(externalExecution.prompt).digest("hex") : null, skill_id: job.skill_id || job.input?.skill_id || null } }) }).catch(error => console.warn("ai_usage_event_skipped", error.message));
    await patchJob(job.id, { status: "review", result: { artifact_id: result.artifact.id, assets: result.assets, executor: videoExecution ? videoExecution.pipeline : postExecution ? "mediaos-post-renderer-v1" : researchExecution ? "mediaos-research-executor-v1" : analysisExecution ? "mediaos-analysis-executor-v1" : structuredExecution ? `mediaos-structured-${job.job_type}-v1` : "carousel-local-v1" }, completed_at: new Date().toISOString(), error: null });
    await ingestExecutionResult(job, result, imageExecution ? `ai-${imageExecution.provider}` : generatedVideoExecution ? `ai-${generatedVideoExecution.provider}` : videoExecution ? videoExecution.pipeline : postExecution ? "mediaos-post-renderer-v1" : researchExecution ? "mediaos-research-executor-v1" : analysisExecution ? "mediaos-analysis-executor-v1" : structuredExecution ? `mediaos-structured-${job.job_type}-v1` : "carousel-local-v1");
    await patchRequestStatus(job.request_id, "review", null, { artifact_id: result.artifact.id });
    await event(job.id, "artifact_created", "running", "review", "Artifact visual criado e enviado ao Supabase Storage.", { artifact_id: result.artifact.id, asset_count: result.assets.length });
    return { ok: true, jobId: job.id, artifactId: result.artifact.id, assets: result.assets.length };
  } catch (error) {
    const message = String(error?.message || error);
    const attempt = Number(claimed.attempt_count || 1);
    const maxAttempts = Number(claimed.max_attempts || process.env.MEDIAOS_MAX_ATTEMPTS || 3);
    if (error?.blocked || error?.retryable === false) {
      await patchJob(job.id, { status: "blocked", error: message, last_error: message, result: { ...(job.result || {}), fallback: error.externalPrompt ? "prompt_and_upload" : null, external_prompt: error.externalPrompt || externalPrompt(job.input || {}) }, locked_at: null, locked_by: null, lease_expires_at: null, heartbeat_at: null });
      await releaseJobLock(job.id);
      await patchAiRun(job.id, { status: "blocked", error: message, metadata: { blocked: true, worker: workerId } });
      await patchRequestStatus(job.request_id, "blocked", message);
      await event(job.id, "worker_blocked", "running", "blocked", message, { worker: workerId });
      return { ok: true, blocked: true, jobId: job.id, error: message };
    }
    if (attempt < maxAttempts) {
      const delaySeconds = Math.min(3600, 30 * (2 ** Math.max(0, attempt - 1)));
      const nextAttempt = new Date(Date.now() + delaySeconds * 1000).toISOString();
      await patchJob(job.id, { status: "queued", error: message, last_error: message, next_attempt_at: nextAttempt, locked_at: null, locked_by: null, lease_expires_at: null, heartbeat_at: null });
      await releaseJobLock(job.id);
      await patchAiRun(job.id, { status: "retrying", error: message, metadata: { attempt, max_attempts: maxAttempts, next_attempt_at: nextAttempt, worker: workerId } });
      await event(job.id, "retry_scheduled", "running", "queued", message, { attempt, max_attempts: maxAttempts, next_attempt_at: nextAttempt, worker: workerId });
      return { ok: true, retried: true, jobId: job.id, attempt, nextAttempt };
    }
    await patchJob(job.id, { status: "error", error: message, last_error: message, locked_at: null, locked_by: null, lease_expires_at: null, heartbeat_at: null });
    await releaseJobLock(job.id);
    await patchAiRun(job.id, { status: "error", error: message, metadata: { attempt, max_attempts: maxAttempts, worker: workerId } });
    await patchRequestStatus(job.request_id, "error", message);
    await event(job.id, "worker_failed", "running", "error", message, { attempt, max_attempts: maxAttempts, worker: workerId });
    return { ok: false, jobId: job.id, error: message, attempt };
  }
}

async function patchAiRun(jobId, body) {
  try {
    await db(`ai_runs?job_id=eq.${encodeURIComponent(jobId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    });
  } catch (error) {
    if (/column .*error|schema cache/i.test(String(error.message))) {
      const compatibilityBody = { ...body };
      delete compatibilityBody.error;
      delete compatibilityBody.updated_at;
      try {
        await db(`ai_runs?job_id=eq.${encodeURIComponent(jobId)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ ...compatibilityBody, metadata: { ...(compatibilityBody.metadata || {}), error: body.error || null } }),
        });
        return;
      } catch (compatibilityError) {
        console.error(`ai_run_compatibility_update_failed ${jobId}: ${compatibilityError.message}`);
      }
    }
    console.error(`ai_run_update_failed ${jobId}: ${error.message}`);
  }
}

async function releaseJobLock(jobId) {
  try {
    await db(`media_jobs?id=eq.${encodeURIComponent(jobId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ locked_at: null, locked_by: null, updated_at: new Date().toISOString() }),
    });
  } catch (error) {
    if (!/column .*?(locked_at|locked_by)|schema cache/i.test(String(error.message))) console.error(`job_lock_release_failed ${jobId}: ${error.message}`);
  }
}

async function patchRequestStatus(requestId, status, message = null, metadata = {}) {
  if (!requestId) return;
  try {
    const current = (await db(`work_requests?id=eq.${encodeURIComponent(requestId)}&select=payload&limit=1`))?.[0];
    await db(`work_requests?id=eq.${encodeURIComponent(requestId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString(), payload: { ...(current?.payload || {}), worker_status: status, worker_message: message, ...metadata } }),
    });
  } catch (error) {
    console.error(`work_request_update_failed ${requestId}: ${error.message}`);
  }
}

async function main() {
  const requestedId = process.argv.includes("--id") ? process.argv[process.argv.indexOf("--id") + 1] : "";
  const query = requestedId ? `media_jobs?id=eq.${encodeURIComponent(requestedId)}&select=*` : "media_jobs?status=eq.queued&select=*&order=created_at.asc&limit=5";
  const jobs = await db(query);
  if (!jobs?.length) { console.log(JSON.stringify({ ok: true, processed: 0, message: "Nenhum job queued." })); return; }
  const results = [];
  for (const job of jobs) results.push(await processJob(job));
  console.log(JSON.stringify({ ok: results.every(item => item.ok || item.skipped), processed: results.length, results }, null, 2));
}

async function assertProductionSchema() {
  if (process.env.MEDIAOS_ALLOW_SCHEMA_FALLBACK === "1") {
    console.warn(JSON.stringify({ ok: false, warning: "MEDIAOS_ALLOW_SCHEMA_FALLBACK=1; claim atomico desabilitado por configuracao de emergencia." }));
    return;
  }
  try {
    await db("media_jobs?select=id,lease_expires_at,heartbeat_at,attempt_count,max_attempts&limit=1");
    await db("rpc/claim_media_job", {
      method: "POST",
      body: JSON.stringify({ p_worker_id: `${workerId}-preflight`, p_job_id: null, p_lease_seconds: 60 }),
    });
  } catch (error) {
    throw new Error(`MediaOS worker bloqueado por schema incompleto: ${error.message}. Execute cockpit/supabase/003-production-hardening-repair.sql no Supabase e rode npm run live:schema:audit.`);
  }
}

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

const loopMode = process.argv.includes("--loop") || process.env.MEDIAOS_WORKER_LOOP === "1";
try {
  await assertProductionSchema();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
if (process.exitCode === 1) process.exit();
if (loopMode) {
  const intervalMs = Math.max(5000, Number(process.env.MEDIAOS_POLL_INTERVAL_MS || 15000));
  let stopping = false;
  const stop = () => { stopping = true; };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  console.log(JSON.stringify({ ok: true, service: "mediaos-worker", mode: "loop", interval_ms: intervalMs, worker: workerId }));
  while (!stopping) {
    try { await main(); } catch (error) { console.error(`worker_loop_error ${error.message}`); }
    if (!stopping) await sleep(intervalMs);
  }
  console.log(JSON.stringify({ ok: true, service: "mediaos-worker", stopped: true, worker: workerId }));
} else {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
