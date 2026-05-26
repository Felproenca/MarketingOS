# reuniao-estrategica.md — Reunião Estratégica com o Cliente
> Localização: /workflows/reuniao-estrategica.md
> Execute antes e depois de toda reunião quinzenal ou mensal com o cliente.
> Pré-requisito: metrics.json atualizado + notes.md com alertas da quinzena.

---

## Objetivo

Conduzir a reunião estratégica de forma que ela sempre termine com decisões claras — não com "vamos ver" ou "fica pensando nisso".

A reunião não é um relatório apresentado. É uma tomada de decisão facilitada pelo Head.

```
Antes da reunião: Head lê os dados e prepara a pauta
Durante a reunião: Head apresenta, cliente decide
Depois da reunião: Head registra decisões e executa
```

---

## Input Obrigatório

```
Slug do cliente:   [ informar ao ativar ]
Tipo de reunião:   [ Quinzenal / Mensal ]
Arquivos base:
  → /clients/[slug]/metrics.json     — dados do período
  → /clients/[slug]/notes.md         — alertas e contexto
  → /clients/[slug]/estrategia.md    — foco atual e próximas ações
  → /clients/[slug]/campaigns.md     — campanhas em andamento
Duração esperada:  45–60 minutos
```

---

## Etapas do Workflow

---

### PRÉ-REUNIÃO — Preparação (Head executa sozinho, antes)

```
ETAPA 0.1 — Atualizar dados
  → Atualizar metrics.json com dados do período (até a véspera)
  → Revisar notes.md — há alertas abertos que precisam de decisão?
  → Revisar campaigns.md — alguma campanha merece destaque positivo ou negativo?

ETAPA 0.2 — Montar a pauta
  → Selecionar máx. 5 pontos para a reunião
  → Prioridade: decisões que o cliente precisa tomar, não updates que o Head pode enviar por escrito
  → Para cada ponto: uma pergunta clara que o cliente precisa responder

  Formato da pauta:
  ┌─────────────────────────────────────────────────────────┐
  │ PAUTA — [Nome do Cliente] — [Data]                      │
  │                                                         │
  │ 1. Revisão de métricas (10 min)                         │
  │ 2. [Decisão 1 — ex: continuar ou pausar campanha X]     │
  │ 3. [Decisão 2 — ex: novo canal ou dobrar no atual]      │
  │ 4. Ajustes de estratégia (se necessário)                │
  │ 5. Próximas ações + datas (10 min)                      │
  └─────────────────────────────────────────────────────────┘

ETAPA 0.3 — Enviar pauta ao cliente
  → Enviar por WhatsApp ou e-mail no dia anterior
  → Formato: lista simples, sem PDF, sem apresentação elaborada
  → Tom: "Amanhã vamos decidir essas 3 coisas:" — objetivo, não formal
```

---

### BLOCO 1 — Revisão de Métricas (10–15 min)

**Objetivo:** alinhar a leitura dos dados antes de qualquer decisão.

```
1.1 Apresentar os 4 KPIs principais do período
    → Usar os dados do metrics.json
    → Para cada KPI: valor atual + comparativo com período anterior + interpretação em 1 linha

    Formato de apresentação:
    ┌──────────────────┬──────────────┬──────────────┬──────────────────────────┐
    │ KPI              │ Período ant. │ Este período │ Interpretação            │
    ├──────────────────┼──────────────┼──────────────┼──────────────────────────┤
    │ Alcance/semana   │ 000          │ 000          │ subiu / caiu / estável   │
    │ Leads gerados    │ 0            │ 0            │ [narrativa curta]        │
    │ Conversas abertas│ 0            │ 0            │ [narrativa curta]        │
    │ [KPI do cliente] │ 0            │ 0            │ [narrativa curta]        │
    └──────────────────┴──────────────┴──────────────┴──────────────────────────┘

1.2 Destacar o número mais importante do período
    → 1 métrica que conta a história do que aconteceu
    → Ex: "O carrossel de quarta teve 3x mais salvamentos que a média — vale entender por quê"

1.3 Sinalizar o que não está funcionando
    → Não esconder dados ruins — apresentar com contexto e hipótese de causa
    → Ex: "O alcance caiu 20% — minha hipótese é que o algoritmo mudou o comportamento
          para conteúdo de vídeo. Quero testar um Reels na próxima semana."
```

---

### BLOCO 2 — Decisões de Canal e Campanha (15–20 min)

**Objetivo:** tomar 2 a 3 decisões concretas sobre o que mudar, manter ou ativar.

```
2.1 Para cada ponto de decisão da pauta:
    → Head apresenta os dados + sua recomendação com justificativa
    → Cliente decide: aprovado / não aprovado / ajustar e reapresentar

    Formato da recomendação:
    "Com base em [dado], recomendo [ação].
     Isso deve gerar [resultado esperado] em [prazo].
     O que eu preciso de você: [decisão específica]."

2.2 Canais: manter, escalar ou pausar?
    → Para cada canal ativo: o custo de continuar vale o resultado?
    → Para canais inativos: vale ativar agora ou deixar para o próximo ciclo?

2.3 Campanhas pagas (se aplicável):
    → ROAS atual vs. benchmark do nicho (benchmarks.json)
    → Recomendação: escalar / otimizar / pausar / testar novo criativo

2.4 Conteúdo orgânico:
    → Qual formato está performando melhor?
    → Vale dobrar a frequência no que funciona?
    → Há tema que o público respondeu bem e pode ser expandido?
```

---

### BLOCO 3 — Ajustes de Estratégia (10 min)

**Objetivo:** revisar se o foco atual ainda faz sentido ou se precisa ajustar o rumo.

```
3.1 O foco atual (estrategia.md) ainda é válido?
    → Perguntar diretamente: "Alguma coisa mudou no negócio que eu preciso saber?"
    → Produto, preço, público, sazonalidade, concorrência — qualquer mudança impacta a estratégia

3.2 Prioridades do próximo ciclo
    → Com base no que foi aprendido: o que sobe de prioridade?
    → O que pode ser adiado sem prejuízo?

3.3 Há algo que o cliente quer testar?
    → Registrar como "ideia do cliente" — avaliar viabilidade antes de comprometer execução
    → Se fizer sentido: incluir no calendário do próximo ciclo
    → Se não fizer sentido no momento: explicar por quê e registrar para o futuro
```

---

### BLOCO 4 — Próximas Ações + Datas (10 min)

**Objetivo:** sair da reunião com lista clara de quem faz o quê e quando.

```
4.1 Listar todas as decisões tomadas na reunião
    → Formato: "Decidido: [ação] — Responsável: [Head / Cliente] — Prazo: [data]"

4.2 O que o cliente precisa entregar ao Head
    → Exemplos: foto aprovada, texto de depoimento, acesso a conta, informação de produto
    → Com prazo claro — sem prazo, não existe

4.3 O que o Head vai executar até a próxima reunião
    → Lista de entregas com datas — não mais do que 5 itens

4.4 Data da próxima reunião
    → Agendar antes de encerrar — nunca sair sem data definida
```

---

### PÓS-REUNIÃO — Registro (Head executa sozinho, em até 2h após a reunião)

```
ETAPA 5.1 — Atualizar estrategia.md
  → Registrar as decisões tomadas em "Próximas ações definidas"
  → Atualizar "Prioridade do ciclo" se mudou
  → Atualizar "Contexto da última reunião" com data e resumo

ETAPA 5.2 — Atualizar notes.md
  → Adicionar entrada no Diário Operacional:
    Data: [data]
    Reunião: [quinzenal/mensal]
    Decisões: [lista]
    Próximas ações do cliente: [lista com prazo]
    Próximas ações do Head: [lista com prazo]

ETAPA 5.3 — Enviar resumo ao cliente
  → Enviar por WhatsApp imediatamente após o registro
  → Formato:
    "Resumo da reunião de hoje:
     ✅ Decidimos: [lista]
     📋 Você vai me mandar: [lista com prazo]
     🔜 Eu vou entregar: [lista com prazo]
     📅 Próxima reunião: [data]"
```

---

## Regras deste Workflow

1. **Pauta enviada com antecedência** — reunião sem pauta é conversa, não decisão
2. **Máximo 5 pontos por reunião** — mais do que isso não decide nada
3. **Dado sempre com interpretação** — número sem narrativa é ruído
4. **Toda reunião termina com decisões registradas** — se não foi para o notes.md, não existiu
5. **Resumo enviado em até 2h** — memória falha, registro não
6. **Nunca sair sem data da próxima** — reunião sem continuidade é custo sem retorno
7. **O Head facilita, o cliente decide** — a reunião não é para convencer, é para decidir

---

## Checklist de Execução

- [ ] metrics.json atualizado antes da reunião?
- [ ] Pauta enviada ao cliente com antecedência?
- [ ] Máximo 5 pontos na pauta?
- [ ] Cada ponto tem uma decisão clara a tomar?
- [ ] Todos os KPIs apresentados com comparativo e interpretação?
- [ ] Decisões da reunião registradas em estrategia.md?
- [ ] Diário operacional atualizado em notes.md?
- [ ] Resumo enviado ao cliente em até 2h?
- [ ] Data da próxima reunião definida e comunicada?

---

## Exemplo de Ativação

```
Execute o workflow /workflows/reuniao-estrategica.md.

Cliente: [slug]
Tipo: [Quinzenal / Mensal]
Data: [YYYY-MM-DD]
```

---

*Workflow v1.0 — MarketingOS*
