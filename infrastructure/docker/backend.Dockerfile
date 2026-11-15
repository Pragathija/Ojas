# ==============================================================================
# Ojas Backend Dockerfile - Production Cloud Run & Container Specification
# Multi-stage, non-root, Python 3.12 slim container for Project Ojas
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies required for compiling binary extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment for clean dependency isolation
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

# Metadata
LABEL maintainer="Project Ojas Team - NASA Space Apps Challenge 2026"
LABEL description="Intelligent Astronaut Health Monitoring Backend & AI Engine"

WORKDIR /app

# Install runtime dependencies:
# - libpq5: runtime PostgreSQL client library
# - curl: container healthcheck probing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user and group (CIS benchmark compliance)
RUN groupadd -g 10001 ojasgroup && \
    useradd -u 10001 -g ojasgroup -s /bin/bash -m ojasuser

# Copy virtual environment from builder
COPY --from=builder --chown=ojasuser:ojasgroup /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONPATH="/app"
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT="production"
ENV DEBUG=False
ENV PORT=8080

# Copy application source, startup scripts, and required sample datasets
# (Exclude .venv, .env, *.db, and raw datasets via .dockerignore)
COPY --chown=ojasuser:ojasgroup backend/app /app/app
COPY --chown=ojasuser:ojasgroup backend/scripts /app/scripts
COPY --chown=ojasuser:ojasgroup backend/data/sample /app/data/sample
COPY --chown=ojasuser:ojasgroup backend/data/nasa_original /app/data/nasa_original
COPY --chown=ojasuser:ojasgroup backend/data/processed /app/data/processed

# Create writable data directory for SQLite runtime fallback
RUN mkdir -p /app/data/runtime && chown -R ojasuser:ojasgroup /app/data/runtime

# Switch to unprivileged non-root user
USER 10001:10001

# Cloud Run dynamic PORT exposure
EXPOSE 8080

# Production Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Production Entrypoint
# Dynamically binds to Cloud Run's $PORT environment variable
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1 --log-level info
