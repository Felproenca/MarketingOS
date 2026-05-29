// dashboard.js — Lógica de renderização e atualização
// Requer: config.js + supabase-client.js carregados antes

let currentPeriod = CONFIG.DEFAULT_PERIOD;
let cachedData    = {};

// ─── Init ────────────────────────────────────────────────────────────────────

async function init() {
  validateToken();
  await loadPeriod(currentPeriod);
  startAutoRefresh();
}

function validateToken() {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');
  if (token && !CONFIG.VALID_TOKENS.includes(token)) {
    document.body.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Syne,sans-serif;color:#0c2137;font-size:1.1rem;">Acesso não autorizado.</div>';
  }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

async function loadPeriod(period) {
  try {
    const [metrics, ig, content, goals, actions, channels] = await Promise.all([
      DB.getMetricsPeriod(CONFIG.CLIENT_SLUG, period),
      DB.getInstagramStats(CONFIG.CLIENT_SLUG, period),
      DB.getContentTop(CONFIG.CLIENT_SLUG, period),
      DB.getGoals(CONFIG.CLIENT_SLUG, period),
      DB.getActions(CONFIG.CLIENT_SLUG, period),
      DB.getLeadsByChannel(CONFIG.CLIENT_SLUG, period),
    ]);
    cachedData = { metrics, ig, content, goals, actions, channels };
    renderAll(cachedData);
    setLastUpdated();
  } catch(e) {
    // Supabase não configurado — dados de fallback já estão no HTML
    console.warn('Supabase não alcançado — exibindo dados de fallback.');
    setLastUpdated('(demo)');
  }
}

function renderAll({ metrics, ig, content, goals, actions, channels }) {
  if (metrics) {
    renderKPIs(metrics, goals);
    renderPVAM(metrics, goals);
    renderFunnel(metrics);
  }
  if (channels && channels.length) renderChannels(channels);
  if (ig)                          renderInstagram(ig);
  if (content && content.length)   renderContent(content);
  if (actions && actions.length)   renderActions(actions);
  renderUpgrade();
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

function renderKPIs(m, goals) {
  animateCounter('kpi-leads',    m.leads      || 0);
  animateCounter('kpi-cotacoes', m.cotacoes   || 0);
  animateCounter('kpi-conv',     m.conversoes || 0);
  animateCounter('kpi-receita',  m.receita    || 0, 'R$', 'k');

  if (goals) {
    setDelta('delta-leads',    m.leads,      goals.leads_proj);
    setDelta('delta-cotacoes', m.cotacoes,   goals.cotacoes_proj);
    setDelta('delta-conv',     m.conversoes, goals.conv_proj);
    setDelta('delta-receita',  m.receita,    goals.receita_proj);
  }
}

// ─── PVAM ─────────────────────────────────────────────────────────────────────

function renderPVAM(m, goals) {
  if (!goals) return;
  const items = [
    { id:'pvam-leads',   alc:m.leads,      proj:goals.leads_proj,    meta:goals.leads_meta,    fmt:'n' },
    { id:'pvam-cot',     alc:m.cotacoes,   proj:goals.cotacoes_proj, meta:goals.cotacoes_meta, fmt:'n' },
    { id:'pvam-conv',    alc:m.conversoes, proj:goals.conv_proj,     meta:goals.conv_meta,     fmt:'n' },
    { id:'pvam-receita', alc:m.receita,    proj:goals.receita_proj,  meta:goals.receita_meta,  fmt:'r' },
  ];
  items.forEach(({ id, alc, proj, meta, fmt }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const fv = v => fmt === 'r' ? fmtReceita(v) : (v || '—');
    const alcEl = el.querySelector('.pvam-alc');
    const prjEl = el.querySelector('.pvam-proj');
    const metEl = el.querySelector('.pvam-meta');
    const bdgEl = el.querySelector('.pvam-badge');
    if (alcEl) alcEl.textContent = fv(alc);
    if (prjEl) prjEl.textContent = fv(proj);
    if (metEl) metEl.textContent = fv(meta);
    if (bdgEl && proj) {
      if (alc >= proj) {
        bdgEl.textContent = '↑ +' + pct(alc, proj) + '% da projeção';
        bdgEl.className   = 'pvam-badge ok';
      } else {
        bdgEl.textContent = '↓ ' + pct(proj, alc) + '% abaixo';
        bdgEl.className   = 'pvam-badge no';
      }
    }
  });
}

// ─── Funil ────────────────────────────────────────────────────────────────────

function renderFunnel(m) {
  const steps = [
    { id:'fn-alcance',  val: m.alcance    || 0 },
    { id:'fn-leads',    val: m.leads      || 0 },
    { id:'fn-cotacoes', val: m.cotacoes   || 0 },
    { id:'fn-conv',     val: m.conversoes || 0 },
  ];
  steps.forEach(({ id, val }) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toLocaleString('pt-BR');
  });
  // Calcular taxas de conversão entre etapas
  if (m.alcance && m.leads)      setEl('fn-rate-1', pct(m.leads, m.alcance) + '%');
  if (m.leads && m.cotacoes)     setEl('fn-rate-2', pct(m.cotacoes, m.leads) + '%');
  if (m.cotacoes && m.conversoes)setEl('fn-rate-3', pct(m.conversoes, m.cotacoes) + '%');
}

// ─── Channels ─────────────────────────────────────────────────────────────────

function renderChannels(channels) {
  const total = channels.reduce((s, c) => s + (c.quantidade || 0), 0);
  const grid  = document.getElementById('channels-grid');
  if (!grid || !total) return;

  const icons = { instagram:'📷', whatsapp:'💬', site:'🌐', ads:'📣', indicacao:'🤝' };
  grid.innerHTML = channels.map(c => {
    const pct = total ? Math.round((c.quantidade / total) * 100) : 0;
    return `<div class="ch-card">
      <span class="ch-icon">${icons[c.canal] || '📊'}</span>
      <span class="ch-name">${c.canal}</span>
      <span class="ch-val">${c.quantidade}</span>
      <div class="ch-bar-wrap"><div class="ch-bar" style="width:${pct}%"></div></div>
      <span class="ch-pct">${pct}%</span>
    </div>`;
  }).join('');
}

// ─── Instagram ────────────────────────────────────────────────────────────────

function renderInstagram(ig) {
  setEl('ig-seguidores', (ig.seguidores || 0).toLocaleString('pt-BR'));
  setEl('ig-gain',       '+' + (ig.seguidores_gain || 0) + ' no mês');
  setEl('ig-alcance',    (ig.alcance_mensal || 0).toLocaleString('pt-BR'));
  setEl('ig-eng',        (ig.engajamento || 0).toFixed(1) + '%');
  setEl('ig-posts',      ig.posts_count || 0);
}

// ─── Top Content ──────────────────────────────────────────────────────────────

function renderContent(content) {
  const list = document.getElementById('content-list');
  if (!list) return;
  list.innerHTML = content.map((c, i) => `
    <div class="ct-item">
      <span class="ct-pos">${i + 1}</span>
      <div class="ct-info">
        <span class="ct-tipo">${c.tipo || 'post'}</span>
        <span class="ct-titulo">${c.titulo || '—'}</span>
      </div>
      <span class="ct-alcance">${(c.alcance || 0).toLocaleString('pt-BR')} alcance</span>
    </div>
  `).join('');
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function renderActions(actions) {
  const list = document.getElementById('actions-list');
  if (!list) return;
  list.innerHTML = actions.map(a => `
    <div class="ac-item ac-${a.prioridade || 'media'}">
      <span class="ac-badge">${a.prioridade || 'média'}</span>
      <div class="ac-text">
        <strong>${a.titulo || ''}</strong>
        ${a.descricao ? `<span>${a.descricao}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// ─── Upgrade ──────────────────────────────────────────────────────────────────

function renderUpgrade() {
  const el = document.getElementById('upgrade-section');
  if (!el) return;

  if (CONFIG.PLAN === 'performance') {
    el.innerHTML = `<div class="upg-active">
      <span class="upg-tag">Plano Performance ativo</span>
      <p>Você tem acesso a inteligência cross-client, benchmarks em tempo real e experimentos validados.</p>
    </div>`;
    return;
  }

  const features = CONFIG.PLAN === 'essencial'
    ? [
        { t:'Gestão de tráfego pago',      d:'Meta Ads e Google Ads com estratégia e otimização contínua.', on:false },
        { t:'Automação de WhatsApp',        d:'Follow-up automático para leads. Nenhum contato perdido.',   on:false },
        { t:'Reunião estratégica quinzenal',d:'Revisão de resultados e próximos movimentos a cada 15 dias.',on:false },
        { t:'Inteligência cross-client',    d:'Padrões validados de outros clientes do setor.',             on:false, lock:true },
      ]
    : [
        { t:'Tráfego pago gerenciado',      d:'Meta Ads e Google Ads com estratégia e otimização contínua.', on:true },
        { t:'Automação de WhatsApp',         d:'Follow-up automático para leads. Nenhum contato perdido.',   on:true },
        { t:'Reunião estratégica quinzenal', d:'Revisão de resultados e próximos movimentos a cada 15 dias.',on:true },
        { t:'Inteligência cross-client',     d:'Padrões validados de outras corretoras do ecossistema.',     on:false, lock:true },
        { t:'Experimentos validados',        d:'Testes A/B já rodados. Implementa o que já provou funcionar.',on:false, lock:true },
      ];

  const nextPlan = CONFIG.PLAN === 'essencial' ? 'Head Implantado' : 'Performance';

  el.innerHTML = `
    <div class="upg-features">
      ${features.map(f => `
        <div class="upg-item ${f.on ? 'on' : ''} ${f.lock ? 'lock' : ''}">
          <span class="upg-check">${f.lock ? '🔒' : f.on ? '✓' : '○'}</span>
          <div class="upg-desc">
            <strong>${f.t}</strong>
            <span>${f.d}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <a class="upg-cta" href="https://wa.me/${CONFIG.WHATSAPP_COMERCIAL}?text=Quero+evoluir+para+o+plano+${encodeURIComponent(nextPlan)}" target="_blank">
      Evoluir para ${nextPlan}
    </a>
  `;
}

// ─── Period Toggle ────────────────────────────────────────────────────────────

window.setPeriod = function(period) {
  currentPeriod = period;
  document.querySelectorAll('.pt').forEach(el => el.classList.remove('on'));
  const btn = document.querySelector(`[data-period="${period}"]`);
  if (btn) btn.classList.add('on');
  loadPeriod(period);
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function animateCounter(id, target, prefix, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const isK = suffix === 'k';
  const val  = isK ? target / 1000 : target;
  const dur  = 900;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const v = isK ? (e * val).toFixed(1) : Math.floor(e * target);
    el.textContent = (prefix || '') + v + (suffix || '');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setDelta(id, alc, proj) {
  const el = document.getElementById(id);
  if (!el || !proj) return;
  const diff = pct(alc, proj);
  if (alc >= proj) {
    el.textContent = '↑ +' + diff + '%';
    el.className = 'kpi-delta ok';
  } else {
    el.textContent = '↓ ' + diff + '%';
    el.className = 'kpi-delta no';
  }
}

function pct(a, b) {
  if (!b) return 0;
  return Math.abs(Math.round(((a - b) / b) * 100));
}

function fmtReceita(v) {
  if (!v) return '—';
  return v >= 1000 ? 'R$' + (v / 1000).toFixed(1) + 'k' : 'R$' + v;
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setLastUpdated(suffix) {
  const el = document.getElementById('last-updated');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  el.textContent = 'Atualizado às ' + h + ':' + m + (suffix ? ' ' + suffix : '');
}

function startAutoRefresh() {
  setInterval(() => loadPeriod(currentPeriod), 30 * 60 * 1000);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
