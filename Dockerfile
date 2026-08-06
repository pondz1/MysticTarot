# Multi-stage Dockerfile for MysticVerse (Frontend + Express Backend)
FROM node:22-alpine AS build

WORKDIR /app

# Ensure development environment during build stage so devDependencies are installed
ENV NODE_ENV=development
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build arguments injected by Coolify / CI
ARG COOLIFY_FQDN
ARG PORT
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG OPENAI_MODEL
ARG COOLIFY_BUILD_SECRETS_HASH

# Install build dependencies for native modules (e.g. better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy source files
COPY . .

# Install all dependencies including devDependencies for build tools
RUN npm install --include=dev && \
    npm install --prefix client --include=dev && \
    npm install --prefix server --include=dev

# Build client (Vite) into server/public, and compile server (TypeScript)
RUN npm run build:client && npm run build:server

# Stage 2: Production runtime
FROM node:22-alpine AS production

WORKDIR /app

# Build arguments injected by Coolify / CI
ARG COOLIFY_FQDN
ARG PORT
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG OPENAI_MODEL
ARG COOLIFY_BUILD_SECRETS_HASH

# Install runtime dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY --from=build /app/package.json ./
COPY --from=build /app/server ./server

WORKDIR /app/server
RUN npm rebuild

ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]

