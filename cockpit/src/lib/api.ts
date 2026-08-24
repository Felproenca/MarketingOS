import { apiFetch } from './auth'

const BASE = import.meta.env.VITE_API_URL || ''

/* ── Erros centralizados (401/403/402/409/422) ──────────────────────────── */
export class ApiError extends Error {
  status: number
  details?: Record<string, unknown>
  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function messageForStatus(status: number, body: Record<string, unknown> | null): string {
  const raw = body && typeof body.error === 'string' ? body.error : ''
  switch (status) {
    case 401: return 'Sessão expirada ou inválida. Faça login novamente.'
    case 403: return raw || 'Você não tem acesso a este cliente ou recurso.'
    case 402: {
      const quota = (body?.quota as Record<string, unknown> | undefined) || {}
      const used = quota.usados ?? quota.custo_usado_brl
      return `Quota ou custo excedido: ${raw || 'o limite mensal foi atingido.'}${used != null ? ` Uso atual: ${used}.` : ''}`
    }
    case 404: return raw || 'Recurso não encontrado.'
    case 409: return raw || 'Conflito com o estado atual. Recarregue os dados e tente novamente.'
    case 422: return raw || 'Dados inválidos ou contrato não atendido.'
    default: return raw || 'Falha de comunicação com o servidor.'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`${BASE}${path}`, init)
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null
  if (!response.ok) throw new ApiError(response.status, messageForStatus(response.status, body), body ?? undefined)
  return body as T
}

/* ── Contratos (espelham o backend real) ────────────────────────────────── */
export type Capability = {
  id: string
  label: string
  description?: string
  category?: string
  owner?: string
  status?: string
  skill?: string | null
  fallback?: string | null
  requestTypes?: string[]
  executor?: string | null
  input?: string
  output?: string
  qa?: string[]
  approval?: boolean
  provider?: string
  model?: string
  providers?: string[]
}

export type Job = {
  id: string
  client_id: string
  job_type: string
  capability?: string
  status: string
  priority?: string
  executor?: string | null
  result?: Record<string, unknown> | null
  error?: string | null
  created_at: string
  started_at?: string | null
  completed_at?: string | null
  request_id?: string | null
  attempt_count?: number
  max_attempts?: number
  context_status?: string
  locked_by?: string | null
}

export type Artifact = {
  id: string
  client_id: string
  job_id?: string | null
  artifact_type: string
  title: string
  status: string
  current_version: number
  metadata?: Record<string, unknown>
  created_at: string
  updated_at?: string
}

export type Client = {
  client_id: string
  display_name: string
  company_name?: string | null
  status: string
  updated_at?: string
}

export type ClientProfile = Client

export type Reference = {
  client_id: string
  brand_profile?: { positioning?: string; audience?: string; visual_direction?: string }
  voice_profile?: { tone?: string; vocabulary?: string[] }
  offers?: string[]
  constraints?: string[]
  approved_examples?: string[]
  notes?: string
  updated_at?: string
}

export type RequestEvent = {
  event_type: string
  from_status?: string
  to_status?: string
  message?: string
  created_at: string
  metadata?: Record<string, unknown>
}

export type WorkRequest = {
  id: string
  client_id: string
  title: string
  request_type: string
  objective?: string
  priority?: string
  source_system?: string
  target_system?: string
  status: string
  requires_approval?: boolean
  reference_snapshot?: Record<string, unknown> | null
  payload?: Record<string, unknown> | null
  created_at: string
  updated_at?: string
  route?: string[]
  events?: RequestEvent[]
}

export type SystemStatus = {
  mediaos?: { hardening?: boolean; claim?: boolean }
  aiRouter?: { status?: string; connections?: number | null; connectedProviders?: string[] }
  database?: { ok?: boolean }
  worker?: { online?: boolean }
}

export type OperationsData = {
  clients: ClientProfile[]
  references: Reference[]
  requests: WorkRequest[]
  jobs: Job[]
  artifacts: Artifact[]
  capabilities: Capability[]
  systemStatus: SystemStatus | null
}

export type MissionsData = {
  capabilities: Capability[]
  skills: unknown[]
  jobs: Job[]
  artifacts: Artifact[]
  clients: Client[]
  executionResults: unknown[]
}

export type Quota = {
  plano: string | null
  total_tokens: number
  usados: number
  restantes: number
  valor_plano_brl: number
  teto_custo_brl: number
  custo_usado_brl: number
}

export type Margin = { receita_brl: number; custo_brl: number; lucro_brl: number; margem_pct: number | null }

export type ClientReport = {
  cliente: string
  cota: Quota
  margem: Margin
  operacoes: { missoes: number; sync_runs: number; sync_erros: number; sync_por_fonte: Record<string, number> }
  outputs: { total: number; por_capability: Record<string, number>; por_status: Record<string, number> }
  custo: { tokens_metrificados: number; custo_usd: number; custo_brl_estimado: number; tokens_por_capability: Record<string, number> }
  qualidade: { artifacts: number; aprovados: number; rejeitados: number; taxa_aprovacao: number | null; razoes_rejeicao: { titulo: string; motivo: string | null }[] }
  desperdicio: { outputs_rejeitados: number }
  gerado_em: string
}

export type ClientOverview = ClientReport & {
  proximos_passos: { tipo: string; titulo: string; capability?: string; status: string; criado_em: string }[]
  resultados_reais: { id: string; tipo: string; titulo: string; status: string; criado_em: string }[]
  metricas: { source: string; metrics: Record<string, unknown>; observed_at: string }[]
  previsao: Record<string, Record<string, number | null>>
}

/* ── Endpoints (missões) ────────────────────────────────────────────────── */
export async function getMissions(): Promise<MissionsData> {
  return request<MissionsData>('/api/missions')
}

export async function getMission(id: string): Promise<{ job: Job; artifacts: Artifact[] }> {
  return request<{ job: Job; artifacts: Artifact[] }>(`/api/missions/${encodeURIComponent(id)}`)
}

export async function createMission(data: Record<string, unknown>) {
  return request<Record<string, unknown>>('/api/missions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function executeMission(id: string) {
  return request<Record<string, unknown>>(`/api/missions/${encodeURIComponent(id)}`, { method: 'POST' })
}

export async function deleteMission(id: string) {
  return request<Record<string, unknown>>(`/api/missions/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/* ── Endpoints (operação) ───────────────────────────────────────────────── */
export function getOperations(): Promise<OperationsData> {
  return request<OperationsData>('/api/admin/operations')
}

export function getClients(): Promise<{ clients: ClientProfile[] }> {
  return request<{ clients: ClientProfile[] }>('/api/admin/clients')
}

export function getReport(clientId: string): Promise<ClientReport> {
  return request<ClientReport>(`/api/admin/operations?report=client:${encodeURIComponent(clientId)}`)
}

export function getClientOverview(slug: string): Promise<ClientOverview> {
  return request<ClientOverview>(`/api/client/${encodeURIComponent(slug)}`)
}

/** Cria uma solicitação (work_request). O front não escolhe skill: envia intenção + dados, o backend resolve a rota. */
export async function createRequest(data: Record<string, unknown>): Promise<{ request: WorkRequest; mediaJob?: Job | null; route?: string[]; idempotent?: boolean }> {
  return request<{ request: WorkRequest; mediaJob?: Job | null; route?: string[]; idempotent?: boolean }>('/api/admin/operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify(data),
  })
}

/** QA / aprovação de artifact. Cliente pode approved | changes_requested; rejected é operador. */
export function approveArtifact(artifactId: string, decision: 'approved' | 'changes_requested' | 'rejected', feedback?: string | null) {
  return request<Record<string, unknown>>('/api/admin/artifacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifactId, decision, feedback: feedback ?? null }),
  })
}

export function retryJob(jobId: string) {
  return request<Record<string, unknown>>('/api/admin/operations', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'retry', jobId }),
  })
}
