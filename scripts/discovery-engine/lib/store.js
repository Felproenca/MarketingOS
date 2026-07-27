'use strict';

/**
 * lib/store.js — Fonte única de verdade do Discovery Engine, por nicho.
 *
 * Arquivo: agency/discovery-leads/<niche_id>.json (objeto keyed por CNPJ,
 * senão domain, senão place_id — nessa ordem de preferência).
 *
 * Steps: discovered → enriched → qualified → pending_approval
 * (o que acontece depois de aprovado — envio de fato — é responsabilidade do
 * ContactRouter/canal escolhido, não deste store; ver contact-router.js)
 *
 * Cross-check obrigatório: antes de inserir um lead novo, consulta o pipeline
 * de outreach já existente (scripts/pipeline/store.js, usado pelo scraper v3)
 * por telefone/domínio — nunca contatar duas vezes o mesmo negócio só porque
 * ele entrou por um pipeline diferente.
 */

const fs = require('fs');
const path = require('path');

const legacyStore = require('../../pipeline/store'); // scripts/pipeline/store.js

const DATA_DIR = path.resolve(__dirname, '../../../agency/discovery-leads');

function fileFor(nicheId) {
  return path.join(DATA_DIR, `${nicheId}.json`);
}

function load(nicheId) {
  try {
    return JSON.parse(fs.readFileSync(fileFor(nicheId), 'utf8'));
  } catch {
    return {};
  }
}

/**
 * Escrita "atômica" (temp + rename) — no Windows, renameSync sobre um destino
 * existente pode falhar com EPERM de forma transiente (antivírus/indexador
 * segurando o handle por um instante). Achado em teste funcional
 * 2026-07-13: um run real quebrou no meio, deixando .tmp órfão no disco.
 * Corrigido com retry curto antes de desistir do modo atômico.
 */
function save(nicheId, state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = fileFor(nicheId);
  const tmp = `${file}.tmp`;
  const json = JSON.stringify(state, null, 2);
  fs.writeFileSync(tmp, json, 'utf8');

  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      fs.renameSync(tmp, file);
      return;
    } catch (err) {
      if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err;
      if (attempt === MAX_ATTEMPTS) {
        // Último recurso: grava direto (não-atômico, mas não trava o pipeline)
        fs.writeFileSync(file, json, 'utf8');
        fs.unlinkSync(tmp);
        return;
      }
      // Espera síncrona curta e crescente antes de tentar de novo
      const waitMs = 50 * attempt;
      const until = Date.now() + waitMs;
      while (Date.now() < until) { /* busy-wait curto, evita depender de async aqui */ }
    }
  }
}

function safeDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** Chave canônica: CNPJ > domain > place_id */
function keyFor(lead) {
  if (lead.cnpj?.cnpj) return `cnpj:${lead.cnpj.cnpj}`;
  const domain = lead.domain || (lead.website?.url ? safeDomain(lead.website.url) : null);
  if (domain) return `domain:${domain}`;
  if (lead.places?.place_id) return `place:${lead.places.place_id}`;
  return null;
}

/**
 * Já existe no pipeline LEGADO de outreach (scraper v3 / agency/leads)?
 * Consulta por telefone e domínio — se sim, este lead não deve ser
 * re-inserido no Discovery Engine como se fosse novo.
 */
function alreadyInLegacyOutreachPipeline(lead) {
  const phone = lead.places?.phone || lead.website?.phone || null;
  const domain = lead.domain || (lead.website?.url ? safeDomain(lead.website.url) : null);
  if (!phone && !domain) return null;
  return legacyStore.exists({ phone, domain });
}

function get(nicheId, key) {
  return load(nicheId)[key] || null;
}

function exists(nicheId, lead) {
  const key = keyFor(lead);
  if (!key) return null;
  return load(nicheId)[key] || null;
}

/**
 * upsert(nicheId, lead) → registra/atualiza. Retorna null se o lead já
 * estiver no pipeline legado de outreach (proteção de dedupe cross-sistema).
 */
function upsert(nicheId, lead) {
  const key = keyFor(lead);
  if (!key) return null;

  const legacyHit = alreadyInLegacyOutreachPipeline(lead);
  if (legacyHit) {
    return { skipped: true, reason: 'already_in_legacy_outreach_pipeline', legacy: legacyHit };
  }

  const state = load(nicheId);
  const now = new Date().toISOString();
  const existing = state[key] || {};

  state[key] = {
    niche_id: nicheId,
    name: lead.places?.name || lead.name || existing.name || null,
    domain: lead.domain || (lead.website?.url ? safeDomain(lead.website.url) : null) || existing.domain || null,
    cnpj: lead.cnpj?.cnpj || existing.cnpj || null,
    places: lead.places || existing.places || null,
    cnpj_enrichment: lead.cnpj || existing.cnpj_enrichment || null,
    website_enrichment: lead.website || existing.website_enrichment || null,
    qualification: lead.qualification || existing.qualification || null,
    step: existing.step || 'discovered',
    createdAt: existing.createdAt || now,
    updatedAt: now,
    history: existing.history || [],
  };

  save(nicheId, state);
  return state[key];
}

function setStep(nicheId, key, step, detail = null) {
  const state = load(nicheId);
  if (!state[key]) return null;

  const now = new Date().toISOString();
  state[key].history.push({ at: now, from: state[key].step, to: step, detail });
  state[key].step = step;
  state[key].updatedAt = now;

  save(nicheId, state);
  return state[key];
}

function listByStep(nicheId, step) {
  return Object.entries(load(nicheId))
    .filter(([, lead]) => lead.step === step)
    .map(([key, lead]) => ({ key, lead }));
}

/** Atualiza campos arbitrários sem mexer em step/history (ex.: drafts, flags) */
function update(nicheId, key, patch) {
  const state = load(nicheId);
  if (!state[key]) return null;

  state[key] = { ...state[key], ...patch, updatedAt: new Date().toISOString() };
  save(nicheId, state);
  return state[key];
}

/**
 * Aprovação humana explícita — o operador edita o arquivo do nicho (ou usa
 * este helper) marcando approved:true num lead específico ANTES de qualquer
 * envio real. send-approved.js só manda pra quem tem isso marcado.
 */
function setApproved(nicheId, key, approved = true) {
  return update(nicheId, key, { approved });
}

/** Leads aprovados que ainda não foram enviados (step ainda pending_approval) */
function listApprovedUnsent(nicheId) {
  return Object.entries(load(nicheId))
    .filter(([, lead]) => lead.approved === true && lead.step === 'pending_approval')
    .map(([key, lead]) => ({ key, lead }));
}

module.exports = {
  DATA_DIR,
  load, save, keyFor, safeDomain,
  get, exists, upsert, setStep, update, listByStep,
  setApproved, listApprovedUnsent,
  alreadyInLegacyOutreachPipeline,
};
