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
  if (data.error) throw new Error(`Facebook API: ${data.error.message} (code ${data.error.code})`);
  return data;
}

async function apiGet(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(`Facebook API: ${data.error.message} (code ${data.error.code})`);
  return data;
}

// Obtém o Page Access Token a partir do User Token
async function getPageToken(pageId, userToken) {
  const data = await apiGet(`/${pageId}`, {
    fields: 'name,access_token',
    access_token: userToken,
  });
  if (!data.access_token) throw new Error('Page token não retornado — verifique se o token tem pages_manage_posts');
  return { name: data.name, pageToken: data.access_token };
}

// Valida acesso à página
async function validatePageAccess(pageId, userToken) {
  return getPageToken(pageId, userToken);
}

// Publica post de texto simples
async function publishTextPost(pageId, pageToken, message) {
  return apiPost(`/${pageId}/feed`, { message, access_token: pageToken });
}

// Publica post com imagem única
async function publishPhotoPost(pageId, pageToken, imageUrl, caption) {
  return apiPost(`/${pageId}/photos`, {
    url: imageUrl,
    caption,
    access_token: pageToken,
  });
}

// Publica múltiplas imagens como álbum (até 10)
// Fluxo: faz upload de cada imagem com published:false → cria post com attached_media
async function publishAlbumPost(pageId, pageToken, imageUrls, caption) {
  if (imageUrls.length === 0) throw new Error('Nenhuma imagem fornecida');
  if (imageUrls.length === 1) return publishPhotoPost(pageId, pageToken, imageUrls[0], caption);

  // Upload cada imagem sem publicar
  const photoIds = [];
  for (let i = 0; i < imageUrls.length; i++) {
    process.stdout.write(`\n  Foto ${i + 1}/${imageUrls.length}...`);
    const res = await apiPost(`/${pageId}/photos`, {
      url: imageUrls[i],
      published: false,
      temporary: true,
      access_token: pageToken,
    });
    photoIds.push(res.id);
    console.log(` ✓ ${res.id}`);
    if (i < imageUrls.length - 1) await new Promise(r => setTimeout(r, 1000));
  }

  // Cria post com todas as fotos
  process.stdout.write('\n  Criando álbum...');
  const post = await apiPost(`/${pageId}/feed`, {
    message: caption,
    attached_media: photoIds.map(id => ({ media_fbid: id })),
    access_token: pageToken,
  });
  console.log(` ✓ ${post.id}`);

  return post;
}

async function getPermalink(postId, pageToken) {
  try {
    const data = await apiGet(`/${postId}`, {
      fields: 'permalink_url',
      access_token: pageToken,
    });
    return data.permalink_url || null;
  } catch {
    return null;
  }
}

module.exports = {
  validatePageAccess,
  publishTextPost,
  publishPhotoPost,
  publishAlbumPost,
  getPermalink,
};
