# Scraper Panel

Painel local para operar o Scraper Inteligente v3 sem trocar o fluxo existente.

```bash
npm run scraper:panel
```

URL padrao:

```text
http://localhost:5173
```

## O que ele controla

- Gera lote via `scripts/scraper/index.js`
- Le `agency/leads/pending-approval.json`
- Le `agency/leads/pipeline.json` via `scripts/pipeline/store.js`
- Permite editar/remover mensagens pendentes antes do envio
- Simula envio aprovado
- Envia lote aprovado somente com confirmacao `ENVIAR`
- Mostra plano de follow-up e envia follow-ups somente com confirmacao `ENVIAR`
- Configura janela personalizada de envio para casos esporadicos
- Configura outputs planejados e direcao de copy para novas mensagens geradas

## O que ele nao muda

- Nao remove o gate de aprovacao
- Nao altera dedupe
- Nao altera teto diario
- Nao altera a janela comercial padrao; a excecao fica salva no painel e precisa estar ativa
- Nao altera os comandos CLI existentes
