# Relatório de Varredura — MarketingOS

Resumo rápido

- **Estado geral:** Estrutura bem definida com `CLAUDE.md` como fonte única de verdade e pipelines para carrosséis, scraping e envio de e-mail. Integrações possíveis com Supabase e deploys via Netlify/Vercel.

Achados principais

- **Fonte central:** CLAUDE.md — regras operacionais e hierarquia de skills. Veja [CLAUDE.md](CLAUDE.md#L1).
- **Agentes / apontamentos:** AGENTS.md referencia `CLAUDE.md`. Veja [AGENTS.md](AGENTS.md#L1).
- **Carrossel (pipeline completo):** Scripts para gerar + renderizar carrossel:
  - `scripts/generate-carousel.js` — cria job de carrossel e `render.js` em `clients/[slug]/outputs/carousels/[job]`.
  - `scripts/render-carousel.js` e `agency/outputs/carousels/render.js` usam Playwright para gerar PNGs. (Playwright em `devDependencies` em `package.json`).
  - Paths: [scripts/generate-carousel.js](scripts/generate-carousel.js#L1), [scripts/render-carousel.js](scripts/render-carousel.js#L1), [agency/outputs/carousels/render.js](agency/outputs/carousels/render.js#L1).
- **Automação / scraping:** `scripts/sherlock` contém integração com YouTube usando Playwright. Veja [scripts/sherlock/platforms/youtube.js](scripts/sherlock/platforms/youtube.js#L1).
- **Email / outreach:** `scripts/prospector/outreach-email.js` usa `nodemailer` para envio SMTP. Veja [scripts/prospector/outreach-email.js](scripts/prospector/outreach-email.js#L1).
- **Supabase:** Referências em `.env.example` para `NEXT_PUBLIC_SUPABASE_URL` e keys — integração opcional. Veja [.env.example](.env.example#L1).
- **Deploy:** `vercel.json` e `.netlify/netlify.toml` indicam deploys para Vercel e Netlify.
- **Skills & templates:** Pasta `skills/` com várias skills (criação, aquisição, relacionamento). Veja [skills/](skills/).

Itens mencionados no screenshot mas não encontrados como código/arquivo

- **`caveman`** (compressão de tokens / modo rápido) — não há implementação com esse nome em arquivos; pode ser design conceitual ou implementada como middleware em `intelligence/` (procure por otimizações de prompt). Arquivo relacionado: [intelligence/skill-updates.md](intelligence/skill-updates.md#L1) menciona "tokens".
- **`overclock` / `overclock.sh`** — não há arquivo com esse nome no repo; a pipeline de carrossel e scripts já existente cobre parte do caso de uso de gerar PNGs.
- **`sydra`** (transcrição YouTube) — não encontrado; há integração com YouTube scraping, mas não um serviço de transcrição dedicado.
- **`emailhacker.ai`** — não encontrado; há `nodemailer` para envio de e-mails, mas sem integração externa com esse domínio.

Recomendações rápidas

- **Registrar features faltantes:** adicionar `README` ou `INTENTIONS.md` indicando quais habilidades do screenshot são implementadas e quais são futuras (caveman, overclock, sydra, emailhacker).
- **Centralizar secrets:** confirmar uso de `~/.secrets` ou `env` e documentar em `README.md` (não commitar credenciais).
- **Implementar "caveman" como middleware:** se objetivo é reduzir tokens, criar `intelligence/caveman.js` que aplique compressão de prompt antes de enviar para Claude/Anthropic.
- **Adicionar CI/CD:** considerar workflows em `.github/workflows/` para build/test/deploy automático.

Próximo passo

- Posso criar issues, adicionar um `analysis/README.md` com tarefas prioritárias, ou implementar o arquivo `intelligence/caveman.js` (protótipo). O que prefere que eu faça agora?
