# CODEX.md — MarketingOS
> Arquivo de contexto operacional persistente para desenvolvimento no Cursor / VS Code.
> Leia este arquivo antes de qualquer sessão de desenvolvimento.

---

## 🧭 Visão do Projeto

O MarketingOS é um **ecossistema operacional de aquisição e crescimento** para negócios.

Não é uma agência. Não é um chatbot. É uma plataforma híbrida entre serviço + software, operada por IA, que entrega leads, posicionamento e automação de forma previsível.

**O cliente compra:** leads, crescimento, previsibilidade, posicionamento.
**O cliente não compra:** IA, agentes, Claude, GPT.

---

## 🗂️ Estrutura de Pastas

```
/marketing-os
  /skills             → prompts especializados e reutilizáveis por função
  /clients            → contexto individual por cliente
    /[cliente-slug]
      client.md       → levantamento completo do cliente
      metrics.json    → métricas e KPIs atuais
      campaigns.md    → campanhas ativas
  /templates          → templates reutilizáveis (site, posts, carrossel, ads)
  /workflows          → fluxos operacionais documentados
  /memory             → logs, histórico, feedbacks por cliente
  /scripts            → automações, integrações, utilitários
  CODEX.md            → este arquivo (contexto global do projeto)
```

---

## ⚙️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| IDE / Dev | Cursor / VS Code |
| Banco de dados | Supabase (Postgres + Auth + Storage) |
| WhatsApp | Typebot + Evolution API |
| Ads | Meta Ads (API) |
| Frontend | Next.js + Tailwind |
| Deploy | Vercel (frontend) / Railway (backend) |
| IA | OpenAI Codex|

---

## 🧱 Princípios de Desenvolvimento

1. **Skills primeiro, agentes depois** — previsibilidade antes de autonomia
2. **Revelação progressiva de contexto** — carregar só o que a operação precisa
3. **Core compartilhado + contexto individual** — o que muda por cliente fica em `/clients/[slug]/`
4. **Memória via arquivos e banco** — nada depende só do modelo
5. **Custo controlado** — meta de US$20–90/mês por cliente

---

## 🔄 Fluxo Operacional Central

```
Trend / Oportunidade
  → Conteúdo SEO
  → Carrossel Instagram
  → CTA
  → Criação de sites que convertem
  → Captura de lead
  → WhatsApp (Typebot)
  → Dashboard (Supabase)
  → Métricas
  → Sugestão automática
  → Otimização de campanha
```

Toda feature desenvolvida deve se conectar a algum ponto deste fluxo.

---

## 🧠 Skills Planejadas

| Skill | Função |
|---|---|
| `skill-carousel.md` | Gera carrossel com gancho, slides e CTA |
| `skill-post.md` | Gera post para Feed, Reels ou Story |
| `skill-site-builder.md` | Desenvolve site ou landing page por seção |
| `skill-dashboard.md` | Lê metrics.json e gera relatório de performance |
| `skill-lead-capture.md` | Estrutura captura de leads e primeiro contato |
| `skill-funnel-analysis.md` | Mapeia e diagnostica o funil ponta a ponta |
| `skill-retention.md` | Plano de retenção e aumento de LTV |
| `skill-reactivation.md` | Sequência de reativação por segmento de inativo |
| `skill-offer-positioning.md` | Posiciona e adapta a oferta por canal |
---

## 🚀 Fases de Desenvolvimento

### Fase 1 — Fundação *(atual)*
- [ ] Estrutura de pastas criada
- [ ] Template de site base (Next.js + Tailwind)
- [ ] Dashboard simples conectado ao Supabase
- [ ] 3 skills iniciais: `site-copy`, `instagram-carousel`, `lead-capture`
- [ ] Primeiro cliente piloto onboardado

### Fase 2 — Integrações (necessario a pergunta se de fato será utilizado alguns dos serviços aqui, pra cada cliente
)
- [ ] Typebot + Evolution API (WhatsApp)
- [ ] Meta Ads API conectada
- [ ] Analytics pipeline (evento → Supabase → dashboard)

### Fase 3 — Memória Persistente
- [ ] Logs de campanha por cliente
- [ ] Feedback loop de métricas → refinamento de skills
- [ ] Histórico de conteúdo gerado

### Fase 4 — Orquestração
- [ ] Workflows automáticos
- [ ] Agentes especializados por função

### Fase 5 — Escala Semi-Autônoma
- [ ] Onboarding automatizado de cliente
- [ ] Sistema rodando com mínima intervenção manual

---

## 📋 Regras para o Cursor

1. Sempre leia o `client.md` do cliente ativo antes de gerar qualquer conteúdo
2. Nunca hardcode dados de cliente — use variáveis de ambiente ou Supabase
3. Cada skill é um arquivo isolado com input, output e prompt documentados
4. Antes de criar nova feature, verifique conexão com o fluxo operacional central
5. Documente todo workflow em `/workflows/` antes de implementar
6. Commits descritivos: `feat(skill): add instagram-carousel`
7. Nunca commitar `.env` — usar `.env.example` com todas as chaves

---

## 🔑 Variáveis de Ambiente (Por demanda )

```env
# Anthropic
ANTHROPIC_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Meta Ads
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=

# WhatsApp / Evolution API
EVOLUTION_API_URL=
EVOLUTION_API_KEY=

# Typebot
TYPEBOT_API_KEY=
TYPEBOT_WORKSPACE_ID=
```

---

*Mantenha este arquivo atualizado a cada mudança de fase ou decisão arquitetural relevante.*