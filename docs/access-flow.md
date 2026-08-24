# Fluxo de acesso

1. Usuário entra com senha Supabase ou link mágico.
2. Após senha, o Cockpit consulta `/api/admin/clients` com o token da sessão.
3. Se `isAdmin=true`, redireciona para `/operacao`.
4. Caso contrário, redireciona para `/portal`; o servidor resolve o cliente por `client_memberships`.
5. Sem membership, o Portal não carrega nenhum cliente e nenhuma entrega.

O redirecionamento é apenas experiência; a autorização real permanece nos endpoints server-side.
