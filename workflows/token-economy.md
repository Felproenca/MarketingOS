# token-economy.md - Modo Economico de Contexto
> Workflow de otimizacao de tokens para MarketingOS.
> Objetivo: carregar menos, decidir melhor, manter a alma.

---

## Principio

Contexto e custo. Carregar arquivo errado piora a decisao.

O MarketingOS deve operar por disclosure progressivo:
1. Fundacao minima.
2. Admin do grupo.
3. Skill escolhida.
4. Contexto minimo da skill.
5. Arquivos extras somente se a skill pedir ou se houver bloqueio.

---

## Ordem economica

Sempre:
1. Ler `manifesto.md`.
2. Ler `alma.md`.
3. Ler `virada-aquisicao.md`.
4. Ler `CLAUDE.md`.
5. Consultar `docs/manual-de-uso.md`.

Regra para o manual:
- operacao completa, onboarding, criacao de cliente, fluxo novo ou decisao arquitetural: ler o manual inteiro;
- microtarefa, ajuste pontual ou execucao de uma skill conhecida: ler apenas a secao relevante do manual;
- se houver conflito, `CLAUDE.md` vence e o manual deve ser atualizado depois.

Depois:
1. Identificar grupo: inteligencia, perception, analisar, criar, prospectar, vender, relacionar.
2. Ler apenas o `_admin.md` do grupo.
3. Escolher uma skill.
4. Ler apenas a skill escolhida.
5. Ler a secao `Contexto minimo necessario`.
6. Carregar somente os arquivos listados.

---

## Regras de nao-carregamento

Nao carregar:
- `metrics.json` para criacao, salvo performance-driven rewrite.
- `brand-kit.json` para copy pura.
- `campaigns.md` para ideacao.
- `intelligence/` inteira.
- README de frameworks externos.
- codigo-fonte de motor externo quando um comando/API resolve.
- outputs antigos inteiros; usar indice, resumo ou arquivo especifico.

---

## Orçamento por tipo de tarefa

```text
Micro tarefa:       ate 3 arquivos alem da fundacao
Criacao normal:     admin + 1 skill + 3 a 5 arquivos
Analise:            admin + 1 skill + dados do periodo
Depuracao tecnica:  arquivos do erro + teste + dependencia direta
Arquitetura:        mapas/listagens primeiro, arquivos grandes depois
```

---

## Como resumir para economizar

Quando um arquivo for grande:
- usar `rg` para localizar secoes;
- ler trecho especifico;
- resumir em ate 10 bullets;
- salvar aprendizado reutilizavel em `notes.md` ou `intelligence/patterns.md` se aprovado.

---

## Regra para agents transformados em skills

Agents executam. Skills decidem. MarketingOS governa.

Nao carregar a implementacao do agent para executar a skill.
Carregar implementacao somente para:
- corrigir bug;
- alterar contrato;
- entender divergencia entre output esperado e output real;
- escrever teste.
