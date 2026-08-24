# Contratos da Motion Site Factory

## Agent Roster

Cada papel declara:

- `id`: identificador estável.
- `mission`: responsabilidade única.
- `authority`: decisões permitidas e proibidas.
- `skills`: capacidades carregadas sob demanda.
- `context_refs`: arquivos mínimos que recebe.
- `inputs` e `outputs`: contrato de trabalho.
- `acceptance`: condições verificáveis.
- `model_tier`: `reasoning`, `balanced` ou `economy`.
- `spawn`: `always`, `on_demand` ou `never`.

Papéis não compartilham contexto inteiro por padrão.

## Task Graph

Cada tarefa declara:

- `id`, `phase`, `owner_role`;
- `depends_on`;
- `parallel_group`, quando aplicável;
- `inputs`, `outputs`;
- `acceptance`;
- `status`;
- `budget`;
- `receipt`.

Estados válidos:

```text
blocked -> ready -> in_progress -> review -> approved
                                      \-> revise
                                      \-> rejected
```

Uma tarefa só fica `ready` quando todas as dependências estão `approved`.

## Creation Manifest

O manifesto é a memória editorial e técnica da criação. Ele deve permitir:

1. explicar por que o site existe;
2. reproduzir a direção;
3. localizar cada cena no DOM;
4. capturar desktop e mobile;
5. transformar o site em vídeo e case;
6. rastrear ativos e decisões;
7. medir o resultado após publicação.

Também deve provar continuidade: contrato de reação, curva de intensidade,
mudança de crença por seção, orçamento de copy, recompensas distribuídas e asset
exclusivo. Um hero forte não compensa seções sem direção.

## Paralelismo Seguro

Pode rodar em paralelo:

- pesquisa visual e inventário de conteúdo;
- copy e preparação de assets após tese aprovada;
- QA visual, performance e conversão após build congelado;
- cortes de vídeo com ângulos independentes após captures aprovados.

Não pode rodar em paralelo:

- direção antes de percepção;
- build antes de arquitetura;
- crítica antes de estado capturável;
- vídeo antes de manifesto e capture plan;
- deploy antes dos gates.

## Recibos

Todo agente devolve:

```json
{
  "task_id": "build-hero",
  "status": "review",
  "files_changed": ["source/components/Hero.tsx"],
  "decisions": ["Produto persistente conduz a narrativa"],
  "tests": ["desktop-1440", "mobile-390", "reduced-motion"],
  "risks": [],
  "tokens_actual": 0
}
```
