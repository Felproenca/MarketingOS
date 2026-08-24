# Skill: Signal Intelligence

## Objetivo

Transformar eventos comerciais publicos e recentes em uma fila de outbound
priorizada, explicavel e auditavel.

Esta skill nao procura "empresas com marketing ruim". Ela procura empresas em
movimento cuja infraestrutura de conversao pode nao ter acompanhado o movimento.

## Contexto minimo necessario

- `manifesto.md`
- `alma.md`
- `virada-aquisicao.md`
- `clients/felipe-proenca/client.md`
- `clients/felipe-proenca/icp.md`
- `agency/icp.md`

## NAO carregar

- historico completo de demos
- conversas privadas de outros clientes
- bases de contatos sem relacao com o experimento

## Contrato do sinal

Todo sinal precisa conter:

1. evento observado;
2. URL publica da evidencia;
3. data da observacao;
4. confianca;
5. ruptura verificavel;
6. oferta proporcional;
7. mensagem que nao afirme resultado nao medido.

Sem evidencia e data, o prospecto nao e elegivel.

## Fluxo

1. Iniciar um experimento com um segmento, uma cidade e uma oferta.
2. Registrar observacoes usando o template.
3. Registrar demanda agregada no Google Trends.
4. Ranquear prospectos por timing, capacidade, ruptura e fit.
5. Revisar manualmente evidencia, hipotese e mensagem.
6. Abordar somente apos aprovacao humana.
7. Registrar todos os resultados, inclusive silencio e invalidos.
8. Revisar semanalmente quais sinais realmente antecedem resposta e venda.

## Comandos

```bash
npm run signals -- init --segment "estetica" --city "Campinas" --offer 'pagina de campanha por R$97'
npm run signals -- ingest --file templates/signal-observations.template.json
npm run signals -- trends --terms "harmonizacao facial,botox" --geo "BR-SP" --timeframe "90d" --source-url "URL_DO_TRENDS" --observed-at "2026-06-28"
npm run signals -- rank --limit 20
npm run signals -- outcome --id empresa-campanha-001 --status replied
npm run signals -- report
npm run signals:test
```

## Gate de abordagem

- A evidencia ainda esta acessivel e atual?
- A descricao separa fato de inferencia?
- A ruptura foi realmente verificada?
- A oferta acompanha o evento observado?
- A mensagem pode ser enviada sem constranger ou vigiar o prospecto?
- Existe canal comercial publico e apropriado?

Qualquer "nao" interrompe a abordagem.

## Papel do Google Trends

Google Trends valida interesse relativo do mercado e ajuda a escolher segmento,
regiao, termos e sazonalidade. Ele nao demonstra que uma empresa esta pronta
para comprar e, por isso, nao soma pontos ao score individual do prospecto.

A API oficial permanece em acesso alfa limitado. Sem credencial oficial, o
snapshot deve ser registrado a partir da interface publica, com URL, periodo,
geografia e data da consulta.

## Saida

Estado operacional privado:

`agency/leads/signal-intelligence.json`

Aprendizado consolidado, sem dados pessoais:

`clients/felipe-proenca/outputs/acquisition/`
