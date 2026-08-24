import { test } from 'node:test'
import assert from 'node:assert/strict'
import { publishCarousel } from '../api/_lib/instagram-carousel.js'

const noSleep = () => Promise.resolve()

function fakeCall(script) {
  return async (pathname, params) => {
    const handler = script[pathname]
    if (!handler) throw new Error(`chamada inesperada: ${pathname}`)
    return handler(params)
  }
}

test('publica carrossel completo (containers -> carrossel -> publish)', async () => {
  const uploaded = []
  const call = fakeCall({
    '/1/media': (params) => {
      if (params.media_type === 'CAROUSEL') {
        assert.equal(params.children, 'img1,img2')
        assert.equal(params.caption, 'Legenda do post')
        return { id: 'container-1' }
      }
      uploaded.push(params.image_url)
      assert.equal(params.is_carousel_item, 'true')
      return { id: `img${uploaded.length}` }
    },
    '/container-1': () => ({ status_code: 'FINISHED' }),
    '/container-1/media_publish': () => ({ id: 'media-final' }),
  })
  const result = await publishCarousel({
    accessToken: 'tok', igUserId: '1',
    imageUrls: ['https://cdn.example/a.png', 'https://cdn.example/b.png'],
    caption: 'Legenda do post', call, sleep: noSleep,
  })
  assert.equal(result.platformPostId, 'media-final')
  assert.deepEqual(uploaded, ['https://cdn.example/a.png', 'https://cdn.example/b.png'])
})

test('faz polling até FINISHED antes de publicar', async () => {
  const states = ['IN_PROGRESS', 'IN_PROGRESS', 'FINISHED']
  let polls = 0
  const call = fakeCall({
    '/1/media': (params) => (params.media_type === 'CAROUSEL' ? { id: 'c1' } : { id: 'img1' }),
    '/c1': () => ({ status_code: states[polls++] }),
    '/c1/media_publish': () => ({ id: 'm1' }),
  })
  const result = await publishCarousel({ accessToken: 't', igUserId: '1', imageUrls: ['https://cdn/x.png'], caption: '', call, sleep: noSleep })
  assert.equal(result.platformPostId, 'm1')
  assert.equal(polls, 3)
})

test('aborta quando o container entra em erro', async () => {
  const call = fakeCall({
    '/1/media': () => ({ id: 'img1' }),
    '/img1': () => ({ status_code: 'ERROR', status: 'failed processing' }),
  })
  await assert.rejects(
    publishCarousel({ accessToken: 't', igUserId: '1', imageUrls: ['https://cdn/x.png'], caption: '', call, sleep: noSleep }),
    /Container em erro: failed processing/,
  )
})

test('rejeita carrossel sem imagens', async () => {
  const call = fakeCall({})
  await assert.rejects(
    publishCarousel({ accessToken: 't', igUserId: '1', imageUrls: [], caption: '', call, sleep: noSleep }),
    /ao menos uma imagem/,
  )
})
