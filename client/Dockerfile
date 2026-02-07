FROM node:alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

FROM node:alpine

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

CMD ["npm", "start", "--", "-H", "0.0.0.0"]
