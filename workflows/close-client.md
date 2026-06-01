# close-client.md — Protocolo de Fechamento de Sessão
> Localização: /workflows/close-client.md
> Execute SEMPRE antes de fechar o chat ou trocar de cliente.
> É aqui que o aprendizado da sessão vira inteligência permanente.

---

## Comando de ativação

```
/fechar
```

---

## Sequência de execução

```
PASSO 1 — Extrair aprendizados da sessão
  → O que foi gerado nesta sessão?
  → O que funcionou acima do esperado?
  → O que o cliente aprovou ou rejeitou?
  → Houve alguma correção ou ajuste de direção?
  → Algum padrão novo foi observado?

PASSO 2 — Atualizar notes.md do cliente
  → Adicionar entrada no Diário Operacional com:
     - Data
     - O que foi feito
     - Decisões tomadas
     - Próximos passos definidos
  → Se houver padrão confirmado: atualizar seção
    "O que funciona" ou "O que não funciona"

PASSO 3 — Atualizar estrategia.md do cliente
  → Atualizar "Próximas ações definidas"
  → Atualizar "Prioridade da semana" se mudou
  → Registrar contexto da sessão em "Contexto da última reunião"

PASSO 4 — Fechar o loop de aprendizado com dados reais
  → Rodar: npm run insights -- --slug [cliente]
     Puxa a performance real dos posts publicados (reach, saves, engajamento).
     Se posts ainda tiverem menos de 48h, pular e rodar na próxima sessão.
  → Rodar: npm run aggregate
     Recalcula intelligence/benchmarks.json com os dados de todos os clientes.
     As skills leem esse arquivo no próximo /abrir — sem ação manual.
  → Se o insights retornar dados acima da média do nicho: registrar em intelligence/patterns.md
  → Se algum hook_type performou consistentemente melhor: registrar em intelligence/skill-updates.md
  → Regra: só vai para intelligence/ o que foi medido — não o que pareceu funcionar

PASSO 5 — Executar /salvar
  → Registrar sessão em /intelligence/system-usage.json:
     - date: data de hoje
     - client: slug do cliente ativo
     - skills_used: todas as skills executadas nesta sessão
     - output_generated: arquivos criados
     - outcome: aprovado/revisado/descartado/pendente
  → Commit git de todos os outputs da sessão
  → Atualizar runs.md

PASSO 6 — Confirmar encerramento
  → Listar o que foi salvo e onde
  → Mostrar próximos passos definidos
```

---

## Output esperado ao fechar

```
✅ Sessão encerrada — [Nome do Cliente]

Salvo em notes.md:
  → [ entrada do diário ]

Salvo em estrategia.md:
  → [ próximas ações atualizadas ]

Salvo em intelligence/:
  → [ se houver padrão novo — ou "Nenhum padrão cross-client identificado" ]

Commit: [ mensagem do commit ]

Próxima sessão: retomar com /abrir [slug]
```

---

## Regras

1. Nunca fechar sem executar este protocolo — fechar o chat sem /fechar é perda de inteligência
2. Se a sessão não gerou nada relevante — registrar mesmo assim no diário
3. Padrão cross-client só vai para `intelligence/` se for observado em contexto real, não hipótese
4. Sempre terminar mostrando o que foi salvo — transparência total
5. /fechar sempre chama /salvar no passo 5 — não são alternativos, são sequenciais

---

## Diferença entre /salvar e /fechar

| | `/salvar` | `/fechar` |
|---|---|---|
| Git commit | Sim | Sim (via /salvar) |
| Atualiza runs.md | Sim | Sim (via /salvar) |
| Atualiza notes.md | Não | Sim |
| Atualiza estrategia.md | Não | Sim |
| Alimenta intelligence/ | Não | Sim |
| Quando usar | Checkpoint intermediário | Fim de sessão definitivo |

---

*Workflow v1.0 — MarketingOS*
