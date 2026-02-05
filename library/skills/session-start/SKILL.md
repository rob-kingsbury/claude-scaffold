---
name: session-start
description: Initialize a new work session by loading context, checking issues, and confirming readiness.
---

# Session Start Skill

Run this at the beginning of every work session to ensure proper context loading.

## Invocation

```
/session-start
```

Or naturally: "start session", "begin work", "let's get started"

## What It Does

1. **Reads context files:**
   - `.claude/context.md` - Project state, recent changes
   - `HANDOFF.md` - Current priorities, blockers
   - `.claude/rules/development-workflow.md` - How we work

2. **Checks GitHub Issues:**
   ```bash
   gh issue list --state open --limit 10
   ```

3. **Outputs confirmation:**
   ```
   [Project] ready. [X] open issues. Priority: Issue #XX
   Files loaded: context.md, HANDOFF.md, workflow.md
   ```

## Instructions for Claude

When this skill is invoked:

1. Read the following files in parallel:
   - `.claude/context.md`
   - `HANDOFF.md` (if exists)
   - `.claude/rules/development-workflow.md` (if exists)

2. Run: `gh issue list --state open --limit 10`

3. Extract from context.md:
   - `project:` field (project name)
   - `continue_with:` field (next priority)
   - `last_session:` field (session number)

4. Output in this format:
   ```
   [Project Name] ready. [X] open issues. Priority: [continue_with value]
   Session: [last_session + 1]
   Files loaded: [list of files read]
   ```

5. If any critical files are missing, warn the user but don't fail.

## Example Output

```
Daybook ready. 12 open issues. Priority: Issue #165 (Timesheet approval)
Session: 112
Files loaded: context.md, HANDOFF.md, development-workflow.md

Open Issues:
#165 - Timesheet approval workflow [priority:high]
#162 - Mobile navigation fix [bug]
#158 - Export to PDF [enhancement]
...
```

## Never Skip This

**DO NOT begin work without running session-start.** Context drift causes wasted effort.
