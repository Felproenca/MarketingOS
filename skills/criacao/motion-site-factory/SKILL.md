---
name: motion-site-factory
description: Orquestra a criação de sites cinematográficos em escala com agentes especializados, contratos de delegação, task graph, QA independente e documentação pronta para vídeo. Use quando o pedido envolver site premium, site com motion/Three.js/WebGL, produção paralela por agentes, Motion Site Factory, documentação de criação, captura automatizada, case ou transformação de site em vídeo.
---

# Motion Site Factory

Transformar contexto de marca em site, recibos de execução e handoff para vídeo. Tratar agentes como funções com contratos, não como conversas livres.

## Pré-requisitos

Ler, nesta ordem:

1. `manifesto.md`, `alma.md` e `virada-aquisicao.md`.
2. `clients/[slug]/client.md`.
3. `perception.json`, `visual-dna.json` e `reference-context.json`.
4. `intelligence/creative-os.md`, `intelligence/creative-direction-engine.md` e
   `intelligence/experience-continuity.md`.
5. [contracts.md](references/contracts.md).

Interromper se percepção ou direção visual obrigatória estiver ausente.

## Fluxo

1. Criar `clients/[slug]/outputs/site/[project-id]/`.
2. Copiar e preencher:
   - `templates/motion-site/agent-roster.template.json`
   - `templates/motion-site/task-graph.template.json`
   - `templates/motion-site/creation-manifest.template.json`
3. Definir o objetivo de aquisição antes da solução visual.
4. Ativar apenas os papéis necessários no `agent-roster.json`.
5. Executar o `task-graph.json` respeitando dependências e checkpoints.
6. Permitir paralelismo somente entre tarefas sem dependência comum pendente.
7. Exigir crítica por agente diferente do construtor.
8. Preencher o manifesto durante a construção, não depois.
9. Marcar no DOM cada beat capturável com `data-capture-id`.
10. Validar:

```powershell
node skills/criacao/motion-site-factory/scripts/validate-run.mjs clients/[slug]/outputs/site/[project-id]
```

11. Só liberar deploy e vídeo quando o validador retornar `VALID`.

## Hierarquia

```text
acquisition-director
  -> orchestrator
     -> experience-architect
        -> narrative-director
           -> copy-strategist
           -> visual-asset-director
     -> motion-builder
     -> frontend-builder
  -> critic
  -> performance-executor
  -> creation-documentarian
```

O orquestrador coordena; não reescreve silenciosamente o trabalho dos especialistas. O crítico não pode aprovar tarefa que executou.

## Regras de custo

- Reservar o modelo mais capaz para aquisição, arquitetura, direção e crítica.
- Usar modelos econômicos para busca, inventário, variações, compressão e smoke tests.
- Não abrir agente quando uma tarefa determinística ou um script resolver.
- Entregar a cada agente apenas o pacote de contexto definido em `context_refs`.
- Registrar estimativa e uso real em `budget`.

## Handoff para vídeo

O `creation-manifest.json` deve conter:

- tese e transformação narrativa;
- contrato de reação em 3s, 15s e antes do CTA;
- curva de intensidade e continuidade seção a seção;
- orçamento e função da copy em cada seção;
- seções com `capture_id`;
- estados interativos;
- motion beats com início, ação e resolução;
- ativos, proveniência, função narrativa e pacote de camadas;
- decisões de direção;
- capture plan por viewport;
- ângulos de vídeo e CTA;
- caminhos dos arquivos finais.

Usar `website-to-video` para showcase do site, `product-launch-video` quando o site promove produto e `motion-graphics` para cortes curtos sem narração.

## Gates

Reprovar quando:

- um papel não possui output e critério de aceitação;
- existem dependências cíclicas;
- construtor e crítico são o mesmo papel;
- o site não possui captura mobile;
- motion não tem fallback reduzido;
- um asset não possui origem;
- não existe ao menos um asset exclusivo;
- a curva narrativa concentra toda a recompensa no hero;
- duas seções consecutivas viram texto sem progressão, prova ou recompensa;
- o CTA final não resolve a tensão aberta no hero;
- uma seção importante não possui `capture_id`;
- a documentação descreve intenção, mas não aponta estado observável;
- o vídeo exigiria reconstruir a narrativa do zero.

## Saída

```text
clients/[slug]/outputs/site/[project-id]/
  agent-roster.json
  task-graph.json
  creation-manifest.json
  source/
  assets/
  qa/
  captures/
  video/
```
