import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveArtifactImageUrls } from '../api/_lib/meta-handlers/publish.js'

test('recupera URLs renderizadas de resultado estruturado', () => {
  const artifact = { metadata: { result: { structured: { rendered_urls: ['https://cdn.test/1.svg', 'https://cdn.test/2.svg'] } } } }
  const result = resolveArtifactImageUrls(artifact)
  assert.deepEqual(result.publishUrls, ['https://cdn.test/1.svg', 'https://cdn.test/2.svg'])
})

test('combina preview e manifest da versão corrente', () => {
  const artifact = { metadata: { preview_url: 'https://cdn.test/preview.png' } }
  const version = { preview_url: 'https://cdn.test/version.png', manifest: { rendered_urls: ['https://cdn.test/manifest.png'] } }
  const result = resolveArtifactImageUrls(artifact, version)
  assert.deepEqual(result.publishUrls, ['https://cdn.test/preview.png', 'https://cdn.test/version.png', 'https://cdn.test/manifest.png'])
})

test('preserva URLs registradas para o gate de pertencimento', () => {
  const artifact = { metadata: { assets: [{ url: 'https://cdn.test/ok.png' }] } }
  const result = resolveArtifactImageUrls(artifact, {}, ['https://cdn.test/external.png'])
  assert.deepEqual(result.registered, ['https://cdn.test/ok.png'])
  assert.deepEqual(result.publishUrls, ['https://cdn.test/external.png'])
  assert.equal(result.registered.includes(result.publishUrls[0]), false)
})
