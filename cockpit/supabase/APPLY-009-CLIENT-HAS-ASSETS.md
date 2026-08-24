# Aplicar a migração 009 — has_assets

Aditiva. Execute no **SQL Editor** do Supabase:

1. `009-client-has-assets.sql`

Depois, marque os clientes que têm assets próprios:

```sql
update public.client_profiles set has_assets = true where client_id in ('fortunato', 'bruno-capelli');
```

Efeito: quando `has_assets = true`, o executor NÃO despacha `image_generate`/`video_generate`
(não gasta Fal) e injeta no prompt "use os assets do cliente" para carrossel/post/design.
