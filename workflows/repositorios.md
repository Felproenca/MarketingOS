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

## Regra de Adoção

Antes de aplicar qualquer aprendizado externo:

1. Passar por `manifesto.md` e `alma.md`.
2. Confirmar que aumenta aquisição, observabilidade ou qualidade real.
3. Registrar em `intelligence/skill-updates.md`.
4. Aplicar em uma skill/workflow por vez.
5. Nunca importar promessa genérica, estética sem alma ou mecânica que não fecha loop.
