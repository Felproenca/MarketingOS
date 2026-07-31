import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function option(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

const contractFile = option("--contract");
const mailboxRoot = option("--mailbox-root");
const coreCli = option("--core-cli") || path.resolve(process.cwd(), "..", "EcosystemCore", "src", "cli.js");

if (!contractFile || !mailboxRoot) {
  throw new Error("Uso: npm run ecosystem:export -- --contract <arquivo.json> --mailbox-root <diretório> [--core-cli <cli.js>]");
}
if (!existsSync(coreCli)) throw new Error(`EcosystemCore não encontrado: ${coreCli}`);

const contract = JSON.parse(await readFile(path.resolve(contractFile), "utf8"));
if (contract?.source_system !== "MarketingOS") throw new Error("Este exportador só aceita contratos originados no MarketingOS.");
if (!["client_truth", "campaign_brief"].includes(contract?.contract_type)) {
  throw new Error("MarketingOS exporta apenas client_truth ou campaign_brief por este adapter.");
}

const result = spawnSync(process.execPath, [coreCli, "route", path.resolve(contractFile), "--mailbox-root", path.resolve(mailboxRoot)], {
  encoding: "utf8",
});
if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Falha ao exportar contrato.");
process.stdout.write(result.stdout);
