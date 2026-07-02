---
name: "source-command-repositorios"
description: "Exércitos de IA — análise dos 5 repositórios Codex candidatos a repertório do MarketingOS"
---

# source-command-repositorios

Use this skill when the user asks to run the migrated source command `repositorios`.

## Command Template

# Exércitos de IA — Análise para Adoção no MarketingOS

> Registrado em 2026-06-17. Repertório a ser filtrado pela alma do sistema (AGENTS.md → "Regra de adoção").
> **Nada foi clonado ainda.** Faltam as URLs reais do GitHub de cada repo.
> Quando rodar `/repositorios`: apresentar este mapa, perguntar qual integrar primeiro e seguir a regra "uma skill/workflow por vez, registrando em `intelligence/skill-updates.md`".

---

## Conceito

"Exército de IA" = repositório Codex com múltiplos agentes + skills + recursos interconectados,
operando como sistema (swarm) em vez de agente isolado. O MarketingOS **já é** um desses — a questão
não é "adotar a arquitetura", é **garimpar peças** que tornem a aquisição mais observável, ajustável
ou previsível (north star). Tudo que não passar nesse filtro não entra.

---

## Os 5 candidatos

### 1. Superpowers — *metodologia de build de software*
- **O que é:** multi-agente paralelo que planeja, testa e executa; auto-revisão de código + ciclos de otimização que pegam bug e erro de UX antes da entrega. Está no marketplace oficial da Anthropic.
- **Onde encaixa no MarketingOS:** motor de execução técnica — `skill-site-builder`, pipeline Playwright/FFmpeg, geração de carrossel/reel. O ciclo de auto-revisão é o que falta hoje nos outputs de código (HTML deploy bugs são recorrentes — ver memória `feedback-html-deploy-bugs`).
- **Ganho real:** menos bug de entrega visual/site; loop de QA antes do output sair.
- **Filtrar:** é metodologia de *software*, não de aquisição. Não importar a linguagem de "produtividade de dev" — adaptar só o **padrão de auto-revisão** para o gate criativo (`/inteligencia critica`).
- **Veredito:** ⭐ ALTO — fonte de execução, casa com "motor universal".

### 2. Everything Codex — *o exército volumoso*
- **O que é:** 182 skills / 68 comandos / 48 agentes. Memória persistente, security scan, promessa de cortar token pela metade. Tem skills de pesquisa de mercado, Liquid Glass Design, campanha de marketing e automação de post.
- **Onde encaixa:** tentador porque tem "marketing" — mas é exatamente onde mora o risco. Skill genérica de "campanha de marketing" e "automação de post" **contradiz o posicionamento** (AGENTS.md: nunca "pacote de posts"/"automação"; sempre remoção de gargalo de aquisição).
- **Ganho real:** o que vale aqui é **infra**, não conteúdo: (a) padrão de memória persistente, (b) economia de token, (c) security scan de credenciais.
- **Filtrar:** descartar as skills de conteúdo/marketing genérico. Volume ≠ valor — 182 skills é repertório para minerar 3, não para importar.
- **Veredito:** 🟡 MÉDIO — minerar infra (memória/token/segurança), ignorar as skills de marketing.

### 3. Ruflo (Ruflo/Ruufflo) — *swarm com memória compartilhada*
- **O que é:** enxame de agentes em paralelo que se comunicam, memória compartilhada, troca automática de modelo (Haiku p/ simples, Sonnet/Opus p/ complexo), AGENTS.md de 1.100+ linhas com camada de segurança p/ não vazar credencial em repo público.
- **Onde encaixa:** é o **mais alinhado ao futuro do MarketingOS**. O Motor de Aquisição e o Motor de Follow-up (memórias `project-motor-aquisicao`, `project-followup-engine`) pedem exatamente isso: agentes que operam em paralelo com estado compartilhado e aprovação humana ("saber de tudo").
- **Ganho real:** (a) **roteamento de modelo por complexidade** = corta custo direto; (b) padrão de memória compartilhada entre skills; (c) camada de não-vazamento de credencial (relevante: token Meta, chaves de API).
- **Filtrar:** 1.100 linhas de AGENTS.md é o anti-padrão da economia de token. Pegar o *mecanismo*, não a verbosidade.
- **Veredito:** ⭐ ALTO — arquitetura mais próxima da Fase 3; roteamento de modelo é ganho imediato.

### 4. Open Design — *identidade visual e design systems*
- **O que é:** 72 design systems inspirados em Airbnb, Apple, Tesla, Stripe, Notion + 31 skills; referências visuais em HTML p/ a IA reproduzir estética específica.
- **Onde encaixa:** direto na camada de Percepção/Criação — `/direcao-criativa`, `visual-dna.json`, Reference Library externa. As refs HTML são o formato que o "motor universal" já consome.
- **Ganho real:** acelera `/branding` e `/direcao-criativa` com vocabulário visual pronto; eleva o piso estético de site/carrossel.
- **Filtrar:** **risco do Teste Supremo** — copiar design system de Apple/Stripe produz peça que falha o gate "se removermos logo e cor, alguém reconhece a marca?". Usar como **biblioteca de mecânica visual** (grid, motion, tipografia), nunca como identidade pronta. Passa pelo Gate de Referências (rastreabilidade + dependência).
- **Veredito:** 🟡 MÉDIO-ALTO — ótimo repertório de execução visual, perigoso se virar template.

### 5. AGENTS.md do Karpathy — *minimalismo de prompt*
- **O que é:** AGENTS.md viral (130k+ stars) com prompts mínimos atacando pilares fundamentais; elegância e concisão como princípio.
- **Onde encaixa:** meta-camada — é **crítica ao nosso próprio AGENTS.md**, que já está longo. Contraponto à doutrina de economia de token (`workflows/token-economy.md`).
- **Ganho real:** referência para **enxugar** o AGENTS.md e os `_admin.md` sem perder governança.
- **Filtrar:** não é um exército, é filosofia. Não copiar — usar como régua de edição.
- **Veredito:** 🟢 ADOTAR COMO PRINCÍPIO — não como código. Revisão de concisão.

---

## Recomendação de ordem (quando for integrar)

1. **Ruflo** → roteamento de modelo por complexidade (ganho de custo imediato + base p/ Fase 3 / Motor de Aquisição).
2. **Superpowers** → padrão de auto-revisão no gate criativo (mata os HTML deploy bugs).
3. **Open Design** → repertório visual para `/direcao-criativa`, sob Gate de Referências + Teste Supremo.
4. **Everything Codex** → minerar só infra (memória persistente / segurança de credencial).
5. **Karpathy** → revisão de concisão do próprio AGENTS.md.

## Regra de entrada (não-negociável)
- Confirmar que não contradiz `manifesto.md` nem `alma.md`.
- Registrar em `intelligence/skill-updates.md` antes de aplicar.
- Uma skill/workflow por vez.
- Nunca importar linguagem de agência / promessa sem prova / mecânica que não aumenta conversão.

## Pendência
- [ ] **URLs reais do GitHub** dos 5 repos (nomes são ambíguos — não clonar no escuro).
- [ ] Confirmar grafia: "Superpowers" (não "Superpers"), "Ruflo/Ruufflo", "Everything Codex".
