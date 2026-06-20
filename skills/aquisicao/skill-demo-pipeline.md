---
name: skill-demo-pipeline
version: "1.0"
group: aquisicao
command: /demo
inputs:
  required: []
  optional: [client.md, intelligence/benchmarks.json]
env: []
---

# skill-demo-pipeline.md — Gerador de Demo Comercial Automatizada
> Skill isolada do MarketingOS.
> Execute quando precisar gerar uma demo personalizada para um lead/prospecto.
> Output: diagnóstico HTML + mensagem WhatsApp pronta para envio.

---

## Contexto mínimo necessário
→ intelligence/benchmarks.json — benchmarks do nicho para calibrar diagnóstico
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, alma.md, notes.md, estrategia.md

---

## Objetivo

Gerar uma demonstração comercial automatizada que prova valor antes da contratação:
1. Buscar empresa pelo Google Maps
2. Extrair dados da marca (cores, logo, presença digital)
3. Gerar diagnóstico personalizado (HTML interativo)
4. Gerar mensagem WhatsApp pronta para envio
5. Opcionalmente: enviar via WhatsApp (se configurado)

---

## Input Esperado

```
1. Query         → termo de busca (ex: "clínica estética", "escritório advocacia")
2. Cidade        → cidade-alvo (ex: "São Paulo", "Rio de Janeiro")
3. Segmento      → tipo de negócio (ex: clinica, b2b, ecom, restaurante)
4. Máximo        → número de leads para processar (padrão: 3)
5. Modo          → [ --dry-run | --only-demo | --channels whatsapp ]
```

---

## Modos de operação

```
Modo A — Busca por query
  Comando: /demo query:"clínica estética" city:"São Paulo" segment:clinica max:3
  O sistema busca no Google Maps e gera demos para os resultados

Modo B — URL direta
  Comando: /demo url:"https://www.empresa.com.br" segment:clinica
  O sistema analisa o site diretamente sem busca

Modo C — Dry-run
  Comando: /demo query:"clínica estética" city:"São Paulo" segment:clinica --dry-run
  Mostra o que seria gerado sem gastar tokens nem enviar mensagens

Modo D — Só demo (sem envio)
  Comando: /demo query:"clínica estética" city:"São Paulo" segment:clinica --only-demo
  Gera o diagnóstico HTML mas não gera mensagem WhatsApp
```

---

## Protocolo de Execução

### Passo 1 — Buscar empresas

```bash
node scripts/demo-pipeline/index.js \
  --query "[query]" \
  --city "[cidade]" \
  --segment [segmento] \
  --max [n] \
  [--only-demo] \
  [--dry-run] \
  [--channels whatsapp]
```

**Segmentos disponíveis:** clinica, b2b, ecom, restaurante, salon, gym, education

### Passo 2 — Analisar resultados

O script retorna:
- Lista de empresas encontradas (nome, endereço, avaliação, URL)
- Para cada uma: diagnóstico + mensagem WhatsApp gerada

Apresente ao usuário:

```
🔍 [N] empresas encontradas em [cidade]:

1. [Nome] — ⭐ [rating] — [endereço]
   → [1 linha do diagnóstico]

2. [Nome] — ⭐ [rating] — [endereço]
   → [1 linha do diagnóstico]

...
```

### Passo 3 — Selecionar para demo

Pergunte ao usuário qual(is) empresa(s) gerar demo completa.

### Passo 4 — Gerar demo individual (via URL)

Para cada empresa selecionada:

```bash
node scripts/demo-pipeline/from-url.js \
  --url "[url_da_empresa]" \
  --segment [segmento] \
  [--dry-run]
```

### Passo 5 — Apresentar diagnóstico

O diagnóstico HTML é gerado em `agency/demos/[nome-empresa]/`.

Apresente ao usuário:
- Resumo do diagnóstico (3-5 linhas)
- O que seria melhorado com o MarketingOS
- Link do HTML interativo (se disponível)

### Passo 6 — Enviar mensagem (se aprovado)

Se o usuário aprovar e `--channels whatsapp` estiver ativo:

```bash
node scripts/demo-pipeline/index.js \
  --query "[query]" \
  --city "[cidade]" \
  --segment [segmento] \
  --max 1 \
  --channels whatsapp
```

---

## Checkpoints

⏸ **CP1 — Lista de leads**
Busca concluída → apresentar ranking de empresas encontradas antes de gerar demos individuais.

⏸ **CP2 — Aprovação de envio**
Diagnóstico gerado → apresentar resumo e mensagem WhatsApp para aprovação antes de enviar.

---

## Output esperado

```
✅ Demo Pipeline — [N] leads processados

Diagnósticos gerados:
  → agency/demos/[empresa-1]/diagnostico.html
  → agency/demos/[empresa-2]/diagnostico.html

Mensagens WhatsApp:
  → [empresa-1]: [resumo da mensagem]
  → [empresa-2]: [resumo da mensagem]

Enviados: [N] | Pendentes: [N]
```

---

## Regras

1. **Nunca enviar WhatsApp sem aprovação explícita** — CP2 é obrigatório
2. **Dry-run primeiro** — sempre mostrar o que seria feito antes de executar
3. **Segmento correto** — o template de diagnóstico varia por segmento
4. **Máximo 10 leads por rodada** — qualidade supera volume
5. **Diagnóstico baseado em dados reais** — não especular sobre o que não dá para ver
6. **Registrar em runs.md** — toda demo gerada deve ser registrada

---

## Checklist antes de entregar

- [ ] Busca retornou resultados reais (não inventados)?
- [ ] Diagnóstico é específico para cada empresa?
- [ ] Mensagem WhatsApp personalizada (não genérica)?
- [ ] HTML do diagnóstico abre sem erros?
- [ ] Usuário aprovou antes de enviar?
- [ ] Output salvo em agency/demos/?

---

## Exemplo de Ativação

```
/demo query:"clínica estética" city:"São Paulo" segment:clinica max:3
/demo url:"https://www.brunocapelli.com.br/" segment:clinica
/demo query:"escritório advocacia" city:"Rio de Janeiro" segment:b2b --dry-run
```

---

*Skill v1.0 — MarketingOS*
*Wrapper do demo-pipeline para geração automatizada de demos comerciais*
