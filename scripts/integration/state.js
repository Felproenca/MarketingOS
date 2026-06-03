'use strict';

const fs = require('fs');
const path = require('path');

const STATE_DIR = path.join(process.cwd(), '.marketingos');
const STATE_FILE = path.join(STATE_DIR, 'social-content.json');

function rememberContent(contentId, data) {
  if (!contentId) return;
  const state = loadState();
  state.contents[contentId] = {
    ...(state.contents[contentId] || {}),
    ...data,
    content_id: contentId,
    updated_at: new Date().toISOString(),
  };
  saveState(state);
}

function getContent(contentId) {
  return loadState().contents[contentId] || null;
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { contents: {} };
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    parsed.contents = parsed.contents || {};
    return parsed;
  } catch {
    return { contents: {} };
  }
}

function saveState(state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

module.exports = { rememberContent, getContent };
