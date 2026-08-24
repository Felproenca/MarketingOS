import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAI, capabilityForJob } from '../api/_lib/ai-router.js'
import { nextOptimizationAction, canSpend } from '../api/_lib/ai-policy.js'
import { validateSkillRegistry } from '../api/_lib/skill-registry.js'

test('usa a conexão do próprio cliente e bloqueia orçamento excedido', () => {
  const route = resolveAI({ capability: 'image_generate', connection: { id: 'conn-a', provider: 'fal', execution_mode: 'api_key_customer', metadata: { default_model: 'fal-ai/flux/dev' } }, policy: { mode: 'economy', monthly_budget: 1, monthly_spend: 0.9 }, estimatedCost: 0.2 })
  assert.equal(route.provider, 'fal')
  assert.equal(route.connectionId, 'conn-a')
  assert.equal(route.status, 'budget_exceeded')
  assert.equal(route.fallback, 'prompt_and_upload')
})

test('loop corrige apenas o problema identificado e para no limite', () => {
  assert.equal(nextOptimizationAction({ iteration: 0, issue: 'texto ilegível' }).action, 'fix_copy_only')
  assert.equal(nextOptimizationAction({ iteration: 3, maxAttempts: 3 }).status, 'blocked')
  assert.equal(canSpend({ monthly_budget: 2, monthly_spend: 1.5 }, 0.4), true)
  assert.equal(canSpend({ monthly_budget: 2, monthly_spend: 1.5 }, 0.6), false)
})

test('marca pipelines locais como executáveis', () => {
  const route = resolveAI({ capability: 'carousel' })
  assert.equal(route.provider, 'pipeline')
  assert.equal(route.status, 'executable')
  assert.equal(route.executable, true)
  assert.equal(route.requiresCredentials, false)
})

test('marca vídeo generativo como contrato sem simular execução', () => {
  const route = resolveAI({ capability: 'video_generate' })
  assert.equal(route.status, 'contract_only')
  assert.equal(route.executable, false)
})

test('marca publicação como dependente de credenciais', () => {
  const route = resolveAI({ capability: 'publish' })
  assert.equal(route.provider, 'platform')
  assert.equal(route.status, 'needs_credentials')
  assert.equal(route.executable, false)
  assert.equal(route.requiresCredentials, true)
})

test('resolucao de skill vem do registry', () => {
  const route = resolveAI({ capability: 'carousel' })
  assert.equal(route.skillId, 'criacao-carousel')
  assert.equal(route.executor, 'carousel-local-pipeline')
  assert.equal(route.approvalRequired, true)
  assert.ok(route.qa.includes('visual'))
  assert.ok(route.requires.includes('client_truth'))
  const research = resolveAI({ capability: 'research' })
  assert.equal(research.skillId, 'topic-intelligence')
  const image = resolveAI({ capability: 'image_generate' })
  assert.equal(image.skillId, 'criacao-image-generation')
})

test('fallback declarativo por skill', () => {
  assert.equal(resolveAI({ capability: 'carousel' }).fallback, 'blocked')
  assert.equal(resolveAI({ capability: 'image_generate' }).fallback, 'prompt_and_upload')
  assert.equal(resolveAI({ capability: 'research' }).fallback, 'prompt_and_upload')
})

test('providers permitidos por skill limitam a rota', () => {
  const allowed = resolveAI({ capability: 'image_generate', connection: { id: 'c1', provider: 'fal', execution_mode: 'api_key_customer' } })
  assert.equal(allowed.provider, 'fal')
  assert.equal(allowed.status, 'executable')
  const kie = resolveAI({ capability: 'image_generate', connection: { id: 'c2', provider: 'kie', execution_mode: 'api_key_customer' } })
  assert.equal(kie.status, 'executable')
  const denied = resolveAI({ capability: 'image_generate', connection: { id: 'c3', provider: 'replicate', execution_mode: 'api_key_customer' } })
  assert.equal(denied.status, 'provider_not_allowed')
})

test('registry de skills valida sem erros', () => {
  const result = validateSkillRegistry()
  assert.equal(result.ok, true, result.errors.join('; '))
  assert.ok(result.registry.skills.length >= 14)
})

test('capabilityForJob deriva do registry e preserva fallback', () => {
  assert.equal(capabilityForJob('carousel'), 'carousel')
  assert.equal(capabilityForJob('post'), 'post')
  assert.equal(capabilityForJob('research'), 'research')
  assert.equal(capabilityForJob('prospecting'), 'ads')
  assert.equal(capabilityForJob('funnel'), 'strategy')
  assert.equal(capabilityForJob('generative_video'), 'video_generate')
  assert.equal(capabilityForJob('video'), 'video_edit')
  assert.equal(capabilityForJob('publish'), 'publish')
  assert.equal(capabilityForJob('analysis'), 'analysis')
})
