// supabase-client.js — Queries ao Supabase
// Requer: CDN supabase UMD carregado antes (window.supabase)

let db = null;

function getDB() {
  if (!db) {
    const { createClient } = window.supabase;
    db = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON);
  }
  return db;
}

async function getMetricsPeriod(slug, period) {
  const [year, month] = period.split('-');
  const startDate = `${year}-${month}-01`;
  const endDate   = `${year}-${month}-31`;
  try {
    const { data, error } = await getDB()
      .from('metrics_daily')
      .select('*')
      .eq('client_slug', slug)
      .gte('date', startDate)
      .lte('date', endDate);
    if (error || !data || !data.length) return null;
    return data.reduce((acc, row) => ({
      leads:      (acc.leads      || 0) + (row.leads      || 0),
      cotacoes:   (acc.cotacoes   || 0) + (row.cotacoes   || 0),
      conversoes: (acc.conversoes || 0) + (row.conversoes || 0),
      receita:    (acc.receita    || 0) + parseFloat(row.receita || 0),
      alcance:    (acc.alcance    || 0) + (row.alcance    || 0),
      cliques_cta:(acc.cliques_cta|| 0) + (row.cliques_cta|| 0),
      whatsapp:   (acc.whatsapp   || 0) + (row.whatsapp   || 0),
    }), {});
  } catch(e) { return null; }
}

async function getInstagramStats(slug, period) {
  try {
    const { data } = await getDB()
      .from('instagram_stats')
      .select('*')
      .eq('client_slug', slug)
      .eq('period_month', period)
      .single();
    return data;
  } catch(e) { return null; }
}

async function getContentTop(slug, period) {
  try {
    const { data } = await getDB()
      .from('content_top')
      .select('*')
      .eq('client_slug', slug)
      .eq('period_month', period)
      .order('position');
    return data;
  } catch(e) { return null; }
}

async function getGoals(slug, period) {
  try {
    const { data } = await getDB()
      .from('goals')
      .select('*')
      .eq('client_slug', slug)
      .eq('period_month', period)
      .single();
    return data;
  } catch(e) { return null; }
}

async function getActions(slug, period) {
  try {
    const { data } = await getDB()
      .from('actions')
      .select('*')
      .eq('client_slug', slug)
      .eq('period_month', period)
      .order('created_at');
    return data;
  } catch(e) { return null; }
}

async function getLeadsByChannel(slug, period) {
  try {
    const { data } = await getDB()
      .from('leads_by_channel')
      .select('*')
      .eq('client_slug', slug)
      .eq('period_month', period)
      .order('quantidade', { ascending: false });
    return data;
  } catch(e) { return null; }
}

// Expor no escopo global
window.DB = {
  getMetricsPeriod,
  getInstagramStats,
  getContentTop,
  getGoals,
  getActions,
  getLeadsByChannel,
};
