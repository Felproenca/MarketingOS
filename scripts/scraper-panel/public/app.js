const state = {
  data: null,
  activeJobId: null,
  leadFilter: 'active',
  presenceFilter: null,
  leadSearch: '',
  typeFilter: 'all',
  statusFilter: 'all',
  settings: null,
  refreshTimer: null,
  jobTimer: null,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shortDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function stepLabel(step) {
  const labels = {
    discovered: 'descoberto',
    qualified: 'qualificado',
    pending_approval: 'aprovação',
    sent: 'enviado',
    followup_1: 'follow-up 1',
    followup_2: 'follow-up 2',
    replied: 'respondeu',
    demo_sent: 'demo enviada',
    call_offered: 'call ofertada',
    closed: 'fechado',
    dead: 'morto',
  };
  return labels[step] || step || '-';
}

function leadTypeLabel(lead) {
  if (lead.step === 'pending_approval') return 'Aprovação';
  if (lead.website || lead.domain) return 'Presença boa';
  if (lead.whatsapp || lead.phone) return 'Telefone';
  return 'Sem presença';
}

function leadContact(lead) {
  return lead.whatsapp || lead.phone || lead.email || '-';
}

function waLink(lead) {
  const digits = String(lead.whatsapp || lead.phone || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
function siteLink(lead) {
  if (lead.website) return /^https?:\/\//.test(lead.website) ? lead.website : `https://${lead.website}`;
  if (lead.domain) return `https://${lead.domain}`;
  return null;
}
function googleLink(lead) {
  const q = [lead.name, lead.domain || lead.website].filter(Boolean).join(' ');
  return q ? `https://www.google.com/search?q=${encodeURIComponent(q)}` : null;
}
function instaLink(lead) {
  if (!lead.instagram) return null;
  const handle = String(lead.instagram).replace(/^@/, '');
  return `https://instagram.com/${handle}`;
}
function actionLink(href, title, label) {
  return href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" title="${title}">${label}</a>`
    : `<span class="action-off" title="${title} indisponível">${label}</span>`;
}

function normalizeLeadSearch(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function userGateReason(reason) {
  if (!reason) return 'gate ativo';
  return String(reason).replace(/\s*Use --fora-do-horario.*$/i, '');
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Erro ${response.status}`);
  }
  return payload;
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('show'), 3600);
}

function setView(name) {
  const titles = {
    operacao: 'Leads',
    aprovacao: 'Aprovação',
    pipeline: 'Pipeline',
    followup: 'Follow-up',
    envios: 'Envios',
  };

  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.nav === name));
  $$('.view').forEach(view => view.classList.toggle('active', view.id === `view-${name}`));
  setText('#page-title', titles[name] || 'Leads');
  history.replaceState(null, '', `#${name}`);
}

async function refreshState() {
  try {
    const data = await api('/api/state');
    state.data = data;
    renderState(data);
  } catch (error) {
    $('#status-label').textContent = 'Offline';
    $('#status-detail').textContent = error.message;
    $('#status-dot').className = 'dot blocked';
  }
}

function renderState(data) {
  const pendingTotal = data.pending.total;
  const pipeline = data.pipeline;
  state.settings = data.settings || state.settings;

  setText('#nav-running', pipeline.total);
  setText('#nav-pending', pendingTotal);
  setText('#nav-pipeline', pipeline.total);
  setText('#nav-followup', pipeline.dueFollowups);
  setText('#nav-envios', state.settings?.schedule?.enabled ? 'custom' : 'auto');

  setText('#kpi-total', pipeline.total);
  setText('#kpi-pending', pendingTotal);
  setText('#kpi-sent-today', pipeline.sentToday);
  setText('#kpi-cap', `${pipeline.remainingToday}/${pipeline.dailyCap}`);
  setText('#pending-count', pendingTotal);

  setText('#due-followups', pipeline.dueFollowups);
  setText('#awaiting-reply', pipeline.awaitingReply);

  const dot = $('#status-dot');
  dot.className = pipeline.canSend ? 'dot ok' : 'dot blocked';
  $('#status-label').textContent = pipeline.canSend ? 'Pronto para envio' : 'Envio bloqueado';
  $('#status-detail').textContent = pipeline.canSend ? 'janela e teto ok' : userGateReason(pipeline.sendBlockReason);
  $('#send-gate').textContent = pipeline.canSend
    ? `${pipeline.sendGateSource === 'custom' ? userGateReason(pipeline.sendBlockReason) : 'Janela ativa.'} Restam ${pipeline.remainingToday} de ${pipeline.dailyCap} envios hoje.`
    : userGateReason(pipeline.sendBlockReason);

  renderPending(data.pending.items);
  renderPipeline(pipeline);
  renderLeadBoard(data);
  renderSettings(state.settings);
  renderJobFromState(data.jobs);
}

function renderSettings(settings) {
  const form = $('#settings-form');
  if (!settings || !form || form.contains(document.activeElement)) return;

  $('#schedule-enabled').checked = settings.schedule?.enabled === true;
  $('#schedule-start').value = settings.schedule?.start || '09:00';
  $('#schedule-end').value = settings.schedule?.end || '18:00';

  const days = settings.schedule?.days || [];
  $$('.day-check').forEach(input => {
    input.checked = days.includes(Number(input.value));
  });

  $('#output-whatsapp').checked = settings.outputs?.whatsapp !== false;
  $('#output-email').checked = settings.outputs?.email === true;
  $('#output-diagnosis').checked = settings.outputs?.diagnosis !== false;
  $('#output-demo').checked = settings.outputs?.demo === true;
  $('#output-landing').checked = settings.outputs?.landing === true;
  $('#output-followup').checked = settings.outputs?.followup !== false;

  $('#copy-angle').value = settings.copy?.angle || '';
  $('#copy-tone').value = settings.copy?.tone || '';
  $('#copy-cta').value = settings.copy?.cta || '';
  $('#copy-whatsapp').value = settings.copy?.whatsapp || '';
  $('#copy-email-subject').value = settings.copy?.emailSubject || '';
  $('#copy-email-body').value = settings.copy?.emailBody || '';
  $('#copy-notes').value = settings.copy?.notes || '';
}

function collectSettings() {
  return {
    schedule: {
      enabled: $('#schedule-enabled').checked,
      start: $('#schedule-start').value || '09:00',
      end: $('#schedule-end').value || '18:00',
      days: $$('.day-check')
        .filter(input => input.checked)
        .map(input => Number(input.value)),
    },
    outputs: {
      whatsapp: $('#output-whatsapp').checked,
      email: $('#output-email').checked,
      diagnosis: $('#output-diagnosis').checked,
      demo: $('#output-demo').checked,
      landing: $('#output-landing').checked,
      followup: $('#output-followup').checked,
    },
    copy: {
      angle: $('#copy-angle').value,
      tone: $('#copy-tone').value,
      cta: $('#copy-cta').value,
      whatsapp: $('#copy-whatsapp').value,
      emailSubject: $('#copy-email-subject').value,
      emailBody: $('#copy-email-body').value,
      notes: $('#copy-notes').value,
    },
  };
}

function getAllLeads(data) {
  const pending = (data.pending.items || []).map(item => ({
    id: `pending:${item.index}`,
    source: 'pending',
    step: 'pending_approval',
    name: item.name,
    domain: item.domain,
    website: item.website,
    whatsapp: item.whatsapp,
    phone: item.phone,
    email: item.email,
    instagram: item.instagram,
    score: item.score,
    label: item.label,
    main_problem: item.main_problem,
    updatedAt: item.updatedAt || item.createdAt,
  }));

  const pipeline = (data.pipeline.contacts || []).map(contact => ({
    id: contact.key,
    source: 'pipeline',
    ...contact,
  }));

  return [...pending, ...pipeline];
}

function matchesLeadFilter(lead, filter) {
  if (filter === 'active') return !['dead', 'closed'].includes(lead.step);
  if (filter === 'qualified') return Number(lead.score || 0) >= 6 || ['qualified', 'pending_approval'].includes(lead.step);
  if (filter === 'contact') return ['sent', 'followup_1', 'followup_2', 'replied', 'demo_sent', 'call_offered'].includes(lead.step);
  if (filter === 'clean') return Boolean(lead.whatsapp || lead.phone || lead.email);
  if (filter === 'archived') return ['dead', 'closed'].includes(lead.step);
  return true;
}

function matchesTypeFilter(lead) {
  if (state.typeFilter === 'all') return true;
  if (state.typeFilter === 'site') return Boolean(lead.website || lead.domain);
  if (state.typeFilter === 'whatsapp') return Boolean(lead.whatsapp || lead.phone);
  if (state.typeFilter === 'pending') return lead.step === 'pending_approval';
  return true;
}

function matchesStatusFilter(lead) {
  if (state.statusFilter === 'all') return true;
  if (state.statusFilter === 'followup') return ['followup_1', 'followup_2'].includes(lead.step);
  return lead.step === state.statusFilter;
}

function matchesPresenceFilter(lead) {
  if (!state.presenceFilter) return true;
  if (state.presenceFilter === 'phone') return Boolean(lead.whatsapp || lead.phone);
  if (state.presenceFilter === 'site') return Boolean(lead.website || lead.domain);
  if (state.presenceFilter === 'instagram') return Boolean(lead.instagram);
  if (state.presenceFilter === 'empty') return !lead.whatsapp && !lead.phone && !lead.email && !lead.website && !lead.domain && !lead.instagram;
  return true;
}

function matchesSearch(lead) {
  const query = normalizeLeadSearch(state.leadSearch);
  if (!query) return true;
  const haystack = normalizeLeadSearch([
    lead.name,
    lead.domain,
    lead.website,
    lead.whatsapp,
    lead.phone,
    lead.email,
    lead.main_problem,
    lead.label,
  ].filter(Boolean).join(' '));
  return haystack.includes(query);
}

function scoreHtml(score) {
  if (score === null || score === undefined || score === '') return '<span class="score-empty">-</span>';
  const value = Number(score);
  if (!Number.isFinite(value)) return '<span class="score-empty">-</span>';
  const width = Math.max(8, Math.min(100, value * 10));
  return `<span class="score-cell"><span class="score-bar"><i style="width:${width}%"></i></span><b>${escapeHtml(value)}</b></span>`;
}

function renderLeadBoard(data) {
  const all = getAllLeads(data);
  const counts = {
    active: all.filter(lead => matchesLeadFilter(lead, 'active')).length,
    qualified: all.filter(lead => matchesLeadFilter(lead, 'qualified')).length,
    contact: all.filter(lead => matchesLeadFilter(lead, 'contact')).length,
    clean: all.filter(lead => matchesLeadFilter(lead, 'clean')).length,
    archived: all.filter(lead => matchesLeadFilter(lead, 'archived')).length,
  };

  $('#tab-active').textContent = counts.active;
  $('#tab-qualified').textContent = counts.qualified;
  $('#tab-contact').textContent = counts.contact;
  $('#tab-clean').textContent = counts.clean;
  $('#tab-archived').textContent = counts.archived;

  $('#presence-phone').textContent = all.filter(lead => lead.whatsapp || lead.phone).length;
  $('#presence-site').textContent = all.filter(lead => lead.website || lead.domain).length;
  $('#presence-instagram').textContent = all.filter(lead => lead.instagram).length;
  $('#presence-empty').textContent = all.filter(lead => !lead.whatsapp && !lead.phone && !lead.email && !lead.website && !lead.domain && !lead.instagram).length;

  const leads = all
    .filter(lead => matchesLeadFilter(lead, state.leadFilter))
    .filter(matchesTypeFilter)
    .filter(matchesStatusFilter)
    .filter(matchesPresenceFilter)
    .filter(matchesSearch);

  const body = $('#lead-body');
  if (!leads.length) {
    body.innerHTML = '<tr><td colspan="7" class="empty-table">Nenhum lead encontrado com os filtros atuais.</td></tr>';
    return;
  }

  body.innerHTML = leads.map(lead => `
    <tr>
      <td class="select-col"><input type="checkbox" aria-label="Selecionar ${escapeHtml(lead.name || 'lead')}"></td>
      <td>
        <strong>${escapeHtml(lead.name || lead.domain || 'Lead sem nome')}</strong>
        <small>${escapeHtml([lead.domain || lead.website, lead.segment].filter(Boolean).join(' · '))}</small>
      </td>
      <td><span class="type-pill">${escapeHtml(leadTypeLabel(lead))}</span></td>
      <td><span class="contact-line">${escapeHtml(leadContact(lead))}</span></td>
      <td><span class="step-pill">${escapeHtml(stepLabel(lead.step))}</span></td>
      <td>${scoreHtml(lead.score)}</td>
      <td>
        <div class="row-actions" aria-label="Ações">
          ${actionLink(waLink(lead), 'WhatsApp', '◎')}
          ${actionLink(siteLink(lead), 'Site', '◌')}
          ${actionLink(googleLink(lead), 'Google', 'G')}
          ${actionLink(instaLink(lead), 'Instagram', '◈')}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderJobFromState(jobs) {
  if (state.activeJobId) return;
  const latest = jobs[0];
  if (!latest) return;
  renderJob(latest);
}

function renderJob(job) {
  const status = $('#job-status');
  status.textContent = job.status || 'sem job';
  status.className = `status-pill ${job.status || ''}`;

  const lines = (job.logs || []).map(item => item.line).join('\n');
  $('#job-log').textContent = lines || 'Job iniciado. Aguardando logs.';
  $('#job-log').scrollTop = $('#job-log').scrollHeight;
}

function renderPending(items) {
  const list = $('#pending-list');
  if (!items.length) {
    list.innerHTML = '<div class="empty-state">Nenhum lote aguardando revisão.</div>';
    return;
  }

  list.innerHTML = items.map(item => {
    const message = item.message?.whatsapp_version || item.message?.body || '';
    const contact = item.whatsapp || item.email || item.phone || '-';
    return `
      <article class="pending-card" data-index="${item.index}">
        <div class="pending-meta">
          <div class="pending-title">
            <strong>${escapeHtml(item.name || item.domain || 'Lead sem nome')}</strong>
            <span>${escapeHtml(item.website || item.domain || '')}</span>
          </div>
          <div class="pending-tags">
            <span class="score-pill">${escapeHtml(item.score ?? '-')} / 10</span>
            <span class="step-pill">${escapeHtml(item.channel || 'whatsapp')}</span>
            <span class="step-pill">${escapeHtml(contact)}</span>
          </div>
          <p class="pending-problem">${escapeHtml(item.main_problem || 'Sem gargalo principal registrado.')}</p>
        </div>
        <div>
          <textarea class="message-edit" aria-label="Mensagem para ${escapeHtml(item.name || 'lead')}">${escapeHtml(message)}</textarea>
          <div class="pending-actions">
            <button class="secondary-button save-message" type="button">Salvar mensagem</button>
            <button class="danger-button remove-pending" type="button">Remover do lote</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderPipeline(pipeline) {
  const stats = $('#pipeline-stats');
  const counts = pipeline.counts || {};
  stats.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([step, count]) => `<span class="step-pill">${escapeHtml(stepLabel(step))}: ${count}</span>`)
    .join('');

  const rows = pipeline.contacts || [];
  const body = $('#pipeline-body');
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="5">Pipeline vazio.</td></tr>';
    return;
  }

  body.innerHTML = rows.map(contact => `
    <tr>
      <td>
        ${escapeHtml(contact.name || contact.domain || contact.key)}
        <small>${escapeHtml(contact.website || contact.domain || contact.whatsapp || '')}</small>
      </td>
      <td><span class="step-pill">${escapeHtml(stepLabel(contact.step))}</span></td>
      <td>${escapeHtml(contact.score ?? '-')}</td>
      <td>${escapeHtml(contact.main_problem || '-')}</td>
      <td>${escapeHtml(shortDate(contact.updatedAt || contact.createdAt))}</td>
    </tr>
  `).join('');
}

async function startJob(path, body) {
  const job = await api(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  state.activeJobId = job.id;
  renderJob(job);
  startJobPolling();
  toast('Job iniciado');
}

function startJobPolling() {
  clearInterval(state.jobTimer);
  state.jobTimer = setInterval(async () => {
    if (!state.activeJobId) return;

    try {
      const job = await api(`/api/jobs/${state.activeJobId}`);
      renderJob(job);

      if (job.status !== 'running') {
        clearInterval(state.jobTimer);
        state.activeJobId = null;
        await refreshState();
        toast(job.status === 'finished' ? 'Job finalizado' : 'Job falhou');
      }
    } catch (error) {
      toast(error.message);
    }
  }, 1400);
}

function bindEvents() {
  $$('.nav-item, .brand').forEach(node => {
    node.addEventListener('click', event => {
      event.preventDefault();
      setView(node.dataset.nav);
    });
  });

  $('#refresh-button').addEventListener('click', refreshState);
  $('#focus-search-button').addEventListener('click', () => $('#query').focus());
  $('#csv-button').addEventListener('click', () => toast('Exportação CSV entra na próxima rodada.'));
  $('#approval-refresh').addEventListener('click', refreshState);
  $('#save-settings-button').addEventListener('click', async () => {
    try {
      state.settings = await api('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(collectSettings()),
      });
      renderSettings(state.settings);
      await refreshState();
      toast('Configuração de envios salva');
    } catch (error) {
      toast(error.message);
    }
  });

  $$('.lead-tab').forEach(button => {
    button.addEventListener('click', () => {
      state.leadFilter = button.dataset.leadFilter || 'active';
      $$('.lead-tab').forEach(tab => tab.classList.toggle('active', tab === button));
      if (state.data) renderLeadBoard(state.data);
    });
  });

  $$('.presence-row button').forEach(button => {
    button.addEventListener('click', () => {
      const next = button.dataset.presence;
      state.presenceFilter = state.presenceFilter === next ? null : next;
      $$('.presence-row button').forEach(item => item.classList.toggle('active', state.presenceFilter === item.dataset.presence));
      if (state.data) renderLeadBoard(state.data);
    });
  });

  $('#lead-search').addEventListener('input', event => {
    state.leadSearch = event.target.value;
    if (state.data) renderLeadBoard(state.data);
  });

  $('#lead-type-filter').addEventListener('change', event => {
    state.typeFilter = event.target.value;
    if (state.data) renderLeadBoard(state.data);
  });

  $('#lead-status-filter').addEventListener('change', event => {
    state.statusFilter = event.target.value;
    if (state.data) renderLeadBoard(state.data);
  });

  $('#campaign-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await startJob('/api/campaigns/start', {
        query: form.get('query'),
        maxLeads: Number(form.get('maxLeads')),
        minScore: Number(form.get('minScore')),
        channel: form.get('channel'),
      });
    } catch (error) {
      toast(error.message);
    }
  });

  $('#dry-run-button').addEventListener('click', async () => {
    try {
      await startJob('/api/approved/send', { dryRun: true });
    } catch (error) {
      toast(error.message);
    }
  });

  $('#send-button').addEventListener('click', async () => {
    const confirmation = window.prompt('Digite ENVIAR para disparar o lote aprovado.');
    if (confirmation !== 'ENVIAR') return;

    try {
      await startJob('/api/approved/send', { dryRun: false, confirm: 'ENVIAR', usePanelSchedule: true });
    } catch (error) {
      toast(error.message);
    }
  });

  $('#followup-plan-button').addEventListener('click', async () => {
    try {
      await startJob('/api/followup/run', { send: false });
    } catch (error) {
      toast(error.message);
    }
  });

  $('#followup-send-button').addEventListener('click', async () => {
    const confirmation = window.prompt('Digite ENVIAR para disparar follow-ups devidos.');
    if (confirmation !== 'ENVIAR') return;

    try {
      await startJob('/api/followup/run', { send: true, confirm: 'ENVIAR', usePanelSchedule: true });
    } catch (error) {
      toast(error.message);
    }
  });

  $('#pending-list').addEventListener('click', async event => {
    const card = event.target.closest('.pending-card');
    if (!card) return;
    const index = Number(card.dataset.index);

    if (event.target.closest('.save-message')) {
      const message = $('.message-edit', card).value;
      try {
        await api(`/api/pending/${index}`, {
          method: 'PATCH',
          body: JSON.stringify({ message: { whatsapp_version: message } }),
        });
        toast('Mensagem salva');
        await refreshState();
      } catch (error) {
        toast(error.message);
      }
    }

    if (event.target.closest('.remove-pending')) {
      if (!window.confirm('Remover este lead do lote pendente?')) return;
      try {
        await api(`/api/pending/${index}`, { method: 'DELETE' });
        toast('Lead removido do lote');
        await refreshState();
      } catch (error) {
        toast(error.message);
      }
    }
  });
}

function init() {
  bindEvents();
  const hash = location.hash.replace('#', '');
  if (hash) setView(hash);
  refreshState();
  state.refreshTimer = setInterval(refreshState, 5000);
}

init();
