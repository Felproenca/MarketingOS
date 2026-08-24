---
name: agent-builder
version: "1.0"
group: system
command: /agente
inputs:
  required: [client.md]
  optional: [brand-intelligence.json, notes.md]
env: []
---

# Agent Builder — Criador de Agentes Customizados
> Skill que permite criar agentes de IA personalizados para cada cliente.
> Não é "mais uma skill". É uma fábrica de skills sob medida.
> Equivalente funcional ao HubSpot Agent Builder / Jasper AI Studio do MarketingOS.

---

## Por que esta skill existe

Cada cliente tem necessidades únicas:
- Farmácia precisa de um agente que responda sobre produtos e dosage
- Academia precisa de um agente que motive e agende aulas
- Joalheria precisa de um agente que consulte estoque e agende visitas

Em vez de criar skills fixas para cada caso, esta skill **gera agentes customizados**
que herdam a infraestrutura do MarketingOS.

---

## O que esta skill gera

1. **Definição do agente** — persona, objetivos, restrições
2. **Fluxo de conversação** — como o agente interage
3. **Integrações** — quais skills/apis o agente usa
4. **Guard rails** — o que o agente NÃO pode fazer
5. **Métricas** — como medir performance do agente

---

## Tipos de Agente Suportados

| Tipo | Uso | Exemplo |
|---|---|---|
| **Atendente** | Responder perguntas, qualificar leads | "Olá! Sou da [marca]. Como posso ajudar?" |
| **Vendedor** | Apresentar produto, fechar venda | "Temos 3 opções. Qual se encaixa melhor?" |
| **Suporte** | Resolver problemas, tirar dúvidas | "Vou verificar seu pedido. Pode me dar o nº?" |
| **Agendador** | Marcar consultas, aulas, reuniões | "Horários disponíveis: 10h, 14h, 16h. Qual prefere?" |
| **Nutridor** | Envio sequenciado de conteúdo | "Dia 1: educação → Dia 3: prova → Dia 5: oferta" |
| **Receptor** | Processar inbound de formulários | "Recebemos seu contato! Retornamos em 2h." |

---

## Workflow de 5 Passos

### Passo 1 — Definição do Agente

```json
{
  "agente": {
    "nome": "",
    "tipo": "",
    "canal": "whatsapp | instagram_dm | email | site_chat | telegram",
    "persona": {
      "nome": "",
      "tom": "",
      "nivel_formalidade": "",
      "emojis": true/false,
      "horario_operacao": ""
    },
    "objetivos": {
      "primario": "",
      "secundarios": []
    },
    "publico_alvo": "",
    "linguagem": ""
  }
}
```

---

### Passo 2 — Fluxo de Conversação

```json
{
  "fluxo": {
    "abertura": {
      "gatilho": "primeira_mensagem | keyword | horario",
      "mensagem": "",
      "opcoes": []
    },
    "qualificacao": {
      "perguntas": [
        {"ordem": 1, "pergunta": "", "objetivo": ""},
        {"ordem": 2, "pergunta": "", "objetivo": ""}
      ],
      "criterios": {
        "lead_qualificado": "",
        "lead_nao_qualificado": ""
      }
    },
    "apresentacao": {
      "condicao": "lead qualificado",
      "conteudo": "",
      "cta": ""
    },
    "objecao": {
      "top_3_objecoes": [
        {"objecao": "", "resposta": ""},
        {"objecao": "", "resposta": ""},
        {"objecao": "", "resposta": ""}
      ]
    },
    "fechamento": {
      "cta_primario": "",
      "cta_secundario": "",
      "fallback": ""
    },
    "handoff": {
      "condicao": "agente não consegue resolver",
      "destino": "humano | whatsapp_grupo | email_suporte",
      "mensagem_transferencia": ""
    }
  }
}
```

---

### Passo 3 — Integrações

```json
{
  "integracoes": {
    "skills": [
      {
        "skill": "skill-lead-capture",
        "funcao": "registrar lead qualificado"
      },
      {
        "skill": "skill-offer-positioning",
        "funcao": "apresentar oferta proporcional"
      }
    ],
    "apis": [
      {
        "nome": "whatsapp-business-api",
        "funcao": "enviar/receber mensagens"
      },
      {
        "nome": "google-calendar",
        "funcao": "agendar consultas"
      }
    ],
    "templates": [
      {
        "nome": "mensagem_boas_vindas",
        "conteudo": ""
      },
      {
        "nome": "mensagem_fora_horario",
        "conteudo": ""
      }
    ]
  }
}
```

---

### Passo 4 — Guard Rails

```json
{
  "guard_rails": {
    "nunca_fazer": [
      "Não inventar preços ou promoções",
      "Não prometer resultado que não pode garantir",
      "Não compartilhar dados de outros clientes",
      "Não responder sobre concorrentes negativamente",
      "Não escalar para humano sem motivo"
    ],
    "sempre_fazer": [
      "Identificar-se como representante da marca",
      "Oferecer canal de contato humano quando em dúvida",
      "Registrar conversa em leads.json",
      "Respeitar horário de operação"
    ],
    "limites": {
      "max_mensagens_sem_resposta": 3,
      "timeout_conversa_minutos": 30,
      "max_tentativas_agendamento": 2,
      "pessoa_humana_necessaria": ["reclamação", "cancelamento", "elogio"]
    }
  }
}
```

---

### Passo 5 — Métricas de Performance

```json
{
  "metricas": {
    "engajamento": {
      "taxa_resposta": "% de mensagens que recebem resposta",
      "tempo_resposta_medio": "minutos até primeira resposta",
      "taxa_conclusao": "% de conversas que chegam ao fim do fluxo"
    },
    "conversao": {
      "leads_gerados": 0,
      "leads_qualificados": 0,
      "taxa_qualificacao": "%",
      "agendamentos_realizados": 0,
      "vendas_diretas": 0
    },
    "qualidade": {
      "taxa_handoff": "% de vezes que precisou de humano",
      "satisfacao_cliente": "NPS ou rating (se disponível)",
      "erros_detectados": 0
    }
  }
}
```

---

## Output Structure

```
clients/[slug]/agents/
├── [nome-agente]/
│   ├── definicao.json     → persona, objetivos, canal
│   ├── fluxo.json         → fluxo de conversação
│   ├── integracoes.json   → skills e APIs conectadas
│   ├── guard-rails.json   → restrições e limites
│   ├── templates/         → mensagens pré-definidas
│   │   ├── boas-vindas.txt
│   │   ├── fora-horario.txt
│   │   └── handoff.txt
│   └── metricas.json      → KPIs do agente
└── registry.json          → lista de todos os agentes ativos
```

---

## Comando

```
/agente criar [tipo]        → criar novo agente
/agente listar              → listar agentes ativos
/agente editar [nome]       → editar agente existente
/agente testar [nome]       → simular conversa com agente
/agente metricas [nome]     → ver performance do agente
/agente pausar [nome]       → pausar agente
/agente retomar [nome]      → retomar agente pausado
```

---

## Integração com outras skills

| Skill | Relação |
|---|---|
| brand-intelligence | Fornece voz + persona do agente |
| skill-lead-capture | Registra leads qualificados pelo agente |
| skill-offer-positioning | Apresenta ofertas proporcionais |
| skill-publicar | Publica templates de mensagens |
| funnel-strategy | Define progressão do agente no funil |

---

## Anti-padrões

- **NUNCA** criar agente sem guard rails documentados
- **NUNCA** permitir agente sem handoff para humano
- **NUNCA** inventar preços, prazos ou promessas
- **SEMPRE** registrar conversas para aprendizado
- **SEMPRE** testar agente antes de ativar
- **SEMPRE** respeitar horário de operação

---

*Agente sem personalidade é chatbot. Agente com alma é extensão da marca.*
