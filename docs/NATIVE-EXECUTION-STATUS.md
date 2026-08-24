# Status da execução nativa

## Contrato operacional

O EcosystemCore agora expõe `native-execute-production` para ordens materializadas de DesingOS e EditorOS.

Uma execução só retorna `completed` quando:

1. a ordem está aprovada;
2. existe um arquivo de saída real dentro do workspace autorizado;
3. é criado um `artifact_manifest` com SHA-256;
4. é criado um `quality_report` com revisor independente;
5. um `execution_result` é roteado para MarketingOS e MediaOS.

Quando uma pré-condição não existe, o executor retorna `blocked`, sem inventar arquivo, manifest ou aprovação. O contrato inclui `blockers` e `next_action`.

## Estado atual

- FluxOS: executor nativo validado com produção real e idempotência.
- EditorOS: executor nativo preparado para mídia local autorizada; sem arquivo de vídeo, bloqueia.
- DesingOS: intake e executor de contrato preparados; sem provider conectado ou `artifactPath` real, bloqueia.
- MediaOS: recebe manifest, quality e execution result pelo mailbox; a ponte Supabase usa a ação interna de `/api/admin/operations` e publicação continua dependente de credencial e aprovação.
- Vídeo generativo: permanece `contract_only` até existir adapter/provider configurado.

## Comando

```powershell
node EcosystemCore/src/cli.js native-execute-production <work-order.json> `
  --system <EditorOS|DesingOS> `
  --output-root <diretorio> `
  --mailbox-root <diretorio> `
  --projects-root <workspace>
```

O comando é idempotente no nível dos contratos: os mesmos arquivos não são substituídos por conteúdo diferente; a aprovação humana continua sendo obrigatória antes de publicação.
