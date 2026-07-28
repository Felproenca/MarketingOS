---
name: skill-video-ai
version: "1.0"
group: criacao
command: /criar video
inputs:
  required: [client.md]
  optional: [brand-intelligence.json, brand-kit.json]
env:
  optional: [SYNTHESIA_API_KEY, ELEVENLABS_API_KEY]
---

# skill-video-ai.md — Geração de Vídeo com IA
> Skill isolada do MarketingOS.
> Gera vídeos profissionais usando IA ( Synthesia, ElevenLabs, Pollinations).
> Integra geração de vídeo com o pipeline de campanhas.

---

## Por que esta skill existe

Vídeo é o formato que mais engaja em 2025-2026. Mas:
- Produção de vídeo tradicional é cara e lenta
- Synthesia tem 240+ avatares em 160+ idiomas
- ElevenLabs tem vozes ultra-realistas
- A convergência de vídeo IA + automação de marketing está chegando

Esta skill integra essas ferramentas no pipeline do MarketingOS.

---

## Contexto mínimo necessário

```
→ client.md — blocos 1 e 2 (negócio, persona)
→ brand-intelligence.json — voz + estilo (se existir)
→ brand-kit.json — cores, tipografia (se existir)
→ NÃO carregar: metrics.json, campaigns.md, notes.md
```

---

## Tipos de Vídeo Suportados

| Tipo | Descrição | Ferramenta | Duração |
|---|---|---|---|
| **Talking Head** | Avatar IA falando | Synthesia | 30s-5min |
| **Voiceover** | Narração + imagens/motion | ElevenLabs + Playwright | 15s-3min |
| **Motion Graphics** | Tipografia animada + dados | HyperFrames | 5s-30s |
| **Reel Animado** | Texto revelado + motion | Playwright + GSAP | 15s-60s |
| **Demo de Produto** | Telas + narração | Playwright + ElevenLabs | 30s-2min |
| **Testemunho** | Avatar + depoimento | Synthesia | 15s-60s |

---

## Workflow de 5 Passos

### Passo 1 — Briefing do Vídeo

```json
{
  "briefing": {
    "tipo": "",
    "objetivo": "",
    "publico_alvo": "",
    "mensagem_central": "",
    "duracao_alvo": "",
    "canal_destino": "instagram_reels | youtube | tiktok | site | email",
    "tom": "",
    "referencias": []
  }
}
```

---

### Passo 2 — Roteiro

```json
{
  "roteiro": {
    "cena_1": {
      "duracao": "0-5s",
      "tipo": "gancho",
      "texto": "",
      "visual": "",
      "audio": ""
    },
    "cena_2": {
      "duracao": "5-15s",
      "tipo": "problema",
      "texto": "",
      "visual": "",
      "audio": ""
    },
    "cena_3": {
      "duracao": "15-30s",
      "tipo": "solucao",
      "texto": "",
      "visual": "",
      "audio": ""
    },
    "cena_4": {
      "duracao": "30-45s",
      "tipo": "prova",
      "texto": "",
      "visual": "",
      "audio": ""
    },
    "cena_5": {
      "duracao": "45-60s",
      "tipo": "cta",
      "texto": "",
      "visual": "",
      "audio": ""
    }
  }
}
```

**Estrutura de roteiro por tipo:**

| Tipo | Estrutura Recomendada |
|---|---|
| Talking Head | Gancho → Problema → Solução → Prova → CTA |
| Voiceover | Contexto → Dados → Benefício → Depoimento → CTA |
| Motion Graphics | Dado impactante → Contexto → Comparação → Resultado → CTA |
| Demo | Problema → Features → Benefício → Preço → CTA |

---

### Passo 3 — Geração de Ativos

#### Para Talking Head (Synthesia):
```json
{
  "synthesia": {
    "avatar": "",
    "idioma": "",
    "voz": "",
    "background": "cor_simples | imagem | video",
    "background_url": "",
    "template": "circle_crop | full_frame | side_by_side",
    "texto": "",
    "assets_adicionais": [
      {"tipo": "texto_tela", "conteudo": "", "tempo": "5s"},
      {"tipo": "imagem", "url": "", "tempo": "15s"}
    ]
  }
}
```

#### Para Voiceover (ElevenLabs):
```json
{
  "elevenlabs": {
    "voz": "",
    "idioma": "",
    "estabilidade": 0.5,
    "similaridade": 0.75,
    "texto": "",
    "efeitos": ["pausa", "ênfase", "risada"]
  }
}
```

#### Para Motion/Reel (Playwright):
```json
{
  "playwright": {
    "engine": "hyperframes",
    "cenas": [],
    "transicoes": ["crossfade", "wipe", "reveal"],
    "audio": "voz_gerada | bgm_local | silence",
    "resolucao": "1080x1920",
    "fps": 30
  }
}
```

---

### Passo 4 — Renderização

```bash
# Talking Head (Synthesia)
# Requer API key configurada
npm run video:synthesia -- --slug <slug> --script roteiro.json

# Voiceover (ElevenLabs + Playwright)
npm run video:voiceover -- --slug <slug> --voice <voz> --script roteiro.json

# Motion Graphics (HyperFrames)
npx hyperframes render --input motion.html --output video.mp4

# Reel Animado (Playwright)
npm run reel:render -- --slug <slug> --input reel-input.json
```

---

### Passo 5 — Pós-Produção

```json
{
  "pos_producao": {
    "legendas": {
      "gerar": true,
      "idioma": "",
      "estilo": "default | kinetic | minimal",
      "fonte": ""
    },
    "musica": {
      "tipo": "nenhuma | bgm_leve | bgm_energetico",
      "arquivo": "",
      "volume": 0.3
    },
    "thumbnail": {
      "gerar": true,
      "estilo": "frame_destaque | texto_overlay | rosto_avatar"
    },
    "formatos_saida": [
      {"formato": "mp4_9_16", "uso": "reels_stories"},
      {"formato": "mp4_1_1", "uso": "feed"},
      {"formato": "mp4_16_9", "uso": "youtube_site"}
    ]
  }
}
```

---

## Output Structure

```
clients/[slug]/outputs/videos/
├── [nome-video]/
│   ├── briefing.json      → briefing do vídeo
│   ├── roteiro.json       → roteiro cenário a cenário
│   ├── assets/            → ativos gerados
│   │   ├── audio.mp3      → voz gerada
│   │   ├── frames/        → frames do vídeo
│   │   └── thumbnails/    → thumbnails
│   ├── video_final.mp4    → vídeo renderizado
│   ├── legendas.srt       → legendas
│   └── metadata.json      → metadados do vídeo
└── registry.json          → lista de vídeos produzidos
```

---

## Integração com outras skills

| Skill | Relação |
|---|---|
| brand-intelligence | Fornece voz + estilo para avatar/narração |
| skill-visual-spec | Define direção visual das cenas |
| skill-social-copy | Gera roteiros de copy para vídeos |
| skill-reels | Motor de renderização de reels |
| skill-publicar | Publica vídeo gerado |

---

## Comando

```
/criar video [tipo]           → criar vídeo com IA
/criar video talking [tema]   → talking head rápido
/criar video voiceover [tema] → voiceover + motion
/criar video demo [produto]   → demo de produto
/criar video listar           → vídeos produzidos
```

---

## Anti-padrões

- **NUNCA** usar vozes/avatars sem licença verificada
- **NUNCA** gerar vídeo sem roteiro aprovado
- **NUNCA** publicar vídeo sem legendas (acessibilidade)
- **SEMPRE** respeitar brand-intelligence.json para avatar/voz
- **SEMPRE** gerar múltiplos formatos (9:16, 1:1, 16:9)
- **SEMPRE** incluir CTA no vídeo

---

*Vídeo com IA não é atalho. É escala com qualidade.*
