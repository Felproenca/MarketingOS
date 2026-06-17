---
name: skill-parcerias
version: "1.0"
group: aquisicao
command: /prospectar parcerias
inputs:
  required: [virada-aquisicao.md, clients/felipe-proenca/icp.md]
  optional: [intelligence/repertoire-updaters/acquisition.md]
env: []
---

# skill-parcerias.md — Parcerias como Canal de Aquisição
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Doutrina: `virada-aquisicao.md` — parceiros são multiplicadores, não executores concorrentes.

---

## Contexto mínimo necessário
→ virada-aquisicao.md — seção Parcerias + Nova Definição
→ clients/felipe-proenca/icp.md — para reconhecer o cliente final por trás do parceiro
→ NÃO carregar: metrics.json, brand-kit.json, perception.json, visual-dna.json, campaigns.md

---

## Objetivo da Skill

Estruturar a prospecção e a proposta para parceiros que já atendem empresas
com gargalos de aquisição — e posicionar o MarketingOS **antes da execução deles**:

- Mapear parceiros potenciais por tipo e por carteira de clientes
- Construir a abordagem que não compete com o serviço do parceiro
- Definir o formato de colaboração (quem entrega o quê, quando)

---

## A lógica central

```text
Todo parceiro tem clientes com gargalos de aquisição.
O parceiro executa (tráfego, social, site, design, consultoria).
Mas execução sem diagnóstico amplifica o gargalo — não o remove.

O MarketingOS entra ANTES da execução:
diagnostica o gargalo → o parceiro executa com direção.

O parceiro não perde o cliente. Ganha direção, retenção e resultado.
O MarketingOS não disputa a execução. Vende a camada que a torna válida.
```

---

## Tipos de parceiro

| Parceiro | O que ele já entrega | O que ganha com o MarketingOS |
|---|---|---|
| Agência de tráfego | Mídia paga | Diagnóstico que explica por que a campanha não converte — antes de queimar verba |
| Social media | Conteúdo e presença | Direção editorial por gargalo, não por calendário |
| Desenvolvedor | Site e sistema | Posicionamento e funil para o site não nascer mudo |
| Designer | Identidade visual | Percepção e DNA visual que dão critério ao design |
| Consultor | Estratégia de negócio | Camada de aquisição observável para sustentar a consultoria |

---

## Cadeia de abordagem (5 camadas — adaptada a parceiro)

```text
1. Sinal
   O parceiro tem clientes ativos cuja aquisição depende da execução dele?
   (portfólio público, cases, clientes citados, posts)

2. Dor
   O que ele teme: perder cliente por falta de resultado,
   virar commodity de execução, competir por preço.

3. Desejo
   Reter clientes por mais tempo, cobrar mais pela mesma entrega,
   ter argumento de resultado que não depende só dele.

4. Prova
   Um diagnóstico real (anonimizado) ou demo do mapa de aquisição —
   mostrar o que ele passaria a entregar junto.

5. Próximo passo
   Pequeno: rodar um diagnóstico em UM cliente da carteira dele, junto.
   Nunca: "vamos fechar uma parceria" como primeira mensagem.
```

---

## A pergunta que abre a conversa

Nunca: "Quer fechar uma parceria?"
Nunca: "Posso automatizar a entrega de vocês?"

Sempre:
> "Quantos clientes da sua carteira sabem exatamente por que a aquisição deles não é previsível?"

O parceiro reconhece na hora os clientes que cobram resultado dele
sem ter um sistema que o sustente.

---

## Formato de colaboração

```text
Degrau 1 — Diagnóstico piloto
Um cliente da carteira do parceiro. MarketingOS diagnostica, parceiro acompanha.

Degrau 2 — Caso conjunto
Diagnóstico vira plano priorizado. O parceiro executa a parte dele com direção.
Resultado documentado vira prova para os dois.

Degrau 3 — Fluxo recorrente
Todo cliente novo do parceiro passa pelo diagnóstico antes da execução.
Formato comercial (indicação, revenue share, white label) definido pelo Felipe —
esta skill estrutura a conversa, não fecha o contrato.
```

---

## Regras de Qualidade

1. **Nunca posicionar o MarketingOS como executor concorrente** — se a conversa virar disputa de escopo, a parceria morreu
2. **O diagnóstico piloto é em cliente real do parceiro** — demo abstrata não converte parceiro
3. **O parceiro aparece como autor junto** — o cliente final é dele; o MarketingOS é a camada, não a fachada
4. **Termos comerciais não são inventados pela skill** — propor estrutura, deixar números para o Felipe
5. **Registrar cada parceiro abordado** em `clients/felipe-proenca/outputs/inteligencia/parcerias.md` — sinal, abordagem, resposta, status

---

## Checkpoints

⏸ **CP1 — Mapa de parceiros aprovado**
Lista de parceiros potenciais com sinal e carteira estimada → aprovar antes de redigir abordagem.

⏸ **CP2 — Abordagem aprovada**
Mensagem de abertura por parceiro → aprovar antes de enviar (regra do sistema: nada é enviado automaticamente).

---

## Checklist antes de entregar

- [ ] O parceiro tem carteira ativa com clientes do perfil ICP?
- [ ] A abordagem abre com gargalo da carteira dele, não com proposta de parceria?
- [ ] Está claro o que o parceiro ganha (retenção, ticket, argumento)?
- [ ] O próximo passo é um diagnóstico piloto em um cliente real?
- [ ] A skill não prometeu termo comercial que o Felipe não definiu?
- [ ] Registro criado/atualizado em `outputs/inteligencia/parcerias.md`?

---

## Exemplo de Ativação

```
Use a skill-parcerias.md.

Tipo de parceiro: [tráfego / social media / dev / designer / consultor / todos]
Região ou nicho da carteira: [opcional]
Objetivo: [mapear parceiros / redigir abordagem / estruturar piloto]
```

---

*Skill v1.0 — MarketingOS — nascida da virada-aquisicao.md (2026-06-12)*
