// simulator.js — Simulador interativo de orçamento
// Requer: config.js carregado antes

const BASE_LEADS    = 47;   // leads orgânicos base do período
const BASE_RECEITA  = 14200;
const INVESTIMENTO  = 3497; // mensalidade do plano (head-implantado)

function fmt(n) {
  if (n >= 1000) return 'R$' + (n / 1000).toFixed(1) + 'k';
  return 'R$' + n.toLocaleString('pt-BR');
}

function updateSim() {
  const ads    = parseInt(document.getElementById('ads-range').value)    || 0;
  const conv   = parseInt(document.getElementById('conv-range').value)   || 17;
  const ticket = parseInt(document.getElementById('ticket-range').value) || CONFIG.TICKET_MEDIO;

  const convRate = conv / 100;

  // Atualizar displays
  setText('ads-display',    'R$ ' + ads.toLocaleString('pt-BR'));
  setText('conv-display',   conv + '%');
  setText('ticket-display', 'R$ ' + ticket.toLocaleString('pt-BR'));

  // Calcular
  const leadsAds     = ads > 0 ? Math.round(ads / CONFIG.CPL_NICHO) : 0;
  const totalLeads   = BASE_LEADS + leadsAds;
  const totalConv    = Math.round(totalLeads * convRate);
  const totalReceita = totalConv * ticket;
  const totalInvest  = ads + INVESTIMENTO;
  const roi          = totalInvest > 0 ? (totalReceita / totalInvest).toFixed(1) : '—';
  const cpl          = leadsAds > 0 ? Math.round(ads / leadsAds) : null;

  // Renderizar outputs
  setText('sim-leads',   totalLeads);
  setText('sim-conv',    totalConv);
  setText('sim-receita', fmt(totalReceita));
  setText('sim-roi',     roi + '×');
  setText('sim-cpl',     cpl ? 'R$' + cpl : '—');

  const deltaR = totalReceita - BASE_RECEITA;
  const deltaEl = document.getElementById('sim-receita-delta');
  if (deltaEl) {
    if (deltaR > 0) {
      deltaEl.textContent = '+' + fmt(deltaR) + ' vs atual';
      deltaEl.className = 'sim-delta ok';
    } else {
      deltaEl.textContent = 'Base atual';
      deltaEl.className = 'sim-delta';
    }
  }

  const ctaEl = document.getElementById('sim-cta-text');
  if (ctaEl) {
    ctaEl.textContent = fmt(totalReceita) + '/mês em receita estimada.';
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function initSimulator() {
  const adsR   = document.getElementById('ads-range');
  const convR  = document.getElementById('conv-range');
  const tickR  = document.getElementById('ticket-range');
  if (!adsR) return;

  adsR.addEventListener('input',  updateSim);
  convR.addEventListener('input', updateSim);
  tickR.addEventListener('input', updateSim);
  updateSim();
}

document.addEventListener('DOMContentLoaded', initSimulator);
