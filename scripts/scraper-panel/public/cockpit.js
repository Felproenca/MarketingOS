'use strict';

const S = { data: null, selectedKey: null, activeJobId: null, jobTimer: null };

const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function brl(v) {
  if (v === null || v === undefined || v === '' || !Number.isFinite(Number(v))) return null;
  return 'R$ ' + Number(v).toLocaleString('pt-BR');
}
function shortDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—'
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
}
function initials(name) { return (name || '?').trim().charAt(0).toUpperCase() || '?'; }

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { 'content-type': 'application/json' }, ...opts });
  const p = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(p.error || `Erro ${r.status}`);
  return p;
}
function toast(msg) {
  const n = $('#toast'); n.textContent = msg; n.classList.add('show');
  clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('show'), 3600);
}

// ── Funil: etapas → 5 colunas editoriais ──────────────────────────────────────
const LANES = [
  { name: 'Descobertos', steps: ['discovered', 'qualified', 'pending_approval'] },
  { name: 'Enviados',    steps: ['sent'] },
  { name: 'Follow-up',   steps: ['followup_1', 'followup_2'] },
  { name: 'Responderam', steps: ['replied', 'demo_sent', 'call_offered'] },
  { name: 'Fechamento',  steps: ['closed'] },
];
const STEP_PT = {
  sent: 'enviado', followup_1: 'follow-up 1', followup_2: 'follow-up 2',
  replied: 'respondeu', demo_sent: 'demo', call_offered: 'call', closed: 'fechado',
  discovered: 'descoberto', qualified: 'qualificado', pending_approval: 'aprovação',
};
const DISCOVERY_STEPS = ['discovered', 'qualified', 'pending_approval'];

// Junta pending-approval (onde vive a copy do 1º contato) com o pipeline.
function enrichLeads(data) {
  const pipe = data.pipeline || {};
  const contacts = (pipe.contacts || []).map(c => ({ ...c, id: c.key }));
  const pendings = (data.pending && data.pending.items) || [];
  const mkey = o => String(o.whatsapp || '').replace(/\D/g, '')
    || String(o.domain || '').toLowerCase()
    || String(o.name || '').toLowerCase();

  const byKey = {};
  contacts.forEach(c => { byKey[mkey(c)] = c; });

  pendings.forEach(pi => {
    const m = pi.message || {};
    const msg = m.whatsapp_version || m.body || '';
    const variants = Array.isArray(m.variants) ? m.variants : null;
    const recommended = m.recommended || null;
    const hit = byKey[mkey(pi)];
    if (hit) {
      hit.message = msg; hit.messageVariants = variants; hit.recommended = recommended;
      hit.pendingIndex = pi.index; hit.channel = pi.channel;
    } else contacts.push({
      id: 'pending:' + pi.index, key: 'pending:' + pi.index, name: pi.name, domain: pi.domain,
      segment: pi.segment, whatsapp: pi.whatsapp, website: pi.website, score: pi.score,
      main_problem: pi.main_problem, step: 'pending_approval', tier: 'mass',
      message: msg, messageVariants: variants, recommended, pendingIndex: pi.index, channel: pi.channel,
    });
  });
  return contacts;
}

function entryHtml(c) {
  const ht = c.tier === 'high-touch';
  const sel = c.key === S.selectedKey ? ' on' : '';
  const variant = c.variant ? `<span class="abmark a">${esc(c.variant)}</span>` : '<span class="abmark">—</span>';

  let infoLine, status;
  if (DISCOVERY_STEPS.includes(c.step)) {
    // No descoberto importa a copy, não o valor.
    infoLine = c.message
      ? '<div class="eval"><s>✎ copy de 1º contato pronta</s></div>'
      : '<div class="eval"><s>copy pendente</s></div>';
    status = `<span class="ew">${esc(STEP_PT[c.step] || c.step || '')}</span>`;
  } else {
    const val = brl(c.value);
    infoLine = val ? `<div class="eval">${esc(val)}<s>/mês</s></div>` : '';
    status = ht && c.nextActionAt
      ? `<span class="ew due">ação · ${esc(shortDate(c.nextActionAt))}</span>`
      : `<span class="ew">${esc(STEP_PT[c.step] || c.step || '')}</span>`;
  }

  return `<div class="entry${ht ? ' lead' : ''}${sel}" data-key="${esc(c.key)}">
    <div class="en">${ht ? '<span class="crown">♛</span> ' : ''}${esc(c.name || c.domain || 'Lead')}</div>
    <div class="es">${esc(c.segment || c.domain || '')}</div>
    ${infoLine}
    <div class="ef">${status}${variant}</div>
  </div>`;
}

function renderBoard() {
  const all = enrichLeads(S.data);
  const board = $('#board');
  board.innerHTML = LANES.map(lane => {
    const inLane = all.filter(c => lane.steps.includes(c.step));
    const items = inLane.length ? inLane.map(entryHtml).join('') : '<div class="col-empty">—</div>';
    return `<div class="led-col">
      <div class="led-top"><span class="nm">${lane.name}</span><span class="ct num">${inLane.length}</span></div>
      <div class="led-list">${items}</div>
    </div>`;
  }).join('');

  board.querySelectorAll('.entry').forEach(el => {
    el.addEventListener('click', () => { S.selectedKey = el.dataset.key; renderDispatch(); });
  });
}

// ── Despacho ciente da etapa ──────────────────────────────────────────────────
function selectedLead() {
  if (!S.data) return null;
  const all = enrichLeads(S.data);
  if (S.selectedKey) {
    const f = all.find(c => c.key === S.selectedKey);
    if (f) return f;
  }
  const ht = (S.data.pipeline.highTouch || [])[0];
  if (ht) { const f = all.find(c => c.key === ht.key); if (f) return f; }
  return all[0] || null;
}

function plannedOutputs() {
  const o = (S.data && S.data.settings && S.data.settings.outputs) || {};
  const map = { diagnosis: 'diagnóstico', demo: 'demo', landing: 'landing', email: 'e-mail', followup: 'follow-up' };
  return Object.entries(map).filter(([k]) => o[k]).map(([, v]) => v);
}

function dispatchHeader(lead, kicker) {
  const ht = lead.tier === 'high-touch';
  return `<div class="dsp-h">
    <div class="top"><span>${kicker}</span><span>${ht ? '♛ high-touch' : 'tier massa'}</span></div>
    <div class="who"><div class="seal">${esc(initials(lead.name))}</div>
      <div><h3>${esc(lead.name || lead.domain || 'Lead')}</h3>
      <div class="sub">${esc(lead.segment || lead.domain || lead.whatsapp || '')}</div></div></div>
    <div class="chips"><span class="chip ${ht ? 'gold' : ''}">${ht ? 'high-touch' : 'massa'}</span>
      <span class="chip">${esc(STEP_PT[lead.step] || lead.step || '—')}</span>
      ${lead.channel ? `<span class="chip blue">${esc(lead.channel)}</span>` : ''}</div></div>`;
}

function renderDispatch() {
  const box = $('#dispatch');
  const lead = selectedLead();
  if (!lead) {
    box.innerHTML = `<div class="dsp-empty"><span class="big-q">“De onde vem o próximo cliente?”</span>
      Pipeline vazio. Rode uma prospecção — os leads aparecem aqui com a copy de 1º contato pronta.</div>`;
    return;
  }
  S.selectedKey = lead.key;
  if (DISCOVERY_STEPS.includes(lead.step)) renderFirstContact(lead);
  else renderDeal(lead);
}

// Estágio Descobertos: o que importa é a COPY do 1º contato — não o valor.
function renderFirstContact(lead) {
  const gate = S.data.pipeline.canSend;
  const variants = (lead.messageVariants && lead.messageVariants.length > 1) ? lead.messageVariants : null;
  const rec = lead.recommended || {};
  S._variantChosen = variants ? (variants[0].id || 'A') : null;

  const copyBlock = variants
    ? `<div class="dsp-lab">Copy de 1º contato <b>3 variantes · A/B</b></div>
       <div class="vlist" id="copy-variants">
         ${variants.map((v, i) => `
           <div class="v${i === 0 ? ' on' : ''}" data-msg="${esc(v.whatsapp_version)}" data-id="${esc(v.id || '')}">
             <div class="vrow"><span class="vt"><span class="mk"></span> ${esc(v.id || '·')} · ${esc(v.angle || '')}</span></div>
             <div class="body-q">${esc(v.whatsapp_version)}</div>
           </div>`).join('')}
       </div>`
    : `<div class="dsp-lab">Copy de 1º contato <b>do Copy Engine</b></div>
       <div class="cpnote">Variante única — rode uma prospecção nova para gerar as 3.</div>`;

  // Pacote = recomendação levantada na pesquisa (diagnóstico/vídeo) + defaults do painel.
  const pkg = [];
  if (rec.diagnosis) pkg.push('diagnóstico');
  if (rec.video) pkg.push('vídeo');
  plannedOutputs().forEach(o => { if (!pkg.includes(o)) pkg.push(o); });

  const initial = variants ? variants[0].whatsapp_version : lead.message;

  $('#dispatch').innerHTML =
    dispatchHeader(lead, 'Despacho — 1º contato') +
    `<div class="dsp-b">
      ${copyBlock}
      <div class="dsp-lab" style="margin-top:16px">Mensagem final · editável</div>
      <textarea class="ed" id="f-copy" placeholder="Mensagem de primeiro contato — sem link, sem pitch, termina em pergunta.">${esc(initial || '')}</textarea>
      <div class="dsp-lab" style="margin-top:16px">Pacote planejado · após resposta${rec.reason ? ` <b>${esc(rec.reason)}</b>` : ''}</div>
      <div class="pkg">${pkg.length
        ? pkg.map(o => `<span class="pkgtag on">${esc(o)}</span>`).join('')
        : '<span class="pkgtag">nenhum — só conversa</span>'}</div>
    </div>
    <div class="dsp-f">
      <span class="gate"><i class="${gate ? '' : 'blocked'}"></i> ${gate ? 'GATE OK' : 'BLOQUEADO'}</span>
      <button class="bsm" id="b-savecopy"${lead.pendingIndex == null ? ' disabled' : ''}>Salvar copy</button>
      <button class="bsm gold" id="b-approve">Aprovar lote →</button>
    </div>`;

  const vEls = document.querySelectorAll('#copy-variants .v');
  vEls.forEach(el => el.addEventListener('click', () => {
    vEls.forEach(x => x.classList.remove('on'));
    el.classList.add('on');
    $('#f-copy').value = el.getAttribute('data-msg');
    S._variantChosen = el.getAttribute('data-id');
  }));

  if (lead.pendingIndex != null) $('#b-savecopy').addEventListener('click', () => saveCopy(lead));
  $('#b-approve').addEventListener('click', approveBatch);
}

// Estágio pós-contato: aí sim valor, tier, próxima ação.
function renderDeal(lead) {
  const ht = lead.tier === 'high-touch';
  const gate = S.data.pipeline.canSend;
  $('#dispatch').innerHTML =
    dispatchHeader(lead, 'Despacho — negócio') +
    `<div class="dsp-b">
      <div class="dsp-lab">Valor do negócio</div>
      <div class="field">
        <input id="f-value" type="number" placeholder="MRR R$/mês" value="${lead.value ?? ''}">
        <input id="f-plan" type="number" placeholder="Total do plano" value="${lead.planValue ?? ''}">
      </div>
      <div class="dsp-lab" style="margin-top:16px">Ação agendada <b>${ht ? 'high-touch' : ''}</b></div>
      <div class="field"><input id="f-date" type="date" value="${esc((lead.nextActionAt || '').slice(0, 10))}"></div>
      <textarea class="ed" id="f-draft" placeholder="Rascunho da próxima mensagem — aprovável, editável.">${esc(lead.nextActionDraft || '')}</textarea>
    </div>
    <div class="dsp-f">
      <span class="gate"><i class="${gate ? '' : 'blocked'}"></i> ${gate ? 'GATE OK' : 'BLOQUEADO'}</span>
      <button class="bsm" id="b-tier">${ht ? 'Rebaixar' : 'Promover ♛'}</button>
      <button class="bsm gold" id="b-save">Salvar</button>
    </div>`;
  $('#b-save').addEventListener('click', () => saveLead(lead.key, false));
  $('#b-tier').addEventListener('click', () => saveLead(lead.key, true));
}

async function saveCopy(lead) {
  try {
    const message = { whatsapp_version: $('#f-copy').value };
    if (S._variantChosen) message.variantChosen = S._variantChosen; // carimba a escolha p/ o A/B
    await api(`/api/pending/${lead.pendingIndex}`, { method: 'PATCH', body: JSON.stringify({ message }) });
    toast('Copy salva'); await refresh();
  } catch (e) { toast(e.message); }
}

async function approveBatch() {
  if (window.prompt('Digite ENVIAR para disparar o lote aprovado de 1º contato:') !== 'ENVIAR') return;
  try { await startJob('/api/approved/send', { dryRun: false, confirm: 'ENVIAR', usePanelSchedule: true }); }
  catch (e) { toast(e.message); }
}

async function saveLead(key, toggleTier) {
  const lead = selectedLead();
  const body = { key };
  const v = $('#f-value').value, p = $('#f-plan').value;
  if (v !== '') body.value = Number(v);
  if (p !== '') body.planValue = Number(p);
  const date = $('#f-date').value;
  body.nextActionAt = date || null;
  body.nextActionDraft = $('#f-draft').value;
  if (toggleTier) body.tier = lead.tier === 'high-touch' ? 'mass' : 'high-touch';
  try {
    await api('/api/lead', { method: 'POST', body: JSON.stringify(body) });
    toast(toggleTier ? 'Tier atualizado' : 'Lead salvo');
    await refresh();
  } catch (e) { toast(e.message); }
}

// ── Render geral ──────────────────────────────────────────────────────────────
function render(data) {
  const pipe = data.pipeline;
  const replied = (pipe.counts && pipe.counts.replied) || 0;

  $('#b-replied').textContent = replied;
  $('#b-followups').textContent = pipe.dueFollowups;
  $('#b-hightouch').textContent = pipe.highTouchDue;
  $('#b-followups-sub').textContent = pipe.awaitingReply
    ? `${pipe.awaitingReply} aguardando reconciliação` : 'no ponto · rascunhos prontos';

  const val = pipe.value || { mrr: 0, deals: 0 };
  $('#funnel-val').innerHTML = `MRR em jogo · <b>${esc(brl(val.mrr) || 'R$ 0')}</b> · ${val.deals} negócio(s)`;

  const dot = $('#live-dot'), lab = $('#live-label');
  dot.className = pipe.canSend ? '' : 'blocked';
  lab.textContent = pipe.canSend
    ? `WhatsApp · ${pipe.remainingToday}/${pipe.dailyCap} envios`
    : 'envio bloqueado';

  renderBoard();
  renderDispatch();
  renderJob(data.jobs);
}

function renderJob(jobs) {
  if (S.activeJobId) return;
  const j = (jobs || [])[0];
  if (!j) return;
  paintJob(j);
}
function paintJob(j) {
  $('#joblog').style.display = 'block';
  $('#job-status').textContent = j.status || '—';
  $('#job-log').textContent = (j.logs || []).map(l => l.line).join('\n') || 'Aguardando logs…';
  $('#job-log').scrollTop = $('#job-log').scrollHeight;
}

async function refresh() {
  try {
    const data = await api('/api/state');
    S.data = data;
    render(data);
  } catch (e) {
    $('#live-label').textContent = 'offline';
    $('#live-dot').className = 'blocked';
  }
}

// ── Jobs (prospecção / follow-up) ─────────────────────────────────────────────
async function startJob(path, body) {
  const j = await api(path, { method: 'POST', body: JSON.stringify(body) });
  S.activeJobId = j.id; paintJob(j); pollJob(); toast('Job iniciado');
}
function pollJob() {
  clearInterval(S.jobTimer);
  S.jobTimer = setInterval(async () => {
    if (!S.activeJobId) return;
    try {
      const j = await api(`/api/jobs/${S.activeJobId}`);
      paintJob(j);
      if (j.status !== 'running') {
        clearInterval(S.jobTimer); S.activeJobId = null;
        await refresh();
        toast(j.status === 'finished' ? 'Job finalizado' : 'Job falhou');
      }
    } catch (e) { toast(e.message); }
  }, 1400);
}

function bind() {
  $('#btn-prospect').addEventListener('click', async () => {
    const query = window.prompt('Buscar leads (ex: "clínica odontológica rio de janeiro"):');
    if (!query) return;
    try { await startJob('/api/campaigns/start', { query, maxLeads: 10, minScore: 6, channel: 'whatsapp' }); }
    catch (e) { toast(e.message); }
  });
  $('#btn-followup-plan').addEventListener('click', async () => {
    try { await startJob('/api/followup/run', { send: false }); } catch (e) { toast(e.message); }
  });
  $('#btn-followup-send').addEventListener('click', async () => {
    if (window.prompt('Digite ENVIAR para disparar os follow-ups devidos:') !== 'ENVIAR') return;
    try { await startJob('/api/followup/run', { send: true, confirm: 'ENVIAR', usePanelSchedule: true }); }
    catch (e) { toast(e.message); }
  });
}

function tick() {
  $('#clock').textContent = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date()).toUpperCase();
}

function init() {
  bind();
  tick(); setInterval(tick, 30000);
  refresh();
  setInterval(refresh, 5000);
}
init();
