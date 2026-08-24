# Auditoria de implementacao

Estado verificado em 17/08/2026. Este arquivo prevalece sobre descricoes antigas de estado encontradas em documentos historicos.

## Comprovado

| Requisito | Evidencia atual |
|---|---|
| Login de operador e cliente | Supabase Auth, membership guard e redirecionamento por perfil em `cockpit/src/pages/Login.tsx` |
| Refresh e magic link | `cockpit/src/lib/auth.ts`; callback por hash e renovacao de sessao |
| Console operacional | `cockpit/src/pages/Operacao.tsx`; clientes, Client Truth, pedidos, fila, artifacts, retry e revisao |
| Portal do cliente | `cockpit/src/pages/Portal.tsx`; metricas, pedidos, jobs, previews, versoes, QA, aprovacoes e proximos passos |
| Isolamento de cliente | `requireClientAccess` em APIs de insights, ads e artifacts |
| Gate de Client Truth | intake recusa pedido antes de criar job quando onboarding e referencia sao insuficientes |
| Gate de aprovacao | QA precisa estar `passed`; decisao registrada em `artifact_approvals`; publicacao exige artifact aprovado |
| Idempotencia de intake/job | `Idempotency-Key` em `operations.js` e `idempotency_key` em `media_jobs` quando a coluna existe |
| Worker persistente | PM2 + tarefa agendada Windows; logs sem novos erros no ultimo ciclo verificado |
| Outputs validados | E2Es comprovados para carrossel, post, video curto, pesquisa, analise, data sync, estrategia, funil, prospeccao, Ads e automacao |
| Deploy | `https://app.mkos.online`, health HTTP 200, APIs protegidas sem token retornam 401 |

## Parcial ou bloqueado por design

| Capacidade | Estado |
|---|---|
| Video generativo | `contract_only`; bloqueia sem adapter real para nao simular resultado |
| Publicacao externa | executor possui gate e dry-run; publicacao real exige conexao Meta, segredo de servico e validacao externa |
| Carrossel premium | pipeline gera draft e QA; renderer comercial Canva/Figma/template premium ainda e uma camada posterior |
| AI Router externo | capacidades locais usam provider `pipeline`; adapters externos continuam opcionais e dependem de credenciais |

## Dependencia externa — resolvida

O Supabase live agora possui o core MediaOS + hardening completo. A auditoria `npm run live:schema:audit` retorna:

```text
hardeningApplied: true
executionBridgeApplied: true
aiRoutingApplied: true
media_jobs.lease_expires_at: presente
public.claim_media_job: presente
```

O worker opera em fail-closed sem `MEDIAOS_ALLOW_SCHEMA_FALLBACK`, com claim atômico e lease ativos. O modo de compatibilidade continua existindo apenas para emergência controlada e nao deve ser usado em producao.

## Execução do plano do ecossistema

Desde a auditoria original, dois elos da Fase 1 foram executados no
EcosystemCore:

- `src/native-execution.js` executa o work order FluxOS, produz o
  `content-package.json`, roteia o retorno para DesingOS/EditorOS e registra
  lock, auditoria e idempotência;
- `src/performance-learning.js` converte `performance_event` válido em
  `learning_decision` com política e limiar explícitos, roteando a decisão aos
  três consumidores.

O caso real `ops-bruno-capelli-20260817t020456981z` foi executado duas vezes;
na segunda execução as entregas foram identificadas como `reused`.

O restante da Fase 1 ainda não está concluído: DesingOS e EditorOS recebem os
contratos, mas seus `ecosystem:inbox` ainda materializam o intake sem executar
autonomamente e devolver `artifact_manifest`/`quality_report`.
