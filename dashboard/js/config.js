// config.js — Configuração por cliente
// Trocar os valores antes de fazer deploy

const CONFIG = {
  // Supabase
  SUPABASE_URL:  'https://COLOQUE_SEU_PROJECT_REF.supabase.co',
  SUPABASE_ANON: 'COLOQUE_SUA_ANON_KEY',

  // Cliente ativo
  CLIENT_SLUG: 'pontos-cardeais',

  // Tokens de acesso por link privado
  // URL: ?token=pc-2026-mai-xxxxx
  VALID_TOKENS: ['pc-2026-mai-demo'],

  // Período padrão ao abrir
  DEFAULT_PERIOD: '2026-05',

  // Plano atual (controla seção de upgrade)
  // 'essencial' | 'head-implantado' | 'performance'
  PLAN: 'head-implantado',

  // Benchmarks do nicho para o simulador
  CPL_NICHO:    28,    // custo por lead via ads (seguros)
  TICKET_MEDIO: 1750,  // ticket médio padrão
  CONV_RATE:    0.17,  // taxa de conversão padrão

  // Contexto do mês (atualizar mensalmente)
  TEMA_MES:       '40 anos de história. O primeiro mês digital.',
  MES_OPERACAO:   1,
  PERIODO_LABEL:  'Maio 2026',

  // WhatsApp comercial (para CTAs do dashboard)
  WHATSAPP_COMERCIAL: '5521965239011',
};
