# Conexão Meta por cliente

O mesmo App da Meta pode conectar vários clientes. Cada autorização gera um token e uma conta Instagram vinculados ao `client_id` do MarketingOS.

## Configuração do app

No `.env` do MarketingOS:

```env
META_APP_ID=...
META_APP_SECRET=...
META_GRAPH_VERSION=v19.0
META_OAUTH_REDIRECT_URI=http://localhost:4201/api/integrations/meta/callback
META_OAUTH_SCOPES=instagram_basic,instagram_manage_insights,instagram_content_publish,pages_show_list,pages_read_engagement
COCKPIT_WEB_URL=http://localhost:4200
```

Cadastre exatamente esta URL no painel da Meta em OAuth Redirect URIs:

```text
http://localhost:4201/api/integrations/meta/callback
```

## Conectar um cliente

Com o Cockpit rodando:

```text
http://localhost:4201/api/integrations/meta/connect/<client_id>
```

Ou gere a URL pelo terminal:

```bash
npm run meta:connect -- --slug felipe-proenca
```

O cliente entra com a própria conta, autoriza as permissões e seleciona uma Página vinculada a um Instagram Business/Creator. O callback grava o token em:

```text
MarketingOS/clients/<client_id>/instagram-config.json
```

Esse arquivo está ignorado pelo Git e nunca deve ser commitado.

## Verificar e sincronizar

```bash
npm run meta:status -- --slug felipe-proenca
npm run insights -- --slug felipe-proenca
npm run insights:aquisicao -- --slug felipe-proenca
node ../GrowthOS/data-now/cli.js status felipe-proenca
```

O endpoint equivalente é:

```text
GET http://localhost:4201/api/integrations/meta/status/<client_id>
POST http://localhost:4201/api/integrations/meta/sync/<client_id>
```

O sync é somente leitura. Ele não cria, pausa, ativa ou altera campanhas.

## Produção

Para este projeto, use `mkos.online`:

```env
META_OAUTH_REDIRECT_URI=https://mkos.online/api/integrations/meta/callback
COCKPIT_WEB_URL=https://mkos.online
```

Páginas públicas para cadastrar no Meta:

```text
https://mkos.online/privacy.html
https://mkos.online/data-deletion.html
https://mkos.online/terms.html
```

O domínio precisa encaminhar `/api/*` para o servidor do Cockpit. Se servir apenas arquivos estáticos, as páginas funcionarão, mas o OAuth não chegará ao callback.

Nunca exponha `META_APP_SECRET` no frontend e nunca envie tokens para o browser.

## Publicar carrossel (FluxOS → Meta Graph API)

O FluxOS publica carrosséis delegando ao endpoint serverless — o token permanece
criptografado no Supabase e nunca sai deste handler:

```text
POST <url-do-cockpit>/api/integrations/meta/publish
X-Flux-Secret: <FLUX_PUBLISH_SECRET>
{ "clientId": "<client_id>", "imageUrls": ["https://.../01.png", "..."], "caption": "..." }
```

Variáveis de ambiente:

```env
# cockpit (Vercel e local)
FLUX_PUBLISH_SECRET=<segredo compartilhado com o FluxOS>

# FluxOS (src/config/env.ts; sem elas o publisher do Instagram vira stub)
FLUX_COCKPIT_API_URL=<url-do-cockpit>
FLUX_PUBLISH_SECRET=<mesmo segredo>
```

Fluxo: o FluxOS sobe os slides no bucket público `media` do Supabase Storage
(cria o bucket se não existir), chama o endpoint, que cria os containers de
imagem (`is_carousel_item`), monta o container `CAROUSEL`, aguarda
`status_code=FINISHED` e executa `media_publish`. Retorna `{ platformPostId }`.

A publicação pelo pipeline exige revisão editorial explícita (`--mode publish --reviewed-by <email>`); no modo padrão `review`, nada é publicado.
