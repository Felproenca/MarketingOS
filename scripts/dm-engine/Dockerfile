# Motor de DM — imagem para deploy em qualquer host (Render/Railway/Fly).
# Sobe o servidor de webhook + captura + isca num único processo.
FROM node:20-alpine

WORKDIR /app

# Só o necessário para o dm-engine (não puxa playwright/ffmpeg do projeto cheio).
COPY package.json ./
RUN npm pkg delete dependencies.playwright dependencies.whatsapp-web.js 2>/dev/null || true \
 && npm install --omit=dev --no-audit --no-fund dotenv || npm install dotenv

# Código: o motor + a plumbing reaproveitada do publisher.
COPY scripts/dm-engine ./scripts/dm-engine
COPY scripts/publisher ./scripts/publisher

ENV PORT=4280
EXPOSE 4280

CMD ["node", "scripts/dm-engine/server.js"]
