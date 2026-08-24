# Plano de Execução do Frontend — MarketingOS Cockpit

> Plano canônico do novo frontend premium. Baseado em [`PLANO-BACKEND.md`](./PLANO-BACKEND.md) e [`contrato-execucao.md`](./contrato-execucao.md). O `cockpit` atual é somente referência de contrato/backend; não será usado como base visual, estrutural ou de componentes.

## 1. Objetivo

Construir um workspace operacional que permita ao usuário:

```text
entender o contexto do cliente
  → fazer uma solicitação em linguagem simples
  → receber uma rota decidida pelo backend
  → acompanhar a execução
  → revisar o resultado
  → aprovar, pedir ajustes ou publicar
```

O frontend não escolhe manualmente a skill. Ele orienta a intenção, coleta os dados necessários e apresenta o contrato decidido pelo backend.

## 1.1 Decisão de arquitetura do redo

O novo frontend será um aplicativo independente, com código, design system, shell, rotas e componentes próprios. Nenhuma página, CSS ou componente do Cockpit de teste será reaproveitado.

```text
frontend premium standalone
  → API do MarketingOS
  → Supabase / worker / EcosystemCore / OSs
```

O Cockpit atual permanece apenas como ambiente de teste e referência técnica.

## 2. Princípios

1. **Intenção antes de capability** — o usuário pede um resultado, não escolhe `skill_id`.
2. **Contexto visível** — o usuário sabe qual cliente, referências e dados serão usados.
3. **Backend como autoridade** — status, rota, executor, QA, aprovação e custo vêm da API.
4. **Prompts guiados** — modelos prontos ajudam usuários leigos sem esconder a possibilidade de personalização.
5. **Execução honesta** — bloqueado, aguardando input e contrato não executado são estados diferentes de concluído.
6. **Output orientado ao tipo** — visual, vídeo, pesquisa, análise, estratégia e publicação têm visualizações próprias.
7. **Operador e cliente separados** — o console mostra operação; o portal mostra resultado e decisão.
8. **Rastreabilidade** — toda solicitação deve chegar a pedido, job, eventos, resultado e decisão.

## 3. Fonte de verdade e contratos

### Documentos

- [`PLANO-BACKEND.md`](./PLANO-BACKEND.md)
- [`contrato-execucao.md`](./contrato-execucao.md)
- [`SYSTEM-TRUTH.md`](./SYSTEM-TRUTH.md)
- [`IMPLEMENTATION-AUDIT.md`](./IMPLEMENTATION-AUDIT.md)
- [`execution-architecture.md`](./execution-architecture.md)

### Entidades principais

```text
client_profiles
client_references
client_truth_versions
client_memberships
work_requests
work_request_events
media_jobs
media_job_events
artifacts
artifact_versions
artifact_approvals
execution_results
ai_runs
ai_usage_events
client_quotas
output_costs
provider_connections
connections
data_now_*
sync_schedules
```

### Estados que a interface precisa reconhecer

```text
queued → referenced → routed → running → review → approved → published → done
                         └──────────────→ blocked / error
```

Estados auxiliares importantes:

- `awaiting_input` — falta arquivo, credencial ou informação.
- `contract_only` — existe contrato, mas não existe executor validado.
- `changes_requested` — revisão pediu nova versão.
- `stale` — job perdeu lease ou precisa de recuperação.

## 4. Arquitetura do frontend

```text
src/
├── app/                 # rotas, providers e proteção de acesso
├── components/
│   ├── shell/           # Explorer, workbench, inspector, command bar
│   ├── request/         # modelos, formulário e confirmação
│   ├── operations/      # filas, jobs, eventos e saúde
│   ├── outputs/         # renderizadores por tipo de resultado
│   ├── review/          # QA, versões e aprovação
│   ├── clients/         # Client Truth, onboarding e conexões
│   └── ui/              # primitives visuais reutilizáveis
├── features/            # casos de uso com estado e chamadas de API
├── lib/
│   ├── api/             # cliente HTTP e contratos de resposta
│   ├── auth/            # sessão e permissões
│   ├── formatters/      # status, custo, datas e outputs
│   └── guards/          # permissões e regras de exibição
├── pages/               # composição das telas
├── types/               # tipos derivados dos contratos do backend
└── styles/              # tokens, temas e responsividade
```

A implementação pode começar sobre a estrutura atual, mas deve migrar gradualmente de páginas isoladas para features e componentes de domínio.

## 5. Navegação e áreas

### Console do operador

- Command Center.
- Solicitações.
- Jobs.
- Clientes.
- Estratégia.
- Produção.
- Dados e análises.
- Distribuição.
- Automações.
- Integrações.
- Saúde do sistema.

### Portal do cliente

- Visão geral.
- Pedidos.
- Entregas.
- Revisões e aprovações.
- Métricas.
- Conexões.
- Próximos passos.

O portal não exibe nomes internos de skills, secrets, workers ou detalhes desnecessários dos executores.

## 6. Solicitação guiada

### Entrada principal

O usuário escolhe uma intenção ou escreve livremente:

- Criar conteúdo.
- Criar estratégia.
- Pesquisar mercado.
- Analisar dados.
- Criar ou melhorar um funil.
- Planejar aquisição.
- Sincronizar dados.
- Preparar publicação.
- Executar uma automação.

### Templates de prompt

Cada template deve possuir:

- `template_id`.
- Nome legível.
- Descrição do resultado.
- Campos obrigatórios.
- Campos opcionais.
- Exemplo preenchido.
- `request_type` sugerido.
- Tipo de output esperado.
- Avisos de pré-condição.

Exemplos:

- “Criar carrossel educativo”.
- “Encontrar o principal gargalo de aquisição”.
- “Pesquisar concorrentes”.
- “Analisar o desempenho recente”.
- “Estruturar uma oferta”.
- “Criar roteiro de vídeo”.
- “Preparar uma publicação aprovada”.

O template sugere campos e linguagem. A decisão final de capability, skill, provider e executor continua no backend.

### Input do cliente

O novo frontend deve receber diretamente do cliente:

- briefing guiado;
- objetivo e contexto;
- referências de marca;
- imagens, vídeos e arquivos;
- brand kit;
- exemplos aprovados;
- restrições e observações.

Esse input fica associado ao pedido com autor, data e arquivos. O operador consegue revisar o material antes da execução.

### Confirmação antes de enviar

Mostrar:

- Cliente.
- Objetivo entendido.
- Client Truth e referências que serão usadas.
- Dados necessários ausentes.
- Rota retornada, quando disponível em modo de prévia.
- Aprovação necessária.
- Quota e custo estimado.
- Ação externa permitida ou bloqueada.

## 7. Telas de operação

### 7.1 Command Center

Pergunta respondida: **o que precisa da minha atenção agora?**

Exibir:

- solicitações novas;
- jobs running;
- artifacts em review;
- bloqueios;
- erros;
- clientes sem Client Truth válida;
- integrações expiradas;
- quota e custo;
- saúde do worker e dos executores.

### 7.2 Fila de solicitações

Fonte: `/api/admin/operations`.

Filtros:

- cliente;
- `request_type`;
- status;
- prioridade;
- sistema de destino;
- aprovação;
- período.

### 7.3 Detalhe operacional

Mostrar em timeline:

```text
contexto → intenção → rota → job → executor → output → QA → decisão
```

### 7.4 Fila e detalhe de jobs

Mostrar:

- tentativa atual;
- lease/worker;
- executor;
- progresso/status;
- erro;
- blockers;
- retry disponível;
- custo;
- artifacts relacionados;
- eventos de `media_job_events`.

### 7.5 Central de revisão

Funções:

- preview;
- comparação de versões;
- QA;
- manifest;
- feedback;
- aprovar;
- pedir ajustes;
- rejeitar quando permitido;
- histórico de decisões.

### 7.6 Publicação pós-aprovação

Para Instagram, o fluxo premium termina em publicação operacional:

```text
artifact gerado
  → QA passed
  → aprovação humana
  → publicação Meta/Instagram
  → recibo, permalink e métricas
```

O frontend deve mostrar canal, conta, mídias, legenda, agendamento, status, permalink e erro externo quando houver. A publicação exige artifact aprovado, QA passed, conexão válida e permissão externa.

## 8. Telas de output

O frontend deve escolher o renderizador com base em `artifact_type`, `result_type`, `metadata` e contrato do output.

### Visual

Preview, galeria, versões, download, manifest, QA e aprovação.

### Vídeo

Player, roteiro, legendas, cortes, arquivos, QA técnico e versões.

### Pesquisa

Pergunta, fontes, evidências, findings, confiança, recomendações e exportação.

### Análise

Dados, período, métricas, anomalias, interpretação, confiança e próximo movimento.

### Estratégia

Decisão, hipóteses, público, oferta, riscos, plano e próximos passos.

### Funil

Etapas, mensagens, gatilhos, regras, métricas e automações.

### Publicação

Canal, conta, payload, agendamento, status, permissões, permalink e recibo.

### Automação

Gatilho, condições, ações, última execução, logs, erros e ativação/desativação.

## 9. Integração com APIs

### Núcleo

- `GET/POST /api/missions`.
- `GET/POST/DELETE /api/missions/:id`.
- `GET/POST/PATCH /api/admin/operations`.
- `GET/POST /api/admin/clients`.
- `GET/POST/PATCH /api/admin/artifacts`.
- `POST /api/admin/publish` — ponte autenticada para publicação pós-aprovação; o segredo de serviço não chega ao browser.
- `GET/POST /api/admin/ai/[action]`.
- `GET /api/client/:slug`.
- `GET /login/cliente?slug=<client_id>` e `/dados/:slug` — entrada e dashboard isolados do cliente no standalone.

### Referências e contexto

- `/api/admin/references/:clientId`.
- Client Truth.
- Onboarding.
- Assets próprios do cliente.

### Integrações

- Meta/Instagram.
- Meta Ads.
- Google Ads.
- YouTube.
- Providers de IA.

O cliente HTTP deve centralizar:

- JWT.
- refresh de sessão.
- tratamento de 401/403/402/409/422.
- idempotency key.
- mensagens de erro.
- loading e retry.

## 10. Quotas, custos e margem

O frontend deve exibir, quando permitido:

- plano do cliente;
- quota mensal;
- uso de tokens;
- custo estimado;
- custo acumulado;
- teto operacional;
- margem;
- custo por capability;
- outputs rejeitados/desperdiçados.

O frontend nunca calcula ou autoriza quota por conta própria. Ele apenas apresenta os dados do backend e trata `402 quota_exceeded`.

## 11. Fases de execução

### Fase 0 — Contratos e fundação

- Tipar respostas reais da API.
- Criar cliente HTTP único.
- Centralizar autenticação e permissões.
- Mapear estados e erros.
- Validar registry/capability no frontend.
- Remover dependência de mocks nas áreas que já possuem API.

**Entrega:** base técnica pronta para construir telas sem duplicar regra de negócio.

### Fase 1 — Workspace shell

- Layout Explorer/Workbench/Inspector.
- Cliente atual.
- Breadcrumbs e tabs.
- Command bar.
- Notificações.
- Responsividade.
- Estados de loading, vazio e erro.

**Entrega:** workspace navegável e consistente.

### Fase 2 — Solicitação guiada

- Biblioteca de templates.
- Formulário por intenção.
- Prompt livre opcional.
- Contexto e referências.
- Confirmação antes do envio.
- Quota/custo.
- Integração com o endpoint escolhido.

**Entrega:** usuário leigo consegue abrir uma solicitação útil.

### Fase 3 — Operação

- Command Center.
- Fila de requests.
- Fila de jobs.
- Detalhe operacional.
- Eventos e logs.
- Retry.
- Blockers.
- Saúde do sistema.

**Entrega:** operador acompanha e intervém sem acessar scripts.

### Fase 4 — Outputs e revisão

- Central de revisão.
- Renderizador visual.
- Renderizador de vídeo.
- Renderizador de pesquisa/análise.
- Renderizador estratégico.
- Versões.
- QA.
- Aprovação e pedido de ajustes.

**Entrega:** output é compreensível, revisável e rastreável.

### Fase 5 — Cliente e integrações

- Client Truth.
- Onboarding.
- Portal completo.
- Meta/Instagram.
- Google Ads/YouTube no Portal.
- Status de conexões.
- Dados sincronizados.
- Input de briefing, referências e assets.
- Publicação Instagram pós-aprovação.

**Entrega:** cliente consegue acompanhar resultados e decidir sem acessar o console técnico.

### Fase 6 — Publicação e operação comercial

- Gate de publicação.
- Publicação Instagram.
- Recibos e permalink.
- Erros de canal e reconexão.
- Histórico de publicações.
- Métricas pós-publicação.

**Entrega:** produzir, validar e publicar sem intervenção manual entre aprovação e canal.

### Fase 7 — Economia e produção

- Quota e margem.
- Relatórios por cliente.
- Auditoria.
- Performance.
- Acessibilidade.
- Testes de fluxos principais.
- Correção dos testes do registry.
- Verificação de deploy e health check.

**Entrega:** frontend pronto para operação contínua.

## 12. Critérios de aceite do MVP

O MVP será considerado funcional quando:

1. Um usuário leigo conseguir abrir uma solicitação usando um template.
2. O backend receber a solicitação sem o frontend escolher manualmente a skill.
3. O usuário visualizar cliente, contexto, status, rota e próximo passo.
4. Um operador conseguir filtrar requests e jobs.
5. Um output real aparecer no renderizador correto.
6. QA e aprovação forem visíveis.
7. Aprovar e pedir ajustes atualizarem o backend.
8. `401`, `403`, `402`, `409` e `422` tiverem mensagens úteis.
9. O cliente visualizar apenas os próprios dados.
10. O sistema diferenciar concluído, bloqueado, aguardando input e contrato não executado.
11. O cliente conseguir enviar briefing, referências e assets.
12. Um artifact aprovado poder ser publicado no Instagram com QA e conexão válidos.
13. O sistema mostrar o permalink ou o erro real da publicação.
14. `npm run build` passar no novo aplicativo standalone.

## 13. Fora do primeiro MVP

- Editor visual completo dentro do frontend.
- Renderer comercial premium de carrossel.
- Chat autônomo completo do cliente.
- Administração manual de todas as 75 skills.
- Configuração avançada de provider pelo usuário comum.
- Dashboard com métricas sem fonte operacional real.

Esses itens podem entrar depois que o fluxo solicitação → execução → output → revisão estiver estável.

## 14. Ordem prática de construção

```text
1. contratos e API client
2. shell do workspace
3. contexto do cliente
4. solicitação guiada e templates
5. confirmação/preview da rota
6. fila operacional
7. detalhe de job e eventos
8. central de revisão
9. renderizadores de output
10. Portal do cliente
11. Google e métricas
12. hardening, testes e produção
```

## 15. Primeira entrega concreta

A primeira versão implementada deve conter apenas o caminho completo:

```text
selecionar cliente
  → escolher “Criar conteúdo”
  → preencher template
  → confirmar contexto/custo
  → criar solicitação
  → acompanhar job
  → abrir artifact
  → revisar QA
  → aprovar ou pedir ajuste
  → publicar no Instagram
  → registrar permalink e métricas
```

Esse fluxo será a referência para validar toda a arquitetura visual e técnica antes de expandir para todas as capacidades.
