---
name: client-onboarding
description: Completa e valida o contexto operacional de um cliente antes de gerar estratégia, conteúdo, anúncios, funis ou mídia. Use ao implantar um cliente, revisar Client Truth ou bloquear uma produção por dados obrigatórios ausentes.
---

# Onboarding de Cliente

Construir um Client Truth verificável e suficiente para produção. Nunca preencher lacunas críticas inventando informações.

## Coletar

- identidade, oferta, produto e modelo de negócio;
- público, dores, desejos, objeções e estágio de consciência;
- diferenciais, provas, restrições e concorrentes;
- voz, posicionamento, cores, tipografia, logos e referências aprovadas;
- objetivos, canais, orçamento, consentimentos e conexões disponíveis.

## Validar

1. Identificar campos obrigatórios ausentes.
2. Separar fato fornecido, inferência e hipótese.
3. Registrar origem e data das referências.
4. Calcular hash/versão do Client Truth.
5. Bloquear jobs que dependam de dados ausentes.
6. Liberar somente capabilities compatíveis com o onboarding.

Entregar registros coerentes para `client_profiles` e `client_references`, com status, bloqueios, próximos passos e snapshot anexável ao `work_request`. Usar `cockpit/api/_lib/client-truth.js` e manter a separação por `client_id`.
