# Experience Continuity — sustentar a promessa do primeiro ao último scroll

> Status: gate operacional para sites e landing pages.
> Função: impedir que um hero extraordinário seja seguido por uma página genérica.
> Princípio: a intensidade pode variar; a qualidade percebida nunca pode despencar.

---

## North Star da experiência

```text
Qual reação observável esta página precisa produzir — e como cada seção mantém
essa reação avançando até a ação comercial?
```

O objetivo não é manter espetáculo constante. É desacelerar sem perder velocidade:
alternar impacto, respiração, prova e recompensa sem quebrar a identidade.

---

## Os quatro pilares inseparáveis

1. **Narrativa** — o que a pessoa passa a acreditar.
2. **Copy** — o que ela entende e consegue repetir.
3. **Arte e assets** — o que materializa a tese.
4. **Motion e interação** — como a transformação é sentida.

Direção criativa mantém os quatro contando a mesma história. Nenhum pilar pode
compensar a ausência de outro.

---

## Contrato de reação

Antes da arquitetura, declarar reações observáveis e não adjetivos vagos:

```json
{
  "first_3_seconds": "o que a pessoa percebe ou diz",
  "first_15_seconds": "qual pergunta ou curiosidade nasce",
  "before_primary_cta": "qual crença precisa estar sustentada",
  "after_action": "qual sensação reduz o risco de avançar"
}
```

“Premium”, “moderno” e “impactante” não são reações observáveis.

---

## Curva de intensidade

Cada seção recebe intensidade de `1` a `10`, função narrativa e recompensa.

```text
impacto -> tensão -> respiração -> evidência -> recompensa -> decisão
```

Regras:

- o hero pode ser o pico inicial, não o único momento memorável;
- depois de um pico deve existir respiração, não abandono;
- a página deve ter ao menos uma recompensa intermediária antes do CTA final;
- duas seções consecutivas não podem ser blocos de texto sem mudança visual,
  evidência, interação ou progressão narrativa;
- nenhuma seção pode cair mais de 3 pontos de qualidade percebida em relação à anterior;
- o CTA final resolve a tensão aberta no hero; não começa outra história.

---

## Gramática comum

| Termo | Função |
|---|---|
| `anchor` | protagonista visual ou ideia que orienta a leitura |
| `tension` | diferença entre estado atual e estado desejado |
| `reveal` | informação ou estado que muda a compreensão |
| `breath` | redução intencional de intensidade sem perder identidade |
| `proof` | evidência verificável que sustenta a promessa |
| `reward` | momento visual, verbal ou interativo que paga a continuidade |
| `resolution` | síntese que torna a ação seguinte inevitável |

“Fade up” não é beat narrativo. É apenas uma técnica.

---

## Contrato de seção

Toda seção deve declarar:

```json
{
  "narrative_function": "anchor | tension | reveal | breath | proof | reward | resolution",
  "belief_before": "",
  "belief_after": "",
  "intensity": 1,
  "copy_budget": {
    "headline_max_words": 10,
    "body_max_words": 80,
    "reading_mode": "scan | read | inspect"
  },
  "visual_anchor": "",
  "asset_role": "",
  "motion_role": "",
  "reward": "",
  "bridge_to_next": ""
}
```

Copy não é preenchimento. O orçamento de palavras nasce do ritmo da seção.
Se a ideia exige mais texto, a arquitetura precisa criar condições reais de leitura.

---

## Asset Factory

Todo projeto cinematográfico deve ter:

- ao menos um asset exclusivo, criado ou dirigido para aquela marca;
- inventário de assets antes do build;
- origem/licença e tratamento registrados;
- crop ou composição mobile;
- função narrativa explícita;
- otimização web;
- camadas ou estados quando o motion exigir profundidade.

Um `hero_asset` pode ser um pacote:

```text
subject + background + light + shadow + mask + depth layers + highlights
```

Não basta gerar uma imagem. O pacote deve chegar pronto para a cena.

Reprovar:

- stock genérico usado como protagonista;
- imagem “bonita” sem função na tese;
- asset sem proveniência;
- composição que funciona apenas em desktop;
- linguagem visual inconsistente entre hero e restante da página.

---

## Gate de continuidade

Antes de liberar:

1. Existe reação-alvo para 3s, 15s e pré-CTA?
2. Cada seção muda uma crença ou sustenta uma prova?
3. A curva tem respiração e recompensas, não queda de qualidade?
4. Copy, arte, assets e motion contam a mesma história?
5. Existe ao menos um asset exclusivo e narrativamente necessário?
6. O CTA final resolve a tensão do hero?
7. Mobile preserva a narrativa, não apenas empilha o desktop?
8. A experiência continua reconhecível sem logo, nome e cores?

Qualquer “não” bloqueia a entrega.

---

## Avaliação

Pontuar de 0 a 10:

- reação inicial;
- continuidade narrativa;
- qualidade da copy;
- direção de arte;
- coerência dos assets;
- motion com significado;
- prova e conversão;
- experiência mobile;
- performance.

Nenhum site cinematográfico é aprovado com:

- média abaixo de `8.5`;
- qualquer dimensão abaixo de `7`;
- continuidade narrativa abaixo de `8`;
- prova inventada, asset sem origem ou CTA desconectado da tese.

