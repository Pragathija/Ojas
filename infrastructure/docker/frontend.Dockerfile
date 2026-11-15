# ==============================================================================
# Ojas Frontend Dockerfile - Production Multi-Stage Build
# Multi-stage container: Node 20 LTS (Vite build) -> Nginx Alpine (Static web host)
# NOTE: Requires frontend/package.json to be populated by Frontend Team (Person 1)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend Assets
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for dynamic backend URL injection at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8000}

# Install dependencies (utilizes package lock if available)
COPY frontend/package*.json ./
RUN if [ -s package.json ]; then npm ci || npm install; else echo "WARNING: frontend/package.json is empty" && exit 1; fi

# Copy frontend source files
COPY frontend/ ./

# Compile production bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Serve with Nginx Alpine
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

LABEL maintainer="Project Ojas Team - NASA Space Apps Challenge 2026"
LABEL description="Ojas Astronaut Web Dashboard Frontend"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback routing
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
