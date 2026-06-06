# patterns.md — Cross-Client Intelligence
> Localização: /intelligence/patterns.md
> Padrões confirmados em 2 ou mais clientes do MarketingOS.
> O Cursor lê este arquivo antes de qualquer operação para calibrar o output com o que já foi provado.
> Só entra aqui o que foi testado, comparado e validado — não hipóteses.

---

## Como um padrão entra aqui

```
1. Resultado acima do esperado registrado no notes.md de um cliente
2. Mesmo comportamento observado em segundo cliente
3. Confirmado como padrão — registrado aqui
4. Skill relevante atualizada em skill-updates.md
5. Benchmarks revisados em benchmarks.json
```

Um padrão só sai daqui se for refutado por dados posteriores.
Nesse caso: mover para a seção "Padrões Refutados" com o motivo.

---

## Formato de entrada

```
### [ID] — [Título do padrão]

Categoria:        [ Conteúdo / Copy / Canal / Oferta / Funil / Retenção / Reativação ]
Confirmado em:    [ Cliente A, Cliente B ]
Nichos:           [ nichos onde foi validado ]
Canais:           [ canais onde se aplica ]
Data:             [ mês/ano da confirmação ]

Descrição:
→ O que foi observado, em que contexto e com qual resultado

Aplicação prática:
→ Como usar esse padrão em novas operações

Skill impactada:
→ [ qual skill foi ou deve ser atualizada ]

Exceções conhecidas:
→ [ situações onde o padrão não se aplica ]
```

---

## Padrões Confirmados

### P001 — Pipeline HTML → Playwright → MP4 para Reels sem edição

Categoria:        Produção / Canal
Confirmado em:    felipe-proenca (Reel 01 — 2026-06-06)
Nichos:           Marketing, Tecnologia, Consultoria
Canais:           Instagram Reels
Data:             jun/2026

Descrição:
→ Reels de texto revelado gerados inteiramente em código (HTML + CSS + JS),
  gravados pelo Playwright como vídeo e convertidos para MP4 via FFmpeg.
  Operador só adiciona áudio no CapCut (~5 min). Zero edição de vídeo.
  Aprovado e validado pelo cliente na primeira iteração.

Aplicação prática:
→ Para qualquer cliente que precise de Reels sem câmera ou edição:
  1. Pesquisa de tema (WebSearch IA + cotidiano)
  2. Roteiro cena a cena (10–12 cenas, 25–30s total)
  3. HTML com brand-kit do cliente
  4. npm run reel:render → MP4

Regras técnicas críticas:
→ Logo final: CSS @keyframes obrigatório (JS transitions não disparam no Playwright)
→ Letter-spacing: 0.01em positivo (negativo achata as letras na gravação)
→ --duration: tempo_animação + 2000ms de buffer (nunca cortar o logo)
→ Dimensão: 1080×1920, deviceScaleFactor: 1 (não usar 2x para vídeo)

Skill impactada:
→ skills/criacao/skill-reels.md (criada nesta sessão)

Exceções conhecidas:
→ Reels com pessoa falando: este pipeline não se aplica
→ Reels com footage externa: usar CapCut diretamente

---

### Exemplo ilustrativo (não validado)

```
### P001 — Gancho emocional supera gancho informativo em nichos de confiança

Categoria:        Conteúdo
Confirmado em:    [ a preencher ]
Nichos:           Joalheria, Segurança, Saúde
Canais:           Instagram Orgânico, Meta Ads
Data:             [ a preencher ]

Descrição:
→ Carrosséis com gancho baseado em emoção (identificação, medo, aspiração)
  geraram engajamento 2–3x maior que ganchos informativos ("5 dicas de X")
  em nichos onde a decisão de compra é baseada em confiança e não em preço.

Aplicação prática:
→ Priorizar gancho emocional na skill-carousel para clientes de serviço,
  joalheria, saúde e segurança. Reservar gancho informativo para nichos
  técnicos onde o público busca dado antes de confiar.

Skill impactada:
→ skill-carousel.md — seção "Gancho"

Exceções conhecidas:
→ Nichos B2B com decisor técnico — gancho informativo tende a performar melhor
```

---

## Padrões Refutados

> Padrões que foram validados mas posteriormente contraditos por dados.
> Mantidos aqui para evitar que sejam reintroduzidos sem base.

---

*Nenhum padrão refutado ainda.*

---

## Índice por Categoria

| ID | Título | Categoria | Nichos | Data |
|---|---|---|---|---|
| P001 | Pipeline HTML→Playwright→MP4 para Reels | Produção / Canal | Marketing, Tech, Consultoria | jun/2026 |

---

*Última atualização: ___________*
*Total de padrões ativos: 0*
*Responsável pela curadoria: ___________*
