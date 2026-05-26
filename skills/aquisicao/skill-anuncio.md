# skill-anuncio.md — Criação de Campanha de Anúncios
> Skill isolada do MarketingOS.
> Estrutura campanhas completas para Google Ads e/ou Meta Ads.
> Output: copy de anúncios + estrutura de campanha + CSV importável salvo em `outputs/anuncios/`.

---

## Objetivo

Criar campanhas de anúncios pagos prontas para subir — com copy, segmentação sugerida,
estrutura de campanha e arquivo CSV para importação direta nas plataformas.

**Não é consultoria de mídia paga — é execução de campanha baseada no contexto do cliente.**

---

## Input Esperado

```
1. Plataforma       → [ Google Ads / Meta Ads / Ambos ]
2. Objetivo         → [ Tráfego / Conversão / Geração de leads / Reconhecimento ]
3. Oferta           → [produto, serviço ou promoção a anunciar]
4. Orçamento diário → [R$ XX/dia — ou "a definir"]
5. Público-alvo     → [extraído do client.md — confirmar ou ajustar]
6. Destino do anúncio → [URL de destino — página de produto, home, WhatsApp, etc.]
```

---

## Protocolo de Execução

### Parte 1 — Google Ads (se selecionado)

#### 1.1 — Estrutura de campanha

```
Campanha: [nome]
Tipo: [Pesquisa / Display / Shopping / Performance Max]
Objetivo: [conversão / tráfego / leads]
Orçamento diário: R$ [valor]

Grupos de anúncio:
  Grupo 1: [tema/intenção — ex: "joia presente"]
    Palavras-chave:
      - [kw 1] [correspondência: exata/frase/ampla modificada]
      - [kw 2]
      - [kw 3]
    Negativações:
      - [kw negativa 1]
      - [kw negativa 2]

  Grupo 2: [tema/intenção]
    Palavras-chave: [...]
```

#### 1.2 — Anúncios responsivos de pesquisa (RSA)

Para cada grupo, gere:

```
ANÚNCIO RESPONSIVO — [Grupo]

Títulos (máx. 30 caracteres cada — criar 10 a 15):
  1. [título]
  2. [título]
  ...

Descrições (máx. 90 caracteres cada — criar 4):
  1. [descrição com benefício + CTA]
  2. [descrição com prova social ou urgência]
  3. [descrição com diferencial]
  4. [descrição com oferta]

URL final: [url]
URL de display: [dominio.com.br/categoria]
```

#### 1.3 — Extensões de anúncio

```
Sitelinks (máx. 4):
  - [Texto] → [URL]

Callouts (diferenciais em até 25 caracteres):
  - [ex: "Frete grátis acima de R$ 200"]

Snippets estruturados:
  Cabeçalho: [Tipos / Categorias / Serviços]
  Valores: [item 1] · [item 2] · [item 3]
```

---

### Parte 2 — Meta Ads (se selecionado)

#### 2.1 — Estrutura de campanha

```
Campanha: [nome]
Objetivo: [Tráfego / Vendas / Geração de leads / Alcance]
Orçamento: R$ [valor]/dia (nível campanha ou conjunto)
Estratégia de lance: [Menor custo / Meta de custo / ROAS mínimo]

Conjunto de anúncios:
  Conjunto 1: [nome — ex: "Interesse joia + mulher 25-45"]
    Público:
      Localização: [cidade / estado / país]
      Idade: [faixa]
      Gênero: [todos / fem / masc]
      Interesses: [lista]
      Comportamentos: [lista — se relevante]
      Lookalike: [% — se base disponível]
    Posicionamentos: [Automático / Feed / Stories / Reels]
    Período: [data início → data fim ou sempre ativo]
```

#### 2.2 — Criativos

Para cada conjunto, gere 3 variações de copy:

```
VARIAÇÃO A — Racional (benefício claro)
Texto principal:
[copy — até 125 caracteres para não ser cortado no feed]

Título: [até 40 caracteres]
Descrição do link: [até 30 caracteres]
CTA: [Comprar agora / Saiba mais / Enviar mensagem / Cadastrar]

---

VARIAÇÃO B — Emocional (conexão / identidade)
Texto principal: [...]
Título: [...]
CTA: [...]

---

VARIAÇÃO C — Prova social / Urgência
Texto principal: [...]
Título: [...]
CTA: [...]
```

#### 2.3 — Especificações de imagem/vídeo

```
Feed (imagem): 1080×1080px ou 1080×1350px
Stories/Reels: 1080×1920px
Texto na imagem: menos de 20% da área
Formato de vídeo recomendado: MP4, mín. 1 seg, ideal 15-30 seg
```

---

### Parte 3 — CSV para importação (Google Ads)

Gere o CSV no formato de importação do Google Ads Editor:

```csv
Campaign,Ad Group,Headline 1,Headline 2,Headline 3,Description 1,Description 2,Final URL,Path 1,Path 2
[campanha],[grupo],[h1],[h2],[h3],[desc1],[desc2],[url],[path1],[path2]
```

Salve como `[YYYY-MM-DD]-google-ads-[campanha].csv`.

---

## Formato de Output

Salve em `clients/[slug]/outputs/anuncios/[YYYY-MM-DD]-campanha-[plataforma]-[oferta]/`:

```
/outputs/anuncios/
  2026-05-19-campanha-google-joias-verao/
    estrutura-campanha.md     ← Partes 1.1 e 2.1
    copy-anuncios.md          ← Partes 1.2, 1.3 e 2.2
    google-ads-import.csv     ← Parte 3
```

---

## Regras

1. Copy de anúncio deve respeitar os limites de caracteres das plataformas — nunca extrapole.
2. Sempre gere pelo menos 3 variações de copy — A/B/C para teste.
3. Negativações no Google são obrigatórias — anúncio sem negativas queima verba.
4. Se orçamento for abaixo de R$ 30/dia, sinalize que resultados podem ser limitados.
5. Nunca sugira segmentação por dados sensíveis (saúde, religião, orientação sexual).
6. O CSV deve ser funcional — testado contra o formato oficial do Google Ads Editor.
7. Conecte com `skill-image-generation.md` para gerar prompts dos criativos visuais.

---

## Exemplo de Ativação

```
/anuncio
Plataforma: Meta Ads
Objetivo: Conversão (vendas)
Oferta: Anel solitário em ouro 18k — R$ 890
Orçamento: R$ 50/dia
Destino: link do produto no site
```

---

*Skill v1.0 — MarketingOS*
*Inspirado no padrão /anuncio-google do Mazyos — expandido para Meta e com estrutura de CSV.*
