---
name: skill-branding
version: "1.0"
group: criacao
command: /branding
inputs:
  required: [client.md, notes.md, brand-kit.json]
  optional: [intelligence/patterns.md, intelligence/benchmarks.json]
env: []
---

# skill-branding.md - Direcao Criativa e Branding
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operacao.
> Input obrigatorio: `client.md`, `notes.md`, `brand-kit.json`.

---

## Contexto mínimo necessário
→ client.md — completo (todos os blocos)
→ notes.md — inteligência acumulada e histórico de decisões visuais
→ brand-kit.json — estado atual da identidade
→ outputs/branding/perception.json — se existir (gerado pelo /perceber)
→ intelligence/patterns.md — trechos relevantes ao nicho
→ intelligence/reference-library/index.json — banco de referências semânticas
→ NÃO carregar: metrics.json, campaigns.md, alma.md, estrategia.md, benchmarks.json

---

## Hierarquia de execução

```
/perceber [slug]         ← Perception Engine — obrigatório para novo cliente
      ↓ perception.json
/branding                ← define identidade operacional, herda perception.json
      ↓ positioning.md, design-system.json, assinatura_perceptiva
/direcao-criativa        ← converte em DNA Visual e movimento
      ↓ visual-dna.json
Skills de criação        ← herdam visual-dna.json + perception.json
```

Se `perception.json` existir: ler e herdar `camada_3_assinatura` e `camada_4_visual_dna` antes de definir qualquer diretriz visual.
Se `perception.json` não existir: executar as 3 perguntas da Leitura de Alma como substituto mínimo antes de continuar.

O `visual-dna.json` é a fonte de verdade para criação. O `perception.json` é a fonte de verdade para identidade.

---

## Objetivo da Skill

Criar a camada de direcao criativa que evita output generico e orienta todas as entregas visuais e de UX.

Esta skill define:
- posicionamento de marca
- estrategia de marca
- direcao visual
- direcao de UI
- referencias
- design system operacional

Sem esta etapa, o site builder nao deve gerar homepage.

---

## Inputs Obrigatorios

1. `clients/[slug]/client.md`
2. `clients/[slug]/notes.md`
3. `clients/[slug]/brand-kit.json`
4. `intelligence/patterns.md` (trechos relevantes ao nicho)
5. `intelligence/benchmarks.json` (canal site/landing page)
6. `intelligence/experiments.md` (experimentos relacionados a branding/UI)

Se faltar contexto, sinalizar explicitamente antes de seguir.

---

## Output Obrigatorio

Salvar em `clients/[slug]/outputs/branding/`:

1. `positioning.md`
2. `brand-strategy.md`
3. `visual-direction.md` — incluindo `assinatura_perceptiva` e `anti_dna`
4. `ui-direction.md`
5. `references.md` — referências do `intelligence/reference-library/index.json` com matching semântico
6. `design-system.json` — incluindo campos `signature`, `tensions`, `anti_dna`

---

## Sequencia de Execucao

1. Diagnosticar contexto real da marca no `client.md`
2. Consolidar sinais de preferencia/rejeicao no `notes.md`
3. Cruzar com `brand-kit.json`
4. Definir posicionamento e pilares
5. Definir direcao visual (taste, composicao, densidade, fotografia)
6. Definir direcao de UI (hierarquia, layout, ritmo, interacao)
7. Definir design system em JSON
8. Registrar decisoes relevantes em `campaigns.md`

---

## Estrutura de Cada Arquivo

### 1) positioning.md
- ICP principal
- problema central
- promessa principal
- diferenciais verificaveis
- tom competitivo (como parecer no mercado)

### 2) brand-strategy.md
- territorio de marca
- pilares de mensagem
- narrativa principal (antes -> depois)
- prova necessaria para sustentar promessa
- riscos de posicionamento e mitigacao

### 3) visual-direction.md
- estilos obrigatorios (3 a 5)
- lista explicita de "evitar"
- paleta macro (base, apoio, acento)
- tipografia (funcao de cada familia)
- fotografia/iluminacao/composicao
- principios de layout (espaco, ritmo, contraste)

### 4) ui-direction.md
- principios de UX (clareza, legibilidade, fluxo)
- arquitetura recomendada de homepage
- ordem de blocos com objetivo de conversao
- nivel de densidade visual
- regras de CTA (posicao, repeticao, destaque)

### 5) references.md
- referencias diretas (marcas/sites)
- motivo da referencia (o que copiar, o que nao copiar)
- traducao para o contexto do cliente

### 6) design-system.json
Modelo base:

```json
{
  "style_keywords": ["premium", "minimal", "editorial"],
  "color_system": {
    "background": "",
    "surface": "",
    "text_primary": "",
    "text_secondary": "",
    "accent": "",
    "cta": ""
  },
  "typography": {
    "headline_style": "",
    "body_style": "",
    "scale": "comfortable"
  },
  "spacing": "large",
  "layout_density": "clean",
  "border_radius": "minimal",
  "shadows": "soft",
  "components": {
    "buttons": "minimal",
    "cards": "flat",
    "inputs": "clean"
  },
  "ux_rules": {
    "cta_repetition_min": 3,
    "hero_objective": "clareza de oferta",
    "mobile_first": true
  },
  "avoid": [
    "gradientes exagerados",
    "neon",
    "sombra pesada",
    "visual tech generico"
  ]
}
```

---

## Regras de Qualidade

1. Nao inventar prova, numero, depoimento ou benchmark.
2. Distinguir dado real de hipotese estimada.
3. Toda decisao visual precisa ter justificativa de conversao ou posicionamento.
4. Evitar termos vagos sem traducao operacional ("sofisticado" sem regra pratica).
5. Garantir consistencia entre `visual-direction.md` e `design-system.json`.

---

## Integracao com skill-site-builder

Antes de qualquer geracao de homepage, a skill de site deve ler:
1. `client.md`
2. `brand-kit.json`
3. `outputs/branding/visual-direction.md`
4. `outputs/branding/design-system.json`
5. `outputs/branding/references.md`

Sem esses arquivos, o site builder deve interromper e solicitar execucao da `skill-branding.md`.

---

## Checkpoints

⏸ **CP1 — Posicionamento aprovado**
positioning.md + brand-strategy.md gerados → apresentar para aprovação antes de definir direção visual.
Mudança de posicionamento após este ponto invalida o design-system.

⏸ **CP2 — Design system aprovado**
design-system.json gerado → confirmar paleta, tipografia e regras antes de salvar e liberar para skill-site-builder.

⏸ **CP3 — Teste Supremo**
Antes de encerrar: "Se removermos o logo, o nome e as cores desta marca de qualquer peça gerada a partir deste branding — alguém ainda reconheceria quem está se comunicando?"
Se não → `assinatura_perceptiva` não está específica o suficiente. Refazer antes de liberar.

---

## Checklist antes de entregar

- [ ] Arquivos de branding gerados em `outputs/branding/`
- [ ] Direcao visual com "estilo" e "evitar"
- [ ] Sistema de UI traduzido para JSON acionavel
- [ ] Decisoes registradas em `campaigns.md`
- [ ] Sinalizacao de lacunas de contexto quando existirem

---

*Skill v1.0 - MarketingOS*
