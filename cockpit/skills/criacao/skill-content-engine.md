---
name: skill-content-engine
version: "1.0"
group: criacao
command: /criar com-motor
inputs:
  required: [client.md, brand-kit.json, estrategia.md]
  optional: [alma.md, manifesto.md, intelligence/benchmarks.json]
env:
  optional: [SOCIAL_AGENT_URL, SOCIAL_AGENT_PORT]
---

# skill-content-engine.md - Motor Social de Conteudo

> ⚠️ **DEPRECADA (2026-06-11).** O repo `social-content-agents` pivotou para
> Reference Library — o motor Python (agents, workflows, API local) foi removido
> do upstream. O codigo antigo sobrevive apenas na branch `legacy-content-engine`
> do repo local. Para consultar referencias, usar `workflows/reference-library.md`.
> Esta skill nao deve ser executada ate ser reescrita ou removida.

> Skill ponte entre MarketingOS e `social-content-agents`.
> Use quando a execucao precisar de pipeline automatizado, API local, HTML/PNG,
> status de imagens externas ou aprendizado por metricas.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - nome, nicho, persona, tom, restricoes
- `brand-kit.json` - paleta, tipografia, estilo visual
- `estrategia.md` - foco atual e objetivo da campanha
- `intelligence/benchmarks.json` - somente o bloco do formato/canal em jogo

Nao carregar:
- `metrics.json`, exceto se o objetivo for aprendizado/performance
- `campaigns.md`, exceto se for publicar ou registrar campanha
- arquivos Python do motor, exceto para depurar erro real
- README inteiro do `social-content-agents`

---

## Papel desta skill

Esta skill nao substitui as skills criativas. Ela executa uma decisao ja tomada.

Ordem correta:
1. `skill-criatividade.md` define verdade humana, se ainda nao existe.
2. `skill-niche-intelligence.md` define mapa de nicho/angulo, se necessario.
3. Esta skill monta o brief e chama o motor.
4. `skill-prompt-engineer.md` decide imagem externa quando o pipeline pausar.
5. `skill-publicar.md` revisa e publica somente com aprovacao.

---

## Comandos oficiais

Preferir API local:

```bash
npm run motor:start
npm run criar-conteudo -- <slug> --objetivo=autoridade --plataforma=instagram --tema="..." --format=1:1
```

Para simular sem gastar tokens no motor:

```bash
npm run criar-conteudo -- <slug> --objetivo=autoridade --plataforma=instagram --tema="..." --format=1:1 --dry-run
```

Se o motor pedir imagem externa:

```bash
npm run upload-image -- --content <content_id> --slide <N> --file <caminho>
```

Depois de publicar e coletar metricas:

```bash
npm run aprender -- --slug <slug> --min-age-hours 48
```

---

## Contrato de brief

O brief deve nascer de `scripts/integration/brief-builder.js`.

Campos que o motor deve respeitar:
- `client_slug`
- `nicho`
- `plataforma`
- `objetivo`
- `tema`
- `format`
- `contexto_cliente`
- `visual`
- `sistema_filosofia`
- `benchmarks`
- `estrategia_atual`

Se faltar `contexto_cliente`, gerar copy apenas.
Se faltar `visual`, nao gerar HTML/PNG.
Se faltar `tema`, o motor pode sugerir tema, mas deve registrar que foi inferido.

---

## Regra de output

Todo resultado final pertence ao MarketingOS:

```text
clients/[slug]/outputs/posts/[YYYY-MM-DD]-[tema]/
  brief.json
  content-response.json
  slide-*.html
  slide-*.png
  status.json
```

O diretorio `tmp/` do motor e area transitoria. Nao e fonte de verdade.

---

## Qualidade minima antes de entregar

Verificar:
- O gancho conversa com os 15%.
- A prova sustenta os 85%.
- O tom respeita `client.md`.
- O visual respeita `brand-kit.json`.
- O output foi salvo em `clients/[slug]/outputs/`.
- Nenhuma publicacao foi feita sem `skill-publicar.md`.

---

## Economia de tokens

Nao ler o codigo do motor para usar o motor.
Ler o codigo somente quando:
- comando falhar;
- resposta da API vier inconsistente;
- for necessario alterar o motor;
- um teste apontar bug.

Para operacao normal, usar apenas esta skill, o brief e a resposta JSON.

