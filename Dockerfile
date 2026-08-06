# Multi-stage Dockerfile for MysticVerse (Frontend + Express Backend)
FROM node:22-alpine AS build

WORKDIR /app

# Ensure development environment during build stage so devDependencies are installed
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=2048"

# No build arguments are declared: every OPENAI_*/PORT value is read from the
# process environment at runtime, and ARG/ENV would leak them into image history.

# Install build dependencies for native modules (e.g. better-sqlite3)
RUN apk add --no-cache python3 make g++

# 1. Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
COPY server/package.json server/package-lock.json* ./server/

# 2. Install dependencies using BuildKit npm cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm install --include=dev && \
    npm install --prefix client --include=dev && \
    npm install --prefix server --include=dev

# 3. Copy source files
COPY . .

# 4. Build client (Vite) into server/public, and compile server (TypeScript)
RUN npm run build:client && npm run build:server

# Stage 2: Production runtime
FROM node:22-alpine AS production

WORKDIR /app

# Install runtime dependencies for native modules and su-exec for privilege dropping
RUN apk add --no-cache python3 make g++ su-exec

COPY --from=build /app/package.json ./
COPY --from=build /app/server ./server

WORKDIR /app/server
RUN npm rebuild && \
    mkdir -p /app/server/data && \
    chown -R node:node /app && \
    chmod +x /app/server/docker-entrypoint.sh

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

ENTRYPOINT ["/app/server/docker-entrypoint.sh"]
CMD ["npm", "start"]



