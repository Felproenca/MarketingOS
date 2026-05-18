# client-demo.md — Workflow de Demonstração Comercial
> Localização: /workflows/client-demo.md
> Este workflow orienta o Cursor a gerar uma demonstração completa para apresentar ao cliente antes da contratação.
> Pré-requisito: /clients/[slug]/ criado via create-client.js e client.md preenchido.

---

## Objetivo

Gerar uma apresentação comercial completa que mostre ao cliente potencial o que o MarketingOS já pode fazer pelo negócio dele — antes mesmo de assinar qualquer contrato.

A frase que guia este workflow:

> *"Olha o que eu já fiz pro seu negócio antes mesmo de você me contratar."*

---

## Input Obrigatório

```
Slug do cliente:    [ informar ao ativar ]
Arquivo base:       /clients/[slug]/client.md — deve estar preenchido
Destino do output:  /clients/[slug]/outputs/demo/demo.md
```

Antes de iniciar qualquer etapa, leia o `client.md` completo.
Se algum bloco essencial estiver vazio (Blocos 1, 2, 3 e 4), sinalize e aguarde preenchimento.

---

## Etapas do Workflow

Execute em ordem. Não pule etapas.

---

### ETAPA 1 — Diagnóstico da Presença Atual

**Objetivo:** identificar o ponto de partida real do cliente.

Com base no `client.md`, analise e documente:

```
1.1 Presença digital atual
    → Tem site? Converte ou é só institucional?
    → Quais redes usa? Com qual frequência?
    → Tem tráfego pago ativo?

1.2 Problemas identificados
    → Liste os 3 a 5 problemas mais evidentes na presença atual
    → Seja específico: não "feed fraco", mas "feed sem narrativa, sem CTA e sem consistência visual"

1.3 O que está funcionando (se houver)
    → Não desconstruir o que já gera resultado

1.4 Gap entre situação atual e potencial
    → O que está sendo deixado na mesa hoje?
```

---

### ETAPA 2 — Nova Proposta de Posicionamento

**Objetivo:** reposicionar a marca com clareza e diferenciação.

Com base nos Blocos 2, 3 e 4 do `client.md`, gere:

```
2.1 Posicionamento atual (como a marca aparece hoje)
    → Descrição direta, sem julgamento

2.2 Posicionamento proposto (como deveria aparecer)
    → Proposta de valor clara
    → Público definido
    → Diferencial principal
    → Tom e personalidade da marca

2.3 Tagline sugerida
    → 1 frase que captura o posicionamento proposto
    → Máx. 10 palavras

2.4 Mensagem central
    → O que a marca diz para o cliente ideal em qualquer canal
```

---

### ETAPA 3 — Estrutura de Site

**Objetivo:** mostrar como o site do cliente poderia ser.

Ative a `skill-site-builder.md` com os seguintes parâmetros:

```
Cliente:    [slug]
Objetivo:   geração de leads
Páginas:    Home (landing page)
CTA:        [extrair do client.md]
Modo:       Copy + Estrutura
```

Gere apenas a **Home** com todas as seções:
Hero → Problema → Solução → Serviços → Prova Social → CTA Final

Salve o output na seção correspondente do `demo.md`.

---

### ETAPA 4 — Carrossel Instagram

**Objetivo:** mostrar como seria um carrossel para o Instagram do cliente.

Ative a `skill-carousel.md` com os seguintes parâmetros:

```
Cliente:    [slug]
Tema:       [problema principal do cliente ideal — extraído do Bloco 2 do client.md]
Objetivo:   Autoridade ou Engajamento
Slides:     7
CTA:        [extrair do client.md]
```

Gere o carrossel completo: copy de cada slide + legenda + briefing visual.

Salve o output na seção correspondente do `demo.md`.

---

### ETAPA 5 — Post de Feed

**Objetivo:** mostrar como seria um post orgânico para o Instagram.

Ative a `skill-post.md` com os seguintes parâmetros:

```
Cliente:    [slug]
Formato:    Feed
Tema:       [oportunidade ou diferencial identificado na Etapa 2]
Objetivo:   Autoridade
CTA:        [extrair do client.md]
```

Gere o post completo: visual + legenda + hashtags + briefing visual.

Salve o output na seção correspondente do `demo.md`.

---

### ETAPA 6 — Mini Dashboard Conceitual

**Objetivo:** mostrar o que o cliente passaria a acompanhar com o MarketingOS.

Ative a `skill-dashboard.md` em modo conceitual:

```
Tipo:       Executivo
Dados:      Estimados — sinalizar claramente como projeção
Base:       Benchmarks do setor informado no client.md
```

Gere:
- 4 métricas principais com valores estimados para o nicho
- 3 insights específicos para o negócio
- 2 oportunidades concretas não exploradas hoje

Inclua aviso visível: *"Valores baseados em benchmarks do setor. Métricas reais serão rastreadas após implantação."*

---

### ETAPA 7 — Oportunidades Perdidas

**Objetivo:** mostrar o que o cliente está deixando de ganhar hoje.

Com base em tudo que foi gerado nas etapas anteriores, liste:

```
7.1 Oportunidades de aquisição não exploradas
    → Canal não ativo que poderia gerar leads
    → Tipo de conteúdo ausente que o público consome

7.2 Oportunidades de conversão desperdiçadas
    → Tráfego que chega mas não converte
    → Lead que entra mas não é qualificado

7.3 Oportunidades de posicionamento
    → Espaço no mercado que o concorrente não ocupa
    → Diferencial real não comunicado

Formato:
  → Liste como "Oportunidade: [descrição] — Impacto estimado: [resultado concreto]"
```

---

### ETAPA 8 — Próximos Passos Comerciais

**Objetivo:** fechar a apresentação com clareza sobre o que acontece após a contratação.

Gere:

```
8.1 O que começa na semana 1
    → Ações concretas, não genéricas

8.2 O que está pronto em 30 dias
    → Entregas tangíveis

8.3 O que está operando em 90 dias
    → Visão do sistema rodando

8.4 CTA da apresentação
    → Frase final que convida ao próximo passo
    → Ex: "Posso ter isso rodando para você em 7 dias. Quando começamos?"
```

---

### ETAPA 9 — Montagem do demo.md

**Objetivo:** consolidar tudo em um arquivo único, limpo e apresentável.

Salve em `/clients/[slug]/outputs/demo/demo.md` com esta estrutura:

```
# Demo Comercial — [Nome do Cliente]
> Gerado em: [data]
> Preparado por: MarketingOS

---

## 1. Diagnóstico
## 2. Novo Posicionamento
## 3. Site — Home
## 4. Carrossel Instagram
## 5. Post de Feed
## 6. Dashboard Conceitual
## 7. Oportunidades Perdidas
## 8. Próximos Passos

---
*Este material foi gerado antes da contratação como demonstração do que o MarketingOS entrega.*
```

---

## Regras deste Workflow

1. **Leia o `client.md` completo antes de iniciar** — nunca execute com contexto parcial
2. **Nunca inventar dados** — se não está no `client.md`, pergunte ou sinalize como estimativa
3. **Cada etapa referencia a anterior** — o diagnóstico alimenta o posicionamento que alimenta o site e o conteúdo
4. **O demo.md deve ser apresentável diretamente** — sem notas internas, sem campos vazios
5. **Métricas estimadas sempre sinalizadas** — nunca apresentar projeção como dado real
6. **Salvar ao final de cada etapa** — não acumular tudo para salvar no final

---

## Checklist de Entrega

- [ ] client.md foi lido integralmente antes de iniciar?
- [ ] Diagnóstico identifica problemas específicos, não genéricos?
- [ ] Posicionamento proposto é diferente e mais claro que o atual?
- [ ] Site cobre todas as seções com copy baseada no client.md?
- [ ] Carrossel tem gancho forte e CTA alinhado ao cliente?
- [ ] Post tem briefing visual acionável?
- [ ] Dashboard sinaliza claramente que são estimativas?
- [ ] Oportunidades perdidas são específicas para o negócio?
- [ ] Próximos passos têm datas e entregas concretas?
- [ ] demo.md foi salvo em /clients/[slug]/outputs/demo/?

---

## Exemplo de Ativação no Cursor

```
Execute o workflow /workflows/client-demo.md.

Cliente: shana-joias
Base: /clients/shana-joias/client.md
Output: /clients/shana-joias/outputs/demo/demo.md
```

---

*Workflow v1.0 — MarketingOS*
