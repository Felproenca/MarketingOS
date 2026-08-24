// Render de outputs visuais (carrossel/post) → SVG premium → upload no storage.
// O SVG é imagem real (vetor, escala perfeita) e o front exibe direto; PNG pode
// ser gerado depois com sharp sem mudar o contrato.
const BRAND = { bg: '#0b0b0f', bg2: '#12121a', fg: '#ffffff', accent: '#ff6a00', muted: 'rgba(255,255,255,0.62)', card: 'rgba(255,255,255,0.04)' }

function escapeXml(s) { return String(s || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c])) }

function wrap(text, maxChars) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) { if (line) lines.push(line.trim()); line = w }
    else line = (line + ' ' + w).trim()
  }
  if (line) lines.push(line)
  return lines
}

function slideSVG(slide, i, total) {
  const W = 1080, H = 1080
  const headline = wrap(slide.headline, 22)
  const body = wrap(slide.body, 42)
  const cta = String(slide.cta || '').trim()
  const hs = headline.map((l, j) => `<tspan x="90" dy="${j === 0 ? 0 : 78}" style="font-size:74;font-weight:800;letter-spacing:-1">${escapeXml(l)}</tspan>`).join('')
  const bs = body.map((l, j) => `<tspan x="90" dy="${j === 0 ? 0 : 46}" style="font-size:32;font-weight:400;fill:${BRAND.muted}">${escapeXml(l)}</tspan>`).join('')
  const ctaEl = cta ? `<rect x="90" y="${H - 150}" width="340" height="72" rx="36" fill="${BRAND.accent}"/><text x="260" y="${H - 102}" text-anchor="middle" font-size="28" font-weight="700" fill="#fff">${escapeXml(cta)}</text>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><radialGradient id="g${i}" cx="50%" cy="0%" r="90%"><stop offset="0%" stop-color="${BRAND.bg2}"/><stop offset="100%" stop-color="${BRAND.bg}"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g${i})"/>
    <circle cx="${W - 120}" cy="140" r="180" fill="${BRAND.accent}" opacity="0.12"/>
    <text x="90" y="120" font-size="20" font-weight="600" fill="${BRAND.accent}" letter-spacing="3">${escapeXml((slide.tag || '').toUpperCase() || 'MKOS')}</text>
    <text x="90" y="260" font-family="Georgia, 'Times New Roman', serif" font-style="italic">${hs}</text>
    <text x="90" y="470">${bs}</text>
    ${ctaEl}
    <text x="${W - 90}" y="${H - 60}" text-anchor="end" font-size="20" fill="${BRAND.muted}">${i + 1} / ${total}</text>
  </svg>`
}

export function buildCarouselSVGs(slides) {
  return (slides || []).map((s, i) => ({ index: i, svg: slideSVG(s, i, slides.length) }))
}

export function buildPostSVG(data) {
  const W = 1080, H = 1350
  const caption = wrap(data.caption, 24)
  const body = wrap(data.body, 48)
  const cta = String(data.cta || '').trim()
  const hashtags = (data.hashtags || []).slice(0, 6).map(h => `#${String(h).replace(/^#/, '')}`).join('  ')
  const cs = caption.map((l, j) => `<tspan x="90" dy="${j === 0 ? 0 : 78}" style="font-size:70;font-weight:800">${escapeXml(l)}</tspan>`).join('')
  const bs = body.map((l, j) => `<tspan x="90" dy="${j === 0 ? 0 : 46}" style="font-size:34;fill:${BRAND.muted}">${escapeXml(l)}</tspan>`).join('')
  const ctaEl = cta ? `<rect x="90" y="${H - 170}" width="380" height="76" rx="38" fill="${BRAND.accent}"/><text x="280" y="${H - 118}" text-anchor="middle" font-size="30" font-weight="700" fill="#fff">${escapeXml(cta)}</text>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${BRAND.bg2}"/><stop offset="100%" stop-color="${BRAND.bg}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#pg)"/>
    <circle cx="${W - 120}" cy="200" r="220" fill="${BRAND.accent}" opacity="0.12"/>
    <text x="90" y="140" font-size="22" font-weight="600" fill="${BRAND.accent}" letter-spacing="3">MKOS</text>
    <text x="90" y="300" font-family="Georgia, 'Times New Roman', serif" font-style="italic">${cs}</text>
    <text x="90" y="560">${bs}</text>
    <text x="90" y="${H - 240}" font-size="24" fill="${BRAND.muted}">${escapeXml(hashtags)}</text>
    ${ctaEl}
  </svg>`
}
