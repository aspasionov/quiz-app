# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci && npm cache clean --force

# ── Stage 2: Build the Next.js application ──
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js static optimization
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

RUN npm run build

# ── Stage 3: Production runtime (minimal) ──
FROM node:20-alpine

# Create non-root user with minimal permissions
RUN deluser --remove-home node && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    # Remove utilities that could be used for lateral movement
    rm -f /usr/bin/wget /usr/bin/curl /usr/bin/nc

WORKDIR /app

# Copy only production artifacts from build stage
COPY --from=build --chown=appuser:appgroup /app/.next ./.next
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=build --chown=appuser:appgroup /app/public ./public

# Switch to non-root user
USER appuser

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["npm", "start", "--", "-H", "0.0.0.0"]