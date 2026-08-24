import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const projectsRoot = path.resolve(marketingRoot, "..");
const manifestPath = path.join(marketingRoot, "config", "service-manifests.json");
const registry = JSON.parse(readFileSync(manifestPath, "utf8"));

function findService(serviceId) {
  const service = registry.services[serviceId];
  if (!service) throw new Error(`Servico nao catalogado: ${serviceId}`);
  return { id: serviceId, ...service };
}

export function listServices() {
  return Object.entries(registry.services).map(([id, service]) => ({ id, ...service }));
}

export function resolveService(requestType) {
  const match = listServices().find(service => service.request_types.includes(requestType));
  if (!match) return { id: "unmapped", label: "Não catalogado", request_type: requestType, evidence: "unmapped", executable: false };
  return inspectService(match.id);
}

export function inspectService(serviceId) {
  const service = findService(serviceId);
  const paths = [service.entrypoint, service.executor].filter(value => typeof value === "string" && /[\\/]/.test(value) && !value.includes(" + ") && !value.includes("provider adapter") && !value.endsWith(".md"));
  const checks = paths.map(relative => {
    const root = /^(DesingOS|EditorOS|FluxOS|MediaOS|GrowthOS|EcosystemCore)[\\/]/.test(relative) ? projectsRoot : marketingRoot;
    const candidate = path.resolve(root, relative.replace(/^MarketingOS[\\/]/, ""));
    return { path: relative, absolute: candidate, exists: existsSync(candidate) };
  });
  const hasRunnableEntry = paths.length > 0;
  return { ...service, executable: service.operational !== false && service.evidence !== "contract_only" && service.evidence !== "unmapped" && hasRunnableEntry && checks.every(check => check.exists), checks };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const typeIndex = process.argv.indexOf("--type");
  const serviceIndex = process.argv.indexOf("--service");
  const result = typeIndex >= 0 ? resolveService(process.argv[typeIndex + 1]) : serviceIndex >= 0 ? inspectService(process.argv[serviceIndex + 1]) : { services: listServices().map(service => inspectService(service.id)) };
  console.log(JSON.stringify(result, null, 2));
}
