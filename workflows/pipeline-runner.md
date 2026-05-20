# pipeline-runner.md — Orquestrador de Workflows
> Localização: /workflows/pipeline-runner.md
> Protocolo para encadear múltiplas skills em sequência com checkpoints de aprovação.
> Use quando uma entrega exige mais de uma skill executada em ordem.

---

## O que é um Pipeline

Um pipeline é uma sequência de skills com:
- **Ordem de execução** definida
- **Persona ativa por etapa** — Claude assume o perfil mais adequado para cada tipo de trabalho
- **Checkpoints** onde o usuário aprova antes de avançar
- **Estado compartilhado** — output de uma skill alimenta a próxima
- **Run ID** — identificador único para rastrear a entrega completa

---

## Personas Disponíveis

Cada etapa pode ativar uma persona antes de executar. A persona define foco, vocabulário e critério de qualidade sem criar arquivos de agente separados.

| Persona | Quando usar | Lente de qualidade |
|---|---|---|
| `estrategista` | Posicionamento, análise, decisões de negócio | "Isso gera resultado mensurável?" |
| `copywriter` | Copy de posts, carrosseis, legendas, CTAs | "Isso para o scroll? O CTA é claro?" |
| `diretor-visual` | Briefings visuais, design system, UI direction | "Isso está alinhado ao brand-kit?" |
| `analista` | Métricas, funil, diagnósticos, relatórios | "Os dados sustentam essa conclusão?" |
| `revisor` | Revisão final antes de qualquer checkpoint | "Isso está pronto para o cliente ver?" |

### Ativação de Persona

Antes de iniciar uma etapa com persona declarada, anuncie:

```
[ Persona ativa: copywriter ]
Foco: clareza, conversão e alinhamento de tom com a marca.
Critério de entrega: o copy para o scroll e o CTA é específico.
```

A persona permanece ativa até o fim da etapa. Na etapa seguinte, desative e ative a próxima se declarada.

---

## Formato de Declaração de Pipeline

Para iniciar um pipeline, declare assim:

```
PIPELINE: [nome-do-pipeline]
Cliente: [slug]
Objetivo: [o que este pipeline entrega ao final]

Etapas:
  1. [skill] | persona: [persona] — [o que esta etapa produz]
  2. [skill] | persona: [persona] — [o que esta etapa produz]
  3. [skill] | persona: [persona] — [o que esta etapa produz]

Checkpoint após etapa: [número(s)]
```

---

## Pipelines Pré-definidos

### `/pipeline branding-completo`
```
Objetivo: Identidade de marca completa — estratégia + visual + design system

1. skill-branding.md     | persona: estrategista  → Estratégia, posicionamento, tom, referências
   ── CHECKPOINT ──
2. brand-kit.json        | persona: diretor-visual → Cores, tipografia, identidade visual
3. skill-site-builder.md | persona: diretor-visual → Site ou landing page com marca aplicada
   ── CHECKPOINT ──
```

### `/pipeline lancamento-conteudo`
```
Objetivo: Pacote de conteúdo para lançamento — carrossel + post + legenda

1. skill-offer-positioning.md | persona: estrategista → Posicionamento da oferta e mensagem principal
   ── CHECKPOINT ──
2. skill-carousel.md          | persona: copywriter   → Carrossel com copy e briefing visual
3. skill-post.md              | persona: copywriter   → Post de apoio (Feed ou Story)
   ── CHECKPOINT ──
4. skill-image-generation.md  | persona: diretor-visual → Prompts de imagem para os slides
   ── CHECKPOINT (revisor) ──
```

### `/pipeline diagnostico`
```
Objetivo: Diagnóstico completo de performance e oportunidades

1. skill-dashboard.md        | persona: analista      → Relatório de métricas e performance atual
   ── CHECKPOINT ──
2. skill-funnel-analysis.md  | persona: analista      → Diagnóstico de funil ponta a ponta
3. skill-offer-positioning.md | persona: estrategista → Reposicionamento baseado nos dados
   ── CHECKPOINT ──
```

### `/pipeline seo-completo`
```
Objetivo: Estratégia SEO com implementação e conteúdo otimizado

1. skill-investigar.md | persona: analista      → Análise de concorrentes e palavras-chave
   ── CHECKPOINT ──
2. skill-seo.md        | persona: estrategista  → Estratégia e plano de otimização
3. skill-post.md       | persona: copywriter    → Conteúdo otimizado para SEO
   ── CHECKPOINT (revisor) ──
```

### `/pipeline campanha-paga`
```
Objetivo: Campanha completa para Google/Meta — copy + anúncio + exportação

1. skill-offer-positioning.md | persona: estrategista → Mensagem e ângulo da oferta
   ── CHECKPOINT ──
2. skill-anuncio.md           | persona: copywriter   → Estrutura de campanha + CSV exportável
3. skill-image-generation.md  | persona: diretor-visual → Criativos e prompts de imagem
   ── CHECKPOINT (revisor) ──
```

---

## Protocolo de Execução

### Ao iniciar um pipeline:

1. Confirme o cliente ativo (via `state.json`)
2. Gere um **Run ID**: formato `YYYY-MM-DD-[nome-pipeline]`
3. Anuncie o pipeline:

```
🚀 Pipeline iniciado: [nome]
Run ID: [YYYY-MM-DD-nome]
Cliente: [slug]
Etapas: [N] | Checkpoints: [N]

Iniciando Etapa 1 — [nome da skill]...
```

---

### A cada etapa:

1. Se a etapa tem `persona` declarada, ative-a antes de começar
2. Execute a skill correspondente com contexto do cliente
3. Salve o output em `clients/[slug]/outputs/[tipo]/`
4. Desative a persona ao concluir a etapa
5. Anuncie a conclusão da etapa

```
✅ Etapa [N] concluída — [nome] [ persona: [nome] ]
Output: [caminho do arquivo gerado]
```

---

### A cada checkpoint:

**Pare completamente.** Não avance para a próxima etapa sem aprovação.

```
── CHECKPOINT [N/total] ──────────────────────────

Etapa concluída: [nome]
Output gerado: [arquivo]

Antes de continuar, revise o output acima.

Opções:
  [A] Aprovar e continuar para Etapa [N+1]
  [R] Solicitar revisão desta etapa
  [P] Pausar pipeline (retomar depois com /pipeline retomar [run-id])
  [X] Cancelar pipeline

Aguardando sua decisão...
──────────────────────────────────────────────────
```

Só avance após resposta explícita do usuário.

---

### Ao concluir o pipeline:

```
🏁 Pipeline concluído: [nome]
Run ID: [YYYY-MM-DD-nome]

Entregáveis gerados:
  - [output 1] → [caminho]
  - [output 2] → [caminho]
  ...

Próximo passo sugerido: [ação lógica seguinte]

Deseja salvar a sessão agora? (/salvar)
```

---

## Retomada de Pipeline Pausado

Se o usuário pausou em um checkpoint e quer retomar:

```
/pipeline retomar [run-id]
```

O sistema deve:
1. Ler `clients/[slug]/runs.md` para encontrar o estado do pipeline
2. Confirmar qual foi a última etapa concluída
3. Retomar a partir da próxima etapa

---

## Criando Pipelines Customizados

O usuário pode declarar um pipeline ad hoc:

```
/pipeline custom
Etapas: skill-carousel.md → skill-post.md
Checkpoint após: etapa 1
```

O pipeline runner executa conforme o protocolo acima.

---

## Regras

1. Nunca avançe past um checkpoint sem resposta do usuário.
2. Todo output de pipeline vai para `clients/[slug]/outputs/` — nunca temporário.
3. O Run ID deve ser registrado em `clients/[slug]/runs.md` ao final.
4. Se uma etapa falhar (contexto insuficiente, dados ausentes), pare e sinalize — não improvise.
5. O output de uma etapa deve ser explicitamente passado como input da próxima quando relevante.

---

*Pipeline Runner v1.1 — MarketingOS*
*Inspirado no runner do Opensquad — adaptado com persona injection por etapa.*
