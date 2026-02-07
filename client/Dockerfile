FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

RUN deluser --remove-home node && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    rm -f /usr/bin/wget /usr/bin/curl

WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["npm", "start", "--", "-H", "0.0.0.0"]
