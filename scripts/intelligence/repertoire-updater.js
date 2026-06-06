#!/usr/bin/env node
'use strict';

/**
 * repertoire-updater.js - MarketingOS external repertoire scanner
 *
 * Clones/pulls the four approved marketing-skill repositories, inventories
 * their skills, tools, scripts, references, and writes one programmed updater
 * per source plus a consolidated scan report.
 *
 * Usage:
 *   node scripts/intelligence/repertoire-updater.js [--source <id|all>] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const CACHE_DIR = path.join(ROOT, '.marketingos', 'repertoire');
const OUT_DIR = path.join(ROOT, 'intelligence', 'repertoire-updaters');
const REPORT_PATH = path.join(ROOT, 'intelligence', 'repertoire-scan-report.md');
const INVENTORY_PATH = path.join(OUT_DIR, 'inventory.json');

const SOURCES = [
  {
    id: 'marketingskills',
    name: 'coreyhaines31/marketingskills',
    url: 'https://github.com/coreyhaines31/marketingskills.git',
    cadence: 'Semanal, segunda-feira, antes de planejar criacao/aquisicao.',
    role: 'Biblioteca principal de skills marketing/GTM, referencias e integracoes.',
    bestFor: ['CRO', 'copywriting', 'paid ads', 'SEO/AEO', 'analytics', 'prospecting', 'RevOps', 'retention'],
    targetGroups: ['skills/analise', 'skills/criacao', 'skills/aquisicao', 'skills/relacionamento', 'intelligence', 'scripts/integration'],
    adoptionRule: 'Importar framework, checklist, referencia ou benchmark; nunca copiar tom generico nem substituir a alma do MarketingOS.',
  },
  {
    id: 'ai-marketing-claude',
    name: 'zubair-trabzada/ai-marketing-claude',
    url: 'https://github.com/zubair-trabzada/ai-marketing-claude.git',
    cadence: 'Quinzenal, quarta-feira, focado em auditoria, proposta e relatorio.',
    role: 'Suite operacional com orquestrador /market, agentes paralelos, scripts Python e templates comerciais.',
    bestFor: ['website audit', 'proposal', 'landing CRO', 'competitor scan', 'PDF/Markdown report', 'content calendar'],
    targetGroups: ['skills/analise', 'skills/aquisicao', 'workflows', 'templates', 'scripts/demo-pipeline'],
    adoptionRule: 'Aproveitar arquitetura de orquestracao e formatos de entrega; recalibrar scoring para conversao e verdade humana.',
  },
  {
    id: 'claude-skills',
    name: 'alirezarezvani/claude-skills',
    url: 'https://github.com/alirezarezvani/claude-skills.git',
    cadence: 'Mensal, primeira sexta-feira, com triagem por impacto estrategico.',
    role: 'Ecossistema amplo de skills, agentes, padroes de autoria, C-level, business growth e operacoes.',
    bestFor: ['skill authoring', 'multi-agent governance', 'C-level review', 'RevOps', 'customer success', 'business operations'],
    targetGroups: ['CLAUDE.md', 'workflows', 'skills/relacionamento', 'skills/venda', 'skills/aquisicao', 'docs'],
    adoptionRule: 'Extrair governanca, padroes e perguntas de decisao; evitar importar complexidade que nao gere resultado direto.',
  },
  {
    id: 'ai-marketing-claude-code-skills',
    name: 'BrianRWagner/ai-marketing-claude-code-skills',
    url: 'https://github.com/BrianRWagner/ai-marketing-claude-code-skills.git',
    cadence: 'Semanal, sexta-feira, focado em voz, autoridade, pesquisa e outreach.',
    role: 'Repertorio pratico de skills de posicionamento, voz, conteudo, pesquisa, autoridade e vendas.',
    bestFor: ['voice extraction', 'de-AI-ify', 'LinkedIn authority', 'AI discoverability', 'cold outreach', 'case studies'],
    targetGroups: ['skills/criacao', 'skills/aquisicao', 'skills/venda', 'intelligence/patterns.md', 'templates'],
    adoptionRule: 'Adaptar modos, intakes e criterios de qualidade; manter linguagem de desejo, medo e IA aplicada do MarketingOS.',
  },
];

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const sourceArgIndex = args.indexOf('--source');
const selectedSource = sourceArgIndex >= 0 ? args[sourceArgIndex + 1] : 'all';

function run(cmd, argsList, options = {}) {
  const output = execFileSync(cmd, argsList, {
    cwd: options.cwd || ROOT,
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  });
  return typeof output === 'string' ? output.trim() : '';
}

function ensureDir(dir) {
  if (!DRY_RUN) fs.mkdirSync(dir, { recursive: true });
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (_) {
    return '';
  }
}

function listFiles(dir) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  if (fs.existsSync(dir)) walk(dir);
  return files;
}

function rel(base, file) {
  return path.relative(base, file).replace(/\\/g, '/');
}

function cloneOrPull(source) {
  ensureDir(CACHE_DIR);
  const dest = path.join(CACHE_DIR, source.id);
  if (!fs.existsSync(path.join(dest, '.git'))) {
    if (DRY_RUN) return dest;
    run('git', ['clone', '--depth', '1', source.url, dest], { stdio: 'inherit' });
    return dest;
  }
  if (!DRY_RUN) run('git', ['pull', '--ff-only'], { cwd: dest, stdio: 'inherit' });
  return dest;
}

function extensionCounts(files) {
  const counts = {};
  for (const file of files) {
    const ext = path.extname(file).toLowerCase() || '[no-ext]';
    counts[ext] = (counts[ext] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

function firstMatch(lines, regex) {
  const found = lines.find((line) => regex.test(line));
  return found ? found.trim() : '';
}

function parseSkill(base, file) {
  const raw = readText(file);
  const lines = raw.split(/\r?\n/);
  const title = firstMatch(lines, /^#\s+/).replace(/^#\s+/, '');
  let description = firstMatch(lines, /^description:\s*/i).replace(/^description:\s*/i, '');
  if (!description) {
    const firstParagraph = lines
      .slice(0, 40)
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#') && !line.startsWith('---'));
    description = firstParagraph || '';
  }
  const headings = lines
    .filter((line) => /^#{2,3}\s+/.test(line))
    .slice(0, 12)
    .map((line) => line.replace(/^#{2,3}\s+/, '').trim());
  return {
    path: rel(base, file),
    title,
    description: description.slice(0, 300),
    headings,
  };
}

function analyzeSource(source) {
  const repoDir = cloneOrPull(source);
  const files = listFiles(repoDir);
  const skills = files
    .filter((file) => path.basename(file).toLowerCase() === 'skill.md')
    .map((file) => parseSkill(repoDir, file))
    .sort((a, b) => a.path.localeCompare(b.path));
  const refs = files
    .filter((file) => /[\\/](references|templates|assets)[\\/]/i.test(file))
    .map((file) => rel(repoDir, file))
    .sort();
  const scripts = files
    .filter((file) => /[\\/](scripts|tools)[\\/]/i.test(file))
    .map((file) => rel(repoDir, file))
    .sort();
  const agents = files
    .filter((file) => /[\\/]agents[\\/]/i.test(file))
    .map((file) => rel(repoDir, file))
    .sort();
  const rootDocs = files
    .filter((file) => path.dirname(file) === repoDir && /\.md$/i.test(file))
    .map((file) => rel(repoDir, file))
    .sort();
  let commit = '';
  try {
    commit = run('git', ['rev-parse', '--short', 'HEAD'], { cwd: repoDir });
  } catch (_) {
    commit = 'unknown';
  }
  return {
    ...source,
    repoDir,
    commit,
    scannedAt: new Date().toISOString(),
    counts: {
      files: files.length,
      skills: skills.length,
      references: refs.length,
      scriptsAndTools: scripts.length,
      agents: agents.length,
      rootDocs: rootDocs.length,
    },
    extensionCounts: extensionCounts(files),
    rootDocs,
    skills,
    references: refs,
    scriptsAndTools: scripts,
    agents,
  };
}

function mdList(items, max = 20) {
  if (!items.length) return '- Nenhum item encontrado.';
  return items.slice(0, max).map((item) => `- ${item}`).join('\n') +
    (items.length > max ? `\n- ... mais ${items.length - max}` : '');
}

function skillTable(skills, max = 80) {
  if (!skills.length) return '| Skill | Resumo |\n|---|---|\n| - | Nenhuma skill detectada |';
  const rows = skills.slice(0, max).map((skill) => {
    const name = skill.title || skill.path;
    const summary = skill.description || skill.headings.slice(0, 3).join('; ') || 'Sem resumo detectado';
    return `| \`${skill.path}\` | ${name.replace(/\|/g, '/')} - ${summary.replace(/\|/g, '/')} |`;
  });
  if (skills.length > max) rows.push(`| ... | mais ${skills.length - max} skills no inventory.json |`);
  return ['| Skill | Leitura util |', '|---|---|', ...rows].join('\n');
}

function writeUpdater(inv) {
  const file = path.join(OUT_DIR, `${inv.id}.md`);
  const body = `# Updater programado - ${inv.name}

Fonte: ${inv.url.replace(/\.git$/, '')}
Ultimo scan: ${inv.scannedAt}
Commit analisado: ${inv.commit}
Cadencia: ${inv.cadence}

## Papel no MarketingOS
${inv.role}

## Melhor uso
${inv.bestFor.map((item) => `- ${item}`).join('\n')}

## Alvos internos
${inv.targetGroups.map((item) => `- \`${item}\``).join('\n')}

## Regra de adocao
${inv.adoptionRule}

## Checklist programado
- Puxar atualizacoes do repositorio e revisar CHANGELOG/README/root docs.
- Inventariar novas skills, referencias, scripts, agentes e templates.
- Classificar cada novidade como: aplicar agora, adaptar depois, observar, rejeitar.
- Verificar conflito com manifesto.md, alma.md e CLAUDE.md.
- Registrar aprendizado em \`intelligence/skill-updates.md\` antes de alterar skill existente.
- Se virar capacidade recorrente, criar ou atualizar skill em um unico grupo.
- Atualizar \`workflows/commands.md\` somente se nascer comando novo.

## Sinais para importar
- Aumenta conversao, clareza, aquisicao, retencao ou prova.
- Traz checklist operacional que reduz erro humano.
- Melhora intake, scoring, pesquisa, diagnostico ou output vendavel.
- Pode ser lido com pouco contexto e executado sem inflar a sessao.

## Sinais para rejeitar
- Template generico sem verdade humana.
- Promessa sem dados, benchmark ou criterio verificavel.
- Complexidade de agente que nao muda resultado.
- Linguagem de agencia, pacote de posts ou tecnologia antes do desejo.

## Inventario do ultimo scan
- Arquivos: ${inv.counts.files}
- Skills: ${inv.counts.skills}
- Referencias/templates/assets: ${inv.counts.references}
- Scripts/tools: ${inv.counts.scriptsAndTools}
- Agents: ${inv.counts.agents}
- Docs raiz: ${inv.counts.rootDocs}

## Root docs
${mdList(inv.rootDocs, 30)}

## Skills detectadas
${skillTable(inv.skills, 120)}

## Scripts e tools relevantes
${mdList(inv.scriptsAndTools, 80)}

## Referencias/templates/assets relevantes
${mdList(inv.references, 80)}
`;
  if (!DRY_RUN) fs.writeFileSync(file, body, 'utf8');
  return file;
}

function writeReport(inventories) {
  const body = `# Repertoire scan report - MarketingOS

Atualizado em: ${new Date().toISOString()}

## Sumario executivo
Os quatro repositorios nao devem ser copiados em bloco. Eles formam quatro camadas de atualizacao:

- \`marketingskills\`: repertorio granular de marketing/GTM e integracoes.
- \`ai-marketing-claude\`: suite operacional para auditoria, proposta e relatorio.
- \`claude-skills\`: governanca, padrao de autoria, multiagentes e business operations.
- \`ai-marketing-claude-code-skills\`: voz, autoridade, pesquisa, social proof e outreach.

Filtro MarketingOS: importar metodo e prova; rejeitar linguagem generica. Tudo precisa passar por desejo antes de necessidade, medo antes de tecnologia, conversao antes de volume.

## Mapa por fonte
${inventories.map((inv) => `### ${inv.name}
- Fonte: ${inv.url.replace(/\.git$/, '')}
- Commit: ${inv.commit}
- Arquivos: ${inv.counts.files}
- Skills: ${inv.counts.skills}
- Referencias/templates/assets: ${inv.counts.references}
- Scripts/tools: ${inv.counts.scriptsAndTools}
- Agents: ${inv.counts.agents}
- Updater: \`intelligence/repertoire-updaters/${inv.id}.md\`
- Melhor uso: ${inv.bestFor.join(', ')}
- Alvos internos: ${inv.targetGroups.join(', ')}
`).join('\n')}

## O que nao deixar passar
- Scoring e pesos: transformar auditorias em diagnosticos de decisao, nao em notas decorativas.
- Context loading gates: adotar leitura minima por skill para economizar tokens.
- Dual files e modos: quick/standard/deep podem virar leve/padrao/profundo no MarketingOS.
- Referencias de plataforma: limites, benchmarks, compliance e specs devem alimentar intelligence, nao ficar presos em skills.
- Scripts utilitarios: so entram quando fecham loop operacional real.
- Agents paralelos: usar apenas para analise com dimensoes independentes.
- Templates: converter para outputs/clientes com alma; nunca usar como copia final.

## Proximas atualizacoes sugeridas
1. Criar uma skill \`analise/skill-auditoria-site.md\` usando o melhor de market-audit, homepage-audit, cro, copywriting e seo-audit.
2. Evoluir \`aquisicao/skill-prospecting-agent.md\` com sinais de pesquisa, compliance e cold outreach dos repositorios.
3. Evoluir \`criacao/skill-social-copy.md\` com voice-extractor, de-ai-ify, social e content-idea-generator.
4. Evoluir \`relacionamento/skill-retention.md\` com churn-prevention e customer-success-manager.

## Como rodar
\`\`\`bash
npm run repertoire:update
npm run repertoire:update -- --source marketingskills
npm run repertoire:update -- --dry-run
\`\`\`
`;
  if (!DRY_RUN) fs.writeFileSync(REPORT_PATH, body, 'utf8');
}

function main() {
  const chosen = selectedSource === 'all'
    ? SOURCES
    : SOURCES.filter((source) => source.id === selectedSource);

  if (!chosen.length) {
    console.error(`Fonte desconhecida: ${selectedSource}`);
    console.error(`Opcoes: all, ${SOURCES.map((source) => source.id).join(', ')}`);
    process.exit(1);
  }

  ensureDir(OUT_DIR);
  const inventories = chosen.map(analyzeSource);

  if (!DRY_RUN) {
    const existing = fs.existsSync(INVENTORY_PATH) ? JSON.parse(readText(INVENTORY_PATH) || '{}') : {};
    const byId = existing.sources || {};
    for (const inv of inventories) byId[inv.id] = inv;
    fs.writeFileSync(INVENTORY_PATH, JSON.stringify({ updatedAt: new Date().toISOString(), sources: byId }, null, 2) + '\n', 'utf8');
  }

  for (const inv of inventories) {
    const file = writeUpdater(inv);
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}${inv.id}: ${inv.counts.skills} skills, ${inv.counts.files} files -> ${path.relative(ROOT, file)}`);
  }

  if (selectedSource === 'all') {
    writeReport(inventories);
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}report -> ${path.relative(ROOT, REPORT_PATH)}`);
  }
}

main();
