# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy database schema for Prisma client generation
COPY database ./database

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci

# Copy backend source code and generate Prisma client
COPY backend ./
WORKDIR /app/database
RUN npm ci || true
RUN npx prisma generate

WORKDIR /app/backend
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/database ./database

EXPOSE 4000

CMD ["node", "dist/index.js"]
