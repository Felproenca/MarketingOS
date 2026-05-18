# skill-site-builder.md — Desenvolvedor de Sites
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer geração.
> Input obrigatório: contexto do cliente via `client.md`.

---

## Objetivo da Skill

Gerar um site completo orientado a conversão com:
- Estrutura de seções definida e justificada
- Copy completa por seção (headline, subtítulo, corpo, CTA)
- SEO básico (title tag, meta description, estrutura de H1/H2)
- Briefing visual por seção (para desenvolvimento no Cursor/Next.js ou Figma)
- Integração com WhatsApp e formulário de captura

---

## Input Esperado

```
1. Dados do cliente     → extraídos do client.md (obrigatório)
2. Objetivo do site     → [ Geração de leads / Institucional / E-commerce / Landing page ]
3. Páginas necessárias  → [ Home / Sobre / Serviços / Portfólio / Contato / Blog ]
4. CTA principal        → [ WhatsApp / Formulário / Ligação / Compra ]
5. Referências visuais  → [ se o cliente forneceu ]
6. Domínio              → [ se já definido ]
```

Se algum estiver ausente, consulte o `client.md` antes de perguntar.

---

## Tipos de Entrega

### Modo 1 — Copy + Estrutura (padrão)
Gera o conteúdo completo de cada seção com briefing visual.
Usado para passar para o Cursor desenvolver o código.

### Modo 2 — HTML/Next.js Completo
Gera o código da página diretamente.
Usado quando o cliente precisa de entrega rápida.

Defina o modo no momento da ativação.

---

## Estrutura de Seções — Home (Lead Gen)

> Seções padrão para site focado em geração de leads.
> Adicione, remova ou reordene conforme o `client.md`.

```
1. HERO
2. PROBLEMA / DOR
3. SOLUÇÃO / PROPOSTA DE VALOR
4. SERVIÇOS / PRODUTOS
5. PROVA SOCIAL (depoimentos / números / cases)
6. SOBRE / AUTORIDADE
7. FAQ
8. CTA FINAL
9. RODAPÉ
```

---

## Formato de Output — Modo 1 (Copy + Estrutura)

---

### SITE — [Nome do Cliente]

**Objetivo:** [ ]
**CTA principal:** [ ]
**Página:** [ Home / Landing Page / Outra ]

---

#### SEO

```
Title tag (máx. 60 caracteres):
[TEXTO]

Meta description (máx. 155 caracteres):
[TEXTO]

H1 principal:
[TEXTO — deve coincidir ou complementar o headline do Hero]

Palavras-chave principais:
[3 a 5 termos]
```

---

#### SEÇÃO 1 — HERO

```
Headline (H1):
[FRASE PRINCIPAL — promessa clara, máx. 10 palavras]

Subtítulo:
[1 a 2 frases que expandem a promessa e qualificam o público]

CTA primário:
[texto do botão — ex: "Falar com especialista", "Quero meu orçamento"]

CTA secundário (opcional):
[ex: "Ver nossos casos" / "Como funciona"]

Briefing visual:
- Layout: [hero com imagem à direita / fundo com overlay / vídeo de fundo]
- Imagem/vídeo sugerido: [descrição do conteúdo visual ideal]
- Paleta: [cor de fundo, cor do texto, cor do botão]
- Elemento de credibilidade: [ex: "Mais de 200 clientes atendidos" abaixo do CTA]
```

---

#### SEÇÃO 2 — PROBLEMA / DOR

```
Headline da seção:
[pergunta ou afirmação que cria identificação]

Corpo:
[2 a 4 parágrafos ou lista de dores — baseado no client.md]

Transição para a próxima seção:
[frase de ponte que leva naturalmente para a solução]

Briefing visual:
- Layout: [texto centralizado / 2 colunas / cards de dor]
- Tom visual: [mais sóbrio, contraste com a seção de solução]
```

---

#### SEÇÃO 3 — SOLUÇÃO / PROPOSTA DE VALOR

```
Headline da seção:
[como a empresa resolve o que foi apresentado na seção anterior]

Subtítulo:
[1 frase de reforço]

Diferenciais (3 a 5):
- [Diferencial 1]: [descrição curta]
- [Diferencial 2]: [descrição curta]
- [Diferencial 3]: [descrição curta]

Briefing visual:
- Layout: [ícones com texto / 3 colunas / lista visual]
- Elemento de destaque: [cor de fundo diferente para destacar seção]
```

---

#### SEÇÃO 4 — SERVIÇOS / PRODUTOS

```
Headline da seção:
[ex: "O que oferecemos" / "Nossas soluções"]

Para cada serviço/produto:
  Nome: [ ]
  Descrição curta: [2 a 3 linhas — foco no benefício, não na feature]
  CTA do card: [ex: "Saiba mais" / "Quero esse"]

Briefing visual:
- Layout: [cards em grid / accordion / tabs]
- Número de itens: [ ]
```

---

#### SEÇÃO 5 — PROVA SOCIAL

```
Headline da seção:
[ex: "O que dizem nossos clientes" / "Resultados reais"]

Números de credibilidade (se houver):
- [ ] clientes atendidos
- [ ] anos de experiência
- [ ] projetos entregues

Depoimentos (estrutura por depoimento):
  Texto: [citação do cliente]
  Nome: [ ]
  Cargo / Empresa: [ ]
  Foto: [ disponível? ]

Briefing visual:
- Layout: [carrossel / grid 3 colunas / destaque único]
```

---

#### SEÇÃO 6 — SOBRE / AUTORIDADE

```
Headline da seção:
[ex: "Quem está por trás disso"]

Corpo:
[história da empresa ou fundador — humaniza, gera conexão]

Credenciais ou formações relevantes:
[ lista se houver ]

Briefing visual:
- Foto: [pessoa / equipe / ambiente de trabalho]
- Layout: [imagem à esquerda, texto à direita]
```

---

#### SEÇÃO 7 — FAQ

```
Headline da seção:
[ex: "Perguntas frequentes"]

Perguntas (baseadas nas objeções do client.md):
P: [ ]
R: [ ]

P: [ ]
R: [ ]

P: [ ]
R: [ ]

Briefing visual:
- Layout: [accordion expansível]
```

---

#### SEÇÃO 8 — CTA FINAL

```
Headline:
[última chance de converter — frase de urgência ou valor]

Subtítulo:
[1 linha de reforço]

CTA:
[texto do botão — igual ou variação do CTA do Hero]

Elemento de redução de risco (opcional):
[ex: "Sem compromisso", "Resposta em até 2h", "Atendimento gratuito"]

Briefing visual:
- Fundo: [cor de destaque da marca]
- Layout: [centralizado, botão grande, sem distrações]
```

---

#### RODAPÉ

```
Itens:
- Logo
- Links de navegação
- Contato (WhatsApp, e-mail, telefone)
- Redes sociais
- Endereço (se local)
- Copyright

Briefing visual:
- Fundo: [escuro / cor da marca]
```

---

## Regras de Qualidade

1. **Headline de cada seção deve funcionar sozinha** — o usuário que apenas escaneia deve entender o valor
2. **CTA principal repete no mínimo 3x na página** — Hero, meio e final
3. **Copy baseada no client.md** — nunca inventar diferenciais, dores ou depoimentos
4. **Cada seção tem 1 objetivo** — não sobrecarregar com múltiplas mensagens
5. **FAQ responde objeções reais** — extraídas do client.md, não genéricas
6. **WhatsApp integrado em pelo menos 2 pontos** — botão flutuante + CTA principal
7. **Mobile-first no briefing visual** — descrever como a seção se comporta em tela pequena

---

## Checklist antes de entregar

- [ ] SEO preenchido (title, meta, H1)?
- [ ] Hero tem promessa clara + CTA visível?
- [ ] As dores descritas na seção 2 estão no client.md?
- [ ] Os diferenciais da seção 3 são reais e verificáveis?
- [ ] FAQ responde as objeções mapeadas no client.md?
- [ ] CTA aparece no mínimo 3 vezes na página?
- [ ] Briefing visual de cada seção é acionável no Cursor/Figma?

---

## Exemplo de Ativação no Cursor

```
Use a skill-site-builder.md.

Cliente: [slug do cliente]
Objetivo: [geração de leads / institucional / landing page]
Páginas: [Home / Sobre / Serviços / Contato]
CTA principal: [WhatsApp / Formulário]
Modo: [Copy + Estrutura / HTML Completo]
```

---

*Skill v1.0 — MarketingOS*
*Atualize esta skill sempre que identificar padrões que melhoram a conversão dos sites.*
