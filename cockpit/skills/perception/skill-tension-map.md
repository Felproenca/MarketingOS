---
name: skill-tension-map
version: "1.0"
group: perception
command: /tensoes [slug]
inputs:
  required: [slug]
  optional: [periodo, canal, formato]
env: []
---

# skill-tension-map.md — Mapa de Tensões de Conteúdo
> Substitui "sobre o que vamos falar?" por "que conflito de percepção merece ser explorado?"
> Output: calendário de tensões editoriais priorizadas por relevância e momento da marca.

---

## Princípio

Assunto é categoria. Tensão é conflito.

Conteúdo sobre "marketing digital" é categoria — infinito e sem diferenciação.
Conteúdo sobre "atividade que parece progresso" é tensão — específico, provocador, diferenciável.

A diferença:
- Assunto atrai atenção
- Tensão constrói autoridade

Este skill mapeia as tensões que a marca tem legitimidade para explorar — baseado em quem ela é, não no que está em alta.

---

## Contexto mínimo necessário

Carregar:
- `clients/[slug]/client.md`
- `clients/[slug]/outputs/branding/perception.json` (se existir — especialmente `camada_3_assinatura`)
- `alma.md` (raiz)

NÃO carregar: visual-dna.json, campaigns.md, posts existentes, metrics.json.

---

## Pipeline

### Passo 1 — Mapa de autoridade

Identificar em quais territórios esta marca tem autoridade para falar — não apenas interesse.

Autoridade vem de:
- Experiência direta (o que viveu, construiu, errou)
- Perspectiva única (o que enxerga que outros não enxergam)
- Posicionamento declarado (o que a marca defende publicamente)

Listar 5-8 territórios com nível de autoridade (alta / média / baixa).

---

### Passo 2 — Identificação de tensões

Para cada território de alta autoridade, mapear as tensões latentes.

**Formato de tensão editorial:**
`[conceito aceito] vs [realidade que a marca enxerga]`

Exemplos:
- "atividade vs progresso" — todo mundo faz muito, poucos avançam
- "automação vs clareza" — quanto mais se automatiza, menos se sabe o que está certo
- "volume vs percepção" — postar mais não cria mais impacto
- "ferramenta vs sistema" — ter ferramentas não é ter sistema
- "conteúdo vs posicionamento" — produzir mais não constrói autoridade
- "presença vs influência" — estar em todo lugar não significa nada
- "dados vs direção" — ter métricas não é saber o que fazer com elas

Regra: cada tensão deve revelar algo que vai contra o senso comum do mercado.
Se a tensão não gera algum grau de desconforto, não é tensão — é obviedade.

---

### Passo 3 — Filtro de alinhamento

Para cada tensão identificada, aplicar os filtros:

1. **A marca tem legitimidade para explorar essa tensão?**
   Sim apenas se ela viveu essa contradição ou tem prova de perspectiva.

2. **Isso poderia ser dito só por essa marca?**
   Se qualquer concorrente poderia dizer a mesma coisa, a tensão não é diferenciadora.

3. **Isso conversa com o medo real do ICP?**
   Não com o medo declarado — com o medo que ele não fala em voz alto.

4. **Isso abre espaço para uma posição clara?**
   A marca precisa ter um lado na tensão. Conteúdo que não tem lado não cria autoridade.

Remover tensões que falham em qualquer um dos 4 filtros.

---

### Passo 4 — Priorização

Classificar as tensões aprovadas em dois eixos:

**Relevância atual** — quão presente essa tensão está na vida do ICP agora
**Urgência de posicionamento** — quanto a marca precisa ocupar esse território antes do concorrente

Resultado: matriz 2x2

```
Alta relevância + Alta urgência   → Publicar agora
Alta relevância + Baixa urgência  → Construir base
Baixa relevância + Alta urgência  → Reserva estratégica
Baixa relevância + Baixa urgência → Descartar por ora
```

---

### Passo 5 — Calendário de tensões

Para cada tensão "Publicar agora", gerar:

```
Tensão: [nome]
Posição da marca: [o lado que a marca defende]
Formatos recomendados: [post | carrossel | reel | thread]
Ângulos de entrada:
  → [ângulo 1 — racional]
  → [ângulo 2 — emocional]
  → [ângulo 3 — build in public]
Prova necessária: [o que a marca precisa mostrar para ter credibilidade nessa tensão]
Perigo a evitar: [como esse conteúdo pode soar errado se mal executado]
```

---

## Output

Entregar ao operador:

1. **Mapa de autoridade** — territórios e nível de legitimidade
2. **Lista de tensões aprovadas** — com filtros aplicados
3. **Calendário priorizado** — tensões "Publicar agora" com estrutura completa
4. **Reserva estratégica** — tensões para os próximos 30-60 dias

Salvar em `clients/[slug]/outputs/inteligencia/tension-map-[data].md`

---

## Diferença entre tensão e tendência

Tendência: "IA está transformando o marketing" → todo mundo fala isso
Tensão: "quanto mais IA se usa para produzir, menos se sabe o que merece existir" → abre conflito

Tendência atrai cliques no curto prazo.
Tensão constrói autoridade no médio prazo.

Este skill trabalha com tensão.

---

## Ativação

```
Use a skill-tension-map.md.

/tensoes felipe-proenca
periodo: próximos 30 dias
canal: instagram
```

---

*Skill v1.0 — MarketingOS Perception Engine*
*Conteúdo sem tensão é informação. Tensão sem posição é provocação vazia. Os dois juntos são autoridade.*
