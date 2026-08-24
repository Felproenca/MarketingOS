import "dotenv/config";

const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !key) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.");
const base = `${supabaseUrl}/rest/v1/`;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function check(path, method = "GET", body) {
  const response = await fetch(base + path, { method, headers: { ...headers, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch {}
  return { ok: response.ok, status: response.status, error: parsed?.message || parsed?.hint || null };
}

const checks = {
  mediaos_core: await check("media_jobs?select=id&limit=1"),
  hardening_client_profiles: await check("client_profiles?select=client_id,onboarding_status,truth_version,truth_hash&limit=1"),
  hardening_media_jobs: await check("media_jobs?select=id,context_hash,context_status,attempt_count,max_attempts,next_attempt_at,locked_at,locked_by,lease_expires_at,heartbeat_at&limit=1"),
  execution_results: await check("execution_results?select=id&limit=1"),
  ai_client_policies: await check("ai_client_policies?select=client_id&limit=1"),
  ai_usage_events: await check("ai_usage_events?select=id&limit=1"),
  ai_optimization_loops: await check("ai_optimization_loops?select=id&limit=1"),
  provider_connections_ai_fields: await check("provider_connections?select=id,execution_mode,monthly_budget,monthly_spend&limit=1"),
  claim_function: await check("rpc/claim_media_job", "POST", { p_worker_id: "schema-audit", p_job_id: null, p_lease_seconds: 60 }),
};

const hardeningApplied = checks.hardening_client_profiles.ok && checks.hardening_media_jobs.ok && checks.claim_function.status !== 404;
const executionBridgeApplied = checks.execution_results.ok;
const aiRoutingApplied = checks.ai_client_policies.ok && checks.ai_usage_events.ok && checks.ai_optimization_loops.ok && checks.provider_connections_ai_fields.ok;
const result = { ok: checks.mediaos_core.ok && hardeningApplied && executionBridgeApplied && aiRoutingApplied, hardeningApplied, executionBridgeApplied, aiRoutingApplied, checks };
console.log(JSON.stringify(result, null, 2));
// This command is also the deployment/worker readiness gate. A partial schema
// must be visible as a failing process, not only as a warning in stdout.
if (!result.ok) process.exitCode = 1;
if (!checks.mediaos_core.ok) process.exitCode = 1;
