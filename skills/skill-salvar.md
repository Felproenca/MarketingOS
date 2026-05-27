# skill-salvar.md — Salvar Sessão
> Skill isolada do MarketingOS.
> Execute ao final de cada sessão ou após completar uma entrega significativa.
> Garante versionamento, rastreabilidade e memória acumulada entre sessões.

---

## Contexto mínimo necessário
→ runs.md — para registrar a sessão atual
→ intelligence/system-usage.json — para registrar skills usadas
→ NÃO carregar: client.md, brand-kit.json, metrics.json, campaigns.md, alma.md, intelligence/patterns.md

---

## Objetivo

Fechar a sessão com:
1. Commit git de todos os outputs gerados
2. Registro da sessão em `clients/[slug]/runs.md`
3. Oportunidade de capturar aprendizados antes de encerrar

---

## Protocolo de Execução

### Passo 1 — Resumir a sessão

Antes de salvar, liste o que foi feito nesta sessão:

```
📦 Resumo da sessão — [data]

Cliente: [slug]
Duração estimada: [X min]

Entregáveis gerados:
  - [arquivo/output 1]
  - [arquivo/output 2]
  ...

Decisões tomadas:
  - [decisão relevante 1]
  - [decisão relevante 2]

Aprendizados / padrões identificados:
  - [algo que funcionou bem ou deve ser evitado]
```

Confirme com o usuário antes de continuar.

---

### Passo 2 — Registrar em runs.md

Adicione uma entrada no topo de `clients/[slug]/runs.md`:

```markdown
## [YYYY-MM-DD] — [Resumo em 1 linha]

**Entregáveis:** [lista curta]
**Decisões:** [lista curta]
**Aprendizados:** [o que ficou para a próxima sessão]
**Status:** [Completo / Em andamento / Bloqueado]
```

---

### Passo 3 — Executar commit

Execute:

```bash
node scripts/save.js "[mensagem descritiva do commit]"
```

A mensagem deve seguir o padrão:
```
feat(shana-joias): [o que foi gerado/alterado nesta sessão]
```

Exemplos:
- `feat(shana-joias): carrossel ouro 18k + legenda publicação`
- `feat(shana-joias): home.html v2 com seção depoimentos`
- `chore(system): atualiza skill-carousel com regras de qualidade`

---

### Passo 4 — Oferecer push

Após o commit, pergunte:

```
Commit criado. Deseja fazer push para o repositório remoto agora? (s/n)
```

Se sim, execute:
```bash
git push
```

Se não, informe que o push pode ser feito manualmente depois.

---

### Passo 5 — Confirmar encerramento

```
✅ Sessão salva com sucesso.

Commit: [mensagem]
Runs.md: atualizado
Push: [feito / pendente]

Até a próxima. Use /abrir para retomar o contexto na próxima sessão.
```

---

## Regras

1. Nunca faça commit sem antes listar os arquivos que serão incluídos.
2. Se não houver nada a commitar, registre a sessão em `runs.md` mesmo assim.
3. A mensagem de commit deve ser descritiva — evite `chore(session): save changes`.
4. Aprendizados capturados aqui alimentam `notes.md` nas próximas sessões.
5. Nunca force push (`git push --force`) — se houver conflito, informe o usuário.

---

## Exemplo de Ativação

```
/salvar
```

Ou com mensagem manual:

```
/salvar "feat(shana-joias): carrossel tema verão + 3 variações de legenda"
```

---

*Skill v1.0 — MarketingOS*
*Inspirado no padrão /salvar do Mazyos — expandido com runs.md e protocolo de encerramento.*
