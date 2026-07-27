# Brief LinkedIn — CORBAN — Correspondentes Bancários (PJ pequeno/médio)

```
Busca assistida — CORBAN — Correspondentes Bancários (PJ pequeno/médio)

1. Abrir LinkedIn Sales Navigator (login normal, sem automação/extensão)
2. Busca de Empresas (não de pessoas) com esses termos no campo de palavras-chave:
   "correspondente bancário" OR "correspondente bancario" OR "banco" OR "financeira"
3. Filtros adicionais:
   - Localização: SP
   - Setor: Serviços financeiros, Bancos, Gestão de investimentos
   - Porte: 1-50 funcionários (ajustar conforme volume de resultado)
4. Revisar a lista manualmente — salvar só empresas que parecem reais/ativas
   (nome consistente com o nicho, não perfil vazio/inativo)
5. Salvar numa Lista do Sales Navigator (recurso nativo, não exportação)
6. Preencher um CSV simples com nome + domínio do site (se visível na página
   da empresa) + URL do LinkedIn da empresa — só dado que a própria empresa
   publicou institucionalmente, nunca dado de perfil pessoal de funcionário
7. Rodar: node scripts/discovery-engine/import-manual-leads.js
   --niche=<niche_id> --file=<caminho do CSV>

NUNCA: extensão de scraping, exportação em massa de perfis, automação de
busca/paginação, ou qualquer coleta de dado de PESSOA física (nome de
funcionário, e-mail pessoal) — só dado institucional da EMPRESA.
```
