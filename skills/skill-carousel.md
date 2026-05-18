# skill-carousel.md — Gerador de Carrossel Instagram
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer geração.
> Input obrigatório: contexto do cliente via `client.md`.

---

## Objetivo da Skill

Gerar um carrossel completo para Instagram com:
- Copy de cada slide (texto principal + legenda do slide)
- Estrutura narrativa com gancho, desenvolvimento e CTA
- Briefing visual por slide (para Canva, Figma ou geração automatizada)
- Legenda completa da publicação com hashtags

---

## Input Esperado

Antes de gerar, confirme que você tem:

```
1. Tom da marca         → extraído do client.md
2. Persona              → extraído do client.md
3. Tema do carrossel    → fornecido na solicitação
4. Objetivo             → [ Educação / Autoridade / Venda / Engajamento / Trend ]
5. Número de slides     → padrão: 7 (mínimo 5, máximo 12)
6. CTA final            → [ WhatsApp / Link na bio / Salvar / Comentar / Seguir ]
```

Se algum desses estiver ausente, pergunte antes de gerar.

---

## Estrutura Narrativa Padrão

Todo carrossel segue esta sequência:

```
Slide 1 — GANCHO
  → Frase que para o scroll
  → Deve gerar curiosidade, identificação ou choque
  → Máximo 8 palavras
  → Sem ponto final

Slide 2 — CONTEXTO / DOR
  → Apresenta o problema ou situação que o público vive
  → Cria identificação imediata
  → Tom empático, não alarmista

Slide 3 a N-2 — DESENVOLVIMENTO
  → Conteúdo principal: dicas, dados, passos, revelações
  → 1 ideia por slide
  → Título curto + 2 a 3 linhas de explicação
  → Progressão lógica entre slides

Slide N-1 — VIRADA / INSIGHT
  → O ponto mais valioso do carrossel
  → Deve gerar desejo de salvar
  → Pode ser uma frase de impacto ou síntese poderosa

Slide N — CTA
  → Ação clara e direta
  → Alinhada ao objetivo definido no input
  → Tom da marca mantido
```

---

## Formato de Output

Para cada carrossel, gere exatamente neste formato:

---

### CARROSSEL — [Tema]

**Objetivo:** [Educação / Autoridade / Venda / Engajamento / Trend]
**Persona:** [Nome ou descrição curta]
**Tom:** [Tom da marca]

---

**SLIDE 1 — GANCHO**
```
Texto principal:
[TEXTO DO SLIDE — máx. 8 palavras]

Briefing visual:
- Fundo: [cor / gradiente / foto]
- Tipografia: [tamanho / peso]
- Elemento de destaque: [ícone / número / emoji]
- Posição do texto: [centro / topo / base]
```

---

**SLIDE 2 — CONTEXTO**
```
Texto principal:
[TEXTO DO SLIDE]

Subtexto (opcional):
[linha de apoio]

Briefing visual:
- Fundo: [descrever]
- Elemento visual: [ícone / ilustração / foto sugerida]
```

---

**SLIDE [N] — [NOME DO SLIDE]**
```
Título:
[TÍTULO CURTO]

Corpo:
[2 a 3 linhas]

Briefing visual:
- Fundo: [descrever]
- Elemento visual: [descrever]
- Destaque: [palavra ou dado a enfatizar]
```

---

**SLIDE FINAL — CTA**
```
Texto principal:
[CHAMADA PARA AÇÃO]

Subtexto:
[linha de apoio ou instrução]

Briefing visual:
- Elemento de marca: [logo / cor primária]
- Botão ou destaque: [ex: "Chama no WhatsApp 👇"]
```

---

**LEGENDA DA PUBLICAÇÃO**
```
Linha 1 (gancho da legenda — repete ou complementa o slide 1):
[TEXTO]

Desenvolvimento (3 a 5 linhas):
[TEXTO]

CTA da legenda:
[TEXTO — alinhado ao CTA do último slide]

Hashtags (máx. 15, mix de nicho + específicas):
#[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ]
```

---

## Regras de Qualidade

1. **Nunca comece slide com "Você sabia que"** — é a abertura mais batida do Instagram
2. **Nunca termine slide com reticências** — corta o fluxo, parece incompleto
3. **1 ideia por slide** — jamais dois conceitos no mesmo frame
4. **O gancho do slide 1 deve funcionar sem o restante** — precisa parar o scroll sozinho
5. **O CTA deve ser específico** — "Comenta aqui" é fraco; "Comenta qual dessas te pegou" é forte
6. **Tom da marca acima de tudo** — se a marca é séria, sem emojis em excesso; se é próxima, usar com naturalidade
7. **Salvar é o melhor sinal** — se o conteúdo não vale ser salvo, reescreva o slide N-1

---

## Checklist antes de entregar

- [ ] Gancho para no scroll sem contexto adicional?
- [ ] Cada slide tem apenas 1 ideia central?
- [ ] O briefing visual de cada slide é acionável (alguém consegue reproduzir no Canva)?
- [ ] A legenda tem gancho, desenvolvimento e CTA?
- [ ] O tom está alinhado ao `client.md`?
- [ ] As hashtags são relevantes para o nicho e não genéricas demais?

---

## Exemplo de Ativação no Cursor

```
Use a skill-carousel.md.

Cliente: [slug do cliente]
Tema: [tema do carrossel]
Objetivo: [objetivo]
Slides: [número]
CTA: [ação desejada]
```

---

*Skill v1.0 — MarketingOS*
*Atualize esta skill sempre que identificar padrões que melhoram a performance dos carrosséis.*
