# open-client.md — Protocolo de Abertura de Sessão
> Localização: /workflows/open-client.md
> Execute SEMPRE ao iniciar uma sessão com qualquer cliente.
> Nunca pule este protocolo — ele carrega a inteligência acumulada.

---

## Comando de ativação

```
/abrir [slug-do-cliente]
```

---

## Sequência de execução

Execute exatamente nesta ordem. Sem pular etapas.

```
PASSO 1 — Carregar inteligência global
  → Ler intelligence/patterns.md
  → Ler intelligence/benchmarks.json
  → Ler intelligence/experiments.md
  → Anotar internamente: padrões ativos + benchmarks do nicho do cliente

PASSO 2 — Carregar contexto do cliente
  → Ler clients/[slug]/client.md
  → Ler clients/[slug]/estrategia.md
  → Ler clients/[slug]/notes.md (seção "Inteligência Acumulada")
  → Ler clients/[slug]/brand-kit.json

PASSO 3 — Verificar estado atual
  → Ler clients/[slug]/campaigns.md (campanhas ativas)
  → Ler clients/[slug]/metrics.json (última atualização)
  → Verificar se metrics.json está desatualizado há mais de 30 dias

PASSO 4 — Gerar resumo de contexto
  → Imprimir resumo compacto (máx. 10 linhas) com:
     - Nome do cliente e nicho
     - Foco atual (de estrategia.md)
     - Última ação registrada (de campaigns.md ou runs.md)
     - Padrões de intelligence aplicáveis ao nicho
     - Alertas (se houver: métricas desatualizadas, pendências abertas)
```

---

## Output esperado ao abrir

```
✅ Contexto carregado — [Nome do Cliente]

Nicho:          [ ]
Foco atual:     [ ]
Última ação:    [ ]
Padrões ativos: [ padrões de intelligence relevantes ao nicho ]
Alertas:        [ se houver ]

Pronto para operar. Qual o comando?
```

---

## Regras

1. Nunca operar sem executar este protocolo primeiro
2. Intelligence global é lida ANTES do contexto do cliente — padrões têm prioridade sobre intuição
3. Se `client.md` estiver vazio ou incompleto — sinalizar antes de continuar
4. O resumo deve ser compacto — não repetir o conteúdo dos arquivos
5. Se `metrics.json` estiver desatualizado, alertar mas não bloquear

---

*Workflow v1.0 — MarketingOS*
