# Security Checklist

**Run this checklist before every deployment and periodically during development.**

## Input Validation

- [ ] All user input validated server-side (never trust client-side only)
- [ ] Input type checking (string, int, email, URL, etc.)
- [ ] Input length limits enforced
- [ ] Allowlists preferred over denylists
- [ ] File upload validation (type, size, name sanitization)
- [ ] No path traversal vulnerabilities (`../` in file paths)

## Output Encoding

- [ ] HTML output escaped (`htmlspecialchars()`, `{{ }}` in templates)
- [ ] JSON output properly encoded (`json_encode()`)
- [ ] URL parameters encoded (`urlencode()`)
- [ ] SQL queries use prepared statements / parameterized queries
- [ ] No raw user input in error messages

## Authentication

- [ ] Passwords hashed with bcrypt/Argon2 (never MD5/SHA1)
- [ ] Session tokens are cryptographically random
- [ ] Session regenerated on login/privilege change
- [ ] Logout invalidates session server-side
- [ ] Rate limiting on login attempts
- [ ] Password reset tokens expire (< 1 hour)

## Authorization

- [ ] Every endpoint checks user permissions
- [ ] Ownership verified before data access (user_id check)
- [ ] Admin functions protected by role check
- [ ] API endpoints require authentication where appropriate
- [ ] No sensitive operations via GET requests

## Data Protection

- [ ] PII encrypted at rest where required
- [ ] HTTPS enforced (no mixed content)
- [ ] Sensitive data not logged
- [ ] Database credentials not in code
- [ ] API keys not exposed to frontend
- [ ] `.env` files gitignored

## Headers & CORS

- [ ] CSRF protection on state-changing requests
- [ ] Content-Security-Policy header set
- [ ] X-Frame-Options header (prevent clickjacking)
- [ ] X-Content-Type-Options: nosniff
- [ ] CORS configured to specific origins (not `*` in production)

## Dependencies

- [ ] Dependencies from trusted sources
- [ ] No known vulnerable versions (`npm audit`, `composer audit`)
- [ ] Lock files committed (package-lock.json, composer.lock)
- [ ] Regular dependency updates scheduled

## Error Handling

- [ ] Detailed errors only in development
- [ ] Production errors are generic (no stack traces)
- [ ] Errors logged server-side for debugging
- [ ] No sensitive data in error messages

## Database

- [ ] Principle of least privilege for DB users
- [ ] No direct SQL from user input
- [ ] Soft deletes for important data (audit trail)
- [ ] Backups configured and tested
- [ ] Connection uses SSL in production

## File System

- [ ] Upload directory outside web root (or execution disabled)
- [ ] Uploaded files renamed (no user-controlled names)
- [ ] File type validated by content (not just extension)
- [ ] Temporary files cleaned up

## Secrets Management

- [ ] Secrets in environment variables (not code)
- [ ] Different secrets per environment
- [ ] Secrets rotated periodically
- [ ] No secrets in git history
- [ ] `.env.example` has placeholder values only

**Automated protection:** Enable `pii-blocker.js` and `secrets-blocker.js` hooks to block accidental commits of PII and secrets. See `library/hooks/` for configuration.

---

## Quick Commands

```bash
# Check for hardcoded secrets
grep -rn "password\|secret\|api_key\|token" --include="*.php" --include="*.js" --include="*.ts" .

# Check .env is gitignored
cat .gitignore | grep -E "^\.env"

# Audit npm dependencies
npm audit

# Audit composer dependencies
composer audit

# Check for common vulnerable patterns
grep -rn "eval\|exec\|system\|shell_exec" --include="*.php" .
```

---

## OWASP Top 10 Quick Reference

| Risk | Mitigation |
|------|------------|
| Injection | Prepared statements, input validation |
| Broken Auth | Strong passwords, session management, MFA |
| Sensitive Data | Encryption, HTTPS, minimal data collection |
| XXE | Disable external entities in XML parsers |
| Broken Access | Check permissions on every request |
| Misconfiguration | Security headers, minimal error info |
| XSS | Output encoding, CSP header |
| Insecure Deserialization | Validate serialized data, avoid if possible |
| Vulnerable Components | Regular updates, dependency scanning |
| Insufficient Logging | Log security events, monitor for anomalies |
