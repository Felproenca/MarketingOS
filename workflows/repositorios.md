# /repositorios — Repositórios Externos do MarketingOS

> Status: comando operacional.
> Função: mostrar quais repositórios externos alimentam o MarketingOS e como cada um deve ser usado.
> Regra: repositório externo é repertório ou infraestrutura. Nunca vira verdade final nem cópia em bloco.

Aliases:

```text
/repositorios
/repositórios
\repositorios
\repositórios
```

---

## Princípio

O MarketingOS usa repositórios externos em dois modos:

```text
1. Repertório filtrado
   → entra em intelligence/repertoire-updaters
   → atualiza método, padrões e oportunidades
   → nunca copia linguagem genérica

2. Infraestrutura conectada
   → entra em external/
   → vira dependência/submodule ou motor operacional
   → só é usado quando fortalece o fluxo real
```

---

## Repositórios de Repertório

Esses quatro são atualizados pelos repertoire updaters:

| Repositório | Papel | Onde consultar |
|---|---|---|
| `coreyhaines31/marketingskills` | CRO, copywriting, paid ads, SEO/AEO, analytics, prospecting, RevOps, retention | `intelligence/repertoire-updaters/marketingskills.md` |
| `zubair-trabzada/ai-marketing-claude` | auditoria, proposta, landing CRO, competitor scan, relatório | `intelligence/repertoire-updaters/ai-marketing-claude.md` |
| `alirezarezvani/claude-skills` | governança, autoria de skill, multiagentes, business ops | `intelligence/repertoire-updaters/claude-skills.md` |
| `BrianRWagner/ai-marketing-claude-code-skills` | voz, autoridade, pesquisa, social proof, outreach | `intelligence/repertoire-updaters/ai-marketing-claude-code-skills.md` |

Rodar atualização geral:

```bash
npm.cmd run repertoire:update
```

Depois filtrar aquisição:

```bash
npm.cmd run repertoire:acquisition
```

No PowerShell, usar `npm.cmd` se `npm` for bloqueado por execution policy.

---

## Repositórios Conectados

| Caminho | Origem | Papel |
|---|---|---|
| `external/hyperframes` | `https://github.com/heygen-com/hyperframes` | Motor premium de vídeo programável: HTML/CSS/GSAP/Anime.js/Canvas/FFmpeg |

Atualizar submodules após clone:

```bash
git submodule update --init --recursive
```

Ver status:

```bash
git submodule status
```

---

## Skills Instaladas de HyperFrames

As skills do HyperFrames estão em:

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

## Exércitos de IA — Candidatos

> Status: guardados como repertório candidato. Nada deve ser clonado sem URL real confirmada.
> Conceito: repositórios Claude Code com múltiplos agentes, skills e recursos interconectados, operando como sistema em vez de agente isolado.

O MarketingOS já opera nessa lógica. A decisão não é "adotar arquitetura", é garimpar peças que tornem aquisição mais observável, ajustável ou previsível.

| Prioridade | Candidato | Papel provável | Veredito |
|---|---|---|---|
| 1 | `Ruflo` / `Ruufflo` | swarm com memória compartilhada, roteamento de modelo por complexidade, segurança contra vazamento de credenciais | Alto: arquitetura futura para Motor de Aquisição/Follow-up |
| 2 | `Superpowers` | metodologia de build com multiagente, auto-revisão de código e ciclos de QA | Alto: incorporar padrão de auto-revisão nos gates de entrega |
| 3 | `Open Design` | design systems, referências HTML e repertório visual | Médio-alto: usar mecânica visual, nunca identidade pronta |
| 4 | `Everything Claude Code` | grande pacote de skills/agentes/comandos, memória, segurança e economia de tokens | Médio: minerar infra, rejeitar marketing genérico |
| 5 | `CLAUDE.md do Karpathy` | filosofia de prompts mínimos e concisão | Princípio: régua para enxugar instruções |

### 1. Ruflo / Ruufflo

O que buscar:
- agentes em paralelo com estado/memória compartilhada;
- roteamento automático de modelo por complexidade;
- camada de segurança para não salvar credenciais;
- padrões transferíveis para Motor de Aquisição e Follow-up.

Filtrar:
- não importar CLAUDE.md gigante;
- pegar mecanismo, não verbosidade;
- adaptar à economia de tokens do MarketingOS.

### 2. Superpowers

O que buscar:
- loop de planejamento, teste, execução e auto-revisão;
- QA antes de entrega;
- detecção de bug visual/UX antes do output sair.

Filtrar:
- é metodologia de software, não doutrina de aquisição;
- adaptar para gates criativos e site-builder.

### 3. Open Design

O que buscar:
- repertório de grid, tipografia, motion, componentes e design systems;
- referências HTML úteis para direção criativa e site-builder.

Filtrar:
- nunca copiar estética de Apple/Stripe/Notion etc.;
- usar como mecânica visual, não como identidade;
- passar por Gate de Referências + Teste Supremo.

### 4. Everything Claude Code

O que buscar:
- memória persistente;
- economia de tokens;
- security scan;
- padrões de organização de skills/agentes.

Filtrar:
- descartar skills de "marketing genérico";
- volume não é valor;
- importar só infra que fecha loop operacional.

### 5. CLAUDE.md do Karpathy

O que buscar:
- concisão;
- clareza de regra;
- prompt mínimo com alto efeito.

Filtrar:
- não é um exército operacional;
- usar como régua para enxugar `CLAUDE.md`, `_admin.md` e workflows.

### Pendências

- [ ] URLs reais do GitHub dos 5 candidatos.
- [ ] Confirmar grafias: `Superpowers`, `Ruflo/Ruufflo`, `Everything Claude Code`, `Open Design`, `CLAUDE.md do Karpathy`.
- [ ] Integrar um por vez, começando por Ruflo ou Superpowers.

---

## Regra de Adoção

Antes de aplicar qualquer aprendizado externo:

1. Passar por `manifesto.md` e `alma.md`.
2. Confirmar que aumenta aquisição, observabilidade ou qualidade real.
3. Registrar em `intelligence/skill-updates.md`.
4. Aplicar em uma skill/workflow por vez.
5. Nunca importar promessa genérica, estética sem alma ou mecânica que não fecha loop.
