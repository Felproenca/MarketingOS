---
name: skill-prospecting-agent
version: "1.0"
group: aquisicao
command: /prospectar agent
inputs:
  required: [agency/icp.md]
  optional: [agency/strategy.md, intelligence/market-opportunities.md]
env: []
---

# skill-prospecting-agent.md - Prospecting Agent como Skill
> Converte o `ProspectingAgent` em skill de qualificacao e priorizacao.
> Use para encontrar segmentos, dores, sinais de compra e mensagens iniciais.

---

## Contexto minimo necessario

Carregar apenas:
- `agency/icp.md` ou `clients/[slug]/client.md`, conforme operacao
- `agency/strategy.md` - se prospectar para o MarketingOS
- `intelligence/market-opportunities.md` - somente o nicho em questao

Nao carregar:
- outputs antigos de outros clientes
- metricas de clientes nao relacionados
- scripts de scraper, exceto para executar ou depurar

---

## Saida obrigatoria

```text
Segmento:
Sinal de dor:
Sinal de compra:
Prioridade: alta | media | baixa
Canal recomendado:
Mensagem inicial:
Risco/observacao:
Proximo passo:
```

---

## Regras

- Qualificar antes de abordar.
- Nao misturar contexto entre clientes.
- Mensagem deve falar do medo/desejo do lead, nao do servico.
- Se usar scraper, iniciar por dry-run.

```bash
npm run scraper:dry -- "<query>" --max=10 --score=6
```

