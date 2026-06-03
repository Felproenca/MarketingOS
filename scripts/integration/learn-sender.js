'use strict';

const fs = require('fs');
const path = require('path');
const { sendMetrics } = require('./content-client');

async function sendLearnData(slug, contentId = null, options = {}) {
  const publishedPath = path.join(process.cwd(), 'clients', slug, 'published.json');
  const minAgeHours = Number(options.minAgeHours || 48);
  const dryRun = !!options.dryRun;

  if (!fs.existsSync(publishedPath)) {
    console.log(`Nenhum published.json encontrado para ${slug}.`);
    return { sent: 0, skipped: 0 };
  }

  const ledger = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));
  const posts = Array.isArray(ledger) ? ledger : (ledger.posts || []);

  let sent = 0;
  let skipped = 0;

  for (const post of posts) {
    const publishedAt = post.publishedAt || post.published_at;
    const ageHours = publishedAt ? (Date.now() - new Date(publishedAt).getTime()) / 3600000 : Infinity;
    const insights = post.insights || post.metrics;
    const targetContentId = contentId || post.content_id || post.contentId;

    if (!targetContentId || !insights || post.metrics_sent || post.learnSentAt || ageHours < minAgeHours) {
      skipped++;
      continue;
    }

    const payload = normalizeMetrics(post, insights);

    if (dryRun) {
      console.log(`[DRY-RUN] Enviaria metricas: ${targetContentId}`);
    } else {
      await sendMetrics(targetContentId, payload);
      post.metrics_sent = true;
      post.learnSentAt = new Date().toISOString();
      console.log(`Metricas enviadas: ${targetContentId}`);
    }
    sent++;
  }

  if (!dryRun) {
    if (Array.isArray(ledger)) {
      fs.writeFileSync(publishedPath, JSON.stringify(posts, null, 2) + '\n', 'utf8');
    } else {
      ledger.posts = posts;
      ledger._meta = ledger._meta || {};
      ledger._meta.updated_at = new Date().toISOString();
      ledger._meta.count = posts.length;
      fs.writeFileSync(publishedPath, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
    }
  }

  return { sent, skipped };
}

function normalizeMetrics(post, insights) {
  const interactions = insights.total_interactions ?? insights.interactions ?? (
    Number(insights.likes || 0) +
    Number(insights.comments || 0) +
    Number(insights.saved || 0) +
    Number(insights.shares || 0)
  );

  return {
    reach: Number(insights.reach || 0),
    impressions: Number(insights.impressions || 0),
    saved: Number(insights.saved || 0),
    total_interactions: Number(interactions || 0),
    engagement_rate: Number(insights.engagement_rate || 0),
    hook_type: post.hook_type || post.hookType || null,
    theme: post.theme || null,
    nicho: post.nicho || null,
    plataforma: post.channel || post.plataforma || 'instagram',
    media_id: post.mediaId || post.media_id || null,
    format: post.format || null,
  };
}

module.exports = { sendLearnData };
