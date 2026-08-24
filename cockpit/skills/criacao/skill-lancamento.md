---
name: skill-lancamento
version: "1.0"
group: criacao
command: /criar lancamento
inputs:
  required: [client.md]
  optional: [alma.md, intelligence/benchmarks.json]
env: []
---

# skill-lancamento.md — Sequência de Lançamento de Perfil
> Skill do grupo: Criação
> Use quando o perfil tem zero ou poucos seguidores e precisa ser testado pelo algoritmo.
> Gera a sequência de 5 a 10 conteúdos iniciais com objetivo algorítmico por peça.
> Não executa o conteúdo — delega para skill-post.md ou skill-carousel.md.

---

## Contexto mínimo necessário

Carregar apenas:
- `client.md` — nicho, persona, tom, posicionamento
- `intelligence/benchmarks.json` — somente bloco do formato principal (reels / feed_image)

Não carregar:
- `campaigns.md`
- `metrics.json`
- `notes.md`, exceto se houver aprendizado anterior sobre audiência fria

---

## Perguntas obrigatórias antes de gerar

Não avançar sem ter as respostas:

```
1. Nicho do perfil?
2. Quem é o público que ainda não conhece esse perfil?
3. Formato principal — Reels ou carrossel?
4. Objetivo dos primeiros conteúdos — alcance ou seguidores?
5. Qual transformação ou curiosidade o conteúdo promete?
6. Estilo — educativo, opinativo, polêmico ou prático?
```

Se alguma resposta estiver ausente, perguntar antes de estruturar qualquer sequência.

---

## Lógica algorítmica

Todo conteúdo de lançamento deve seguir esta cadeia:

```
Teste inicial
  → retenção acima da média
  → replays
  → interações rápidas (salvar, compartilhar, comentar)
  → ampliação de alcance
```

Se o conteúdo não sustenta retenção alta, ele é descartado antes de escalar.
O objetivo dos primeiros posts é **passar no teste inicial** — não converter.

---

## Regras do conteúdo de lançamento

- Funcionar sem base de seguidores — sem "como sempre digo aqui" ou referência a conteúdo anterior
- Hook inteligível em 0–2 segundos por quem nunca viu o perfil
- Sem jargão do nicho nos primeiros frames
- Clareza antes de autoridade
- Cada peça deve ativar pelo menos um sinal primário (watch time, save ou share)

---

## Saída obrigatória

Uma sequência de 5 a 10 conteúdos com esta estrutura por peça:

```
Peça [N]
Formato: reels | carrossel | feed
Objetivo algorítmico: [o que o algoritmo deve medir nessa peça]
Sinal primário: watch time | save | share | comment
Hook: [frase ou cena de abertura — funciona sem contexto]
Premissa: [o que o conteúdo promete em 1 linha]
Ângulo: [por que esse ângulo funciona para audiência fria]
Estilo: educativo | opinativo | polêmico | prático
Skill de execução: skill-post.md | skill-carousel.md
Observação: [qualquer restrição ou contexto relevante para execução]
```

---

## Progressão da sequência

```
Peças 1–2   → teste de retenção (formato mais simples, hook direto)
Peças 3–4   → aprofundar o ângulo que performou
Peças 5–6   → introduzir opinião ou posicionamento
Peças 7–10  → conteúdo mais ousado, só se as peças anteriores escalaram
```

Não pular etapas. Sem dados das primeiras peças, não há base para arriscar nas últimas.

---

## O que esta skill não faz

- Não gera copy, roteiro ou briefing visual
- Não define identidade visual
- Não publica nada

Para executar cada peça da sequência: usar `skill-post.md` ou `skill-carousel.md` com o briefing desta skill como input.

---

## Critério de encerramento

A sequência está pronta quando:
- Cada peça tem objetivo algorítmico claro
- A progressão faz sentido sem depender de performance futura
- Nenhuma peça exige que o público já conheça o perfil
