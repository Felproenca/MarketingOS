# Execução nativa do ecossistema

## Estado atual

O primeiro elo nativo do plano foi implementado no EcosystemCore:

```text
operation materializada
  -> FluxOS work-order
  -> execute-campaign-work-order.ts
  -> content-package.json
  -> mailbox DesingOS + EditorOS
```

Comando:

```powershell
node EcosystemCore/src/cli.js native-execute <correlation-id> `
  --state-root <EcosystemCore/runtime/state> `
  --mailbox-root <EcosystemCore/runtime/mailbox> `
  --work-root <EcosystemCore/runtime/work-orders> `
  --projects-root <Projetos>
```

O comando é protegido por lock, reutiliza o `content-package.json` quando já
existe e roteia o retorno de forma idempotente. O caso real
`ops-bruno-capelli-20260817t020456981z` foi executado duas vezes: a primeira
criou o pacote e as duas entregas; a segunda retornou `reused` nas duas rotas.

## Limite honesto

DesingOS e EditorOS ainda recebem o contrato no mailbox, mas seus scripts
`ecosystem:inbox` apenas materializam o intake local. A execução nativa
autônoma desses dois sistemas e o retorno de `artifact_manifest`/
`quality_report` continuam sendo a próxima etapa da Fase 1. Publicação externa
permanece bloqueada por aprovação e conexão.
