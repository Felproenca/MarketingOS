# Motion Site Factory

> Comandos: `/criar motion-site [slug] [project-id]` ou `/motion-site [project-id]`
> Skill: `skills/criacao/motion-site-factory/SKILL.md`
> Função: construir sites cinematográficos em escala e documentá-los para vídeo, case e distribuição.

## Quando usar

Usar quando houver pelo menos dois sinais:

- motion guiado por scroll;
- Three.js, WebGL, shader ou 2.5D;
- assets gerados ou tratados;
- múltiplas páginas ou variações;
- especialistas trabalhando em paralelo;
- necessidade de vídeo, case ou campanha derivada;
- risco alto de performance ou responsividade.

Para landing simples, usar `skill-site-builder.md`.

## Diretório da execução

```text
clients/[slug]/outputs/site/[project-id]/
```

Inicializar com:

```text
agent-roster.json      <- templates/motion-site/agent-roster.template.json
task-graph.json        <- templates/motion-site/task-graph.template.json
creation-manifest.json <- templates/motion-site/creation-manifest.template.json
```

## Fases

### 1. Entender

Responsável: `acquisition-director`.

Fixar uma ação comercial principal, uma promessa verificável e um sinal de sucesso observável.

### 2. Dirigir

Responsáveis: `experience-architect`, `narrative-director` e Creative Direction Engine.

Definir metáfora, contrato de reação, transformação narrativa, curva de intensidade,
seções, recompensas distribuídas, animação protagonista, estados responsivos,
referências e anti-referências. Aplicar `intelligence/experience-continuity.md`.

Gate humano: direção aprovada.

### 3. Preparar

Paralelo permitido:

- `copy-strategist`;
- `visual-asset-director`.

Ambos consomem a direção aprovada e não alteram objetivo ou CTA.

A copy nasce do papel narrativo e do orçamento de leitura de cada seção. Assets
nascem da função narrativa; ao menos um deve ser exclusivo para a marca e preparado
como pacote de cena quando houver profundidade/motion.

### 4. Construir

Responsáveis:

- `frontend-builder`;
- `motion-builder`.

Ordem:

1. estrutura responsiva e semântica;
2. assets reais;
3. motion;
4. instrumentação;
5. `data-capture-id` nos beats.

### 5. Verificar

Paralelo permitido:

- `critic`;
- `performance-executor`.

Verificar Teste Supremo, conversão, desktop, mobile, reduced motion, erros, overflow,
performance, continuidade narrativa e consistência entre manifesto e DOM. Reprovar
explicitamente o padrão “hero memorável + restante genérico”.

### 6. Documentar

Responsável: `creation-documentarian`.

Atualizar `creation-manifest.json` com estados finais, decisões, ativos, origem, capturas, beats, ângulos de vídeo, recibos e riscos.

### 7. Validar

```powershell
node skills/criacao/motion-site-factory/scripts/validate-run.mjs clients/[slug]/outputs/site/[project-id]
```

O resultado precisa ser `VALID`.

### 8. Entregar e multiplicar

Gate humano antes do deploy.

Depois:

- `website-to-video`: showcase ou tour;
- `product-launch-video`: produto ou oferta;
- `motion-graphics`: cortes curtos;
- case: decisões, antes/depois e resultado observado;
- conteúdo: build in public e bastidores.

## Regra de coordenação

```text
Hierarquia escala decisão.
Pipeline escala confiabilidade.
Paralelismo só entra onde dependências permitem.
```

Não abrir mais agentes para compensar briefing fraco.
