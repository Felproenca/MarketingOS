# Motion Direction — Teste Cl�nica

## Padrões Aplicados

### MOTION_01 — Hero Split Reveal
**Onde:** Hero section
**Como:** Headline entra em 3 camadas (0ms, 120ms, 240ms). Imagem sobe com 400ms de atraso.
**Easing:** cubic-bezier(0.16, 1, 0.3, 1)

### MOTION_02 — Cards Staggered
**Onde:** Serviços, diferenciais
**Como:** Cards entram com 80ms de intervalo
**Trigger:** Intersection Observer

### MOTION_04 — Metrics Count Up
**Onde:** Seção de diferenciais (números)
**Como:** count de 0 até valor em 1.8s
**Trigger:** Viewport entry

### MOTION_05 — CTA Magnetic
**Onde:** Botão de CTA principal
**Como:** Leve translação (max 8px) seguindo o cursor
**Easing:** spring tension: 120, friction: 20

## Regras

- Nenhuma animação dura mais de 0.8s
- Nunca usar linear ou ease-in-out — sempre custom cubic-bezier
- Motion comunica hierarquia, não decoração
- Mobile: reduzir ou eliminar motion complexo

## Anti-Motion

- Fade genérico sem propósito
- Parallax pesado que prejudica legibilidade
- Zoom aleatório
- Loop de animação sem parar
