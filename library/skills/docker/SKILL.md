---
name: docker
description: Docker and containerization patterns. Create Dockerfiles, docker-compose configs, and manage container workflows for development and production.
---

# Docker Skill

Containerization patterns for development and production environments.

## Invocation

```
/docker [init|compose|optimize|debug]
```

Or naturally: "dockerize this", "create a Dockerfile", "fix my container"

## Commands

| Command | Description |
|---------|-------------|
| `/docker init` | Create Dockerfile for current project |
| `/docker compose` | Generate docker-compose.yml |
| `/docker optimize` | Optimize existing Dockerfile |
| `/docker debug` | Troubleshoot container issues |

## Dockerfile Templates

### Node.js (Multi-stage)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Python (FastAPI)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### PHP (Laravel)

```dockerfile
FROM php:8.2-fpm-alpine

# Install extensions
RUN docker-php-ext-install pdo pdo_mysql opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first (layer caching)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader

# Copy application
COPY . .
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
```

### Static Site (Nginx)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Docker Compose Templates

### Full Stack (Node + Postgres + Redis)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### PHP + MySQL + Nginx

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./:/var/www/html
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - php

  php:
    build:
      context: .
      dockerfile: docker/php.Dockerfile
    volumes:
      - ./:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: app
      MYSQL_USER: user
      MYSQL_PASSWORD: pass
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

## Instructions for Claude

### init Command

1. **Detect project type:**
   - Check for package.json (Node)
   - Check for requirements.txt/pyproject.toml (Python)
   - Check for composer.json (PHP)
   - Check for go.mod (Go)

2. **Generate appropriate Dockerfile:**
   - Multi-stage for compiled/bundled apps
   - Single stage for interpreted languages
   - Include security best practices

3. **Add .dockerignore:**
   ```
   node_modules
   .git
   .env
   *.log
   .DS_Store
   coverage
   dist
   ```

### compose Command

1. **Identify required services:**
   - Database (from schema or env vars)
   - Cache (Redis/Memcached mentions)
   - Queue workers
   - Reverse proxy

2. **Generate docker-compose.yml with:**
   - Health checks
   - Volume mounts
   - Environment variables
   - Proper dependency ordering

### optimize Command

Analyze existing Dockerfile for:

```
=== DOCKERFILE OPTIMIZATION ===

Issues Found:

1. [HIGH] No multi-stage build
   Current: 1.2GB image
   Optimized: ~150MB with multi-stage

2. [MEDIUM] npm install before COPY
   - Breaks layer caching
   - Fix: COPY package*.json first

3. [MEDIUM] Running as root
   - Security risk
   - Fix: Add USER directive

4. [LOW] No .dockerignore
   - node_modules being copied
   - Fix: Create .dockerignore

Optimized Dockerfile:
[Generated optimized version]
```

### debug Command

Common container issues:

```
=== CONTAINER DEBUG ===

Checking: my-app container

Status: Exited (1)
Last logs:
> Error: Cannot find module 'express'

Diagnosis: Dependencies not installed

Fixes:
1. Ensure npm install runs in Dockerfile
2. Check node_modules isn't in .dockerignore
3. Verify WORKDIR is correct

Commands to try:
$ docker logs my-app --tail 50
$ docker exec -it my-app sh
$ docker inspect my-app
```

## Best Practices Checklist

```yaml
security:
  - [ ] Non-root user
  - [ ] No secrets in image
  - [ ] Minimal base image (alpine)
  - [ ] Specific version tags (not :latest)

performance:
  - [ ] Multi-stage builds
  - [ ] Layer caching optimized
  - [ ] .dockerignore present
  - [ ] Minimal final image

reliability:
  - [ ] Health checks defined
  - [ ] Graceful shutdown handling
  - [ ] Volume for persistent data
  - [ ] Restart policy set

development:
  - [ ] Volume mounts for hot reload
  - [ ] docker-compose for local env
  - [ ] Environment variables externalized
```

## Common Patterns

### Development vs Production

```yaml
# docker-compose.yml (base)
services:
  app:
    build: .

# docker-compose.override.yml (dev - auto-loaded)
services:
  app:
    volumes:
      - .:/app
    environment:
      - DEBUG=true

# docker-compose.prod.yml
services:
  app:
    restart: always
    environment:
      - NODE_ENV=production
```

### Database Initialization

```yaml
db:
  image: postgres:15
  volumes:
    - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    - postgres_data:/var/lib/postgresql/data
```

### Secrets Management

```yaml
services:
  app:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## Quick Commands

```bash
# Build and run
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f app

# Shell into container
docker compose exec app sh

# Rebuild single service
docker compose up -d --build app

# Clean up
docker compose down -v
docker system prune -a
```

## Sources

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Hadolint - Dockerfile Linter](https://github.com/hadolint/hadolint)
