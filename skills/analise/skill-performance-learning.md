---
name: skill-performance-learning
version: "1.0"
group: analise
command: /analisar aprendizado
inputs:
  required: [metrics.json, campaigns.md]
  optional: [published.json, notes.md, intelligence/benchmarks.json]
env:
  optional: [SOCIAL_AGENT_URL]
---

# skill-performance-learning.md - Performance Agent como Skill
> Converte `PerformanceAgent` e `analytics_insights` em aprendizado operacional.
> Use para transformar metricas em decisoes, atualizar inteligencia e enviar
> aprendizado ao motor social.

---

## Contexto minimo necessario

Carregar apenas:
- `metrics.json` - canal/formato analisado
- `campaigns.md` - campanhas ligadas ao periodo
- `published.json` - se for enviar aprendizado ao motor
- `notes.md` - apenas aprendizados anteriores sobre o mesmo tema

Nao carregar:
- `brand-kit.json`
- arquivos de criacao
- outputs completos, exceto o post analisado

---

## Analise obrigatoria

Responder:
- O que performou acima do normal?
- O que performou abaixo?
- Qual hook gerou mais sinal de negocio?
- Qual formato deve ser repetido?
- Qual formato deve ser pausado?
- O que vira regra em `notes.md` ou `intelligence/patterns.md`?

---

## Enviar aprendizado ao motor

Quando houver `published.json` com metricas:

```bash
npm run aprender -- --slug <slug> --min-age-hours 48
```

Dry-run:

```bash
npm run aprender -- --slug <slug> --min-age-hours 48 --dry-run
```

---

## Regras

- Nao tratar curtida como resultado final.
- Priorizar sinais de negocio: lead, DM, clique, salvamento qualificado, resposta.
- Indicar dado real vs inferencia.
- Nao atualizar `metrics.json` sem fonte.
- Se virar padrao reutilizavel, sugerir salvar em `notes.md` ou `intelligence/patterns.md`.

