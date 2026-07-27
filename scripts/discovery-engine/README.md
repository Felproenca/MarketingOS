# Discovery Engine

Motor genérico de descoberta e qualificação de leads B2B, niche-agnostic,
construído sobre fontes públicas e compliant. Origem: `discovery-engine-spec.md`
(Felipe, 2026-07-13), implementado no mesmo dia com uma correção de
arquitetura registrada abaixo.

## Fora de escopo, por design

Extração de contatos de grupos fechados (WhatsApp, Facebook, LinkedIn,
Instagram), scraping de perfis pessoais, automação de InMail em massa. O motor
só toca dado que a fonte publicou intencionalmente para contato (site
institucional, Google Places/GMB, CNPJ ativo na Receita).

## Correção de arquitetura vs. spec original (2026-07-13)

O spec descrevia a Etapa 1 (Discovery) como busca por CNAE+UF via
BrasilAPI/Minha Receita/ReceitaWS. Testado empiricamente: essas três APIs só
fazem lookup de **um CNPJ já conhecido** (`GET /cnpj/v1/{cnpj}` → 200;
tentativa de filtro por CNAE+UF → 404). Não existe busca em massa nelas.

Pipeline real implementado:

```
discovery-places.js (Google Places Text Search — busca de verdade)
        → enrichment-website.js (site institucional, respeita robots.txt)
        → enrichment-cnpj.js (BrasilAPI/ReceitaWS — valida CNPJ achado no site)
        → qualification-scorer.js (config-driven, lê niche_profile)
        → contact-router.js (human-in-the-loop, nunca envia sozinho)
```

`discovery-cnae-bulk.js` fica como stub documentado para quando os **Dados
Abertos CNPJ da Receita Federal** (arquivo bruto, filtrável por CNAE de
verdade) forem baixados e indexados localmente — é a fonte tecnicamente mais
fiel ao spec original, mas pesada demais (vários GB) pra conectar numa sessão
de agente.

## Uso

```bash
# 1. Descobrir, enriquecer, qualificar, rotear (nada é enviado)
node scripts/discovery-engine/index.js --niche=corban_2026 --max=20

# 2. Gerar rascunho de mensagem (WhatsApp + LinkedIn) pros leads pending_approval
node scripts/discovery-engine/prepare-outreach.js --niche=corban_2026

# 3. Revisar agency/discovery-leads/corban_2026.json, marcar approved:true
#    nos leads que quer contatar por WhatsApp (LinkedIn é sempre manual)

# 4. Enviar (só WhatsApp, só quem tem approved:true)
node scripts/discovery-engine/send-approved.js --niche=corban_2026 --dry-run
node scripts/discovery-engine/send-approved.js --niche=corban_2026
```

Requer `GOOGLE_PLACES_API_KEY` no `.env` (gratuito até a cota do Google Cloud;
exige billing habilitado no projeto mesmo pra usar a cota grátis — sem isso dá
`REQUEST_DENIED`). Sem a chave, o discovery é pulado com aviso — não trava o
sistema.

Envio real de WhatsApp usa sessão própria (`.whatsapp-session-discovery-engine`,
separada do scraper legado — decisão do Felipe 2026-07-13) e teto diário
independente (`lib/guard.js`, `DISCOVERY_WHATSAPP_DAILY_CAP` no `.env`, padrão 25).

**LinkedIn nunca é enviado por automação.** `modules/outreach-linkedin.js` só
formata o draft pra cópia manual — não existe (e não deve existir) uma função
de envio ali. Ver `niche_profile.contact_channels` e `compliance.excluded_sources`.

**A oferta/copy real ainda não está definida.** `message-builder.js` gera
mensagens marcadas `[RASCUNHO — oferta ainda não definida, não enviar como
está]` — `send-approved.js` recusa enviar qualquer lead com
`is_placeholder_message: true`, mesmo que esteja `approved:true`. Isso é
intencional: trava de segurança até a oferta de CORBAN ser desenhada (ver
`skills/aquisicao/skill-offer-positioning.md`).

## Estrutura

```
schemas/niche-profile.schema.json   — contrato formal de um niche_profile
niche-profiles/corban-2026.json     — primeira instância de produção
lib/store.js                        — dedupe por CNPJ/domain/place_id, por nicho
                                       (cross-check com scripts/pipeline/store.js
                                       pra nunca contatar duas vezes)
lib/guard.js                        — anti-ban do Discovery Engine (sessão própria)
modules/discovery-places.js         — Etapa 1 real (Google Places)
modules/discovery-cnae-bulk.js      — Etapa 1 alternativa (stub, Dados Abertos)
modules/enrichment-website.js       — Etapa 3 (site institucional)
modules/enrichment-cnpj.js          — Etapa 2/3 (validação BrasilAPI/ReceitaWS,
                                       com validação de dígito verificador —
                                       ver nota de bug corrigido abaixo)
modules/qualification-scorer.js     — Etapa 4 (score 0-100 + tier A/B/C)
modules/contact-router.js           — Etapa 5 (fila pending_approval)
modules/message-builder.js          — rascunho de mensagem (placeholder — ver acima)
modules/outreach-whatsapp.js        — envio real de WhatsApp (sessão própria)
modules/outreach-linkedin.js        — draft-only, NUNCA envia
index.js                            — CLI orquestrador (discovery → routing)
prepare-outreach.js                 — CLI (gera drafts)
send-approved.js                    — CLI (envia só WhatsApp aprovado)
```

## Bugs encontrados e corrigidos em teste funcional (2026-07-13)

- **BrasilAPI/ReceitaWS retornam 403 sem User-Agent** (Cloudflare) — o `fetch`
  nativo do Node não manda um por padrão. Corrigido em `enrichment-cnpj.js`.
- **Regex de CNPJ não validava dígito verificador** — aceitava qualquer
  sequência de 14 dígitos no formato certo, mesmo inválida (achado num site
  real). Corrigido com validação de checksum (módulo 11) antes de consultar.

## Adicionar um novo nicho

1. Criar `niche-profiles/<slug>.json` seguindo `schemas/niche-profile.schema.json`
2. Preencher `discovery.google_places_categories` com termos de busca reais
3. Ajustar `qualification.signals` — os 4 sinais padrão (`cnpj_ativo_tempo`,
   `presenca_digital`, `volume_operacao_aparente`, `situacao_cadastral`) já
   têm extractor pronto em `qualification-scorer.js`; um sinal novo precisa de
   um extractor novo lá (`SIGNAL_EXTRACTORS`) ou é ignorado com aviso
4. Rodar: `node scripts/discovery-engine/index.js --niche=<slug>`

## Estado

`status: draft` em `corban-2026.json` — CNAEs a validar com query real na
BrasilAPI antes de travar a lista final (CNAE de CORBAN varia entre PJ pequeno
e médio, conforme o spec original já apontava).
