FROM node:20-alpine

# Set production environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Create non-root user
RUN deluser --remove-home node && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    rm -f /usr/bin/wget /usr/bin/curl

WORKDIR /app

COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

COPY . .

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the port (default 8080, can be overridden)
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["node", "index.js"]
