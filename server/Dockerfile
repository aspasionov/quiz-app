# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

# Install production dependencies only (clean install for reproducibility)
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Build/prepare application ──
FROM node:20-alpine AS build

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy application source
COPY . .

# Remove files not needed at runtime to reduce attack surface
RUN rm -rf .dockerignore Dockerfile *.md .git .env* tests __tests__ \
    scripts/seed*.js .vscode .idea

# ── Stage 3: Production runtime (minimal) ──
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

# Create non-root user with minimal permissions
RUN deluser --remove-home node && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    # Remove utilities that could be used for lateral movement
    rm -f /usr/bin/wget /usr/bin/curl /usr/bin/nc

WORKDIR /app

# Copy only what is needed for runtime
COPY --from=build --chown=appuser:appgroup /app ./

# Switch to non-root user
USER appuser

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["node", "index.js"]