# skill-abrir.md — Carregador de Sessão
> Skill isolada do MarketingOS.
> Execute SEMPRE no início de cada sessão antes de qualquer operação.
> Garante que Claude opera com contexto completo do cliente ativo.

---

## Objetivo

Carregar e confirmar o contexto completo do cliente ativo antes de qualquer trabalho.
Sem `/abrir`, você está operando sem identidade, tom ou estado — não faça isso.

---

## Protocolo de Execução

### Passo 1 — Identificar cliente ativo

Leia `.marketingos/state.json`.

```json
{ "activeClient": "slug-do-cliente" }
```

Se `activeClient` estiver vazio ou ausente: pare e peça ao usuário para executar `/cliente [slug]`.

---

### Passo 2 — Carregar arquivos de contexto

Leia na ordem abaixo. Se algum estiver ausente, sinalize mas continue com o que tiver:

| Arquivo | O que carrega |
|---|---|
| `clients/[slug]/client.md` | Identidade, persona, tom, metas, restrições |
| `clients/[slug]/brand-kit.json` | Cores, tipografia, estilo visual |
| `clients/[slug]/estrategia.md` | Foco atual, prioridades desta semana |
| `clients/[slug]/notes.md` | Diário operacional, aprendizados, alertas |
| `clients/[slug]/runs.md` | Últimas 3 sessões — o que foi feito e aprendido |

---

### Passo 3 — Verificar sinais de parada

Antes de confirmar contexto, cheque:

- [ ] `client.md` existe e tem tom + persona definidos?
- [ ] `metrics.json` foi atualizado nos últimos 30 dias?
- [ ] `estrategia.md` tem foco declarado para o período atual?
- [ ] Há algum alerta crítico em `notes.md`?

Se qualquer item estiver incompleto, sinalize com `⚠️` mas não bloqueie — apenas avise.

---

### Passo 4 — Confirmar contexto em voz alta

Após carregar, exiba exatamente neste formato:

```
✅ MarketingOS — Sessão iniciada

Cliente ativo: [Nome do Cliente] ([slug])
Tom da marca: [tom extraído do client.md]
Foco atual: [foco do estrategia.md — ou "Não definido ⚠️"]
Última sessão: [data + resumo de 1 linha do runs.md — ou "Sem histórico"]

Arquivos carregados:
  ✓ client.md
  ✓ brand-kit.json
  ✓ estrategia.md
  ✓ notes.md
  ✓ runs.md

Alertas:
  [Listar ⚠️ encontrados — ou "Nenhum"]

Pronto. Qual operação vamos executar?
```

---

## Regras

1. Nunca pule este passo imaginando que o contexto já está carregado — leia os arquivos.
2. Se `estrategia.md` não tiver foco definido, sugira que o usuário atualize antes de continuar.
3. Sempre leia `runs.md` para evitar repetir trabalho já feito na sessão anterior.
4. Se `brand-kit.json` estiver ausente, execute `/branding` antes de qualquer skill visual.

---

## Exemplo de Ativação

```
/abrir
```

Ou ao iniciar uma nova tarefa sem sessão aberta:

```
Antes de continuar, execute /abrir para carregar o contexto do cliente.
```

---

*Skill v1.0 — MarketingOS*
*Inspirado no padrão /abrir do Mazyos — adaptado para estrutura multi-cliente.*
