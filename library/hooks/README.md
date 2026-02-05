# Claude Code Hooks

Hooks are shell commands that execute at specific points in Claude Code's lifecycle. They provide deterministic control over behavior.

## Hook Events

| Event | When | Use Cases |
|-------|------|-----------|
| `PreToolUse` | Before a tool runs | Block edits, validate commands |
| `PostToolUse` | After a tool completes | Auto-format, run tests, lint |
| `UserPromptSubmit` | When user submits prompt | Add context, validate input |
| `Stop` | When Claude finishes | Decide if should continue |
| `Notification` | On notifications | Custom alerts |
| `SessionStart` | Session begins | Load context, environment setup |
| `SessionEnd` | Session ends | Cleanup, logging |

## Configuration

Hooks are defined in `.claude/settings.json` or `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "command",
        "command": "node .claude/hooks/pre-tool.js"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "npm run lint -- --fix"
      }
    ]
  }
}
```

## Hook Response Format

Hooks communicate via stdin/stdout/exit codes:

**Input (stdin):** JSON with event data (properties use snake_case: `tool_input`, `tool_name`)
**Output (stdout):** JSON response (only processed when exit code is 0)
**Exit code:** 0 = success (check JSON), 2 = block action

### Blocking Operations

Two ways to block:

1. **Exit code 2** (simpler): Write reason to stderr, exit 2
   ```javascript
   console.error('Blocked: reason here');
   process.exit(2);
   ```

2. **JSON response** (more control): Exit 0 with JSON
   ```json
   { "ok": false, "reason": "Blocked: reason here" }
   ```

### Allowing Operations

```javascript
process.stdout.write('{}');  // or { "ok": true }
process.exit(0);
```

## Quick Start

Use the interactive menu:
```
/hooks
```

Or create hooks manually in `.claude/settings.json`.

## Included Hook Templates

### Pre-Tool Hooks (block before action)
- `branch-protection.js` - Prevent dangerous git operations on main
- `pii-blocker.js` - Block PII (SSNs, credit cards, phone numbers)
- `secrets-blocker.js` - Block secrets (API keys, passwords, tokens)
- `commit-message-check.js` - Enforce conventional commit format
- `file-size-check.js` - Warn/block large files (>100KB warn, >500KB block)
- `lint-check.js` - Run linter before edits (advisory)
- `security-scan.js` - Scan for security issues (advisory)
- `type-check.js` - TypeScript type check before edits (advisory)

### Post-Tool Hooks (run after action)
- `auto-format.sh` - Format code after edits
- `run-tests.sh` - Run related tests after changes
- `agent-notify.js` - Desktop notifications when agents complete

## Sources

- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [DataCamp Hooks Tutorial](https://www.datacamp.com/tutorial/claude-code-hooks)
- [awesome-claude-code Hooks](https://github.com/hesreallyhim/awesome-claude-code)
