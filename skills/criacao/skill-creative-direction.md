---
name: skill-creative-direction
version: "1.0"
group: criacao
command: /direcao-criativa
inputs:
  required: [client.md, brand-kit.json, alma.md]
  optional: [notes.md, intelligence/visual-references.json]
env: []
---

# skill-creative-direction.md — Motor de Direção Criativa
> Skill mestre de coerência visual do MarketingOS.
> Não é "mais uma skill". É a camada de identidade que todas as outras herdam.
> Nenhuma peça visual pode ser criada sem passar pelo teste final desta skill.
> Output obrigatório: `clients/[slug]/outputs/branding/visual-dna.json`

---

## Regra sistêmica — antes de tudo

> **"A marca continuaria reconhecível sem logo, nome e cores principais?"**

Se a resposta for não — a direção criativa não está pronta.
Nenhuma skill de criação avança sem que esse teste seja respondido com sim.

---

## Contexto mínimo necessário

Carregar apenas:
- `alma.md` (raiz) — missão, valores, critérios do sistema
- `client.md` — blocos 1, 2, 3 e 4 completos
- `brand-kit.json` — estado atual da identidade visual
- `notes.md` — inteligência acumulada e decisões visuais anteriores (se existir)
- `intelligence/visual-references.json` — banco de referências (se existir)

NÃO carregar: metrics.json, campaigns.md, estrategia.md, runs.md

---

## Estágio 1 — Leitura de Alma

Antes de qualquer decisão visual, extrair o que o cliente quer que as pessoas **sintam**.
Não o que ele vende. Não o que ele é. O que ele quer **provocar**.

Perguntas que guiam a leitura:
- O que essa marca deixa no corpo de quem a encontra?
- Se ela fosse uma textura, qual seria?
- Se fosse um ritmo musical, qual tempo?
- O que ela nunca poderia dizer ou mostrar sem trair o que é?
- Qual é a promessa não declarada dessa marca?

Output do estágio:
```
alma_percebida: [2-3 frases que capturam a essência emocional]
promessa_nao_declarada: [o que a marca promete sem dizer]
o_que_nunca_trair: [lista de 3-5 elementos inegociáveis]
```

Sinalizar se `client.md` estiver incompleto — não avançar sem os blocos 2 e 3.

---

## Estágio 2 — Vetores de Percepção

Mapear a marca em múltiplas dimensões simultâneas.
Não produzir um arquétipo único — produzir um mapa de tensões.

Dimensões obrigatórias (escala 0.0 a 1.0):
```json
{
  "authority": 0.0,
  "warmth": 0.0,
  "innovation": 0.0,
  "playfulness": 0.0,
  "luxury": 0.0,
  "precision": 0.0,
  "energy": 0.0,
  "transparency": 0.0,
  "boldness": 0.0,
  "subtlety": 0.0
}
```

Regras de calibração:
- Valores acima de 0.7 são dominantes — máximo 3 por marca
- Valores abaixo de 0.3 são ausentes — registrar no Anti-DNA
- Tensões entre dimensões próximas são o diferencial (ex: authority 0.8 + warmth 0.6 = autoridade acessível)
- Nunca produzir mapa simétrico — marcas reais têm tensões assimétricas

---

## Estágio 3 — Assinatura Perceptiva

Com o mapa de vetores, identificar as tensões que tornam essa marca inconfundível.

Formato:
```json
{
  "tensoes_primarias": [
    "[dimensão alta] que parece [dimensão inesperada]",
    "[dimensão alta] que parece [dimensão inesperada]"
  ],
  "assinatura": [
    "[3 a 5 frases curtas que descrevem como a marca se move no mundo]"
  ],
  "teste_de_reconhecimento": "[se alguém visse essa marca sem logo, o que reconheceria?]"
}
```

Exemplos de tensão bem formulada:
- "precisão que parece espontânea" (Linear)
- "simplicidade que esconde obsessão" (Apple)
- "cuidado que nunca pede atenção" (clínica de alto padrão)
- "autoridade que não precisa de volume" (escritório jurídico premium)

Critério de qualidade: se a tensão puder descrever outra marca sem ajuste, reescrever.

---

## Estágio 4 — Consulta ao Repertório

Com a assinatura perceptiva definida, consultar `intelligence/visual-references.json`.

Filtros de busca em ordem de prioridade:
1. `source: internal` — o que o próprio MarketingOS já criou e aprovou
2. `source: client` — referências do próprio cliente e seu mercado
3. `source: awwwards | gsap | codrops` — repertório público curado
4. `best_for` — filtrar pelo tipo de peça que será criada

Retornar 3 a 5 referências que mais se aproximam da assinatura perceptiva.
Nunca retornar referências com `tension` incompatível, mesmo que o stack seja igual.

Se o banco estiver vazio ou insuficiente:
- Registrar lacuna em `intelligence/skill-updates.md`
- Prosseguir com direção criativa baseada nos estágios anteriores
- Sinalizar ao operador que o banco precisa ser alimentado

---

## Estágio 5 — Engenharia Reversa das Referências

Cada referência retornada deve ser decomposta. Referência não entra crua. Entra interpretada.

Schema obrigatório por referência:
```json
{
  "reference": "",
  "source": "",
  "url": "",
  "tension": "",
  "why_it_matches": [],
  "what_to_steal": [],
  "what_not_to_copy": [],
  "components": {
    "motion": "",
    "3d": "",
    "scroll": "",
    "interaction": "",
    "typography": "",
    "color_behavior": ""
  },
  "transferable_principle": ""
}
```

Campo `tension` — obrigatório. Sem tensão identificada, a referência não entra.
Campo `transferable_principle` — o mais importante. É o padrão que pode ser reutilizado sem copiar a obra.
Campo `what_not_to_copy` — evita plágio estético. Paleta, layout, copy e composição literal nunca são transferíveis.

Exemplos de `transferable_principle` bem formulado:
- "usar movimento mínimo para aumentar percepção de controle"
- "silêncio visual como sinal de confiança"
- "densidade baixa como declaração de valor"
- "transições lentas que fazem o tempo parecer um privilégio"

---

## Estágio 6 — DNA Visual

Output central da skill. Arquivo consumido por todas as outras skills de criação.

```json
{
  "client": "[slug]",
  "version": "1.0",
  "generated": "[data]",
  "visual_dna": {
    "tempo": "lento | médio | rápido",
    "densidade": "baixa | média | alta",
    "contraste": "baixo | médio | alto",
    "movimento": "mínimo | preciso | expressivo | ausente",
    "profundidade": "plana | média | imersiva",
    "temperatura": "fria | neutra | quente",
    "ornamentação": "mínima | moderada | rica",
    "ritmo_tipográfico": "comprimido | equilibrado | aberto",
    "presença_branca": "densa | equilibrada | generosa",
    "textura": "lisa | sutil | presente"
  },
  "motion_principles": [
    "[princípio de movimento que define a marca]",
    "[princípio de movimento que define a marca]"
  ],
  "typography_behavior": "[como a tipografia se comporta — não qual fonte, mas como ela age]",
  "color_behavior": "[como a cor é usada — não quais cores, mas como elas operam]",
  "spatial_logic": "[como o espaço vazio é tratado — como luxo, como respiro, como silêncio]"
}
```

Regra de herança:
- `skill-site-builder.md` lê `visual_dna` + `spatial_logic` + `color_behavior`
- `skill-reels.md` lê `motion_principles` + `visual_dna.tempo` + `visual_dna.movimento`
- `skill-reel-builder.md` lê `motion_principles` + `visual_dna` completo
- `skill-carousel.md` lê `densidade` + `ritmo_tipográfico` + `presença_branca`
- `skill-social-content-agent.md` lê `visual_dna` completo
- `skill-pitch-deck.md` lê `spatial_logic` + `color_behavior`
- `skill-image-generation.md` lê `temperatura` + `profundidade` + `textura`
- `skill-prompt-engineer.md` lê `temperatura` + `textura`
- `skill-post.md` lê `visual_dna` completo
- `skill-visual-spec.md` lê `densidade` + `contraste` + `ritmo_tipográfico`

---

## Estágio 7 — Anti-DNA

O que nunca pode aparecer em nenhuma peça dessa marca.
Tão importante quanto o DNA. É o que impede a marca de virar colagem de tendências.

```json
{
  "never_use": {
    "visual": [],
    "motion": [],
    "typography": [],
    "color": [],
    "interaction": [],
    "tone": []
  },
  "reasoning": "[por que esses elementos contradizem a assinatura perceptiva]"
}
```

Critério de entrada no Anti-DNA:
- Elemento que contradiz uma tensão primária da marca
- Elemento que tornaria a marca intercambiável com outra
- Elemento que viola o `o_que_nunca_trair` do Estágio 1
- Tendência visual do momento que não serve à alma da marca

---

## Estágio 8 — Direção Criativa por Peça

Com DNA e Anti-DNA definidos, traduzir para linguagem operacional por tipo de entrega.

Para cada peça solicitada, responder:
- Qual elemento do DNA domina essa peça?
- Qual tensão precisa ser visível?
- O que do Anti-DNA precisa ser explicitamente evitado aqui?
- Se alguém visse apenas essa peça, reconheceria a marca?

Formato por peça:
```
[tipo de peça]
→ Princípio dominante: [do DNA Visual]
→ Tensão a expressar: [da Assinatura Perceptiva]
→ Stack recomendado: [tecnologia/ferramentas]
→ Referência principal: [da Engenharia Reversa]
→ Princípio transferível: [o que roubar da referência]
→ Anti-DNA a vigiar: [o que nunca fazer aqui]
→ Teste: [como saber se essa peça passou no teste de reconhecimento]
```

---

## Output obrigatório

Salvar em `clients/[slug]/outputs/branding/`:

```
visual-dna.json          ← consumido por todas as skills de criação
creative-direction.md    ← narrativa completa dos 8 estágios
references-decomposed.json ← referências após engenharia reversa
```

Atualizar `brand-kit.json` do cliente com o campo `visual_dna` se ainda não existir.
Registrar execução em `notes.md` com data e principais decisões.

---

## Checklist antes de entregar

- [ ] `alma.md` foi lido antes de qualquer decisão?
- [ ] O mapa de vetores tem no máximo 3 dimensões acima de 0.7?
- [ ] As tensões primárias são específicas o suficiente para não descrever outra marca?
- [ ] Cada referência tem `tension` e `transferable_principle` preenchidos?
- [ ] O `what_not_to_copy` inclui paleta, layout, copy e composição?
- [ ] O Anti-DNA tem justificativa (`reasoning`) preenchida?
- [ ] O `visual-dna.json` foi salvo e está pronto para ser herdado?
- [ ] O teste final foi aplicado: "reconhecível sem logo, nome e cores?"

---

## Sinais de parada

Interromper e sinalizar se:
- `client.md` blocos 2 ou 3 estiverem incompletos
- A assinatura perceptiva puder descrever outra marca sem ajuste
- O banco de referências retornar obras com `tension` incompatível
- O Anti-DNA contradizer o DNA (sinal de briefing confuso — resolver antes de continuar)

---

## Posição na arquitetura do MarketingOS

```
/direcao-criativa
      ↓
Leitura de Alma
      ↓
Vetores de Percepção
      ↓
Assinatura Perceptiva
      ↓
Consulta ao Repertório        ← intelligence/visual-references.json
      ↓
Engenharia Reversa
      ↓
DNA Visual                    → herdado por todas as skills de criação
      ↓
Anti-DNA
      ↓
Direção Criativa por Peça
      ↓
visual-dna.json               → clients/[slug]/outputs/branding/
```

Todas as skills de criação consultam `visual-dna.json` antes de executar.
Se o arquivo não existir para o cliente, executar `/direcao-criativa` antes de qualquer criação.

---

*Skill v1.0 — MarketingOS*
*Motor de coerência visual. Não é opcional — é o que separa presença de produção.*
*O banco de referências cresce com uso. A vantagem competitiva vem quando o sistema para de copiar repertório externo e começa a desenvolver gosto próprio.*
