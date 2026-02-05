# Development Workflow Rules

**DO NOT REMOVE** - These rules define how we develop and maintain projects together.

## Core Principles

1. **You direct, Claude builds**: You set priorities and make decisions, I implement and maintain
2. **GitHub Issues for tracking**: All features, bugs, and tasks go in GitHub Issues
3. **Privacy first**: Never commit PII, credentials, or sensitive data
4. **Test locally**: Machine test before asking you to verify
5. **Incremental progress**: Small commits, clear descriptions
6. **Do it right, not right now**: Don't defer work that will need to be done anyway

## Working Patterns

### Starting a New Feature

1. Create GitHub Issue with clear scope
2. I explore existing code and understand context
3. Implement with frequent saves/commits
4. Test locally before showing you
5. You verify and approve or request changes

### Making Changes

1. Read existing files first (never guess at structure)
2. Prefer editing over creating new files
3. Keep changes focused on the task
4. No over-engineering or unnecessary refactoring
5. Commit with clear messages describing what and why

### When Stuck or Unsure

1. Ask clarifying questions
2. Present options with trade-offs
3. Wait for your decision
4. Never make assumptions about preferences

## Commit Messages

Format:
```
Short description of change

- Detail 1
- Detail 2

Fixes #123

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Auto-Close Issues in Commits

When a commit completes a GitHub issue, include one of these keywords:
- `Fixes #123` - Closes the issue when merged/pushed
- `Closes #123` - Same as Fixes
- `Resolves #123` - Same as Fixes

No emojis. No "Generated with Claude Code" footer.

## Destructive Actions

**Always require confirmation before:**
- Deleting files or directories
- Dropping database tables
- Force pushing to any branch
- Resetting git history
- Bulk updates/deletes

## Before Every Commit

Checklist:
- [ ] No credentials or PII in changed files
- [ ] Changes match the task scope
- [ ] Tested locally where applicable
- [ ] Commit message is clear

## Before Every Push

Checklist:
- [ ] Run workspace cleanup commands
- [ ] Review `git diff` for sensitive data
- [ ] Ensure .gitignore excludes all sensitive paths

## GitHub Issues

### Workflow
```bash
# View open issues
gh issue list --state open

# Create issue
gh issue create --title "Title" --body "Description" --label "enhancement"

# Close via commit (preferred)
# Include "Fixes #123" in commit message - auto-closes on push

# Manual close (if needed)
gh issue close <number> --comment "Completed in <commit>"
```

## Session Handoff Procedure

**Before ending any session:**

1. **Ensure all tasks are GitHub Issues**
   - Any incomplete work → create or update GitHub Issue
   - Single source of truth for task tracking

2. **Update context.md** with:
   - What was done this session
   - Files created/modified
   - GitHub issues created/closed

3. **Clean the workspace**:
   ```bash
   # Find temp/test directories
   find . -type d \( -name "temp_*" -o -name "test_*" \) -not -path "./.git/*"

   # Find empty directories
   find . -type d -empty -not -path "./.git/*"

   # Find stray data files
   ls *.zip *.csv *.log 2>/dev/null
   ```

4. **Push all changes to GitHub**

5. **Tell user what to continue with**:
   ```
   Continue working on [project]. Priority: Issue #XX
   ```

## DRY Principles

Before creating new code:
1. Search for existing implementations
2. Check shared utilities/helpers
3. Extract if used 3+ times
4. Document in functions.md or equivalent

---

*These rules evolve as we work together. Update as needed.*
