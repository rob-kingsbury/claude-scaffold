---
name: code-review
description: Systematic code review for pull requests or local changes. Checks quality, security, performance, and style.
---

# Code Review Skill

Comprehensive code review following best practices for quality, security, and maintainability.

## Invocation

```
/code-review [file|PR number|branch]
```

Or naturally: "review this code", "check this PR", "review my changes"

## Review Dimensions

### 1. Correctness
- Does the code do what it's supposed to do?
- Are edge cases handled?
- Is error handling appropriate?

### 2. Security
- Input validation present?
- Output properly escaped?
- No hardcoded secrets?
- SQL injection / XSS protected?

### 3. Performance
- Efficient algorithms?
- No N+1 queries?
- Appropriate caching?
- No unnecessary re-renders?

### 4. Maintainability
- Code is readable?
- Functions are focused (single responsibility)?
- Naming is clear?
- No magic numbers/strings?

### 5. Testing
- Tests exist for new code?
- Tests cover edge cases?
- Tests are meaningful (not just coverage)?

### 6. Style
- Follows project conventions?
- Consistent formatting?
- No commented-out code?

## Instructions for Claude

### Step 1: Gather Context

**For PR:**
```bash
gh pr view [number] --json title,body,files,additions,deletions
gh pr diff [number]
```

**For branch:**
```bash
git diff main..HEAD
git log main..HEAD --oneline
```

**For file:**
```bash
# Read the file directly
```

### Step 2: Analyze Changes

For each changed file:
1. Read the full file (context matters)
2. Identify the changes
3. Check against each dimension

### Step 3: Document Findings

Categorize findings:

| Severity | Meaning | Action |
|----------|---------|--------|
| **BLOCKER** | Must fix before merge | Block PR |
| **CRITICAL** | Security/correctness issue | Request changes |
| **MAJOR** | Significant quality issue | Suggest fix |
| **MINOR** | Style/preference | Comment |
| **NIT** | Trivial suggestion | Optional |

### Step 4: Provide Feedback

For each finding:
```markdown
**[SEVERITY]** file.js:42 - Brief description

Problem: What's wrong
Impact: Why it matters
Suggestion: How to fix

```diff
- current code
+ suggested fix
```
```

## Review Checklist

### Security
- [ ] No hardcoded credentials
- [ ] User input validated
- [ ] Output escaped for context (HTML, SQL, etc.)
- [ ] Auth checks on protected routes
- [ ] No path traversal vulnerabilities
- [ ] CSRF protection present
- [ ] Rate limiting on sensitive endpoints

### Code Quality
- [ ] Functions have single responsibility
- [ ] No deeply nested conditionals (>3 levels)
- [ ] Early returns used appropriately
- [ ] No duplicate code
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate (not excessive)

### Performance
- [ ] Database queries are efficient
- [ ] No N+1 query problems
- [ ] Large data sets are paginated
- [ ] Expensive operations are cached
- [ ] No unnecessary re-renders (React)
- [ ] Assets are optimized

### Testing
- [ ] New code has tests
- [ ] Tests cover happy path
- [ ] Tests cover edge cases
- [ ] Tests cover error conditions
- [ ] Tests are independent (no shared state)
- [ ] Mocks are used appropriately

### Documentation
- [ ] Complex logic is commented
- [ ] Public APIs are documented
- [ ] README updated if needed
- [ ] Breaking changes noted

## Output Format

```markdown
# Code Review: [PR/Branch/File]

## Summary
[1-2 sentence overview of the changes]

## Findings

### BLOCKER (0)
None

### CRITICAL (1)
- **[CRITICAL]** src/auth.js:45 - SQL injection vulnerability

  Problem: User input directly interpolated into query
  Impact: Attackers can extract/modify database

  ```diff
  - db.query(`SELECT * FROM users WHERE id = ${userId}`)
  + db.query('SELECT * FROM users WHERE id = ?', [userId])
  ```

### MAJOR (2)
- **[MAJOR]** src/api.js:120 - Missing error handling
  ...

### MINOR (3)
- **[MINOR]** src/utils.js:15 - Could use destructuring
  ...

## Recommendations

1. Fix the SQL injection before merging
2. Add error handling to API endpoints
3. Consider extracting duplicate validation logic

## Verdict

[ ] **APPROVE** - Ready to merge
[x] **REQUEST CHANGES** - Needs fixes
[ ] **COMMENT** - Discussion needed
```

## PR Comment via CLI

```bash
gh pr review [number] --request-changes --body "$(cat <<'EOF'
## Code Review

### Critical Issues
1. SQL injection in auth.js:45

### Suggestions
1. Add error handling to API endpoints

Please address the critical issues before merging.
EOF
)"
```

## Integration Tips

### With /audit
Run `/audit security` before code review for automated checks.

### With /tdd
Verify tests follow TDD principles during review.

### With /fix-issue
After review, use `/fix-issue` to implement suggested changes.

## Sources

- [Trail of Bits Security Skills](https://github.com/trailofbits)
- [Google Code Review Guide](https://google.github.io/eng-practices/review/)
