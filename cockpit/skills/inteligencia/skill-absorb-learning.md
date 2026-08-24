# skill-absorb-learning

**Absorve inteligência externa e atualiza a base de conhecimento do MarketingOS.**

---

## Quando usar

Quando o EcosystemCore entrega um contrato `learning_decision` no mailbox do MarketingOS,
esta skill processa o payload e atualiza os ativos de inteligência relevantes.

Gatilhos:
- Instagram Content Distiller publicou análise (`--publish`)
- FluxOS registrou performance de conteúdo
- Qualquer sistema publicou um aprendizado estruturado

---

## O que faz

1. **Lê o contrato** `learning_decision` do mailbox
2. **Classifica o aprendizado** por tipo e relevância
3. **Atualiza a base de conhecimento** apropriada:
   - Padrões de conteúdo → `intelligence/patterns.md`
   - Referências visuais → `intelligence/visual-references.json`
   - Benchmarks de performance → `intelligence/benchmarks.json`
   - Doutrinas de operação → `intelligence/doutrina-instagram-operacao.md`
4. **Gera recomendações** para o time:
   - Se `decision === "retain"`: adiciona ao repertório ativo
   - Se `decision === "revise"`: sugere ajustes em campanhas existentes
   - Se `decision === "defer"`: arquiva para revisão futura
5. **Notifica** via EcosystemCore `performance_event`

---

## Modos de operação

### Modo automático (via mailbox watcher)
```bash
# EcosystemCore entrega no mailbox, esta skill processa
npm run watch:mailbox  # no EcosystemCore
```

### Modo manual
```bash
# Processar um contrato específico
npm run cmd -- /absorver --contract <caminho-do-contrato.json>
```

---

## Mapeamento: learning_decision → ativos MarketingOS

| Campo do contrato | Destino no MarketingOS |
|---|---|
| `payload.content_dna.formats` | `intelligence/patterns.md` — formatos detectados |
| `payload.content_dna.hooks` | `intelligence/copy-references.json` — hooks |
| `payload.content_dna.replicable_patterns` | `skills/criacao/` — novos templates |
| `payload.content_dna.improvements` | `clients/<slug>/estrategia.md` — pontos de melhoria |
| `payload.insights` | `intelligence/repertoire-externo/` — referências |
| `payload.metrics` | `intelligence/benchmarks.json` — benchmarks |
| `payload.recommendations` | `clients/<slug>/runs.md` — ações recomendadas |

---

## Exemplo

**Entrada** (learning_decision do Instagram Distiller):
```json
{
  "contract_type": "learning_decision",
  "decision": "retain",
  "payload": {
    "content_dna": {
      "formats": ["tutorial", "story"],
      "hooks": ["curiosity_gap", "direct_address"],
      "replicable_patterns": [
        "Abrir com pergunta direta para engajar",
        "Carrossel de 5 slides — estrutura sequencial mapeada"
      ]
    },
    "insights": [
      "🎓 Conteúdo educacional domina — audiência busca aprendizado prático"
    ],
    "source_kind": "instagram_post"
  }
}
```

**Ação**:
1. ✅ Padrão "Abrir com pergunta direta" → adicionado a `intelligence/patterns.md`
2. ✅ Formato "tutorial" + "story" → registrado em `intelligence/copy-references.json`
3. ✅ Template de carrossel 5 slides → `skills/criacao/skill-carousel.md`
4. ✅ Insight → `intelligence/repertoire-externo/instagram/`
5. 📬 Notificação → "Novo padrão de conteúdo absorvido: tutorial + curiosity_gap"

---

## Regras

1. Nunca sobrescrever inteligência existente sem revisão humana
2. Todo aprendizado absorvido gera uma entrada datada em `runs.md`
3. Se o `decision` for "discard", apenas registrar que foi avaliado e descartado
4. Padrões conflitantes com a `alma.md` ou `manifesto.md` são sinalizados, não aplicados
