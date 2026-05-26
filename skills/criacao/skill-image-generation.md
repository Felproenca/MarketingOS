# skill-image-generation.md — Geração de Imagens
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: `client.md` + `brand-kit.json` do cliente.
> Gerador: Pollinations AI — gratuito, sem API key, sem cadastro.

---

## Objetivo da Skill

Gerar prompts de imagem precisos e alinhados à identidade visual do cliente, prontos para executar via Pollinations AI, cobrindo:
- Post de feed (quadrado e retrato)
- Slides de carrossel (um prompt por slide)
- Stories
- Anúncios Meta Ads
- Assets de referência para briefing visual

---

## Como o Pollinations funciona

```
URL base:
https://image.pollinations.ai/prompt/[PROMPT_CODIFICADO]

Parâmetros opcionais:
?width=1080&height=1080&model=flux&seed=42&nologo=true

Exemplo completo:
https://image.pollinations.ai/prompt/elegant%20gold%20jewelry...
?width=1080&height=1080&model=flux&nologo=true
```

O Cursor pode gerar a URL e abrir no browser, ou usar um script Node.js para baixar e salvar o arquivo automaticamente em `/assets/generated/images/`.

---

## Input Esperado

```
1. client.md          → tom, persona, posicionamento
2. brand-kit.json     → paleta, estilo visual, restrições
3. Formato            → [ Feed / Carrossel / Stories / Ads ]
4. Objetivo da imagem → [ Produto / Lifestyle / Emocional / Educativo / Institucional ]
5. Contexto           → [ para qual post ou campanha essa imagem serve ]
6. Referência visual  → [ se o cliente forneceu algo ]
```

Se `brand-kit.json` não estiver preenchido, sinalize e aguarde antes de continuar.

---

## Lógica de Construção do Prompt

Antes de gerar qualquer prompt, monte internamente esta estrutura:

```
[SUJEITO PRINCIPAL]
+ [CONTEXTO / AMBIENTE]
+ [ESTILO VISUAL]
+ [ILUMINAÇÃO]
+ [PALETA DE CORES]
+ [MOOD / ATMOSFERA]
+ [QUALIDADE E TÉCNICA]
+ [NEGATIVE PROMPT]
```

Cada elemento vem de uma fonte:

| Elemento | Fonte |
|---|---|
| Sujeito principal | objetivo da imagem + contexto do post |
| Contexto / ambiente | `image_subjects` do brand-kit.json |
| Estilo visual | `visual_style.aesthetic` do brand-kit.json |
| Iluminação | `visual_style.lighting` do brand-kit.json |
| Paleta de cores | `palette` do brand-kit.json |
| Mood / atmosfera | `visual_style.mood` do brand-kit.json |
| Qualidade e técnica | sempre incluir: `professional photography, high resolution, 8k` |
| Negative prompt | `pollinations_defaults.negative_prompt` do brand-kit.json |

---

## Formato de Output

---

### GERAÇÃO DE IMAGENS — [Nome do Cliente]

**Formato:** [ ]
**Objetivo:** [ ]
**Contexto:** [ ]

---

#### PROMPT [N] — [Descrição curta]

```
Prompt completo (inglês):
[TEXTO DO PROMPT — em inglês, específico, sem ambiguidade]

Negative prompt:
[TEXTO — elementos a evitar]

Parâmetros Pollinations:
  Modelo:  flux
  Width:   [extraído do brand-kit.json conforme formato]
  Height:  [extraído do brand-kit.json conforme formato]
  Seed:    [número fixo para reproduzir resultado — ex: 42]

URL gerada:
https://image.pollinations.ai/prompt/[PROMPT_ENCODED]?width=[W]&height=[H]&model=flux&nologo=true&seed=[SEED]

Destino do arquivo:
/clients/[slug]/assets/generated/images/[formato]-[contexto]-[seed].jpg

Notas de uso:
→ [em qual slide, post ou campanha essa imagem entra]
→ [como deve ser combinada com texto ou elementos visuais]
```

---

## Formatos e Dimensões

| Formato | Width | Height | Ratio | Quando usar |
|---|---|---|---|---|
| Feed quadrado | 1080 | 1080 | 1:1 | Posts de feed padrão |
| Feed retrato | 1080 | 1350 | 4:5 | Maior área no feed |
| Carrossel slide | 1080 | 1080 | 1:1 | Cada slide do carrossel |
| Stories | 1080 | 1920 | 9:16 | Stories e Reels cover |
| Meta Ads | 1200 | 628 | 1.91:1 | Anúncios em feed e links |

---

## Guia de Estilo por Objetivo

### Produto
```
Foco: o produto como protagonista
Ambiente: limpo, neutro ou complementar à marca
Iluminação: suave, sem sombras duras
Referência de prompt:
"[produto], studio photography, [cor de fundo da paleta],
soft natural lighting, minimalist composition,
professional product photography, high resolution"
```

### Lifestyle
```
Foco: pessoa usando ou experienciando o produto/serviço
Ambiente: alinhado ao estilo de vida da persona
Iluminação: natural, quente ou cinematográfica conforme mood
Referência de prompt:
"[persona description] [ação relacionada ao produto],
[ambiente], natural lighting, lifestyle photography,
candid moment, [mood da marca], high resolution"
```

### Emocional
```
Foco: sentimento, não produto
Ambiente: simbólico, evocativo
Iluminação: dramática ou suave conforme a emoção
Referência de prompt:
"[metáfora visual da emoção], [ambiente simbólico],
[iluminação dramática ou etérea], cinematic,
emotional depth, [paleta de cores da marca]"
```

### Educativo
```
Foco: clareza e informação visual
Ambiente: limpo, organizado
Iluminação: uniforme, sem distração
Referência de prompt:
"[elemento visual que representa o conceito],
clean background, flat lay or isometric,
[cor primária da marca], informative composition,
professional illustration style"
```

### Institucional
```
Foco: autoridade e confiança
Ambiente: profissional, alinhado ao setor
Iluminação: natural corporativa
Referência de prompt:
"[ambiente profissional do setor], corporate photography,
[paleta neutra + cor da marca], trustworthy,
professional, high-end, clean composition"
```

---

## Script Node.js — Download Automático

> Cole em `/scripts/generate-image.js` para baixar imagens diretamente no projeto.

```javascript
// generate-image.js — MarketingOS
// Uso: node scripts/generate-image.js "[prompt]" [width] [height] [slug] [filename]

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const [,, prompt, width = '1080', height = '1080', slug = 'client', filename = 'image'] = process.argv;

if (!prompt) {
  console.error('Uso: node scripts/generate-image.js "[prompt]" [width] [height] [slug] [filename]');
  process.exit(1);
}

const encoded  = encodeURIComponent(prompt);
const seed     = Math.floor(Math.random() * 9999);
const url      = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&nologo=true&seed=${seed}`;
const outputDir = path.resolve(__dirname, '..', 'clients', slug, 'assets', 'generated', 'images');
const outputPath = path.join(outputDir, `${filename}-${seed}.jpg`);

fs.mkdirSync(outputDir, { recursive: true });

console.log(`\n  Gerando imagem...`);
console.log(`  Prompt: ${prompt}`);
console.log(`  Dimensões: ${width}x${height}`);
console.log(`  Seed: ${seed}\n`);

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`  Erro: status ${res.statusCode}`);
    process.exit(1);
  }
  const file = fs.createWriteStream(outputPath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log(`  ✓ Imagem salva em:`);
    console.log(`    ${outputPath}\n`);
  });
}).on('error', (err) => {
  console.error(`  Erro na requisição: ${err.message}`);
  process.exit(1);
});
```

**Uso:**
```bash
node scripts/generate-image.js \
  "elegant gold jewelry on marble surface, soft lighting, premium" \
  1080 1080 shana-joias hero-post
```

---

## Organização dos Assets

```
/clients/[slug]/assets/
  /generated
    /images
      feed-[contexto]-[seed].jpg
      carousel-slide1-[seed].jpg
      carousel-slide2-[seed].jpg
      stories-[contexto]-[seed].jpg
      ads-[campanha]-[seed].jpg
  /reference
    → imagens de referência fornecidas pelo cliente
  /approved
    → imagens aprovadas e prontas para publicação
```

---

## Regras de Qualidade

1. **Prompt sempre em inglês** — Pollinations performa melhor em inglês
2. **Seed fixo por sessão** — usar o mesmo seed gera variações consistentes do mesmo estilo
3. **Negative prompt sempre presente** — evita texto, watermark e distorções
4. **Nunca gerar imagem sem brand-kit.json preenchido** — imagem fora da identidade visual prejudica o cliente
5. **Uma imagem por objetivo** — não tentar resolver dois contextos no mesmo prompt
6. **Salvar sempre com nome descritivo** — `carousel-slide3-gancho-4521.jpg` e não `image1.jpg`
7. **Mover para `/approved` apenas após validação do cliente**

---

## Checklist antes de entregar

- [ ] `brand-kit.json` foi lido antes de construir qualquer prompt?
- [ ] O prompt inclui todos os 7 elementos da estrutura?
- [ ] O negative prompt está presente?
- [ ] As dimensões estão corretas para o formato solicitado?
- [ ] A URL foi gerada e testada?
- [ ] O destino do arquivo está definido corretamente?
- [ ] As notas de uso indicam onde cada imagem entra?

---

## Exemplo de Ativação no Cursor

```
Use a skill-image-generation.md.

Cliente: [slug]
Formato: [Feed / Carrossel / Stories / Ads]
Objetivo: [Produto / Lifestyle / Emocional / Educativo / Institucional]
Contexto: [para qual post ou campanha]
Quantidade: [número de imagens]
```

---

*Skill v1.0 — MarketingOS*
*Gerador: Pollinations AI (flux model) — gratuito, sem autenticação*
*Migração futura: Stability AI ou Replicate para volume alto*
