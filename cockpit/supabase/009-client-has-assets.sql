-- 009-client-has-assets.sql — flag de assets próprios do cliente (aditivo)
-- Quando true, o sistema NÃO gera mídia (Fal/geração) — usa os assets do cliente
-- e compõe o conteúdo/copy ao redor deles (economia real de custo).
alter table public.client_profiles add column if not exists has_assets boolean not null default false;

-- Marca clientes que forneceram brand kit/assets (ex.: Fortunato)
-- update public.client_profiles set has_assets = true where client_id = 'fortunato';
