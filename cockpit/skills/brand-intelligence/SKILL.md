---
name: brand-intelligence
version: "1.0"
group: system
command: /brand-intel
inputs:
  required: [client.md, brand-kit.json]
  optional: [notes.md, intelligence/visual-references.json, intelligence/copy-references.json]
env: []
---

# Brand Intelligence Layer — Cérebro de Marca Unificado
> Camada centralizada que injeta identidade de marca automaticamente em todas as skills.
> Não é "mais uma skill". É a infraestrutura de coerência que todas as outras herdam.
> Equivalente funcional ao Jasper IQ / Copy.ai Brand Voice do MarketingOS.

---

## Por que esta skill existe

Antes desta skill, cada skill de criação carregava contexto de marca manualmente:
- `brand-kit.json` → paleta, tipografia, estilo
- `visual-dna.json` → direção visual herdados
- `client.md` → verdade humana, posicionamento

O problema: **não havia uma camada unificada** que garantisse que TODOS os outputs
do sistema falassem com a mesma voz, mesmo estilo, e injetassem o conhecimento
da marca automaticamente.

O resultado: outputs inconsistentes entre skills, retrabalho, dependência do operador.

Esta skill resolve isso.

---

## O que esta skill faz

1. **Consolida** a identidade de marca em um único `brand-intelligence.json`
2. **Injeta** voz, estilo, audiência e conhecimento em qualquer skill que gere output
3. **Detecta** inconsistências entre outputs de diferentes skills
4. **Adapta** a voz por plataforma mantendo coerência central

---

## Contexto mínimo necessário

```
Carregar apenas:
- client.md — blocos 1, 2, 3 e 4 completos
- brand-kit.json — identidade visual atual
- visual-dna.json — DNA visual (se existir)
- notes.md — decisões de marca anteriores (se existir)

NÃO carregar: metrics.json, campaigns.md, estrategia.md, runs.md
```

---

## Estágio 1 — Extração de Brand Intelligence

Antes de criar `brand-intelligence.json`, extrair:

### Voz da Marca
```json
{
  "voz": {
    "personalidade": "como a marca soa (3-5 adjetivos)",
    "registro": "formal | informal | técnico | emocional | provocador",
    "ritmo": "frase curta | média | longa | mista",
    "gatilhos": ["palavras que a marca SEMPRE usa"],
    "anti_gatilhos": ["palavras que a marca NUNCA usa"],
    "exemplo_fala": "como a marca falaria em 1 frase"
  }
}
```

### Audiência
```json
{
  "audiencia": {
    "icp_resumo": "quem é o cliente ideal em 1 frase",
    "nivel_formalidade": "quanto formalismo a audiência espera",
    "gatilhos_desejo": ["o que a audiência quer sentir"],
    "gatilhos_medo": ["o que a audiência quer evitar"],
    "linguagem_interna": "como a audiência fala sobre o problema"
  }
}
```

### Conhecimento da Marca
```json
{
  "conhecimento": {
    "promessa_nao_declarada": "o que a marca promete sem dizer",
    "verdade_humana": "a verdade por trás do negócio",
    "diferencial_invisivel": "o que ninguém mais faz igual",
    "contexto_historico": "marcos relevantes da marca",
    "produtos_chave": ["lista de produtos/serviços principais"],
    "objecoes_comuns": ["top 3 objeções dos clientes"]
  }
}
```

### Restrições
```json
{
  "restricoes": {
    "nunca_fazer": ["3-5 coisas que a marca jamais poderia fazer"],
    "sempre_fazer": ["3-5 coisas que a marca sempre deve fazer"],
    "compliance": ["restrições legais/regulatórias se aplicável"],
    "concorrencia": ["posicionamento vs concorrentes diretos"]
  }
}
```

---

## Estágio 2 — Geração do brand-intelligence.json

Output: `clients/[slug]/outputs/branding/brand-intelligence.json`

```json
{
  "slug": "[slug-do-cliente]",
  "generated_at": "ISO timestamp",
  "version": "1.0",
  "voz": {
    "personalidade": "",
    "registro": "",
    "ritmo": "",
    "gatilhos": [],
    "anti_gatilhos": [],
    "exemplo_fala": ""
  },
  "audiencia": {
    "icp_resumo": "",
    "nivel_formalidade": "",
    "gatilhos_desejo": [],
    "gatilhos_medo": [],
    "linguagem_interna": ""
  },
  "conhecimento": {
    "promessa_nao_declarada": "",
    "verdade_humana": "",
    "diferencial_invisivel": [],
    "contexto_historico": "",
    "produtos_chave": [],
    "objecoes_comuns": []
  },
  "restricoes": {
    "nunca_fazer": [],
    "sempre_fazer": [],
    "compliance": [],
    "concorrencia": []
  },
  "adaptacao_plataforma": {
    "instagram": {
      "tom": "",
      "extensao_copy": "",
      "formatos_preferidos": [],
      "hashtags_tone": ""
    },
    "whatsapp": {
      "tom": "",
      "extensao_mensagem": "",
      "emoji_Usage": "",
      "horario_tipico": ""
    },
    "linkedin": {
      "tom": "",
      "extensao_post": "",
      "formalismo": "",
      "hashtag_strategy": ""
    },
    "email": {
      "tom": "",
      "assunto_pattern": "",
      "extensao_corpo": "",
      "cta_tone": ""
    },
    "site": {
      "tom": "",
      "hero_mensagem": "",
      "cta_principal": "",
      "extensao_secao": ""
    }
  }
}
```

---

## Estágio 3 — Injeção em Skills

Quando qualquer skill de criação é chamada, esta skill fornece:

### Para skills de copy (skill-social-copy, skill-carousel, skill-post):
- Voz + registro + ritmo + gatilhos + anti_gatilhos
- Adaptção por plataforma
- Linguagem interna da audiência

### Para skills visuais (skill-visual-spec, skill-image-generation):
- Cores da marca + tipografia
- Personalidade visual
- Restrições visuais

### Para skills de site (skill-site-builder, premium-site):
- Tom geral + CTA principal
- Hero mensagem
- Extensão por seção

### Para skills de aquisicao (skill-lead-capture, skill-offer-positioning):
- Objeções comuns
- Gatilhos de desejo/medo
- Nível de formalidade

---

## Estágio 4 — Validação de Consistência

Antes de qualquer output final, verificar:

```
1. O output soa como esta marca? (teste da voz)
2. O output é apropriado para o canal? (teste da plataforma)
3. O output respeita as restrições? (teste de compliance)
4. O output usa a linguagem que a audiência usa? (teste da audiência)
5. O output seria reconhecível sem logo/nome? (teste supreme — de alma.md)
```

Se qualquer teste falhar → ajustar antes de entregar.

---

## Como integrar com skills existentes

### No _admin.md de criação (adicionar antes de qualquer skill):
```
3.5. Ler ../brand-intelligence/SKILL.md (injeta voz + estilo + audiência)
     OU ler brand-intelligence.json se já existe para este cliente
```

### Em qualquer skill que gere output:
```
Antes de gerar output:
1. Verificar se clients/[slug]/outputs/branding/brand-intelligence.json existe
2. Se existe → carregar como contexto
3. Se não existe → gerar primeiro usando /brand-intel
4. Aplicar voz + estilo + restrições ao output
```

### No CLAUDE.md (adicionar na seção de gates):
```
## Brand Intelligence — gate de coerência
Antes de qualquer output de conteúdo, verificar se brand-intelligence.json existe.
Se não existe → gerar com /brand-intel antes de continuar.
```

---

## Comando

```
/brand-intel              → gera brand-intelligence.json para o cliente ativo
/brand-intel [slug]       → gera para cliente específico
/brand-intel check        → valida consistência de outputs existentes
/brand-intel update       → atualiza com novas informações
```

---

## Relação com outras skills

| Skill | Relação |
|---|---|
| skill-creative-direction | Herda DNA visual; brand-intelligence injeta voz |
| skill-branding | Alimenta brand-kit.json com dados de voz/audiência |
| skill-social-copy | Usa voz + plataforma para gerar copy coerente |
| skill-visual-spec | Usa cores + tipografia + personalidade visual |
| skill-site-builder | Usa tom + CTA + hero mensagem |
| skill-lead-capture | Usa objeções + gatilhos + formalidade |
| funnel-strategy | Usa ICP + conhecimento para metadata de funil |

---

## Anti-padrões

- **NUNCA** gerar output sem verificar brand-intelligence.json primeiro
- **NUNCA** inventar voz/estilo — extrair de client.md + brand-kit.json
- **NUNCA** pular validação de consistência
- **SEMPRE** adaptar por plataforma mantendo coerência central
- **SEMPRE** respeitar restrições e compliance

---

*Marca coerente não é acaso. É infraestrutura.*
