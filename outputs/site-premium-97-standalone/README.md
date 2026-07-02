# Site Premium por R$97

Versão independente da landing page publicada em:

`https://mkos.online/site-premium`

## Estrutura

```text
site-premium-97-standalone/
├── index.html
└── README.md
```

Toda a aplicação está dentro de `index.html`:

- HTML: conteúdo e estrutura das seções;
- CSS: identidade, responsividade, composições e estados;
- JavaScript: interações, animações, formulário e cenas;
- Three.js: elementos tridimensionais e canvas;
- Google Fonts: tipografia.

Não existe etapa de build, framework ou pacote `node_modules`.

## Executar

### Abrir diretamente

Abra `index.html` no navegador.

### Servidor local recomendado

```bash
npx serve .
```

Ou:

```bash
python -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

## Dependências externas

O HTML carrega:

```html
https://fonts.googleapis.com
https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js
```

É necessária conexão com a internet para carregar as fontes e o Three.js. Para
uma versão completamente offline, baixe essas dependências e troque os links
por caminhos locais.

## Mapa do arquivo

Pesquise estes seletores e identificadores dentro de `index.html`:

- `#top`: início e hero;
- `#entrega`: proposta e escopo;
- `#modelos`: portfólio em movimento;
- `#processo`: sistema de produção;
- `#briefing`: formulário de entrada;
- `.site-stage`: modelos visuais;
- `.pipeline`: animação do processo;
- `initThree`: inicialização das cenas Three.js;
- `IntersectionObserver`: animações acionadas pela rolagem;
- `prefers-reduced-motion`: comportamento acessível sem movimento intenso.

## Como alterar o conteúdo

Os textos estão diretamente no HTML. Pesquise a frase desejada e edite sem
alterar as classes ao redor.

Exemplo:

```html
<span class="hero-word">Um site</span>
```

As cores principais estão nas variáveis de `:root`, no início do CSS.

## Como alterar as animações

As animações estão divididas em três grupos:

1. CSS: transições, entradas, brilho e movimentos contínuos;
2. JavaScript: mudança de estados e animações ligadas à rolagem;
3. Three.js: geometrias, câmera, iluminação e renderização WebGL.

Antes de remover uma seção, confira se o JavaScript procura seus elementos com
`querySelector`. Elementos opcionais devem continuar protegidos por verificações
antes de receber eventos.

## Formulário

O formulário demonstra o fluxo do briefing na interface. Antes de usar em
produção em outro domínio, revise no JavaScript:

- destino dos dados;
- validação;
- mensagem de sucesso;
- integração com WhatsApp, e-mail ou API;
- política de privacidade.

## Publicar

O projeto pode ser hospedado diretamente em:

- Vercel;
- Netlify;
- GitHub Pages;
- Cloudflare Pages;
- qualquer servidor de arquivos estáticos.

Na Vercel, importe o repositório e mantenha:

- Framework Preset: `Other`;
- Build Command: vazio;
- Output Directory: `.`;

## Objetivo do pacote

Este pacote preserva a landing como obra isolada para estudo de:

- direção de arte;
- arquitetura de uma página única;
- narrativa de conversão;
- animação orientada por scroll;
- Three.js aplicado a landing pages;
- responsividade sem framework.
