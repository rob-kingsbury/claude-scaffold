---
name: deploy
description: Deployment preparation and execution. Checklists, environment validation, and rollback procedures for safe releases.
---

# Deploy Skill

Prepare and execute deployments safely with comprehensive checklists.

## Invocation

```
/deploy [prepare|checklist|execute|rollback]
```

Or naturally: "prepare for deployment", "deployment checklist", "rollback the release"

## Commands

| Command | Description |
|---------|-------------|
| `/deploy prepare` | Pre-deployment checklist and validation |
| `/deploy checklist` | Show deployment checklist |
| `/deploy execute` | Step-by-step deployment guide |
| `/deploy rollback` | Rollback procedures |

## Pre-Deployment Checklist

### Code Quality

```yaml
code_review:
  - [ ] All PRs merged and reviewed
  - [ ] No pending merge conflicts
  - [ ] Code follows style guidelines
  - [ ] No TODO/FIXME in production code

testing:
  - [ ] All tests passing
  - [ ] Test coverage meets threshold
  - [ ] Manual testing completed
  - [ ] Edge cases verified

security:
  - [ ] No secrets in code
  - [ ] Dependencies updated
  - [ ] Security scan passed
  - [ ] Input validation in place
```

### Environment

```yaml
configuration:
  - [ ] Environment variables documented
  - [ ] Secrets in vault/secure storage
  - [ ] Config files for target environment
  - [ ] Feature flags configured

infrastructure:
  - [ ] Server resources adequate
  - [ ] Database migrations ready
  - [ ] Cache invalidation planned
  - [ ] CDN configured

monitoring:
  - [ ] Logging configured
  - [ ] Error tracking enabled
  - [ ] Performance monitoring active
  - [ ] Alerts configured
```

### Communication

```yaml
stakeholders:
  - [ ] Release notes prepared
  - [ ] Team notified of deployment window
  - [ ] Support team briefed
  - [ ] Rollback plan communicated
```

## Instructions for Claude

### prepare Command

1. **Verify branch status:**
   ```bash
   # Check we're on main/release branch
   git branch --show-current

   # Verify up to date with remote
   git fetch origin
   git status

   # Check for uncommitted changes
   git diff --stat
   ```

2. **Run pre-deployment checks:**
   ```
   === PRE-DEPLOYMENT VALIDATION ===

   Branch: main (up to date with origin)

   Tests:
   ✓ Unit tests: 142/142 passed
   ✓ Integration tests: 28/28 passed
   ✓ E2E tests: 15/15 passed

   Code Quality:
   ✓ No linting errors
   ✓ Type checking passed
   ✓ No security vulnerabilities (npm audit)

   Build:
   ✓ Production build successful
   ✓ Bundle size: 245KB (within budget)

   Ready for deployment: YES
   ```

3. **Generate deployment summary:**
   ```
   === DEPLOYMENT SUMMARY ===

   Version: 1.4.0
   Commits since last deploy: 12

   Changes:
   - feat: Add user export functionality
   - feat: Implement dark mode
   - fix: Correct date formatting in reports
   - perf: Optimize dashboard queries

   Database migrations: 1 pending
   - 004_add_export_history_table.sql

   Environment variables changed:
   - Added: EXPORT_S3_BUCKET
   - Modified: (none)
   - Removed: (none)

   Breaking changes: None
   ```

### checklist Command

Display interactive checklist:

```
=== DEPLOYMENT CHECKLIST ===

Pre-Deploy:
[x] Code review completed
[x] Tests passing
[x] Security scan clean
[ ] Database backup created
[ ] Maintenance page ready

Deploy:
[ ] Notify team of deployment start
[ ] Run database migrations
[ ] Deploy application code
[ ] Clear caches
[ ] Verify health checks

Post-Deploy:
[ ] Smoke test critical paths
[ ] Monitor error rates
[ ] Check performance metrics
[ ] Notify team of completion

Progress: 3/12 complete
```

### execute Command

Step-by-step deployment guide:

```
=== DEPLOYMENT EXECUTION ===

Step 1 of 8: Create database backup
Command: pg_dump -Fc mydb > backup_20240115.dump
Status: PENDING

Press Enter to execute or 's' to skip...

[Executing...]
✓ Backup created: backup_20240115.dump (45MB)

Step 2 of 8: Enable maintenance mode
Command: ./scripts/maintenance.sh on
Status: PENDING

Press Enter to execute or 's' to skip...
```

**Full deployment sequence:**

1. Create database backup
2. Enable maintenance mode (if needed)
3. Run database migrations
4. Deploy application code
5. Clear caches
6. Run health checks
7. Disable maintenance mode
8. Verify deployment

### rollback Command

```
=== ROLLBACK PROCEDURE ===

Current version: 1.4.0
Rolling back to: 1.3.2

Steps:
1. Enable maintenance mode
2. Rollback database migrations (if any)
3. Deploy previous version
4. Clear caches
5. Verify rollback
6. Disable maintenance mode

Database migrations to rollback:
- 004_add_export_history_table.sql (DOWN)

Warning: This will remove the export_history table.
Data in this table will be lost.

Proceed with rollback? [y/N]
```

## Environment-Specific Guides

### Traditional Server (SSH)

```bash
# Connect to server
ssh user@production.example.com

# Pull latest code
cd /var/www/app
git fetch origin
git checkout v1.4.0

# Install dependencies
composer install --no-dev
npm ci --production

# Run migrations
php artisan migrate --force

# Clear caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Restart services
sudo systemctl restart php-fpm
sudo systemctl restart nginx
```

### Docker/Container

```bash
# Build new image
docker build -t myapp:1.4.0 .

# Push to registry
docker push registry.example.com/myapp:1.4.0

# Update deployment
kubectl set image deployment/myapp myapp=registry.example.com/myapp:1.4.0

# Monitor rollout
kubectl rollout status deployment/myapp
```

### Vercel/Netlify

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Deploy
        run: ./scripts/deploy.sh
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

## Rollback Strategies

### Immediate Rollback
- Keep previous version ready
- Database-compatible (no breaking migrations)
- < 5 minute recovery time

### Blue-Green Deployment
- Two identical environments
- Switch traffic between them
- Instant rollback by switching back

### Canary Release
- Deploy to small percentage of users
- Monitor for issues
- Gradually increase if healthy

## Monitoring After Deploy

```yaml
first_5_minutes:
  - Check error rate (should be stable)
  - Monitor response times
  - Verify critical paths work
  - Check database connections

first_hour:
  - Review logs for warnings
  - Monitor memory/CPU usage
  - Check background jobs
  - Verify integrations

first_day:
  - Analyze user feedback
  - Review performance trends
  - Check for edge case errors
```

## Sources

- [The Twelve-Factor App](https://12factor.net/)
- [Continuous Delivery](https://continuousdelivery.com/)
- [Release It!](https://pragprog.com/titles/mnee2/release-it-second-edition/)
