# estrategia.md — Felipe Proença
> Rebriefing julho/2026. Consolidação pós-fase de validação.

---

## Foco Atual (julho/2026)

**Objetivo:** Fechar e operar o primeiro cliente real

**Prioridades desta fase:**
1. Fechar primeiro cliente — prioridade absoluta
2. Deploy do site como hub de conversão
3. Documentar o primeiro caso como prova pública
4. Escalar com Meta Ads após validação do serviço

**Próxima fase (agosto/2026):**
- Primeiro caso documentado e publicado
- Meta Ads para escalar aquisição
- Expansão para LATAM com multi-language motor

**KPIs desta fase:**
- Cliente fechado e operando
- Site no ar com taxa de conversão
- Caso documentado com métricas reais

---

## Grade de conteúdo

- [x] Grade 1 — Posts 01—09 publicados (2026-05-22)
- [x] Grade 2 — Posts 10—18 publicados
- [ ] Grade 3 — descontinuada no formato antigo. Substituída pela linha editorial pós-pesquisa de campo (2026-07-28) — ver abaixo. Histórico de posts permanece publicado, não é excluído.

---

## Linha editorial — motor de conteúdo-isca (2026-07-28, corrigida)

**Correção do mesmo dia:** a primeira versão desta seção (pesquisa de campo genérica de
mercado) empurrou pra baixo volume/lo-fi — errado, revertido. Felipe trouxe 3 referências
reais de carrossel que engajam e geram resultado (`design.deb`, ecommerce de moda,
`@renatoduran07`) e a leitura certa é outra: **conteúdo-isca**.

**O que é conteúdo-isca:** um ativo real e usável (prompt, checklist, template, mini-ferramenta)
entregue com autenticidade, em alto volume, com design que chama atenção — não conteúdo
*sobre* o MarketingOS, conteúdo que *ensina o método* pra resolver um problema real do ICP.
O sistema não é o herói do slide. O caminho é. Ver `brand-kit.json` →
`layout_patterns.tutorial_isca` para a especificação visual (fora do dark/gold, formato
próprio pra esse tipo de peça).

**Mecanismo (já batido com a Doutrina de Aquisição 2026, `intelligence/doctrine-aquisicao-2026.md`):**
Carrossel-isca → CTA de palavra-chave no comentário → DM automática entrega o próximo nível
→ conversa humana → oferta. Motor técnico já existe: `scripts/dm-engine/` (comentário→DM,
webhook Meta, captura de lead) — testado localmente, **bloqueado em deploy** (token 60d,
Dockerfile, webhook no app Meta — 4 passos só o Felipe faz, ver `scripts/dm-engine/DEPLOY.md`).
Isso é o gargalo real pra essa linha gerar lead de verdade, não o formato do conteúdo.

**Primeiro ativo (2026-07-28):** prompt de diagnóstico de aquisição — versão em prompt do
`outputs/lead-magnet/diagnostico.html` já existente (6 perguntas, score real por dimensão,
gargalo = menor score — mesma lógica, sem inventar nada novo). Entregue completo e copiável
dentro do próprio carrossel, formato tutorial_isca inspirado em `@renatoduran07`
(passo a passo numerado, fundo cru, ativo exposto na tela, não escondido atrás do CTA).

**O que evitar:**
- Mostrar o MarketingOS/dashboard como prova em vez de mostrar o método funcionando
- Prometer ativo no gancho e não entregar completo dentro do carrossel
- Print de tela forjado — se não for captura real, estilizar como ilustração, nunca fingir
- Volume baixo por "pureza" de formato — o motor de isca pede cadência alta, sustentável

---

## Princípios operacionais de conteúdo

**Brand Intelligence Layer (2026-07-27):**
Todo output agora passa por brand-intelligence.json — voz, estilo, audiência e restrições
consolidados. Nenhum output sai sem coerência com o brand-intelligence.

**Virada de Aquisição (2026-06-12):**
O conteúdo existe para demonstrar capacidade de diagnóstico, não de produção.

**Distribuição editorial 70/20/10:**
- 70% problemas universais — aquisição, crescimento, posicionamento, sistemas
- 20% build in public — evolução do MarketingOS, decisões, aprendizados
- 10% casos específicos — clínicas, advogados, consultores

**Regra 10x:**
> Entregue 10 vezes antes de sacar 1. Quem entrega valor de verdade ganha o direito de vender.

**Canais prioritários:**
1. Instagram — reels + carrossel + stories
2. Site — hub de conversão (deploy urgente)
3. LinkedIn — prospecção B2B
4. YouTube — autoridade e SEO (fase futura)

---

## Posicionamento do perfil pessoal

**Mensagem central:** Felipe transforma negócios que parecem comuns em marcas que
são percebidas, lembradas e compradas.

**Rosto no sistema (não negociável):** design escuro e textos fortes são apoio, nunca
substituto — o perfil precisa de rosto, voz, opiniões, raciocínio, decisões,
bastidores, erros, mudanças de direção, análises e resultados reais.

**5 pilares:**
1. Percepção — por que negócios parecem valiosos ou genéricos
2. Estratégia — como Felipe pensa
3. Execução real — documentar clientes em andamento
4. Prova — antes/depois, caso, depoimento
5. Convite — oferta como consequência lógica

---

## Direção atual — Build in Public + Brand Intelligence

**Ângulo:** Parar de vender resultado, começar a mostrar processo em tempo real.
Honesto. Único. Constrói credibilidade sem precisar de prova que ainda não existe.

**Novidade:** Brand Intelligence Layer ativo — toda comunicação agora passa por
voice, estilo, audiência e restrições consolidados em brand-intelligence.json.

---

## Próximas ações

**Imediato — primeiro cliente:**
- [ ] Fechar primeiro cliente real — prioridade absoluta
- [ ] Deploy do site como hub de conversão
- [ ] Documentar primeiro caso como prova pública

**Sistema — atualizações:**
- [ ] Atualizar grade de conteúdo baseado em brand-intelligence.json
- [ ] Gerar conteúdo multi-language para mercados LATAM
- [ ] Rodar AEO monitor para otimizar presença em AI answers

**Operacional — continuidade:**
- [ ] Renovar token Meta/Instagram
- [ ] Ativar discovery engine para prospecção automatizada
- [ ] Configurar agent-builder para atendimento automatizado
