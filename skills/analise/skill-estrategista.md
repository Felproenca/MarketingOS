# skill-estrategista.md — Estrategista de Marketing
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar.
> É a única skill que não recebe instrução — ela gera a instrução.
> Deve ser a primeira skill executada em qualquer sessão de trabalho.

---

## Contexto mínimo necessário
→ intelligence/patterns.md — padrões confirmados no sistema
→ intelligence/benchmarks.json — referências do nicho do cliente
→ client.md — completo (todos os blocos)
→ estrategia.md — foco atual e prioridades declaradas
→ metrics.json — performance real por canal
→ campaigns.md — o que está rodando agora
→ notes.md — histórico e inteligência acumulada
→ NÃO carregar: brand-kit.json, alma.md

---

## Objetivo

Analisar o contexto completo do cliente e gerar um plano estratégico claro:
- O que está funcionando e deve ser escalado
- O que está travando e precisa ser resolvido
- Qual o movimento prioritário desta semana
- Quais skills acionar e em qual ordem
- O que NÃO fazer agora

**Esta skill pensa antes de executar. Todas as outras executam depois dela.**

---

## Posição no fluxo

```
/abrir [slug]
  ↓
/estrategia          ← esta skill
  ↓ gera o plano
Skills de execução (/carrossel · /post · /site · /captacao · ...)
  ↓
/fechar
```

---

## Input — leitura obrigatória antes de qualquer análise

```
1. intelligence/patterns.md       → padrões confirmados no sistema
2. intelligence/benchmarks.json   → referências do nicho do cliente
3. clients/[slug]/client.md       → identidade, público, metas
4. clients/[slug]/estrategia.md   → foco atual e prioridades declaradas
5. clients/[slug]/metrics.json    → performance real por canal
6. clients/[slug]/campaigns.md    → o que está rodando agora
7. clients/[slug]/notes.md        → histórico e inteligência acumulada
```

Se `metrics.json` estiver vazio — sinalizar e operar com base no contexto qualitativo.
Se `client.md` estiver incompleto — parar e pedir preenchimento antes de continuar.

---

## Lógica de análise interna

Execute esta sequência antes de gerar qualquer output:

```
DIAGNÓSTICO DE SITUAÇÃO
  → O cliente está em qual fase? (prospecção / onboarding / operação / escala)
  → Qual o maior gap entre onde está e onde quer chegar?
  → O que foi prometido vs. o que foi entregue até agora?

DIAGNÓSTICO DE PERFORMANCE
  → Qual canal está gerando resultado real?
  → Qual canal está consumindo recurso sem retorno?
  → A meta de leads está sendo atingida? Qual o desvio?
  → O funil tem gargalo identificado? Em qual etapa?

DIAGNÓSTICO DE CONTEÚDO
  → Há consistência de publicação?
  → O conteúdo está alinhado ao posicionamento do client.md?
  → Existe conteúdo que performou acima da média? O que explica?

DIAGNÓSTICO DE OFERTA
  → A oferta está clara e diferenciada?
  → A objeção principal está sendo respondida no conteúdo?
  → O CTA está convertendo ou só gerando cliques?

DIAGNÓSTICO DE RELACIONAMENTO
  → Há clientes em risco de churn?
  → Existe base de inativos não trabalhada?
  → O pós-venda está estruturado?

CRUZAMENTO COM INTELLIGENCE
  → Algum padrão de intelligence/patterns.md se aplica a este cliente?
  → O CPL está acima ou abaixo do benchmarks.json do nicho?
  → Há experimento em andamento que impacta as decisões desta semana?
```

---

## Formato de output

---

### PLANO ESTRATÉGICO — [Nome do Cliente]
**Data:** [ ]
**Fase:** [ Onboarding / Operação mês N / Escala ]
**Elaborado com base em:** client.md · metrics.json · campaigns.md · notes.md · intelligence/

---

#### Situação atual em 3 linhas

```
[Resumo direto do estado real do cliente — sem eufemismo, sem excesso]
[O que está funcionando]
[O que não está]
```

---

#### O que está funcionando — escalar

```
→ [Canal ou ação] — motivo: [dado ou observação que justifica]
→ [Canal ou ação] — motivo: [dado ou observação que justifica]
```

---

#### O que está travando — resolver

```
→ [Problema] — causa provável: [diagnóstico] — impacto: [o que isso custa]
→ [Problema] — causa provável: [diagnóstico] — impacto: [o que isso custa]
```

---

#### O que NÃO fazer agora

```
→ [Ação ou canal] — motivo: [por que não é prioridade neste momento]
→ [Ação ou canal] — motivo: [por que não é prioridade neste momento]
```

> Esta seção é tão importante quanto as anteriores.
> Evita dispersão de energia em frentes que não são prioridade.

---

#### Movimento prioritário desta semana

```
Uma coisa só. A mais importante.

→ [Ação específica]
   Skill a usar:    [ ]
   Output esperado: [ ]
   Critério de sucesso: [ ]
```

---

#### Plano de execução — próximas 2 semanas

```
Semana 1:
  Prioridade 1: [ação] → skill: [skill] → output: [o que será gerado]
  Prioridade 2: [ação] → skill: [skill] → output: [o que será gerado]
  Prioridade 3: [ação] → skill: [skill] → output: [o que será gerado]

Semana 2:
  Prioridade 1: [ação] → skill: [skill] → output: [o que será gerado]
  Prioridade 2: [ação] → skill: [skill] → output: [o que será gerado]
```

---

#### Sequência de comandos recomendada para esta sessão

```
/abrir [slug]          ← já executado
/estrategia            ← este output
[comando 1]            ← primeira execução recomendada
[comando 2]            ← segunda execução recomendada
[comando 3]            ← terceira se houver tempo
/fechar                ← sempre ao final
```

---

#### Alerta estratégico (se houver)

```
⚠ [Situação que exige atenção imediata — risco de churn, meta muito longe,
   campanha queimando verba sem retorno, cliente sem contato há X dias]
```

Omitir esta seção se não houver alerta real. Não criar alerta por criar.

---

#### Atualizar estrategia.md

Ao final do output, perguntar:

> "Quer que eu atualize o `estrategia.md` com este plano?"

Se sim — atualizar as seções:
- Foco atual
- Prioridade da semana
- Próximas ações definidas

---

## Regras de qualidade

1. **Diagnóstico antes de prescrição** — nunca recomendar sem analisar primeiro
2. **Uma prioridade por semana** — foco supera volume sempre
3. **"Não fazer" é tão importante quanto "fazer"** — dispersão mata resultado
4. **Dados reais sobre intuição** — se metrics.json tiver dado, usar. Se não tiver, sinalizar
5. **Plano executável** — cada item do plano termina com skill e output concreto
6. **Nunca recomendar escalar o que não está funcionando** — volume de erro é erro maior
7. **Cruzar sempre com intelligence/** — não reinventar o que já foi aprendido

---

## Checklist antes de entregar

- [ ] Todos os 7 arquivos de input foram lidos?
- [ ] O diagnóstico tem base em dado ou observação real?
- [ ] A seção "não fazer" está preenchida?
- [ ] O movimento prioritário é realmente único e específico?
- [ ] Cada item do plano tem skill e output associados?
- [ ] Alertas só aparecem se forem reais?
- [ ] Foi oferecido atualizar o `estrategia.md`?

---

## Exemplo de ativação

```
/estrategia
```

Ou com contexto adicional:

```
/estrategia — foco em aquisição
/estrategia — cliente travado, sem leads há 2 semanas
/estrategia — reunião com cliente amanhã, preciso do plano
```

---

## Diferença entre esta skill e o estrategia.md

| | `estrategia.md` | `skill-estrategista.md` |
|---|---|---|
| O que é | Documento | Raciocínio |
| Quem preenche | Você manualmente | O sistema automaticamente |
| Quando atualiza | Após reunião ou decisão | A cada sessão de trabalho |
| Base | O que você sabe | O que os dados mostram |
| Output | Registro de intenção | Plano de execução |

---

*Skill v1.0 — MarketingOS*
*Ativar sempre como primeira skill da sessão, após /abrir*
