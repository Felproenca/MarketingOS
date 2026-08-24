# Grupo: Percepção → `/perceber`

> Camada de interpretação do MarketingOS.
> Executa antes de qualquer criação.
> Não produz conteúdo. Produz clareza sobre o que merece ser produzido.

---

## Princípio do grupo

A produção só começa após a interpretação.

Antes de criar qualquer peça para uma marca, o sistema precisa responder:
1. O que esta marca deseja que as pessoas sintam?
2. Quais sinais produzem essa percepção?
3. O que torna esta marca inconfundível?

Sem essas respostas, qualquer criação é ruído bem executado.

---

## Skills do grupo

| Skill | Comando | Quando usar |
|---|---|---|
| `skill-perception-engine.md` | `/perceber [slug]` | Orquestrador — executa as 6 camadas completas para um cliente. Obrigatório antes de qualquer criação para novo cliente. |
| `skill-reverse-engineering.md` | `/reverter [url]` | Engenharia Reversa de uma obra específica. Alimenta a biblioteca semântica. |
| `skill-tension-map.md` | `/tensoes [slug]` | Mapa de tensões de conteúdo para uma marca. Substitui "sobre o que falar?" por "que conflito de percepção explorar?" |
| `skill-reference-acquisition.md` | `/adquirir [url]` | Aquisição e interpretação de referência externa. Ver `skills/perception/skill-reference-acquisition.md`. |

---

## Ordem de execução

Para novo cliente:
```
/perceber [slug]   ← executa as 6 camadas
      ↓
perception.json    ← salvo em clients/[slug]/outputs/branding/
      ↓
/criar [qualquer]  ← herda o DNA completo
```

Para referência nova:
```
/adquirir [url]    ← captura + engenharia reversa
      ↓
Validação humana   ← apenas tension + principio
      ↓
Biblioteca         ← intelligence/reference-library/
```

Para estratégia de conteúdo:
```
/tensoes [slug]    ← mapa de tensões da marca
      ↓
Calendário de conflitos de percepção
      ↓
/criar [post|carrossel|reel]
```

---

## Contexto mínimo necessário para qualquer skill deste grupo

Carregar sempre:
- `alma.md` (raiz)
- `intelligence/reference-library/reference-taxonomy.md`

Carregar conforme a skill:
- `clients/[slug]/client.md` — para skills de cliente específico
- `clients/[slug]/outputs/branding/visual-dna.json` — se existir
- `intelligence/reference-library/index.json` — para matching

NÃO carregar sem necessidade: campaigns.md, runs.md, metrics.json, posts existentes.
