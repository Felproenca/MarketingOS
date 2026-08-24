# BRIEF — Frontend MVP Premium (MarketingOS)

> Cole este conteúdo no início da NOVA sessão. É autossuficiente: não reexplore o backend — está condensado abaixo.

## 1. Missão
Construir o **MVP premium** do frontend do MarketingOS contra o **backend real** (sem mock data): **console do operador (operação)** + **dashboard do cliente**. Foco: funcionamento real, qualidade visual premium, eficiência de tokens.

## 2. Orçamento (CRÍTICO)
- Restam **0,48 créditos**. Seja **extremamente eficiente**: não re-explore o backend, use o código existente, entregue o caminho crítico PRIMEIRO.
- Use o **code mode** (escrever programas/geradores) para partes repetitivas (tipos, formatters, componentes primitives) em vez de gerar cada arquivo por texto.

## 3. Stack (JÁ instalada em `cockpit/`)
React 19 · Vite 8 · Tailwind 4 (`@tailwindcss/vite`) · framer-motion · lucide-react · react-router-dom 7.
Build: `npm run build` (tsc + vite). Design system em `src/index.css` (CSS vars: `--bg-base`, `--bg-card`, `--accent`, `--text`, `--f-mono`…).

## 4. Backend — referência (não reexplorar)

### Auth
- Supabase JWT (`src/lib/auth.ts` já tem `apiFetch`, `signIn`, `getSession`, refresh). Use `apiFetch` para tudo.
- Erros HTTP: `401` (login), `403` (sem acesso), `402` (quota/custo excedido), `409` (conflito), `422` (validação/contrato).

### Endpoints
| Endpoint | Uso |
|---|---|
| `GET/POST /api/missions` | listar (capabilities/jobs/artifacts/clients) · criar+executar missão |
| `GET/POST/DELETE /api/missions/:id` | detalhe · re-executar · deletar |
| `GET/POST/PATCH /api/admin/operations` | painel operacional (requests, jobs, artifacts, capabilities, systemStatus) |
| `GET /api/admin/operations?report=client:<slug>` | relatório custo/margem/qualidade por cliente |
| `GET/POST /api/admin/clients` · `?action=reference` | clientes + referências/Client Truth |
| `GET/POST/PATCH /api/admin/artifacts` | artifacts + QA + aprovação |
| `GET /api/client/<slug>` | overview do cliente (cota, métricas, próximos passos, resultados, previsão) — auth: usuário membro |

### Estados (a UI deve reconhecer)
```
queued → referenced → routed → running → review → approved → published → done
                         └→ blocked / error
```
Auxiliares: `awaiting_input` · `contract_only` · `changes_requested` · `stale`.
Job: `queued/routed/running/review/approved/published/done/blocked/error`.

### Capabilities (selecionáveis, o backend decide a rota)
`audit` · `funnel_strategy` · `strategy` · `research` · `traffic` · `design` · `carousel` · `post` · `analysis` · `coletar_referencia` · `agentic_code` · `image_generate` · `video_edit` · `publish` · `data_sync`.
> O front NÃO escolhe skill manualmente: coleta a INTENÇÃO e os dados; o backend (`resolveAI`) decide capability/skill/executor.

### Quota/Custo
`GET /api/client/<slug>` e `/report` retornam cota (tokens + R$, teto, margem). O front **exibe**, nunca calcula/autoriza. Trata `402 quota_exceeded` com mensagem útil.

## 5. O que construir (MVP — nesta ordem)

1. **Contratos + API client** — tipar respostas reais (`src/lib/api.ts` EXTENDER: getOperations, getReport, getClientOverview, approveArtifact…), centralizar erros (401/403/402/409/422), loading/retry.
2. **Shell premium** — Sidebar (Console | Portal), header com cliente atual, Command Center, estados loading/vazio/erro, responsivo.
3. **Fluxo crítico (primeira entrega)**:
   `selecionar cliente → escolher intenção (template) → preencher → confirmar contexto/custo → criar solicitação → acompanhar job → abrir artifact → revisar QA → aprovar ou pedir ajuste`
4. **Operação** — Command Center (jobs running, review, erros, cotas, saúde) + fila de requests/jobs + detalhe com timeline (contexto→rota→job→executor→output→QA→decisão).
5. **Dashboard do cliente** (rota `/portal/:slug` ou `/dados/:slug`) — cota (usado/restante), métricas, próximos passos, resultados reais, previsão (média), aprovações — **somente os dados dele**.

## 6. Regras (de `PLANO-FRONTEND.md`)
1. **Intenção antes de capability** — usuário pede resultado, não escolhe skill.
2. **Backend como autoridade** — status/rota/QA/custo vêm da API.
3. **Execução honesta** — `blocked`, `awaiting_input`, `contract_only` ≠ `concluído`.
4. **Output orientado ao tipo** — visual/vídeo/pesquisa/análise/estratégia/funil/publicação têm visualização própria.
5. **Operador e cliente separados** — portal não mostra skills internas, secrets, workers.
6. **Rastreabilidade** — toda solicitação chega a pedido→job→eventos→resultado→decisão.
7. **Qualidade premium** — use as referências visuais; UI consistente (tokens, dark, motion com propósito).

## 7. Documentos de referência (leia; NÃO re-explore o backend)
- `MarketingOS/docs/PLANO-FRONTEND.md` (plano canônico do front)
- `MarketingOS/docs/PLANO-BACKEND.md` (backend)
- `MarketingOS/docs/FRONTEND_REFERENCIAS.md` (referências visuais/UX)
- `MarketingOS/docs/contrato-execucao.md` (contrato)
- Código atual a EXTENDER: `cockpit/src/lib/api.ts`, `cockpit/src/lib/auth.ts`, `cockpit/src/App.tsx`, `cockpit/src/pages/*` (Missoes/NovaMissao/MissaoDetail/Dashboard/Portal/Clientes já existem)

## 8. Critérios de aceite do MVP
1. Usuário leigo abre solicitação por template → backend recebe sem front escolher skill.
2. Visualiza cliente, contexto, status, rota e próximo passo.
3. Operador filtra requests/jobs.
4. Output real aparece no renderizador correto.
5. QA e aprovação visíveis; aprovar/pedir ajuste atualizam o backend.
6. `401/403/402/409/422` com mensagens úteis.
7. Cliente vê apenas os próprios dados.
8. Diferencia concluído × bloqueado × aguardando input × contrato não executado.
9. `npm run build` passa.

## 9. Fora do primeiro MVP (não fazer agora)
- Editor visual completo, renderer comercial premium, chat autônomo do cliente, admin das 75 skills, config avançada de provider.

## 10. Meta de entrega da sessão
**Caminho crítico completo funcionando** (cliente→criar→confirmar→job→artifact→QA→aprovar) + Command Center + dashboard do cliente. Isso é o MVP premium mínimo.

## 11. REQUISITOS NÃO NEGOCIÁVEIS DO REDO (feedback da v1)

A v1 foi reprovada: reaproveitou o cockpit antigo, UI/UX confusa, sem separação clara entre clientes e sem login/coneção para o cliente. O REDO DEVE:

1. **NÃO reaproveitar a UI antiga.** Redesenhar do zero com base em `FRONTEND_REFERENCIAS.md` (referências de produto/UX) e em padrões premium: sidebar limpa, hierarquia clara, dark mode consistente, motion com propósito, estados de loading/vazio/erro bem desenhados.
2. **Tela de LOGIN DO CLIENTE** (separada do operador):
   - `GET /login/cliente` — o cliente cria usuário+senha (Supabase auth) vinculado ao client_id (via `client_memberships` ou convite).
   - Após login, rota `/dados/:slug` mostra SÓ os dados dele.
   - O operador tem login próprio e vê o console; o cliente vê só o portal.
3. **Tela de CONEXÃO de dados do cliente** (Meta + Google):
   - Botões "Conectar Instagram", "Conectar Google (YouTube/Ads)" → OAuth (`/api/integrations/meta/client?action=connect&clientId=X`, `/api/integrations/google?action=connect&clientId=X`).
   - Status das conexões (conectado/expirado) + ação de reconectar.
4. **Separação clara entre clientes**:
   - O console do operador tem um SELETOR DE CLIENTE no topo (Command Center filtrado pelo cliente ativo).
   - Nenhuma tela mistura dados de clientes diferentes; o contexto do cliente é sempre visível.
5. **UX de operação limpa**: fila de solicitações/jobs com filtros, detalhe em timeline, revisão (QA + aprovar/ajustar) sem ambiguidade.

Critérios de aceite do redo: aprovado apenas se a UI parecer premium (referências), o cliente tiver login próprio e tela de conexão funcionando, e não houver confusão entre clientes.

## 12. STATUS DA ÚLTIMA SESSÃO (caminho crítico + console + portal JÁ ENTREGUES)

> Atualizado ao final da sessão que implementou o fluxo crítico. Build passa: `npm run build` (tsc + vite) ✓.

### Já implementado (funcionando contra o backend real)

| Item | Onde | Status |
|---|---|---|
| Contratos + API client + erros centralizados (401/403/402/409/422) | `src/lib/api.ts` (`ApiError`, `messageForStatus`, `getOperations`, `getReport`, `getClientOverview`, `createRequest`, `approveArtifact`, `retryJob`) | ✅ |
| Formatters pt-BR (status/next-step/moeda/data) | `src/lib/formatters.ts` | ✅ |
| Fluxo crítico: Cliente → Intenção → Briefing → Confirmar (contexto+quota) → criar | `src/pages/NovaMissao.tsx` (stepper 4 passos, envia intenção+dados, backend decide rota) | ✅ |
| Detalhe operacional com timeline (contexto→intenção→rota→job→output→QA→decisão) + Aprovar/Pedir ajuste/Reprocessar | `src/pages/RequestDetail.tsx` (`/operacao/:id`) | ✅ |
| Command Center real (sem mocks): jobs running/review/erros, cotas por cliente, saúde, fila recente | `src/pages/Dashboard.tsx` (`/`) | ✅ |
| Dashboard do cliente por slug: cota, métricas, previsão, próximos passos, resultados + aprovação | `src/pages/PortalCliente.tsx` (`/portal/:slug` e `/dados/:slug`) | ✅ |
| Filtro de status + links para detalhe na fila de pedidos | `src/pages/Operacao.tsx` | ✅ |
| Redesign das telas legadas no design system premium (kicker + display, cards, `statusMeta`, filtro por cliente) | `src/pages/Missoes.tsx`, `MissaoDetail.tsx`, `Aquisicao.tsx`, `Conteudo.tsx` (produções reais via `getOperations`), `Biblioteca.tsx`, `Logs.tsx` | ✅ |
| Cliente atual no sidebar (localStorage `mkos.client`, link ao portal) + nav em pt-BR | `src/components/Sidebar.tsx` | ✅ |

### Pendente do redo (seção 11) para a próxima sessão

1. ~~**Login separado do cliente**~~ ✅ ENTREGUE: `/login/cliente` (tela própria com copy de cliente; login por senha ou link mágico; link mágico redireciona de volta para `/login/cliente`). Após login, `resolveHome()` em `src/lib/auth.ts` leva operador → `/operacao` e membro → `/dados/<slug>` (resolve o client_id via `/api/admin/clients`, que é filtrado por membership).
2. ~~**Conexão de dados no portal do cliente**~~ ✅ ENTREGUE: card “Suas conexões de dados” em `PortalCliente.tsx` com status Instagram/Meta + Google (`?action=status`) e botões Conectar/Reconectar (POST `?action=connect` → abre URL OAuth). Ícones: `Camera`/`Link2` (lucide 1.x removeu ícones de marca).
3. ~~**Redesign das telas legadas**~~ ✅ ENTREGUE: `Missoes`, `MissaoDetail`, `Aquisicao`, `Conteudo`, `Biblioteca` e `Logs` foram redesenhadas no design system premium (kicker mono + display header, cards `--bg-card`, `statusMeta()`, filtro por cliente persistido em `mkos.client`). `Conteudo` agora puxa produções reais via `getOperations()` (artifacts por tipo → link `/operacao/:id`). `Aquisicao` e `Logs` seguem locais/simulados mas com rótulo honesto de demonstração. O `Portal` antigo (rota `/portal`) já estava no padrão `.portal-page` (premium) — nenhuma ação. ⚠️ O `Portal` antigo saiu do sidebar (substituído por “Portal do cliente” → `/dados/:slug`).
4. ~~**Seleção de cliente no topo do Command Center**~~ ✅ ENTREGU E: filtro “Todos os clientes / <cliente>” no header do `Dashboard` (filtra jobs, revisões, problemas e fila; persiste em `mkos.client`).

### Decisões técnicas tomadas (não refazer)
- Todo fetch passa por `apiFetch` (auth.ts) + `request<T>` (api.ts) — não usar `fetch` direto em páginas novas.
- O front nunca escolhe capability/skill: `NovaMissao` envia `{ clientId, title, requestType, objective, priority, prompt, sources? }` para `POST /api/admin/operations`.
- Aprovação: `POST /api/admin/artifacts` com `{ artifactId, decision: approved|changes_requested|rejected, feedback }`. `rejected` é só operador (backend devolve 403 para membro).
- Retry: `PATCH /api/admin/operations` com `{ action: 'retry', jobId }` (só jobs `blocked|error`).
- Estados exibidos com rótulos honestos via `statusMeta()`/`nextStepFor()` em `src/lib/formatters.ts`.
- Rotas do portal: `/portal/:slug` e `/dados/:slug` → `PortalCliente`; `/portal` (antigo, insights Meta) mantido. `Protected` exige sessão Supabase.
- Login: `/login` (operador) e `/login/cliente` (cliente) — mesmo componente `LoginScreen({ mode })` em `src/pages/Login.tsx`; pós-login sempre via `resolveHome()`.
- Conexões do cliente: `/api/integrations/meta/client?action=status|connect` e `/api/integrations/google?action=status|connect` (POST connect devolve `{ url }` → `window.open`).

### Frontend NOVO (separado do cockpit) — `MarketingOS/frontend/` ✅

> Redesign do zero, tema light premium, operador + portal do cliente + Hermes chat + conexões Meta/Google/IA por cliente. Deploy: **https://marketingos-frontend.vercel.app** (projeto Vercel `marketingos-frontend`, env vars Production ✓). Endpoints todos conferidos contra o backend real (app.mkos.online). Build: `npm run build` ✓. Pendências de sessão: nenhuma crítica; próximo passo natural = domínio customizado + convites de membro no portal.

### Como rodar
```bash
cd MarketingOS/cockpit
npm run dev        # vite em :4200 (backend real em produção/Vercel; em dev use VITE_API_URL)
npm run build      # tsc -b && vite build (critério de aceite #9)
```
