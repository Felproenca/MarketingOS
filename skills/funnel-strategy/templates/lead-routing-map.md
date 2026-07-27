# Lead Routing Map

## Segmentos

| Segmento | Fit | Intencao | Destino | Acao |
|---|---:|---:|---|---|
| Lead A | alto | alta | sales_or_diagnosis | diagnostico, call ou proposta |
| Lead B | alto | media | nurture_with_proof | prova + diagnostico |
| Lead C | alto | baixa | education_pool | conteudo educativo + remarketing |
| Lead D | baixo | alta | low_ticket_or_disqualify | produto menor ou desqualificacao |
| Lead E | baixo | baixa | general_content_pool | nao priorizar |

---

## Regras De Roteamento

```text
Se fit >= 35 e intencao >= 35 -> Lead A
Se fit >= 35 e intencao < 35 -> Lead B/C conforme urgencia
Se fit < 35 e intencao >= 35 -> Lead D
Se fit < 35 e intencao < 35 -> Lead E
```

---

## Handoff

Todo lead roteado deve carregar:

```text
Origem:
Ativo:
Sinal:
Fit score:
Intent score:
Classificacao:
Dor:
Urgencia:
Autoridade:
Investimento:
Proxima pergunta:
Proxima acao:
```

---

## Follow-Up

- D+0:
- D+2:
- D+7:
- D+14:
