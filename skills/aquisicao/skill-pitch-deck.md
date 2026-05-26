# skill-pitch-deck.md — Apresentação Comercial em HTML (v2.1)
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar.
> Gera apresentação HTML com identidade visual do cliente +
> mockup de Instagram (real ou descritivo) + carrossel navegável.

---

## Objetivo

Gerar uma apresentação HTML standalone com:
- Identidade visual aplicada do cliente (cores, tipografia)
- Diagnóstico personalizado da presença digital atual
- Mockup visual do novo site
- Mockup do feed do Instagram (atual vs. proposto)
- Carrossel real navegável dentro da apresentação
- Plano de 90 dias específico
- CTA único para reativação

**Output:** arquivo `.html` único, sem dependências externas, navegável no celular ou desktop.

---

## Lógica híbrida do feed atual (slide 6)

O sistema suporta dois modos para representar o feed atual do prospecto:

```
MODO PRINT — quando há tempo de capturar manualmente
  Você fornece: print do feed atual (.jpg ou .png) salvo em
  /clients/[slug]/assets/reference/feed-atual.jpg
  Sistema usa: a imagem real no lado esquerdo do slide 6
  Impacto:     alto — comparação direta com a realidade

MODO MOCKUP — fallback automático quando não há print
  Você fornece: descrição textual do feed atual
  Sistema usa: grid 3x3 com etiquetas descritivas em fundo cinza
  Impacto:     médio — preserva o comparativo sem o passo manual
```

### Como decidir qual modo usar

```
SE existe arquivo em /clients/[slug]/assets/reference/feed-atual.jpg ou .png
  → usar MODO PRINT
SENÃO
  → usar MODO MOCKUP
```

A skill detecta automaticamente. Você não precisa especificar — basta colocar o arquivo no lugar correto antes de rodar.

---

## Preparação do print (Modo Print)

Instruções para você capturar:

```
1. Abre o Instagram do prospecto no celular
2. Print da tela mostrando o grid 3x3 do feed
3. Salva como feed-atual.jpg
4. Move para /clients/[slug]/assets/reference/
5. Roda /pitch [slug]
```

A skill já procura o arquivo nesse caminho exato.

---

## Especificações por modo

### Modo Print

```html
<div class="ig-col bad">
  <span class="ig-label">Feed atual</span>
  <div class="ig-real-grid">
    <img src="../assets/reference/feed-atual.jpg" alt="Feed atual" />
  </div>
  <p class="ig-note">[CRITICA_FEED_ATUAL — gerada com base no que se vê no print]</p>
</div>
```

CSS adicional para Modo Print:
```css
.ig-real-grid{
  background:var(--mos-bg-2);
  padding:12px;
  border-radius:8px;
  overflow:hidden;
}
.ig-real-grid img{
  width:100%;
  height:auto;
  display:block;
  border-radius:4px;
}
```

### Modo Mockup (já no template v2.0)

```html
<div class="ig-col bad">
  <span class="ig-label">Feed atual</span>
  <div class="ig-grid">
    <div class="ig-post">Post genérico</div>
    <div class="ig-post">Bom dia</div>
    <div class="ig-post">Logo seguradora</div>
    <!-- 6 quadrados mais com etiquetas baseadas na descrição -->
  </div>
  <p class="ig-note">[CRITICA_FEED_ATUAL — baseada na descrição]</p>
</div>
```

As etiquetas dentro de cada quadrado são geradas a partir da descrição do feed que você fornece no diagnóstico. Exemplos:

```
Para corretora de seguros sem estratégia:
  ["Post institucional", "Logo seguradora", "Frase motivacional",
   "Bom dia", "Banner promocional", "Logo seguradora",
   "Selo de qualidade", "Imagem genérica", "Logo seguradora"]

Para joalheria sem narrativa:
  ["Foto de produto", "Foto de produto", "Foto de produto",
   "Promoção", "Foto de produto", "Foto de produto",
   "Frase genérica", "Foto de produto", "Promoção"]
```

---

## Input atualizado

```
1. brand-kit.json do prospecto (obrigatório)
2. Print do feed atual (opcional — habilita Modo Print)
   → /clients/[slug]/assets/reference/feed-atual.jpg
3. Descrição do feed atual (obrigatória se sem print)
4. Dados do prospecto
5. Análise prévia com problemas identificados
6. Preview do novo site
7. Carrossel real do slide 7 (gerado pela skill-carousel)
8. Benchmarks do nicho
```

---

## Restante da skill v2.1

> A estrutura dos demais slides permanece igual à v2.0.
> Total: 11 slides, identidade visual dinâmica, carrossel navegável,
> calendário editorial.

Ver versão anterior para detalhes dos slides 1-5 e 7-11.

---

## Mudanças da v2.0 para v2.1

```
v2.0 → v2.1

Slide 6 (Instagram):
  Único modo (mockup)        →  Modo Print + Modo Mockup com fallback
                                automático baseado em arquivo presente

Detecção:
  Manual                     →  Automática
                                (skill verifica existência de feed-atual.jpg)

Trabalho do operador:
  Sempre descrever o feed    →  Print quando der + descrição como fallback
```

---

## Workflow recomendado por situação

```
PROSPECTO QUENTE (alto valor de fechamento)
  → Capturar print do feed
  → Modo Print
  → 30 segundos extras, impacto muito maior

PROSPECTO MORNO (volume, validação inicial)
  → Pular o print
  → Modo Mockup automático
  → Geração rápida sem trabalho manual

PROSPECCTAR EM BATCH (vários prospectos no mesmo nicho)
  → Modo Mockup para todos
  → Print apenas dos que avançarem para reunião
```

---

## Atualização no checklist

- [ ] brand-kit.json foi lido e aplicado?
- [ ] Verificou se existe feed-atual.jpg em /assets/reference/?
- [ ] Se sim, ativou Modo Print
- [ ] Se não, ativou Modo Mockup com descrição
- [ ] Os 11 slides estão presentes na ordem correta?
- [ ] Carrossel do slide 7 é funcional?
- [ ] Calendário editorial específico para o nicho?
- [ ] Métricas marcadas como estimativa?
- [ ] Foi salvo em /clients/[slug]/outputs/demo/?

---

## Exemplo de ativação

```
# Caso 1 — Você já capturou o print
1. Mover feed-atual.jpg para /clients/pontos-cardeais/assets/reference/
2. /pitch prospecto: pontos-cardeais

# Caso 2 — Sem tempo para print
1. /pitch prospecto: pontos-cardeais
   (sistema usa Modo Mockup automaticamente)
```

---

*Skill v2.1 — MarketingOS*
*Híbrido: print real quando der, mockup descritivo como fallback*
*Decisão automática baseada em arquivo presente*
