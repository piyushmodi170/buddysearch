# syntax=docker/dockerfile:1
# Coolify: Build pack = Dockerfile, Port = 3000, Base directory empty, Branch = master.
# Uncheck "Available at Buildtime" for JWT_SECRET / JWT_REFRESH_SECRET / NODE_ENV.
# Debian (not Alpine) so Prisma can complete TLS to MongoDB Atlas.

FROM node:20-bookworm-slim AS backend-builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci --include=dev
COPY database /app/database
COPY backend /app/backend
ENV DATABASE_URL="mongodb://127.0.0.1:27017/buddysearch"
RUN npx prisma generate --schema=/app/database/prisma/schema.prisma
RUN npx tsc

FROM node:20-bookworm-slim AS frontend-builder
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --include=dev
COPY frontend ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV BACKEND_INTERNAL_URL=http://127.0.0.1:4000
RUN npm run build

FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_PORT=4000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY backend/package.json backend/package-lock.json ./api/
WORKDIR /app/api
RUN npm ci --omit=dev
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app
COPY --from=frontend-builder /app/.next/standalone ./web
COPY --from=frontend-builder /app/public ./web/public
COPY --from=frontend-builder /app/.next/static ./web/.next/static
COPY docker/start.sh /app/start.sh
COPY docker/gateway.js /app/gateway.js
RUN chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]
