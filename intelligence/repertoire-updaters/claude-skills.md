# Updater programado - alirezarezvani/claude-skills

Fonte: https://github.com/alirezarezvani/claude-skills
Ultimo scan: 2026-06-06T02:38:22.320Z
Commit analisado: fcd4fa1
Cadencia: Mensal, primeira sexta-feira, com triagem por impacto estrategico.

## Papel no MarketingOS
Ecossistema amplo de skills, agentes, padroes de autoria, C-level, business growth e operacoes.

## Melhor uso
- skill authoring
- multi-agent governance
- C-level review
- RevOps
- customer success
- business operations

## Alvos internos
- `CLAUDE.md`
- `workflows`
- `skills/relacionamento`
- `skills/venda`
- `skills/aquisicao`
- `docs`

## Regra de adocao
Extrair governanca, padroes e perguntas de decisao; evitar importar complexidade que nao gere resultado direto.

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
- Arquivos: 4461
- Skills: 757
- Referencias/templates/assets: 954
- Scripts/tools: 576
- Agents: 190
- Docs raiz: 12

## Root docs
- CHANGELOG.md
- CLAUDE.md
- CODE_OF_CONDUCT.md
- CONTRIBUTING.md
- CONVENTIONS.md
- GEMINI.md
- INSTALLATION.md
- README.md
- SECURITY.md
- SKILL-AUTHORING-STANDARD.md
- SKILL_PIPELINE.md
- STORE.md

## Skills detectadas
| Skill | Leitura util |
|---|---|
| `.gemini/skills/a11y-audit/SKILL.md` | Accessibility Audit - "Accessibility audit skill for scanning, fixing, and verifying WCAG 2.2 Level A and AA compliance across React, Next.js, Vue, Angular, Svelte, and plain HTML codebases. Use when auditing accessibility, fixing a11y violations, checking color contrast, generating compliance reports, or integrating acc |
| `.gemini/skills/ab-test-setup/SKILL.md` | A/B Test Setup - When the user wants to plan, design, or implement an A/B test or experiment. Also use when the user mentions "A/B test," "split test," "experiment," "test this change," "variant copy," "multivariate test," "hypothesis," "conversion experiment," "statistical significance," or "test this." For trackin |
| `.gemini/skills/ad-creative/SKILL.md` | Ad Creative - "When the user needs to generate, iterate, or scale ad creative for paid advertising. Use when they say 'write ad copy,' 'generate headlines,' 'create ad variations,' 'bulk creative,' 'iterate on ads,' 'ad copy validation,' 'RSA headlines,' 'Meta ad copy,' 'LinkedIn ad,' or 'creative testing.' This  |
| `.gemini/skills/adversarial-reviewer/SKILL.md` | Adversarial Code Reviewer - "Adversarial code review that breaks the self-review monoculture. Use when you want a genuinely critical review of recent changes, before merging a PR, or when you suspect Claude is being too agreeable about code quality. Forces perspective shifts through hostile reviewer personas that catch blind s |
| `.gemini/skills/aeo/SKILL.md` | Answer Engine Optimization (AEO) - "Answer Engine Optimization (AEO) skill — optimize content to be cited by AI language models (ChatGPT, Perplexity, Claude, Gemini, Mistral) as authoritative sources. Distinct from SEO — AEO optimizes for citation in LLM-generated responses, not search rankings. Use when planning content for AI-first |
| `.gemini/skills/agent-designer/SKILL.md` | Agent Designer - Multi-Agent System Architecture - "Use when the user asks to design multi-agent systems, create agent architectures, define agent communication patterns, or build autonomous agent workflows." |
| `.gemini/skills/agent-protocol/SKILL.md` | Inter-Agent Protocol - "Inter-agent communication protocol for C-suite agent teams. Defines invocation syntax, loop prevention, isolation rules, and response formats. Use when C-suite agents need to query each other, coordinate cross-functional analysis, or run board meetings with multiple agent roles." |
| `.gemini/skills/agent-workflow-designer/SKILL.md` | Agent Workflow Designer - "Design production-grade multi-agent workflows with clear pattern choice (sequential, parallel, hierarchical), handoff contracts, failure handling, and cost/context controls. Use when architecting a multi-step agent pipeline, choosing between single-agent vs multi-agent approaches, or refactoring an |
| `.gemini/skills/agenthub/SKILL.md` | AgentHub — Multi-Agent Collaboration - "Multi-agent collaboration plugin that spawns N parallel subagents competing on the same task via git worktree isolation. Agents work independently, results are evaluated by metric or LLM judge, and the best branch is merged. Use when: user wants multiple approaches tried in parallel — code optimiza |
| `.gemini/skills/agile-product-owner/SKILL.md` | Agile Product Owner - Agile product ownership for backlog management and sprint execution. Covers user story writing, acceptance criteria, sprint planning, and velocity tracking. Use for writing user stories, creating acceptance criteria, planning sprints, estimating story points, breaking down epics, or prioritizing bac |
| `.gemini/skills/ai-act-readiness/SKILL.md` | /cs:ai-act-readiness — EU AI Act Forcing Questions - "/cs:ai-act-readiness <system> — EU AI Act 6-question forcing interrogation. Use during AI-system intake, before EU deployment, or during annual compliance refresh as Article 113 obligations phase in (2025-02-02 / 2025-08-02 / 2026-08-02 / 2027-08-02)." |
| `.gemini/skills/ai-security/SKILL.md` | AI Security - "Use when assessing AI/ML systems for prompt injection, jailbreak vulnerabilities, model inversion risk, data poisoning exposure, or agent tool abuse. Covers MITRE ATLAS technique mapping, injection signature detection, and adversarial robustness scoring." |
| `.gemini/skills/ai-seo/SKILL.md` | AI SEO - "Optimize content to get cited by AI search engines — ChatGPT, Perplexity, Google AI Overviews, Claude, Gemini, Copilot. Use when you want your content to appear in AI-generated answers, not just ranked in blue links. Triggers: 'optimize for AI search', 'get cited by ChatGPT', 'AI Overviews', 'Perpl |
| `.gemini/skills/aims-audit/SKILL.md` | /cs:aims-audit — AIMS ISO 42001 Forcing Questions - "/cs:aims-audit <scope> — ISO/IEC 42001 AIMS internal-audit 6-question forcing interrogation. Use before certification stage 1, before annual internal audit cycles, or when onboarding a new AI system into an existing AIMS." |
| `.gemini/skills/analytics-tracking/SKILL.md` | Analytics Tracking - "Set up, audit, and debug analytics tracking implementation — GA4, Google Tag Manager, event taxonomy, conversion tracking, and data quality. Use when building a tracking plan from scratch, auditing existing analytics for gaps or errors, debugging missing events, or setting up GTM. Trigger keywords: |
| `.gemini/skills/andreessen/SKILL.md` | Andreessen — Market-First Decision & Productivity Mode - "Marc Andreessen-mode decision and productivity skill. A blunt, market-first operator that pressure-tests ideas, ventures, features, and career bets through Andreessen's actual frameworks — market dominates team and product; the only milestone that matters is product/market fit; bias to build over d |
| `.gemini/skills/api-design-reviewer/SKILL.md` | API Design Reviewer - "Comprehensive REST API design review with automated linting, breaking-change detection, and design scorecards. Catches inconsistent conventions, missing versioning, and design smells before APIs ship. Use when reviewing a PR that adds or changes API endpoints, auditing an existing API for v2 migrat |
| `.gemini/skills/api-test-suite-builder/SKILL.md` | API Test Suite Builder - "Use when the user asks to generate API tests, create integration test suites, test REST endpoints, or build contract tests." |
| `.gemini/skills/app-store-optimization/SKILL.md` | App Store Optimization (ASO) - App Store Optimization (ASO) toolkit for researching keywords, analyzing competitor rankings, generating metadata suggestions, and improving app visibility on Apple App Store and Google Play Store. Use when the user asks about ASO, app store rankings, app metadata, app titles and descriptions, app s |
| `.gemini/skills/apple-hig-expert/SKILL.md` | Apple HIG Expert - "Expert guidance on Apple Human Interface Guidelines (HIG). Covers iOS, macOS, and visionOS with 2026 Liquid Glass aesthetics and accessibility-first design." |
| `.gemini/skills/atlassian-admin/SKILL.md` | Atlassian Administrator Expert - Atlassian Administrator for managing and organizing Atlassian products (Jira, Confluence, Bitbucket, Trello), users, permissions, security, integrations, system configuration, and org-wide governance. Use when asked to add users to Jira, change Confluence permissions, configure access control, updat |
| `.gemini/skills/atlassian-templates/SKILL.md` | Atlassian Template & Files Creator Expert - Atlassian Template and Files Creator/Modifier expert for creating, modifying, and managing Jira and Confluence templates, blueprints, custom layouts, reusable components, and standardized content structures. Use when building org-wide templates, custom blueprints, page layouts, and automated content |
| `.gemini/skills/autoresearch-agent/SKILL.md` | Autoresearch Agent - "Autonomous experiment loop that optimizes any file by a measurable metric. Inspired by Karpathy's autoresearch. The agent edits a target file, runs a fixed evaluation, keeps improvements (git commit), discards failures (git reset), and loops indefinitely. Use when: user wants to optimize code speed |
| `.gemini/skills/aws-solution-architect/SKILL.md` | AWS Solution Architect - Design AWS architectures for startups using serverless patterns and IaC templates. Use when asked to design serverless architecture, create CloudFormation templates, optimize AWS costs, set up CI/CD pipelines, or migrate to AWS. Covers Lambda, API Gateway, DynamoDB, ECS, Aurora, and cost optimizatio |
| `.gemini/skills/azure-cloud-architect/SKILL.md` | Azure Cloud Architect - "Design Azure architectures for startups and enterprises. Use when asked to design Azure infrastructure, create Bicep/ARM templates, optimize Azure costs, set up Azure DevOps pipelines, or migrate to Azure. Covers AKS, App Service, Azure Functions, Cosmos DB, and cost optimization." |
| `.gemini/skills/behuman/SKILL.md` | BeHuman — Self-Mirror Consciousness Loop - "Use when the user wants more human-like AI responses — less robotic, less listy, more authentic. Triggers: 'behuman', 'be real', 'like a human', 'more human', 'less AI', 'talk like a person', 'mirror mode', 'stop being so AI', or when conversations are emotionally charged (grief, job loss, relation |
| `.gemini/skills/board-deck-builder/SKILL.md` | Board Deck Builder - "Assembles comprehensive board and investor update decks by pulling perspectives from all C-suite roles. Use when preparing board meetings, investor updates, quarterly business reviews, or fundraising narratives. Covers structure, narrative framework, bad news delivery, and common mistakes." |
| `.gemini/skills/board-meeting/SKILL.md` | Board Meeting Protocol - "Multi-agent board meeting protocol for strategic decisions. Runs a structured 6-phase deliberation: context loading, independent C-suite contributions (isolated, no cross-pollination), critic analysis, synthesis, founder review, and decision extraction. Use when the user invokes /cs:board, calls a  |
| `.gemini/skills/board-prep/SKILL.md` | /em:board-prep — Board Meeting Preparation - "Board meeting preparation for the adversarial scenario, not the friendly one. Forces numbers-cold mastery, anticipates hard questions, builds a narrative that acknowledges weakness without losing the room. Use when preparing for a board meeting, an investor update, fundraising presentation, or any  |
| `.gemini/skills/board/SKILL.md` | /hub:board — Message Board - "Read, write, and browse the AgentHub message board for agent coordination." |
| `.gemini/skills/boardroom/SKILL.md` | /cs:boardroom — Multi-Role Boardroom Deliberation - "/cs:boardroom <brief> — 6-phase multi-role deliberation across the C-suite with Phase 2 isolation, critic pre-screen, and synthesis. Outputs a board memo." |
| `.gemini/skills/brand-guidelines/SKILL.md` | Brand Guidelines - "When the user wants to apply, document, or enforce brand guidelines for any product or company. Also use when the user mentions 'brand guidelines,' 'brand colors,' 'typography,' 'logo usage,' 'brand voice,' 'visual identity,' 'tone of voice,' 'brand standards,' 'style guide,' 'brand consistency,' o |
| `.gemini/skills/brief/SKILL.md` | /cs:brief — One-Page Strategy Brief - "/cs:brief <topic> — Generate a one-page strategy brief from an office-hours intake. First step in the strategic sprint pipeline." |
| `.gemini/skills/browser-automation/SKILL.md` | Browser Automation - POWERFUL - "Use when the user asks to automate browser tasks, scrape websites, fill forms, capture screenshots, extract structured data from web pages, or build web automation workflows. NOT for testing — use playwright-pro for that." |
| `.gemini/skills/browserstack/SKILL.md` | BrowserStack Integration - >- |
| `.gemini/skills/business-growth-skills/SKILL.md` | Business & Growth Skills - "4 business growth agent skills and plugins for Claude Code, Codex, Gemini CLI, Cursor, OpenClaw. Customer success (health scoring, churn), sales engineer (RFP), revenue operations (pipeline, GTM), contract & proposal writer. Python tools (stdlib-only)." |
| `.gemini/skills/business-investment-advisor/SKILL.md` | Business Investment Advisor - "Business investment analysis and capital allocation advisor. Use when evaluating whether to invest in equipment, real estate, a new business, hiring, technology, or any capital expenditure. Also use for ROI calculations, IRR, NPV, payback period, build vs buy decisions, lease vs buy analysis, vendo |
| `.gemini/skills/business-operations-skills/SKILL.md` | Business Operations — Domain Orchestrator - Use when running, diagnosing, or designing internal business operations — process documentation, vendor SLAs, capacity planning, internal comms, SOP/runbook authoring, procurement spend. Triggers on "BizOps review", "where's the bottleneck", "vendor health", "internal SOP", "all-hands deck", "spend  |
| `.gemini/skills/c-level-agents/SKILL.md` | c-level-agents — Founder-Mode Executive Team - "Founder-mode executive team. 8 cs-* C-suite agents (CFO, CMO, CRO, CPO, COO, CHRO, CISO, Chief of Staff) and 17 /cs:* slash commands for forcing-question office hours, multi-role boardroom deliberation, strategic sprint pipeline, and meta routing. Use when the founder needs a virtual executive team |
| `.gemini/skills/c-level-skills/SKILL.md` | C-Level Advisory Ecosystem - "10 C-level advisory agent skills and plugins for Claude Code, Codex, Gemini CLI, Cursor, OpenClaw. CEO, CTO, COO, CPO, CMO, CFO, CRO, CISO, CHRO, Executive Mentor. Multi-role board meetings, strategy routing, structured recommendations. For founders needing executive-level decision support." |
| `.gemini/skills/caio-review/SKILL.md` | /cs:caio-review — CAIO Forcing Questions - "/cs:caio-review <plan> — Eval-demanding Chief AI Officer interrogation of any plan that involves AI: model selection, risk classification, cost economics, or AI hiring." |
| `.gemini/skills/campaign-analytics/SKILL.md` | Campaign Analytics - Analyzes campaign performance with multi-touch attribution, funnel conversion analysis, and ROI calculation for marketing optimization. Use when analyzing marketing campaigns, ad performance, attribution models, conversion rates, or calculating marketing ROI, ROAS, CPA, and campaign metrics across c |
| `.gemini/skills/capa-officer/SKILL.md` | CAPA Officer - CAPA system management for medical device QMS. Covers root cause analysis, corrective action planning, effectiveness verification, and CAPA metrics. Use for CAPA investigations, 5-Why analysis, fishbone diagrams, root cause determination, corrective action tracking, effectiveness verification, or CA |
| `.gemini/skills/capacity-planner/SKILL.md` | capacity-planner - "Use when an ops leader (Director of CX, Head of Support, VP Ops, Head of BizOps, Head of IT ops, Head of Finance ops) is sizing ops capacity, building a headcount plan, modeling utilization risk, planning Q3 capacity or annual support capacity, or designing CS coverage — and needs Erlang-C queueing |
| `.gemini/skills/capture/SKILL.md` | Capture — Brain-Dump Organizer - "Captures and organizes chaotic brain dumps into a structured, actionable system with zero information loss. Use this skill whenever the user says 'capture this', 'brain dump', 'let me dump some ideas', 'I've got a bunch of thoughts', 'here's everything on my mind', 'idea dump', 'let me get this out |
| `.gemini/skills/caveman/SKILL.md` | Caveman Mode - > |
| `.gemini/skills/cco-review/SKILL.md` | /cs:cco-review — CCO Forcing Questions - "/cs:cco-review <plan> — Retention-obsessed Chief Customer Officer interrogation of any plan that touches customer retention, segmentation, CS team sizing, or CS team hiring." |
| `.gemini/skills/cdo-review/SKILL.md` | /cs:cdo-review — CDO Forcing Questions - "/cs:cdo-review <plan> — Decision-driven Chief Data Officer interrogation of any plan that touches training data, data architecture, data productization, or data team hiring." |
| `.gemini/skills/ceo-advisor/SKILL.md` | CEO Advisor - "Executive leadership guidance for strategic decision-making, organizational development, and stakeholder management. Use when planning strategy, preparing board presentations, managing investors, developing organizational culture, making executive decisions, fundraising, or when user mentions CEO,  |
| `.gemini/skills/cfo-advisor/SKILL.md` | CFO Advisor - "Financial leadership for startups and scaling companies. Financial modeling, unit economics, fundraising strategy, cash management, and board financial packages. Use when building financial models, analyzing unit economics, planning fundraising, managing cash runway, preparing board materials, or w |
| `.gemini/skills/cfo-review/SKILL.md` | /cs:cfo-review — CFO Forcing Questions - "/cs:cfo-review <plan> — Numerate-skeptic interrogation of any plan that touches money. Unit economics, runway, dilution, capital allocation." |
| `.gemini/skills/challenge/SKILL.md` | /em:challenge — Pre-Mortem Plan Analysis - "Pre-mortem plan analysis. Imagine the plan failed 12 months from now and work backwards to find the weaknesses. Surfaces assumptions, dependencies, and execution risks before committing resources. Use when before significant resource commitment, before presenting to a board or investors, when feedb |
| `.gemini/skills/change-management/SKILL.md` | Change Management Playbook - "Framework for rolling out organizational changes without chaos. Covers the ADKAR model adapted for startups, communication templates, resistance patterns, and change fatigue management. Handles process changes, org restructures, strategy pivots, and culture changes. Use when announcing a reorg, swi |
| `.gemini/skills/changelog-generator/SKILL.md` | Changelog Generator - "Produce consistent, auditable release notes from Conventional Commits. Separates commit parsing, semantic-bump logic, and changelog rendering for automated releases with editorial control. Use when cutting a release, generating CHANGELOG.md from git history, or automating release notes in CI." |
| `.gemini/skills/changelog/SKILL.md` | /changelog - Generate changelogs from git history and validate conventional commits. Usage: /changelog <generate/lint> [options] |
| `.gemini/skills/channel-economics/SKILL.md` | channel-economics - "Use when reviewing or rebalancing direct vs. partner-led channel economics — computing fully-loaded cost-to-serve per channel, channel ROI with cash / LTV / marginal lenses, and optimal channel mix subject to constraints. For Head of Commercial, RevOps, and VP Sales doing quarterly channel review w |
| `.gemini/skills/chaos-engineering/SKILL.md` | Chaos Engineering - Use when planning, running, or learning from chaos engineering experiments. Triggers on "chaos experiment", "fault injection", "gameday", "resilience test", "blast radius", "steady state", "abort criteria", "Chaos Toolkit", "Chaos Mesh", "Litmus", "Gremlin", "AWS FIS", or any deliberate failure-inje |
| `.gemini/skills/chaos-experiment/SKILL.md` | /chaos-experiment - Interactive wizard to design and validate a chaos engineering experiment |
| `.gemini/skills/chief-ai-officer-advisor/SKILL.md` | Chief AI Officer Advisor - "Chief AI Officer advisory for startups: model build-vs-buy decisions (API vs fine-tune vs in-house), AI risk classification under EU AI Act + US state patchwork, AI cost economics (API-to-self-hosted breakeven), and AI team org evolution. Use when deciding whether to call an API or fine-tune, class |
| `.gemini/skills/chief-customer-officer-advisor/SKILL.md` | Chief Customer Officer Advisor - "Chief Customer Officer advisory for startups: retention decomposition (gross retention vs NRR honesty, churn root-cause taxonomy), customer segmentation strategy (differential investment across tiers + ICP fit scoring), CS team coverage model (pooled vs named CSM thresholds + ratio math), and CS te |
| `.gemini/skills/chief-data-officer-advisor/SKILL.md` | Chief Data Officer Advisor - "Chief Data Officer advisory for startups: AI training data rights and consent provenance, data product strategy (warehouse vs lakehouse vs mesh, build-vs-buy), B2B customer-data-as-asset valuation and M&A readiness, data team org evolution. Use when deciding whether to train models on customer data |
| `.gemini/skills/chief-of-staff/SKILL.md` | Chief of Staff - "C-suite orchestration layer. Routes founder questions to the right advisor role(s), triggers multi-role board meetings for complex decisions, synthesizes outputs, and tracks decisions. Every C-suite interaction starts here. Loads company context automatically." |
| `.gemini/skills/chro-advisor/SKILL.md` | CHRO Advisor - "People leadership for scaling companies. Hiring strategy, compensation design, org structure, culture, and retention. Use when building hiring plans, designing comp frameworks, restructuring teams, managing performance, building culture, or when user mentions CHRO, HR, people strategy, talent, head |
| `.gemini/skills/churn-prevention/SKILL.md` | Churn Prevention - "Reduce voluntary and involuntary churn through cancel flow design, save offers, exit surveys, and dunning sequences. Use when designing or optimizing a cancel flow, building save offers, setting up dunning emails, or reducing failed-payment churn. Trigger keywords: cancel flow, churn reduction, sav |
| `.gemini/skills/ci-cd-pipeline-builder/SKILL.md` | CI/CD Pipeline Builder - "Generate pragmatic CI/CD pipelines from detected project stack signals — fast baseline generation, repeatable checks, environment-aware deployment stages. Use when setting up CI for a new project, refactoring existing pipelines, or standardizing deployment workflows across multiple repos." |
| `.gemini/skills/ciso-advisor/SKILL.md` | CISO Advisor - "Security leadership for growth-stage companies. Risk quantification in dollars, compliance roadmap (SOC 2/ISO 27001/HIPAA/GDPR), security architecture strategy, incident response leadership, and board-level security reporting. Use when building security programs, justifying security budget, selecti |
| `.gemini/skills/ciso-review/SKILL.md` | /cs:ciso-review — CISO Forcing Questions - "/cs:ciso-review <plan> — Risk-paranoid interrogation of any plan that touches data, compliance, or production access." |
| `.gemini/skills/claude-coach/SKILL.md` | Claude Coach — Your Power-User Companion - Personal coach that teaches users to become Claude power users. Use this skill the FIRST time a user asks to "learn Claude", "be a power user", "coach me", "teach me Claude tricks", "what can Claude do", "make me better at prompting", or any variation. After activation, also use it on EVERY subseque |
| `.gemini/skills/clinical-research/SKILL.md` | clinical-research - Use when designing a prospective clinical study before submission — selecting and classifying endpoints (primary / key-secondary / exploratory, with surrogate-endpoint flagging), estimating sample size and power for two-arm designs (means / proportions / survival), or scoring a study plan for feasib |
| `.gemini/skills/cloud-security/SKILL.md` | Cloud Security - "Use when assessing cloud infrastructure for security misconfigurations, IAM privilege escalation paths, S3 public exposure, open security group rules, or IaC security gaps. Covers AWS, Azure, and GCP posture assessment with MITRE ATT&CK mapping." |
| `.gemini/skills/cmd-a11y-audit/SKILL.md` | /a11y-audit - Scan a frontend project for WCAG 2.2 accessibility violations and fix them. Usage: /a11y-audit [path] |
| `.gemini/skills/cmd-code-to-prd/SKILL.md` | /code-to-prd - Reverse-engineer a frontend codebase into a PRD. Usage: /code-to-prd [path] |
| `.gemini/skills/cmd-cs-aeo/SKILL.md` | /cs:aeo — Answer Engine Optimization - "/cs:aeo — Answer Engine Optimization workflow. Audit content for E-E-A-T + structure signals that drive LLM citation (ChatGPT, Perplexity, Claude, Gemini, Mistral). Optimize content in 3 modes (conservative/balanced/aggressive). Track which LLMs cite which pages via local ledger. Industry-aware thr |
| `.gemini/skills/cmd-focused-fix/SKILL.md` | /focused-fix - Deep-dive feature repair — systematically fix an entire feature/module across all its files and dependencies. Usage: /focused-fix <feature-path> |
| `.gemini/skills/cmo-advisor/SKILL.md` | CMO Advisor - "Marketing leadership for scaling companies. Brand positioning, growth model design, marketing budget allocation, and marketing org design. Use when designing brand strategy, selecting growth models (PLG vs sales-led vs community-led), allocating marketing budgets, building marketing teams, or when  |
| `.gemini/skills/cmo-review/SKILL.md` | /cs:cmo-review — CMO Forcing Questions - "/cs:cmo-review <plan> — Narrative-first interrogation of positioning, ICP, message house, and channel mix." |
| `.gemini/skills/code-reviewer/SKILL.md` | Code Reviewer - Code review automation for TypeScript, JavaScript, Python, Go, Swift, Kotlin, C#, .NET, Java, C, C++, Rust, Ruby, PHP, and Dart/Flutter. Analyzes PRs for complexity and risk, checks code quality for SOLID violations and code smells, generates review reports. Use when reviewing pull requests, analyzi |
| `.gemini/skills/code-to-prd/SKILL.md` | Code → PRD: Reverse-Engineer Any Codebase into Product Requirements - / |
| `.gemini/skills/code-tour/SKILL.md` | Code Tour - "Use when the user asks to create a CodeTour .tour file — persona-targeted, step-by-step walkthroughs that link to real files and line numbers. Trigger for: create a tour, onboarding tour, architecture tour, PR review tour, explain how X works, vibe check, RCA tour, contributor guide, or any structu |
| `.gemini/skills/codebase-onboarding/SKILL.md` | Codebase Onboarding - "Analyze a codebase and generate onboarding documentation for engineers, tech leads, and contractors. Fast fact-gathering and repeatable onboarding outputs. Use when onboarding a new engineer, writing architecture-overview docs for a new project, or producing tech-lead briefings for unfamiliar repos |
| `.gemini/skills/cold-email/SKILL.md` | Cold Email Outreach - "When the user wants to write, improve, or build a sequence of B2B cold outreach emails to prospects who haven't asked to hear from them. Use when the user mentions 'cold email,' 'cold outreach,' 'prospecting emails,' 'SDR emails,' 'sales emails,' 'first touch email,' 'follow-up sequence,' or 'email |
| `.gemini/skills/command-guide/SKILL.md` | Claude Code Command Selection Guide - > |
| `.gemini/skills/commercial-forecaster/SKILL.md` | commercial-forecaster - "Use when building a quarterly bookings forecast, ARR projection, pipeline forecast, NRR projection, or commit/best-case/pipe-only board number — especially when the CRO needs to walk the board through funnel math + cohort ARR + per-stage conversion assumptions without the theatre of a single undefe |
| `.gemini/skills/commercial-policy/SKILL.md` | commercial-policy - "Use when designing or revising a company's commercial policy — the rules of engagement governing discounts off list price, approver thresholds, exception flows, and the deal framework that Deal Desk and AEs operate under. Covers discount matrix design (ARR band x term length x payment terms x strat |
| `.gemini/skills/commercial-skills/SKILL.md` | Commercial — Domain Orchestrator - Use when reviewing, approving, or designing commercial motion — pricing models, deal review, discount approval, partnership economics, channel mix, commercial policy, RFP/RFI response, bookings forecast. Triggers on "review this deal", "should we discount", "pricing model", "partner economics", "RFP |
| `.gemini/skills/company-os/SKILL.md` | Company Operating System - "The meta-framework for how a company runs — the connective tissue between all C-suite roles. Covers operating system selection (EOS, Scaling Up, OKR-native, hybrid), accountability charts, scorecards, meeting pulse, issue resolution, and 90-day rocks. Use when setting up company operations, selecti |
| `.gemini/skills/competitive-intel/SKILL.md` | Competitive Intelligence - "Systematic competitor tracking that feeds CMO positioning, CRO battlecards, and CPO roadmap decisions. Use when analyzing competitors, building sales battlecards, tracking market moves, positioning against alternatives, or when user mentions competitive intelligence, competitive analysis, competito |
| `.gemini/skills/competitive-matrix/SKILL.md` | /competitive-matrix - Build competitive analysis matrices with scoring and gap analysis. Usage: /competitive-matrix <analyze> [options] |
| `.gemini/skills/competitive-teardown/SKILL.md` | Competitive Teardown - "Analyzes competitor products and companies by synthesizing data from pricing pages, app store reviews, job postings, SEO signals, and social media into structured competitive intelligence. Produces feature comparison matrices scored across 12 dimensions, SWOT analyses, positioning maps, UX audits,  |
| `.gemini/skills/competitor-alternatives/SKILL.md` | Competitor & Alternative Pages - "When the user wants to create competitor comparison or alternative pages for SEO and sales enablement. Also use when the user mentions 'alternative page,' 'vs page,' 'competitor comparison,' 'comparison page,' '[Product] vs [Product],' '[Product] alternative,' 'competitive landing pages,' 'switch f |
| `.gemini/skills/compliance-os-bundle/SKILL.md` | Compliance OS — Meta-Orchestrator - "Compliance OS — meta-orchestrator that lets compliance teams CONFIGURE which frameworks apply, COMPUTE cross-framework control overlap, SIMULATE internal audits, and CONSOLIDATE evidence across multiple frameworks. Four decisions: (1) Given a company profile, which of the 12 supported frameworks ap |
| `.gemini/skills/compliance-readiness/SKILL.md` | /cs:compliance-readiness — Compliance Officer Forcing Questions - "/cs:compliance-readiness <program> — Multi-framework compliance officer 6-question forcing interrogation of any compliance program. Use before starting a new framework, planning the annual audit calendar, or preparing for certification stage 1." |
| `.gemini/skills/confluence-expert/SKILL.md` | Atlassian Confluence Expert - Atlassian Confluence expert for creating and managing spaces, knowledge bases, and documentation. Configures space permissions and hierarchies, creates page templates with macros, sets up documentation taxonomies, designs page layouts, and manages content governance. Use when users need to build or  |
| `.gemini/skills/content-creator/SKILL.md` | Content Creator → Redirected - "Deprecated redirect skill that routes legacy 'content creator' requests to the correct specialist. Use when a user invokes 'content creator', asks to write a blog post, article, guide, or brand voice analysis (routes to content-production), or asks to plan content, build a topic cluster, or create  |
| `.gemini/skills/content-humanizer/SKILL.md` | Content Humanizer - "Makes AI-generated content sound genuinely human — not just cleaned up, but alive. Use when content feels robotic, uses too many AI clichés, lacks personality, or reads like it was written by committee. Triggers: 'this sounds like AI', 'make it more human', 'add personality', 'it feels generic', 's |
| `.gemini/skills/content-production/SKILL.md` | Content Production - "Full content production pipeline — takes a topic from blank page to published-ready piece. Use when you need to execute content: write a blog post, article, or guide end-to-end. Triggers: 'write a post about', 'draft an article', 'create content for', 'help me write', 'I need a blog post'. NOT for  |
| `.gemini/skills/content-strategist/SKILL.md` | Content Strategist - Builds content engines that rank, convert, and compound. Thinks in systems — topic clusters, not individual posts. Every piece earns its place or gets killed. |
| `.gemini/skills/content-strategy/SKILL.md` | Content Strategy - "When the user wants to plan a content strategy, decide what content to create, or figure out what topics to cover. Also use when the user mentions \"content strategy,\" \"what should I write about,\" \"content ideas,\" \"blog strategy,\" \"topic clusters,\" or \"content planning.\" For writing indi |
| `.gemini/skills/context-engine/SKILL.md` | Company Context Engine - "Loads and manages company context for all C-suite advisor skills. Reads ~/.claude/company-context.md, detects stale context (>90 days), enriches context during conversations, and enforces privacy/anonymization rules before external API calls." |
| `.gemini/skills/contract-and-proposal-writer/SKILL.md` | Contract & Proposal Writer - "Generate professional, jurisdiction-aware business documents: freelance contracts, project proposals, SOWs, NDAs, and MSAs. Structured Markdown output with docx conversion instructions. Covers US (Delaware), EU (GDPR), UK, and DACH (German law) jurisdictions. Not a substitute for legal counsel — us |
| `.gemini/skills/coo-advisor/SKILL.md` | COO Advisor - "Operations leadership for scaling companies. Process design, OKR execution, operational cadence, and scaling playbooks. Use when designing operations, setting up OKRs, building processes, scaling teams, analyzing bottlenecks, planning operational cadence, or when user mentions COO, operations, proc |
| `.gemini/skills/copy-editing/SKILL.md` | Copy Editing - "When the user wants to edit, review, or improve existing marketing copy. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' or 'copy sweep.' This skill provides a systematic approach to editing marketing copy through  |
| `.gemini/skills/copywriting/SKILL.md` | Copywriting - "When the user wants to write, rewrite, or improve marketing copy for any page — including homepage, landing pages, pricing pages, feature pages, about pages, or product pages. Also use when the user says \"write copy for,\" \"improve this copy,\" \"rewrite this page,\" \"marketing copy,\" \"headlin |
| `.gemini/skills/coverage/SKILL.md` | Analyze Test Coverage Gaps - >- |
| `.gemini/skills/cpo-advisor/SKILL.md` | CPO Advisor - "Product leadership for scaling companies. Product vision, portfolio strategy, product-market fit, and product org design. Use when setting product vision, managing a product portfolio, measuring PMF, designing product teams, prioritizing at the portfolio level, reporting to the board on product, or |
| `.gemini/skills/cpo-review/SKILL.md` | /cs:cpo-review — CPO Forcing Questions - "/cs:cpo-review <plan> — JTBD-driven interrogation of product roadmap, PMF signal, and portfolio focus." |
| `.gemini/skills/cro-advisor/SKILL.md` | CRO Advisor - "Revenue leadership for B2B SaaS companies. Revenue forecasting, sales model design, pricing strategy, net revenue retention, and sales team scaling. Use when designing the revenue engine, setting quotas, modeling NRR, evaluating pricing, building board forecasts, or when user mentions CRO, chief re |
| `.gemini/skills/cro-review/SKILL.md` | /cs:cro-review — CRO Forcing Questions - "/cs:cro-review <plan> — Pipeline-paranoid interrogation of revenue, win rate, NRR, and ramp time." |
| `.gemini/skills/cross-eval/SKILL.md` | /cs:cross-eval — Multi-Model Consensus - "/cs:cross-eval <memo> — Multi-model consensus on a board memo or strategy brief. Claude + Codex + Gemini cross-review with graceful degradation." |
| `.gemini/skills/cs-aeo/SKILL.md` | AEO Agent — Answer Engine Optimization Specialist - Answer Engine Optimization (AEO) specialist agent. Use when content needs to be optimized for citation by AI language models (ChatGPT, Perplexity, Claude, Gemini, Mistral) rather than for traditional search rankings. Orchestrates the aeo skill — runs E-E-A-T audit, generates optimization variants in |
| `.gemini/skills/cs-agile-product-owner/SKILL.md` | Agile Product Owner Agent - Agile product owner agent for epic breakdown, sprint planning, backlog refinement, and INVEST-compliant user story generation |
| `.gemini/skills/cs-backend-engineer/SKILL.md` | cs-backend-engineer — Backend Orchestrator - Backend-engineering orchestrator. Walks the 7 Matt Pocock forcing questions (read/write ratio + QPS, tenancy, sync vs async, data sensitivity, pattern, RPO/RTO, SLO), picks the language + pattern profile, forks into specialists (api-design-reviewer, database-designer, migration-architect, observabil |
| `.gemini/skills/cs-backend-review/SKILL.md` | /cs:backend-review — Backend engineering review - Backend engineering review — walks the 7 Matt Pocock forcing questions (read/write ratio + QPS, tenancy, sync vs async, data sensitivity, pattern, RPO/RTO, SLO), picks the language + pattern profile, forks into specialists (api-design-reviewer, database-designer, migration-architect, slo-architect). |
| `.gemini/skills/cs-ceo-advisor/SKILL.md` | CEO Advisor Agent - Strategic leadership advisor for CEOs covering vision, strategy, board management, investor relations, and organizational culture |
| `.gemini/skills/cs-content-creator/SKILL.md` | Content Creator Agent - AI-powered content creation specialist for brand voice consistency, SEO optimization, and multi-platform content strategy |
| `.gemini/skills/cs-cto-advisor/SKILL.md` | CTO Advisor Agent - Technical leadership advisor for CTOs covering technology strategy, team scaling, architecture decisions, and engineering excellence |
| `.gemini/skills/cs-demand-gen-specialist/SKILL.md` | Demand Generation Specialist Agent - Demand generation and customer acquisition specialist for lead generation, conversion optimization, and multi-channel acquisition campaigns |
| `.gemini/skills/cs-engineer-grill/SKILL.md` | /cs:engineer-grill — Cross-role engineering forcing-question grill - Cross-role engineering grill — Matt Pocock 7 questions per role × 3 roles (fullstack / frontend / backend) = up to 21 forcing questions, one per turn, with canon citations and kill criteria. Default: ask which lane first; `--all` runs all 21. |
| `.gemini/skills/cs-engineering-lead/SKILL.md` | cs-engineering-lead - Engineering Team Lead agent for coordinating QA, security, data engineering, ML, and frontend/backend teams. Orchestrates engineering-team skills for team-level technical decisions. Spawn when users need team coordination, tech stack evaluation, incident response, or cross-functional engineering wor |
| `.gemini/skills/cs-financial-analyst/SKILL.md` | cs-financial-analyst - Financial Analyst agent for DCF valuation, financial modeling, budgeting, forecasting, and SaaS metrics (ARR, MRR, churn, CAC, LTV, NRR). Orchestrates finance skills. Spawn when users need financial analysis, valuation models, budget planning, ratio analysis, SaaS health checks, or unit economics pr |
| ... | mais 637 skills no inventory.json |

## Scripts e tools relevantes
- business-growth/skills/customer-success-manager/scripts/churn_risk_analyzer.py
- business-growth/skills/customer-success-manager/scripts/expansion_opportunity_scorer.py
- business-growth/skills/customer-success-manager/scripts/health_score_calculator.py
- business-growth/skills/revenue-operations/scripts/forecast_accuracy_tracker.py
- business-growth/skills/revenue-operations/scripts/gtm_efficiency_calculator.py
- business-growth/skills/revenue-operations/scripts/pipeline_analyzer.py
- business-growth/skills/sales-engineer/scripts/competitive_matrix_builder.py
- business-growth/skills/sales-engineer/scripts/poc_planner.py
- business-growth/skills/sales-engineer/scripts/rfp_response_analyzer.py
- business-operations/skills/capacity-planner/scripts/capacity_modeler.py
- business-operations/skills/capacity-planner/scripts/hiring_sequencer.py
- business-operations/skills/capacity-planner/scripts/utilization_analyzer.py
- business-operations/skills/internal-comms/scripts/change_announcement_builder.py
- business-operations/skills/internal-comms/scripts/comms_calendar_builder.py
- business-operations/skills/internal-comms/scripts/comms_template_filler.py
- business-operations/skills/knowledge-ops/scripts/kb_ingester.py
- business-operations/skills/knowledge-ops/scripts/runbook_validator.py
- business-operations/skills/knowledge-ops/scripts/sop_generator.py
- business-operations/skills/process-mapper/scripts/bottleneck_detector.py
- business-operations/skills/process-mapper/scripts/cycle_time_analyzer.py
- business-operations/skills/process-mapper/scripts/process_documenter.py
- business-operations/skills/procurement-optimizer/scripts/purchasing_cycle_analyzer.py
- business-operations/skills/procurement-optimizer/scripts/spend_categorizer.py
- business-operations/skills/procurement-optimizer/scripts/supplier_consolidation.py
- business-operations/skills/vendor-management/scripts/sla_compliance_tracker.py
- business-operations/skills/vendor-management/scripts/vendor_risk_classifier.py
- business-operations/skills/vendor-management/scripts/vendor_scorer.py
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/scripts/ai_cost_economics.py
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/scripts/ai_risk_classifier.py
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/scripts/model_buildvsbuy_calculator.py
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/scripts/cs_coverage_calculator.py
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/scripts/customer_segmentation_designer.py
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/scripts/retention_decomposition_analyzer.py
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/scripts/ai_training_data_audit.py
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/scripts/data_asset_valuator.py
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/scripts/data_product_strategy_picker.py
- c-level-advisor/executive-mentor/skills/executive-mentor/scripts/decision_matrix_scorer.py
- c-level-advisor/executive-mentor/skills/executive-mentor/scripts/stakeholder_mapper.py
- c-level-advisor/general-counsel-advisor/skills/general-counsel-advisor/scripts/contract_risk_scanner.py
- c-level-advisor/general-counsel-advisor/skills/general-counsel-advisor/scripts/term_sheet_analyzer.py
- c-level-advisor/skills/ceo-advisor/scripts/financial_scenario_analyzer.py
- c-level-advisor/skills/ceo-advisor/scripts/strategy_analyzer.py
- c-level-advisor/skills/cfo-advisor/scripts/burn_rate_calculator.py
- c-level-advisor/skills/cfo-advisor/scripts/fundraising_model.py
- c-level-advisor/skills/cfo-advisor/scripts/unit_economics_analyzer.py
- c-level-advisor/skills/chief-ai-officer-advisor/scripts/ai_cost_economics.py
- c-level-advisor/skills/chief-ai-officer-advisor/scripts/ai_risk_classifier.py
- c-level-advisor/skills/chief-ai-officer-advisor/scripts/model_buildvsbuy_calculator.py
- c-level-advisor/skills/chief-customer-officer-advisor/scripts/cs_coverage_calculator.py
- c-level-advisor/skills/chief-customer-officer-advisor/scripts/customer_segmentation_designer.py
- c-level-advisor/skills/chief-customer-officer-advisor/scripts/retention_decomposition_analyzer.py
- c-level-advisor/skills/chief-data-officer-advisor/scripts/ai_training_data_audit.py
- c-level-advisor/skills/chief-data-officer-advisor/scripts/data_asset_valuator.py
- c-level-advisor/skills/chief-data-officer-advisor/scripts/data_product_strategy_picker.py
- c-level-advisor/skills/chro-advisor/scripts/comp_benchmarker.py
- c-level-advisor/skills/chro-advisor/scripts/hiring_plan_modeler.py
- c-level-advisor/skills/ciso-advisor/scripts/compliance_tracker.py
- c-level-advisor/skills/ciso-advisor/scripts/risk_quantifier.py
- c-level-advisor/skills/cmo-advisor/scripts/growth_model_simulator.py
- c-level-advisor/skills/cmo-advisor/scripts/marketing_budget_modeler.py
- c-level-advisor/skills/coo-advisor/scripts/okr_tracker.py
- c-level-advisor/skills/coo-advisor/scripts/ops_efficiency_analyzer.py
- c-level-advisor/skills/cpo-advisor/scripts/pmf_scorer.py
- c-level-advisor/skills/cpo-advisor/scripts/portfolio_analyzer.py
- c-level-advisor/skills/cro-advisor/scripts/churn_analyzer.py
- c-level-advisor/skills/cro-advisor/scripts/revenue_forecast_model.py
- c-level-advisor/skills/cto-advisor/scripts/team_scaling_calculator.py
- c-level-advisor/skills/cto-advisor/scripts/tech_debt_analyzer.py
- c-level-advisor/skills/decision-logger/scripts/decision_tracker.py
- c-level-advisor/skills/general-counsel-advisor/scripts/contract_risk_scanner.py
- c-level-advisor/skills/general-counsel-advisor/scripts/term_sheet_analyzer.py
- c-level-advisor/skills/org-health-diagnostic/scripts/health_scorer.py
- c-level-advisor/skills/scenario-war-room/scripts/scenario_modeler.py
- c-level-advisor/skills/strategic-alignment/scripts/alignment_checker.py
- c-level-advisor/skills/vpe-advisor/scripts/delivery_throughput_analyzer.py
- c-level-advisor/skills/vpe-advisor/scripts/eng_hiring_funnel_calculator.py
- c-level-advisor/skills/vpe-advisor/scripts/eng_team_structure_designer.py
- c-level-advisor/vpe-advisor/skills/vpe-advisor/scripts/delivery_throughput_analyzer.py
- c-level-advisor/vpe-advisor/skills/vpe-advisor/scripts/eng_hiring_funnel_calculator.py
- c-level-advisor/vpe-advisor/skills/vpe-advisor/scripts/eng_team_structure_designer.py
- ... mais 496

## Referencias/templates/assets relevantes
- assets/icon.png
- business-growth/skills/customer-success-manager/assets/executive_business_review_template.md
- business-growth/skills/customer-success-manager/assets/expected_output.json
- business-growth/skills/customer-success-manager/assets/onboarding_checklist_template.md
- business-growth/skills/customer-success-manager/assets/qbr_template.md
- business-growth/skills/customer-success-manager/assets/sample_customer_data.json
- business-growth/skills/customer-success-manager/assets/success_plan_template.md
- business-growth/skills/customer-success-manager/references/cs-metrics-benchmarks.md
- business-growth/skills/customer-success-manager/references/cs-playbooks.md
- business-growth/skills/customer-success-manager/references/health-scoring-framework.md
- business-growth/skills/revenue-operations/assets/expected_output.json
- business-growth/skills/revenue-operations/assets/forecast_report_template.md
- business-growth/skills/revenue-operations/assets/gtm_dashboard_template.md
- business-growth/skills/revenue-operations/assets/pipeline_review_template.md
- business-growth/skills/revenue-operations/assets/sample_forecast_data.json
- business-growth/skills/revenue-operations/assets/sample_gtm_data.json
- business-growth/skills/revenue-operations/assets/sample_pipeline_data.json
- business-growth/skills/revenue-operations/references/gtm-efficiency-benchmarks.md
- business-growth/skills/revenue-operations/references/pipeline-management-framework.md
- business-growth/skills/revenue-operations/references/revops-metrics-guide.md
- business-growth/skills/sales-engineer/assets/demo_script_template.md
- business-growth/skills/sales-engineer/assets/expected_output.json
- business-growth/skills/sales-engineer/assets/poc_scorecard_template.md
- business-growth/skills/sales-engineer/assets/sample_rfp_data.json
- business-growth/skills/sales-engineer/assets/technical_proposal_template.md
- business-growth/skills/sales-engineer/references/competitive-positioning-framework.md
- business-growth/skills/sales-engineer/references/poc-best-practices.md
- business-growth/skills/sales-engineer/references/rfp-response-guide.md
- business-operations/skills/capacity-planner/assets/capacity_brief_template.md
- business-operations/skills/capacity-planner/references/capacity_anti_patterns.md
- business-operations/skills/capacity-planner/references/ops_workforce_planning_canon.md
- business-operations/skills/capacity-planner/references/queueing_theory_canon.md
- business-operations/skills/internal-comms/assets/comms_brief_template.md
- business-operations/skills/internal-comms/references/announcement_anti_patterns.md
- business-operations/skills/internal-comms/references/change_management_canon.md
- business-operations/skills/internal-comms/references/internal_comms_canon.md
- business-operations/skills/knowledge-ops/assets/runbook_template.md
- business-operations/skills/knowledge-ops/assets/sop_template.md
- business-operations/skills/knowledge-ops/references/5w2h_sop_canon.md
- business-operations/skills/knowledge-ops/references/kb_hygiene_anti_patterns.md
- business-operations/skills/knowledge-ops/references/runbook_canon.md
- business-operations/skills/process-mapper/assets/process_template.md
- business-operations/skills/process-mapper/references/bottleneck_anti_patterns.md
- business-operations/skills/process-mapper/references/bpmn_essentials.md
- business-operations/skills/process-mapper/references/lean_six_sigma_canon.md
- business-operations/skills/procurement-optimizer/assets/spend_intake_template.md
- business-operations/skills/procurement-optimizer/references/procurement_anti_patterns.md
- business-operations/skills/procurement-optimizer/references/saas_management_canon.md
- business-operations/skills/procurement-optimizer/references/spend_management_canon.md
- business-operations/skills/vendor-management/assets/vendor_catalog_template.md
- business-operations/skills/vendor-management/references/sla_design_patterns.md
- business-operations/skills/vendor-management/references/vendor_management_canon.md
- business-operations/skills/vendor-management/references/vendor_risk_anti_patterns.md
- c-level-advisor/c-level-agents/references/llm-wiki-bridge.md
- c-level-advisor/c-level-agents/references/persona-voices.md
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/references/ai_cost_economics.md
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/references/ai_risk_governance.md
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/references/ai_team_org_evolution.md
- c-level-advisor/chief-ai-officer-advisor/skills/chief-ai-officer-advisor/references/model_buildvsbuy_strategy.md
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/references/cs_coverage_model.md
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/references/cs_team_org_evolution.md
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/references/customer_segmentation_strategy.md
- c-level-advisor/chief-customer-officer-advisor/skills/chief-customer-officer-advisor/references/retention_decomposition.md
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/references/ai_training_data_rights.md
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/references/customer_data_as_asset.md
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/references/data_product_strategy.md
- c-level-advisor/chief-data-officer-advisor/skills/chief-data-officer-advisor/references/data_team_org_evolution.md
- c-level-advisor/executive-mentor/skills/executive-mentor/references/board_dynamics.md
- c-level-advisor/executive-mentor/skills/executive-mentor/references/crisis_playbook.md
- c-level-advisor/executive-mentor/skills/executive-mentor/references/hard_things.md
- c-level-advisor/general-counsel-advisor/skills/general-counsel-advisor/references/contracts_playbook.md
- c-level-advisor/general-counsel-advisor/skills/general-counsel-advisor/references/ip_and_regulatory.md
- c-level-advisor/general-counsel-advisor/skills/general-counsel-advisor/references/term_sheet_decoder.md
- c-level-advisor/skills/agent-protocol/references/invocation-patterns.md
- c-level-advisor/skills/board-deck-builder/references/deck-frameworks.md
- c-level-advisor/skills/board-deck-builder/templates/board-deck-template.md
- c-level-advisor/skills/board-meeting/references/meeting-facilitation.md
- c-level-advisor/skills/board-meeting/templates/meeting-agenda.md
- c-level-advisor/skills/board-meeting/templates/meeting-minutes.md
- c-level-advisor/skills/ceo-advisor/references/board_governance_investor_relations.md
- ... mais 874
