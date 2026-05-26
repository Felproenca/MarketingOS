# relatorio-executivo.md — Relatório Mensal do Head Implantado
> Localização: /workflows/relatorio-executivo.md
> Execute ao final de cada mês, antes da reunião estratégica mensal.
> Pré-requisito: metrics.json do mês completo + notes.md atualizado.

---

## Objetivo

Gerar um relatório mensal que o cliente leia em 5 minutos e entenda o que aconteceu, por que aconteceu e o que muda.

Não é dump de métricas. Não é apresentação de slides. É narrativa executiva.

```
O que o relatório NÃO é:
  → Lista de posts publicados
  → Tabela de métricas sem contexto
  → Justificativa de trabalho realizado

O que o relatório É:
  → O que aconteceu este mês (em 3 linhas)
  → Por que aconteceu (causa real, não desculpa)
  → O que muda no próximo mês (decisão baseada em dado)
```

---

## Input Obrigatório

```
Slug do cliente:   [ informar ao ativar ]
Mês de referência: [ MM/AAAA ]
Arquivos base:
  → /clients/[slug]/metrics.json     — dados do mês
  → /clients/[slug]/notes.md         — decisões e aprendizados do período
  → /clients/[slug]/campaigns.md     — campanhas executadas
  → /clients/[slug]/estrategia.md    — objetivos que foram perseguidos
  → intelligence/benchmarks.json     — referência de performance do nicho
Destino do output:
  → /clients/[slug]/outputs/dashboard/relatorio-[MMAAAA].md
```

---

## Estrutura do Relatório

Gerar exatamente nesta ordem. Sem adicionar seções extras.

---

### SEÇÃO 1 — Resumo Executivo

```
3 a 5 linhas. O cliente deve entender o mês sem ler mais nada.

Formato:
"[Mês] foi um mês de [caracterização honesta — crescimento, estabilização, aprendizado].
 O principal resultado foi [1 número ou fato concreto].
 O que mais impactou a operação foi [causa principal].
 No próximo mês, [o que muda em 1 linha]."

Regras:
→ Sem adjetivos vazios ("ótimo mês", "grande evolução") — só fatos
→ Se o mês foi ruim: dizer que foi ruim com a causa
→ Se o mês foi bom: dizer o que contribuiu, não só celebrar
```

---

### SEÇÃO 2 — KPIs do Mês

```
4 métricas. Não mais. Escolher as que representam a saúde do negócio deste cliente.

Formato:

| Métrica              | Meta do mês | Realizado | vs. mês ant. | Status   |
|----------------------|-------------|-----------|--------------|----------|
| [KPI 1]              | [meta]      | [valor]   | [+/- %]      | ✅ / ⚠️ / 🔴 |
| [KPI 2]              | [meta]      | [valor]   | [+/- %]      | ✅ / ⚠️ / 🔴 |
| [KPI 3]              | [meta]      | [valor]   | [+/- %]      | ✅ / ⚠️ / 🔴 |
| [KPI 4]              | [meta]      | [valor]   | [+/- %]      | ✅ / ⚠️ / 🔴 |

Status:
  ✅ = atingiu ou superou a meta
  ⚠️ = ficou próximo mas não atingiu (até 20% abaixo)
  🔴 = ficou significativamente abaixo (mais de 20%)

Benchmarks de referência (nicho do cliente):
  → [extrair do intelligence/benchmarks.json — sinalizar claramente como referência de mercado]
```

---

### SEÇÃO 3 — O que Aconteceu

```
Narrativa do mês. Máx. 200 palavras. Chronologia dos fatos relevantes.

Estrutura sugerida:
  → Semana 1: [o que foi executado + primeiro resultado]
  → Semana 2: [ajuste ou novo aprendizado]
  → Semana 3: [o que escalou ou foi pausado]
  → Semana 4: [fechamento + dado final]

Regras:
→ Fatos, não atividades — "o carrossel de segunda teve 450 salvamentos" é fato;
  "publicamos 3 posts" é atividade
→ Incluir o que não funcionou — sem isso o relatório não é confiável
→ Referenciar campanhas pelo nome registrado em campaigns.md
```

---

### SEÇÃO 4 — Por que Aconteceu

```
A análise de causa. Máx. 3 pontos. Um parágrafo por causa.

Para cada ponto:
  Fato:   [o que aconteceu — dado específico]
  Causa:  [por que aconteceu — hipótese baseada em dado, não intuição]
  Prova:  [o que suporta essa hipótese — comparativo, teste, feedback]

Exemplo:
  Fato:   O alcance orgânico caiu 18% em relação ao mês anterior.
  Causa:  O algoritmo do Instagram priorizou Reels — nosso conteúdo é majoritariamente carrossel.
  Prova:  Os 3 posts com vídeo tiveram alcance médio 2,3x maior que os carrosseis no mesmo período.

Regra: causa hipotética é aceitável se sinalizada como hipótese — nunca apresentar incerteza como certeza.
```

---

### SEÇÃO 5 — O que Muda

```
Decisões para o próximo mês. Máx. 5 itens. Cada item tem um responsável e um prazo.

Formato:
  → [Decisão]: [ação concreta] — Responsável: [Head / Cliente] — Prazo: [data ou "até [data]"]

Exemplos:
  → Testar Reels: produzir 2 Reels por semana em vez de 4 carrosseis — Responsável: Head — A partir de [data]
  → Aumentar orçamento de tráfego: de R$500 para R$800/mês — Responsável: Cliente — Aprovação até [data]
  → Foto do produto: cliente envia 10 novas fotos para o banco de imagens — Responsável: Cliente — Até [data]

Regra: só entram aqui decisões tomadas — não sugestões. Sugestões ficam na reunião.
```

---

### SEÇÃO 6 — Próximo Mês

```
Plano executivo do mês seguinte. Máx. 10 linhas.

6.1 Foco do mês
    → 1 frase — o que o próximo mês vai perseguir acima de tudo

6.2 Calendário de conteúdo (resumido)
    → Frequência por canal
    → Temas/formatos prioritários

6.3 Campanhas previstas
    → Nome + objetivo + orçamento + datas

6.4 KPIs e metas
    → As mesmas 4 métricas da Seção 2 — com metas para o mês seguinte
    → Metas baseadas em: resultado do mês atual + ajuste realista

6.5 O que precisa do cliente
    → Lista de insumos que o Head precisa receber para executar
    → Com prazo claro
```

---

### RODAPÉ DO RELATÓRIO

```
Gerado em: [data]
Referente a: [MM/AAAA]
Preparado por: [Nome do Head] via MarketingOS
Próxima reunião: [data agendada]

---
*Dados de performance extraídos de metrics.json. Benchmarks de mercado extraídos de intelligence/benchmarks.json.*
*Dados de campanhas pagas extraídos de campaigns.md.*
```

---

## Salvamento do Output

```
Salvar em: /clients/[slug]/outputs/dashboard/relatorio-[MMAAAA].md

Exemplo: /clients/shana-joias/outputs/dashboard/relatorio-052026.md

Após salvar:
  → Registrar em notes.md: "Relatório [MM/AAAA] gerado e salvo."
  → Enviar ao cliente antes da reunião mensal (pelo menos 24h antes)
```

---

## Regras deste Workflow

1. **Ler o metrics.json completo antes de escrever qualquer linha** — nunca estimar dados que existem
2. **Seção 1 é escrita por último** — o resumo só é possível depois de entender o mês inteiro
3. **Benchmarks do nicho sempre referenciados** — para o cliente saber se o resultado é bom ou ruim para o setor
4. **Dados ruins não são escondidos** — relatório que só mostra o que foi bem não é confiável
5. **O relatório é enviado antes da reunião** — não apresentado durante; a reunião é para decidir, não para ler
6. **Máximo de 2 páginas em formato texto** — se passou disso, está detalhado demais para executivo

---

## Checklist de Entrega

- [ ] metrics.json do mês completo e atualizado?
- [ ] Resumo executivo escrito por último (após entender o mês todo)?
- [ ] 4 KPIs com meta, realizado e comparativo?
- [ ] Benchmarks do nicho referenciados (benchmarks.json)?
- [ ] Seção "O que aconteceu" com fatos, não atividades?
- [ ] Seção "Por que aconteceu" com causas baseadas em dado?
- [ ] Seção "O que muda" só com decisões tomadas (não sugestões)?
- [ ] Próximo mês com metas realistas e insumos necessários do cliente?
- [ ] Arquivo salvo em /outputs/dashboard/relatorio-[MMAAAA].md?
- [ ] Enviado ao cliente com antecedência mínima de 24h antes da reunião?

---

## Exemplo de Ativação

```
Execute o workflow /workflows/relatorio-executivo.md.

Cliente: [slug]
Mês de referência: [MM/AAAA]
```

---

*Workflow v1.0 — MarketingOS*
