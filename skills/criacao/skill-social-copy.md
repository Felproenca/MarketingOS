---
name: skill-social-copy
version: "1.1"
group: criacao
command: /criar copy-agent
inputs:
  required: [client.md]
  optional: [alma.md, notes.md, intelligence/benchmarks.json, intelligence/repertoire-updaters/ai-marketing-claude-code-skills.md, intelligence/repertoire-updaters/marketingskills.md]
env: []
---

# skill-social-copy.md - Copy Agent como Skill
> Converte o `CopyAgent` do motor em contrato operacional do MarketingOS.
> Use para gerar variacoes de copy por plataforma com nicho, angulo, hook,
> corpo, CTA, hashtags e formato recomendado.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - persona, tom, restricoes, oferta
- `notes.md` - somente se houver mapa de nicho/angulo aprovado
- `intelligence/benchmarks.json` - somente bloco do canal/formato
- `intelligence/repertoire-updaters/ai-marketing-claude-code-skills.md` - apenas linhas sobre voice-extractor, de-ai-ify, content-idea-generator, social-card-gen e linkedin-authority-builder, se estiver aplicando repertorio externo
- `intelligence/repertoire-updaters/marketingskills.md` - apenas linhas sobre social, copywriting, copy-editing e customer-research, se estiver aplicando repertorio externo

Nao carregar:
- `brand-kit.json`, exceto se a copy depender do visual
- `metrics.json`, exceto se for reescrita orientada por performance
- codigo Python do `CopyAgent`, exceto para depurar comportamento do motor

---

## Entrada

```text
Cliente: [slug]
Plataforma: instagram | linkedin | tiktok | youtube | x
Objetivo: awareness | autoridade | conversao | relacionamento
Tema: [tema]
Angulo: [mapa de nicho ou angulo informado]
Variacoes: [1-5]
CTA: [acao desejada]
```

Se nao houver angulo, executar `skill-niche-intelligence.md` antes.

---

## Saida obrigatoria

Retornar uma lista de variacoes:

```json
{
  "copies": [
    {
      "hook": "",
      "body": "",
      "cta": "",
      "hashtags": [],
      "format": "",
      "estimated_read_time": 0,
      "angulo_usado": "",
      "voice_match_score": 0,
      "humanidade_check": "",
      "plataforma_reasoning": "",
      "reprovado_por": []
    }
  ]
}
```

---

## Motor de Voz v1.1

Antes de escrever, extrair a voz do cliente em 4 camadas:

```text
Energia:
-> Como a marca soa quando fala naturalmente? Direta, cuidadosa, provocadora, tecnica, intima?

Vocabulário vivo:
-> Palavras, frases e imagens que aparecem no cliente, nos clientes dele ou no nicho.

Ritmo:
-> Frases curtas ou explicativas? Pausas? Perguntas? Afirmações secas? Histórias?

Anti-voz:
-> O que faz o texto parecer IA, agência, palestra ou commodity?
```

Se nao houver amostras suficientes de voz, declarar:

```text
Voz inferida: sim
Fonte da inferencia: client.md / notes.md / nicho / oferta
Risco: alto | medio | baixo
```

Nao fingir que a voz foi extraida quando ela foi apenas inferida.

---

## Filtro De-AI-ify

Antes de entregar, remover:

```text
frases de IA: "no mundo de hoje", "solucao completa", "transforme sua presenca"
corporativismo: "excelencia", "inovacao", "qualidade", "atendimento personalizado" sem prova
promessa sem corpo: "resultados incriveis", "cresca mais", "alcance seu potencial"
transicoes plasticas: "alem disso", "vale ressaltar", "em resumo" quando soam artificiais
estrutura de template: gancho generico + lista + CTA obvio
```

Adicionar:

```text
frase que uma pessoa real diria
detalhe especifico do nicho
imagem concreta do problema
pequena imperfeicao humana quando combinar com a marca
prova ou observacao real antes da conclusao
```

---

## Raciocinio por plataforma

Cada plataforma muda o formato, nao a alma:

```text
Instagram:
-> gancho sensorial ou dor imediata; legenda curta/media; CTA simples.

LinkedIn:
-> tese, historia ou ponto de vista; menos performatico; autoridade sem pose.

TikTok/Reels:
-> primeira frase falada; conflito visivel; corte rapido; uma ideia por video.

YouTube:
-> promessa clara + curiosidade; estrutura de retenção; titulo e abertura alinhados.

X:
-> uma ideia afiada; sem enfeite; thread so se houver progressao real.
```

Nao crosspostar o mesmo texto com pequenas trocas.
Gerar adaptacao nativa por plataforma.

---

## Ideias por posicionamento

Quando faltar ideia, gerar a partir de um destes 6 motores:

```text
1. Problema nomeado
   "O que o cliente sente mas ainda nao sabe explicar?"

2. Bastidor real
   "O que esta acontecendo no processo que provaria cuidado?"

3. Contrario do mercado
   "O que todo mundo esta fazendo errado nesse nicho?"

4. Prova explicada
   "Qual resultado, detalhe ou comparacao mostra substancia?"

5. Objecao antecipada
   "O que impede a pessoa de comprar ou agir?"

6. Identidade
   "Que tipo de pessoa se reconhece nessa marca?"
```

---

## Regras

- Comecar pelo que a pessoa sente, nao pelo produto.
- Evitar qualquer frase que poderia ser de outra marca.
- Usar palavras internas do nicho sem virar jargao vazio.
- Provar depois de provocar.
- Nao inventar dado, case ou depoimento.
- Se o objetivo for conversao, CTA deve ser acao simples e imediata.
- Explicar em `plataforma_reasoning` por que o formato escolhido serve ao canal.
- Dar `voice_match_score` de 0 a 10; abaixo de 7, reescrever antes de entregar.
- Se a copy parece IA, reescrever antes de mostrar.
- Variacoes precisam ter angulos diferentes, nao sinonimos do mesmo texto.

---

## Criterio de corte

Reprovar a copy se:
- o hook comeca com "voce sabia", "5 dicas" ou promessa generica;
- a tecnologia aparece antes do problema;
- o CTA e fraco ou generico;
- a copy nao respeita restricoes de `client.md`;
- nao existe diferenca clara entre as variacoes.
- `voice_match_score` ficou abaixo de 7;
- o texto usa vocabulario que a marca nunca usaria;
- a plataforma nao justifica o formato.
