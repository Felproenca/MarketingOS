# MarketingOS

Sistema operacional de marketing orientado por IA para operacao multi-cliente.

## Requisitos
- Node.js 18+
- Git

## Instalacao
```bash
git clone https://github.com/Felproenca/MarketingOS.git
cd MarketingOS
npm install
```

## Fluxo Basico
1. Criar cliente:
```bash
npm run cmd -- /novo meu-cliente
```

2. Definir cliente ativo:
```bash
npm run cmd -- /cliente meu-cliente
```

3. Verificar estado:
```bash
npm run cmd -- /status
```

4. Gerar carrossel (pipeline):
```bash
npm run cmd -- /carrossel --tema "Tema da campanha" --objetivo Autoridade --slides 7 --cta "Comente CARROSSEL" --ia true
```

5. Renderizar imagens do carrossel:
```bash
node clients/meu-cliente/outputs/carousels/[job]/render.js
```

6. Para criar site com qualidade consistente:
```bash
npm run cmd -- /branding
npm run cmd -- /site
```

## Estrutura do Projeto
```txt
/clients
/skills
/workflows
/scripts
/intelligence
```

## Regras Operacionais
- Nunca gerar output fora de `clients/[slug]/outputs/`
- Nunca misturar contexto entre clientes
- Sempre ler `client.md` antes de executar skill ou workflow
