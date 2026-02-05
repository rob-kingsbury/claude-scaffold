---
name: env
description: Set up and manage environment configuration. Create .env files, sync .env.example, and document environment variables.
---

# Env Skill

Set up and manage environment configuration with best practices.

## Invocation

```
/env [action]
```

Actions:
- `/env init` - Create .env and .env.example from detected needs
- `/env sync` - Sync .env.example with current .env (strip values)
- `/env check` - Verify all required vars are set
- `/env docs` - Generate ENV documentation

Or naturally: "set up environment", "create env file", "what env vars do I need"

## Core Principles

1. **Never commit secrets** - .env must be in .gitignore
2. **Document all variables** - .env.example shows required vars
3. **Use sensible defaults** - Development should work with minimal config
4. **Validate on startup** - Fail fast if required vars missing

## File Structure

```
project/
├── .env              # Actual values (gitignored)
├── .env.example      # Template (committed)
├── .env.test         # Test environment (optional)
├── .env.local        # Local overrides (gitignored)
└── docs/
    └── environment.md  # Full documentation
```

## .env.example Template

```bash
# ===========================================
# Application Configuration
# ===========================================

# Application name (used in logs, emails)
APP_NAME=MyApp

# Environment: development, staging, production
NODE_ENV=development

# Server port
PORT=3000

# ===========================================
# Database
# ===========================================

# PostgreSQL connection string
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://localhost:5432/myapp_dev

# ===========================================
# Authentication
# ===========================================

# JWT secret (generate with: openssl rand -hex 32)
JWT_SECRET=

# Session secret (generate with: openssl rand -hex 32)
SESSION_SECRET=

# ===========================================
# External Services
# ===========================================

# Stripe API keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=

# SendGrid API key (get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=

# ===========================================
# Feature Flags
# ===========================================

# Enable debug mode (true/false)
DEBUG=false

# Enable new checkout flow (true/false)
FEATURE_NEW_CHECKOUT=false
```

## Instructions for Claude

### Initialize Environment (/env init)

#### Step 1: Scan Project for Env Usage

```bash
# Find all env variable usage
grep -rn "process.env\." --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" .
grep -rn "getenv\|os.environ\|ENV\[" --include="*.py" --include="*.rb" .
grep -rn "\$_ENV\|\$_SERVER\|getenv" --include="*.php" .
```

#### Step 2: Categorize Variables

Group into categories:
- **App Config** - APP_NAME, NODE_ENV, PORT
- **Database** - DATABASE_URL, DB_HOST, DB_NAME
- **Auth** - JWT_SECRET, SESSION_SECRET
- **External APIs** - STRIPE_KEY, SENDGRID_KEY
- **Feature Flags** - FEATURE_*, ENABLE_*
- **Logging** - LOG_LEVEL, DEBUG

#### Step 3: Determine Required vs Optional

- **Required** - App won't work without it
- **Optional** - Has sensible default or feature is optional

#### Step 4: Generate .env.example

Create with:
- Section headers as comments
- Description for each variable
- Example/default values (not real secrets)
- Instructions for getting API keys

#### Step 5: Create .env

Copy .env.example, fill in development values.

#### Step 6: Update .gitignore

```bash
# Check if .env is gitignored
grep "^\.env$" .gitignore || echo ".env" >> .gitignore
grep "^\.env\.local$" .gitignore || echo ".env.local" >> .gitignore
```

### Sync Environment (/env sync)

#### Step 1: Read Current .env

```bash
cat .env 2>/dev/null
```

#### Step 2: Extract Variable Names

Strip values, keep structure:
```
DATABASE_URL=postgresql://localhost/myapp
→
DATABASE_URL=
```

#### Step 3: Preserve .env.example Comments

Keep existing comments and descriptions, add new variables.

#### Step 4: Write Updated .env.example

### Check Environment (/env check)

#### Step 1: Load Requirements

From .env.example, identify required variables (those without default values).

#### Step 2: Check Current Environment

```bash
# For each required var
echo "Checking DATABASE_URL..."
[ -z "${DATABASE_URL}" ] && echo "MISSING: DATABASE_URL"
```

#### Step 3: Report Results

```
=== ENV CHECK ===

Required: 12
Set: 10
Missing: 2

Missing variables:
- STRIPE_SECRET_KEY (required for payments)
- SENDGRID_API_KEY (required for email)

Optional unset: 3
- FEATURE_NEW_CHECKOUT (default: false)
- DEBUG (default: false)
- LOG_LEVEL (default: info)
```

### Generate Documentation (/env docs)

Create `docs/environment.md`:

```markdown
# Environment Variables

## Required Variables

### DATABASE_URL
- **Type:** String (connection URL)
- **Required:** Yes
- **Example:** `postgresql://user:pass@localhost:5432/myapp`
- **Description:** PostgreSQL connection string

### JWT_SECRET
- **Type:** String (hex)
- **Required:** Yes
- **Generate:** `openssl rand -hex 32`
- **Description:** Secret key for JWT signing

## Optional Variables

### DEBUG
- **Type:** Boolean
- **Default:** `false`
- **Description:** Enable debug logging

## Getting API Keys

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" → STRIPE_PUBLIC_KEY
3. Copy "Secret key" → STRIPE_SECRET_KEY

### SendGrid
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create API key with "Mail Send" permission
3. Copy key → SENDGRID_API_KEY
```

## Common Patterns

### Secret Generation

```bash
# Generate JWT/session secrets
openssl rand -hex 32

# Generate API keys
openssl rand -base64 32

# Generate passwords
openssl rand -base64 16
```

### Environment-Specific Files

```
.env                 # Shared defaults (committed)
.env.local           # Local overrides (gitignored)
.env.development     # Dev-specific
.env.production      # Prod-specific (gitignored!)
.env.test            # Test-specific
```

Load order (later overrides earlier):
1. `.env`
2. `.env.{NODE_ENV}`
3. `.env.local`

### Validation on Startup

```javascript
// Node.js example
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}
```

```php
// PHP example
$required = ['DATABASE_URL', 'JWT_SECRET'];
$missing = array_filter($required, fn($key) => empty(getenv($key)));
if (!empty($missing)) {
    die('Missing required env vars: ' . implode(', ', $missing));
}
```

## Output Format

### After Init

```
=== ENV INITIALIZED ===

Created:
- .env.example (24 variables)
- .env (copied from example)
- docs/environment.md

Categories:
- App Config: 4 vars
- Database: 1 var
- Authentication: 2 vars
- External APIs: 4 vars
- Feature Flags: 3 vars

Gitignore updated: .env, .env.local added

Next steps:
1. Fill in secrets in .env
2. Run /env check to verify
```

### After Sync

```
=== ENV SYNCED ===

.env.example updated:
- Added: 2 new variables
  - REDIS_URL
  - FEATURE_DARK_MODE
- Removed: 1 deprecated variable
  - OLD_API_KEY

.env not modified (add new vars manually)
```

### After Check

```
=== ENV CHECK: PASSED ===

All 12 required variables are set.

Warnings:
- DEBUG=true (should be false in production)
- Using test API keys (STRIPE_PUBLIC_KEY starts with pk_test_)
```

## Integration

### With /deploy
Check environment before deployment to catch missing production vars.

### With Hooks
Use `env-sync.js` hook (from IDEAS.md) to auto-sync .env.example when .env changes.

## Security Checklist

- [ ] .env is in .gitignore
- [ ] .env.local is in .gitignore
- [ ] No real secrets in .env.example
- [ ] Production secrets not in any committed file
- [ ] Different secrets per environment
- [ ] Secrets rotated periodically

## Sources

- [12-Factor App: Config](https://12factor.net/config)
- [dotenv documentation](https://github.com/motdotla/dotenv)
- [Environment Variables Best Practices](https://blog.doppler.com/environment-variables-best-practices)
