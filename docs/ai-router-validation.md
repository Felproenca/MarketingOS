# AI Router — estado de verdade

O Router agora distingue provider de execução:

- `pipeline`: executor local validado (EditorOS, GrowthOS, renderers e structured executors); não chama API de modelo;
- `anthropic` / `openai-compatible`: adapters HTTP com timeout, retry e credencial explícita; só devem ser usados quando um executor realmente chamar `runAI`;
- `platform`: integração externa Meta/publicação, sempre atrás de aprovação e conexão.

As capacidades atualmente executadas pelo worker local são registradas como `provider=pipeline`, não como Anthropic/OpenAI. Ao concluir, `ai_runs.metadata` registra `execution_mode=local_pipeline` e `ai_provider_called=false`. Isso evita apresentar uma rota planejada como uma chamada de IA que não ocorreu.
