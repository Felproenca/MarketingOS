import test from 'node:test'
import assert from 'node:assert/strict'
import { loadSkillRegistry, validateSkillRegistry, skillForCapability, skillForRequestType, skillForId, skillsForSelection } from '../api/_lib/skill-registry.js'
import { capabilityCatalog } from '../api/_lib/capability-catalog.js'

test('registry carrega e cada skill nao arquivada tem executor e frontend metadata', () => {
  const registry = loadSkillRegistry()
  assert.ok(registry.skills.length >= 18)
  for (const skill of registry.skills.filter(item => item.status !== 'archived')) {
    assert.ok(skill.executor, `${skill.skill_id}: executor ausente`)
    assert.ok(Array.isArray(skill.qa), `${skill.skill_id}: qa deve ser array`)
    assert.ok(skill.label, `${skill.skill_id}: label ausente`)
    assert.ok(skill.category, `${skill.skill_id}: category ausente`)
    assert.ok(skill.owner, `${skill.skill_id}: owner ausente`)
  }
})

test('skillForCapability resolve skills de roteamento', () => {
  assert.equal(skillForCapability('carousel')?.skill_id, 'criacao-carousel')
  assert.equal(skillForCapability('image_generate')?.skill_id, 'criacao-image-generation')
  assert.equal(skillForCapability('research')?.skill_id, 'topic-intelligence')
  assert.equal(skillForCapability('publish')?.skill_id, 'publish')
  assert.equal(skillForCapability('video_edit')?.skill_id, 'video-edit')
  assert.equal(skillForCapability('analysis')?.skill_id, 'data-analysis')
})

test('skillForRequestType cobre os tipos de solicitação do sistema', () => {
  for (const type of ['carousel', 'post', 'research', 'image', 'generative_video', 'video', 'funnel', 'ads', 'prospecting', 'automation', 'analysis', 'data_sync', 'publish']) {
    assert.ok(skillForRequestType(type), `sem skill para request_type=${type}`)
  }
})

test('skillsForSelection exclui skills de sistema e retorna shape do frontend', () => {
  const skills = skillsForSelection()
  assert.ok(skills.length >= 14)
  const ids = skills.map(skill => skill.skill_id)
  assert.ok(!ids.includes('ai-orchestration'))
  assert.ok(!ids.includes('artifact-qa'))
  assert.ok(ids.includes('criacao-carousel'))
  const carousel = skills.find(skill => skill.skill_id === 'criacao-carousel')
  assert.equal(carousel.label, 'Carrossel')
  assert.equal(carousel.category, 'criacao')
  assert.ok(carousel.description)
  assert.equal(carousel.executor, 'carousel-local-pipeline')
})

test('skillForId resolve pelo id canônico', () => {
  assert.equal(skillForId('publish')?.skill_id, 'publish')
  assert.equal(skillForId('nao-existe'), null)
})

test('catálogo de capabilities é derivado do registry', () => {
  const catalog = capabilityCatalog()
  const carousel = catalog.find(item => item.id === 'criacao-carousel')
  assert.equal(carousel.skill, 'criacao-carousel')
  assert.equal(carousel.executor, 'carousel-local-pipeline')
  assert.ok(carousel.qa.includes('visual'))
  assert.ok(carousel.providers.length >= 1)
  assert.ok(carousel.label)
  assert.ok(carousel.category)
  const image = catalog.find(item => item.id === 'criacao-image-generation')
  assert.equal(image.skill, 'criacao-image-generation')
  assert.deepEqual(image.providers, ['fal', 'kie'])
  assert.equal(image.fallback, 'prompt_and_upload')
  const publish = catalog.find(item => item.id === 'publish')
  assert.equal(publish.skill, 'publish')
  assert.equal(publish.status, 'needs_connection')
})

test('validação do registry reporta erros estruturados', () => {
  const result = validateSkillRegistry()
  assert.equal(result.ok, true, result.errors.join('; '))
  assert.deepEqual(result.errors, [])
})
