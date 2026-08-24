# Portal do cliente — revisão de artifacts

O Portal resolve o cliente pela sessão autenticada através de `client_memberships`; não usa mais um client_id padrão.

## Ações

- cliente autenticado pode abrir o preview do próprio artifact;
- pode aprovar a versão corrente;
- pode solicitar ajustes com feedback obrigatório;
- não pode executar `rejected` final;
- operador/admin continua podendo aprovar, rejeitar ou solicitar ajustes;
- cada decisão grava `artifact_approvals` e `audit_events` com `actor_role` correto.

## Verificação de produção

- build Vite/TypeScript: passou;
- deploy: `app.mkos.online`;
- `/api/health`: HTTP 200;
- POST sem sessão em `/api/admin/artifacts`: HTTP 401.

O teste autenticado de aprovação exige uma sessão Supabase real de cliente; a proteção de endpoint foi verificada sem sessão e o caminho de autorização é por membership no servidor.
