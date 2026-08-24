# MarketingOS - Current State

> Estado consolidado: consulte [`docs/IMPLEMENTATION-AUDIT.md`](./IMPLEMENTATION-AUDIT.md). Os blocos historicos abaixo registram etapas anteriores e nao substituem a auditoria atual.

## Validação operacional atual (2026-08-17)

- O executor de análise consulta o `GrowthOS/data-now` real e gera `analysis-result.json` rastreável.
- O gate bloqueia solicitações sem sincronização; o teste controlado de Bruno Capelli confirmou esse comportamento no job `a3e96070-4861-477f-b4ba-03295653e24b`.
- O executor de vídeo deixou de usar o cortador FFmpeg provisório e encaminha para o pipeline do EditorOS.
- A validação E2E de vídeo permanece aberta até concluir transcrição, seleção e renderização; resultado antigo não é aceito como sucesso.

## Operacional

- Console React existe e compila.
- Login Supabase existe, mas precisa de configuracao de ambiente e validacao de refresh de sessao.
- Operador pode listar clientes, editar referencias e criar `work_requests`.
- Portal consulta Instagram e Meta Ads quando a conexao real existe.
- OAuth Meta/Instagram, status e sincronizacao possuem endpoints serverless.

## Fundacao MediaOS

- `work_requests` e `work_request_events` existem no schema atual.
- `001-mediaos-core.sql` esta presente no Supabase live; o hardening de `002`/`003` esta aplicado integralmente (lease/claim presentes). Ver `docs/live-schema-audit.md`.
- Dispatch local para EcosystemCore e FluxOS existe.
- O resultado ainda e parcialmente armazenado dentro de `work_requests.payload`.
- O schema separado de jobs e artifacts sera criado pela migracao `001-mediaos-core.sql`.
- O mapa de migracoes e execucao esta em [`docs/backend-map.md`](./backend-map.md).
- A auditoria dos OS, executores, diretórios e contratos está em [`docs/capability-audit.md`](./capability-audit.md).
- A direção do Cockpit como workspace operacional está em [`docs/operator-workspace.md`](./operator-workspace.md).

## Producao

- Carrossel atual gera rascunho operacional, mas ainda nao atende ao padrao visual de producao.
- O pipeline deve separar copy, direcao visual, render, QA e aprovacao.
- VideoOS e geracao de video sao contratos planejados; nao dependem de API especifica de OpusClip ou Dreamina.

## Ausencias conhecidas

- Portal do cliente ainda e principalmente uma tela de dados, nao uma central de resultados e aprovacoes.
- AI Router como gateway executavel ainda nao esta consolidado.
- Credenciais proprias do cliente por API/OAuth ainda nao tem modelo operacional completo.
- Existe prova ponta a ponta para carrossel: solicitacao -> diretórios -> EcosystemCore -> FluxOS -> PNG -> Storage -> artifact.
- Video, DesignOS, GrowthOS, funil, research, ads e publicação ainda precisam de provas ponta a ponta individuais.
## Atualizacao de validacao (2026-08-17)

- Video curto possui E2E validado com EditorOS, Storage e QA ffprobe; ver [`docs/video-validation.md`](./video-validation.md).
- Estrategia, funil e prospeccao possuem E2E no worker estruturado; ver [`docs/structured-services-validation.md`](./structured-services-validation.md) e [`docs/prospecting-validation.md`](./prospecting-validation.md).
- Post visual possui renderer MediaOS, PNG 1080x1350, manifesto, artifact/version e QA; ver [`docs/post-validation.md`](./post-validation.md).
- Pesquisa possui executor MediaOS com brief, fontes explicitas, hash, JSON/Markdown e QA; ver [`docs/research-validation.md`](./research-validation.md).
- Criativo/DesingOS daemon e video generativo continuam bloqueados ate existir executor unattended validado.
