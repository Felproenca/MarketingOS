'use strict';

const fs = require('fs');
const path = require('path');

function buildBrief(slug, options = {}) {
  const rootDir = process.cwd();
  const clientDir = path.join(rootDir, 'clients', slug);

  if (!fs.existsSync(clientDir)) {
    throw new Error(`Cliente nao encontrado: ${slug}`);
  }

  const clientMd = readFile(path.join(clientDir, 'client.md'));
  const estrategia = readFile(path.join(clientDir, 'estrategia.md'));
  const brandKit = readJSON(path.join(clientDir, 'brand-kit.json'));
  const alma = readFile(path.join(rootDir, 'alma.md'));
  const manifesto = readFile(path.join(rootDir, 'manifesto.md'));
  const benchmarks = readJSON(path.join(rootDir, 'intelligence', 'benchmarks.json'));

  const clientData = parseClientMd(clientMd, brandKit);
  const nicheKey = normalizeKey(clientData.nicho);
  const nicheBenchmarks = benchmarks?.niches?.[nicheKey] || benchmarks?.niches?.[clientData.nicho] || benchmarks?.global || {};

  return {
    client_slug: slug,
    client_name: clientData.nome,
    nicho: nicheKey || clientData.nicho || 'geral',
    plataforma: options.plataforma || 'instagram',
    objetivo: options.objetivo || 'autoridade',
    tema: options.tema || null,
    format: options.format || '1:1',

    contexto_cliente: {
      nome: clientData.nome,
      historia: clientData.historia,
      diferencial: clientData.diferencial,
      publico: clientData.publico,
      tom_da_marca: clientData.tom,
      restricoes: clientData.restricoes,
      foco_atual: extractFoco(estrategia),
    },

    visual: {
      palette: {
        primary: pickColor(brandKit, 'primary', '#0a0a0a'),
        secondary: pickColor(brandKit, 'secondary', '#1a1a1a'),
        accent: pickColor(brandKit, 'accent', '#c9a55c'),
        background: pickColor(brandKit, 'background', '#fafafa'),
        text: pickColor(brandKit, 'text', '#1a1a1a'),
        text_light: pickColor(brandKit, 'neutral', '#888888'),
      },
      typography: {
        heading: brandKit?.typography?.primary_font || 'Playfair Display',
        body: brandKit?.typography?.secondary_font || 'Syne',
      },
      style: brandKit?.visual_style || {},
      restrictions: brandKit?.restrictions || {},
      format_specs: brandKit?.format_specs || {},
    },

    sistema_filosofia: {
      principio: 'Nao vendemos conteudo. Encontramos a verdade humana e multiplicamos.',
      filtros: [
        'Isso e autentico? Poderia ser dito so por essa marca?',
        'Comeca pelo problema do cliente, nao pelo produto',
        'Emocao na superficie, logica na estrutura',
        'Desejo antes de necessidade',
        'Mostrar o real, nao o perfeito',
      ],
      manifesto_excerpt: compactText(manifesto, 1200),
      alma_excerpt: compactText(alma, 1600),
    },

    benchmarks: nicheBenchmarks,
    estrategia_atual: compactText(estrategia, 1600),

    generated_at: new Date().toISOString(),
    version: '1.0',
    source: 'marketingos',
  };
}

function parseClientMd(content, brandKit = {}) {
  return {
    nome: firstValue([
      brandKit?.identity?.brand_name,
      lineValue(content, ['Nome da empresa', 'Nome', 'Cliente', 'Empresa']),
      headingValue(content),
    ]) || 'A definir',
    nicho: firstValue([
      lineValue(content, ['Segmento/nicho', 'Segmento', 'Nicho', 'Setor']),
    ]),
    historia: firstValue([
      lineValue(content, ['Historia', 'História', 'Sobre', 'Background']),
      sectionValue(content, ['O Negocio', 'O Negócio']),
    ]),
    diferencial: firstValue([
      lineValue(content, ['Diferencial percebido', 'Diferencial real', 'Diferencial', 'Posicionamento proposto', 'Posicionamento']),
      sectionValue(content, ['Posicionamento e Concorrencia', 'Posicionamento e Concorrência']),
    ]),
    publico: firstValue([
      lineValue(content, ['Publico ideal', 'Público ideal', 'Perfil', 'Publico', 'Público', 'ICP', 'Persona']),
      sectionValue(content, ['O Cliente Ideal']),
    ]),
    tom: firstValue([
      lineValue(content, ['Tom de voz', 'Como se comunica', 'Tom', 'Voz', 'Personalidade']),
      sectionValue(content, ['Tom e Identidade']),
      Array.isArray(brandKit?.identity?.personality) ? brandKit.identity.personality.filter(Boolean).join(', ') : '',
    ]),
    restricoes: firstValue([
      lineValue(content, ['Palavras proibidas', 'Palavras que evita', 'Restricoes', 'Restrições', 'Nao usar', 'Não usar', 'Evitar']),
      Array.isArray(brandKit?.restrictions?.never_use) ? brandKit.restrictions.never_use.filter(Boolean).join(', ') : '',
    ]),
  };
}

function headingValue(content) {
  const match = String(content || '').match(/^#\s+(.+)$/m);
  if (!match) return '';
  return match[1].replace(/^client\.md\s*[-–—]\s*/i, '').trim();
}

function lineValue(content, labels) {
  const lines = String(content || '').split(/\r?\n/);
  for (const label of labels) {
    const escaped = escapeRegex(label);
    const regex = new RegExp(`^\\s*(?:[-*]\\s*)?(?:${escaped})\\s*[:?]\\s*(.+)$`, 'i');
    for (const line of lines) {
      const match = line.replace(/\*\*/g, '').match(regex);
      if (match && cleanValue(match[1])) return cleanValue(match[1]);
    }
  }
  return '';
}

function sectionValue(content, headings) {
  const text = String(content || '');
  for (const heading of headings) {
    const regex = new RegExp(`(?:^|\\n)##\\s+[^\\n]*${escapeRegex(heading)}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i');
    const match = text.match(regex);
    if (match) return compactText(match[1], 900);
  }
  return '';
}

function extractFoco(estrategia) {
  const text = String(estrategia || '');
  const match = text.match(/foco\s+atual\s*[:\-]\s*([^\n]+)/i);
  if (match) return match[1].trim();
  return compactText(text, 800);
}

function pickColor(brandKit, key, fallback) {
  return brandKit?.palette?.[key]?.hex || fallback;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function compactText(value, limit) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function cleanValue(value) {
  const cleaned = String(value || '').trim();
  if (!cleaned || /^[_\-\s]+$/.test(cleaned)) return '';
  if (/^\[.*\]$/.test(cleaned)) return '';
  return cleaned;
}

function firstValue(values) {
  return values.map(cleanValue).find(Boolean) || '';
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { buildBrief, parseClientMd };
