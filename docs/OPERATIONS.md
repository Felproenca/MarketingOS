# MarketingOS — Operations

## Fluxo operacional principal

1. Felipe seleciona um cliente ou prospecto.
2. Cria uma solicitação com objetivo, tipo, referência e critérios de aceitação.
3. MarketingOS cria o contexto e o AI Router resolve a estratégia de execução.
4. MediaOS cria e acompanha o job.
5. O executor produz uma ou mais versões de artifact.
6. QA marca problemas técnicos ou criativos.
7. Felipe revisa e aprova, pede ajustes ou arquiva.
8. O cliente visualiza o resultado aprovado e decide quando houver aprovação externa.
9. FluxOS publica apenas quando houver autorização.
10. Métricas retornam ao cliente e ao contexto do MarketingOS.

## Estados mínimos

```text
queued → running → review → approved → delivered
                    ↘ blocked
                    ↘ error → retry
```

## Regra de segurança

Tokens, API keys e credenciais de assinatura nunca são enviados ao browser. O operador pode administrar conexões, mas cada uso precisa registrar cliente, provedor, escopo e custo.
