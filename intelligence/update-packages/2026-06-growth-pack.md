# Pacote de Updates - Growth Pack v1

Criado em: 2026-06-06  
Fonte: `intelligence/repertoire-updaters/`  
Status: executado em 2026-06-06  
Regra: aplicar na ordem abaixo e registrar cada update em `intelligence/skill-updates.md`.

---

## Objetivo

Transformar o repertorio externo ja inventariado em melhorias internas do MarketingOS para diagnostico, captura, proposta, prova, SEO/AEO e retencao.

Este pacote vem depois de:

- U003 - Aquisicao v1.1
- U004 - Social Copy v1.1

---

## Ordem de Execucao

### U005 - Site Audit / Diagnostico Comercial v1.0

Tipo: nova skill  
Prioridade: alta  
Motivo: vira ferramenta de diagnostico para prospect, cliente e demo.

Criar:
- `skills/analise/skill-site-audit.md`

Atualizar:
- `skills/analise/_admin.md`
- `CLAUDE.md`
- `workflows/commands.md`
- `docs/manual-de-uso.md`

Repertorio usado:
- `ai-marketing-claude`: `market-audit`, `market-landing`, `market-funnel`, `market-report`
- `ai-marketing-claude-code-skills`: `homepage-audit`
- `marketingskills`: `cro`, `copywriting`, `seo-audit`, `competitor-profiling`

Saida esperada:

```text
Score comercial do site: 0-100
Clareza da promessa:
CTA:
Prova social:
Friccao:
SEO/AEO basico:
Comparacao concorrente:
Vazamento de lead:
Top 5 correcoes por impacto:
Mensagem curta para enviar ao prospect:
```

Critério de aceite:
- Diagnostico precisa gerar proximo passo comercial, nao apenas auditoria tecnica.
- Deve separar dado real, estimativa e inferencia.
- Deve apontar uma melhoria de conversao aplicavel em 7 dias.

---

### U006 - Lead Capture v1.1

Tipo: evolucao de skill existente  
Prioridade: alta  
Motivo: aquisicao sem captura vira atencao desperdicada.

Atualizar:
- `skills/aquisicao/skill-lead-capture.md`

Repertorio usado:
- `marketingskills`: `lead-magnets`, `popups`, `free-tools`, `signup`, `analytics`
- `ai-marketing-claude`: `market-funnel`, `market-landing`

Adicionar:
- mapa de captura por temperatura do lead
- lead magnet por intencao
- CTA primario/secundario
- reducao de risco abaixo do CTA
- checklist de tracking minimo
- handoff para `/vender`

Saida esperada:

```text
Oferta de entrada:
Tipo de captura:
Campo minimo:
CTA:
Reducao de risco:
Evento de tracking:
Mensagem pos-captura:
Handoff para venda:
```

Critério de aceite:
- Captura deve pedir o minimo necessario.
- Toda captura precisa ter promessa clara e proximo passo.
- Deve haver evento de tracking recomendado.

---

### U007 - Pitch / Proposta Comercial v1.1

Tipo: evolucao de skill existente  
Prioridade: alta  
Motivo: proposta precisa carregar diagnostico, prova e decisao.

Atualizar:
- `skills/aquisicao/skill-pitch-deck.md`
- `skills/venda/skill-venda.md` se necessario

Repertorio usado:
- `ai-marketing-claude`: `market-proposal`, `proposal-template`
- `marketingskills`: `sales-enablement`, `competitors`, `copywriting`
- `ai-marketing-claude-code-skills`: `case-study-builder`, `testimonial-collector`

Adicionar:
- proposta guiada por diagnostico
- slide de custo da inacao
- slide de prova/case
- matriz de objecoes
- comparativo antes/depois
- follow-up depois da proposta

Saida esperada:

```text
Diagnostico que abre a proposta:
Custo da inacao:
Sistema recomendado:
Prova:
Plano:
Objecoes provaveis:
Proximo passo:
Follow-up D+2:
Follow-up D+7:
```

Critério de aceite:
- Nenhuma proposta sem diagnostico.
- Preco deve ser ancorado em perda, oportunidade ou resultado.
- Precisa incluir proximo passo simples.

---

### U008 - SEO/AEO e Descoberta v1.1

Tipo: evolucao de skill existente  
Prioridade: media  
Motivo: busca tradicional e busca por IA viram canal de aquisicao e autoridade.

Atualizar:
- `skills/analise/skill-seo.md`
- possivelmente `skills/criacao/skill-niche-intelligence.md`

Repertorio usado:
- `marketingskills`: `ai-seo`, `programmatic-seo`, `directory-submissions`, `seo-audit`, `schema`
- `ai-marketing-claude-code-skills`: `ai-discoverability-audit`

Adicionar:
- auditoria de presença em respostas de IA
- queries por categoria, dor e concorrente
- checklist de citabilidade
- paginas comparativas e locais
- diretórios relevantes
- schema basico

Saida esperada:

```text
Busca tradicional:
Busca por IA:
Queries prioritarias:
Gaps de autoridade:
Paginas que precisam existir:
Diretorios:
Schema:
Plano 30 dias:
```

Critério de aceite:
- Nao inventar volume de busca.
- Separar SEO de AEO.
- Toda recomendacao precisa conectar com captura ou autoridade.

---

### U009 - Retencao / Reativacao v1.1

Tipo: evolucao de skills existentes  
Prioridade: media  
Motivo: crescimento sem retencao cria buraco no balde.

Atualizar:
- `skills/relacionamento/skill-retention.md`
- `skills/relacionamento/skill-reactivation.md`
- `skills/relacionamento/skill-head-implantado.md` se necessario

Repertorio usado:
- `marketingskills`: `churn-prevention`, `emails`
- `claude-skills`: `customer-success-manager`, `revenue-operations`

Adicionar:
- score de risco de churn
- sinais de expansao
- cadencia de check-in
- playbook de reativacao
- health score simples
- pergunta de sucesso do cliente

Saida esperada:

```text
Health score:
Risco:
Sinal observado:
Acao de retencao:
Acao de expansao:
Mensagem:
Proxima reuniao:
```

Critério de aceite:
- Retencao precisa apontar acao, nao apenas status.
- Reativacao precisa reconhecer contexto anterior.
- Nunca prometer resultado que nao foi medido.

---

## Comando Operacional

Nao existe script automatico para aplicar este pacote porque os updates alteram regras de skill e precisam de curadoria.

Executar assim:

```text
1. Aplicar U005
2. Validar arquivos alterados
3. Registrar em intelligence/skill-updates.md
4. Aplicar U006
5. Validar
6. Registrar
7. Seguir ate U009
8. Rodar npm.cmd test
9. Conferir git status --short
```

---

## Arquivos que devem existir ao final

Novos:
- `skills/analise/skill-site-audit.md`

Alterados:
- `skills/analise/_admin.md`
- `skills/aquisicao/skill-lead-capture.md`
- `skills/aquisicao/skill-pitch-deck.md`
- `skills/analise/skill-seo.md`
- `skills/relacionamento/skill-retention.md`
- `skills/relacionamento/skill-reactivation.md`
- `intelligence/skill-updates.md`
- `CLAUDE.md`
- `workflows/commands.md`
- `docs/manual-de-uso.md`

---

## Nao Fazer

- Nao importar template externo literalmente.
- Nao criar skill enorme que tente resolver tudo.
- Nao misturar auditoria tecnica com diagnostico comercial sem priorizacao.
- Nao criar novos comandos sem documentar.
- Nao mexer em `manifesto.md` ou `alma.md`.

---

## Pronto para executar quando

- O usuario confirmar: "executar Growth Pack"
- Ou pedir especificamente: "executar pacote de updates"
