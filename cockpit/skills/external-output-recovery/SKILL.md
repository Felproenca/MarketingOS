---
name: external-output-recovery
description: Recupera uma solicitação de imagem ou vídeo quando o cliente não possui saldo, conexão ou provider disponível. Use para gerar um prompt externo coerente, orientar a produção fora do sistema e retomar o job por upload sem perder contexto.
---

# Recuperação de Output Externo

Manter o job vivo e rastreável quando a geração automática não puder ocorrer.

## Fluxo

1. Preservar `client_id`, `job_id`, brief, objetivo, público, formato e Client Truth.
2. Gerar prompt específico para o canal e para o output solicitado.
3. Informar formato, proporção, restrições de marca e critérios de qualidade.
4. Marcar o job como bloqueado com `fallback=prompt_and_upload` e próximo passo claro.
5. Receber o arquivo pelo endpoint seguro de upload.
6. Validar MIME, tamanho, integridade e compatibilidade.
7. Criar ou atualizar artifact/version, executar QA e enviar para aprovação.

## Segurança

- aceitar somente tipos permitidos;
- limitar tamanho;
- manter o arquivo no tenant correto;
- não aceitar URLs arbitrárias como prova de upload;
- não substituir artifact de outro job;
- registrar origem como `external_upload`.

Usar `scripts/mediaos/ai-runtime.mjs` para o prompt e `/api/admin/ai/upload` para retomar o artifact.
