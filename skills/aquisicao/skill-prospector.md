# skill-prospector.md — Prospector de Clientes
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar.
> Recebe nicho do skill-market-analyzer ou diretamente do usuário.
> Output: lista qualificada de prospectos com abordagem personalizada.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2 e 3 (negócio, cliente ideal, posicionamento)
→ intelligence/benchmarks.json — métricas de referência do nicho
→ intelligence/market-opportunities.md — oportunidades mapeadas (se existir)
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, alma.md, notes.md, estrategia.md

---

## Objetivo

Encontrar, qualificar e priorizar potenciais clientes dentro de um nicho,
entregando para cada prospecto:
- Dados de contato e presença digital
- Diagnóstico rápido da situação atual
- Score de prioridade de abordagem
- Mensagem de abertura personalizada

---

## Posição no fluxo

```
skill-market-analyzer → [nicho identificado]
        ↓
skill-prospector       ← esta skill
        ↓
skill-estrategista     → decide quem abordar esta semana
        ↓
skill-offer-positioning → gera abordagem final
```

---

## Modos de operação

```
Modo A — Vindo do market-analyzer
  Recebe: nicho + contexto completo da análise
  Sistema vai direto para busca sem perguntas

Modo B — Nicho informado diretamente
  Comando: /prospector nicho: [nicho] região: [região]
  Sistema busca sem perguntas adicionais

Modo C — Descoberta guiada
  Comando: /prospector
  Sistema pergunta: "Qual nicho e região?"
  Você responde → segue o fluxo

Modo D — Lista fornecida manualmente
  Comando: /prospector lista: [perfis ou empresas]
  Sistema qualifica e gera abordagem para cada um
  Ideal para: quando você já tem os nomes, só precisa da qualificação
```

---

## Input esperado

```
1. Nicho + região       → do market-analyzer ou do comando
2. client.md ativo      → persona ideal para cruzar com os prospectos
3. intelligence/market-opportunities.md → contexto do nicho
4. intelligence/benchmarks.json → benchmarks do nicho
```

---

## Critérios de qualificação

Para cada prospecto encontrado, avaliar:

```
PRESENÇA DIGITAL
  → Tem site? Converte ou é só institucional?
  → Tem Instagram? Qual a qualidade do conteúdo?
  → Faz tráfego pago? (sinal de que investe em marketing)
  → Tem WhatsApp Business?
  → Score: quanto mais fraca a presença, maior a oportunidade

PORTE E POTENCIAL
  → Qual o tamanho aparente do negócio?
  → Tem capacidade de pagar pelo serviço?
  → Está em crescimento ou estagnado?

SINAL DE ABERTURA
  → Algum sinal de que está buscando solução agora?
  → Postou sobre dificuldades? Mudou algo recentemente?
  → Seguiu perfis de marketing? Interagiu com conteúdo do nicho?

FIT COM O MARKETINGOS
  → O problema dele é resolvível pelo sistema?
  → Tem os canais mínimos para operar? (WhatsApp + alguma rede)
  → O decisor é acessível diretamente?
```

---

## Score de prioridade

```
🔴 QUENTE  — presença fraca + sinal de abertura + porte adequado
             Abordar esta semana

🟡 MORNO   — presença fraca + sem sinal claro + porte adequado
             Abordar no próximo ciclo

🔵 FRIO    — presença razoável ou porte incerto
             Monitorar e abordar quando houver sinal
```

---

## Formato de output

---

### LISTA DE PROSPECTOS — [Nicho] | [Região]
**Data:** [ ]
**Total encontrados:** [ ]
**Quentes:** [ ] | **Mornos:** [ ] | **Frios:** [ ]

---

#### 🔴 PROSPECTO #1 — [Nome / Empresa]

```
Temperatura:      QUENTE
Score:            [ /10 ]

CONTATO
  Instagram:      @[ ]
  Site:           [ url ou "não tem" ]
  WhatsApp:       [ número público ou "não encontrado" ]
  Localização:    [ cidade ]

DIAGNÓSTICO RÁPIDO
  Presença digital:  [ descrição em 1 linha ]
  Maior problema:    [ o que está claramente faltando ]
  Oportunidade:      [ o que o MarketingOS resolveria ]

SINAL DE ABERTURA
  → [ por que esse prospecto está quente agora ]

ABORDAGEM RECOMENDADA
  Canal:    [ Instagram DM / WhatsApp / E-mail ]
  Gancho:   [ o que usar para abrir a conversa ]
  Tom:      [ baseado no perfil do decisor ]

MENSAGEM DE ABERTURA
→ [TEXTO PRONTO PARA ENVIAR — personalizado, não genérico]
```

---

#### 🟡 PROSPECTO #2 — [Nome / Empresa]

```
Temperatura:      MORNO
Score:            [ /10 ]

CONTATO
  Instagram:      @[ ]
  Site:           [ ]
  WhatsApp:       [ ]

DIAGNÓSTICO RÁPIDO
  Presença digital:  [ ]
  Maior problema:    [ ]
  Oportunidade:      [ ]

ABORDAGEM RECOMENDADA
  Canal:    [ ]
  Gancho:   [ ]

MENSAGEM DE ABERTURA
→ [TEXTO PRONTO]
```

---

#### Resumo executivo

```
Total de prospectos qualificados:  [ ]
Quentes para abordar esta semana:  [ lista de nomes ]
Mornos para próximo ciclo:         [ lista de nomes ]
Melhor canal de abordagem no nicho: [ Instagram / WhatsApp / outro ]
Padrão observado:                  [ o que os prospectos quentes têm em comum ]
```

---

## Salvar outputs

```
Lista completa:
→ /clients/[slug]/outputs/prospects/[nicho]-[data].md

Padrão identificado (se confirmado em 3+ prospectos):
→ intelligence/patterns.md

Dados do nicho:
→ intelligence/benchmarks.json
```

---

## Passagem para o próximo passo

Ao final, perguntar:

```
"Quer que eu gere a abordagem completa para o prospecto #1 agora?"

Se sim:
→ Ativar skill-offer-positioning com contexto do prospecto
→ Gerar mensagem completa de abordagem

Se não:
→ Salvar lista e aguardar próximo comando
```

---

## Regras de qualidade

1. **Nunca inventar dados de contato** — se não encontrou, sinalizar como "não encontrado"
2. **Mensagem de abertura nunca genérica** — sempre referencia algo específico do prospecto
3. **Diagnóstico baseado no que é público** — não especular sobre o que não dá para ver
4. **Score justificado** — todo número tem motivo declarado
5. **Quente só com sinal real** — não classificar como quente por feeling
6. **Salvar em intelligence/** — padrões de prospecção são ativos do sistema
7. **Máximo 10 prospectos por rodada** — qualidade supera volume

---

## Checklist antes de entregar

- [ ] Cada prospecto tem dados de contato reais ou "não encontrado"?
- [ ] O diagnóstico é específico para aquele negócio?
- [ ] A mensagem de abertura referencia algo do prospecto?
- [ ] O score tem justificativa?
- [ ] Os quentes têm sinal real de abertura?
- [ ] O resumo executivo aponta o padrão?
- [ ] Foi oferecida a passagem para skill-offer-positioning?
- [ ] Output salvo em /outputs/prospects/?

---

## Exemplo de ativação

```
/prospector
/prospector nicho: clínicas de estética região: Rio de Janeiro
/prospector nicho: escritórios de advocacia região: São Paulo
/prospector lista: @clinica.exemplo, @studio.exemplo, @consultorio.exemplo
```

---

## Integração com o ciclo completo

```
Toda abordagem bem sucedida registrada em notes.md do cliente
  ↓
Padrão de abordagem confirmado em 2+ casos → intelligence/patterns.md
  ↓
Sistema aprende quais ganchos convertem em quais nichos
  ↓
Próxima rodada de prospecção já começa com esse aprendizado
```

---

*Skill v1.0 — MarketingOS*
*Recebe nicho do skill-market-analyzer ou diretamente do usuário*
*Sempre seguida de skill-offer-positioning para abordagem final*
