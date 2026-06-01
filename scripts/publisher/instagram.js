'use strict';

const BASE = 'https://graph.facebook.com/v19.0';

async function apiPost(path, params) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Meta API: ${data.error.message} (code ${data.error.code})`);
  return data;
}

async function apiGet(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(`Meta API: ${data.error.message} (code ${data.error.code})`);
  return data;
}

async function validateToken(accessToken) {
  const data = await apiGet('/me', { fields: 'id,name', access_token: accessToken });
  return data;
}

// Single image/reel container
async function createMediaContainer(igUserId, params, accessToken) {
  return apiPost(`/${igUserId}/media`, { ...params, access_token: accessToken });
}

// Carousel item (image only, no caption)
async function createCarouselItem(igUserId, imageUrl, accessToken) {
  return createMediaContainer(igUserId, {
    image_url: imageUrl,
    is_carousel_item: true,
  }, accessToken);
}

// Carousel parent container
async function createCarouselContainer(igUserId, childrenIds, caption, accessToken) {
  return createMediaContainer(igUserId, {
    media_type: 'CAROUSEL',
    children: childrenIds.join(','),
    caption,
  }, accessToken);
}

// Single feed image
async function createFeedContainer(igUserId, imageUrl, caption, accessToken) {
  return createMediaContainer(igUserId, { image_url: imageUrl, caption }, accessToken);
}

// Reels (video)
async function createReelContainer(igUserId, videoUrl, caption, accessToken) {
  return createMediaContainer(igUserId, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    share_to_feed: true,
  }, accessToken);
}

// Story (image)
async function createStoryContainer(igUserId, imageUrl, accessToken) {
  return createMediaContainer(igUserId, {
    media_type: 'STORIES',
    image_url: imageUrl,
  }, accessToken);
}

// Publish a ready container
async function publishContainer(igUserId, containerId, accessToken) {
  return apiPost(`/${igUserId}/media_publish`, {
    creation_id: containerId,
    access_token: accessToken,
  });
}

// Poll container status until ready (max 5min for videos)
async function waitForContainer(containerId, accessToken, maxWaitMs = 300000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const data = await apiGet(`/${containerId}`, {
      fields: 'status_code,status',
      access_token: accessToken,
    });
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error(`Container falhou: ${data.status}`);
    await new Promise(r => setTimeout(r, 5000));
    process.stdout.write('.');
  }
  throw new Error('Container demorou demais para processar. Tente novamente.');
}

async function getPermalink(mediaId, accessToken) {
  try {
    const data = await apiGet(`/${mediaId}`, { fields: 'permalink', access_token: accessToken });
    return data.permalink;
  } catch {
    return null;
  }
}

module.exports = {
  validateToken,
  createFeedContainer,
  createCarouselItem,
  createCarouselContainer,
  createReelContainer,
  createStoryContainer,
  publishContainer,
  waitForContainer,
  getPermalink,
};
