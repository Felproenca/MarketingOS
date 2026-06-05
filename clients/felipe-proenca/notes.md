# notes.md — Felipe Proença

## 2026-06-04 — Prompt master para editor de Reels IA

**O que foi feito:**
- Prompt master criado para um editor de video por IA operando no Codex.
- Arquivo salvo em `outputs/criacao/prompt-video-editor-felipe.md`.
- O prompt consolida identidade, inteligencia, alma, brand-kit, ICP, linguagem verbal, linguagem visual e doutrina de edicao para Reels do Felipe / MarketingOS.

**Decisoes tomadas:**
- O editor deve tratar cada Reel como prova publica do MarketingOS, nao como conteudo generico.
- Direcao principal: build in public, processo real, clareza estrategica e prova antes de promessa.
- Edicao deve evitar estetica de agencia, hype, template viral, emojis como linguagem principal e qualquer promessa sem prova.
- O output do editor deve incluir tese, hook, cortes principais, legendas, destaques visuais, CTA e riscos de desalinhamento.

**Proximos passos:**
- Testar o prompt com um video bruto real do Felipe.
- Se funcionar, transformar a estrutura em template reutilizavel para outros clientes.

---

## 2026-06-04 — Integração social-content-agents: descartada

**O que foi feito:**
- Diagnóstico da integração HTTP: servidor em background instável no Windows (uvicorn reloader recria processos, impossível de gerenciar via Node).
- Substituição por subprocess CLI direto funcionou parcialmente: copy gerada com qualidade, pipeline visual entregou HTML/PNG com layout inutilizável.
- Encoding de `estrategia.md` corrigido (UTF-8).
- Revertido para estado original do commit `a1383b6`.

**O que não funciona — registrado:**
- Pipeline visual do motor produz HTML sem hierarquia tipográfica adequada.
- Custo real: ~$2 + 1h sem output publicável.

**O que ficou de valor:**
- CopyAgent gera hooks e ângulos fortes — vale uso isolado para copy no futuro.
- Fluxo nativo do MarketingOS (carousel → Playwright → PNG) continua sendo o caminho correto para visual.

**Próximos passos:**
- Retomar fluxo nativo: /criar carousel → HTML → PNG.
- Renovar token Meta/Instagram para rodar `npm run insights`.

---

## 2026-06-03 — Conteúdo IA aplicada + teste de interligação social-content-agents

**O que foi feito:**
- Conteúdo de autoridade criado sobre IA aplicada como sistema de aquisição.
- Brief enviado ao `social-content-agents` via `npm run criar-conteudo`.
- Job aceito pelo motor com content ID `felipe-proenca-curiosidade-sobre-ia-20260603-032133`, mas ficou preso em `gerando`.
- Carrossel criado localmente em HTML e renderizado em 6 PNGs 1080×1080.
- Copy, legenda, stories e direção visual salvos em `outputs/posts/2026-06-03/conteudo-ia-aplicada-autoridade.md`.
- Correção de português e acentuação aplicada nos slides e no markdown.

**Decisões tomadas:**
- Tese central da peça: "IA não é vantagem competitiva. Direção é."
- Ângulo: IA não salva estratégia ruim; ela acelera o improviso quando não existe sistema.
- Formato escolhido: carrossel 6 slides, identidade Marketing/OS v2, sem emojis, com terminal block no slide de sistema.

**Problemas encontrados:**
- `social-content-agents` expunha rota `/api/brief` apenas na cópia aninhada do projeto; o servidor inicial estava servindo API antiga.
- Processo interno do motor ficou preso em `gerando`, possivelmente no subprocesso do Claude CLI.
- `npm run insights -- --slug felipe-proenca --min-age-hours 48` falhou porque o token Meta expirou.

**Próximos passos:**
- Revisar visualmente todos os 6 PNGs finais.
- Publicar carrossel após aprovação.
- Renovar token Meta/Instagram para rodar insights.

---

## 2026-06-05 — Pitch Bruno Capelli + deploy Netlify

**O que foi feito:**
- Pitch deck completo criado para o Salão Bruno Capelli usando `templates/pitch-deck-template.html`
- 2 carrosséis navegáveis embutidos no pitch (tabs: Cor & Colorimetria + Mechas & Balayage)
- Site preview com botão "Abrir site →" linkando para `site-preview.html`
- Carrosséis standalone (`carousel-1-cor.html` e `carousel-2-balayage.html`) atualizados com navegação prev/next + dots
- Site corrigido: `body { width: 100% }` — sem gap branco à direita do viewport
- Link do catálogo WhatsApp (`wa.me/catalog/5521979852192`) adicionado em todos os CTAs do site e pitch
- Deploy no Netlify: `https://pontos-cardeais-preview.netlify.app`

**Decisões tomadas:**
- Carrossel individual em HTML = navegável sempre, PNG só após aprovação (regra salva em memória)
- Pitch usa template único — sem criar arquivos soltos fora do padrão
- Catálogo WhatsApp do Bruno Capelli como destino de conversão (não WhatsApp pessoal)

**Aprendizado de comportamento:**
- Todo `carousel-*.html` precisa de barra de navegação abaixo do frame 540x540 — salvo em memória permanente

**Próximos passos:**
- Renovar sessão WhatsApp (rodar `node scripts/prospector/send-prospects.js` e escanear QR)
- Enviar Etapa 2 para Bruno Capelli: (21) 99763-3682
- Acompanhar respostas dos petshops (Dom Peludo, Pet Hero, Petshop Mania, Toca da Raposa)
- Se Bruno Capelli responder: enviar link do pitch `pontos-cardeais-preview.netlify.app/pitch-bruno-capelli.html`

---

## 2026-06-05 — Diagnóstico de aquisição + nova abordagem de prospecção

**Contexto:**
- 25 posts publicados, nenhum gerou DM de potencial cliente
- Prospecção anterior (3 PNGs no primeiro contato) não converteu
- WhatsApp não está gerando retorno
- Decisão: múltiplos funis em paralelo

**Mudanças implementadas:**
- skill-prospector.md atualizada com protocolo de 3 etapas obrigatórias
- Primeiro contato: 1 mensagem, sem PNG, sem pitch, termina com pergunta
- Diagnóstico completo só na Etapa 3, após resposta do lead

**Nicho priorizado:** Pet Shops (clínicas de estética não converteu antes)
**Regiões:** Rio de Janeiro + São Paulo (capitais)

**Rodada de prospecção executada:**
- 4 quentes identificados: Dom Peludo (SP), Pet Hero (SP), Petshop Mania (RJ), Toca da Raposa (RJ)
- Dom Peludo e Pet Hero com WhatsApp confirmado — prontos para envio imediato
- Arquivo: `outputs/prospects/petshops-rj-sp-2026-06-05.md`

**Padrão dos quentes:**
→ 1.000–2.500 seguidores, WhatsApp na bio sem automação, serviços variados sem funil

**Próximos passos:**
- Enviar mensagens de Etapa 2 para Dom Peludo e Pet Hero hoje
- Verificar WhatsApp de Petshop Mania e Toca da Raposa antes de enviar
- Registrar respostas no arquivo de prospects
- Se 2+ responderem com mesmo padrão → intelligence/patterns.md

---

## 2026-05-29 — Virada estratégica: build in public

**O que aconteceu:**
- Carrossel 13 criado ("Esse feed foi construído por um sistema")
- Felipe questionou: "estamos vendendo algo que não existe?"
- Resposta: não — o sistema existe e está funcionando. Mas o posicionamento estava errado.
- Virada: parar de vender resultado, começar a mostrar processo em tempo real.

**Decisão registrada:**
- Ângulo novo para toda a Grade 2: build in public como posicionamento, não como humildade.
- Honesto. Único. Constrói credibilidade sem precisar de prova que ainda não existe.

---
