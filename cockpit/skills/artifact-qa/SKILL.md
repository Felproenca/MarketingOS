---
name: artifact-qa
description: Revisa artifacts de imagem, carrossel, post, vídeo, pesquisa e estratégia antes da aprovação ou publicação. Use quando um executor finalizar, quando uma versão for alterada ou quando o output parecer incompleto, fraco ou fora da marca.
---

# QA de Artifacts

Tratar todo output como versão revisável, nunca como entrega final automática.

## Verificações

- arquivo existe, é legível e possui MIME/tamanho válidos;
- manifesto, preview, versão e origem do executor estão registrados;
- conteúdo responde ao brief e usa o Client Truth correto;
- identidade visual, hierarquia, legibilidade e proporção estão adequadas;
- vídeo possui duração, dimensões, áudio quando necessário e reprodução válida;
- pesquisa possui fontes verificáveis e separa evidência de inferência;
- estratégia, funil e anúncios possuem objetivo, hipótese, métrica e próximo passo;
- aprovação humana precede publicação ou distribuição externa.

## Loop

1. Registrar o defeito específico.
2. Corrigir somente o componente afetado.
3. Criar nova versão e repetir o QA.
4. Parar no limite da política do cliente.
5. Se não passar, bloquear ou encaminhar para revisão/upload externo.

Registrar checks em `artifact_versions.qa`, decisões em `artifact_approvals` e eventos em `media_job_events`.
