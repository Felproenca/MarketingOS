import "dotenv/config";
import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const inputFile = process.argv[process.argv.indexOf("--input-json") + 1];
const mode = process.argv.includes("--generate") ? "generate" : "edit";
if (!inputFile) throw new Error("video-executor: --input-json obrigatorio");
const input = JSON.parse(await (await import("node:fs/promises")).readFile(inputFile, "utf8"));

function fail(message, retryable = false) { throw Object.assign(new Error(message), { retryable }); }
function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", windowsHide: true });
  if (result.status !== 0) fail(result.stderr || result.stdout || `${command} falhou`, false);
  return result.stdout.trim();
}

if (mode === "generate") {
  const command = process.env.VIDEO_GENERATOR_COMMAND;
  if (!command) fail("Video generativo bloqueado: VIDEO_GENERATOR_COMMAND nao configurado.");
  const output = path.resolve(input.output_dir || path.join(process.cwd(), "outputs", "video", input.job_id || "job"));
  const result = spawnSync(command, [], { shell: true, encoding: "utf8", windowsHide: true, env: { ...process.env, VIDEO_INPUT_JSON: JSON.stringify({ ...input, output_dir: output }) } });
  if (result.status !== 0) fail(result.stderr || result.stdout || "Comando de video generativo falhou", false);
  const video = input.output_path || path.join(output, "generated.mp4");
  if (!existsSync(video)) fail("Video generativo terminou sem produzir o arquivo esperado.");
  console.log(JSON.stringify({ ok: true, mode, video_path: video, pipeline: "generative-video-command-v1" }));
  process.exit(0);
}

const source = input.source_path || input.input_path;
if (!source || !existsSync(source)) fail("Video edit bloqueado: informe source_path/input_path existente.");
const outputDir = path.resolve(input.output_dir || path.join(path.dirname(source), "mediaos-video"));
import { mkdirSync } from "node:fs";
mkdirSync(outputDir, { recursive: true });
const output = path.join(outputDir, `${input.job_id || "video"}-edited.mp4`);
const probe = run(process.env.FFPROBE_BIN || "ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", source]);
const metadata = JSON.parse(probe || "{}");
const duration = Number(metadata.format?.duration || 0);
const start = Math.max(0, Number(input.start_seconds || 0));
const requestedDuration = Number(input.duration_seconds || Math.min(60, Math.max(1, duration - start)));
const maxDuration = Math.min(60, requestedDuration);
run(process.env.FFMPEG_BIN || "ffmpeg", ["-y", "-ss", String(start), "-i", source, "-t", String(maxDuration), "-vf", "scale=1080:-2", "-c:v", "libx264", "-preset", "fast", "-c:a", "aac", output]);
const file = await stat(output);
console.log(JSON.stringify({ ok: true, mode, video_path: output, duration_seconds: maxDuration, source_duration_seconds: duration, bytes: file.size, pipeline: "short-video-edit-v1", opusclip_reference: { scene_detection: "planned", captions: "planned", highlights: "planned" } }));
