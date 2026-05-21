# skill-updates.md — Log de Melhorias de Skills
> Localização: /intelligence/skill-updates.md
> Registro de todas as melhorias aplicadas nas skills com base em resultados reais de clientes.
> Cada atualização rastreável: qual cliente gerou o aprendizado, o que mudou, por quê.

---

## Por que este arquivo existe

Skills não são estáticas. Cada cliente que opera no sistema gera dados reais que podem melhorar o output para todos os clientes futuros. Este arquivo é o registro dessas melhorias — o que mudou, com base em quê, e quem se beneficia.

```
Fluxo de atualização:

notes.md do cliente
  → padrão confirmado em patterns.md
  → melhoria identificada para uma skill
  → registrada aqui antes de aplicar
  → skill atualizada
  → versão incrementada
```

---

## Formato de entrada

```
### [ID] — [Nome da Skill] v[versão anterior] → v[nova versão]

Data:             [ mês/ano ]
Origem:           [ cliente ou padrão que gerou o aprendizado ]
Padrão associado: [ ID em patterns.md, se houver ]

O que mudou:
→ Descrição clara da alteração — seção, regra, formato ou instrução

Por que mudou:
→ Dado ou observação que justificou a mudança

Impacto esperado:
→ O que melhora no output a partir dessa atualização

Clientes beneficiados:
→ [ Todos os novos / Clientes de nicho X / Todos ]
```

---

## Atualizações Aplicadas

### U001 — skill-carousel.md v1.0 → v2.0

Data:             maio/2026
Origem:           Fran Santos — fluxo identificado como ineficiente (markdown → Python → HTML = 3 etapas)
Padrão associado: —

O que mudou:
→ Output alterado de markdown com briefing visual para HTML completo funcional.
→ Adicionado template HTML com brand-kit.json dinâmico, navegação por teclado/touch,
  barra de progresso e legenda de publicação como comentário no final do arquivo.

Por que mudou:
→ O fluxo anterior gerava copy em .md e exigia conversão Python separada.
→ Isso duplicava tokens, adicionava etapa manual e aumentava chance de erro.

Impacto esperado:
→ Um único comando entrega HTML funcional pronto para screenshot ou publicação.
→ Zero etapas intermediárias, zero Python para carrosseis.

Clientes beneficiados:
→ Todos os novos clientes a partir de maio/2026.

---

### U002 — skill-abrir.md v1.0 → v2.0

Data:             maio/2026
Origem:           Diagnóstico sistêmico — intelligence não era carregada no início da sessão
Padrão associado: —

O que mudou:
→ Adicionado Passo 2 obrigatório: carregar intelligence/patterns.md, benchmarks.json
  e experiments.md ANTES de carregar o contexto do cliente.

Por que mudou:
→ Ao trocar de cliente, os padrões aprendidos com clientes anteriores não eram
  transferidos para o novo contexto — cada sessão começava do zero.

Impacto esperado:
→ Padrões cross-client ativos sempre calibram o output desde o início da sessão,
  independente do cliente ativo.

Clientes beneficiados:
→ Todos.

---

### Exemplo ilustrativo (não aplicado)

```
### U001 — skill-carousel.md v1.0 → v1.1

Data:             [ a preencher ]
Origem:           [ a preencher ]
Padrão associado: P001

O que mudou:
→ Adicionada instrução na seção "Gancho": para nichos de confiança
  (joalheria, saúde, segurança), priorizar gancho emocional sobre informativo.
  Exemplos de cada tipo adicionados ao arquivo.

Por que mudou:
→ Carrosséis com gancho emocional geraram engajamento 2–3x maior em
  dois clientes de nichos de confiança. Padrão registrado em P001.

Impacto esperado:
→ Ganchos gerados pela skill serão mais assertivos para nichos de confiança
  sem necessidade de instrução manual a cada ativação.

Clientes beneficiados:
→ Todos os novos clientes de nicho de confiança
```

---

## Skills e Versões Atuais

| Skill | Versão atual | Última atualização | Total de updates |
|---|---|---|---|
| `skill-carousel.md` | v2.0 | maio/2026 | 1 |
| `skill-abrir.md` | v2.0 | maio/2026 | 1 |
| `skill-post.md` | v1.0 | — | 0 |
| `skill-site-builder.md` | v1.0 | — | 0 |
| `skill-dashboard.md` | v1.0 | — | 0 |
| `skill-lead-capture.md` | v1.0 | — | 0 |
| `skill-funnel-analysis.md` | v1.0 | — | 0 |
| `skill-retention.md` | v1.0 | — | 0 |
| `skill-reactivation.md` | v1.0 | — | 0 |
| `skill-offer-positioning.md` | v1.0 | — | 0 |

---

## Melhorias Pendentes

> Melhorias identificadas mas ainda não aplicadas — aguardando confirmação de padrão ou aprovação.

```
### [PENDENTE] — [Skill] — [Descrição curta]
Origem:       [ onde foi identificada ]
Status:       [ Aguardando confirmação em segundo cliente / Aguardando aprovação ]
Prazo:        [ quando revisar ]
```

---

*Última atualização: ___________*
*Total de updates aplicados: 0*
*Responsável pela curadoria: ___________*
