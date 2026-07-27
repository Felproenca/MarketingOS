# MarketingOS no Telegram

Canal operacional privado para comandar clientes sem depender do computador aberto na interface do Codex.

## Configuracao local

1. No Telegram, abra `@BotFather`, execute `/newbot` e copie o token.
2. Adicione ao `.env`:

```env
TELEGRAM_BOT_TOKEN=token_do_bot
TELEGRAM_ALLOWED_USER_IDS=seu_user_id
```

Para descobrir o ID sem liberar o bot: configure temporariamente um valor qualquer, rode `npm run telegram`, envie `/start` e copie o ID informado no terminal/chat. Depois corrija a lista e reinicie.

3. Valide e execute:

```powershell
npm run telegram:check
npm run telegram
```

O processo usa long polling e precisa permanecer rodando. Na fase VPS, o mesmo adaptador pode ser executado como servico ou migrado para webhook HTTPS.

## Comandos

- `/cliente toque` ou `/cliente fortunato`
- `/hoje`, `/status`, `/bloqueios`, `/acessos`
- `/pedir texto`, `/tarefas`, `/feito ID`
- `/evidencia texto`

Tambem e possivel escrever naturalmente, por exemplo:

- `Quais sao as prioridades do Fortunato hoje?`
- `Prepare um relatorio semanal para a Toque Indiano`
- `O que esta travando o Fortunato?`
- `Concluir TABC123`

Perguntas de status recebem resposta imediata. Uma nova solicitacao entra em uma fila unica e aciona `codex exec` localmente, usando o login ja salvo do Codex. O executor trabalha com sandbox `workspace-write`, tem limite de tempo e nao pode publicar, enviar mensagens, implantar, apagar dados ou alterar credenciais.

Audios sao salvos em `clients/<cliente>/inputs/audio/telegram` e geram uma tarefa operacional. Senhas e codigos 2FA nunca devem ser enviados ao bot.
