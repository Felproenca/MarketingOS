# Updater programado - zubair-trabzada/ai-marketing-claude

Fonte: https://github.com/zubair-trabzada/ai-marketing-claude
Ultimo scan: 2026-06-07T01:23:24.691Z
Commit analisado: e5aa0ea
Cadencia: Quinzenal, quarta-feira, focado em auditoria, proposta e relatorio.

## Papel no MarketingOS
Suite operacional com orquestrador /market, agentes paralelos, scripts Python e templates comerciais.

## Melhor uso
- website audit
- proposal
- landing CRO
- competitor scan
- PDF/Markdown report
- content calendar

## Alvos internos
- `skills/analise`
- `skills/aquisicao`
- `workflows`
- `templates`
- `scripts/demo-pipeline`

## Regra de adocao
Aproveitar arquitetura de orquestracao e formatos de entrega; recalibrar scoring para conversao e verdade humana.

## Checklist programado
- Puxar atualizacoes do repositorio e revisar CHANGELOG/README/root docs.
- Inventariar novas skills, referencias, scripts, agentes e templates.
- Classificar cada novidade como: aplicar agora, adaptar depois, observar, rejeitar.
- Verificar conflito com manifesto.md, alma.md e CLAUDE.md.
- Registrar aprendizado em `intelligence/skill-updates.md` antes de alterar skill existente.
- Se virar capacidade recorrente, criar ou atualizar skill em um unico grupo.
- Atualizar `workflows/commands.md` somente se nascer comando novo.

## Sinais para importar
- Aumenta conversao, clareza, aquisicao, retencao ou prova.
- Traz checklist operacional que reduz erro humano.
- Melhora intake, scoring, pesquisa, diagnostico ou output vendavel.
- Pode ser lido com pouco contexto e executado sem inflar a sessao.

## Sinais para rejeitar
- Template generico sem verdade humana.
- Promessa sem dados, benchmark ou criterio verificavel.
- Complexidade de agente que nao muda resultado.
- Linguagem de agencia, pacote de posts ou tecnologia antes do desejo.

## Inventario do ultimo scan
- Arquivos: 37
- Skills: 15
- Referencias/templates/assets: 6
- Scripts/tools: 4
- Agents: 5
- Docs raiz: 1

## Root docs
- README.md

## Skills detectadas
| Skill | Leitura util |
|---|---|
| `market/SKILL.md` | AI Marketing Suite — Main Orchestrator - You are a comprehensive AI marketing analysis and content generation system for Claude Code. You help entrepreneurs, agency builders, and solopreneurs analyze websites, generate marketing content, audit funnels, create client proposals, and build marketing strategies — all from the command line. |
| `skills/market-ads/SKILL.md` | Ad Creative & Copy Generation - You are the advertising engine for `/market ads <url>`. You generate complete ad campaigns across platforms with full copy variations, audience targeting strategies, budget recommendations, and creative specifications. Every ad is ready for production or handoff to a media buyer. |
| `skills/market-audit/SKILL.md` | Marketing Audit Orchestrator - You are the full marketing audit engine for `/market audit <url>`. You launch 5 parallel subagents, aggregate their results, and produce a unified MARKETING-AUDIT.md report that is client-ready and revenue-focused. |
| `skills/market-brand/SKILL.md` | Brand Voice Analysis and Guidelines Generation - Analyze a brand's voice, tone, and messaging across all available channels and generate a comprehensive brand voice guidelines document. This skill examines how a brand communicates, identifies patterns and inconsistencies, and produces actionable guidelines that any writer or marketer can follow to |
| `skills/market-competitors/SKILL.md` | Competitive Intelligence Analysis - You are the competitive intelligence engine for `/market competitors <url>`. You identify competitors, analyze their marketing strategies, and produce a comprehensive comparison report that reveals positioning gaps, steal-worthy tactics, and differentiation opportunities. Output is structured for bo |
| `skills/market-copy/SKILL.md` | Copywriting Analysis & Generation - You are the copywriting engine for `/market copy <url>`. You analyze existing website copy, score it, and generate optimized alternatives with specific before/after examples. Every recommendation is grounded in proven copywriting frameworks and tailored to the detected business type. |
| `skills/market-emails/SKILL.md` | Email Sequence Generation - You are the email marketing engine for `/market emails <topic/url>`. You generate complete, ready-to-send email sequences with subject lines, body copy, timing, and segmentation strategies. Every sequence is built on proven email frameworks and calibrated to industry benchmarks. |
| `skills/market-funnel/SKILL.md` | Sales Funnel Analysis & Optimization - You are the funnel analysis engine for `/market funnel <url>`. You map the complete conversion path from first visit to purchase, identify drop-off points, quantify friction, and recommend specific optimizations with revenue impact estimates. Every recommendation is prioritized by estimated lift and |
| `skills/market-landing/SKILL.md` | Landing Page CRO Analysis - Perform a comprehensive Conversion Rate Optimization (CRO) analysis on any landing page. This skill produces a section-by-section teardown with prioritized, actionable fixes that directly impact conversion rates. |
| `skills/market-launch/SKILL.md` | Product/Service Launch Playbook Generator - Generate a complete, week-by-week launch playbook for any product, service, or feature launch. This skill produces a tactical plan with templates, checklists, email sequences, social posts, and metrics tracking -- everything needed to execute a successful launch. |
| `skills/market-proposal/SKILL.md` | Client Proposal Generator for Marketing Services - Generate a professional, client-ready marketing services proposal. This skill produces a complete proposal document that positions the agency/consultant as the clear choice, frames pricing with anchoring and tiered options, and includes ROI projections to justify the investment. |
| `skills/market-report-pdf/SKILL.md` | PDF Marketing Report Generator - Generate a professional, visually polished PDF marketing report using the Python script `scripts/generate_pdf_report.py`. This skill collects all available audit and analysis data, structures it into the expected JSON format, invokes the script, and produces a branded PDF with score gauges, bar char |
| `skills/market-report/SKILL.md` | Marketing Report Generator (Markdown Format) - Generate a comprehensive, professionally formatted marketing report in Markdown. This skill compiles data from all previous audit and analysis results into a single, client-ready document with scores, findings, recommendations, and a prioritized action plan with revenue impact estimates. |
| `skills/market-seo/SKILL.md` | SEO Content Audit - Perform a comprehensive SEO audit of a webpage or website, covering on-page SEO, content quality (E-E-A-T), keyword analysis, technical SEO, and content strategy. This skill combines automated analysis via `scripts/analyze_page.py` with expert-level manual review to produce an actionable SEO audit d |
| `skills/market-social/SKILL.md` | Social Media Content Calendar & Generation - You are the social media engine for `/market social <topic/url>`. You generate a complete 30-day content calendar with platform-specific posts, hooks, hashtags, and a content repurposing strategy. Every post is ready to publish or hand to a social media manager. |

## Scripts e tools relevantes
- scripts/analyze_page.py
- scripts/competitor_scanner.py
- scripts/generate_pdf_report.py
- scripts/social_calendar.py

## Referencias/templates/assets relevantes
- templates/content-calendar.md
- templates/email-launch.md
- templates/email-nurture.md
- templates/email-welcome.md
- templates/launch-checklist.md
- templates/proposal-template.md
