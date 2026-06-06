# Agenda programada - Repertoire Updaters

Criado em: 2026-06-06  
Timezone: America/Sao_Paulo  
Regra: Etapa 2 so roda depois da Etapa 1.

## Etapa 1 - Updaters gerais

Primeira rodada: 2026-06-08 09:00 BRT  
Cadencia: semanal, toda segunda-feira, 09:00 BRT  
Comando:

```bash
npm run repertoire:update
```

O que atualiza:
- `intelligence/repertoire-updaters/marketingskills.md`
- `intelligence/repertoire-updaters/ai-marketing-claude.md`
- `intelligence/repertoire-updaters/claude-skills.md`
- `intelligence/repertoire-updaters/ai-marketing-claude-code-skills.md`
- `intelligence/repertoire-updaters/inventory.json`
- `intelligence/repertoire-scan-report.md`

Objetivo: preservar o repertorio completo antes de qualquer foco especifico.

## Etapa 2 - Updater de aquisicao

Primeira rodada: 2026-06-09 09:00 BRT  
Cadencia: semanal, toda terca-feira, 09:00 BRT  
Dependencia: Etapa 1 concluida com sucesso.
Comando:

```bash
npm run repertoire:acquisition
```

O que atualiza:
- `intelligence/repertoire-updaters/acquisition.md`

Objetivo: filtrar dos quatro repertorios apenas o que fortalece aquisicao de clientes: prospeccao, outbound, midia paga, funil, CRO, lead capture, social proof, proposta, RevOps, parcerias e fechamento.

## Ordem de decisao

1. Rodar Etapa 1.
2. Ler `intelligence/repertoire-scan-report.md`.
3. Rodar Etapa 2.
4. Ler `intelligence/repertoire-updaters/acquisition.md`.
5. Registrar melhorias aplicaveis em `intelligence/skill-updates.md`.
6. Atualizar skills internas somente depois de passar pelos filtros de `alma.md`.

## Filtros obrigatorios

- Isso gera cliente ou apenas gera conteudo?
- Isso aumenta conversao ou apenas aumenta volume?
- Isso fala do medo e desejo do prospect?
- Isso vende IA aplicada ao negocio ou volta para linguagem de agencia?
- Isso cria prova, diagnostico, abordagem ou fechamento?

