// Extração real de vídeo: baixa (yt-dlp) → transcreve (faster-whisper via EditorOS/.venv)
// → retorna a transcrição para o coletor analisar o conteúdo REAL.
import { execFile, execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const YTDLP = 'C:/Users/Felipe Proença/AppData/Local/hermes/hermes-agent/venv/Scripts/yt-dlp'
const PY = 'C:/Users/Felipe Proença/Documents/Projetos/EditorOS/.venv/Scripts/python.exe'
const MODEL = process.env.WHISPER_MODEL || 'base'

function findAudio(dir) {
  const files = readdirSync(dir)
  return files.find(f => /\.(m4a|mp3|webm|opus|wav)$/i.test(f))
}

async function downloadAudio(url, dir) {
  await new Promise((resolve, reject) => {
    execFile(YTDLP, ['-f', 'bestaudio', '-o', join(dir, 'audio.%(ext)s'), '--no-playlist', '--quiet', url], { timeout: 180000 }, (error) => error ? reject(new Error(`ytdlp: ${error.message}`)) : resolve())
  })
  const audio = findAudio(dir)
  if (!audio) throw new Error('nenhum audio baixado')
  return join(dir, audio)
}

function transcribe(audioPath) {
  const script = join(tmpdir(), `whisper_run_${Date.now()}.py`)
  writeFileSync(script, `import sys
from faster_whisper import WhisperModel
model = WhisperModel('${MODEL}', device='cpu', compute_type='int8')
segments, info = model.transcribe(sys.argv[1], language='pt')
print(''.join(s.text for s in segments))
`)
  try {
    return execFileSync(PY, [script, audioPath], { encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 }).trim()
  } finally {
    rmSync(script, { force: true })
  }
}

export async function extractVideoTranscript(urlOrPath) {
  // Arquivo local → transcreve direto (caminho 100% funcional)
  if (existsSync(urlOrPath)) return transcribe(urlOrPath)
  // URL → baixa e transcreve (pode ser bloqueado por YouTube/anti-bot)
  const dir = mkdtempSync(join(tmpdir(), 'vx-'))
  try {
    const audio = await downloadAudio(urlOrPath, dir)
    return transcribe(audio)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

export function isVideoUrl(text) {
  return /(youtube\.com|youtu\.be|instagram\.com\/reel|instagram\.com\/p|tiktok\.com|vimeo\.com|facebook\.com\/watch)/i.test(String(text || ''))
}
