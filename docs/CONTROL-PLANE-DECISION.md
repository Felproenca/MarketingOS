# Decisão arquitetural: control plane canônico

## Decisão

O Supabase é a fonte de verdade comercial e operacional para:

- tenants, clientes e memberships;
- `work_requests`, `media_jobs` e `ai_runs`;
- artifacts, versões, QA e aprovações;
- conexões, eventos e auditoria.

O EcosystemCore continua sendo a camada de contratos e bridges entre
MarketingOS, FluxOS, DesingOS, EditorOS e MediaOS. Seu SQLite, mailbox e
work-orders são runtime de contratos, projeção local e transporte idempotente;
não são uma segunda fonte de estado comercial.

## Cadeia canônica

```text
Supabase work_request
  -> Supabase media_job
  -> bridge/contrato EcosystemCore
  -> executor nativo do OS
  -> artifact_manifest + quality_report
  -> Supabase artifact/version/approval
```

O primeiro bridge executável já está disponível:

```text
EcosystemCore native-execute
  -> FluxOS work-order
  -> content-package.json
  -> mailbox DesingOS/EditorOS
```

O caso real `ops-bruno-capelli-20260817t020456981z` foi executado duas vezes;
a segunda execução foi idempotente (`reused`).

## Próxima obrigação técnica

DesingOS e EditorOS ainda precisam consumir seus intakes autonomamente e
devolver `artifact_manifest` e `quality_report`. Enquanto isso não ocorrer,
materializar work-order não deve ser reportado como execução completa.
