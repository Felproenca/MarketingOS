'use strict';

function parseStat(stats, keywords) {
  const entry = stats?.find(s => keywords.some(k => s.label?.includes(k)));
  return entry?.value || '—';
}

function detectPostTypes(posts) {
  const types = { reels: 0, carousel: 0, feed: 0, shorts: 0, video: 0 };
  for (const p of posts) {
    if (p.isReel) types.reels++;
    else if (p.isCarousel) types.carousel++;
    else if (p.isShort) types.shorts++;
    else if (p.isVideo || p.duration) types.video++;
    else types.feed++;
  }
  return Object.entries(types).filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k} (${v})`)
    .join(', ');
}

function extractHashtags(posts) {
  const freq = {};
  for (const p of posts) {
    const tags = (p.hashtags || []).concat((p.imgAlt || '').match(/#\w+/g) || []);
    tags.forEach(tag => { freq[tag] = (freq[tag] || 0) + 1; });
  }
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([tag, count]) => `${tag} (${count}x)`)
    .join(', ');
}

function estimateFrequency(posts) {
  const dates = posts.map(p => p.date).filter(Boolean);
  if (dates.length < 2) return 'insuficiente para calcular';

  // Try to parse relative dates in Portuguese
  const recent = dates.slice(0, 6);
  const hasDays = recent.some(d => /dia|semana|hora/i.test(d));
  const hasWeeks = recent.some(d => /semana/i.test(d));

  if (hasDays && !hasWeeks) return 'alta — múltiplos posts por semana';
  if (hasWeeks) return 'moderada — ~1-2 posts por semana';
  return 'baixa ou irregular';
}

function buildReport(data, clientSlug, targetLabel) {
  const date = new Date().toISOString().slice(0, 10);
  const followers = parseStat(data.stats, ['seguidor', 'inscrit', 'subscriber']);
  const following = parseStat(data.stats, ['seguindo', 'following']);
  const postsCount = parseStat(data.stats, ['publicação', 'post', 'vídeo', 'video']);

  const postTypes = detectPostTypes(data.posts);
  const hashtags = extractHashtags(data.posts);
  const frequency = estimateFrequency(data.posts);

  // Top engaging posts (with likes info)
  const withLikes = data.posts.filter(p => p.likes);
  const topPosts = withLikes.slice(0, 3);

  const lines = [
    `# Investigação Sherlock — ${data.fullName || data.handle}`,
    `**Data:** ${date}`,
    `**Plataforma:** ${data.platform}`,
    `**Alvo:** ${data.handle || targetLabel}`,
    `**Cliente:** ${clientSlug}`,
    '',
    '---',
    '',
    '## Perfil',
    '',
    `| Campo | Dado |`,
    `|---|---|`,
    `| Nome | ${data.fullName || '—'} |`,
    `| Handle | ${data.handle || '—'} |`,
    `| Seguidores | ${followers} |`,
    following !== '—' ? `| Seguindo | ${following} |` : null,
    postsCount !== '—' ? `| Publicações | ${postsCount} |` : null,
    data.category ? `| Categoria | ${data.category} |` : null,
    data.link ? `| Link | ${data.link} |` : null,
  ].filter(l => l !== null);

  if (data.bio) {
    lines.push('', '**Bio:**', `> ${data.bio.replace(/\n/g, '  \n> ')}`, '');
  }

  lines.push(
    '',
    '---',
    '',
    '## Análise de Conteúdo',
    '',
    `**Posts analisados:** ${data.posts.length}`,
    `**Tipos de formato:** ${postTypes || '—'}`,
    `**Frequência estimada:** ${frequency}`,
    `**Hashtags mais usadas:** ${hashtags || '—'}`,
    '',
  );

  if (topPosts.length > 0) {
    lines.push('### Top posts (por engajamento)');
    topPosts.forEach((p, i) => {
      lines.push('', `**${i + 1}.** ${p.imgAlt?.slice(0, 80) || p.url || '—'}`);
      if (p.likes) lines.push(`   Likes: ${p.likes} | Comentários: ${p.commentCount || '—'}`);
      if (p.date) lines.push(`   Data: ${p.date}`);
      if (p.hashtags?.length) lines.push(`   Hashtags: ${p.hashtags.join(' ')}`);
    });
    lines.push('');
  }

  if (data.posts.length > 0) {
    lines.push(
      '### Grade de conteúdo (últimos posts)',
      '',
      '| # | Tipo | Tema / Caption | Engajamento | Data |',
      '|---|---|---|---|---|',
    );
    data.posts.slice(0, 12).forEach((p, i) => {
      const type = p.isReel ? 'Reel' : p.isCarousel ? 'Carrossel' : p.isShort ? 'Short' : p.isVideo ? 'Vídeo' : 'Feed';
      const theme = (p.imgAlt || p.text || '').slice(0, 50).replace(/\|/g, '/');
      const eng = p.likes ? `${p.likes} likes` : p.views ? p.views : p.reactions ? p.reactions : '—';
      const dt = p.date || '—';
      lines.push(`| ${i + 1} | ${type} | ${theme} | ${eng} | ${dt} |`);
    });
    lines.push('');
  }

  lines.push(
    '---',
    '',
    '## Posicionamento (preencher manualmente após análise)',
    '',
    '```',
    'Proposta de valor percebida: ',
    'Tom de voz: ',
    'Persona do conteúdo: ',
    'Diferencial explicitado: ',
    'Preço/oferta visível: ',
    '```',
    '',
    '---',
    '',
    '## Gaps e Oportunidades (preencher após cruzar com client.md)',
    '',
    '```',
    'O que eles fazem bem que o cliente ainda não faz:',
    '  - ',
    '',
    'O que o cliente faz melhor ou diferente:',
    '  - ',
    '',
    'Temas que eles ignoram mas o público quer:',
    '  - ',
    '',
    'Ângulos de copy não explorados:',
    '  - ',
    '```',
    '',
    '---',
    '',
    '## Benchmarks extraídos',
    '',
    `| Métrica | Valor |`,
    `|---|---|`,
    `| Seguidores | ${followers} |`,
    `| Posts analisados | ${data.posts.length} |`,
    `| Formatos | ${postTypes || '—'} |`,
    `| Frequência | ${frequency} |`,
    `| Hashtags recorrentes | ${hashtags?.split(',')[0] || '—'} |`,
    '',
    '---',
    '',
    `*Gerado por MarketingOS Sherlock — ${date}*`,
  );

  return lines.join('\n');
}

module.exports = { buildReport };
