---
name: ci-cd
description: CI/CD pipeline configuration for GitHub Actions, GitLab CI, and other platforms. Automate testing, building, and deployment.
---

# CI/CD Skill

Configure continuous integration and deployment pipelines.

## Invocation

```
/ci-cd [init|github|gitlab|optimize]
```

Or naturally: "set up CI", "add GitHub Actions", "automate deployment"

## Commands

| Command | Description |
|---------|-------------|
| `/ci-cd init` | Detect project and create appropriate pipeline |
| `/ci-cd github` | Generate GitHub Actions workflow |
| `/ci-cd gitlab` | Generate GitLab CI config |
| `/ci-cd optimize` | Improve existing pipeline |

## GitHub Actions Templates

### Node.js CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: matrix.node-version == '20.x'

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
```

### Python CI

```yaml
name: Python CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python ${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint with ruff
        run: ruff check .

      - name: Type check with mypy
        run: mypy .

      - name: Test with pytest
        run: pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: matrix.python-version == '3.11'
```

### PHP CI

```yaml
name: PHP CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, pdo_mysql
          coverage: xdebug

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress

      - name: Run PHPStan
        run: vendor/bin/phpstan analyse

      - name: Run tests
        run: vendor/bin/phpunit --coverage-clover coverage.xml
        env:
          DB_HOST: 127.0.0.1
          DB_DATABASE: test
          DB_USERNAME: root
          DB_PASSWORD: root
```

### Deploy to Vercel

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deploy to Server via SSH

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/app
            git pull origin main
            composer install --no-dev
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            sudo systemctl reload php-fpm
```

### Docker Build & Push

```yaml
name: Docker

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## GitLab CI Template

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

cache:
  paths:
    - node_modules/

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run lint
    - npm test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main

deploy:
  stage: deploy
  image: alpine
  script:
    - apk add --no-cache rsync openssh
    - rsync -avz --delete dist/ user@server:/var/www/app/
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
```

## Instructions for Claude

### init Command

1. **Detect project type:**
   - package.json → Node.js
   - requirements.txt → Python
   - composer.json → PHP
   - go.mod → Go
   - Cargo.toml → Rust

2. **Detect hosting platform:**
   - Check for .github/ → GitHub
   - Check for .gitlab-ci.yml → GitLab
   - Ask if unclear

3. **Generate appropriate pipeline with:**
   - Testing
   - Linting
   - Building
   - Deployment (if target known)

### optimize Command

Analyze existing pipeline:

```
=== CI/CD OPTIMIZATION ===

Current Pipeline: .github/workflows/ci.yml

Issues Found:

1. [HIGH] No caching configured
   - npm install runs fresh every time
   - Fix: Add actions/cache or use setup-node cache

2. [MEDIUM] Sequential jobs that could parallelize
   - lint and test can run simultaneously
   - Saves ~2 minutes per run

3. [LOW] Using ubuntu-latest
   - Can break unexpectedly
   - Fix: Pin to ubuntu-22.04

Optimizations Applied:
- Added npm caching (saves ~45s)
- Parallelized lint + test jobs
- Added matrix for Node versions
- Pinned runner version

Estimated improvement: 3m 20s → 1m 45s
```

## Pipeline Patterns

### PR Checks vs Main Deploy

```yaml
on:
  push:
    branches: [main]  # Deploy on main
  pull_request:
    branches: [main]  # Check PRs

jobs:
  test:
    # Always runs

  deploy:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    # Only on main push
```

### Environment Protection

```yaml
deploy-staging:
  environment: staging
  # Auto-deploy

deploy-production:
  environment: production
  # Requires approval in GitHub settings
```

### Secrets Management

```yaml
# Repository secrets (Settings > Secrets)
env:
  API_KEY: ${{ secrets.API_KEY }}

# Environment secrets (more secure)
environment: production
env:
  API_KEY: ${{ secrets.PROD_API_KEY }}
```

### Conditional Steps

```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'

- name: Deploy to production
  if: startsWith(github.ref, 'refs/tags/v')

- name: Notify on failure
  if: failure()
```

## Best Practices Checklist

```yaml
speed:
  - [ ] Caching enabled (dependencies, build artifacts)
  - [ ] Parallel jobs where possible
  - [ ] Matrix builds for multi-version testing
  - [ ] Fail fast on lint/type errors

security:
  - [ ] Secrets not in code (use repository secrets)
  - [ ] Minimal permissions (GITHUB_TOKEN)
  - [ ] Pin action versions (@v4, not @main)
  - [ ] Dependency scanning enabled

reliability:
  - [ ] Pin runner versions
  - [ ] Retry flaky steps
  - [ ] Timeout limits set
  - [ ] Status checks required for PRs

visibility:
  - [ ] Coverage reporting
  - [ ] Build status badges
  - [ ] Deployment notifications
  - [ ] Artifact uploads
```

## Quick Reference

```yaml
# Common actions
actions/checkout@v4        # Clone repo
actions/setup-node@v4      # Install Node
actions/setup-python@v5    # Install Python
actions/cache@v4           # Cache dependencies
actions/upload-artifact@v4 # Save build output

# Useful conditions
if: github.event_name == 'push'
if: github.ref == 'refs/heads/main'
if: startsWith(github.ref, 'refs/tags/')
if: contains(github.event.head_commit.message, '[skip ci]') == false
if: failure()
if: always()
```

## Sources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitLab CI Docs](https://docs.gitlab.com/ee/ci/)
- [Awesome Actions](https://github.com/sdras/awesome-actions)
