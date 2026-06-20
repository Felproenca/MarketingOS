# /repositorios - Repositorios Externos do MarketingOS

> Status: comando operacional.
> Funcao: mostrar quais repositorios externos alimentam o MarketingOS e como cada um deve ser usado.
> Regra: repositorio externo e repertorio ou infraestrutura. Nunca vira verdade final nem copia em bloco.

Aliases:

```text
/repositorios
/repositórios
\repositorios
\repositórios
```

---

## Principio

O MarketingOS usa repositorios externos em dois modos:

```text
1. Repertorio filtrado
   -> entra em intelligence/repertoire-updaters
   -> atualiza metodo, padroes e oportunidades
   -> nunca copia linguagem generica

2. Infraestrutura conectada
   -> entra em external/
   -> vira dependencia/submodule ou motor operacional
   -> so e usado quando fortalece o fluxo real
```

---

## Repositorios de Repertorio

Esses quatro sao atualizados pelos repertoire updaters:

| Repositorio | Papel | Onde consultar |
|---|---|---|
| `coreyhaines31/marketingskills` | CRO, copywriting, paid ads, SEO/AEO, analytics, prospecting, RevOps, retention | `intelligence/repertoire-updaters/marketingskills.md` |
| `zubair-trabzada/ai-marketing-claude` | auditoria, proposta, landing CRO, competitor scan, relatorio | `intelligence/repertoire-updaters/ai-marketing-claude.md` |
| `alirezarezvani/claude-skills` | governanca, autoria de skill, multiagentes, business ops | `intelligence/repertoire-updaters/claude-skills.md` |
| `BrianRWagner/ai-marketing-claude-code-skills` | voz, autoridade, pesquisa, social proof, outreach | `intelligence/repertoire-updaters/ai-marketing-claude-code-skills.md` |

Rodar atualizacao geral:

```bash
npm.cmd run repertoire:update
```

Depois filtrar aquisicao:

```bash
npm.cmd run repertoire:acquisition
```

No PowerShell, usar `npm.cmd` se `npm` for bloqueado por execution policy.

---

## Repositorios Conectados

| Caminho | Origem | Papel |
|---|---|---|
| `external/hyperframes` | `https://github.com/heygen-com/hyperframes` | Motor premium de video programavel: HTML/CSS/GSAP/Anime.js/Canvas/FFmpeg |

Atualizar submodules apos clone:

```bash
git submodule update --init --recursive
```

Ver status:

```bash
git submodule status
```

---

## Skills Instaladas de HyperFrames

As skills do HyperFrames estao em:

```text
.agents/skills/
skills-lock.json
```

Verificar:

```bash
npx.cmd skills list --json
```

Reinstalar para Codex:

```bash
npx.cmd skills add heygen-com/hyperframes --agent codex --skill '*' -y
```

---

## Exercitos de IA - Analise dos Links

> Status: URLs reais confirmadas em 2026-06-20.
> Decisao: analisar e adaptar por pecas. Nao instalar/clonar em bloco sem uma demanda operacional clara.

Esses repositorios nao sao "motores de criacao". Eles sao sistemas de operacao para agentes, design, QA, memoria e disciplina de desenvolvimento. O valor para o MarketingOS esta em extrair mecanismos pequenos que melhorem aquisicao, criacao e confiabilidade.

| Prioridade de aplicacao | Repositorio | Funcao real | Melhor encaixe no MarketingOS | Veredito |
|---|---|---|---|---|
| 1 | [`obra/Superpowers`](https://github.com/obra/Superpowers) | Metodologia agentic de especificacao, plano, TDD, simplicidade e auto-revisao | Gate de entrega para dev, site-builder, HyperFrames e Cockpit | Aplicar como workflow, sem instalar agora |
| 2 | [`affaan-m/ecc`](https://github.com/affaan-m/ecc) | Otimizacao de harness: skills, instintos, memoria, seguranca, pesquisa e economia de contexto | Auditoria do proprio MarketingOS: skills, comandos, contexto, segredos, verificacao | Minerar padroes; evitar instalacao total |
| 3 | [`nexu-io/open-design`](https://github.com/nexu-io/open-design) | Workspace agentic de design com plugins, skills e design systems em `DESIGN.md` | Bridge entre `visual-dna.json`, `design-system.json`, Creative OS e HyperFrames | Usar a mecanica de contrato visual, nunca identidade pronta |
| 4 | [`ruvnet/ruflo`](https://github.com/ruvnet/ruflo) | Meta-harness multiagente: swarms, memoria, RAG, federacao, roteamento, seguranca e observabilidade | Arquitetura futura para agentes de aquisicao, follow-up, custos, memoria e testes | Estudar por modulos; grande demais para importar agora |
| 5 | [`multica-ai/andrej-karpathy-skills/CLAUDE.md`](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md) | Regras compactas de comportamento: pensar antes, simplicidade, mudanca cirurgica e verificacao | Gate de concisao para `CLAUDE.md`, workflows e diffs | Aplicar como regua curta, nao como doutrina isolada |

### 1. Superpowers

URL:
`https://github.com/obra/Superpowers`

Funcao:
- transforma "codar logo" em um ciclo: entender intencao, especificar, pedir aprovacao quando necessario, planejar, executar com TDD/QA e revisar;
- valor principal nao e uma skill especifica, e disciplina operacional;
- conversa diretamente com nosso problema recente: deploy quebrado, visual generico, fluxo que funciona mas falta gate antes de sair.

Aplicacao no MarketingOS:
- criar um gate inspirado em Superpowers para tarefas substanciais:
  1. objetivo do usuario;
  2. criterio de sucesso;
  3. menor mudanca possivel;
  4. plano curto;
  5. verificacao real;
  6. auto-review antes do commit.
- usar em `site-builder`, HyperFrames, Cockpit, DM automation e qualquer mudanca com deploy.

Nao fazer:
- nao burocratizar microtarefas;
- nao exigir aprovacao para tudo;
- nao trocar o fluxo vivo do MarketingOS por metodologia de software pura.

### 2. ECC

URL:
`https://github.com/affaan-m/ecc`

Funcao:
- sistema de otimizacao de harness para agentes: skills, instintos, memoria, seguranca, pesquisa, verificacao e uso eficiente de contexto;
- opera em varios ambientes, incluindo Codex;
- e mais proximo de "como manter o operador bom" do que de "como gerar marketing".

Aplicacao no MarketingOS:
- criar uma rotina de auditoria do sistema:
  - skills mortas ou duplicadas;
  - comandos sem documentacao;
  - arquivos pesados demais para contexto;
  - instrucoes redundantes;
  - riscos de segredos/token;
  - lacunas de verificacao;
  - resumo estrategico apos sessoes longas.
- evoluir `workflows/relatorio-sistema.md` e `workflows/token-economy.md` com uma pegada mais operacional.

Nao fazer:
- nao instalar pacote completo junto do que ja existe;
- nao empilhar frameworks de agente sem necessidade;
- nao importar "271 skills" como se volume fosse maturidade.

### 3. Open Design

URL:
`https://github.com/nexu-io/open-design`

Funcao:
- workspace local-first para design agentic;
- organiza plugins, skills e design systems;
- usa `DESIGN.md` como contrato de marca/design;
- cobre prototipos, slides, imagens, videos e HyperFrames.

Aplicacao no MarketingOS:
- criar um `DESIGN.md` por cliente gerado a partir de:
  - `perception.json`;
  - `visual-dna.json`;
  - `design-system.json`;
  - `reference-context.json`;
  - restricoes de alma e anti-DNA.
- esse arquivo vira ponte legivel para site, reel, carrossel, HyperFrames, landing e motion.

Nao fazer:
- nao copiar estetica de design systems famosos;
- nao virar biblioteca de templates;
- toda aplicacao passa pelo Teste Supremo: se remover logo/nome/cores, ainda reconhece a marca?

### 4. Ruflo

URL:
`https://github.com/ruvnet/ruflo`

Funcao:
- meta-harness multiagente para Claude Code/Codex;
- traz swarms, memoria, RAG, federacao, roteamento de modelo, seguranca, testes, browser automation, observabilidade e custo;
- tem plugins pequenos e uma instalacao completa grande.

Aplicacao no MarketingOS:
- estudar por modulos, nesta ordem:
  1. `cost-tracker` / orcamento de tokens;
  2. `goals` / acompanhamento de objetivo;
  3. `rag-memory` / memoria consultavel;
  4. `security-audit` / segredos e PII;
  5. `browser` / QA visual automatizado;
  6. `testgen` / lacunas de teste.
- futuro: agentes de aquisicao/follow-up com memoria e tarefas em background.

Nao fazer:
- nao rodar `init` completo sem branch/teste isolado;
- nao substituir a governanca do MarketingOS;
- nao deixar swarm decidir estrategia sem filtro de aquisicao e alma.

### 5. CLAUDE.md do Karpathy

URL:
`https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md`

Funcao:
- arquivo curto de comportamento para agentes;
- reforca: pensar antes de codar, simplicidade, mudanca cirurgica, criterio de sucesso e verificacao.

Aplicacao no MarketingOS:
- criar um "gate compacto" para desenvolvimento:
  - qual hipotese estou assumindo?
  - qual e a menor mudanca que resolve?
  - que arquivo nao devo tocar?
  - como vou verificar?
  - o diff esta menor do que poderia estar?

Nao fazer:
- nao usar como desculpa para perguntar demais;
- MarketingOS executa com autonomia quando o objetivo esta claro.

---

## Ordem Recomendada de Integracao

1. **Agora:** aplicar gate Superpowers/Karpathy em tarefas de dev relevantes.
2. **Depois:** evoluir `relatorio-sistema` com auditoria ECC: skills, contexto, seguranca e verificacao.
3. **Creative OS:** criar `DESIGN.md` por cliente no padrao Open Design, derivado dos arquivos reais do cliente.
4. **Infra futura:** estudar Ruflo em branch isolada, comecando por custo, goals, memoria, security e browser QA.
5. **So entao:** decidir se algum repo merece virar submodule ou dependencia real.

---

## Regra de Adocao

Antes de aplicar qualquer aprendizado externo:

1. Passar por `manifesto.md` e `alma.md`.
2. Confirmar que aumenta aquisicao, observabilidade ou qualidade real.
3. Registrar em `intelligence/skill-updates.md`.
4. Aplicar em uma skill/workflow por vez.
5. Nunca importar promessa generica, estetica sem alma ou mecanica que nao fecha loop.
