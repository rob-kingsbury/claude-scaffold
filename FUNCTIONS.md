# Functions Catalog

Living document cataloging all reusable functions, utilities, and patterns across claude-scaffold.

**Last Updated:** 2026-02-06
**Total Functions:** 64 (52 original + 9 hook-utils + 3 new)

---

## Summary

| Category | Count |
|----------|-------|
| Hook Functions (stdin, event parsing) | 11 |
| Detection Functions (PII, secrets, security) | 5 |
| Utility Functions (skip checks, allowlists, formatting) | 10 |
| Notification Functions | 2 |
| Autopilot Functions (Python) | 14 |
| Shell Functions (Bash) | 10 |

---

## Shared Module: hook-utils.js

Extracted shared utilities used by pii-blocker, secrets-blocker, and branch-protection hooks.

| Function | Line | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `readStdin` | 38 | `{failClosed}` | Promise\<Object\> | Async stdin reader; exits 2 on error if failClosed |
| `parseHookEvent` | 67 | `event` | `{filePath, content}` | Extracts file_path and content from hook event |
| `shouldSkipFile` | 79 | `filePath, extraPatterns[]` | boolean | Skip binary/vendor/lock files; accepts extra patterns |
| `hasNearbyContext` | 97 | `content, matchIndex, contextPattern, lineRadius` | boolean | Check if context pattern matches within N lines of a match position |
| `isAllowlisted` | 120 | `value, patterns[]` | boolean | Check value against configurable allowlist |
| `deduplicateFindings` | 104 | `findings[]` | `findings[]` | Dedup by type:masked key |
| `formatFindings` | 118 | `findings[], limit` | `{list, more}` | Format for stderr display |
| `allowAndExit` | 131 | none | void | `process.stdout.write('{}'); process.exit(0)` |
| `blockAndExit` | 138 | `message` | void | `console.error(msg); process.exit(2)` |

---

## Hook Functions

Entry-point routines in each hook that read JSON from stdin and orchestrate processing.

| Function | File | Line | Returns | Purpose | Reusable? |
|----------|------|------|---------|---------|-----------|
| `extractPushTarget` | hooks/branch-protection.js | 44 | string/null | Parses git push args to extract target branch (handles flags, refspecs) | **Yes** |
| `main` | hooks/branch-protection.js | 104 | exit 0/2 | Blocks dangerous git ops on protected branches | No |
| `main` | hooks/pii-blocker.js | 179 | exit 0/2 | Scans content for PII, blocks if found | No |
| `main` | hooks/secrets-blocker.js | 310 | exit 0/2 | Scans content for secrets, blocks if found | No |
| `handleTaskComplete` | hooks/agent-notify.js | 42 | void | Parses agent completion, sends notification | No |
| stdin handler | hooks/security-scan.js | 102 | exit 0 | Runs security pattern checks (warn-only) | No |
| stdin handler | hooks/file-size-check.js | 39 | exit 0/2 | Blocks files over 500KB | No |
| stdin handler | hooks/type-check.js | 126 | exit 0/2 | Runs tsc type-check on TS files | No |
| stdin handler | hooks/lint-check.js | 25 | exit 0 | Runs linter based on file extension | No |
| stdin handler | hooks/commit-message-check.js | 55 | exit 0/2 | Validates conventional commit format | No |
| stdin handler | hooks/agent-notify.js | 30 | exit 0 | Delegates to handleTaskComplete | No |
| `main` | autopilot/scripts/gather_tasks.py | 497 | void | CLI entry point for task gathering | No |

---

## Detection Functions

| Function | File | Line | Parameters | Returns | Purpose |
|----------|------|------|------------|---------|---------|
| `luhnCheck` | hooks/pii-blocker.js | 56 | `number` | boolean | Luhn checksum validation for credit card numbers |
| `detectPII` | hooks/pii-blocker.js | 125 | `content` | `[{type, masked, description}]` | Scans against PII_PATTERNS (SSN, CC with Luhn, phone, email, IP, DOB) |
| `detectSecrets` | hooks/secrets-blocker.js | 262 | `content, filePath` | `[{type, masked, description}]` | Scans against SECRET_PATTERNS (22 pattern types incl. base64 + concatenation) |
| `SECURITY_PATTERNS` scan | hooks/security-scan.js | 25-98, 140 | content via loop | `[{name, severity, message, count}]` | 12 anti-patterns (SQL injection, eval, innerHTML, etc.) |
| `runTypeCheck` | hooks/type-check.js | 70 | `tscPath, projectRoot` | `{success, errors}` | Executes `tsc --noEmit` |
| `parseTypeErrors` | hooks/type-check.js | 88 | `output` (tsc stderr) | `[{file, line, column, code, message}]` | Parses tsc output |

---

## Utility Functions

| Function | File | Line | Parameters | Returns | Purpose | Reusable? |
|----------|------|------|------------|---------|---------|-----------|
| `shouldSkipFile` | hooks/pii-blocker.js | 116 | `filePath` | boolean | Skip binary/vendor/lock files | **Yes** |
| `shouldSkipFile` | hooks/secrets-blocker.js | 242 | `filePath` | boolean | Skip binary/vendor/lock/example files | **Yes** |
| `isAllowlisted` | hooks/pii-blocker.js | 131 | `content` | boolean | Test data allowlist (555-xxxx, @example.com) | **Yes** |
| `isAllowlisted` | hooks/secrets-blocker.js | 255 | `match` | boolean | Placeholder allowlist (your_key, changeme, sk_test_) | **Yes** |
| `extractCommitMessage` | hooks/commit-message-check.js | 32 | `command` | string/null | Extracts msg from git commit (-m, HEREDOC) | **Yes** |
| `formatErrors` | hooks/type-check.js | 110 | `errors, maxShow` | string | Formats errors with truncation | **Yes** |
| `findTsConfig` | hooks/type-check.js | 38 | `filePath` | `{configPath, projectRoot}` | Walks up dirs for tsconfig.json | **Yes** |
| `hasTsc` | hooks/type-check.js | 54 | `projectRoot` | string/null | Checks tsc availability (local then global) | **Yes** |
| `sanitize_label` | autopilot/scripts/gather_tasks.py | 99 | `label` | string | Strips non-alphanumeric (injection guard) | **Yes** |
| `validate_path_within_project` | autopilot/scripts/gather_tasks.py | 104 | `filepath, project_dir` | Path/None | Path traversal guard | **Yes** |

---

## Notification Functions

| Function | File | Line | Parameters | Returns | Purpose |
|----------|------|------|------------|---------|---------|
| `sanitizeForShell` | hooks/agent-notify.js | 89 | `str` | string | Strips shell metacharacters for safe interpolation |
| `sendNotification` | hooks/agent-notify.js | 96 | `description, agentId` | void | Cross-platform desktop notification via execFileSync (Win/Mac/Linux) |
| `persistHistory` | hooks/agent-notify.js | 123 | `entry` (object) | void | Writes to .claude/agent-history.json (100-entry cap) |

---

## Autopilot Functions (Python)

| Function | File | Line | Parameters | Returns | Purpose |
|----------|------|------|------------|---------|---------|
| `load_config` | gather_tasks.py | 66 | `project_dir, config_path` | dict | Loads .autopilot.yml with defaults |
| `run_cmd` | gather_tasks.py | 114 | `cmd_list, cwd, timeout` | string/None | Safe subprocess runner (no shell=True) |
| `atomic_write` | gather_tasks.py | 132 | `filepath, content` | void | Atomic temp+rename file write |
| `gather_github_issues` | gather_tasks.py | 149 | `project_dir, config` | list | Fetches open issues via gh CLI |
| `gather_handoff` | gather_tasks.py | 224 | `project_dir, config` | list | Extracts tasks from HANDOFF.md |
| `gather_roadmap` | gather_tasks.py | 270 | `project_dir, config` | list | Pulls unchecked items from roadmap files |
| `gather_todos` | gather_tasks.py | 316 | `project_dir, config` | list | Scans source for TODO/FIXME comments |
| `gather_custom` | gather_tasks.py | 378 | `project_dir, config` | list | Tasks from user-specified markdown files |
| `generate_tasks_md` | gather_tasks.py | 433 | `all_tasks, existing_path` | string | Generates prioritized TASKS.md |

---

## Shell Functions (Bash)

### run_tasks.sh (Autopilot)

| Function | File | Line | Parameters | Returns | Purpose |
|----------|------|------|------------|---------|---------|
| `log` | run_tasks.sh | 45 | `message` | void | Timestamped logging to console + file |
| `cleanup` | run_tasks.sh | 77 | none | void | Removes PID lockfile (trap EXIT) |
| `rotate_logs` | run_tasks.sh | 84 | none | void | Deletes old session logs past MAX_LOG_FILES |
| `count_remaining` | run_tasks.sh | 129 | none | integer | Counts unchecked tasks in TASKS.md |
| `count_done` | run_tasks.sh | 133 | none | integer | Counts checked tasks in TASKS.md |
| `detect_test_command` | run_tasks.sh | 138 | none | string | Auto-detects test runner from project files |
| `build_prompt` | run_tasks.sh | 163 | none | string | Generates claude -p instruction prompt |
| `check_changed_files` | run_tasks.sh | 210 | none | exit 0/1 | Pauses if changed files exceed limit |
| `create_checkpoint` | run_tasks.sh | 223 | `iteration` | void | Creates git tag for rollback |

### Hook Shell Scripts

| Function | File | Line | Purpose |
|----------|------|------|---------|
| main body | hooks/auto-format.sh | 19-74 | Runs formatter (Prettier/Pint/Black/gofmt/rustfmt) by extension |
| main body | hooks/run-tests.sh | 19-111 | Finds and runs related test file by naming convention |

---

## Data Constants

| Constant | File | Line | Count | Purpose |
|----------|------|------|-------|---------|
| `SECURITY_PATTERNS` | security-scan.js | 25-98 | 12 | Security anti-patterns |
| `PII_PATTERNS` | pii-blocker.js | 63-114 | 7 | PII detection patterns |
| `SECRET_PATTERNS` | secrets-blocker.js | 82-240 | 20 | Secret detection patterns |
| `SKIP_EXTENSIONS` | pii-blocker.js | 31-37 | 17 | Binary/media file extensions |
| `SKIP_EXTENSIONS` | secrets-blocker.js | 35-41 | 17 | Binary/media file extensions (identical) |
| `SKIP_PATTERNS` | pii-blocker.js | 40-48 | 7 | Path patterns to skip |
| `SKIP_PATTERNS` | secrets-blocker.js | 44-55 | 10 | Path patterns to skip (superset) |
| `ALLOWLIST_PATTERNS` | pii-blocker.js | 51-60 | 8 | Test/example PII data |
| `ALLOWLIST_PATTERNS` | secrets-blocker.js | 58-79 | 14 | Placeholder secret values |
| `LARGE_FILE_EXCEPTIONS` | file-size-check.js | 27-35 | 7 | Expected-large file patterns |
| `CONVENTIONAL_COMMIT_PATTERN` | commit-message-check.js | 23 | 1 | Commit format regex |
| `CONFIG` | type-check.js | 26-35 | 1 | TypeScript check config |
| `DEFAULT_CONFIG` | gather_tasks.py | 39-62 | 1 | Autopilot default settings |
| `GATHERERS` | gather_tasks.py | 412-418 | 5 | Source-to-function registry |

---

## Duplication Map (Resolved)

Previously duplicated functions now consolidated in `hook-utils.js`:

| Function | Appears In | Lines Each | Extraction Target |
|----------|-----------|------------|-------------------|
| `shouldSkipFile` | pii-blocker.js, secrets-blocker.js | 12 | hook-utils.js |
| `isAllowlisted` | pii-blocker.js, secrets-blocker.js | 6 | hook-utils.js |
| Dedup logic | pii-blocker.js, secrets-blocker.js | 12 | hook-utils.js |
| stdin readline | pii-blocker.js, secrets-blocker.js, branch-protection.js | 7 | hook-utils.js |
| stdin event-listener | 5 other hooks | 5 | hook-utils.js |
| Event parsing | pii-blocker.js, secrets-blocker.js | 3 | hook-utils.js |
| Skip + exit blocks | pii-blocker.js, secrets-blocker.js | 6x2 | hook-utils.js |
| Shell event parsing | auto-format.sh, run-tests.sh | 5 | hook-utils.sh |
| `SKIP_EXTENSIONS` | pii-blocker.js, secrets-blocker.js | 7 | hook-utils.js |
| `SKIP_PATTERNS` (base) | pii-blocker.js, secrets-blocker.js | 7 | hook-utils.js |
