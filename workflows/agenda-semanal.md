# agenda-semanal.md - Rotina de Agenda de Conteudo
> Comando: `/agenda`
> Cliente padrao: `felipe-proenca`
> Objetivo: operar o loop planejar -> rascunhar -> preparar -> publicar com OK -> medir -> aprender.

---

## Principio

A Agenda nao existe para produzir volume.
Ela existe para tornar aquisicao mais observavel, ajustavel e previsivel pelo conteudo.

Nada publica sozinho.
O sistema pode planejar, rascunhar e preparar. Publicacao real exige confirmacao humana.

## Pre-requisitos

- Ler `manifesto.md`, `alma.md`, `virada-aquisicao.md`, `CLAUDE.md`.
- Ler `intelligence/doutrina-instagram-operacao.md` — ciclo semanal, funcoes no funil, dominio privado, save/share/DM gate e handoff.
- Consultar `skills/funnel-strategy/SKILL.md` e `platform-playbooks/instagram.md` para Funnel Metadata da semana.
- Abrir `clients/felipe-proenca/client.md` (ou o slug ativo).
- Ler `clients/felipe-proenca/brand-brief.md` quando o cliente for o Felipe.
- Se `brand-brief.md` estiver pendente, usar apenas como direcao provisoria e pedir validacao antes de conteudo sensivel.

## Fonte de verdade

`clients/felipe-proenca/agenda.json`

Status permitidos:

- `planned`
- `drafted`
- `prepared`
- `published`
- `measured`

## Etapa 1 - Medir

Rodar, quando houver token Meta valido:

```bash
npm run insights -- --slug felipe-proenca
npm run insights:aquisicao -- --slug felipe-proenca
```

Sem token ou sem dado real: registrar lacuna. Nao estimar performance.

## Etapa 2 - Aprender

Ler `metrics.json`, `published.json` e os itens medidos da agenda.

Perguntas:

- Qual bucket gerou conversa?
- Qual formato gerou alcance util?
- Qual tema trouxe sinal comercial?
- O que deve ser repetido, cortado ou aprofundado?
- Save rate / share rate / dm_start_rate subiram em qual formato?
- Origin tag coverage: quantos leads da semana tem origem rastreavel?
- Join rate de dominio privado (Broadcast, Close Friends, lista WA, e-mail)?

## Etapa 3 - Planejar

Gerar a semana:

```bash
npm run agenda:plan -- --slug felipe-proenca
```

Pelo Cockpit:

```text
Agenda -> Planejar semana
```

Distribuicao padrao: 70% universal, 20% build in public, 10% caso.

Ciclo semanal de referencia (`doutrina-instagram-operacao.md`) — funcoes, nao templates:

| Dia | Funcao |
|---|---|
| Segunda | diagnostico / opiniao (autoridade + identificacao) |
| Terca | educacao aplicada |
| Quarta | prova / caso real |
| Quinta | bastidor |
| Sexta | oferta |
| Sabado | lifestyle / produto / comunidade |
| Domingo | leve / interacao |

Uma ideia central por semana gera derivados (Reels, carrossel, posts, stories) — nao dez ideias soltas.
Toda peca de descoberta declara entrada no dominio privado + handoff WhatsApp/DM.

## Etapa 4 - Rascunhar

Para cada item `planned`, escolher a skill adequada:

- carrossel: `skills/criacao/skill-carousel.md`
- reel: `skills/criacao/skill-reel-builder.md` ou `skill-reels.md`
- post: `skills/criacao/skill-post.md`
- conteudo integrado: `skills/criacao/skill-social-content-agent.md`

Todo rascunho deve herdar `brand-brief.md`, a doutrina de Instagram e o Funnel Metadata
(base + campos de canal: discovery, conversion, trigger, first response asset, origin tag).

Gate antes de marcar `drafted`:

- [ ] Funcao no funil declarada
- [ ] Motivo de SAVE, SHARE ou DM
- [ ] CTA de dominio privado (se descoberta)
- [ ] Handoff + origin tag
- [ ] Keyword/SEO nativo minimo na caption (linha 1)

Atualizar o item:

- `hook`
- `caption`
- `draftPath`
- `status: drafted`

## Etapa 5 - Preparar

Renderizar arquivos finais com os pipelines existentes.
Quando o pacote estiver pronto para o publisher:

- preencher `draftPath` ou `files`
- conferir `caption`
- marcar `status: prepared`

No Cockpit: `Agenda -> Editar -> Preparar`.

## Etapa 6 - Publicar com OK humano

Validacao sem publicar:

```text
Agenda -> Validar envio
```

Isso chama o publisher em `--dry-run`.

Publicacao real exige confirmacao `PUBLICAR` no endpoint ou comando manual:

```bash
npm run publicar -- --slug felipe-proenca --file <arquivo> --caption "<caption>" --format <feed|carousel|reel>
```

Depois de publicar, registrar:

- `status: published`
- `publishedAt`
- `postId`, se houver
- decisao em `campaigns.md`

## Etapa 7 - Fechar loop

Apos 48h:

```bash
npm run insights -- --slug felipe-proenca --min-age-hours 48
npm run insights:aquisicao -- --slug felipe-proenca
```

Atualizar item para `measured` quando houver metrica real.

## Saida esperada

Uma semana de conteudo planejada, rascunhada e preparada para OK.
O Felipe ve o calendario no Cockpit, valida o pacote e publica manualmente.

## Fechamento operacional atual

Status: operacional manual no Cockpit.

- `w25-01` foi publicado e registrado.
- Proximos itens ficam `planned` ate rascunho/preparo.
- `GET /api/agenda/status` resume semana, contagem por status, proximos itens e bloqueios de caption/arquivo.
- Cron `/schedule` em nuvem nao fica ativo nesta fase; a rotina e assistida pelo Cockpit.
- Publicacao automatica continua proibida: item real exige confirmacao `PUBLICAR`.
