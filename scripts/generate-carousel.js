#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getCreativeBrief } = require('./context/creative-brief-builder');
const {
  FUNNEL_METADATA_FIELDS,
  formatFunnelMetadataMarkdown,
  normalizeFunnelMetadata,
  validateFunnelMetadata,
} = require('./funnel/metadata');

const ROOT = path.resolve(__dirname, '..');
const CLIENTS_DIR = path.join(ROOT, 'clients');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function isHexColor(value) {
  return typeof value === 'string' && /^#([0-9A-Fa-f]{6})$/.test(value.trim());
}

function pickColor(value, fallback) {
  return isHexColor(value) ? value.trim() : fallback;
}

function pickFont(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      result[key] = 'true';
      continue;
    }
    result[key] = value;
    i += 1;
  }
  return result;
}

function formatDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function nowTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

// Autoria criativa é da skill (skill-carousel.md), nunca do motor.
// O motor exige slides-input.json completo, valida e renderiza — sem copy própria.
const REQUIRED_SLIDE_FIELDS = ['role', 'title', 'body', 'principle_applied'];

function loadSlidesInput(inputArg) {
  if (!inputArg || inputArg === 'true') {
    fail([
      'Faltou --input <slides-input.json>.',
      'O motor nao escreve copy estrategica: a autoria dos slides e da skill (/criar carrossel).',
      'Formato do arquivo: templates/slides-input.template.json',
      'Uso: node scripts/generate-carousel.js --input clients/[slug]/outputs/carousels/inputs/[peca].json',
    ].join('\n'));
  }
  const resolved = path.resolve(ROOT, inputArg);
  if (!fs.existsSync(resolved)) {
    fail(`slides-input nao encontrado: ${inputArg}\nA copy precisa existir antes do render — gere o arquivo com a skill /criar carrossel.`);
  }
  try {
    return { input: JSON.parse(fs.readFileSync(resolved, 'utf8')), resolvedPath: resolved };
  } catch (error) {
    fail(`slides-input invalido (JSON malformado): ${inputArg}\n${error.message}`);
  }
}

function enforceSlidesInputGate(input) {
  const violations = [];
  if (!String(input.client_slug || '').trim()) violations.push('arquivo: client_slug ausente');
  if (!String(input.theme || '').trim()) violations.push('arquivo: theme ausente');

  const funnelMetadata = input.funnel_metadata && typeof input.funnel_metadata === 'object' && !Array.isArray(input.funnel_metadata)
    ? input.funnel_metadata
    : null;
  if (!funnelMetadata) {
    violations.push('arquivo: funnel_metadata ausente');
  } else {
    const validation = validateFunnelMetadata(funnelMetadata);
    violations.push(...validation.missing.map((field) => `funnel_metadata: ${field} ausente`));
  }

  if (!Array.isArray(input.slides) || !input.slides.length) {
    violations.push('arquivo: slides vazio');
  } else {
    input.slides.forEach((slide, index) => {
      const number = slide.number || index + 1;
      for (const field of REQUIRED_SLIDE_FIELDS) {
        if (!String(slide[field] || '').trim()) {
          violations.push(`slide ${number}: ${field} ausente`);
        }
      }
    });
  }

  if (violations.length) {
    fail([
      'GATE REPROVADO — slides-input incompleto. O motor nao preenche copy nem principio por conta propria.',
      ...violations.map((item) => `  - ${item}`),
      'Complete o arquivo (autoria na skill) e rode novamente.',
    ].join('\n'));
  }
}

function buildCarouselExecutionBrief(meta, officialBrief, slidesInput) {
  const antiDna = nonEmptyList(officialBrief.anti_dna);
  const visualRules = officialBrief.visual_rules || [];
  const tension = officialBrief.tension || '';
  const aggressiveness = copyAggressiveness(meta.objetivo, tension);
  const silence = visualSilenceLevelFromRules(visualRules);
  const visualFallbacks = [];

  const slides = slidesInput.slides.map((slide, index) => {
    const number = slide.number || index + 1;
    const type = String(slide.type || slugify(slide.role)).toUpperCase();
    let visualRule = String(slide.visual_rule || '').trim();
    if (!visualRule) {
      // Fallback só visual, nunca estratégico: regra herdada do brief oficial.
      visualRule = inheritedVisualRule(visualRules, silence, { type });
      visualFallbacks.push({ slide: number, inherited: visualRule });
    }
    return {
      index: number,
      type,
      funcao: slide.role,
      intencao: slide.intention || '',
      referencia_influente: slide.reference || '',
      principio_aplicado: slide.principle_applied,
      regra_visual_herdada: visualRule,
      anti_dna_aplicado: antiDna.slice(0, 4),
      visual_motif: slide.visual_motif || '',
      copy_final: { title: slide.title, body: slide.body },
    };
  });

  return {
    client: meta.slug,
    output_type: 'carousel',
    generated_at: new Date().toISOString(),
    source: meta.inputRelative,
    tese: officialBrief.thesis,
    tensao_explorada: tension,
    referencias_usadas: officialBrief.references || [],
    anti_dna_aplicado: antiDna,
    nivel_agressividade_copy: aggressiveness,
    nivel_silencio_visual: silence,
    regras_globais: {
      official_thesis: officialBrief.thesis,
      content_goal: officialBrief.content_goal,
      tone: officialBrief.tone,
      cta_strategy: officialBrief.cta_strategy,
      visual_rules: visualRules,
    },
    slides,
    gate: {
      status: 'passed',
      required_fields: REQUIRED_SLIDE_FIELDS,
      required_funnel_fields: FUNNEL_METADATA_FIELDS,
      visual_fallbacks: visualFallbacks,
      checked_at: new Date().toISOString(),
    },
    funnel_metadata: normalizeFunnelMetadata(slidesInput.funnel_metadata),
  };
}

function buildCopyMd(meta, creativeBrief, officialBrief, briefResult) {
  const slides = creativeBrief.slides;
  const lines = [];
  lines.push(`# Carrossel - ${meta.tema}`);
  lines.push('');
  lines.push(`- Cliente: ${meta.slug}`);
  lines.push(`- Objetivo: ${meta.objetivo}`);
  lines.push(`- Slides: ${meta.slides}`);
  lines.push(`- CTA: ${meta.cta}`);
  lines.push('');
  lines.push('## Creative brief oficial');
  lines.push('');
  lines.push(`- Arquivo: ${briefResult.relative_path || 'clients/[slug]/outputs/creative-direction/creative-brief.carousel.json'}`);
  lines.push(`- Gerado agora: ${briefResult.generated ? 'sim' : 'nao'}`);
  lines.push(`- Tese: ${officialBrief.thesis}`);
  lines.push(`- Tensao: ${officialBrief.tension}`);
  lines.push(`- Tom: ${officialBrief.tone}`);
  lines.push('');
  lines.push('## Execution brief');
  lines.push('');
  lines.push(`- Slides input (autoria): ${creativeBrief.source}`);
  lines.push(`- Tese: ${creativeBrief.tese}`);
  lines.push(`- Tensao explorada: ${creativeBrief.tensao_explorada}`);
  lines.push(`- Nivel de agressividade da copy: ${creativeBrief.nivel_agressividade_copy}`);
  lines.push(`- Nivel de silencio visual: ${creativeBrief.nivel_silencio_visual}`);
  lines.push(`- Gate: ${creativeBrief.gate.status}`);
  lines.push('');
  if (creativeBrief.funnel_metadata) {
    lines.push(formatFunnelMetadataMarkdown(creativeBrief.funnel_metadata));
    lines.push('');
  }
  if (officialBrief && officialBrief.source_report) {
    lines.push('## Context report');
    lines.push('');
    lines.push(`- Arquivos carregados: ${officialBrief.source_report.loaded.map((item) => item.path || item).join(', ') || 'nenhum'}`);
    lines.push(`- Arquivos ausentes: ${officialBrief.source_report.missing.map((item) => item.path || item).join(', ') || 'nenhum'}`);
    lines.push('');
  }

  slides.forEach((slide, index) => {
    lines.push(`## Slide ${String(index + 1).padStart(2, '0')} - ${slide.funcao}`);
    lines.push('');
    lines.push(`**Intencao:** ${slide.intencao}`);
    lines.push('');
    lines.push(`**Referencia influente:** ${slide.referencia_influente || 'nenhuma declarada'}`);
    lines.push('');
    lines.push(`**Principio aplicado:** ${slide.principio_aplicado}`);
    lines.push('');
    lines.push(`**Regra visual herdada:** ${slide.regra_visual_herdada}`);
    lines.push('');
    lines.push(`**Titulo:** ${slide.copy_final.title}`);
    lines.push('');
    lines.push(`**Corpo:** ${slide.copy_final.body}`);
    lines.push('');
  });

  return lines.join('\n');
}

function copyAggressiveness(objetivo, tension) {
  const goal = String(objetivo || '').toLowerCase();
  const tensionText = String(tension || '').toLowerCase();
  if (goal.includes('venda') || goal.includes('convers')) return 'alta';
  if (goal.includes('autoridade') || tensionText.includes('manifesto')) return 'media-alta';
  if (goal.includes('educ')) return 'media';
  return 'media';
}

function visualSilenceLevelFromRules(visualRules) {
  const density = String(ruleValue(visualRules, 'density')).toLowerCase();
  const movement = String(ruleValue(visualRules, 'motion')).toLowerCase();
  if (density.includes('baixa') || density.includes('esparso') || movement.includes('preciso') || movement.includes('sutil')) {
    return 'alto';
  }
  if (density.includes('alta') || density.includes('denso')) return 'baixo';
  return 'medio';
}

function inheritedVisualRule(visualRules, silence, role) {
  const density = ruleValue(visualRules, 'density') || 'densidade controlada';
  const rhythm = ruleValue(visualRules, 'typographic_rhythm') || 'ritmo tipografico claro';
  const contrast = ruleValue(visualRules, 'contrast') || 'contraste definido';
  if (role.type === 'GANCHO') return `silencio visual ${silence}; ${contrast}; texto com peso alto e poucos elementos`;
  if (role.type === 'VIRADA') return `quebra de ritmo; ${rhythm}; principio isolado como ponto de decisao`;
  return `${density}; ${rhythm}; nenhum elemento sem funcao semantica`;
}

function ruleValue(visualRules, type) {
  const rule = Array.isArray(visualRules) ? visualRules.find((item) => item.type === type) : null;
  return rule ? rule.value : '';
}

function nonEmptyList(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter(Boolean);
}

function buildLegenda(meta, caption) {
  // Legenda é copy estratégica — autoria na skill, nunca no motor.
  if (String(caption || '').trim()) {
    return `# legenda.md

${String(caption).trim()}
`;
  }
  return `# legenda.md

[PENDENTE] Legenda nao fornecida no slides-input.json (campo "caption").
O motor nao escreve copy estrategica — gere a legenda pela skill /criar carrossel.

Tema: ${meta.tema}
CTA: ${meta.cta || '[definir]'}
`;
}

function buildPromptsMd(meta, styleSuffix) {
  const prompts = [];
  for (let i = 1; i <= meta.slides; i += 1) {
    prompts.push(`## Prompt slide ${String(i).padStart(2, '0')}`);
    prompts.push('');
    prompts.push(`Prompt: professional editorial background for instagram carousel about "${meta.tema}", brand-safe composition, no text, no letters, high contrast subject separation, ${styleSuffix || 'clean visual hierarchy'}, cinematic lighting`);
    prompts.push('');
  }
  return `# prompts.md

Uso: imagem de fundo opcional. O texto final continua no HTML/CSS.

Formato alvo: 1080x1350
Tema: ${meta.tema}
Objetivo: ${meta.objetivo}

${prompts.join('\n')}
`;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// ── Registro de motifs do slide 1 ────────────────────────────────────────────
// Cada motif é um chamariz visual abstrato (sem texto na arte, só um kicker),
// no DNA da marca: fundo escuro, gold como sinal, espaço vazio como argumento.
// Sangram por um canto, ficam atrás do hook gigante. Escolha por tema:
//   signal-radar → visibilidade / diagnóstico        (sinal vs ruído)
//   funnel       → aquisição / funil / gargalo        (camadas que afunilam)
//   grid-node    → sistema / infraestrutura / conexão  (rede de nós)
//   ascent       → crescimento / previsibilidade       (barras que sobem)
//   orbit        → posicionamento / gravidade de marca  (órbitas + núcleo)
const MOTIFS = {
  'signal-radar': {
    label: 'sinal / ruído',
    html: `<div class="m-radar" aria-hidden="true">
    <div class="m-radar-line"></div>
    <span class="m-radar-dot"></span>
    <span class="m-radar-dot"></span>
    <span class="m-radar-dot"></span>
    <span class="m-radar-dot"></span>
  </div>`,
    css: `
    .m-radar { position: absolute; top: -150px; right: -130px; width: 660px; height: 660px; border: 1px solid rgba(201,165,92,.30); border-radius: 50%; display: grid; place-items: center; }
    .m-radar::before, .m-radar::after { content: ""; position: absolute; border-radius: 50%; border: 1px solid rgba(201,165,92,.16); }
    .m-radar::before { width: 440px; height: 440px; }
    .m-radar::after { width: 210px; height: 210px; background: radial-gradient(circle, rgba(201,165,92,.30), transparent 60%); border: none; }
    .m-radar-line { position: absolute; width: 52%; height: 2px; left: 50%; top: 50%; transform-origin: left center; transform: rotate(36deg); background: linear-gradient(90deg, rgba(201,165,92,1), transparent); }
    .m-radar-dot { position: absolute; width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,.28); }
    .m-radar-dot:nth-child(2) { top: 250px; left: 250px; }
    .m-radar-dot:nth-child(3) { bottom: 210px; left: 232px; }
    .m-radar-dot:nth-child(4) { top: 322px; left: 318px; width: 18px; height: 18px; background: var(--accent); box-shadow: 0 0 30px 6px rgba(201,165,92,.65); }
    .m-radar-dot:nth-child(5) { bottom: 250px; right: 260px; }`,
  },
  funnel: {
    label: 'funil / gargalo',
    html: `<div class="m-funnel" aria-hidden="true">
    <span class="m-funnel-bar"></span>
    <span class="m-funnel-bar"></span>
    <span class="m-funnel-bar"></span>
    <span class="m-funnel-bar"></span>
    <span class="m-funnel-bar"></span>
    <span class="m-funnel-node"></span>
    <span class="m-funnel-drip"></span>
  </div>`,
    css: `
    .m-funnel { position: absolute; top: 64px; right: -40px; width: 560px; display: flex; flex-direction: column; align-items: center; gap: 26px; }
    .m-funnel-bar { height: 8px; border-radius: 99px; background: var(--accent); }
    .m-funnel-bar:nth-child(1) { width: 520px; opacity: .85; }
    .m-funnel-bar:nth-child(2) { width: 400px; opacity: .7; }
    .m-funnel-bar:nth-child(3) { width: 280px; opacity: .58; }
    .m-funnel-bar:nth-child(4) { width: 170px; opacity: .46; }
    .m-funnel-bar:nth-child(5) { width: 92px; opacity: .36; }
    .m-funnel-node { width: 26px; height: 26px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 34px 8px rgba(201,165,92,.6); margin-top: 4px; }
    .m-funnel-drip { width: 2px; height: 92px; background: linear-gradient(180deg, var(--accent), transparent); }`,
  },
  'grid-node': {
    label: 'sistema',
    html: `<div class="m-grid" aria-hidden="true"></div>
  <span class="m-grid-link m-grid-link-1"></span>
  <span class="m-grid-link m-grid-link-2"></span>
  <span class="m-grid-node"></span>`,
    css: `
    .m-grid { position: absolute; top: -40px; right: -60px; width: 620px; height: 620px; background-image: radial-gradient(rgba(201,165,92,.34) 2px, transparent 2px); background-size: 66px 66px; -webkit-mask-image: radial-gradient(circle at 58% 42%, black 0%, transparent 70%); mask-image: radial-gradient(circle at 58% 42%, black 0%, transparent 70%); }
    .m-grid-link { position: absolute; height: 1.5px; background: linear-gradient(90deg, var(--accent), rgba(201,165,92,.08)); transform-origin: left center; }
    .m-grid-link-1 { top: 244px; right: 300px; width: 210px; transform: rotate(28deg); }
    .m-grid-link-2 { top: 312px; right: 250px; width: 156px; transform: rotate(-40deg); }
    .m-grid-node { position: absolute; top: 300px; right: 296px; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 30px 7px rgba(201,165,92,.6); }`,
  },
  ascent: {
    label: 'previsível',
    html: `<div class="m-ascent" aria-hidden="true">
    <span class="m-ascent-bar"></span>
    <span class="m-ascent-bar"></span>
    <span class="m-ascent-bar"></span>
    <span class="m-ascent-bar"></span>
    <span class="m-ascent-bar"></span>
    <span class="m-ascent-peak"></span>
  </div>`,
    css: `
    .m-ascent { position: absolute; top: 110px; right: -20px; width: 520px; height: 420px; display: flex; align-items: flex-end; gap: 22px; }
    .m-ascent-bar { flex: 1; border-radius: 8px 8px 0 0; background: linear-gradient(180deg, rgba(201,165,92,.55), rgba(201,165,92,.06)); }
    .m-ascent-bar:nth-child(1) { height: 22%; }
    .m-ascent-bar:nth-child(2) { height: 40%; }
    .m-ascent-bar:nth-child(3) { height: 58%; }
    .m-ascent-bar:nth-child(4) { height: 78%; }
    .m-ascent-bar:nth-child(5) { height: 100%; }
    .m-ascent-peak { position: absolute; top: -12px; right: 18px; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 30px 7px rgba(201,165,92,.6); }`,
  },
  orbit: {
    label: 'gravidade',
    html: `<div class="m-orbit" aria-hidden="true">
    <span class="m-orbit-core"></span>
    <span class="m-orbit-sat"></span>
  </div>`,
    css: `
    .m-orbit { position: absolute; top: -120px; right: -120px; width: 640px; height: 640px; display: grid; place-items: center; }
    .m-orbit::before, .m-orbit::after { content: ""; position: absolute; border: 1px solid rgba(201,165,92,.26); border-radius: 50%; transform: rotate(-24deg) scaleY(.52); }
    .m-orbit::before { width: 600px; height: 600px; }
    .m-orbit::after { width: 380px; height: 380px; border-color: rgba(201,165,92,.18); }
    .m-orbit-core { width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(201,165,92,.5), transparent 62%); }
    .m-orbit-sat { position: absolute; top: 158px; left: 168px; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 28px 7px rgba(201,165,92,.6); }`,
  },
};

function buildMotif(name) {
  const motif = MOTIFS[name];
  if (!motif) return { html: '', css: '' };
  const label = motif.label ? `<div class="motif-label">${escapeHtml(motif.label)}</div>` : '';
  return {
    html: `${motif.html}\n  ${label}\n  `,
    css: motif.css,
  };
}

function buildCarouselHtml(meta, creativeBrief, visual, officialBrief) {
  // O chamariz visual do slide 1 vem de um registro de motifs (ver buildMotif).
  const ganchoSlide = creativeBrief.slides.find((s) => s.type === 'GANCHO');
  const ganchoMotif = buildMotif(ganchoSlide ? ganchoSlide.visual_motif : '');

  const slideSections = creativeBrief.slides
    .map((slide, i) => {
      const isGancho = slide.type === 'GANCHO';
      const motifEl = isGancho ? ganchoMotif.html : '';
      const indexEl = `<div class="index">${String(i + 1).padStart(2, '0')}</div>`;
      const roleEl = isGancho ? '' : `<div class="role">${escapeHtml(slide.funcao)}</div>`;
      return `<section class="slide slide-${slide.type.toLowerCase()}" id="slide-${i + 1}" data-intention="${escapeHtml(slide.intencao)}">
  ${motifEl}${indexEl}
  ${roleEl}
  <h1>${escapeHtml(slide.copy_final.title)}</h1>
  <p>${escapeHtml(slide.copy_final.body)}</p>
</section>`;
    })
    .join('\n');

  const contextComment = officialBrief
    ? `<!--
Creative Brief:
- slides_input: ${creativeBrief.source}
- creative_brief: clients/${meta.slug}/outputs/creative-direction/creative-brief.carousel.json
- execution_brief_gate: ${creativeBrief.gate.status}
- thesis: ${officialBrief.thesis}
- tension: ${officialBrief.tension}
- principles: ${officialBrief.principles.join(' | ')}
-->
`
    : '';

  return `${contextComment}<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Carrossel - ${escapeHtml(meta.tema)}</title>
  <style>
    :root {
      --bg: ${visual.background};
      --fg: ${visual.foreground};
      --accent: ${visual.accent};
      --muted: ${visual.muted};
      --secondary: ${visual.secondary};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${visual.outerBackground};
      color: var(--fg);
      font-family: "${visual.primaryFont}", "${visual.secondaryFont}", "Arial", sans-serif;
      display: grid;
      gap: 24px;
      padding: 24px;
    }
    .slide {
      width: 1080px;
      height: 1350px;
      background: radial-gradient(circle at 20% 20%, var(--secondary) 0%, var(--bg) 58%);
      border: ${visual.borderWidth}px solid var(--accent);
      position: relative;
      padding: ${visual.slidePadding}px;
      display: grid;
      align-content: center;
      gap: 34px;
      overflow: hidden;
    }
    .slide::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
      background-size: 54px 54px;
      opacity: .42;
      mask-image: radial-gradient(circle at 65% 22%, black 0%, transparent 58%);
    }
    /* === SLIDE 1 — chamariz visual: hook domina, gold como sinal, espaco vazio como argumento === */
    .slide-gancho {
      align-content: end;
      gap: 26px;
      background:
        radial-gradient(circle at 80% 12%, rgba(201,165,92,.26) 0%, transparent 32%),
        radial-gradient(circle at 12% 92%, rgba(255,255,255,.05) 0%, transparent 38%),
        var(--bg);
    }
    .slide-gancho::after { opacity: .28; }
    /* rótulo-kicker compartilhado por todos os motifs do slide 1 */
    .motif-label {
      position: absolute;
      top: 72px;
      left: ${visual.slidePadding}px;
      color: rgba(201,165,92,.8);
      font-size: 19px;
      letter-spacing: .34em;
      text-transform: uppercase;
    }
    .index {
      color: var(--accent);
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 0;
    }
    .role {
      color: var(--accent);
      font-size: 22px;
      font-weight: 700;
      letter-spacing: .18em;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      font-size: 88px;
      line-height: 1.05;
      max-width: 900px;
      letter-spacing: 0;
    }
    p {
      margin: 0;
      color: var(--muted);
      font-size: 42px;
      line-height: 1.25;
      max-width: 850px;
      letter-spacing: 0;
    }
    .slide-gancho .index {
      font-size: 30px;
      opacity: .55;
      margin-bottom: 4px;
    }
    .slide-gancho h1 {
      font-size: 134px;
      line-height: .96;
      font-weight: 800;
      letter-spacing: -.035em;
      max-width: 1000px;
    }
    .slide-gancho p {
      font-size: 38px;
      line-height: 1.3;
      color: var(--muted);
      max-width: 720px;
      margin-top: 6px;
    }
${ganchoMotif.css}
  </style>
</head>
<body>
${slideSections}
</body>
</html>`;
}

function getVisualFromCreativeBrief(officialBrief) {
  const palette = ruleValue(officialBrief.visual_rules, 'palette') || {};
  const typography = ruleValue(officialBrief.visual_rules, 'typography') || {};
  const density = String(ruleValue(officialBrief.visual_rules, 'density')).toLowerCase();
  const contrast = String(ruleValue(officialBrief.visual_rules, 'contrast')).toLowerCase();

  return {
    background: pickColor(colorValue(palette.background), '#0f172a'),
    outerBackground: pickColor(colorValue(palette.surface), '#020617'),
    foreground: pickColor(colorValue(palette.text), '#e2e8f0'),
    secondary: pickColor(colorValue(palette.secondary), '#164e63'),
    accent: pickColor(colorValue(palette.accent), '#22d3ee'),
    muted: pickColor(colorValue(palette.muted), '#94a3b8'),
    primaryFont: pickFont(fontFamilyName(typography.headline), 'Segoe UI'),
    secondaryFont: pickFont(fontFamilyName(typography.body), 'Arial'),
    slidePadding: density.includes('baixa') || density.includes('esparso') ? 112 : 90,
    borderWidth: contrast.includes('alto') || contrast.includes('extremo') ? 1 : 2,
    styleSuffix: '',
  };
}

function colorValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.hex || '';
}

function fontFamilyName(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const weighted = text.match(/^([A-Za-z ]+)\s+\d/);
  if (weighted) return weighted[1].trim();
  return text
    .split(/[—–-]/)[0]
    .split(',')[0]
    .trim();
}

function appendCampaignLog(campaignsPath, meta, jobSlug) {
  if (!fs.existsSync(campaignsPath)) {
    return;
  }

  const line = `| ${formatDate()} | Carrossel ${meta.tema} | Gerado job ${jobSlug} (${meta.slides} slides) | Pipeline /carrossel |\n`;
  let content = fs.readFileSync(campaignsPath, 'utf8');
  const marker = '| [ DATA ] | [ CAMPANHA ] | [ O QUE MUDOU ] | [ POR QUE ] |';

  if (content.includes(marker)) {
    content = content.replace(marker, `${marker}\n${line.trimEnd()}`);
  } else {
    content = `${content.trimEnd()}\n\n## Registro automatico\n\n${line}`;
  }
  fs.writeFileSync(campaignsPath, content, 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  // A autoria vem do slides-input.json (escrito pela skill). O motor exige esse arquivo.
  const { input: slidesInput, resolvedPath: inputPath } = loadSlidesInput(args.input);
  enforceSlidesInputGate(slidesInput);

  // CLI pode sobrescrever, mas a fonte de verdade é o arquivo de autoria.
  const slug = args.slug || slidesInput.client_slug;
  const tema = args.tema || slidesInput.theme;
  const objetivo = args.objetivo || slidesInput.objective || 'Autoridade';
  const slides = slidesInput.slides.length;
  const cta = args.cta || slidesInput.cta || 'Comente "carrossel" para receber o modelo';
  const caption = slidesInput.caption || '';
  const useIaPrompts = ['true', '1', 'yes', 'sim'].includes(String(args.ia || '').toLowerCase());

  if (!slug) {
    fail('Faltou client_slug (no slides-input.json ou via --slug).');
  }
  if (!tema) {
    fail('Faltou theme (no slides-input.json ou via --tema).');
  }

  const baseClientDir = path.join(CLIENTS_DIR, slug);
  if (!fs.existsSync(baseClientDir)) {
    fail(`Cliente nao encontrado: ${slug}`);
  }

  const jobSlug = `${formatDate()}-${slugify(tema)}`;
  const jobDir = path.join(baseClientDir, 'outputs', 'carousels', jobSlug);
  const instagramDir = path.join(jobDir, 'instagram');
  ensureDir(instagramDir);

  const inputRelative = path.relative(ROOT, inputPath).replace(/\\/g, '/');
  const meta = { slug, tema, objetivo, slides, cta, inputRelative };
  const briefResult = getOfficialCreativeBrief(slug);
  const officialBrief = briefResult.brief;
  if (!briefResult.validation.valid) {
    fail([
      'GATE REPROVADO — creative brief oficial incompleto.',
      `Arquivo: ${briefResult.relative_path}`,
      ...briefResult.validation.missing.map((item) => `  - ${item}`),
      'Antes de regerar, crie e aprove clients/[slug]/outputs/strategy/strategy-decision.json usando templates/strategy-decision.template.json.',
      'Regere ou complete o brief antes de renderizar a peca.',
    ].join('\n'));
  }
  const visual = getVisualFromCreativeBrief(officialBrief);
  const executionBrief = buildCarouselExecutionBrief(meta, officialBrief, slidesInput);

  fs.writeFileSync(path.join(jobDir, 'execution-brief.json'), JSON.stringify(executionBrief, null, 2), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'copy.md'), buildCopyMd(meta, executionBrief, officialBrief, briefResult), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'legenda.md'), buildLegenda(meta, caption), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'carrossel.html'), buildCarouselHtml(meta, executionBrief, visual, officialBrief), 'utf8');
  fs.writeFileSync(path.join(jobDir, 'context-report.json'), JSON.stringify({
    official_creative_brief: briefResult.relative_path,
    generated_now: briefResult.generated,
    validation: briefResult.validation,
    source_report: officialBrief.source_report,
    references: officialBrief.references,
    principles: officialBrief.principles,
  }, null, 2), 'utf8');
  if (useIaPrompts) {
    fs.writeFileSync(path.join(jobDir, 'prompts.md'), buildPromptsMd(meta, visual.styleSuffix), 'utf8');
  }

  const renderTemplate = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findRoot(startDir) {
  let current = startDir;
  while (true) {
    const candidate = path.join(current, 'scripts', 'render-carousel.js');
    if (fs.existsSync(candidate)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error('Nao foi possivel localizar scripts/render-carousel.js');
    }
    current = parent;
  }
}

const root = findRoot(__dirname);
  const script = path.join(root, 'scripts', 'render-commercial-carousel.js');
const html = path.resolve(__dirname, 'carrossel.html');
const outDir = path.resolve(__dirname, 'instagram');
const count = ${slides};
const result = spawnSync('node', [script, '--html', html, '--out', outDir, '--slides', String(count)], { stdio: 'inherit' });
process.exit(result.status || 0);
`;
  fs.writeFileSync(path.join(jobDir, 'render.js'), renderTemplate, 'utf8');
  appendCampaignLog(path.join(baseClientDir, 'campaigns.md'), meta, jobSlug);

  console.log(`Pipeline criado: ${jobDir}`);
  console.log(`Arquivos: execution-brief.json, copy.md, legenda.md, carrossel.html, render.js, context-report.json${useIaPrompts ? ', prompts.md' : ''}`);
  console.log('Proximo passo: node <jobDir>/render.js');
  console.log(`Registro atualizado em campaigns.md (${nowTimestamp()})`);
}

function getOfficialCreativeBrief(slug) {
  const result = getCreativeBrief({
    client_slug: slug,
    output_type: 'carousel',
    rootDir: ROOT,
  });
  result.relative_path = path.relative(ROOT, result.path).replace(/\\/g, '/');
  return result;
}

main();
