create table if not exists public.oauth_sessions (
  state text primary key,
  client_id text not null,
  user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.client_memberships (
  client_id text not null,
  user_id uuid not null,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

create table if not exists public.client_profiles (
  client_id text primary key,
  display_name text not null,
  company_name text,
  status text not null default 'onboarding',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_now_sync_runs (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  source text not null,
  trigger text not null default 'manual',
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  raw_records integer not null default 0,
  normalized_records integer not null default 0,
  error_count integer not null default 0,
  last_error text
);

create table if not exists public.data_now_raw (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.data_now_sync_runs(id),
  client_id text not null,
  source text not null,
  entity_type text not null,
  entity_id text not null,
  observed_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.data_now_normalized (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.data_now_sync_runs(id),
  schema_version text not null default '1.0',
  client_id text not null,
  source text not null,
  source_account_id text,
  entity_type text not null,
  entity_id text not null,
  period_start timestamptz,
  period_end timestamptz,
  observed_at timestamptz not null,
  metrics jsonb not null default '{}'::jsonb,
  raw_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.client_references (
  client_id text primary key references public.client_profiles(client_id) on delete cascade,
  brand_profile jsonb not null default '{}'::jsonb,
  voice_profile jsonb not null default '{}'::jsonb,
  offers jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  approved_examples jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.work_requests (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  title text not null,
  request_type text not null,
  objective text,
  priority text not null default 'normal',
  source_system text not null default 'marketingos',
  target_system text not null,
  status text not null default 'queued',
  requires_approval boolean not null default true,
  reference_snapshot jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.work_requests(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.oauth_sessions add column if not exists user_id uuid;

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  source text not null,
  source_account_id text,
  page_id text,
  username text,
  access_token_encrypted text not null,
  expires_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, source)
);

alter table public.oauth_sessions enable row level security;
alter table public.connections enable row level security;
alter table public.client_memberships enable row level security;
alter table public.client_profiles enable row level security;
alter table public.data_now_sync_runs enable row level security;
alter table public.data_now_raw enable row level security;
alter table public.data_now_normalized enable row level security;
alter table public.client_references enable row level security;
alter table public.work_requests enable row level security;
alter table public.work_request_events enable row level security;
revoke all on public.oauth_sessions from anon, authenticated;
revoke all on public.connections from anon, authenticated;
revoke all on public.client_memberships from anon, authenticated;
revoke all on public.client_profiles from anon, authenticated;
revoke all on public.data_now_sync_runs from anon, authenticated;
revoke all on public.data_now_raw from anon, authenticated;
revoke all on public.data_now_normalized from anon, authenticated;
revoke all on public.client_references from anon, authenticated;
revoke all on public.work_requests from anon, authenticated;
revoke all on public.work_request_events from anon, authenticated;
grant all on public.oauth_sessions to service_role;
grant all on public.connections to service_role;
grant all on public.client_memberships to service_role;
grant all on public.client_profiles to service_role;
grant all on public.data_now_sync_runs to service_role;
grant all on public.data_now_raw to service_role;
grant all on public.data_now_normalized to service_role;
grant all on public.client_references to service_role;
grant all on public.work_requests to service_role;
grant all on public.work_request_events to service_role;

insert into public.client_profiles (client_id, display_name, company_name, status, updated_at)
values
  ('toqueindiano', 'Toque Indiano', 'Toque Indiano', 'active', now()),
  ('fortunato', 'Fortunato', 'Fortunato', 'active', now()),
  ('bruno-capelli', 'Bruno Capelli', 'Bruno Capelli', 'active', now()),
  ('forca-da-terra', 'Forca da Terra', 'Forca da Terra', 'active', now())
on conflict (client_id) do update set
  display_name = excluded.display_name,
  company_name = excluded.company_name,
  status = excluded.status,
  updated_at = now();

insert into public.client_references (
  client_id,
  brand_profile,
  voice_profile,
  offers,
  constraints,
  approved_examples,
  notes,
  updated_at
)
values
  (
    'toqueindiano',
    '{"positioning":"Loja de roupa feminina com tema indiano.","audience":"Mulheres interessadas em moda feminina, estilo marcante e estetica indiana.","visual_direction":"Moda feminina com inspiracao indiana; manter detalhes culturais como referencia estetica, sem exagerar promessas ou estereotipos."}'::jsonb,
    '{"tone":"Elegante, sensorial e proximo.","vocabulary":["moda feminina","tema indiano","estilo","pecas","beleza"]}'::jsonb,
    '["Roupas femininas com tema indiano"]'::jsonb,
    '["Nao inventar origem, preco, estoque, tecidos ou promocao sem confirmacao.","Nao usar referencias culturais de forma caricata."]'::jsonb,
    '[]'::jsonb,
    'Referencia inicial criada a partir do cadastro operacional. Completar com ofertas, exemplos aprovados e restricoes reais.',
    now()
  ),
  (
    'fortunato',
    '{"positioning":"Trader de mercado americano.","audience":"Pessoas interessadas em trading, bolsa americana, leitura de mercado e tomada de decisao financeira.","visual_direction":"Visual financeiro, objetivo e confiavel; priorizar clareza, graficos e autoridade sem promessas de ganho."}'::jsonb,
    '{"tone":"Direto, tecnico e responsavel.","vocabulary":["mercado americano","trading","risco","estrategia","leitura de mercado"]}'::jsonb,
    '["Conteudo e analises sobre mercado americano"]'::jsonb,
    '["Nao prometer rentabilidade.","Nao sugerir garantia de resultado.","Nao tratar conteudo como recomendacao individual de investimento sem aprovacao."]'::jsonb,
    '[]'::jsonb,
    'Referencia inicial criada a partir do cadastro operacional. Completar com compliance, exemplos aprovados e produtos/ofertas reais.',
    now()
  ),
  (
    'bruno-capelli',
    '{"positioning":"Salao de beleza premium.","audience":"Clientes que valorizam beleza, atendimento premium, confianca tecnica e experiencia de alto padrao.","visual_direction":"Premium, limpo, sofisticado e aspiracional; foco em transformacao, detalhe e experiencia."}'::jsonb,
    '{"tone":"Sofisticado, acolhedor e especialista.","vocabulary":["premium","beleza","transformacao","experiencia","cuidado"]}'::jsonb,
    '["Servicos premium de beleza e salao"]'::jsonb,
    '["Nao inventar procedimentos, valores ou resultados garantidos.","Usar antes/depois apenas com autorizacao e contexto real."]'::jsonb,
    '[]'::jsonb,
    'Referencia inicial criada a partir do cadastro operacional. Completar com servicos, tratamentos, agenda e provas reais.',
    now()
  ),
  (
    'forca-da-terra',
    '{"positioning":"Producao e venda de produtos naturais de beleza e bem estar.","audience":"Pessoas interessadas em autocuidado, beleza natural, bem estar e produtos com apelo natural.","visual_direction":"Natural, artesanal, confiavel e sensorial; valorizar ingredientes, processo e uso responsavel."}'::jsonb,
    '{"tone":"Natural, cuidadoso e educativo.","vocabulary":["natural","bem estar","beleza","autocuidado","produtos naturais"]}'::jsonb,
    '["Produtos naturais de beleza e bem estar"]'::jsonb,
    '["Nao fazer alegacoes medicas sem comprovacao.","Nao prometer cura, tratamento ou resultado garantido.","Nao inventar ingredientes ou certificacoes."]'::jsonb,
    '[]'::jsonb,
    'Referencia inicial criada a partir do cadastro operacional. Completar com catalogo, ingredientes, restricoes legais e provas reais.',
    now()
  )
on conflict (client_id) do update set
  brand_profile = excluded.brand_profile,
  voice_profile = excluded.voice_profile,
  offers = excluded.offers,
  constraints = excluded.constraints,
  approved_examples = excluded.approved_examples,
  notes = excluded.notes,
  updated_at = now();
