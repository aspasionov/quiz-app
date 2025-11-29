FROM node:20

# Set production environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

COPY . .

# Expose the port (default 8080, can be overridden)
EXPOSE 8080

CMD ["node", "index.js"]
