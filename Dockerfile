# syntax=docker/dockerfile:1
# Coolify: Build pack = Dockerfile, Port = 3000, Base directory empty, Branch = master.
# Uncheck "Available at Buildtime" for JWT_SECRET / JWT_REFRESH_SECRET / NODE_ENV.
# Coolify injects NODE_ENV=production during docker build, so builders must use --include=dev.

FROM node:20-alpine AS backend-builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci --include=dev
COPY database /app/database
COPY backend /app/backend
ENV DATABASE_URL="mongodb://127.0.0.1:27017/buddysearch"
RUN npx prisma generate --schema=/app/database/prisma/schema.prisma
RUN npx tsc

FROM node:20-alpine AS frontend-builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --include=dev
COPY frontend ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV BACKEND_INTERNAL_URL=http://127.0.0.1:4000
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_PORT=4000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

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
