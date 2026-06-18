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
| `DM_KEYWORD` | padrão `DIAGNOSTICO` |

> Comece com `DM_AUTO_SEND` vazio: o motor registra cada hit no log
> (`clients/<slug>/leads/dm-engine-log.json`) sem enviar — você confere e só
> então liga o `true`. É o "saber de tudo".

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

Pronto: comente a palavra-chave num post de teste e veja o log + a DM chegar.
