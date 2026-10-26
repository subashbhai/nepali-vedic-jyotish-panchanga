# ==============================================================================
# Balananda Vaidik Sewa — Production Express Server Dockerfile
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source files
COPY . .

# Build Vite frontend and compile Express server with esbuild
RUN npm run build

# ==============================================================================
# Production Runtime Image
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit && npm cache clean --force

# Copy compiled backend bundle, database schema, and public files
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/src/server/db/schema.sql /app/src/server/db/schema.sql
COPY --from=builder /app/data /app/data

# Ensure data directory exists with write permissions
RUN mkdir -p /app/data/backups && chmod -R 777 /app/data

EXPOSE 8080

# Health check probe targeting /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start authoritative Express server
CMD ["node", "dist/server.cjs"]
