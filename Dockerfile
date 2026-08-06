# Multi-stage Dockerfile for Mystic Tarot (Frontend + Express Backend)
FROM node:22-alpine AS build

WORKDIR /app

# Install build dependencies for native modules (e.g. better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy root and subpackage dependencies
COPY package.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm run install:all

# Copy source code and build client + server
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS production

WORKDIR /app

# Install runtime dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY --from=build /app/package.json ./
COPY --from=build /app/server ./server

WORKDIR /app/server
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
