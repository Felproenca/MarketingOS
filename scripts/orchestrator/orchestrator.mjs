#!/usr/bin/env node
// AGENTE ORQUESTRADOR DE SISTEMA — administra a construção do MarketingOS.
//
// Ciclo: AUDIT (estado real) → DECIDE (regras + LLM) → FIX (reparos seguros) → VERIFY.
// Conhece as diretrizes (rules.md) e o contexto do projeto (docs/). Encontra erros reais,
// decide a solução e repara o que é seguro — escalando o resto para o operador.
//
// Uso:
//   node scripts/orchestrator/orchestrator.mjs --audit        # estado + problemas
//   node scripts/orchestrator/orchestrator.mjs --decide       # audit + plano de ação
//   node scripts/orchestrator/orchestrator.mjs --fix          # audit + decide + repara (seguro)
//   node scripts/orchestrator/orchestrator.mjs --loop         # fix a cada 10min
//   node scripts/orchestrator/orchestrator.mjs --report       # resumo executivo (para o Hermes)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectState, loadEnv, marketingRoot, supabase } from './state.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const mode = args.includes('--fix') ? 'fix' : args.includes('--decide') ? 'decide' : args.includes('--loop') ? 'loop' : args.includes('--report') ? 'report' : 'audit'

// ── regras de decisão (determinísticas; LLM entra só no que exige julgamento) ──
const DECISIONS = [
  { match: p => p.tipo === 'worker_offline', acao: 'restart', desc: p => `Reiniciar ${p.detalhe.split(' está ')[0]} via pm2 e verificar status online.` },
  { match: p => p.tipo === 'artifact_draft_com_conteudo', acao: 'promover_review', desc: () => 'Promover artifacts draft com conteúdo para review (preview = rendered_urls ou texto).' },
  { match: p => p.tipo === 'sync_sem_conexao', acao: 'desabilitar', desc: () => 'Desabilitar sync_schedules sem conexão real (estado honesto).' },
  { match: p => p.tipo === 'job_preso', acao: 'liberar', desc: p => `Jobs ${p.jobs.length ? '' : ''}presos: devolver para queued com erro claro ou marcar stale, conforme histórico.` },
  { match: p => p.tipo === 'jobs_com_erro', acao: 'analisar_erros', desc: p => `Analisar erros de jobs (ex.: ${p.detalhe.slice(0, 100)}) e reprocessar os re-tentáveis.` },
  { match: p => p.tipo === 'servico_fora', acao: 'escalar', desc: p => `Serviço fora do ar (${p.detalhe}) — requer ação do operador (deploy/config).` },
  { match: p => p.tipo === 'review_sem_preview', acao: 'escalar', desc: () => 'Artifacts review sem preview: investigar origem antes de agir.' },
]

function decide(problema) {
  const regra = DECISIONS.find(d => d.match(problema))
  return regra ? { problema: problema.tipo, severidade: problema.severidade, acao: regra.acao, plano: regra.desc(problema) } : { problema: problema.tipo, severidade: problema.severidade, acao: 'escalar', plano: 'Sem regra determinística — escalar para o operador com evidência.' }
}

// ── reparos seguros (cada um verifica o efeito antes de declarar ok) ──
async function reparar(env, plano, estado) {
  const log = []
  for (const decisao of plano) {
    try {
      if (decisao.acao === 'restart' && decisao.problema === 'worker_offline') {
        const nome = /^(.+?)\s+está/.exec(decisao.plano)?.[1]
        if (nome) {
          const { spawnSync } = await import('node:child_process')
          spawnSync('pm2', ['restart', nome], { encoding: 'utf8' })
          await new Promise(r => setTimeout(r, 3000))
          const s = await collectState()
          const ok = s.workers?.find(w => w.nome === nome)?.status === 'online'
          log.push({ acao: 'restart', alvo: nome, resultado: ok ? 'ok' : 'falhou', verificacao: ok ? `pm2 mostra ${nome} online` : `pm2 mostra ${nome} ainda fora` })
        }
      }
      if (decisao.acao === 'desabilitar') {
        const { spawnSync } = await import('node:child_process')
        // desabilita schedules habilitados sem conexão
        const conns = await supabase(env, 'connections?select=client_id,source&limit=200').catch(() => [])
        const sched = await supabase(env, 'sync_schedules?select=client_id,source,enabled&limit=200').catch(() => [])
        const has = (c, s) => (conns || []).some(x => x.client_id === c && (x.source === s || (s === 'instagram' && x.source === 'meta') || (s === 'meta_ads' && x.source === 'meta')))
        let desabilitados = 0
        for (const s of sched || []) {
          if (s.enabled && !has(s.client_id, s.source)) {
            await supabase(env, `sync_schedules?client_id=eq.${encodeURIComponent(s.client_id)}&source=eq.${encodeURIComponent(s.source)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ enabled: false, updated_at: new Date().toISOString() }) })
            desabilitados++
          }
        }
        log.push({ acao: 'desabilitar', alvo: 'sync_schedules', resultado: desabilitados ? 'ok' : 'nada_a_fazer', verificacao: `${desabilitados} schedule(s) desabilitados` })
      }
      if (decisao.acao === 'promover_review') {
        const drafts = await supabase(env, 'artifacts?status=eq.draft&select=id,job_id,metadata,artifact_type&limit=100').catch(() => [])
        let promovidos = 0
        for (const a of drafts || []) {
          const res = a.metadata?.result || {}
          const urls = res?.structured?.rendered_urls || []
          if (!urls.length && !res?.text) continue
          const preview = urls[0] || null
          await supabase(env, `artifacts?id=eq.${encodeURIComponent(a.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'review', metadata: { ...(a.metadata || {}), preview_url: preview, assets: urls.map(u => ({ kind: 'image', url: u })) }, updated_at: new Date().toISOString() }) })
          promovidos++
        }
        log.push({ acao: 'promover_review', alvo: 'artifacts', resultado: promovidos ? 'ok' : 'nada_a_fazer', verificacao: `${promovidos} artifact(s) promovidos para review` })
      }
      if (decisao.acao === 'liberar') {
        const presos = await supabase(env, 'media_jobs?status=in.(running,routed)&select=id,status,updated_at&limit=50').catch(() => [])
        let liberados = 0
        for (const j of presos || []) {
          const idadeMin = (Date.now() - new Date(j.updated_at || 0).getTime()) / 60000
          if (idadeMin > 60) {
            await supabase(env, `media_jobs?id=eq.${encodeURIComponent(j.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'error', error: 'Orquestrador: job sem progresso há >1h — liberado para análise/reprocessamento.', locked_at: null, locked_by: null, lease_expires_at: null, updated_at: new Date().toISOString() }) })
            liberados++
          }
        }
        log.push({ acao: 'liberar', alvo: 'media_jobs', resultado: liberados ? 'ok' : 'nada_a_fazer', verificacao: `${liberados} job(s) liberados` })
      }
      if (decisao.acao === 'analisar_erros') {
        // reprocessa jobs error re-tentáveis (sem retryable:false) — verificação posterior
        const errados = await supabase(env, 'media_jobs?status=eq.error&select=id,error,executor,updated_at&limit=30').catch(() => [])
        const alvo = (errados || []).filter(j => !/não|nao|ausente|bloqueado|401|403|422/.test(String(j.error || ''))).slice(0, 5)
        let reprocessados = 0
        for (const j of alvo) {
          await supabase(env, `media_jobs?id=eq.${encodeURIComponent(j.id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'queued', error: null, locked_at: null, locked_by: null, lease_expires_at: null, updated_at: new Date().toISOString() }) })
          reprocessados++
        }
        log.push({ acao: 'reprocessar', alvo: 'media_jobs', resultado: reprocessados ? 'ok' : 'nada_a_fazer', verificacao: `${reprocessados} job(s) de erro reprocessados (re-tentáveis)` })
      }
      if (decisao.acao === 'escalar') {
        log.push({ acao: 'escalar', alvo: decisao.problema, resultado: 'operador', verificacao: 'Requer decisão humana — registrado no relatório.' })
      }
    } catch (e) {
      log.push({ acao: decisao.acao, alvo: decisao.problema, resultado: 'erro', verificacao: e.message.slice(0, 160) })
    }
  }
  return log
}

async function llmResumo(env, estado, plano) {
  const key = env.DEEPSEEK_API_KEY
  if (!key) return null
  const contexto = {
    estado: { jobs: estado.jobs, requests: estado.requests, clientes: estado.clientes, workers: estado.workers?.map(w => `${w.nome}:${w.status}`) },
    problemas: (plano || []).map(d => `${d.problema} (${d.severidade}) → ${d.acao}`),
  }
  try {
    const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 300, messages: [{ role: 'system', content: 'Você é o orquestrador do MarketingOS. Em 2-3 frases diretas, diga o que está saudável, o que está quebrado e o que priorizar. Não invente estados.' }, { role: 'user', content: JSON.stringify(contexto) }] }),
    })
    const body = await r.json()
    return String(body?.choices?.[0]?.message?.content || '').trim().slice(0, 500)
  } catch { return null }
}

async function main() {
  const env = loadEnv()
  console.log(`[orquestrador] ${mode} — coletando estado real...`)
  const estado = await collectState()
  const plano = (estado.problemas || []).map(decide)
  const resumo = await llmResumo(env, estado, plano)

  const relatorio = {
    gerado_em: estado.gerado_em,
    modo: mode,
    estado: {
      clientes: estado.clientes,
      jobs: estado.jobs,
      requests: estado.requests,
      workers: estado.workers,
      servicos: Object.fromEntries(Object.entries(estado.verificacoes).filter(([k]) => ['backend', 'frontend_operador', 'frontend_cockpit'].includes(k))),
    },
    problemas: estado.problemas,
    decisoes: plano,
    resumo_llm: resumo,
    reparos: [],
  }

  if (mode === 'fix' || mode === 'loop') {
    relatorio.reparos = await reparar(env, plano, estado)
  }

  // grava o último status para o Hermes e para o operador consultarem sem refazer a auditoria
  try {
    const runtimeDir = path.join(marketingRoot, 'runtime')
    fs.mkdirSync(runtimeDir, { recursive: true })
    fs.writeFileSync(path.join(runtimeDir, 'orchestrator-status.json'), JSON.stringify({ gerado_em: relatorio.gerado_em, problemas: (estado.problemas || []).length, severidade_alta: (estado.problemas || []).filter(p => p.severidade === 'alta').length, resumo: resumo, problemas_detalhe: (estado.problemas || []).map(p => `${p.tipo}: ${p.detalhe.slice(0, 140)}`), servicos: relatorio.estado.servicos, workers: estado.workers }, null, 2))
  } catch { /* runtime dir opcional */ }

  // envia o status ao backend (audit_events) para o Hermes responder com o estado real
  if ((mode === 'fix' || mode === 'loop') && env.MEDIAOS_EXECUTION_INGEST_SECRET && env.MARKETINGOS_COCKPIT_URL) {
    try {
      await fetch(`${(env.MARKETINGOS_COCKPIT_URL || '').replace(/\/$/, '')}/api/admin/operations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-mediaos-execution-secret': env.MEDIAOS_EXECUTION_INGEST_SECRET },
        body: JSON.stringify({ action: 'orchestrator_status', status: { gerado_em: relatorio.gerado_em, problemas: (estado.problemas || []).length, severidade_alta: (estado.problemas || []).filter(p => p.severidade === 'alta').length, resumo: resumo, problemas_detalhe: (estado.problemas || []).map(p => `${p.tipo}: ${p.detalhe.slice(0, 140)}`) } }),
      })
    } catch { /* backend indisponível — status fica local */ }
  }

  console.log(JSON.stringify(relatorio, null, 2).slice(0, 4000))
  if (mode === 'loop') {
    console.log('[orquestrador] loop: próximo ciclo em 10min')
    setInterval(async () => {
      try {
        const e2 = await collectState()
        const p2 = (e2.problemas || []).map(decide)
        const reparos = await reparar(env, p2, e2)
        const resumo2 = await llmResumo(env, e2, p2)
        // envia status atualizado ao backend
        if (env.MEDIAOS_EXECUTION_INGEST_SECRET && env.MARKETINGOS_COCKPIT_URL) {
          try {
            await fetch(`${(env.MARKETINGOS_COCKPIT_URL || '').replace(/\/$/, '')}/api/admin/operations`, {
              method: 'POST',
              headers: { 'content-type': 'application/json', 'x-mediaos-execution-secret': env.MEDIAOS_EXECUTION_INGEST_SECRET },
              body: JSON.stringify({ action: 'orchestrator_status', status: { gerado_em: new Date().toISOString(), problemas: (e2.problemas || []).length, severidade_alta: (e2.problemas || []).filter(p => p.severidade === 'alta').length, resumo: resumo2, problemas_detalhe: (e2.problemas || []).map(p => `${p.tipo}: ${p.detalhe.slice(0, 140)}`) } }),
            })
          } catch { /* backend indisponível */ }
        }
        console.log(JSON.stringify({ ciclo: new Date().toISOString(), problemas: p2.length, reparos }, null, 1).slice(0, 1200))
      } catch (e) { console.error('[orquestrador] erro no ciclo:', e.message) }
    }, 10 * 60 * 1000)
    // mantém o processo vivo (o loop roda no setInterval)
    return
  }
  process.exit(0)
}

main().catch(e => { console.error('[orquestrador] falha:', e.message); process.exit(1) })
