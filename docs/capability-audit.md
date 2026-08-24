# Auditoria de capacidades e executores

Data da auditoria: 2026-08-17

## Conclusao

Os diretórios não são apenas arquivos antigos. Eles já formam a camada de execução do sistema:

```text
MarketingOS / cliente
  -> contratos em clients/<cliente>/outputs/operations
  -> EcosystemCore / mailbox / state / work-orders
  -> OS executor
  -> arquivos de saída no diretório do cliente ou do OS
  -> MediaOS registra o resultado e o Cockpit exibe
```

Transformar tudo em tabelas no Supabase seria um erro nesta fase. O desenho recomendado é híbrido:

- filesystem: contexto, projetos, contratos, work-orders, código dos executores e arquivos de trabalho;
- Supabase: autenticação, fila, estado, locks, auditoria, aprovações, índice e ponte para os arquivos;
- Supabase Storage: cópia durável dos artifacts que precisam aparecer no Portal ou ser entregues;
- MediaOS: controle do ciclo, não substituição de todos os OS.

## Mapa encontrado

| Camada | Projeto/local | Capacidades encontradas | Situação |
|---|---|---|---|
| Orquestração | `MarketingOS/scripts/operations` | dispatch, worker, contratos e execução do carrossel | carrossel comprovado ponta a ponta |
| Contratos | `EcosystemCore` | route, demand-plan, mailbox, adapter, dispatch e work-orders | base ativa |
| Estratégia e conteúdo | `MarketingOS`, `FluxOS` | estratégia, copy, pesquisa, narrativa, CTA, campaign work-order | integrado no fluxo de carrossel |
| Design | `DesingOS` | `ecosystem:inbox`, `ecosystem:return`, web e ferramentas de design | executor existente, integração de produção ainda não comprovada |
| Vídeo | `EditorOS` | ingest, analyze, select, build, render, deliver, full, inbox/return | executor existente, integração ponta a ponta ainda não comprovada |
| Dados e análise | `GrowthOS/data-now` | dados raw/normalized, contratos, métricas e status Instagram | base existente, ponte operacional a validar |
| Media/control plane | `MediaOS` | status, workflow, production, artifact, QA, approval, metrics e custos | sistema existente; precisa ser conectado ao dispatcher único |
| Marketing legado | `MarketingOS/scripts` | funnel, insights, publisher, discovery, prospector, scraper, research, PDF e sites | capacidades existentes, várias entradas independentes |

## Mapa completo de frentes do MarketingOS

| Frente | Onde está hoje | O que cobre |
|---|---|---|
| Onboarding e clientes | `scripts/create-client.js`, `clients/`, `workflows/onboarding-head.md`, `skills/brand-intelligence` | criação de cliente, client truth, brand kit, audiência, referências e contexto |
| Estratégia | `scripts/strategy`, `skills/analise`, `skills/inteligencia`, `agency/strategy.md` | decisões estratégicas, hipóteses, gargalos, posicionamento e próximos movimentos |
| Inteligência e pesquisa | `research/`, `intelligence/`, `scripts/signal-intelligence`, `skills/analise`, `skills/inteligencia` | pesquisa de mercado, tendências, referências, padrões, benchmarks e repertório |
| Branding e percepção | `skills/brand-intelligence`, `skills/perception`, `scripts/render-branding.js`, `intelligence/creative-direction-engine.md` | identidade, percepção, DNA visual, direção de arte e referências |
| Conteúdo social | `skills/criacao`, `scripts/generate-carousel.js`, `scripts/render-*`, `scripts/demo-pipeline` | carrossel, post, copy, imagens, reels, roteiros, PDFs e demos |
| Funis | `skills/funnel-strategy`, `scripts/funnel`, `workflows/pipeline-runner.md` | inbound, outbound, oferta, lead scoring, routing, CTA e auditoria de funil |
| Aquisição e prospecção | `skills/aquisicao`, `scripts/prospector`, `scripts/discovery-engine`, `scripts/scraper` | descoberta, enriquecimento, listas, LinkedIn, WhatsApp, e-mail e outreach |
| Relacionamento | `skills/relacionamento`, `scripts/whatsapp-bot`, `scripts/telegram-bot`, `scripts/dm-engine` | conversas, follow-up, bots, triagem e automações de contato |
| Vendas e receita | `skills/venda`, `revenue/`, `workflows/open-client.md`, `workflows/close-client.md` | proposta, diagnóstico, contrato, captação, outbound e fechamento |
| Sites e experiências | `skills/premium-site`, `skills/criacao/skill-site-builder.md`, `site/`, `site-mkos/`, `cockpit/generated-sites` | site, landing page, motion, demo, preview e prospecção por site |
| Dados e distribuição | `GrowthOS/data-now`, `scripts/insights`, `scripts/publisher`, `scripts/integrations` | coleta, normalização, métricas, Instagram, Meta, publicação e sincronização |
| Operação | `cockpit/`, `scripts/operations`, `scripts/mediaos`, `docs/` | pedidos, roteamento, jobs, artifacts, revisão, aprovação e portal |

## Projetos externos que fazem parte do ecossistema

- `EcosystemCore`: backbone de contratos e work-orders.
- `FluxOS`: campanha, conteúdo, distribuição e execução de work-orders.
- `DesingOS`: design e ferramentas de produção visual.
- `EditorOS`: vídeo, ingest, análise, seleção, build, render e entrega.
- `MediaOS`: controle de produção, QA, artifacts, aprovação, métricas e distribuição.
- `GrowthOS`: dados, normalização, métricas e inteligência de crescimento.

## Diagnóstico de poluição

O diretório está poluído porque contém três gerações de sistema ao mesmo tempo:

1. executores legados que funcionam diretamente por CLI;
2. skills e workflows que funcionam como camada de decisão e autoria;
3. nova camada operacional com Cockpit, Supabase, EcosystemCore e MediaOS.

Isso não significa que tudo deva ser apagado. Significa que precisamos classificar cada item como:

- fonte de verdade;
- executor ativo;
- contrato/skill reutilizável;
- adapter a conectar;
- legado a congelar;
- experimento descartável.

## Evidencia operacional

O fluxo comprovado foi:

```text
work_request Bruno Capelli
  -> clients/bruno-capelli
  -> outputs/operations/<correlation>/contracts
  -> EcosystemCore/runtime/work-orders/FluxOS/<correlation>
  -> FluxOS campaign work-order
  -> flux-content-package.json
  -> slides-input.json
  -> carrossel.html e PNGs
  -> Supabase Storage/media
  -> artifact v1/v2
```

No momento da auditoria, o banco tinha apenas jobs de `carousel`. Portanto, não é correto dizer que vídeo, ads, funil ou research já foram comprovados pelo mesmo caminho, embora existam executores e dados para essas frentes.

## O que estava poluindo

O problema não é a existência dos diretórios. É a ausência de um catálogo único que diga:

1. qual serviço existe;
2. qual OS é responsável;
3. qual entrada ele lê;
4. qual comando executa;
5. onde grava o resultado;
6. como valida o output;
7. como transforma o output em artifact.

Sem esse catálogo, o sistema parece ter muitos workers concorrentes e o mesmo pedido pode ser interpretado por caminhos diferentes.

## Regra para a próxima fase

Não criar um executor novo antes de auditar o executor existente. Para cada capacidade, registrar um `service manifest` com:

```json
{
  "service": "video.edit",
  "owner_os": "EditorOS",
  "input_contract": "editor_production_intake",
  "entrypoint": "npm run full",
  "workspace": "filesystem",
  "output_contract": "artifact_manifest + quality_report",
  "approval_required": true
}
```

Depois o MediaOS apenas chama o entrypoint do manifest, acompanha o diretório de trabalho e registra o resultado. Isso reduz duplicação sem destruir o que já funciona.

## Próximas validações

- validar um pedido de vídeo real através do `EditorOS ecosystem:inbox` e `ecosystem:return`;
- validar um pedido de design através do `DesingOS ecosystem:inbox` e `ecosystem:return`;
- validar um pedido de análise com `GrowthOS/data-now`;
- validar uma pesquisa de mercado usando o executor de research já existente;
- validar um funil usando `scripts/funnel` e o contrato de funnel;
- validar publicação somente depois de artifact aprovado;
- registrar cada teste no Supabase com request, job, executor, output path, checksum e artifact.

## Validações executadas nesta implantação

- `npm run service:audit`: catálogo carregado e caminhos principais encontrados.
- `MediaOS npm run validate`: 72 arquivos JSON válidos.
- `GrowthOS/data-now status felipe-proenca`: última sincronização Instagram com status `success`, 23 registros raw, 1 normalizado e 0 erros.
- `EditorOS node src/cli.js list-presets`: presets reais para YouTube, Shorts, Reels e Stories encontrados.
- `MarketingOS npm run cockpit:build`: build do Cockpit aprovado.

Essas validações comprovam disponibilidade e integridade local. Ainda não significam que cada serviço já percorreu o ciclo completo request -> work-order -> execução -> artifact no Supabase.

- MediaOS analysis-executor validado localmente com dados reais do GrowthOS; teste Supabase de Bruno Capelli bloqueado corretamente por aus�ncia de sincroniza��o.
- Adapter de v�deo EditorOS implementado; E2E ainda aberto at� concluir a renderiza��o completa.

