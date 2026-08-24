# MarketingOS — System Truth

## Papel dos sistemas

- **MarketingOS**: entende cliente, contexto, objetivo, estratégia e próximos movimentos.
- **AI Router**: escolhe capacidade, provedor, modelo e credencial autorizada.
- **MediaOS**: coordena jobs, filas, executores, estados, retries, aprovações e entrega.
- **DesignOS**: sites, interfaces, direção visual e carrosséis.
- **FluxOS**: distribuição, publicação e agenda.
- **EditorOS / VideoOS**: edição, cortes, legendas, versões e render de vídeo.

## Interfaces

- **Console do operador**: visão completa para Felipe construir, prospectar, gerenciar e executar.
- **Portal do cliente**: visão limitada dos próprios resultados, aprovações, métricas e próximos passos.
- O operador pode abrir o portal de qualquer cliente para operar e revisar a experiência final.

## Regra de execução

Toda produção deve seguir:

```text
solicitação → job → executor → artifact → revisão → aprovação → entrega → métrica
```

## Infraestrutura atual

- Frontend: React/Vite no `cockpit`.
- API: funções serverless em `cockpit/api` e rotas legadas em `cockpit/server.cjs`.
- Dados e autenticação: Supabase.
- Integração social atual: Meta/Instagram via OAuth.
- Execução local: scripts do MarketingOS, EcosystemCore e FluxOS.

## Limite importante

Referências como OpusClip e Dreamina definem capacidades desejadas. Não são integrações obrigatórias. Os executores devem ser substituíveis por baixo do contrato do MediaOS.
