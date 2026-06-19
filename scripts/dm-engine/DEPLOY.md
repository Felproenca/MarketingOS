# Motor de DM — go-live

Funil: Reel pede "comente DIAGNÓSTICO" → webhook detecta o comentário →
resposta privada (DM) com a isca → conversa humana → captura no fim do diagnóstico.

Tudo já está construído e testado local. Faltam 4 passos seus (interativos).

## 1. Token de longa duração (mata o "expira de hora em hora")

```bash
# precisa de META_APP_ID e META_APP_SECRET no .env (Meta Dashboard → app → Config → Básico)
node scripts/publisher/long-lived-token.js --slug felipe-proenca --save
```
Gera um token de ~60 dias e grava no `instagram-config.json`. Serve também pro publisher e insights.

## 2. Deploy (um processo serve webhook + captura + isca)

```bash
docker build -f scripts/dm-engine/Dockerfile -t marketingos-dm .
# subir em Render/Railway/Fly apontando pra esta imagem, porta 4280
```
O host te dá uma URL HTTPS pública, ex.: `https://dm.seudominio.com`.

## 3. Variáveis de ambiente (no host)

| Var | O que é |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | token de 60 dias do passo 1 (ou deixa no config) |
| `META_APP_SECRET` | segredo do app — valida a assinatura do webhook |
| `WEBHOOK_VERIFY_TOKEN` | uma senha que **você inventa** (usada no passo 4) |
| `MAGNET_URL` | URL pública da isca (ex.: `https://dm.seudominio.com/`) |
| `DM_AUTO_SEND` | `true` = DM dispara sozinha; vazio = só registra p/ aprovação |
| `DM_KEYWORD` | padrão `DIAGNOSTICO`; o detector aceita acento ausente e erros curtos de digitação |

> Comece com `DM_AUTO_SEND` vazio: o motor registra cada hit no log
> (`clients/<slug>/leads/dm-engine-log.json`) sem enviar — você confere e só
> então liga o `true`. É o "saber de tudo".

## Ligar o automático

No host de produção, defina:

```bash
DM_AUTO_SEND=true
MAGNET_URL=https://dm.seudominio.com/
META_APP_SECRET=<segredo_do_app>
WEBHOOK_VERIFY_TOKEN=<token_que_voce_criou>
```

Depois reinicie o serviço. Confirme:

```bash
GET https://dm.seudominio.com/health
```

O retorno precisa mostrar:

```json
{
  "autoSend": true,
  "dm": { "readyToSend": true, "missing": [] }
}
```

Se `readyToSend` vier `false`, corrija os itens em `missing` antes de confiar no automático.

### Onde precisa ficar conectado?

O automático precisa de um processo Node rodando 24/7 em uma URL HTTPS pública.

- Produção recomendada: Render, Railway, Fly, VPS ou outro host sempre ligado.
- Computador local: funciona só enquanto o computador estiver ligado, com internet, processo rodando e um túnel HTTPS público ativo.
- Sem serviço ativo: a Meta não consegue chamar `/webhook`, então nenhum comentário vira DM.

### Modo teste sem custo: Render Free

Para validação operacional sem colocar recurso agora, pode usar Render Free.

Regra de uso:

1. Suba o serviço no Render Free.
2. Configure `DM_AUTO_SEND=true`, `MAGNET_URL`, `META_APP_SECRET` e `WEBHOOK_VERIFY_TOKEN`.
3. Antes de comentar no Instagram, abra:

```bash
GET https://seu-servico.onrender.com/health
```

4. Confirme `autoSend:true`.
5. Faça o comentário de teste no post.
6. Confira `/api/logs?limit=20` e `/api/captures?limit=20`.

Limite consciente:

- Render Free pode dormir por inatividade.
- Se estiver dormindo, o primeiro webhook pode atrasar ou falhar.
- Por isso, use para testes controlados; produção de campanha precisa host always-on.

#### Acordador local

Para manter acordado durante uma sessão de teste:

1. Abra `scripts/dm-engine/keepalive.html` no navegador.
2. Cole a URL do Render, ex.: `https://seu-servico.onrender.com`.
3. Clique em **Iniciar pulso**.
4. Deixe a aba aberta enquanto testa.

Ela chama `/ping` a cada 12 minutos. Se fechar a aba, suspender o computador ou cair a internet, os pulsos param.

## 4. Registrar o webhook no app Meta

Meta App Dashboard → **Webhooks** → **Instagram**:
- Callback URL: `https://dm.seudominio.com/webhook`
- Verify token: o mesmo `WEBHOOK_VERIFY_TOKEN` do passo 3
- Após verificar, **assine o campo `comments`**
- Garanta que a conta IG está inscrita no app (Instagram → subscribed apps)

## Conferir saúde

```
GET https://dm.seudominio.com/health
→ { ok:true, keyword:"DIAGNOSTICO", autoSend:<bool>, magnet:<bool> }
```

## Teste operacional local

Suba o motor local em modo seguro:

```bash
$env:DM_ENGINE_PORT="4282"
$env:MAGNET_URL="http://localhost:4282/"
$env:DM_AUTO_SEND=""
npm.cmd run dm-engine
```

Em outro terminal:

```bash
npm.cmd run dm:test -- --port 4282
```

O teste simula:

1. comentario com `DIAGNOSTICO`
2. comentarios com variações próximas (`diagnostco`, `diagnotico`, `diganostico`, `diag nostico`)
3. registro no ledger (`dm-engine-log.json`)
4. captura de lead via `/api/capture` com nome, WhatsApp, e-mail, site/Instagram e negocio

Endpoints de observabilidade:

```text
GET  /health
GET  /api/logs?limit=50
GET  /api/captures?limit=50
POST /api/test-comment
GET  /ping
```

`POST /api/test-comment` e apenas para teste local/operacional. O fluxo real vem do webhook Meta em `/webhook`.

Pronto: comente a palavra-chave num post de teste e veja o log + a DM chegar.
