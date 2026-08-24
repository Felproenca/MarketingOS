# Operator Workspace

## Direção do produto

O Cockpit deve funcionar como um workspace operacional semelhante ao VS Code, não como um dashboard de gráficos.

Felipe abre um cliente, projeto ou frente de trabalho; solicita uma ação; o sistema usa os diretórios, contratos e OS existentes; e devolve o resultado no mesmo workspace.

```text
workspace
  -> contexto do cliente
  -> solicitação
  -> plano e rota
  -> execução pelos OS
  -> output ou análise
  -> QA e revisão
  -> aprovação/publicação
  -> aprendizado e próximos passos
```

## Estrutura visual

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Workspace tabs: Bruno Capelli | Novo pedido | Pesquisa | Automação    │
├───────────────┬──────────────────────────────────────┬───────────────┤
│ Explorer       │ Main workbench                       │ Inspector      │
│                │                                      │                │
│ Clientes       │ arquivo / pedido / output / análise │ status         │
│ Projetos       │                                      │ rota           │
│ Estratégia     │ preview visual                       │ executor       │
│ Conteúdo       │ dados e evidências                   │ QA             │
│ Funis          │                                      │ aprovação      │
│ Dados          │                                      │ próximos passos│
│ Automações     │                                      │                │
│ OS             │                                      │                │
├───────────────┴──────────────────────────────────────┴───────────────┤
│ Event log / terminal / jobs / retornos / erros                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Abas principais

### Cliente

Client Truth, referências, brand kit, audiência, ofertas, restrições, histórico e conexões.

### Solicitação

Entrada natural para pedir:

- criar carrossel, post, roteiro ou vídeo;
- analisar mercado, concorrência ou campanha;
- montar funil, oferta ou automação;
- coletar dados e gerar diagnóstico;
- preparar publicação ou sincronização;
- abrir uma tarefa para qualquer OS.

A solicitação mostra objetivo, evidências necessárias, rota, custo estimado, permissões e aprovação exigida.

### Estratégia

Decisões, hipóteses, pesquisas, sinais, gargalos, público, oferta, tese e próximos movimentos.

### Produção

Brief, copy, direção, arquivos de trabalho, versões, previews e outputs dos executores.

### Dados e análise

Dados coletados, fontes, período, métricas, anomalias, interpretações, recomendações e confiança.

### Distribuição

Calendário, canais, conexões, posts preparados, publicações aprovadas, status e métricas pós-publicação.

### Automações

Fluxos disponíveis, gatilhos, condições, ações, última execução, falhas, permissões e botão de ativar/desativar.

### OS e execução

MarketingOS, EcosystemCore, FluxOS, DesingOS, EditorOS, MediaOS e GrowthOS como camadas operacionais; o usuário não precisa conhecer o comando interno para usar o serviço.

## Camadas da solicitação

Toda solicitação deve poder ser aberta em camadas:

1. **Contexto** — cliente, fontes e Client Truth usados.
2. **Intenção** — o que precisa ser resolvido e por quê.
3. **Plano** — sistemas, executores, dados e permissões necessários.
4. **Execução** — jobs, diretórios, work-orders, logs e progresso.
5. **Resultado** — artifact visual, arquivo, relatório, dado ou decisão.
6. **QA** — validações automáticas e pendências humanas.
7. **Aprovação** — aprovar, pedir ajustes, rejeitar ou publicar.
8. **Aprendizado** — métrica, resultado, observação e próximo movimento.

## Tipos de resposta do sistema

O resultado não é sempre um artifact visual. A interface deve reconhecer pelo contrato:

| Tipo de resultado | Exibição |
|---|---|
| Visual | preview, versões, arquivos, comentários e aprovação |
| Vídeo | player, cortes, roteiro, legenda, timeline e versões |
| Dados | tabela, gráfico, fonte, período e exportação |
| Análise | tese, evidências, confiança, implicações e recomendação |
| Estratégia | decisão, hipóteses, riscos, plano e próximos passos |
| Funil | mapa, etapas, mensagens, regras, métricas e automações |
| Publicação | canal, payload, agendamento, status e permalink |
| Automação | trigger, execução, logs, efeitos e possibilidade de desligar |

## Backend por trás do workspace

O workspace não substitui a execução existente:

- o Explorer aponta para clientes e diretórios;
- o Supabase mantém estado, fila, permissões, auditoria e índice;
- o EcosystemCore distribui contratos;
- cada OS executa sua especialidade;
- o MediaOS normaliza o retorno como job, artifact, análise ou evento;
- o Storage guarda entregas que precisam ser visualizadas ou compartilhadas.

## Regra de produto

O usuário não deve escolher manualmente entre dez scripts para executar uma tarefa. Ele deve dizer o que precisa; o sistema deve mostrar a rota escolhida, pedir os dados faltantes, executar o OS adequado e devolver o resultado com rastreabilidade.

O operador pode abrir qualquer camada para entender e intervir, como um desenvolvedor abre arquivos, terminal e logs no VS Code.
## Access boundary

The client portal resolves its `client_id` from the authenticated user's `client_memberships` through `/api/admin/clients`; it no longer defaults to an operator or arbitrary client. Admin users receive the complete client list, while client users receive only their memberships. Operational endpoints continue to require the admin allowlist.
