import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roster = JSON.parse(fs.readFileSync(path.join(root, "agent-roster.json"), "utf8"));
const ids = new Set();

for (const agent of roster.agents) {
  if (!agent.id || !agent.contract || !agent.produces) {
    throw new Error("Every agent requires id, contract and produces.");
  }
  if (ids.has(agent.id)) throw new Error(`Duplicate agent id: ${agent.id}`);
  ids.add(agent.id);

  const contractPath = path.resolve(root, agent.contract);
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Missing contract for ${agent.id}: ${contractPath}`);
  }
}

for (const id of roster.execution_order) {
  if (!ids.has(id)) throw new Error(`Execution order references unknown agent: ${id}`);
}

console.log(`topic-intelligence roster valid: ${roster.agents.length} agents`);
