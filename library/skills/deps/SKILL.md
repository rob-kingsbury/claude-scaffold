---
name: deps
description: Audit and manage dependencies - security vulnerabilities, outdated packages, license compliance. Supports npm, pip, composer, cargo.
---

# Deps Skill

Audit, update, and manage project dependencies safely.

## Invocation

```
/deps [action]
```

Actions:
- `/deps audit` - Check for security vulnerabilities
- `/deps outdated` - List outdated packages
- `/deps update` - Update packages safely
- `/deps licenses` - Check license compliance
- `/deps why [package]` - Why is this package installed?

Or naturally: "check dependencies", "update packages", "security audit"

## Package Manager Detection

```bash
# Auto-detect package manager
if [ -f "package-lock.json" ]; then
  echo "npm"
elif [ -f "yarn.lock" ]; then
  echo "yarn"
elif [ -f "pnpm-lock.yaml" ]; then
  echo "pnpm"
elif [ -f "bun.lockb" ]; then
  echo "bun"
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  echo "pip/poetry"
elif [ -f "composer.lock" ]; then
  echo "composer"
elif [ -f "Cargo.lock" ]; then
  echo "cargo"
elif [ -f "go.sum" ]; then
  echo "go"
fi
```

## Security Audit

### Node.js (npm/yarn/pnpm)

```bash
# npm audit
npm audit

# npm audit with JSON output
npm audit --json

# Fix automatically (minor/patch only)
npm audit fix

# See what would be fixed
npm audit fix --dry-run

# Force fix (may include breaking changes)
npm audit fix --force
```

### Python (pip)

```bash
# Install safety
pip install safety

# Run audit
safety check

# Check requirements file
safety check -r requirements.txt

# JSON output
safety check --json

# Alternative: pip-audit (from Google)
pip install pip-audit
pip-audit
```

### PHP (Composer)

```bash
# Built-in audit (Composer 2.4+)
composer audit

# JSON output
composer audit --format=json

# Using Roave Security Advisories
composer require --dev roave/security-advisories:dev-latest
```

### Rust (Cargo)

```bash
# Install cargo-audit
cargo install cargo-audit

# Run audit
cargo audit

# JSON output
cargo audit --json

# Fix vulnerabilities
cargo audit fix
```

### Go

```bash
# Built-in vulnerability check (Go 1.18+)
go list -m all | nancy sleuth

# Or govulncheck
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
```

## Outdated Packages

### Node.js

```bash
# List outdated
npm outdated

# Interactive update (npm-check-updates)
npx npm-check-updates

# Preview updates
npx npm-check-updates

# Apply updates to package.json
npx npm-check-updates -u

# Then install
npm install
```

### Python

```bash
# List outdated
pip list --outdated

# Using pip-review
pip install pip-review
pip-review --local

# Interactive update
pip-review --local --interactive

# Auto-update all
pip-review --local --auto
```

### PHP

```bash
# List outdated
composer outdated

# Direct dependencies only
composer outdated --direct

# Update single package
composer update vendor/package

# Update all (respecting constraints)
composer update
```

## Safe Update Strategy

### 1. Check Current State

```bash
# Node.js
npm outdated
npm audit

# Save current state
cp package-lock.json package-lock.json.backup
```

### 2. Categorize Updates

| Type | Risk | Strategy |
|------|------|----------|
| Patch (1.2.3 → 1.2.4) | Low | Auto-update |
| Minor (1.2.3 → 1.3.0) | Medium | Review changelog |
| Major (1.2.3 → 2.0.0) | High | Test thoroughly |

### 3. Update Incrementally

```bash
# Update patches only
npm update

# Update specific package
npm install lodash@latest

# Update major version
npm install react@18
```

### 4. Test After Updates

```bash
# Run tests
npm test

# Type check (if TypeScript)
npm run type-check

# Build
npm run build

# Manual smoke test
npm start
```

### 5. Commit Separately

```bash
# Commit lock file changes separately
git add package-lock.json
git commit -m "chore: update dependencies"

# Or with details
git commit -m "chore(deps): update lodash 4.17.20 → 4.17.21

Security fix for prototype pollution vulnerability.
CVE-2021-23337"
```

## License Compliance

### Node.js

```bash
# Install license-checker
npm install -g license-checker

# List all licenses
license-checker

# Summary
license-checker --summary

# Check for problematic licenses
license-checker --onlyAllow "MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause"

# CSV output
license-checker --csv --out licenses.csv
```

### Python

```bash
# Install pip-licenses
pip install pip-licenses

# List licenses
pip-licenses

# Check specific licenses
pip-licenses --allow-only="MIT License;BSD License;Apache Software License"
```

### License Categories

| Category | Licenses | Commercial Use |
|----------|----------|----------------|
| Permissive | MIT, BSD, Apache 2.0, ISC | Safe |
| Weak Copyleft | LGPL, MPL | Usually safe |
| Strong Copyleft | GPL, AGPL | Requires review |
| Proprietary | Various | License required |

## Dependency Analysis

### Why is this installed?

```bash
# npm
npm explain lodash
npm ls lodash

# yarn
yarn why lodash

# pnpm
pnpm why lodash

# pip
pip show lodash
pipdeptree -p lodash
```

### Dependency Tree

```bash
# npm
npm ls

# Depth limit
npm ls --depth=2

# Production only
npm ls --prod

# Visualize
npx npmgraph
```

### Find Unused Dependencies

```bash
# Node.js - depcheck
npx depcheck

# Output unused deps
npx depcheck --json
```

## Automated Dependency Updates

### Dependabot (GitHub)

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      development-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"
        update-types:
          - "minor"
          - "patch"
```

### Renovate (Alternative)

Create `renovate.json`:

```json
{
  "extends": [
    "config:base"
  ],
  "schedule": ["before 5am on Monday"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ]
}
```

## Output Format

### Audit Results

```
=== DEPENDENCY AUDIT ===

Package Manager: npm
Total packages: 245

VULNERABILITIES FOUND: 3

HIGH (1):
- lodash < 4.17.21
  Prototype Pollution (CVE-2021-23337)
  Fix: npm audit fix

MODERATE (2):
- minimist < 1.2.6
  Prototype Pollution
  Via: mkdirp → minimist
  Fix: npm update mkdirp

- glob-parent < 5.1.2
  Regular Expression DoS
  Via: chokidar → glob-parent
  Fix: npm update chokidar

Recommended actions:
1. Run: npm audit fix
2. Review breaking changes for remaining issues
3. Update: npm update mkdirp chokidar
```

### Outdated Report

```
=== OUTDATED PACKAGES ===

MAJOR UPDATES (Breaking changes):
┌──────────┬─────────┬────────┬─────────────────┐
│ Package  │ Current │ Latest │ Breaking Change │
├──────────┼─────────┼────────┼─────────────────┤
│ react    │ 17.0.2  │ 18.2.0 │ Concurrent mode │
│ webpack  │ 4.46.0  │ 5.88.0 │ Config changes  │
└──────────┴─────────┴────────┴─────────────────┘

MINOR UPDATES (New features):
┌──────────┬─────────┬────────┐
│ Package  │ Current │ Latest │
├──────────┼─────────┼────────┤
│ axios    │ 1.4.0   │ 1.6.0  │
│ eslint   │ 8.40.0  │ 8.50.0 │
└──────────┴─────────┴────────┘

PATCH UPDATES (Bug fixes):
- 12 packages have patch updates available

Recommended: npm update (updates patches and minors within semver)
```

### License Report

```
=== LICENSE COMPLIANCE ===

Total packages: 245

By license:
- MIT: 180 (73%)
- ISC: 30 (12%)
- Apache-2.0: 20 (8%)
- BSD-3-Clause: 10 (4%)
- GPL-3.0: 3 (1%)  ⚠️ Review required
- Unknown: 2 (1%) ⚠️ Investigation needed

Packages requiring review:
1. some-gpl-package (GPL-3.0)
   Used by: your-module
   Action: Check if compliant with your license

2. mystery-package (Unknown)
   Action: Check package source for license
```

## Integration

### With /github-actions
Add dependency audit to CI:

```yaml
- name: Security audit
  run: npm audit --audit-level=high
```

### With /changelog
Document dependency updates in changelog:

```markdown
### Security
- Updated lodash to 4.17.21 (CVE-2021-23337)
```

### Pre-commit Hook

Add to `.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": { "command": "npm install" },
      "command": "node .claude/hooks/deps-check.js"
    }]
  }
}
```

## Best Practices

1. **Audit regularly** - Weekly at minimum
2. **Update incrementally** - Don't batch major updates
3. **Read changelogs** - Especially for major versions
4. **Test after updates** - Run full test suite
5. **Lock versions** - Use lock files, commit them
6. **Review licenses** - Before adding new deps
7. **Minimize dependencies** - Each one is a liability

## Sources

- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk Vulnerability Database](https://snyk.io/vuln)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [GitHub Advisory Database](https://github.com/advisories)
