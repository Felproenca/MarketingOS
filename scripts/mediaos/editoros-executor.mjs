import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const marketingRoot = path.resolve(import.meta.dirname, "..", "..");
const editorRoot = path.resolve(marketingRoot, "..", "EditorOS");
const editorCli = path.join(editorRoot, "src", "cli.js");
const inputFile = process.argv[process.argv.indexOf("--input-json") + 1];
if (!inputFile) throw new Error("editoros-executor: --input-json obrigatorio");
const input = JSON.parse(await readFile(inputFile, "utf8"));
const source = path.resolve(input.source_path || input.input_path || "");
if (!existsSync(editorCli)) throw new Error(`EditorOS nao encontrado: ${editorCli}`);
if (!source || !existsSync(source)) throw new Error("EditorOS bloqueado: informe source_path/input_path existente.");

const jobId = input.job_id || "video-job";
const projectDir = path.resolve(input.project_dir || path.join(marketingRoot, "outputs", "mediaos", input.client_id || "unknown", jobId, "editor-project"));
const outputDir = path.resolve(input.output_dir || path.join(marketingRoot, "outputs", "mediaos", input.client_id || "unknown", jobId, "editor-delivery"));
const preset = input.preset || (input.platform === "youtube" ? "youtube" : input.platform === "stories" ? "stories" : input.platform === "reels" ? "reels" : "shorts");
mkdirSync(projectDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const flags = ["--project-dir", projectDir, "--output-dir", outputDir, "--platform", preset, "--model", input.model || "tiny", "--allow-low-confidence", "--allow-weak-hook"];
if (input.max_deliveries) flags.push("--max-deliveries", String(input.max_deliveries));
if (input.premium) flags.push("--premium");
if (input.no_subtitles) flags.push("--no-subtitles");
const command = input.pipeline || "deliver";
const commandArgs = command === "deliver-existing"
  ? [editorCli, command, projectDir, preset, ...flags]
  : [editorCli, command, source, preset, ...flags];
const result = spawnSync(process.execPath, commandArgs, {
  cwd: editorRoot,
  encoding: "utf8",
  windowsHide: true,
  maxBuffer: 10 * 1024 * 1024,
  env: {
    ...process.env,
    EDITOR_PYTHON: input.editor_python || path.join(editorRoot, ".venv-whisper", "Scripts", "python.exe"),
    EDITOR_VISION_PYTHON: input.editor_vision_python || path.join(editorRoot, ".venv-vision", "Scripts", "python.exe"),
  },
});
const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
if (result.status !== 0) throw Object.assign(new Error(output || "EditorOS falhou"), { retryable: false });
if (/\b(?:full|deliver):aborted\b/i.test(output) || /pipeline abortado/i.test(output)) {
  throw Object.assign(new Error(output.slice(-4000) || "EditorOS abortou a entrega"), { retryable: false });
}

async function videoFiles(dir) {
  if (!existsSync(dir)) return [];
  return (await readdir(dir, { withFileTypes: true }))
    .filter(entry => entry.isFile() && /\.(mp4|webm|mov)$/i.test(entry.name))
    .map(entry => path.join(dir, entry.name));
}
let deliveryDir = outputDir;
let files = await videoFiles(deliveryDir);
if (!files.length) {
  // EditorOS anterior ao suporte de --output-dir usa a pasta entregas/<nome-do-video>.
  // Aceitamos esse caminho apenas como compatibilidade e o registramos no manifest.
  deliveryDir = path.join(editorRoot, "entregas", path.basename(source, path.extname(source)));
  files = await videoFiles(deliveryDir);
}
if (!files.length) throw new Error(`EditorOS terminou sem video em ${outputDir} ou ${deliveryDir}`);
const reportPath = path.join(deliveryDir, "recomendacao.json");
const report = existsSync(reportPath) ? JSON.parse(await readFile(reportPath, "utf8")) : null;
const manifestPath = path.join(outputDir, "mediaos-execution.json");
const manifest = {
  ok: true,
  mode: "edit",
  pipeline: "EditorOS-deliver-v1",
  editor_root: editorRoot,
  source_path: source,
  preset,
  output_dir: deliveryDir,
  video_path: files[0],
  video_paths: files,
  report_path: reportPath,
  report: report ? { diagnostics: report.diagnostics, deliveries: report.deliveries?.length || 0 } : null,
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
process.stdout.write(JSON.stringify({ ...manifest, output_tail: output.slice(-2000) }) + "\n");
