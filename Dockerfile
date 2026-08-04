# Stage 1: Build Vite React App
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files & install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code & build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS production

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static build artifacts
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
