FROM node:20-alpine

WORKDIR /app

# The DM engine runs on Node built-ins in this container.
COPY scripts/dm-engine ./scripts/dm-engine
COPY scripts/publisher ./scripts/publisher

ENV PORT=4280
EXPOSE 4280

CMD ["node", "scripts/dm-engine/server.js"]
