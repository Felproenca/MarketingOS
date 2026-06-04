---
name: skill-social-copy
version: "1.0"
group: criacao
command: /criar copy-agent
inputs:
  required: [client.md]
  optional: [alma.md, notes.md, intelligence/benchmarks.json]
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
      "angulo_usado": ""
    }
  ]
}
```

---

## Regras

- Comecar pelo que a pessoa sente, nao pelo produto.
- Evitar qualquer frase que poderia ser de outra marca.
- Usar palavras internas do nicho sem virar jargao vazio.
- Provar depois de provocar.
- Nao inventar dado, case ou depoimento.
- Se o objetivo for conversao, CTA deve ser acao simples e imediata.

---

## Criterio de corte

Reprovar a copy se:
- o hook comeca com "voce sabia", "5 dicas" ou promessa generica;
- a tecnologia aparece antes do problema;
- o CTA e fraco ou generico;
- a copy nao respeita restricoes de `client.md`;
- nao existe diferenca clara entre as variacoes.

