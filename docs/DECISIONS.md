# MarketingOS — Decisions

## D001 — MediaOS é o control plane de execução

MarketingOS decide o que e por quê. MediaOS coordena como, quando, com qual executor e em qual estado.

## D002 — Interfaces por papel

O operador possui acesso total e pode abrir a visão do cliente. O cliente só acessa seus próprios dados, artifacts, aprovações e próximos passos.

## D003 — AI Router é estrutural

Nenhum módulo de produção deve depender diretamente de um modelo específico. O Router resolve capacidade, provedor, modelo, credencial, limites e custo.

## D004 — Credenciais podem ser da agência ou do cliente

O sistema deve suportar credencial MarketingOS, API key do cliente, OAuth do cliente e conexão de assinatura autorizada, sempre registrando escopo e responsável pelo custo.

## D005 — OpusClip e Dreamina são referências de capacidade

O produto não depende de APIs desses serviços. VideoOS e executores generativos devem oferecer contratos equivalentes e implementações substituíveis.

## D006 — Output ruim não é output pronto

Todo artifact criativo precisa de versão, preview, QA, status de aprovação e origem do executor. Rascunho não pode aparecer como entrega final para o cliente.
