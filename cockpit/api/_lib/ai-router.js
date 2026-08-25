import { canSpend, normalizePolicy } from './ai-policy.js'
import { skillForCapability, skillForRequestType } from './skill-registry.js'

// Env overrides win over the declarative registry. Provider defaults come from
// skills/registry.json (providers_allowed[0]); ROUTES only carries env overrides
// and situation-dependent model defaults. Capabilities without a skill fall back
// to FALLBACK_PROVIDER below.
const ROUTES = {
  strategy: { provider: process.env.AI_STRATEGY_PROVIDER, model: process.env.AI_STRATEGY_MODEL || 'strategy-decision-validator-v1', executor: 'marketingos' },
  copy: { provider: process.env.AI_COPY_PROVIDER, model: process.env.AI_COPY_MODEL || 'claude-3-5-sonnet-latest', executor: 'marketingos' },
  carousel: { provider: process.env.AI_CAROUSEL_PROVIDER, model: process.env.AI_CAROUSEL_MODEL || 'commercial-carousel-renderer-v1', executor: 'designos' },
  post: { provider: process.env.AI_POST_PROVIDER, model: process.env.AI_POST_MODEL || 'mediaos-post-renderer-v1', executor: 'mediaos' },
  research: { provider: process.env.AI_RESEARCH_PROVIDER, model: process.env.AI_RESEARCH_MODEL || 'mediaos-research-executor-v1', executor: 'mediaos' },
  ads: { provider: process.env.AI_ADS_PROVIDER, model: process.env.AI_ADS_MODEL || 'mediaos-ads-plan-v1', executor: 'mediaos' },
  automation: { provider: process.env.AI_AUTOMATION_PROVIDER, model: process.env.AI_AUTOMATION_MODEL || 'mediaos-automation-queue-v1', executor: 'mediaos' },
  video_edit: { provider: process.env.AI_VIDEO_PROVIDER, model: process.env.AI_VIDEO_MODEL || 'video-edit-pipeline-v1', executor: 'videoos' },
  video_generate: { provider: process.env.AI_VIDEO_GENERATION_PROVIDER, model: process.env.AI_VIDEO_GENERATION_MODEL || 'generative-video-pipeline-v1', executor: 'videoos' },
  publish: { provider: process.env.AI_PUBLISH_PROVIDER, model: 'meta-publisher-v1', executor: 'fluxos' },
  analysis: { provider: process.env.AI_ANALYSIS_PROVIDER, model: process.env.AI_ANALYSIS_MODEL || 'growthos-data-analysis-v1', executor: 'marketingos' },
  image_generate: { provider: process.env.AI_IMAGE_PROVIDER, model: process.env.AI_IMAGE_MODEL || 'fal-ai/flux/schnell', executor: 'desingos' },
}

const FALLBACK_PROVIDER = {
  copy: 'anthropic',
  video_edit: 'pipeline',
  publish: 'platform',
  analysis: 'pipeline',
}

export function resolveAI({ capability = 'strategy', complexity = 'normal', credentialSource = 'marketingos', connection = null, policy = {}, estimatedCost = 0 } = {}) {
  const route = ROUTES[capability] || ROUTES.strategy
  const skill = skillForCapability(capability)
  const normalizedPolicy = normalizePolicy(policy)
  const selectedProvider = connection?.provider || route.provider || skill?.providers_allowed?.[0] || FALLBACK_PROVIDER[capability] || 'pipeline'
  const selectedModel = connection?.metadata?.default_model || route.model
  const executionMode = connection?.execution_mode || (selectedProvider === 'pipeline' ? 'local' : 'api')
  const contractOnly = ['video_generate'].includes(capability) && !connection
  const requiresCredential = ['anthropic', 'openai', 'openai-compatible', 'deepseek', 'qwen', 'fal', 'kie', 'platform'].includes(selectedProvider) && !connection
  const overBudget = !canSpend(normalizedPolicy, estimatedCost)
  const policyProviders = normalizedPolicy.allowedProviders
  const skillProviders = skill?.providers_allowed || []
  const effectiveAllowed = policyProviders.length ? policyProviders : skillProviders
  const allowed = !effectiveAllowed.length || effectiveAllowed.includes(selectedProvider)
  const executable = !contractOnly && !requiresCredential && !overBudget && allowed
  const fallback = skill?.fallback || (normalizedPolicy.allowExternalFallback ? 'prompt_and_upload' : 'blocked')
  return {
    capability,
    complexity,
    provider: selectedProvider,
    model: selectedModel,
    executor: skill?.executor || route.executor,
    credentialSource: connection?.connection_type || credentialSource,
    executionMode,
    connectionId: connection?.id || null,
    routeVersion: '1.2',
    skillId: skill?.skill_id || null,
    requires: skill?.requires || [],
    qa: skill?.qa || [],
    approvalRequired: skill?.approval_required ?? normalizedPolicy.requireApproval,
    allowedProviders: effectiveAllowed,
    status: contractOnly ? 'contract_only' : overBudget ? 'budget_exceeded' : !allowed ? 'provider_not_allowed' : requiresCredential ? 'needs_credentials' : 'executable',
    executable,
    requiresCredentials: requiresCredential,
    fallback,
    policy: normalizedPolicy,
  }
}

export function capabilityForJob(jobType) {
  const skill = skillForRequestType(jobType)
  if (skill?.capability) return skill.capability
  // Fallback only for job types without a declarative skill in the registry.
  if (jobType === 'carousel') return 'carousel'
  if (jobType === 'copy') return 'copy'
  if (jobType === 'post') return 'post'
  if (jobType === 'research') return 'research'
  if (jobType === 'ads') return 'ads'
  if (jobType === 'automation') return 'automation'
  if (jobType === 'video') return 'video_edit'
  if (jobType === 'generative_video') return 'video_generate'
  if (jobType === 'publish') return 'publish'
  if (jobType === 'analysis') return 'analysis'
  if (jobType === 'image' || jobType === 'image_generate') return 'image_generate'
  return 'strategy'
}
