'use strict';
const fs = require('fs');
const path = require('path');

const STATS_FILE = path.resolve(__dirname, '../site/stats.json');

function readStats() {
  try { return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); }
  catch { return { leads: 0, demos: 0, whatsapp: 0, posts: 0, lastUpdated: '' }; }
}

function updateStats(delta) {
  const stats = readStats();
  Object.entries(delta).forEach(([k, v]) => {
    if (typeof v === 'number') stats[k] = (stats[k] || 0) + v;
    else stats[k] = v;
  });
  stats.lastUpdated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
  return stats;
}

module.exports = { readStats, updateStats };
