const API = import.meta.env.VITE_API_URL || ''
const SESSION = 'mkos.frontend.session'

export type Session = { access_token: string; refresh_token?: string; expires_at?: number; user?: { id: string; email?: string } }
export type Client = { client_id: string; display_name: string; company_name?: string | null; status?: string; setup?: { reference?: boolean; referenceReady?: boolean; quota?: boolean; connections?: number }; sources?: { source:string; username?:string|null; connectedAt?:string|null; expiresAt?:string|null }[]; members?: number }
export type Operation = { id: string; title: string; client_id: string; request_type: string; status: string; objective?: string; target_system?: string; created_at: string; route?: string[] }
export type Job = { id: string; request_id?: string; client_id: string; job_type: string; capability?: string; status: string; error?: string; input?: Record<string, any>; result?: Record<string, any>; created_at: string; completed_at?: string }
export type Artifact = { id: string; job_id?: string; client_id: string; title: string; artifact_type: string; status: string; current_version: number; metadata?: Record<string, any>; qa?: { status?: string; checks?: string[] } | null; preview_url?: string | null; updated_at: string }
export type ClientPortal = { client_id?: string; display_name?: string; company_name?: string; proximos_passos?: any[]; resultados_reais?: any[]; metricas?: any[]; previsao?: Record<string, any>; cota?: any; quota?: any; connections?: any[]; agenda?: any[] }
export type SocialConnection = { clientId:string; connected:boolean; source?:string; username?:string|null; connectedAt?:string|null; expiresAt?:string|null; sources?:string[] }
export type AIConnection = { id:string; client_id:string; provider:string; connection_type:string; capabilities:string[]; execution_mode:string; scopes:string[]; status:string; billing_owner:string; monthly_budget?:number|null; monthly_spend?:number|null; last_validated_at?:string|null; created_at:string; updated_at:string }

export function session() { try { return JSON.parse(localStorage.getItem(SESSION) || 'null') as Session | null } catch { return null } }
function save(value: Session | null) { value ? localStorage.setItem(SESSION, JSON.stringify(value)) : localStorage.removeItem(SESSION) }

async function readBody(response: Response): Promise<any> {
  const text = await response.text()
  if (!text.trim()) return null
  try { return JSON.parse(text) } catch { return { __raw: text } }
}

export async function login(email: string, password: string) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  const r = await fetch(`${url}/auth/v1/token?grant_type=password`, { method:'POST', headers:{apikey:key,'Content-Type':'application/json'}, body:JSON.stringify({email,password}) })
  const b = await readBody(r)
  if (!r.ok) throw Error(b?.error_description || b?.message || (b?.__raw ? `Resposta inválida do serviço de autenticação (HTTP ${r.status}).` : 'Login inválido.'))
  if (!b?.access_token) throw Error('O serviço de autenticação não retornou uma sessão válida.')
  save(b)
  return b as Session
}

export function logout() { save(null) }

async function refreshSession() {
  const current=session(); const url=import.meta.env.VITE_SUPABASE_URL; const key=import.meta.env.VITE_SUPABASE_ANON_KEY
  if(!current?.refresh_token||!url||!key){logout();throw Error('Sessão expirada. Entre novamente.')}
  const r=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:current.refresh_token})})
  const b=await readBody(r)
  if(!r.ok || !b?.access_token){logout();throw Error('Sessão expirada. Entre novamente.')}
  save(b); return b as Session
}

function messageForStatus(status:number,body:any){if(status===401)return 'Sessão expirada. Entre novamente.';if(status===402)return body?.message||body?.quota?.message||'Cota ou limite de custo excedido.';if(status===403)return 'Você não tem permissão para esta ação.';if(status===409)return body?.message||body?.error||'A operação conflita com o estado atual.';if(status===422)return body?.message||body?.error||'Revise os dados informados antes de continuar.';return body?.message||body?.error||`Erro ${status}`}

export async function api<T>(path:string,init:RequestInit={},retried=false){
  const current=session()
  const r=await fetch(`${API}${path}`,{...init,headers:{...(init.body?{'Content-Type':'application/json'}:{}),...(current?.access_token?{Authorization:`Bearer ${current.access_token}`}:{}) ,...(init.headers||{})}})
  const body=await readBody(r)
  if(r.status===401&&!retried&&current?.refresh_token){await refreshSession();return api<T>(path,init,true)}
  if(!r.ok){const detail=body?.__raw?`Resposta inválida do servidor (HTTP ${r.status}).`:messageForStatus(r.status,body);throw Object.assign(Error(detail),{status:r.status,body})}
  return (body ?? {}) as T
}

export async function clients() { return (await api<{clients:Client[]}>('/api/admin/clients')).clients }
export async function createClient(body:Record<string,unknown>) { return api<{clientId:string;displayName:string;status:string;referenceReady:boolean;invitation?:{email:string;sent:boolean}}>(`/api/admin/clients`,{method:'POST',body:JSON.stringify(body)}) }
export async function updateClient(body:Record<string,unknown>) { return api(`/api/admin/clients`,{method:'PUT',body:JSON.stringify(body)}) }
export async function clientReference(clientId:string) { return api<{reference:any}>(`/api/admin/clients?action=reference&clientId=${encodeURIComponent(clientId)}`) }
export async function saveClientReference(clientId:string,body:Record<string,unknown>) { return api(`/api/admin/clients?action=reference&clientId=${encodeURIComponent(clientId)}`,{method:'POST',body:JSON.stringify(body)}) }
export async function operations() { return api<{clients:Client[];requests:Operation[];jobs:Job[];artifacts:Artifact[];systemStatus:any}>('/api/admin/operations') }
export async function clientPortal(slug:string) { return api<ClientPortal>(`/api/client/${encodeURIComponent(slug)}`) }
export async function createClientRequest(slug:string, body:Record<string,unknown>) { return api(`/api/client/${encodeURIComponent(slug)}`,{method:'POST',body:JSON.stringify(body)}) }
export async function connectionStatus(clientId:string, source:'meta'|'google') { const path=source==='meta'?`/api/integrations/meta/client?action=status&clientId=${encodeURIComponent(clientId)}`:`/api/integrations/google?action=status&clientId=${encodeURIComponent(clientId)}`; return api<SocialConnection>(path) }
export async function beginConnection(clientId:string, source:'meta'|'google') { const path=source==='meta'?`/api/integrations/meta/client?action=connect&clientId=${encodeURIComponent(clientId)}`:`/api/integrations/google?action=connect&clientId=${encodeURIComponent(clientId)}`; return api<{url:string}>(path,{method:'POST'}) }
export async function createRequest(body: Record<string,unknown>) { return api<{request:Operation;mediaJob:Job;route:string[]}>('/api/admin/operations',{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(body)}) }
export async function decideArtifact(artifactId:string, decision:'approved'|'changes_requested', feedback?:string) { return api('/api/admin/artifacts',{method:'POST',body:JSON.stringify({artifactId,decision,feedback})}) }
export async function publishArtifact(artifactId:string, caption?:string) { return api('/api/admin/artifacts',{method:'POST',body:JSON.stringify({action:'publish',artifactId,caption})}) }
export async function uploadInput(body:{clientId:string;jobId:string;contentType:string;dataBase64:string;fileName?:string;title?:string}) { return api('/api/admin/ai/upload',{method:'POST',body:JSON.stringify(body)}) }
export async function aiConnections(clientId:string) { return (await api<{connections:AIConnection[]}>(`/api/admin/ai/connections?clientId=${encodeURIComponent(clientId)}`)).connections }
export async function saveAIConnection(body:Record<string,unknown>) { return api<{connection:AIConnection}>('/api/admin/ai/connections',{method:'POST',body:JSON.stringify(body)}) }
export async function retryJob(jobId:string) { return api('/api/admin/operations',{method:'PATCH',body:JSON.stringify({action:'retry',jobId})}) }
export async function hermesChat(body:{message:string;clientId?:string}) { return api<{reply:string;scope:'operator'|'client';assistant:string}>('/api/admin/operations',{method:'POST',body:JSON.stringify({...body,action:'hermes'})}) }

// ── Agenda editorial por cliente ────────────────────────────────────────────────
export type AgendaItem = { id:string; client_id:string; title:string; status:'proposta'|'aprovado'|'recusado'|'gerado'|string; type:string; objective:string; due_date?:string|null; production_request_id?:string|null; created_at:string }
export async function agendaList(clientId?:string) { return api<{items:AgendaItem[]}>(`/api/admin/operations`,{method:'POST',body:JSON.stringify({action:'agenda',subAction:'list',clientId:clientId||''})}) }
export async function agendaCreate(clientId:string, items:{title:string;type:string;objective?:string;due_date?:string|null}[]) { return api<{ok:boolean;created:{id:string;title:string;type:string}[]}>(`/api/admin/operations`,{method:'POST',body:JSON.stringify({action:'agenda',subAction:'create',clientId,items})}) }
export async function agendaApprove(itemIds:string[]) { return api<{ok:boolean;updated:number}>(`/api/admin/operations`,{method:'POST',body:JSON.stringify({action:'agenda',subAction:'approve',itemIds})}) }
export async function agendaReject(itemIds:string[]) { return api<{ok:boolean;updated:number}>(`/api/admin/operations`,{method:'POST',body:JSON.stringify({action:'agenda',subAction:'reject',itemIds})}) }
export async function agendaGenerate(clientId:string) { return api<{ok:boolean;generated:{agenda_item_id:string;production_request_id:string|null;title:string}[]}>(`/api/admin/operations`,{method:'POST',body:JSON.stringify({action:'agenda',subAction:'generate',clientId})}) }

// Cliente aprova/recusa a agenda pelo portal
 export async function clientAgendaDecide(slug:string, action:'approve_agenda'|'reject_agenda', itemIds:string[]) { return api<{ok:boolean;updated:number}>(`/api/client/${encodeURIComponent(slug)}`,{method:'POST',body:JSON.stringify({action,itemIds})}) }

// Link de acesso mágico do cliente (operador gera e envia)
export async function accessLink(clientId:string, email:string) { return api<{ok:boolean;url:string;email:string;note?:string}>(`/api/admin/clients?action=access_link&clientId=${encodeURIComponent(clientId)}`,{method:'POST',body:JSON.stringify({email})}) }
