---
name: audit
description: Run security, code quality, and accessibility audits on the codebase.
---

# Audit Skill

Comprehensive codebase audit for security, quality, and accessibility issues.

## Invocation

```
/audit [type] [target]
```

Types:
- `security` - Security vulnerabilities
- `quality` - Code quality issues
- `a11y` - Accessibility issues
- `all` - Everything (default)

Target: Optional file or directory path

## Examples

```
/audit                    # Full audit
/audit security           # Security only
/audit quality src/       # Quality audit on src/
/audit a11y pages/        # Accessibility on pages/
```

## What It Checks

### Security Audit
- [ ] Hardcoded credentials (password, secret, api_key, token)
- [ ] .env files not gitignored
- [ ] SQL injection vulnerabilities (string interpolation in queries)
- [ ] XSS vulnerabilities (unescaped output)
- [ ] Path traversal (../ in file operations)
- [ ] Insecure functions (eval, exec, shell_exec)
- [ ] Missing CSRF protection
- [ ] Exposed sensitive routes

### Quality Audit
- [ ] Console.log statements (should be removed)
- [ ] TODO/FIXME comments without GitHub Issues
- [ ] Commented-out code blocks
- [ ] Duplicated code (DRY violations)
- [ ] Magic numbers/strings (should be constants)
- [ ] Functions over 50 lines
- [ ] Deeply nested code (> 3 levels)
- [ ] Missing error handling

### Accessibility Audit
- [ ] Images missing alt text
- [ ] Form inputs missing labels
- [ ] Missing ARIA attributes on interactive elements
- [ ] Color contrast issues
- [ ] Missing skip links
- [ ] Touch targets < 44px

## Instructions for Claude

When this skill is invoked:

### 1. Determine Scope
- Parse audit type (security, quality, a11y, or all)
- Parse target path (default: entire project)

### 2. Run Checks
For each category, search the codebase using Grep/Glob tools.

**Security patterns:**
```bash
# Hardcoded secrets
grep -rn "password\s*=\s*['\"]" --include="*.php" --include="*.js" --include="*.ts"
grep -rn "api_key\s*=\s*['\"]" --include="*.php" --include="*.js" --include="*.ts"

# SQL injection
grep -rn "SELECT.*\$" --include="*.php"
grep -rn "WHERE.*\$" --include="*.php"

# Dangerous functions
grep -rn "eval\|exec\|shell_exec\|system" --include="*.php"
```

**Quality patterns:**
```bash
# Debug statements
grep -rn "console\.log\|var_dump\|print_r" --include="*.php" --include="*.js" --include="*.ts"

# TODOs without issues
grep -rn "TODO\|FIXME\|HACK" --include="*.php" --include="*.js" --include="*.ts"
```

### 3. Categorize Findings

| Severity | Action |
|----------|--------|
| CRITICAL | Fix immediately, block deployment |
| HIGH | Fix before next commit |
| MEDIUM | Fix in current session |
| LOW | Create GitHub Issue for later |

### 4. Output Report

```
=== AUDIT REPORT ===

Security: [X] issues
Quality: [X] issues
Accessibility: [X] issues

CRITICAL (fix now):
- [file:line] Description

HIGH (fix before commit):
- [file:line] Description

MEDIUM (fix this session):
- [file:line] Description

LOW (create issues):
- [file:line] Description

Created Issues: #XX, #YY
```

### 5. Auto-Fix Where Safe
- Remove console.log statements (if clearly debug)
- Add missing alt="" to decorative images
- Escape unescaped output

**Always ask before auto-fixing security issues.**

## Integration

Run `/audit` before:
- Major commits
- Pull requests
- Deployments
- Code reviews
