---
name: skill-head-implantado
version: "1.0"
group: relacionamento
command: /relacionar head
inputs:
  required: [client.md, estrategia.md, metrics.json]
  optional: [notes.md]
env: []
---

# skill-head-implantado.md — Head de Marketing Implantado
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação com cliente em regime de Head.
> Input obrigatório: `client.md` completo + `estrategia.md` + `metrics.json` atualizado.

---

## Contexto mínimo necessário
→ client.md — completo (todos os blocos)
→ estrategia.md — foco atual, prioridades e KPIs definidos
→ metrics.json — estado atual da operação
→ NÃO carregar: brand-kit.json, intelligence/, alma.md, notes.md, campaigns.md

---

## Objetivo da Skill

Definir o papel, as responsabilidades e o protocolo operacional do Head de Marketing Implantado — o modelo em que Felipe atua como o responsável pelo marketing do cliente, não como fornecedor de peças, mas como o profissional que toma as decisões e executa a operação.

A diferença central:

```
Freelancer / Agência → entrega o que foi pedido
Head Implantado      → decide o que precisa ser feito e executa
```

---

## Input Esperado

```
1. client.md completo     → entender o negócio, persona, tom, objeções
2. estrategia.md          → foco atual, prioridades, KPIs definidos
3. metrics.json           → estado atual da operação
4. Tipo de contrato       → [ Mensal recorrente / Projeto com duração definida ]
5. Canais ativos          → [ Instagram / Site / Ads / WhatsApp / Todos ]
6. Nível de autonomia     → [ Alta / Média — definido no contrato ]
```

---

## O Papel do Head Implantado

```
O Head não é consultor — é o responsável pela operação.
Não recomenda, executa.
Não reporta o que aconteceu, decide o que vai acontecer.
O cliente não gerencia o Head — o Head gerencia o marketing do cliente.
```

---

## Responsabilidades por Semana

```
Segunda-feira — Planejamento da semana
  → Ler metrics.json — o que mudou desde a última semana?
  → Ler campaigns.md — tem algo em andamento que precisa de atenção?
  → Definir 3 prioridades da semana (não mais)
  → Se houver algo crítico: acionar cliente antes das 10h

Terça a quinta — Execução
  → Produzir e publicar conteúdo conforme calendário
  → Monitorar performance de campanhas ativas
  → Responder insights de métricas (ajuste de copy, orçamento, frequência)
  → Atualizar notes.md com decisões relevantes

Sexta-feira — Fechamento da semana
  → Atualizar metrics.json com dados da semana
  → Registrar aprendizados em notes.md
  → Enviar check-in semanal ao cliente (async — modelo em "Cadência de Contato")
  → Preparar pauta para reunião estratégica se for semana de reunião
```

---

## Responsabilidades por Mês

```
Semana 1–2 — Execução + otimização
  → Publicar conteúdo do calendário mensal
  → Rodar campanhas pagas dentro do orçamento aprovado
  → Ajustar com base em dados da primeira quinzena

Semana 3 — Avaliação
  → Levantar dados do mês até aqui
  → Identificar o que está performando acima / abaixo do esperado
  → Preparar pauta da reunião mensal

Semana 4 — Reunião + planejamento do próximo mês
  → Executar /workflows/reuniao-estrategica.md
  → Gerar /workflows/relatorio-executivo.md
  → Definir calendário e orçamento do mês seguinte
  → Registrar decisões em estrategia.md
```

---

## O que Decide Sozinho vs. Consulta o Cliente

```
DECIDE SOZINHO — sem precisar pedir aprovação:
  → Ajustes de copy e criativo dentro da identidade da marca
  → Frequência de publicação e horários
  → Otimizações de campanha (bid, segmentação, criativos) dentro do orçamento aprovado
  → Pausa de conteúdo que não está performando
  → Teste A/B de headlines, criativos ou CTAs
  → Ordem e timing de publicação do calendário mensal

CONSULTA O CLIENTE — antes de executar:
  → Mudança de posicionamento ou mensagem central
  → Ativação de canal novo não previsto no contrato
  → Aumento de orçamento acima do aprovado
  → Parceria, colaboração ou menção a terceiros
  → Resposta pública a crise ou comentário negativo relevante
  → Mudança de produto, preço ou oferta
  → Qualquer ação irreversível com impacto na reputação da marca
```

---

## Cadência de Contato com o Cliente

```
SEMANAL — Check-in por escrito (WhatsApp ou e-mail)
  Formato:
    ✅ Esta semana: [o que foi feito]
    📊 Número da semana: [1 métrica relevante]
    🔜 Próxima semana: [o que está planejado]
    ❓ Preciso de você: [se houver decisão pendente — ou "nada pendente"]
  Duração: 5 linhas, sem reunião

QUINZENAL ou MENSAL — Reunião estratégica
  → Executar /workflows/reuniao-estrategica.md
  → 45–60 minutos
  → Sempre termina com decisões registradas

EMERGENCIAL — WhatsApp direto
  → Usar apenas para: oportunidades com janela de tempo curta
    ou situações de risco à reputação
  → Nunca usar para: aprovações de rotina ou atualizações de status
```

---

## O que o Head Nunca Delega

```
→ A leitura do client.md e estrategia.md — é a base de tudo
→ A decisão de posicionamento — não pode vir de terceiros sem validação
→ A reunião estratégica — é o momento de alinhamento que não pode ser terceirizado
→ O relatorio-executivo.md — a narrativa do que aconteceu é responsabilidade do Head
→ O julgamento sobre o que não publicar — o filtro de marca é intransferível
```

---

## Sinais de Operação Saudável

```
→ Métricas principais crescendo ou estáveis mês a mês
→ Cliente responde ao check-in semanal em até 24h
→ Calendário de conteúdo executado com 80%+ de aderência
→ Pelo menos 1 novo lead qualificado por semana (para negócios locais/PME)
→ Reunião mensal acontece no prazo sem cancelamentos
→ notes.md atualizado — há registro de decisões recentes
→ O cliente não faz perguntas sobre "o que está acontecendo" — ele já sabe
```

---

## Sinais de Operação em Risco

```
⚠️ AMARELO — monitorar e agir:
  → Métrica principal em queda por 2 semanas consecutivas
  → Cliente demorando mais de 48h para responder ao check-in
  → Conteúdo publicado com 2+ dias de atraso em relação ao calendário
  → Nenhum lead novo em 10 dias

🔴 VERMELHO — acionar reunião de emergência:
  → Queda de métrica principal acima de 30% em relação ao mês anterior
  → Cliente questionando a estratégia sem ter sido consultado antes
  → Campanha paga consumindo orçamento sem resultado proporcional
  → Cliente mudando direção ou produto sem comunicar ao Head com antecedência
  → Comentário negativo viral ou crise de reputação sem resposta definida
```

---

## Regras de Qualidade

1. **O Head lê antes de executar** — nunca agir sem ler o client.md e a estrategia.md da semana
2. **Decisão registrada é decisão que existe** — se não está no notes.md, não aconteceu
3. **Check-in semanal é inegociável** — mesmo que não haja nada novo, o cliente precisa saber que a operação está ativa
4. **Uma reunião, um dono de pauta** — o Head define a pauta, o cliente decide sobre ela
5. **Crise não se improvisa** — todo cliente deve ter um protocolo de resposta mapeado antes que ela aconteça
6. **Métricas sem narrativa não servem** — número sem contexto é ruído, não inteligência

---

## Checkpoints

⏸ **CP1 — Diagnóstico do mês aprovado**
Diagnóstico de performance + prioridades do período → confirmar foco antes de ativar operações.

⏸ **CP2 — Entregáveis do mês confirmados**
Lista de o que será executado no mês → aprovação antes de iniciar qualquer skill de execução.

---

## Checklist antes de iniciar o mês

- [ ] metrics.json do mês anterior atualizado?
- [ ] estrategia.md com foco do mês definido?
- [ ] Calendário de conteúdo do mês montado?
- [ ] Orçamento de mídia aprovado pelo cliente?
- [ ] Data da reunião mensal agendada?
- [ ] notes.md com alertas ativos revisados?

---

## Exemplo de Ativação

```
Use a skill-head-implantado.md.

Cliente: [slug]
Ação: [check-in semanal / planejamento mensal / diagnóstico de risco]
```

---

*Skill v1.0 — MarketingOS*
