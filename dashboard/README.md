# Dashboard MarketingOS — Deploy e Configuração

Dashboard vivo por cliente. Conecta ao Supabase para dados em tempo real.
Hospedado no Netlify — acessado via link privado ou subdomínio do cliente.

---

## 1. Supabase — criar as tabelas

No painel do Supabase, execute o SQL completo:

```sql
CREATE TABLE metrics_daily (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  date date NOT NULL,
  leads int DEFAULT 0,
  cotacoes int DEFAULT 0,
  conversoes int DEFAULT 0,
  receita numeric DEFAULT 0,
  alcance int DEFAULT 0,
  cliques_cta int DEFAULT 0,
  whatsapp int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE instagram_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  period_month text NOT NULL,
  seguidores int DEFAULT 0,
  seguidores_gain int DEFAULT 0,
  alcance_mensal int DEFAULT 0,
  engajamento numeric DEFAULT 0,
  posts_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE content_top (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  period_month text NOT NULL,
  position int,
  tipo text,
  titulo text,
  alcance int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  period_month text NOT NULL,
  leads_proj int DEFAULT 0,
  leads_meta int DEFAULT 0,
  cotacoes_proj int DEFAULT 0,
  cotacoes_meta int DEFAULT 0,
  conv_proj int DEFAULT 0,
  conv_meta int DEFAULT 0,
  receita_proj numeric DEFAULT 0,
  receita_meta numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  period_month text NOT NULL,
  prioridade text,
  titulo text,
  descricao text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE leads_by_channel (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_slug text NOT NULL,
  period_month text NOT NULL,
  canal text,
  quantidade int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS + leitura pública (acesso controlado pelo token na URL)
ALTER TABLE metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_top ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_by_channel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON metrics_daily FOR SELECT USING (true);
CREATE POLICY "public_read" ON instagram_stats FOR SELECT USING (true);
CREATE POLICY "public_read" ON content_top FOR SELECT USING (true);
CREATE POLICY "public_read" ON goals FOR SELECT USING (true);
CREATE POLICY "public_read" ON actions FOR SELECT USING (true);
CREATE POLICY "public_read" ON leads_by_channel FOR SELECT USING (true);
```

---

## 2. Configurar js/config.js

Abrir `js/config.js` e preencher:

```javascript
SUPABASE_URL:  'https://SEU_PROJECT_REF.supabase.co',
SUPABASE_ANON: 'SUA_ANON_KEY',
CLIENT_SLUG:   'pontos-cardeais',
VALID_TOKENS:  ['pc-2026-mai-xxxxx'],  // gerar token aleatório
```

A URL e a ANON KEY estão em: Supabase → Settings → API.

---

## 3. Inserir dados do primeiro mês

No painel do Supabase (Table Editor), inserir dados diários ou via SQL:

```sql
-- Exemplo: dados agregados do mês como um único registro
INSERT INTO metrics_daily (client_slug, date, leads, cotacoes, conversoes, receita, alcance)
VALUES ('pontos-cardeais', '2026-05-31', 47, 31, 8, 14200, 12400);

INSERT INTO instagram_stats (client_slug, period_month, seguidores, seguidores_gain, alcance_mensal, engajamento, posts_count)
VALUES ('pontos-cardeais', '2026-05', 1840, 124, 12400, 4.2, 8);

INSERT INTO goals (client_slug, period_month, leads_proj, leads_meta, cotacoes_proj, cotacoes_meta, conv_proj, conv_meta, receita_proj, receita_meta)
VALUES ('pontos-cardeais', '2026-05', 40, 80, 25, 50, 6, 15, 12000, 26000);
```

---

## 4. Testar localmente

O dashboard usa CDN para o Supabase — funciona em arquivo local com um servidor HTTP simples:

```bash
# Python
python -m http.server 8080
# então abrir: http://localhost:8080

# Node
npx serve .
```

Sem servidor, o Supabase não carrega (CORS em file://). Os dados de fallback estáticos aparecem normalmente.

---

## 5. Deploy no Netlify

**Opção A — Drag & Drop:**
1. Acessar netlify.com/drop
2. Arrastar a pasta `/dashboard/` completa
3. URL gerada: `[nome-aleatorio].netlify.app`

**Opção B — CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dashboard
```

---

## 6. DNS — subdomínio do cliente

No painel DNS do cliente, adicionar registro CNAME:

```
Tipo:  CNAME
Nome:  dashboard
Valor: [nome].netlify.app
TTL:   3600
```

Após propagação (até 24h), configurar domínio customizado no painel Netlify:
Site Settings → Domain management → Add custom domain.

**Resultado:** `dashboard.pontoscardeais.com.br`

---

## 7. Acesso por link privado (sem domínio customizado)

URL com token: `https://[nome].netlify.app?token=pc-2026-mai-xxxxx`

O token deve estar cadastrado em `config.js > VALID_TOKENS`.
Gerar um token único por cliente, por mês se necessário.

---

## 8. Atualizar dados mensalmente

Inserir novos registros no Supabase com `period_month` do novo mês.
O dashboard atualiza automaticamente a cada 30 minutos — sem redeploy necessário.

Para adicionar um período ao seletor, editar `index.html`:
```html
<button class="pt" data-period="2026-06" onclick="setPeriod('2026-06')">Jun 2026</button>
```

---

## Estrutura de arquivos

```
/dashboard
  index.html              → dashboard completo (HTML + CSS)
  js/
    config.js             → configuração por cliente
    supabase-client.js    → queries ao banco
    dashboard.js          → renderização e atualização
    simulator.js          → simulador interativo de orçamento
  README.md               → este arquivo
```

---

*MarketingOS · Dashboard v1.0*
