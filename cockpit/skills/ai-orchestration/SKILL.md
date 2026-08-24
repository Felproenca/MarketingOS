---
name: ai-orchestration
description: Roteia solicitações do MarketingOS por capability, skill, conexão do cliente, provider, orçamento e executor. Use ao decidir qual IA ou pipeline deve processar uma solicitação, ao alternar entre assinaturas/API e ao aplicar fallback sem cruzar dados entre tenants.
---

# Orquestração de IA

Aplicar antes de executar qualquer job de IA. O tenant, o contexto do cliente e a política de custo são obrigatórios.

## Fluxo

1. Identificar `request_type` e converter para uma capability do catálogo.
2. Carregar somente o Client Truth, referências e arquivos do `client_id` do job.
3. Selecionar a skill de domínio e o executor local correspondente.
4. Procurar conexão ativa do mesmo cliente: OAuth, API própria, assinatura assistida ou executor local.
5. Aplicar política `economy`, `balanced` ou `quality`, orçamento e máximo de tentativas.
6. Executar com timeout, retry e idempotência; registrar `ai_run`, provider, modelo e consumo.
7. Validar output, criar artifact/version e encaminhar para aprovação.
8. Sem conexão, saldo ou pré-condição: retornar `prompt_and_upload`; nunca usar credencial de outro cliente.

## Regras

- Não expor API keys no frontend, prompt, artifact ou log.
- Não trocar automaticamente para conexão de outro tenant.
- Não declarar uma skill como executada se apenas produziu contrato ou prompt.
- Usar modelos caros depois de rascunho ou aprovação de custo.
- Preservar job, prompt, contexto e próximo passo no fallback externo.

Usar `cockpit/api/_lib/ai-router.js`, `ai-policy.js`, `scripts/mediaos/ai-runtime.mjs` e `capability-catalog.js`. O resultado termina em `media_jobs`, `ai_runs`, `artifacts` e `artifact_versions`.
