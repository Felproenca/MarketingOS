# skill-investigar.md — Investigação de Referência ou Concorrente
> Skill isolada do MarketingOS.
> Analisa um perfil (concorrente, referência de mercado ou inspiração) e extrai padrões acionáveis.
> Input: URL ou @ de perfil. Output: relatório de inteligência salvo em `outputs/inteligencia/`.

---

## Contexto mínimo necessário
→ client.md — Blocos 2 e 3 (persona, posicionamento, concorrência)
→ intelligence/benchmarks.json — métricas de referência do nicho
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, alma.md, notes.md, estrategia.md

---

## Objetivo

Extrair padrões de conteúdo, posicionamento e estratégia de um perfil externo para:
- Identificar o que está funcionando no nicho
- Encontrar gaps que o cliente pode explorar
- Calibrar benchmarks de engajamento e frequência
- Inspirar temas, formatos e ângulos de copy

**Não é para copiar — é para entender o campo de jogo.**

---

## Input Esperado

```
1. Alvo           → URL, @perfil ou nome do concorrente/referência
2. Plataforma     → Instagram / YouTube / TikTok / LinkedIn / Site
3. Objetivo       → [ Concorrente direto / Referência de nicho / Inspiração de conteúdo ]
4. Foco da análise → [ Conteúdo / Posicionamento / Oferta / Frequência / Engajamento ]
```

Se o alvo não tiver URL acessível, peça prints ou descrição manual e adapte o protocolo.

---

## Protocolo de Investigação

### Passo 1 — Identificar o perfil

Colete as informações públicas disponíveis:

```
Nome/handle: [nome]
Bio/tagline: [texto da bio]
Seguidores: [número aproximado]
Frequência de posts: [vezes por semana/mês]
Formatos usados: [carrossel / reels / stories / texto / vídeo longo]
```

---

### Passo 2 — Analisar últimos 9 a 12 conteúdos

Para cada conteúdo observado, extraia:

| # | Formato | Tema | Gancho | Engajamento estimado | CTA |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| ... | | | | | |

Identifique os **3 conteúdos com maior engajamento** e descreva por que funcionaram.

---

### Passo 3 — Mapear posicionamento

```
Proposta de valor percebida: [o que eles comunicam que fazem/entregam]
Tom de voz: [formal / informal / técnico / inspiracional / educativo / humorístico]
Persona do conteúdo: [para quem falam, quem é o público implícito]
Diferencial explicitado: [o que dizem ser diferentes]
Preço/oferta visível: [o que vendem e como precificam — se aparece]
```

---

### Passo 4 — Identificar gaps e oportunidades

Com base no perfil analisado vs. o cliente ativo:

```
O que eles fazem bem que o cliente ainda não faz:
  - [gap 1]
  - [gap 2]

O que o cliente faz melhor ou diferente:
  - [vantagem 1]
  - [vantagem 2]

Temas que eles ignoram mas o público provavelmente quer:
  - [oportunidade 1]
  - [oportunidade 2]

Ângulos de copy que não foram explorados:
  - [ângulo 1]
  - [ângulo 2]
```

---

### Passo 5 — Benchmarks do perfil

```
Frequência de publicação: [X posts/semana]
Formatos dominantes: [carrossel X%, reels X%, stories X%]
Engajamento médio estimado: [likes + comentários / seguidores]
Horários de publicação observados: [se visível]
Hashtags recorrentes: [lista]
```

---

## Formato de Output

Salve em `clients/[slug]/outputs/inteligencia/[YYYY-MM-DD]-investigacao-[alvo].md`:

```markdown
# Investigação — [Nome do Perfil]
Data: [YYYY-MM-DD]
Plataforma: [plataforma]
Objetivo: [concorrente / referência / inspiração]

## Perfil
[dados do Passo 1]

## Análise de Conteúdo
[tabela do Passo 2 + top 3 com análise]

## Posicionamento
[dados do Passo 3]

## Gaps e Oportunidades
[dados do Passo 4]

## Benchmarks
[dados do Passo 5]

## Próximos passos sugeridos
- [ação concreta 1 para o cliente]
- [ação concreta 2]
```

---

## Regras

1. Nunca afirme métricas exatas sem fonte — use "estimado" ou "aproximado".
2. Foco em padrões, não em casos isolados — um post viral não é estratégia.
3. A análise deve sempre terminar com ações concretas para o cliente ativo.
4. Não faça julgamento de valor sobre o concorrente — analise o que funciona, não o que é "melhor".
5. Se o perfil não tiver dados suficientes visíveis, sinalize e ajuste o escopo.

---

## Exemplo de Ativação

```
/investigar @concorrente-exemplo
Plataforma: Instagram
Objetivo: Concorrente direto
Foco: Conteúdo + Posicionamento
```

---

*Skill v1.0 — MarketingOS*
*Inspirado no padrão Sherlock do Opensquad — adaptado para análise manual sem browser automation.*
