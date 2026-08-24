# Pendencias operacionais do MarketingOS

Este arquivo registra decisoes que nao devem interromper a implantacao atual, mas precisam entrar no backlog operacional para o sistema virar entrega comercial.

## P1 - Renderer comercial de carrosseis

**Status:** pendente.

**Contexto:** o pipeline atual ja executa pedido de carrossel ponta a ponta:

```text
Cockpit -> Supabase -> MarketingOS worker -> EcosystemCore -> FluxOS -> DesingOS -> render HTML/PNG
```

O render atual deve ser tratado como **rascunho operacional**, nao como entrega comercial final. Ele prova fluxo, gera copy, briefing, HTML e PNGs, mas ainda nao tem acabamento visual suficiente para cliente premium.

**Decisao:** manter o renderer atual como fallback/draft e criar uma camada de renderer comercial no DesingOS.

Estrutura alvo:

```text
FluxOS
  -> estrategia, narrativa, copy, estrutura dos slides

DesingOS
  -> renderer comercial
     - Canva
     - Figma
     - template premium proprio
     - export manual assistido

MediaOS
  -> publicacao somente apos aprovacao humana
```

Contrato futuro sugerido:

```json
{
  "contract_type": "commercial_design_request",
  "client_id": "bruno-capelli",
  "asset_type": "carousel",
  "quality": "commercial",
  "source_slides_input": "...",
  "brand_kit_ref": "...",
  "template_id": "...",
  "outputs_required": ["editable_link", "png", "pdf"],
  "approval_required": true
}
```

**Canva como opcao forte:** se o conector/integração estiver disponivel, usar Canva para gerar carrosseis editaveis, com templates por cliente, export em PNG/PDF e link editavel. Isso melhora velocidade comercial sem jogar fora o fluxo operacional.

**Nao fazer agora:** pausar implantacao do worker/backbone para refazer design. A prioridade atual continua sendo o sistema executar pedidos, registrar status, gerar outputs e permitir revisao.

**Proxima acao recomendada:** depois de estabilizar o fluxo `pedido -> output -> Cockpit`, criar `DesingOS/renderers/commercial` e plugar Canva/Figma/template premium como etapa posterior ao draft.
