# Arquitetura de execucao operacional

## Regra central

O backend executa. O frontend exibe, revisa e aprova.

```text
Frontend/Cockpit
  -> criar pedido
  -> exibir status
  -> exibir preview/output
  -> registrar revisao humana
  -> aprovar/publicar quando permitido

Backend/Workers
  -> ler pedidos
  -> montar contratos
  -> rotear entre OS
  -> executar motores
  -> salvar outputs
  -> devolver status e erros
```

## Fluxo atual de carrossel

```text
Cockpit
  -> Supabase work_requests
  -> MarketingOS operation:worker
  -> MarketingOS operation:dispatch
  -> EcosystemCore route/register/dispatch
  -> FluxOS work-order
  -> FluxOS ecosystem:execute
  -> flux-content-package.json
  -> MarketingOS operation:execute-carousel
  -> slides-input.json
  -> generate-carousel.js
  -> HTML/PNG draft
  -> Cockpit review
```

Papel por sistema:

- **MarketingOS:** recebe pedido, contexto do cliente, operacao, estado e revisao.
- **EcosystemCore:** contratos, mailbox, estado, work-orders.
- **FluxOS:** autoria editorial, narrativa, sequencia, CTA e gates de conteudo.
- **DesingOS:** direcao/render visual. Hoje recebe intake; renderer comercial ainda pendente.
- **EditorOS:** producao de video/roteiro/cortes. Deve seguir a mesma logica de intake -> execute -> artifact -> review.
- **MediaOS:** publicacao/distribuicao somente depois de aprovacao.

## Logica de implantacao do EditorOS

EditorOS nao deve ser chamado para todo carrossel. Ele entra quando o pedido ou o formato exigir video:

```text
request_type: video | roteiro | reel | short | corte
  -> production_request target_system=EditorOS
  -> EditorOS ecosystem:inbox materializa work-order
  -> EditorOS executor produz plano/roteiro/video
  -> artifact_manifest
  -> quality_report
  -> Cockpit review
  -> MediaOS publica somente se aprovado
```

Contrato esperado para o executor futuro do EditorOS:

```json
{
  "work_type": "editor_production_intake",
  "status": "awaiting_editorial_approval",
  "input": {
    "correlationId": "...",
    "requestId": "...",
    "objective": "...",
    "format": {
      "kind": "video",
      "platform": "instagram"
    },
    "deliverables": ["roteiro", "video", "legenda"],
    "authority": {
      "external_action_allowed": false,
      "human_approval_required": true
    }
  }
}
```

## Frontend

O Cockpit nao deve conter logica pesada de decisao ou render. Ele deve mostrar:

- status do pedido;
- rota percorrida;
- outputs gerados;
- erros por sistema;
- preview;
- botoes de revisar/aprovar/reprovar;
- historico de eventos.

## Qualidade visual

O renderer HTML atual e **draft operacional**. A entrega comercial deve virar uma etapa posterior:

```text
flux-content-package
  -> DesingOS commercial renderer
  -> Canva/Figma/template premium
  -> editable link + PNG/PDF
  -> review
```

Ver tambem: `docs/operational-pending.md`.
