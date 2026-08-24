import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { evaluateContext } from "./context-gate.mjs";

async function fixture(strategy) {
  const root = await mkdtemp(path.join(os.tmpdir(), "mkos-context-gate-"));
  const clientRoot = path.join(root, "clients", "demo");
  await mkdir(path.join(clientRoot, "outputs", "strategy"), { recursive: true });
  await mkdir(path.join(clientRoot, "outputs", "creative-direction"), { recursive: true });
  await writeFile(path.join(clientRoot, "client.md"), "# Demo\nEntrega educação em trading de mercado americano.\n", "utf8");
  await writeFile(path.join(clientRoot, "brand-kit.json"), JSON.stringify({ identity: { brand_name: "Demo" } }), "utf8");
  await writeFile(path.join(clientRoot, "outputs", "strategy", "strategy-decision.json"), JSON.stringify(strategy), "utf8");
  await writeFile(path.join(clientRoot, "outputs", "creative-direction", "creative-brief.carousel.json"), JSON.stringify({ client_slug: "demo" }), "utf8");
  return root;
}

const request = { client_id: "demo", reference_snapshot: { client: { client_id: "demo" }, brand_profile: { positioning: "Trading educativo" } } };

test("Context Gate aprova contexto consistente", async () => {
  const root = await fixture({ client_slug: "demo", market_thesis: "Ensinar leitura de fluxo no mercado americano." });
  const result = await evaluateContext({ marketingRoot: root, clientId: "demo", request });
  assert.equal(result.ok, true);
  assert.equal(result.status, "approved");
  assert.match(result.contextHash, /^[a-f0-9]{64}$/);
});

test("Context Gate bloqueia contexto contaminado", async () => {
  const root = await fixture({ client_slug: "demo", market_thesis: "Ensinar hidratação e cabelo no salão." });
  const result = await evaluateContext({ marketingRoot: root, clientId: "demo", request });
  assert.equal(result.ok, false);
  assert.equal(result.status, "blocked");
  assert.match(result.errors.join(" "), /contaminação|incompatível/i);
});
