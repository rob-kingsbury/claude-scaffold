# Code Quality & Issues Report

**Project:** claude-scaffold
**Date:** 2026-02-06
**Auditor:** Claude Opus 4.6
**Scope:** Full codebase (hooks, skills, stacks, workflows, MCP configs, docs)

---

## Overall Score: 8.4 / 10

| Category | Score | Notes |
|----------|-------|-------|
| Skills Library (35 skills) | 9.5/10 | Consistent structure, good quality, no broken cross-refs |
| Rules (7 rules) | 9.0/10 | Well-written, comprehensive |
| Hooks (11 hooks) | 7.5/10 | Functional bugs fixed, but security gaps and DRY violations remain |
| Stacks (8 stacks) | 7.0/10 | Two incompatible formats, heavy duplication, missing templates |
| Workflows (4 workflows) | 8.0/10 | Fixed regex/branch bugs, minor duplication with skills |
| MCP Configs (3 + README) | 8.5/10 | Fixed non-existent servers, good env var usage |
| Autopilot Scripts | 9.0/10 | Best security practices in project (path validation, atomic writes) |
| Documentation | 8.0/10 | HANDOFF updated, new FUNCTIONS.md created |

---

## Session 1 Fixes (Completed)

12 bugs fixed across 18 files and committed (`ea42701`):

| # | Fix | Severity | Files |
|---|-----|----------|-------|
| 1 | Shell hook snake_case field names | HIGH | auto-format.sh, run-tests.sh |
| 2 | Removed ghost hooks from settings | HIGH | settings.example.json |
| 3 | Branch-protection error message | HIGH | branch-protection.js |
| 4 | Lint-check stderr output | HIGH | lint-check.js |
| 5 | HEREDOC regex relaxed | HIGH | commit-message-check.js |
| 6 | Indentation in blockers | HIGH | pii-blocker.js, secrets-blocker.js |
| 7 | Non-existent MCP servers | HIGH | 3 MCP config files |
| 8 | Gitignore regex in audit.yaml | MEDIUM | audit.yaml |
| 9 | Hardcoded branch in handoff | MEDIUM | handoff.yaml, handoff/SKILL.md |
| 10 | SSN validator 9xx allowed | MEDIUM | pii-blocker.js |
| 11 | Opus 4.6 terminology | LOW | thinking-mode.md, SKILL.md |
| 12 | HANDOFF.md priorities | LOW | HANDOFF.md |

**No regressions found in second audit pass.**

---

## Open Issues by Severity

### CRITICAL (1)

**C1. Branch protection push check trivially bypassable**
- File: `library/hooks/branch-protection.js:70`
- The regex `git\s+push\s+origin\s+(main|master)` only matches exact syntax
- Bypassed by: `git push -u origin main`, `git push origin HEAD:main`, `git push --force origin main`, `git push` (default upstream), `git push origin HEAD:refs/heads/main`
- **Fix:** Rewrite to parse git arguments properly, handle flags between `push` and remote, handle refspec syntax

### HIGH (5)

**H1. All security hooks fail-open on errors**
- Files: All 9 JS hooks
- JSON parse errors caught and exit 0 (allow) instead of exit 2 (block)
- Empty stdin also results in exit 0
- **Fix:** Security-critical hooks (pii-blocker, secrets-blocker, branch-protection) should `process.exit(2)` on error

**H2. Regex detection inherently bypassable via obfuscation**
- Files: pii-blocker.js, secrets-blocker.js
- String concatenation, base64 encoding, hex escapes, variable indirection all bypass regex
- **Fix:** Document as known limitation; consider entropy analysis for high-value strings

**H3. Missing dangerous git patterns in branch-protection**
- File: `library/hooks/branch-protection.js:38-44`
- Missing: `git restore .`, `git branch -D`, `git push origin --delete`, `git checkout -- .`
- `--force-with-lease` is a false positive (safer than `--force`)
- **Fix:** Add missing patterns, exclude `--force-with-lease`

**H4. Command injection in agent-notify.js notifications**
- File: `library/hooks/agent-notify.js:85-121`
- `description` field interpolated into shell commands (osascript, notify-send, PowerShell)
- Crafted description could execute arbitrary commands
- **Fix:** Use `execFile` with array args instead of `execSync` with string interpolation

**H5. No Luhn validation on credit card detection**
- File: `library/hooks/pii-blocker.js:82-90`
- Pattern matches by prefix+length only, causing high false positives
- **Fix:** Add Luhn checksum validation (~15 lines of code)

### MEDIUM (9)

| ID | Issue | File | Fix |
|----|-------|------|-----|
| M1 | AWS context check file-wide, not line-proximate | secrets-blocker.js:90 | Check context within 3 lines of match |
| M2 | Heroku pattern matches all UUIDs when "heroku" in file | secrets-blocker.js:235 | Tighten context to nearby lines |
| M3 | Allowlist patterns missing `$` end-anchor | secrets-blocker.js:58-79 | Add `$` to prevent prefix gaming |
| M4 | No base64/multi-line secret detection | secrets-blocker.js | Add base64 decode + rescan for long strings |
| M5 | SSN 9-digit pattern very broad | pii-blocker.js:71 | Require nearby context ("SSN", "social security") |
| M6 | Phone pattern matches any 10-digit number | pii-blocker.js:92 | Require separator or prefix |
| M7 | npx -y auto-installs without version pinning | All MCP configs | Pin versions or document risk |
| M8 | git add -A in handoff workflow | handoff.yaml:54 | Verify .gitignore before staging all |
| M9 | run-tests.sh no project root validation | run-tests.sh:21 | Validate file path within project |

### LOW (8)

| ID | Issue | File |
|----|-------|------|
| L1 | JWT detection flags test JWTs in test files | secrets-blocker.js:199 |
| L2 | Generic API key regex inconsistent quote handling | secrets-blocker.js:161 |
| L3 | Email pattern missing @invalid. exclusion | pii-blocker.js:97 |
| L4 | IP detection flags RFC 1918 private ranges | pii-blocker.js:103 |
| L5 | PII detection US-only (no international formats) | pii-blocker.js |
| L6 | MYSQL_HOST hardcoded to localhost | mcp/settings.php-mysql.example.json:24 |
| L7 | Branch check execSync has no timeout | branch-protection.js:49 |
| L8 | Audit.yaml security patterns may false-positive | audit.yaml:33-40 |

---

## DRY Violations

### Priority 1: Extract hook-utils.js (HIGH)

**Impact:** ~110 net lines saved across 9 files

Duplicated across pii-blocker.js and secrets-blocker.js (identical):
- `shouldSkipFile()` (12 lines x2)
- `isAllowlisted()` (6 lines x2)
- Dedup logic (12 lines x2)
- stdin reading (7 lines x3 files)
- Event parsing (3 lines x2)
- Skip/exit blocks (12 lines x2)
- `SKIP_EXTENSIONS` array (7 lines x2)
- `SKIP_PATTERNS` base (7 lines x2)

Proposed `hook-utils.js` exports:
```
readStdin()          -- Unified async stdin reader
shouldSkipFile()     -- Configurable skip logic
isAllowlisted()      -- Configurable allowlist check
allowAndExit()       -- process.stdout.write('{}'); process.exit(0)
blockAndExit(msg)    -- console.error(msg); process.exit(2)
deduplicateFindings() -- Shared dedup
formatFindings()     -- Shared formatting
parseHookEvent()     -- Extract file_path/content from event
```

### Priority 2: Extract hook-utils.sh (MEDIUM)

**Impact:** ~25 lines saved across 2 files

Shared between auto-format.sh and run-tests.sh:
- Event parsing via jq (5 lines identical)
- Extension detection
- Feedback JSON output pattern

### Priority 3: Stack defaults mechanism (MEDIUM)

**Impact:** ~80 lines saved across 5 stacks

Identical across 5 template-style stacks:
- Common files block (CLAUDE.md, HANDOFF.md, context.md, workflows.yaml)
- Base rules list (development-workflow, security-checklist)
- Base skills list (session-start, handoff, audit, simplify, fix-issue)

### Priority 4: Workflow-skill duplication (MEDIUM)

**Impact:** ~100 lines of conceptual duplication

audit.yaml duplicates audit/SKILL.md patterns. handoff.yaml duplicates handoff/SKILL.md steps. Resolve by having one reference the other.

---

## Architecture Issues

### Two incompatible stack formats
- **Template-reference format** (5 stacks): php-mysql, laravel, react-supabase, node-cli, static-gsap
- **Inline content format** (3 stacks): nextjs-prisma, python-fastapi, astro-content
- Different key names (`root:` vs `directories:`, `files:` array vs object)
- Any scaffold consumer tool needs to handle both schemas

### Missing template files
- Template-reference stacks point to files like `index.php.template`, `db.php.template` that don't exist
- Only 3 global templates exist: CLAUDE.md.template, context.md.template, HANDOFF.md.template

---

## Positive Findings

- **Zero regressions** from session 1 fixes
- **All 9 JS hooks pass syntax check** (`node -c`)
- **All JSON configs are valid**
- **Skills library is excellent** -- 35 skills, consistent structure, good cross-references
- **Rules are comprehensive** -- 7 rules covering architecture, CSS, DB, workflow, security, API, thinking
- **gather_tasks.py** is the most security-conscious code (no shell=True, path validation, atomic writes, label sanitization)
- **All credentials use env var references** in MCP configs
- **process.exit() called on all code paths** -- no hook can hang indefinitely

---

## Recommended Fix Priority

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Extract hook-utils.js (DRY) | 2-3 hrs | Eliminates ~110 lines of duplication, single point of fix for bugs |
| 2 | Fail-closed on security hooks (H1) | 30 min | Prevents silent bypass via malformed input |
| 3 | Branch protection rewrite (C1) | 1-2 hrs | Actually protects main branch |
| 4 | Sanitize agent-notify shell commands (H4) | 30 min | Prevents command injection |
| 5 | Add Luhn validation (H5) | 30 min | Dramatically reduces CC false positives |
| 6 | Tighten allowlist anchors (M3) | 15 min | Prevents allowlist gaming |
| 7 | Add missing git patterns (H3) | 30 min | Covers git restore, branch -D, etc. |
| 8 | Stack format normalization | 2-3 hrs | Structural, lower urgency |

**Estimated total effort for top 7 fixes: ~6-8 hours**

---

## Files Created This Session

| File | Purpose |
|------|---------|
| `FUNCTIONS.md` | Living functions catalog (52 functions) |
| `AUDIT-REPORT.md` | This report |
