// Publicação de carrossel no Instagram via Meta Graph API.
// Fluxo: containers por imagem (is_carousel_item) -> container CAROUSEL -> poll status_code -> media_publish.
// `call` é injetado (mesmo contrato de _lib/meta.js) para permitir teste unitário sem rede.

const POLL_ATTEMPTS = 12
const POLL_INTERVAL_MS = 5000
const MAX_CAPTION_LENGTH = 2200

export async function publishCarousel({ accessToken, igUserId, imageUrls, caption, call, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
  if (!imageUrls?.length) throw new Error('Carrossel exige ao menos uma imagem.')

  const children = []
  for (const imageUrl of imageUrls) {
    const item = await call(`/${igUserId}/media`, { image_url: imageUrl, is_carousel_item: 'true', access_token: accessToken })
    if (!item?.id) throw new Error('Meta não retornou id do container de imagem.')
    children.push(String(item.id))
  }

  const container = await call(`/${igUserId}/media`, {
    media_type: 'CAROUSEL',
    children: children.join(','),
    caption: String(caption || '').slice(0, MAX_CAPTION_LENGTH),
    access_token: accessToken,
  })
  if (!container?.id) throw new Error('Meta não retornou id do container do carrossel.')
  const containerId = String(container.id)

  let finished = false
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const status = await call(`/${containerId}`, { fields: 'status_code', access_token: accessToken })
    if (status?.status_code === 'FINISHED') { finished = true; break }
    if (status?.status_code === 'ERROR') throw new Error(`Container em erro: ${status.status || 'sem detalhe'}`)
    await sleep(POLL_INTERVAL_MS)
  }
  if (!finished) throw new Error(`Container ainda não FINISHED após ${(POLL_ATTEMPTS * POLL_INTERVAL_MS) / 1000}s; abortando sem publicar.`)

  const published = await call(`/${containerId}/media_publish`, { access_token: accessToken })
  if (!published?.id) throw new Error('Meta não retornou id da publicação.')
  return { platformPostId: String(published.id) }
}
