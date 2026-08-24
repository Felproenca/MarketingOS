# Limites reais dos executores

Atualizado em 2026-08-17.

## Regra

Um pedido só pode entrar em `media_jobs` quando existe um executor unattended validado, com saída em Storage, artifact, versão e QA. Contrato, skill ou documentação não são evidência de execução.

## Estado atual

| Capacidade | Entrada existente | Executor MediaOS validado | Comportamento |
|---|---:|---:|---|
| Carrossel | sim | sim | fila e artifact para revisão |
| Vídeo curto | sim | sim | EditorOS real, Storage e ffprobe |
| Estratégia | sim | sim | decisão validada e artifact JSON |
| Funil | sim | sim | auditoria e artifact JSON |
| Prospecção | sim | sim | Discovery Engine, sem envio automático |
| Publicação | sim | gate validado | bloqueia se artifact não estiver `approved` |
| Post | sim | sim | MediaOS renderer, artifact visual + manifesto + QA |
| Criativo / DesingOS daemon | sim | não | rejeitado no intake até haver retorno unattended |
| Pesquisa de mercado | brief + fontes | sim | coleta rastreável, JSON/Markdown, hashes e QA |
| Sincronização | GrowthOS Data Now | sim | status do dataset e artifact JSON |
| Análise de dados | GrowthOS Data Now | sim | análise baseada em dataset sincronizado |
| Vídeo generativo | contrato | não | bloqueado; nenhum provedor foi inventado |

## DesingOS

O contrato atual materializa um `work-order.json` com status `awaiting_experience_approval`. O daemon interativo continua não sendo usado como executor unattended. Para Post, o MediaOS usa agora um renderer determinístico próprio, preservando o contrato do DesingOS e registrando manifesto/QA; isso foi validado no Supabase pelo job `49b1d0d9-023a-4bcc-bd80-a58b29c95841` e artifact `dfb3ecd8-34ef-4d8a-a6f5-b5075ef40cf8`.

## Pesquisa

Além dos relatórios e do runner PowerShell manual, existe agora `scripts/mediaos/research-executor.mjs`. Ele exige brief e fontes explícitas (HTTPS ou arquivos dentro do workspace), coleta evidência, registra hash, gera JSON/Markdown e passa o resultado pelo mesmo artifact/version/QA do MediaOS. Ele não inventa síntese quando findings/recommendations não foram fornecidos.

## Proteção adicionada

Pedidos `creative` continuam sendo recusados antes de criar `work_requests` ou `media_jobs`. Post e Pesquisa percorrem agora o worker completo, com artifact em `review` e aprovação obrigatória; pesquisa sem fontes é bloqueada pelo executor.
