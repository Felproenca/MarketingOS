---
name: skill-reference-acquisition
version: "1.0"
group: perception
command: /adquirir [url]
inputs:
  required: [url]
  optional: [notes, client, force_manual]
env: [NODE_ENV]
---

# skill-reference-acquisition.md — Aquisição de Referências
> Transforma qualquer URL interessante em conhecimento estruturado.
> Obra primeiro. Interpretação depois. Validação humana apenas no final.
> Output: `intelligence/reference-library/acquired/[slug].json`

---

## Princípio operacional

O operador fornece uma URL.
O sistema faz o trabalho pesado.
O operador valida apenas a interpretação semântica — não a captura.

**Fluxo:**
```
URL
 ↓
[1] Captura física (Playwright)
 ↓
[2] Detecção de stack
 ↓
[3] Engenharia Reversa (análise semântica)
 ↓
[4] Geração do JSON (status: draft)
 ↓
[5] Apresentação para validação humana
 ↓
[6] Confirmação → status: validated → salvar
```

A validação humana cobre apenas:
- A tensão está correta?
- O princípio transferível faz sentido?

Captura física, dimensões e tags não precisam de validação — são observáveis.

---

## Contexto mínimo necessário

Carregar antes de executar:
- `intelligence/reference-library/reference-taxonomy.md`
- `intelligence/reference-library/reference-schema.json`

NÃO carregar: client.md, alma.md, campanhas, posts ou qualquer outro contexto de cliente.

---

## Passo 1 — Captura física

```bash
node scripts/capture-reference.js --url <url> --output intelligence/reference-library/acquired/
```

O script deve retornar:
- Screenshot(s) salvo(s) em `intelligence/reference-library/acquired/assets/[slug]/`
- Vídeo curto (3-5s scroll) se possível
- HTML source para análise de stack

Se `scripts/capture-reference.js` falhar ou não existir:
- Marcar `capture_status: "manual"`
- Continuar apenas com URL e análise visual da URL (se acessível)
- Marcar no campo `metadata.description` que a captura foi manual

Se a URL for inacessível (login, bloqueio, JS pesado):
- Marcar `capture_status: "failed"`
- Solicitar ao operador: screenshot manual ou notas descritivas
- Continuar com o que foi fornecido via `notes`

---

## Passo 2 — Detecção de stack

Analisar HTML source em busca de:

```
three.js / three.min.js       → threejs
gsap / TweenMax               → gsap
matter.js                     → matter-js
p5.js                         → p5js
pixi.js                       → pixijs
lottie                        → lottie
framer-motion                 → framer-motion
react / react-dom             → react
vue                           → vue
svelte                        → svelte
canvas (2D context)           → canvas-2d
WebGLRenderingContext         → webgl
fragmentShader / vertexShader → shader
```

Se HTML não acessível: inferir stack a partir do comportamento visual observável.
Marcar `stack_confidence: "inferred"` nesse caso.

---

## Passo 3 — Engenharia Reversa

Com screenshot(s) em mãos, responder sequencialmente:

### 3a. Por que funciona?

Diagnóstico de 1 a 3 frases do mecanismo de impacto.
O que essa obra faz que outras não fazem?
Por que o usuário para?

### 3b. Tensão principal

Identificar a contradição interna que torna a obra memorável.

Consultar `reference-taxonomy.md` seção 1 para vocabulário validado.
Se nenhuma tensão existente se aplica, criar nova no formato:
`[qualidade A] que parece [qualidade B inesperada]`

Se a tensão não puder ser identificada — a referência não entra. Parar aqui.

### 3c. Dimensões

Medir nas 8 dimensões da taxonomia:
`tempo` | `ritmo` | `densidade` | `profundidade` | `contraste` | `temperatura` | `movimento` | `ornamentacao`

### 3d. Tags

Extrair de acordo com taxonomia seções 3-6:
- `visual` — elementos observáveis
- `motion` — tipo de movimento
- `interaction` — forma de interação
- `emocao` — máximo 3, priorizar a mais forte
- `contexto` — quando referenciar

### 3e. Absorver

Máximo 5 itens. Padrões específicos e transferíveis.

Proibido genérico. "Tipografia boa" não é item. "Uso de espaço negativo entre seções para criar pausa rítmica" é item.

### 3f. Nunca copiar

Obrigatório incluir: paleta específica, layout, copy literal, composição exata.
Adicionar elementos particulares dessa obra que não devem ser copiados por serem identitários demais.

### 3g. Princípio transferível

Uma frase. O padrão abstrato por trás do que funciona.
Não descreve a obra — descreve o princípio reutilizável.

Exemplos do que é um princípio (não uma descrição):
- ✅ "reduzir a zero o esforço perceptivo — a marca aparece sem aparecer"
- ✅ "lentidão como luxo — o tempo dado para comunicar sinaliza o valor do que é oferecido"
- ✅ "velocidade como valor percebido — quando o produto é rápido, o usuário sente que é mais capaz"
- ❌ "o site usa whitespace generoso e tipografia grande"

---

## Passo 4 — Geração do JSON

Montar o objeto seguindo `reference-schema.json`.

Gerar slug a partir do domínio ou nome:
- `apple.com` → `apple`
- `bruno-simon.com` → `bruno-simon`
- `linear.app` → `linear`

Salvar em: `intelligence/reference-library/acquired/[slug].json`

Status inicial: `draft`

---

## Passo 5 — Apresentação para validação

Apresentar ao operador apenas o resumo semântico:

```
Referência capturada: [nome]
URL: [url]
Captura: [auto | manual | failed]
Stack: [lista]

TENSÃO IDENTIFICADA:
→ [tension]

POR QUE FUNCIONA:
→ [por_que_funciona]

PRINCÍPIO TRANSFERÍVEL:
→ [principio_transferivel]

ABSORVER:
→ [item 1]
→ [item 2]
→ [item 3]

NUNCA COPIAR:
→ [item 1]
→ [item 2]

Confirmar? (sim / ajustar tensão / ajustar princípio / rejeitar)
```

---

## Passo 6 — Validação e salvamento

**Se confirmado:**
- Atualizar `status: "validated"`
- Preencher `validation.validated_by` e `validation.validated_at`
- Arquivo permanece em `acquired/` até ser movido manualmente para `seed/` ou `validated/`
- Confirmar ao operador: "Referência [nome] validada. Tensão: [tension]."

**Se ajuste de tensão ou princípio:**
- Aceitar a correção do operador
- Atualizar o campo correspondente
- Salvar com status `validated`

**Se rejeitado:**
- Salvar com `status: "draft"` e nota do operador
- Não remover — pode ser revisado depois

---

## Ativação

```
Use a skill-reference-acquisition.md.

/adquirir https://linear.app
notes: estudar como comunicam velocidade sem agressividade
```

```
Use a skill-reference-acquisition.md.

/adquirir https://aesop.com
notes: referência de luxo austero para cliente de cosméticos premium
client: [slug]
```

---

## Integração com a Biblioteca

Após validação, o arquivo `acquired/[slug].json` está pronto para:
- Consulta por `skill-creative-direction.md` no Matching (Camada 5)
- Herança por `skill-branding.md` na construção do DNA Visual
- Referenciação em qualquer skill de criação

O campo `used_in` é atualizado automaticamente quando uma referência é citada em um output.

---

*Skill v1.0 — MarketingOS Perception Engine*
*A máquina coleta. O operador julga. A biblioteca cresce com qualidade, não com volume.*
