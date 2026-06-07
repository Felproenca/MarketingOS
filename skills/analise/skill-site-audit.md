---
name: skill-site-audit
version: "1.0"
group: analise
command: /analisar site
inputs:
  required: [client.md]
  optional: [campaigns.md, metrics.json, intelligence/repertoire-updaters/acquisition.md]
env: []
---

# skill-site-audit.md - Auditoria Comercial de Site
> Diagnostica por que um site, landing page ou pagina de prospect nao converte.
> Nao e auditoria tecnica pura. E diagnostico comercial para decisao.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - negocio, persona, oferta, concorrencia e tom
- URL ou prints do site analisado
- `campaigns.md` - somente se houver campanha ativa levando trafego para a pagina
- `metrics.json` - somente se houver dados reais de trafego/conversao
- `intelligence/repertoire-updaters/acquisition.md` - apenas categorias de conversao/funil e prova/fechamento, se estiver aplicando repertorio externo

Nao carregar:
- `brand-kit.json`, exceto se a auditoria for tambem visual
- outputs antigos de outros clientes
- dados de clientes nao relacionados

---

## Objetivo

Gerar um diagnostico acionavel que responda:

```text
Por que esta pagina nao esta convertendo?
Onde o lead perde confianca?
O que corrigir primeiro para gerar mais contato, lead ou venda?
Que mensagem curta pode ser enviada ao prospect para abrir conversa?
```

---

## Entrada

```text
Cliente/prospect:
URL:
Tipo de pagina: home | landing | servico | produto | captura | perfil linkado
Objetivo da pagina: lead | WhatsApp | compra | agendamento | autoridade
Fonte de trafego: organico | ads | social | direto | desconhecido
Concorrente comparavel: [opcional]
Dados reais disponiveis: sim | nao
```

---

## Score Comercial 0-100

Pontuar antes de recomendar:

```text
Clareza da promessa:          0-20
CTA e proximo passo:          0-15
Prova e confianca:            0-15
Friccao de conversao:         0-15
Oferta e reducao de risco:    0-15
SEO/AEO basico:               0-10
Comparacao competitiva:       0-10
Total:                        0-100
```

Classificacao:

```text
80-100: pronto para escalar, otimizar detalhes
60-79:  bom, mas vaza conversao em pontos especificos
40-59:  mensagem ou funil confusos; corrigir antes de escalar trafego
0-39:   pagina nao sustenta campanha; diagnostico comercial urgente
```

---

## Checklist de Diagnostico

### 1. Promessa

```text
O que a pagina promete em 5 segundos?
Quem entende imediatamente?
O beneficio vem antes da tecnologia/produto?
O H1 poderia ser usado por qualquer concorrente?
```

### 2. CTA

```text
Existe um CTA primario?
Ele diz o beneficio ou so a acao?
Ha reducao de risco perto do CTA?
O WhatsApp/formulario esta facil?
```

### 3. Prova

```text
Ha depoimentos, cases, numeros, prints, logos, antes/depois ou processo real?
A prova aparece antes de pedir decisao?
O que e real vs estimado?
```

### 4. Friccao

```text
Formulario pede mais do que precisa?
Pagina demora, confunde ou exige leitura demais?
Ha objecoes sem resposta?
O mobile esta claro?
```

### 5. SEO/AEO basico

```text
Title/H1 parecem alinhados com busca real?
A pagina responde perguntas que um comprador faria?
Existe estrutura clara para ser citada ou entendida por IA?
Ha paginas faltantes: comparativo, local, servico, FAQ?
```

### 6. Competidor

```text
Concorrente comunica promessa mais clara?
Tem prova melhor?
Tem CTA mais facil?
Tem oferta de entrada melhor?
```

---

## Formato de Output

```markdown
# Auditoria Comercial de Site - [Nome]

Data:
URL:
Tipo de pagina:
Objetivo:

## Score
Score comercial: [0-100]
Classificacao:

## Diagnostico Executivo
[3 a 5 linhas: o que esta travando conversao e por que importa]

## Tabela de Pontuacao
| Dimensao | Nota | Evidencia | Impacto |
|---|---:|---|---|

## Vazamentos de Lead
1. [vazamento]
2. [vazamento]
3. [vazamento]

## Top 5 Correcoes por Impacto
| Prioridade | Correcao | Esforco | Impacto | Prazo |
|---|---|---|---|---|

## Quick Win de 7 Dias
[uma melhoria aplicavel nesta semana]

## Mensagem para Prospect
[texto curto, especifico, com prova de leitura e convite leve]

## Dados, Estimativas e Inferencias
- Dados reais:
- Estimativas:
- Inferencias:
```

---

## Regras

- Separar dado real, estimativa e inferencia.
- Nao inventar metricas, trafego ou conversao.
- Diagnostico precisa gerar proximo passo comercial.
- Antes de sugerir trafego pago, corrigir promessa, CTA e prova.
- Toda auditoria deve terminar com uma melhoria aplicavel em ate 7 dias.
- Se for prospect, a mensagem final deve parecer diagnostico especifico, nao campanha.

---

## Checklist antes de entregar

- [ ] Score 0-100 calculado?
- [ ] Promessa, CTA, prova e friccao avaliados?
- [ ] SEO/AEO basico diferenciado de conversao?
- [ ] Dados reais, estimativas e inferencias separados?
- [ ] Top 5 correcoes priorizadas?
- [ ] Mensagem curta para prospect gerada?

---

*Skill v1.0 - MarketingOS*
