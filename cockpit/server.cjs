const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const app = express()
const PORT = 4201
const DATA_DIR = path.join(__dirname, 'generated-sites')

app.use(cors())
app.use(express.json({ limit: '2mb', type: 'application/json' }))
// Garante que arquivos são sempre escritos em UTF-8
process.env.CHCP = '65001'
app.use('/preview', express.static(DATA_DIR))

// ── helpers ──────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}

function missionDir(slug) { return path.join(DATA_DIR, slug) }

function readMission(slug) {
  const file = path.join(missionDir(slug), 'mission.json')
  if (!fs.existsSync(file)) return null
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function writeMission(mission) {
  const dir = missionDir(mission.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'mission.json'), JSON.stringify(mission, null, 2))
}

function listMissions() {
  if (!fs.existsSync(DATA_DIR)) return []
  return fs.readdirSync(DATA_DIR)
    .filter(d => fs.existsSync(path.join(DATA_DIR, d, 'mission.json')))
    .map(d => readMission(d))
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// ── routes ───────────────────────────────────────────────────────

// GET /api/missions
app.get('/api/missions', (req, res) => {
  res.json(listMissions())
})

// GET /api/missions/:slug
app.get('/api/missions/:slug', (req, res) => {
  const m = readMission(req.params.slug)
  if (!m) return res.status(404).json({ error: 'not found' })
  res.json(m)
})

// POST /api/missions — cria missão
app.post('/api/missions', (req, res) => {
  const body = req.body
  const slug = slugify(body.empresa || 'missao') + '-' + Date.now().toString(36)
  const steps = getSteps(body.modo || 'prospeccao')
  const mission = {
    id: slug,
    slug,
    nome: `${modeLabel(body.modo)} — ${body.empresa}`,
    modo: body.modo || 'prospeccao',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...body,
    steps,
  }
  writeMission(mission)
  res.json(mission)
})

// POST /api/missions/:slug/execute — gera dossiê + site
app.post('/api/missions/:slug/execute', async (req, res) => {
  const mission = readMission(req.params.slug)
  if (!mission) return res.status(404).json({ error: 'not found' })

  mission.status = 'running'
  mission.updatedAt = new Date().toISOString()
  writeMission(mission)

  // Gera tudo de forma síncrona (simples)
  try {
    const dir = missionDir(mission.slug)
    const refs = pickRefs(mission.nicho)

    // Atualiza steps sequencialmente
    const stepFns = [
      () => markStep(mission, 'Research', () => generateBriefing(dir, mission)),
      () => markStep(mission, 'Brand Extraction', () => generateBrandExtraction(dir, mission)),
      () => markStep(mission, 'Reference Selection', () => generateReferences(dir, mission, refs)),
      () => markStep(mission, 'Copy Strategy', () => generateCopy(dir, mission)),
      () => markStep(mission, 'Page Structure', () => generateStructure(dir, mission)),
      () => markStep(mission, 'Motion Direction', () => generateMotion(dir, mission)),
      () => markStep(mission, 'Build', () => generateSite(dir, mission, refs)),
      () => markStep(mission, 'QA', () => generateQA(dir, mission)),
      () => markStep(mission, 'Preview', () => {
        mission.previewUrl = `/preview/${mission.slug}/site/index.html`
      }),
    ]

    for (const fn of stepFns) {
      await delay(300 + Math.random() * 200)
      fn()
      writeMission(mission)
    }

    mission.status = 'done'
    mission.updatedAt = new Date().toISOString()
    writeMission(mission)
    res.json(mission)
  } catch (err) {
    mission.status = 'error'
    writeMission(mission)
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/missions/:slug
app.delete('/api/missions/:slug', (req, res) => {
  const dir = missionDir(req.params.slug)
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true })
  res.json({ ok: true })
})

// ── generators ───────────────────────────────────────────────────

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

function markStep(mission, label, fn) {
  const step = mission.steps.find(s => s.label === label)
  if (step) { step.status = 'running'; writeMission(mission) }
  if (fn) fn()
  if (step) { step.status = 'done'; step.completedAt = new Date().toISOString() }
}

function getSteps(modo) {
  const base = [
    { id: 's1', label: 'Research', status: 'pending' },
    { id: 's2', label: 'Brand Extraction', status: 'pending' },
    { id: 's3', label: 'Reference Selection', status: 'pending' },
    { id: 's4', label: 'Copy Strategy', status: 'pending' },
    { id: 's5', label: 'Page Structure', status: 'pending' },
    { id: 's6', label: 'Motion Direction', status: 'pending' },
    { id: 's7', label: 'Build', status: 'pending' },
    { id: 's8', label: 'QA', status: 'pending' },
    { id: 's9', label: 'Preview', status: 'pending' },
  ]
  return base
}

function modeLabel(modo) {
  return { prospeccao: 'Site Prospecção', premium: 'Site Premium', conteudo: 'Conteúdo', aquisicao: 'Aquisição' }[modo] || 'Missão'
}

function pickRefs(nicho = '') {
  const n = nicho.toLowerCase()
  const all = [
    { nome: 'Linear', url: 'linear.app', categoria: 'layout', o_que_aproveitar: ['Grid de alta densidade', 'Tipografia compacta e precisa', 'Hierarquia visual sem decoração'] },
    { nome: 'Stripe', url: 'stripe.com', categoria: 'conversao', o_que_aproveitar: ['Copy técnica mas humanizada', 'CTA com verbo de ação claro', 'Seções de prova com dados reais'] },
    { nome: 'Raycast', url: 'raycast.com', categoria: 'hero', o_que_aproveitar: ['Hero com produto em destaque', 'Headline curta e impactante', 'Cores vibrantes sobre dark'] },
    { nome: 'Basement Studio', url: 'basement.studio', categoria: 'visual', o_que_aproveitar: ['Identidade visual fortíssima', 'Tipografia como elemento visual', 'Grid quebrado intencional'] },
    { nome: 'Framer', url: 'framer.com', categoria: 'motion', o_que_aproveitar: ['Motion do hero com física real', 'Cards com hover magnético', 'Scroll reveal staggerado'] },
  ]
  // Seleciona 3 relevantes ao nicho
  if (n.includes('estética') || n.includes('estetica') || n.includes('saúde') || n.includes('saude')) {
    return [all[1], all[4], { nome: 'Pattern: Clínica Premium', categoria: 'conversao', o_que_aproveitar: ['Hero com before/after', 'Depoimentos com foto real', 'CTA WhatsApp com urgência'] }]
  }
  if (n.includes('imóv') || n.includes('imov') || n.includes('arquit')) {
    return [all[0], all[3], { nome: 'Pattern: Portfólio Premium', categoria: 'visual', o_que_aproveitar: ['Fotografia fullscreen', 'Grid de projetos com hover', 'Copy de autoridade'] }]
  }
  return [all[0], all[2], all[4]]
}

function generateBriefing(dir, m) {
  const content = `# Briefing — ${m.nome}

**Empresa:** ${m.empresa}
**Nicho:** ${m.nicho}
**Cidade:** ${m.cidade || '—'}
**Modo:** ${m.modo}
**Criado em:** ${new Date(m.createdAt).toLocaleDateString('pt-BR')}

---

## Oferta Principal

${m.oferta}

## Público-Alvo

${m.publico}

## Tom de Comunicação

${m.tom}

## Objetivo

${m.objetivo}

## Observações

${m.observacoes || '—'}

---

## Site Atual

${m.urlAtual ? `[${m.urlAtual}](${m.urlAtual})` : 'Não informado'}

## Instagram

${m.instagram || '—'}
`
  fs.writeFileSync(path.join(dir, 'briefing.md'), content)
}

function generateBrandExtraction(dir, m) {
  const content = `# Brand Extraction — ${m.empresa}

## O que a marca faz

${m.oferta}

## Para quem

${m.publico}

## Tom

${m.tom}

## Percepção desejada

Premium, confiável, específico para o nicho. Sem genérico.

## Anti-DNA (o que evitar)

- Frases como "excelência e qualidade", "soluções completas", "atendimento personalizado"
- Visual de template
- Motion aleatório sem propósito
- Copy que poderia ser de qualquer empresa do setor

## Hipótese de promessa central

> "${m.empresa} para quem quer ${extractDesejo(m.objetivo)} sem ${extractFrustracao(m.nicho)}."
`
  fs.writeFileSync(path.join(dir, 'brand-extraction.md'), content)
}

function extractDesejo(objetivo) {
  if (objetivo.includes('WhatsApp')) return 'receber pedidos sem depender de indicação'
  if (objetivo.includes('lead')) return 'atrair clientes qualificados'
  if (objetivo.includes('portfólio') || objetivo.includes('portfolio')) return 'mostrar credibilidade antes da reunião'
  return 'crescer de forma previsível'
}

function extractFrustracao(nicho) {
  const n = (nicho || '').toLowerCase()
  if (n.includes('estética') || n.includes('estetica')) return 'cair em promessas exageradas'
  if (n.includes('imóv') || n.includes('imov')) return 'perder semanas filtrando opções ruins'
  if (n.includes('arquit')) return 'trabalhar com clientes que não entendem o valor'
  return 'depender de indicação'
}

function generateReferences(dir, m, refs) {
  const content = `# Referências — ${m.nome}

> Regra: 3 referências obrigatórias por missão.
> Não copiar literalmente — usar como orientação de decisão.

---

## Referência 1 — ${refs[0].nome}
${refs[0].url ? `**URL:** ${refs[0].url}` : ''}
**Categoria:** ${refs[0].categoria}

**O que aproveitar:**
${refs[0].o_que_aproveitar.map(i => `- ${i}`).join('\n')}

---

## Referência 2 — ${refs[1].nome}
${refs[1].url ? `**URL:** ${refs[1].url}` : ''}
**Categoria:** ${refs[1].categoria}

**O que aproveitar:**
${refs[1].o_que_aproveitar.map(i => `- ${i}`).join('\n')}

---

## Referência 3 — ${refs[2].nome}
${refs[2].url ? `**URL:** ${refs[2].url}` : ''}
**Categoria:** ${refs[2].categoria}

**O que aproveitar:**
${refs[2].o_que_aproveitar.map(i => `- ${i}`).join('\n')}
`
  fs.writeFileSync(path.join(dir, 'references.md'), content)
}

function generateCopy(dir, m) {
  const desejo = extractDesejo(m.objetivo)
  const frustracao = extractFrustracao(m.nicho)
  const content = `# Copy Strategy — ${m.empresa}

## Big Idea

${m.empresa} resolve um problema específico que o cliente já sente — mas não consegue nomear.

## Promessa Central

> "${m.empresa}: ${m.nicho} para quem quer ${desejo} sem ${frustracao}."

## Headline (Hero)

**Opção A (direto):**
"${desejo.charAt(0).toUpperCase() + desejo.slice(1)} — sem ${frustracao}."

**Opção B (transformação):**
"O que muda quando você para de depender de indicação."

**Opção C (específico):**
"${m.nicho} em ${m.cidade || 'sua cidade'} que entende o que você realmente precisa."

## Subheadline

"${m.empresa} foi criada para quem já cansou de ${frustracao} e quer ${desejo} de forma previsível."

## Argumento Principal

${m.oferta}

## CTA Principal

"${m.objetivo.includes('WhatsApp') ? 'Falar no WhatsApp' : m.objetivo.includes('agenda') ? 'Agendar agora' : 'Entrar em contato'}"

## CTA Secundário

"Ver como funciona"

## Seções narrativas

1. **O problema** — Nomear a dor real do público
2. **A solução** — Como ${m.empresa} resolve diferente
3. **Serviços** — Poucos cards, sem excesso
4. **Diferenciais** — Provas de confiança
5. **Processo** — Como funciona em 3 passos
6. **Prova social** — Depoimentos específicos
7. **FAQ** — Objeções reais respondidas
8. **CTA final** — ${m.objetivo}

## Microcopy de botões

- Principal: "${m.objetivo.includes('WhatsApp') ? 'Falar agora' : 'Começar agora'}"
- Secundário: "Ver como funciona"
- FAQ: "Tenho mais dúvidas"
- Footer: "Conversar pelo WhatsApp"

## O que evitar

- "Excelência e qualidade"
- "Soluções completas"
- "Atendimento personalizado"
- "Somos referência no mercado"
- Qualquer frase que poderia ser de qualquer empresa do setor
`
  fs.writeFileSync(path.join(dir, 'copy.md'), content)
}

function generateStructure(dir, m) {
  const content = `# Page Structure — ${m.empresa}

## Tipo: One-page Premium (Prospecção)

---

### Seção 1 — Hero (Above the fold)

- **Headline:** Específica ao nicho + promessa central
- **Subheadline:** Qualifica o público e o problema
- **CTA principal:** Botão destacado (${m.objetivo.includes('WhatsApp') ? 'WhatsApp' : 'formulário'})
- **CTA secundário:** "Ver como funciona"
- **Visual:** Imagem de impacto ou abstração premium

**Gate:** O hero prende em menos de 3 segundos?

---

### Seção 2 — Problema / Desejo

- Nomear a dor real do público
- Validar que o cliente reconhece a situação
- Criar tensão antes de apresentar a solução

---

### Seção 3 — Solução

- Como ${m.empresa} resolve diferente
- Diferencial claro, não genérico
- Linguagem do cliente, não da empresa

---

### Seção 4 — Serviços / Ofertas

- Máximo 4 cards
- Cada card: nome + benefício + CTA
- Sem excesso de features

---

### Seção 5 — Diferenciais

- 3 provas de confiança (específicas)
- Números reais ou estimativas honestas
- Motion: count-up nos números

---

### Seção 6 — Processo (Como funciona)

- 3 passos simples
- Sticky story scroll ou timeline
- Reduzir fricção mental

---

### Seção 7 — Prova Social

- Depoimentos com nome + foto (ou placeholder controlado)
- Resultados específicos

---

### Seção 8 — FAQ

- 4-6 objeções reais respondidas
- Tom direto, sem enrolação

---

### Seção 9 — CTA Final

- Repetição do CTA principal
- Urgência contextual (não artificial)
- ${m.objetivo}
`
  fs.writeFileSync(path.join(dir, 'structure.md'), content)
}

function generateMotion(dir, m) {
  const content = `# Motion Direction — ${m.empresa}

## Padrões Aplicados

### MOTION_01 — Hero Split Reveal
**Onde:** Hero section
**Como:** Headline entra em 3 camadas (0ms, 120ms, 240ms). Imagem sobe com 400ms de atraso.
**Easing:** cubic-bezier(0.16, 1, 0.3, 1)

### MOTION_02 — Cards Staggered
**Onde:** Serviços, diferenciais
**Como:** Cards entram com 80ms de intervalo
**Trigger:** Intersection Observer

### MOTION_04 — Metrics Count Up
**Onde:** Seção de diferenciais (números)
**Como:** count de 0 até valor em 1.8s
**Trigger:** Viewport entry

### MOTION_05 — CTA Magnetic
**Onde:** Botão de CTA principal
**Como:** Leve translação (max 8px) seguindo o cursor
**Easing:** spring tension: 120, friction: 20

## Regras

- Nenhuma animação dura mais de 0.8s
- Nunca usar linear ou ease-in-out — sempre custom cubic-bezier
- Motion comunica hierarquia, não decoração
- Mobile: reduzir ou eliminar motion complexo

## Anti-Motion

- Fade genérico sem propósito
- Parallax pesado que prejudica legibilidade
- Zoom aleatório
- Loop de animação sem parar
`
  fs.writeFileSync(path.join(dir, 'motion.md'), content)
}

function generateQA(dir, m) {
  const content = `# QA Checklist — ${m.empresa}

Data: ${new Date().toLocaleDateString('pt-BR')}

## Critérios

- [ ] Hero prende atenção em 3 segundos?
- [ ] Headline é específica ao nicho (não genérica)?
- [ ] Copy evita frases genéricas?
- [ ] Visual não parece template?
- [ ] CTA está visível e claro?
- [ ] Visual comunica premium?
- [ ] Motion ajuda a narrativa (não é decoração)?
- [ ] Página carrega rápido (sem JS pesado desnecessário)?
- [ ] Mobile responsivo?
- [ ] Consistência entre nicho, copy e visual?
- [ ] 3 referências foram registradas e aplicadas?
- [ ] Mensagem de abordagem gerada?

## Nota estimada

[ ] Aprovado para prospecção
[ ] Precisa de ajustes (listar abaixo)
[ ] Reprovar — refazer

## Ajustes necessários

_preencher após revisão_
`
  fs.writeFileSync(path.join(dir, 'qa.md'), content)

  // Outreach message
  const outreach = `# Mensagem de Abordagem — ${m.empresa}

## Versão WhatsApp (curta)

"Oi! Vi a presença online de ${m.empresa} e montei uma versão conceito do site com uma abordagem mais premium, focada em gerar mais ${extractDesejo(m.objetivo)}. Fiz só para você ver o potencial. Posso te mandar o preview?"

## Versão DM Instagram (mais curta)

"Oi! Criei uma versão premium do site da ${m.empresa} só para mostrar o potencial. Posso te mandar?"

## Versão E-mail (formal)

Assunto: Site conceito — ${m.empresa}

"Olá,

Analisei a presença online de ${m.empresa} e identifiquei oportunidades para tornar o site mais eficiente em ${extractDesejo(m.objetivo)}.

Criei uma versão conceito que demonstra o potencial — sem compromisso.

Posso compartilhar o link?"
`
  fs.writeFileSync(path.join(dir, 'outreach-message.md'), outreach)
}

function generateSite(dir, m, refs) {
  const siteDir = path.join(dir, 'site')
  fs.mkdirSync(siteDir, { recursive: true })

  const templatePath = path.join(__dirname, 'templates', 'site-premium.html')
  let template = fs.readFileSync(templatePath, 'utf-8')

  const desejo = extractDesejo(m.objetivo)
  const frustracao = extractFrustracao(m.nicho)
  const headline = `${m.nicho} para quem quer ${desejo}`
  const subheadline = `${m.empresa} foi criada para quem cansou de ${frustracao} e quer resultados reais.`
  const ctaLabel = m.objetivo.includes('WhatsApp') ? 'Falar no WhatsApp' : m.objetivo.includes('agenda') ? 'Agendar agora' : 'Entrar em contato'
  const whatsapp = 'https://wa.me/5500000000000'

  template = template
    .replaceAll('{{EMPRESA}}', m.empresa)
    .replaceAll('{{NICHO}}', m.nicho)
    .replaceAll('{{CIDADE}}', m.cidade || '')
    .replaceAll('{{HEADLINE}}', headline)
    .replaceAll('{{SUBHEADLINE}}', subheadline)
    .replaceAll('{{OFERTA}}', m.oferta)
    .replaceAll('{{PUBLICO}}', m.publico)
    .replaceAll('{{CTA_LABEL}}', ctaLabel)
    .replaceAll('{{WHATSAPP_URL}}', whatsapp)
    .replaceAll('{{REF1}}', refs[0].nome)
    .replaceAll('{{REF2}}', refs[1].nome)
    .replaceAll('{{REF3}}', refs[2].nome)

  fs.writeFileSync(path.join(siteDir, 'index.html'), template)
}

// ── start ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  MarketingOS API → http://localhost:${PORT}\n`)
})
