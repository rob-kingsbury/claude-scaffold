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

**Input (stdin):** JSON with event data
**Output (stdout):** JSON response
**Exit code:** 0 = success, 2 = block action, other = error

### Response Fields

```json
{
  "block": true,          // PreToolUse only - blocks the action
  "message": "User message",
  "feedback": "Info text",
  "suppressOutput": false,
  "continue": true
}
```

## Quick Start

Use the interactive menu:
```
/hooks
```

Or create hooks manually in `.claude/settings.json`.

## Included Hook Templates

### Pre-Tool Hooks (block before action)
- `branch-protection.js` - Prevent commits/pushes to main
- `pii-blocker.js` - Block PII (SSNs, credit cards, phone numbers)
- `secrets-blocker.js` - Block secrets (API keys, passwords, tokens)
- `skill-suggester.js` - Suggest relevant skills based on prompt
- `tdd-guard.js` - Enforce TDD by blocking implementation without tests

### Post-Tool Hooks (run after action)
- `auto-format.sh` - Format code after edits
- `run-tests.sh` - Run tests after code changes

## Sources

- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [DataCamp Hooks Tutorial](https://www.datacamp.com/tutorial/claude-code-hooks)
- [awesome-claude-code Hooks](https://github.com/hesreallyhim/awesome-claude-code)
