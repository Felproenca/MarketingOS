---
name: funnel-strategy
version: "1.0"
group: transversal
command: /funil
aliases: [/funnel, /funnel-strategy, /estrategia-funil]
inputs:
  required: [client.md]
  optional: [metrics.json, campaigns.md, estrategia.md, outputs/acquisition/acquisition-diagnosis.json, outputs/branding/perception.json, outputs/branding/visual-dna.json]
env: []
---

# Funnel Strategy Skill
> Skill transversal do MarketingOS.
> Leia este arquivo completo antes de planejar ou criar qualquer ativo comercial.
> Funil aqui nao e landing page, formulario ou sequencia de e-mails.
> Funil e a camada de decisao que organiza atencao, intencao, qualificacao, venda e expansao.

---

## Tese

MarketingOS nao cria conteudo. Cria movimento comercial.
MarketingOS nao cria site. Cria ambiente de conversao.
MarketingOS nao cria formulario. Cria qualificacao.
MarketingOS nao cria campanha. Cria progressao de intencao.

A maioria dos negocios nao precisa apenas de mais conteudo.
Precisa de um caminho melhor entre atencao e compra.

Marketing sem funil gera movimento.
Funil estruturado gera progressao.

---

## Quando Acionar

Acione esta skill sempre que o sistema gerar ou avaliar:

- site premium
- landing page
- campanha
- roteiro de video
- carrossel
- post
- lead magnet
- formulario
- diagnostico
- oferta
- outbound
- sequencia de email
- automacao
- dashboard comercial
- proposta
- plano de conteudo
- plano de aquisicao

Regra dura:

```text
Nenhum ativo comercial pode ser criado sem Funnel Metadata.
Nenhum conteudo comercial pode sair sem funcao de aquisicao declarada.
```

Conteudo, no MarketingOS, nao existe para preencher calendario.
Existe para produzir progressao: atencao, percepcao do problema, intencao,
qualificacao, conversa ou compra. Se a peca nao declara qual progressao espera
provocar, ela deve ser reprovada ou redesenhada antes da producao.

---

## Contexto Minimo Necessario

Carregar apenas o necessario para a decisao:

- `clients/[slug]/client.md` - negocio, oferta, ICP, canais, metas e tom
- `clients/[slug]/metrics.json` - se houver dados reais de leads, conversao, canal ou vendas
- `clients/[slug]/campaigns.md` - se houver campanhas, CTAs ou ativos em andamento
- `clients/[slug]/estrategia.md` - se houver prioridade operacional atual
- `clients/[slug]/outputs/acquisition/acquisition-diagnosis.json` - se existir diagnostico recente
- `clients/[slug]/outputs/branding/perception.json` - se a progressao depender de percepcao
- `clients/[slug]/outputs/branding/visual-dna.json` - se houver output visual

Nao carregar:

- outputs antigos de outros clientes
- transcricoes inteiras quando existir `signals.json`
- assets visuais pesados antes de definir o papel do ativo no funil

Se faltar dado, seguir com hipotese explicita. Nunca transformar inferencia em fato.

---

## Relacao Com Outras Skills

Esta skill entra antes de design, copy, conteudo e automacao.

Consome ou orienta especialmente:

- `skills/premium-site/`
- `skills/perception/`
- `skills/criacao/skill-creative-direction.md`
- `skills/criacao/skill-branding.md`
- `skills/criacao/skill-carousel.md`
- `skills/criacao/skill-post.md`
- `skills/criacao/skill-reels.md`
- `skills/criacao/skill-site-builder.md`
- `skills/aquisicao/skill-lead-capture.md`
- `skills/aquisicao/skill-offer-positioning.md`
- `skills/aquisicao/skill-prospecting-agent.md`
- `skills/analise/skill-funnel-analysis.md`
- `clients/[slug]/client.md`
- `clients/[slug]/metrics.json`
- `clients/[slug]/campaigns.md`

Hierarquia recomendada:

```text
1. Business Intelligence
2. Funnel Architect
3. Creative Direction
4. Copywriting
5. Design / Site
6. Automation
7. Analytics
```

---

## Perguntas Obrigatorias

Todo output comercial precisa responder:

```text
Que tipo de lead isso atrai?
Qual tensao ou problema isso ativa?
Qual estagio de consciencia esse lead possui?
Qual sinal esse ativo espera gerar?
Qual nivel de friccao esse lead aceita agora?
Qual pergunta de qualificacao precisa ser feita?
Qual CTA e proporcional a esse momento?
Para onde o lead deve ir depois?
Como esse lead sera categorizado?
Qual proxima acao comercial deve acontecer?
```

---

## Funnel Metadata Obrigatorio

Todo output comercial deve conter este bloco:

```md
## Funnel Metadata

- Funnel stage:
- Intent level:
- Friction level:
- Expected lead signal:
- Qualification goal:
- Primary CTA:
- Secondary CTA:
- Routing destination:
- Next best action:
```

Campos aceitos:

```text
Funnel stage:
awareness | problem-aware | solution-aware | comparison | decision | retention | expansion

Intent level:
low | medium | high

Friction level:
0 | 1 | 2 | 3 | 4
```

Se algum campo nao puder ser preenchido com dado confirmado, usar `Hipotese:` no proprio campo.

### Extensao Instagram

Quando o ativo for de Instagram, carregar tambem:

- `intelligence/doutrina-instagram-operacao.md`
- `platform-playbooks/instagram.md`
- secao **Instagram Channel Metadata** em `templates/funnel-metadata.md`
- schema opcional `instagram_channel` em `schemas/funnel-metadata.schema.json`

Campos de canal: discovery, conversion, trigger, first response asset, origin tag,
save/share/DM motive, private domain entry, response SLA.

---

## Processo

1. Definir o gargalo comercial que o ativo precisa remover.
2. Identificar o lead que o ativo deve atrair.
3. Determinar estagio de consciencia e nivel de intencao.
4. Escolher o nivel de friccao permitido.
5. Definir oferta de entrada proporcional.
6. Definir o sinal esperado.
7. Criar pergunta de qualificacao.
8. Definir roteamento e proxima melhor acao.
9. Gerar ou revisar o ativo com Funnel Metadata.
10. Validar pelo `funnel-gate.md`.

O MarketingOS nunca deve comecar direto na producao de ativos.
Antes de produzir, deve entender qual caminho comercial sera alimentado.

---

## Funnel Architect Agent

Agente conceitual: `funnel_architect_agent`

Funcao:

```text
1. Identificar gargalo comercial.
2. Definir estagio de consciencia do publico.
3. Escolher nivel de friccao.
4. Definir oferta de entrada.
5. Criar mapa de conteudo.
6. Criar mapa de captura.
7. Criar perguntas de qualificacao.
8. Definir lead scoring.
9. Definir roteamento.
10. Definir proximos ativos.
```

Esse agente nao cria design final.
Ele cria a arquitetura que os outros agentes executam.

---

## Arquivos Da Skill

- `funnel-principles.md` - doutrina operacional
- `funnel-gate.md` - gate obrigatorio antes da entrega
- `funnel-health-score.md` - diagnostico de maturidade do funil
- `funnel-blueprint.md` - processo ponta a ponta
- `friction-map.md` - niveis de friccao e CTAs
- `qualification-engine.md` - classificacao e perguntas
- `offer-ladder.md` - escada de ofertas
- `content-funnel-engine.md` - conteudo com funcao comercial
- `inbound-engine.md` - arquitetura inbound
- `outbound-engine.md` - outbound baseado em sinal
- `conversational-commerce.md` - DM, WhatsApp e chat commerce
- `FUNNEL-INTELLIGENCE-ATLAS.md` - matriz cultural e geografica
- `platform-playbooks/` - regras por canal (Instagram: cruzar com `intelligence/doutrina-instagram-operacao.md`)
- `cultural-playbooks/` - regras por mercado
- `templates/` - artefatos reutilizaveis
- `schemas/` - contratos JSON
- `examples/` - exemplos operacionais
- Doutrina de canal Instagram: `../../intelligence/doutrina-instagram-operacao.md`

---

## Criterio De Qualidade

A entrega so e aprovada se responder:

- O conteudo gera qual sinal?
- O CTA esta proporcional a friccao?
- O formulario qualifica sem parecer interrogatorio?
- O lead scoring separa fit de intencao?
- Existe proximo passo claro?
- Existe rota para lead bom, lead frio, lead ruim e lead urgente?
- O funil conecta conteudo, site, oferta e venda?
- A entrega pode alimentar metricas futuras?
- A logica muda conforme canal, cultura e maturidade do publico?

---

## Nao Fazer

- Nao criar funil generico.
- Nao usar CTA agressivo em lead frio.
- Nao pedir 10 perguntas antes do contato.
- Nao tratar todos os leads como oportunidade.
- Nao confundir trafego com demanda.
- Nao confundir lead com cliente pronto.
- Nao criar conteudo sem funcao comercial.
- Nao criar site sem logica de captura.
- Nao criar outbound sem sinal, tensao ou personalizacao.
- Nao criar diagnostico sem proximo passo.
- Nao criar formulario igual para todos os canais.
- Nao aplicar logica de LinkedIn no TikTok.
- Nao aplicar logica de Estados Unidos no Brasil sem adaptacao.
- Nao transformar funil em teoria sem uso operacional.

---

## Checklist Antes De Entregar

- [ ] Funnel Metadata preenchido?
- [ ] Hipoteses marcadas como hipoteses?
- [ ] Nivel de friccao proporcional ao estagio de consciencia?
- [ ] CTA tem funcao comercial clara?
- [ ] Pergunta de qualificacao definida?
- [ ] Roteamento definido?
- [ ] Proxima melhor acao definida?
- [ ] Ativo conecta com antes e depois da jornada?
- [ ] Medida de sucesso definida?

---

*Skill v1.0 - MarketingOS*
*Funil como camada central de inteligencia comercial.*
