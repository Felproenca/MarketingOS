/* Formatters de status, moeda, data e duração — pt-BR, alinhados ao design system. */

export type Tone = 'pending' | 'active' | 'wait' | 'done' | 'danger'

export const STATUS_META: Record<string, { label: string; color: string; tone: Tone }> = {
  queued: { label: 'Na fila', color: 'var(--text-3)', tone: 'pending' },
  referenced: { label: 'Referenciado', color: 'var(--cyan)', tone: 'active' },
  routed: { label: 'Rota definida', color: 'var(--cyan)', tone: 'active' },
  running: { label: 'Executando', color: 'var(--accent)', tone: 'active' },
  review: { label: 'Em revisão', color: 'var(--amber)', tone: 'wait' },
  approved: { label: 'Aprovado', color: 'var(--green)', tone: 'done' },
  published: { label: 'Publicado', color: 'var(--green)', tone: 'done' },
  done: { label: 'Concluído', color: 'var(--green)', tone: 'done' },
  blocked: { label: 'Bloqueado', color: 'var(--red)', tone: 'danger' },
  error: { label: 'Erro', color: 'var(--red)', tone: 'danger' },
  awaiting_input: { label: 'Aguardando input', color: 'var(--amber)', tone: 'wait' },
  contract_only: { label: 'Contrato sem executor', color: 'var(--amber)', tone: 'wait' },
  changes_requested: { label: 'Ajuste solicitado', color: 'var(--amber)', tone: 'wait' },
  stale: { label: 'Job obsoleto', color: 'var(--red)', tone: 'danger' },
  rejected: { label: 'Rejeitado', color: 'var(--red)', tone: 'danger' },
  paused: { label: 'Pausado', color: 'var(--text-3)', tone: 'pending' },
}

export function statusMeta(status: string): { label: string; color: string; tone: Tone } {
  return STATUS_META[status] || { label: status, color: 'var(--text-3)', tone: 'pending' }
}

/** Próximo passo legível para o estado de um pedido. */
export function nextStepFor(requestStatus: string, jobStatus: string | null, artifactStatus: string | null): string {
  const s = artifactStatus || jobStatus || requestStatus
  switch (s) {
    case 'queued': return 'Aguardando o worker pegar o job.'
    case 'referenced': return 'Contexto do cliente carregado; rota sendo decidida.'
    case 'routed': return 'Rota definida; aguardando executor.'
    case 'running': return 'Executando agora — acompanhe os eventos abaixo.'
    case 'review': return 'Revisar o QA e aprovar ou pedir ajuste.'
    case 'approved': return 'Aprovado. Publicação ou próximo passo depende do operador.'
    case 'published': case 'done': return 'Concluído.'
    case 'changes_requested': return 'Ajuste solicitado; nova versão será gerada.'
    case 'blocked': return 'Bloqueado — requer ação (input, credencial ou operador).'
    case 'error': return 'Erro de execução — use “Reprocessar”.'
    case 'awaiting_input': return 'Aguardando arquivo, credencial ou informação sua.'
    case 'contract_only': return 'Contrato criado, mas ainda sem executor validado.'
    case 'stale': return 'Job perdeu o lease — aguarde recuperação ou reprocesse.'
    default: return 'Acompanhe o status abaixo.'
  }
}

export function brl(v: number | null | undefined, digits = 2): string {
  if (v == null) return '—'
  return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

export function num(v: number | null | undefined): string {
  if (v == null) return '—'
  return Number(v).toLocaleString('pt-BR')
}

export function pct(v: number | null | undefined): string {
  if (v == null) return '—'
  return `${Number(v).toLocaleString('pt-BR')}%`
}

export function dateTime(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function dateShort(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function duration(iso?: string | null): string {
  if (!iso) return '—'
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'agora'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.round(hours / 24)} dias`
}

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase()
}

/** Pega um valor de métrica ignorando chaves não numéricas. */
export function metricValue(metrics: Record<string, unknown>, key: string): number | null {
  const v = metrics[key]
  if (v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
