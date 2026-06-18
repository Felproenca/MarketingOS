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

# A isca (opcional servir aqui). Se preferir hospedar estática à parte,
# aponte MAGNET_URL para lá e remova esta linha.
COPY clients ./clients

ENV DM_ENGINE_PORT=4280
EXPOSE 4280

CMD ["node", "scripts/dm-engine/server.js"]
