# visual-direction.md — Felipe Proença / MarketingOS
> Atualizado em 2026-06-10. Derivado do brand-kit.json v2 + perception.json.
> Substitui versão anterior (pré-Virada). Brand-kit.json é a fonte de verdade operacional.

---

## Assinatura Perceptiva

> **"sistema que parece manifesto"**

Não parece agência. Não parece SaaS. Não parece consultoria. Não parece automação.
É uma posição estranha. Posições estranhas são memoráveis.

A identidade visual existe para comunicar essa posição intelectual — não para parecer sofisticado.

---

## Anti-DNA — O que nunca pode aparecer

| Proibido | Por quê |
|---|---|
| Gradientes coloridos ou aurora animada | Sinal de agência criativa — oposto da assinatura |
| Qualquer acento além do gold #c9a55c | Destrói a identidade unificada Marketing/OS v2 |
| Visual vibrante ou paletas com múltiplas cores | Quebra o contraste extremo que é a declaração da marca |
| Layouts descontraídos e orgânicos | Contradiz a assinatura técnica |
| Fontes além de Syne / Playfair Display / JetBrains Mono | Identidade não é tipografia — mas trocar fragmenta |
| Fotos de banco de imagem de "marketing" | Destrói credibilidade técnica |
| Emojis nas peças de feed | Apenas no terminal block como texto, nunca como decoração |
| Inter como tipografia | Identidade usa Syne — Inter é genérico |
| border-radius > 12px em cards | Quebra o sistema visual |
| Elementos decorativos sem função | Ornamentação existe para apoiar hierarquia, nunca por estética |
| Promessas de resultado em número de dias | Contradiz o posicionamento de sistema |

---

## Estilos Obrigatórios

**1. Editorial técnico** — informação densa com hierarquia clara. Cada elemento tem posição e função.

**2. Dark premium** — profundidade visual sem ostentação. Escuro não é dramático — é a temperatura da marca.

**3. Contraste extremo** — preto e gold como declaração de posição. A paleta é binária: fundo escuro, acento único.

**4. Minimalismo funcional** — o conteúdo é a ornamentação. Layout serve à ideia.

**5. Camadas de leitura** — superfície acessível, profundidade disponível. Quem passa rápido lê o headline. Quem para, lê a estrutura toda.

---

## Paleta Operacional

| Token | Valor | Uso |
|---|---|---|
| background | #080808 | Fundo base de todos os slides e peças |
| surface | #111111 | Cards, blocos, containers |
| surface_2 | #1a1a1a | Terminal blocks, blocos aninhados |
| border | rgba(255,255,255,0.07) | Divisores sutis |
| text | #fafafa | Texto principal |
| muted | #888888 | Texto secundário, metadados |
| dim | rgba(255,255,255,0.3) | Texto terciário |
| gold | #c9a55c | Único acento cromático — usar com critério cirúrgico |
| gold_dim | rgba(201,165,92,0.14) | Background de destaques sutis |
| gold_border | rgba(201,165,92,0.28) | Bordas de elementos em destaque |

**Regra do acento:** Gold é o único ponto de atenção por frame. Se tudo é dourado, nada é dourado.

---

## Tipografia

| Função | Fonte | Uso |
|---|---|---|
| Headlines e estrutura | Syne 800/900 | Slides, feeds, títulos de seção |
| Sub-headlines | Syne 600 | Suporte ao headline |
| Corpo | Syne 400 | Parágrafos, descrições |
| Eyebrow | Syne 500, uppercase, letter-spacing 0.2em, gold | Contexto antes do headline |
| Impacto emocional | Playfair Display italic 400 | Reservado para UMA frase por peça |
| Dados, terminal, meta | JetBrains Mono | Terminal blocks, numeração, métricas |

**Regra do Playfair:** Aparece uma vez por peça. Se aparecer duas vezes, perde o impacto.

---

## Fotografia e Composição

Sem fotografia de pessoas. O processo real é o visual.

Fontes válidas de conteúdo visual:
- Terminal blocks mostrando o sistema em operação
- Outputs reais do sistema: perception.json, brand-kit, carrosséis
- Código real, arquivos .md, estrutura de pastas
- Métricas reais com dados verificáveis

Nunca: banco de imagem, fotos de "marketing" com laptops ou post-its, mockups genéricos.

---

## Padrões de Layout (do brand-kit.json)

| Padrão | Quando usar |
|---|---|
| Ghost number | Slide de gancho e CTA — número de fundo Syne 900, gold opacity 0.04-0.06 |
| Eyebrow line | Toda seção que precisa de contexto antes do headline |
| Terminal block | Bastidores, prova de processo, build in public |
| Stat boxes | Resultados e prova quantitativa |
| Color flip slide | Sempre um por carrossel — fundo gold #c9a55c, texto escuro |
| Progress dots | Todo carrossel — rodapé direito |
| Grain overlay | Todo slide escuro — SVG feTurbulence, opacity 0.04 |

---

## Princípios de Layout

- Espaço vazio como sinal de confiança — não preencher por preencher
- Gold usado com critério cirúrgico — um ponto de atenção por frame
- Grain overlay sutil em fundos escuros (textura de materialidade, não decoração)
- Hierarquia tipográfica conduz a leitura — não precisa de seta ou ícone decorativo
- Contraste entre peso tipográfico substitui cor
