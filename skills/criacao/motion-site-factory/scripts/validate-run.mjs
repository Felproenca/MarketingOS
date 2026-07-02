import fs from "node:fs";
import path from "node:path";

const runDir = path.resolve(process.argv[2] || "");
const errors = [];
const warnings = [];

function readJson(name) {
  const file = path.join(runDir, name);
  if (!fs.existsSync(file)) {
    errors.push(`missing:${name}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`invalid-json:${name}:${error.message}`);
    return null;
  }
}

function requireValue(value, label) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "string" && value.startsWith("replace-"))
  ) {
    errors.push(`required:${label}`);
  }
}

if (!process.argv[2] || !fs.existsSync(runDir)) {
  console.error("Usage: node validate-run.mjs <run-directory>");
  process.exit(2);
}

const roster = readJson("agent-roster.json");
const graph = readJson("task-graph.json");
const manifest = readJson("creation-manifest.json");

if (roster && graph) {
  requireValue(roster.project_id, "agent-roster.project_id");
  const roles = new Map();
  for (const role of roster.roles || []) {
    requireValue(role.id, "role.id");
    if (roles.has(role.id)) errors.push(`duplicate-role:${role.id}`);
    roles.set(role.id, role);
    if (!(role.outputs || []).length) errors.push(`role-without-output:${role.id}`);
    if (!(role.acceptance || []).length) errors.push(`role-without-acceptance:${role.id}`);
  }

  const tasks = new Map();
  for (const task of graph.tasks || []) {
    requireValue(task.id, "task.id");
    if (tasks.has(task.id)) errors.push(`duplicate-task:${task.id}`);
    tasks.set(task.id, task);
    if (!roles.has(task.owner_role)) errors.push(`unknown-owner:${task.id}:${task.owner_role}`);
    if (!(task.outputs || []).length) errors.push(`task-without-output:${task.id}`);
    if (!(task.acceptance || []).length) errors.push(`task-without-acceptance:${task.id}`);
  }

  for (const task of tasks.values()) {
    for (const dependency of task.depends_on || []) {
      if (!tasks.has(dependency)) errors.push(`unknown-dependency:${task.id}:${dependency}`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) {
      errors.push(`dependency-cycle:${id}`);
      return;
    }
    if (visited.has(id) || !tasks.has(id)) return;
    visiting.add(id);
    for (const dependency of tasks.get(id).depends_on || []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of tasks.keys()) visit(id);

  const critic = roles.get("critic");
  if (!critic) warnings.push("recommended-role-missing:critic");
  if (!roles.has("narrative-director")) errors.push("required-role-missing:narrative-director");
  if (!roles.has("creation-documentarian")) errors.push("required-role-missing:creation-documentarian");
  if (!tasks.has("direct-narrative")) errors.push("required-task-missing:direct-narrative");
}

if (manifest) {
  requireValue(manifest.project_id, "creation-manifest.project_id");
  requireValue(manifest.client_slug, "creation-manifest.client_slug");
  requireValue(manifest.acquisition?.objective, "acquisition.objective");
  requireValue(manifest.acquisition?.primary_cta, "acquisition.primary_cta");
  requireValue(manifest.creative_direction?.central_metaphor, "creative_direction.central_metaphor");
  requireValue(manifest.reaction_contract?.first_3_seconds, "reaction_contract.first_3_seconds");
  requireValue(manifest.reaction_contract?.first_15_seconds, "reaction_contract.first_15_seconds");
  requireValue(manifest.reaction_contract?.before_primary_cta, "reaction_contract.before_primary_cta");
  requireValue(manifest.narrative?.opening_tension, "narrative.opening_tension");
  requireValue(manifest.narrative?.cta_resolution, "narrative.cta_resolution");

  const captureIds = new Set();
  const allowedNarrativeFunctions = new Set([
    "anchor",
    "tension",
    "reveal",
    "breath",
    "proof",
    "reward",
    "resolution"
  ]);
  let consecutiveTextOnly = 0;
  const sections = manifest.sections || [];
  if (!sections.length) errors.push("manifest-without-sections");
  for (const section of sections) {
    requireValue(section.id, "section.id");
    requireValue(section.narrative_function, `section.${section.id}.narrative_function`);
    if (!allowedNarrativeFunctions.has(section.narrative_function)) {
      errors.push(`invalid-narrative-function:${section.id}:${section.narrative_function}`);
    }
    requireValue(section.belief_before, `section.${section.id}.belief_before`);
    requireValue(section.belief_after, `section.${section.id}.belief_after`);
    requireValue(section.visual_anchor, `section.${section.id}.visual_anchor`);
    requireValue(section.bridge_to_next, `section.${section.id}.bridge_to_next`);
    if (!Number.isFinite(section.intensity) || section.intensity < 1 || section.intensity > 10) {
      errors.push(`invalid-intensity:${section.id}`);
    }
    if (!Number.isFinite(section.copy_budget?.headline_max_words)) {
      errors.push(`missing-copy-budget:${section.id}:headline`);
    }
    if (!Number.isFinite(section.copy_budget?.body_max_words)) {
      errors.push(`missing-copy-budget:${section.id}:body`);
    }
    if (!["scan", "read", "inspect"].includes(section.copy_budget?.reading_mode)) {
      errors.push(`invalid-reading-mode:${section.id}`);
    }
    const hasProgression =
      Boolean(section.reward) ||
      Boolean(section.asset_role) ||
      Boolean(section.motion_role) ||
      section.narrative_function === "proof";
    consecutiveTextOnly = hasProgression ? 0 : consecutiveTextOnly + 1;
    if (consecutiveTextOnly >= 2) errors.push(`consecutive-text-only-sections:${section.id}`);
    requireValue(section.capture_id, `section.${section.id}.capture_id`);
    if (captureIds.has(section.capture_id)) errors.push(`duplicate-capture-id:${section.capture_id}`);
    captureIds.add(section.capture_id);
    requireValue(section.mobile_state, `section.${section.id}.mobile_state`);
    requireValue(section.reduced_motion_state, `section.${section.id}.reduced_motion_state`);
  }
  if (
    sections.length >= 3 &&
    !sections.slice(1, -1).some((section) => Boolean(section.reward))
  ) {
    errors.push("no-intermediate-reward");
  }

  let exclusiveAssets = 0;
  const assets = manifest.assets || [];
  if (!assets.length) errors.push("asset-factory-without-assets");
  for (const asset of assets) {
    requireValue(asset.source, `asset.${asset.id}.source`);
    requireValue(asset.source_ref, `asset.${asset.id}.source_ref`);
    requireValue(asset.narrative_role, `asset.${asset.id}.narrative_role`);
    if (asset.exclusive_to_project === true) exclusiveAssets += 1;
    if (asset.motion_ready === true && !(asset.layers || []).length) {
      errors.push(`motion-ready-asset-without-layers:${asset.id}`);
    }
  }
  if (exclusiveAssets < 1) errors.push("asset-factory-without-exclusive-asset");

  const capturePlan = manifest.video_handoff?.capture_plan || [];
  if (!capturePlan.length) errors.push("video-handoff-without-capture-plan");
  for (const capture of capturePlan) {
    if (!captureIds.has(capture.capture_id)) {
      errors.push(`capture-plan-unknown-id:${capture.id}:${capture.capture_id}`);
    }
    requireValue(capture.end_condition, `capture.${capture.id}.end_condition`);
    if (!capture.viewport?.width || !capture.viewport?.height) {
      errors.push(`capture-without-viewport:${capture.id}`);
    }
  }

  const hasMobile = capturePlan.some((capture) => capture.viewport?.width <= 480);
  const hasDesktop = capturePlan.some((capture) => capture.viewport?.width >= 1024);
  if (!hasMobile) errors.push("capture-plan-without-mobile");
  if (!hasDesktop) errors.push("capture-plan-without-desktop");
  if (!(manifest.video_handoff?.angles || []).length) errors.push("video-handoff-without-angles");

  const qualityGate = manifest.quality_gate;
  if (!qualityGate) {
    errors.push("missing-quality-gate");
  } else {
    const scores = Object.values(qualityGate.scores || {});
    const minimumDimension = Number(qualityGate.minimum_dimension ?? 7);
    const minimumAverage = Number(qualityGate.minimum_average ?? 8.5);
    if (!scores.length) {
      errors.push("quality-gate-without-scores");
    } else {
      if (scores.some((score) => !Number.isFinite(Number(score)) || Number(score) < 0 || Number(score) > 10)) {
        errors.push("quality-score-out-of-range");
      }
      const average = scores.reduce((sum, score) => sum + Number(score || 0), 0) / scores.length;
      if (scores.some((score) => Number(score) < minimumDimension)) {
        errors.push("quality-dimension-below-minimum");
      }
      if (average < minimumAverage) errors.push("quality-average-below-minimum");
    }
    if (Number(qualityGate.scores?.narrative_continuity || 0) < 8) {
      errors.push("narrative-continuity-below-8");
    }
    if (qualityGate.hero_quality_cliff === true) errors.push("hero-quality-cliff");
    if (qualityGate.passed !== true) errors.push("quality-gate-not-passed");
  }
}

if (warnings.length) {
  console.warn(`WARN\n${warnings.map((item) => `- ${item}`).join("\n")}`);
}

if (errors.length) {
  console.error(`INVALID\n${errors.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}

console.log("VALID");
