---
name: multi-lang
version: "1.0"
group: system
command: /idioma
inputs:
  required: [client.md]
  optional: [brand-intelligence.json, cultural-playbook]
env: []
---

# Multi-Language Motor — Adaptação Cultural Integrada
> Motor nativo de geração de conteúdo multi-idioma com adaptação cultural.
> Não é tradução automática. É re-criação cultural mantendo a alma da marca.
> Opera sobre os cultural-playbooks existentes + brand-intelligence.json.

---

## Por que este motor existe

O MarketingOS já possui:
- `skills/funnel-strategy/cultural-playbooks/` — 6 playbooks culturais (Brasil/LATAM, China, Japão, Coreia, EUA/Europa, Emerging Markets)
- `skills/brand-intelligence/` — voz, estilo, audiência da marca

O que faltava: **um motor que conecta os dois** e gera conteúdo adaptado culturalmente
para múltiplos idiomas, mantendo coerência com a marca.

---

## O que este motor faz

1. **Detecta** o idioma/alvo do conteúdo solicitado
2. **Carrega** o cultural-playbook correspondente
3. **Cruza** com brand-intelligence.json (voz + restrições)
4. **Gera** conteúdo adaptado (não traduzido) para o idioma/alvo
5. **Valida** se a adaptação respeita a marca e o mercado

---

## Idiomas Suportados

| Código | Idioma | Mercado | Playbook |
|---|---|---|---|
| `pt-BR` | Português (Brasil) | Brasil | `brazil-latam.md` |
| `es` | Espanhol | LATAM (exceto Brasil) | `brazil-latam.md` (adaptado) |
| `en` | Inglês | EUA/Europa | `usa-europe.md` |
| `zh` | Mandarim | China | `china.md` |
| `ja` | Japonês | Japão | `japan.md` |
| `ko` | Coreano | Coreia | `korea.md` |
| `id` | Bahasa | Emerging Markets | `emerging-markets.md` |

---

## Fluxo de Trabalho

### 1. Entrada
```
/idioma [idioma-alvo] [tipo-conteudo]
```

Exemplos:
```
/idioma en post          → post em inglês para mercado americano
/idioma zh carrossel     → carrossel em mandarim para mercado chinês
/idioma es reel          → reel em espanhol para LATAM
```

### 2. Detecção Automática
Se o cliente tem `brand-intelligence.json`:
- Carregar `adaptacao_plataforma` para o idioma/alvo
- Carregar cultural-playbook correspondente
- Cruzar com `voz` e `restricoes`

### 3. Adaptação Cultural (não tradução)

**Regras de adaptação:**

```text
1. Voz → mantém personalidade, adapta registro
   Ex: "informal brasileiro" → "casual american" (não "formal english")

2. Gatilhos → substitui por equivalentes culturais
   Ex: "prova social" no Brasil → "testimonials" nos EUA
   Ex: "urgência" no Brasil → "scarcity" nos EUA

3. Formatos → adapta para o que funciona no mercado
   Ex: WhatsApp flow no Brasil → Email nurture nos EUA
   Ex: Carrossel no Instagram → Thread no Twitter/X

4. Horários → respeita fuse horário e hábitos de consumo
   Ex: Brasil 19h-22h → EUA 12h-15h (lunch break)

5. Compliance → respeita regulamentação local
   Ex: LGPD (Brasil) → GDPR (Europa) → CCPA (EUA)

6. Moeda → adapta valores e formatação
   Ex: R$ 97 → $19.70 → ¥1,280
```

### 4. Geração de Conteúdo

O motor gera:
- **Copy** adaptada (não traduzida) para o idioma/alvo
- **CTA** proporcional à fricção do mercado
- **Formato** recomendado para o canal no mercado-alvo
- **Horário** de publicação otimizado
- **Hashtags/keywords** nativas do mercado

### 5. Validação

```
1. O conteúdo soa natural para um nativo deste idioma?
2. Os gatilhos culturais estão corretos para este mercado?
3. O formato é o que funciona neste canal/mercado?
4. A marca está sendo representada corretamente?
5. Não há offensas culturais ou mal-entendidos?
```

---

## Template de Output

```json
{
  "idioma_alvo": "",
  "mercado_alvo": "",
  "cultural_playbook": "",
  "conteudo_gerado": {
    "copy": "",
    "cta_principal": "",
    "cta_secundario": "",
    "formato_recomendado": "",
    "hashtags": [],
    "horario_publiacao": "",
    "moeda_local": "",
    "adaptacoes_culturais": []
  },
  "validacao": {
    "naturalidade": "",
    "gatilhos_culturais": "",
    "formato_apropriado": "",
    "representacao_marca": "",
    "compliance": ""
  }
}
```

---

## Integração com Brand Intelligence

Quando `brand-intelligence.json` existe para o cliente:

1. **Voz** → mantém personalidade, adapta registro por idioma
2. **Restrições** → `nunca_fazer` e `sempre_fazer` são universais (não mudam por idioma)
3. **Audiência** → `gatilhos_desejo` e `gatilhos_medo` são adaptados culturalmente
4. **Plataforma** → `adaptacao_plataforma[idioma]` fornece tom específico

---

## Integração com Funnel Strategy

O conteúdo gerado pelo multi-lang motor **sempre** inclui Funnel Metadata:

```json
{
  "funnel_metadata": {
    "funnel_stage": "",
    "intent_level": "",
    "friction_level": "",
    "expected_lead_signal": "",
    "primary_cta": "",
    "routing_destination": ""
  }
}
```

---

## Anti-padrões

- **NUNCA** tradução automática (Google Translate style)
- **NUNCA** copiar conteúdo de um mercado para outro sem adaptação
- **NUNCA** ignorar compliance local (LGPD, GDPR, CCPA)
- **NUNCA** usar emojis/slang que não existem no mercado-alvo
- **SEMPRE** validar com nativo ou ferramenta de naturalidade
- **SEMPRE** manter coerência com brand-intelligence.json
- **SEMPRE** incluir Funnel Metadata no output

---

## Comando

```
/idioma [idioma] [tipo]     → gera conteúdo adaptado
/idioma list                → lista idiomas suportados
/idioma check [idioma]      → valida conteúdo existente para o idioma
```

---

## Relação com outras skills

| Skill | Relação |
|---|---|
| brand-intelligence | Fornece voz + restrições universais |
| cultural-playbooks | Fornece regras culturais por mercado |
| funnel-strategy | Fornece Funnel Metadata + plataforma |
| skill-social-copy | Motor de geração de copy |
| skill-carousel | Gera carrosséis adaptados |
| skill-post | Gera posts adaptados |

---

*Conteúdo global não é conteúdo traduzido. É conteúdo re-criado com alma.*
