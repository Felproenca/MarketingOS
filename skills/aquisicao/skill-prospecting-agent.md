---
name: skill-prospecting-agent
version: "1.1"
group: aquisicao
command: /prospectar agent
inputs:
  required: [agency/icp.md]
  optional: [agency/strategy.md, intelligence/market-opportunities.md, intelligence/repertoire-updaters/acquisition.md]
env: []
---

# skill-prospecting-agent.md - Prospecting Agent como Skill
> Converte o `ProspectingAgent` em skill de qualificacao e priorizacao.
> Use para encontrar segmentos, dores, sinais de compra e mensagens iniciais.

---

## Contexto minimo necessario

Carregar apenas:
- `agency/icp.md` ou `clients/[slug]/client.md`, conforme operacao
- `agency/strategy.md` - se prospectar para o MarketingOS
- `intelligence/market-opportunities.md` - somente o nicho em questao
- `intelligence/repertoire-updaters/acquisition.md` - apenas "Mapa por categoria" e "Ordem de aplicacao recomendada", se estiver aplicando repertorio externo

Nao carregar:
- outputs antigos de outros clientes
- metricas de clientes nao relacionados
- scripts de scraper, exceto para executar ou depurar

---

## Saida obrigatoria

```text
Segmento:
Lead/empresa:
Fonte:
Sinal observado:
Sinal de dor:
Sinal de desejo:
Sinal de compra:
Prova/evidencia:
Score de oportunidade: 0-10
Prioridade: alta | media | baixa
Canal recomendado:
Mensagem inicial:
Follow-up 1:
Follow-up 2:
Risco/observacao:
Proximo passo:
```

---

## Scoring de oportunidade

Pontue antes de abordar:

```text
Fit com ICP:              0-2
Dor visivel:              0-2
Sinal de compra agora:    0-2
Capacidade de pagar:      0-1
Facilidade de contato:    0-1
Prova para personalizar:  0-1
Potencial de case:        0-1
Total:                    0-10
```

Classificacao:

```text
8-10: prioridade alta    -> abordar com diagnostico especifico
6-7:  prioridade media   -> abordar se houver prova clara
0-5:  prioridade baixa   -> nutrir, pesquisar mais ou descartar
```

Nao confundir "parece cliente ideal" com "tem sinal de compra".
Fit sem urgencia vira lista fria.
Sinal sem fit vira perda de tempo.

---

## Sinais de aquisicao que importam

Use sinais observaveis, nao achismo:

```text
Site sem CTA claro
WhatsApp escondido ou ausente
Instagram ativo sem caminho para conversao
Anuncio rodando para pagina fraca
Concorrente com oferta mais clara
Google/Maps com baixa prova social
Perfil com demanda aparente mas sem captura
Landing lenta, confusa ou sem reducao de risco
Servico caro vendido como commodity
Empresa crescendo sem sistema comercial visivel
```

Cada sinal precisa virar uma frase especifica:

```text
Vi [sinal concreto].
Isso provavelmente custa [perda ou risco].
O caminho mais rapido seria [diagnostico/proximo passo].
```

---

## Mensagem outbound v1.1

Estrutura obrigatoria:

```text
1. Prova de leitura
   "Vi que..."

2. Diagnostico curto
   "O ponto que mais chama atencao e..."

3. Custo da inacao
   "Isso pode estar fazendo voces perderem..."

4. Proximo passo leve
   "Quer que eu te mande em 2 pontos o que eu ajustaria?"
```

Regras:
- Escrever como par, nao como fornecedor.
- Uma pergunta por mensagem.
- Nao vender "marketing"; vender clareza sobre de onde vem o proximo cliente.
- Nao abrir com tecnologia, IA, pacote, post ou ferramenta.
- Personalizacao precisa conectar ao problema, nao apenas citar o nome da empresa.

Cadencia sugerida:

```text
D0: primeira mensagem com diagnostico especifico
D3: follow-up com nova prova ou comparacao
D7: follow-up com custo da inacao e pergunta simples
D14: break-up educado ou oferta de diagnostico futuro
```

---

## Regras

- Qualificar antes de abordar.
- Nao misturar contexto entre clientes.
- Mensagem deve falar do medo/desejo do lead, nao do servico.
- Se usar scraper, iniciar por dry-run.
- Nunca enviar abordagem sem prova observavel.
- Nao abordar lead com score abaixo de 6 sem pesquisar mais.
- Se o lead for prioridade alta, gerar tambem um micro-diagnostico ou demo.

```bash
npm run scraper:dry -- "<query>" --max=10 --score=6
```

---

## Handoff para venda

Quando um lead responder, entregar para `/vender` com:

```text
Origem:
Score:
Sinal usado na abordagem:
Mensagem enviada:
Resposta do lead:
Objecao aparente:
Proxima melhor pergunta:
Prova disponivel:
```

Sem esse handoff, a venda perde contexto e volta a parecer pitch generico.
