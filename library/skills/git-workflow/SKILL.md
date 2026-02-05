---
name: git-workflow
description: Git workflow management including branching strategy, commit conventions, and PR preparation. Use for any git operations.
---

# Git Workflow Skill

Structured git workflow with branching strategy, conventional commits, and PR preparation.

## Invocation

```
/git-workflow [action]
```

Actions: `branch`, `commit`, `pr`, `merge`, `release`

Or naturally: "create a branch", "commit these changes", "prepare PR"

## Branching Strategy

### Branch Naming Convention

```
type/description-in-kebab-case

Examples:
feature/user-authentication
fix/login-validation-error
refactor/database-queries
docs/api-documentation
chore/update-dependencies
```

### Branch Types

| Type | Purpose | Base Branch | Merge To |
|------|---------|-------------|----------|
| `feature/` | New functionality | `main` | `main` |
| `fix/` | Bug fixes | `main` | `main` |
| `hotfix/` | Urgent production fixes | `main` | `main` + tag |
| `refactor/` | Code improvements | `main` | `main` |
| `docs/` | Documentation only | `main` | `main` |
| `chore/` | Maintenance tasks | `main` | `main` |
| `release/` | Release preparation | `main` | `main` + tag |

## Commit Convention

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature or fix |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance, dependencies |

### Examples

```bash
feat(auth): add password reset functionality

- Add forgot password form
- Implement email sending
- Create reset token logic

Fixes #123
```

```bash
fix(api): handle null response from external service

The API was crashing when the external service
returned null instead of an empty array.

Fixes #456
```

## Instructions for Claude

### Creating a Branch

```bash
# 1. Ensure on main and up to date
git checkout main
git pull origin main

# 2. Create and switch to new branch
git checkout -b feature/[description]

# 3. Confirm
git branch --show-current
```

Output:
```
Created branch: feature/[description]
Base: main (commit abc123)
Ready to work.
```

### Making Commits

1. **Stage specific files** (not `git add .`):
   ```bash
   git add src/specific-file.js tests/specific-file.test.js
   ```

2. **Write conventional commit**:
   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): subject

   - Detail 1
   - Detail 2

   Fixes #XX

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

3. **Verify**:
   ```bash
   git log -1 --oneline
   ```

### Preparing a PR

1. **Check branch status**:
   ```bash
   git fetch origin
   git log origin/main..HEAD --oneline
   git diff origin/main --stat
   ```

2. **Rebase if needed** (linear history):
   ```bash
   git rebase origin/main
   ```

3. **Push branch**:
   ```bash
   git push -u origin HEAD
   ```

4. **Create PR**:
   ```bash
   gh pr create --title "type(scope): subject" --body "$(cat <<'EOF'
   ## Summary
   - Change 1
   - Change 2

   ## Test Plan
   - [ ] Unit tests pass
   - [ ] Manual testing done

   Fixes #XX
   EOF
   )"
   ```

### Handling Conflicts

1. **Fetch latest**:
   ```bash
   git fetch origin main
   ```

2. **Rebase**:
   ```bash
   git rebase origin/main
   ```

3. **If conflicts**:
   - Edit conflicting files
   - `git add [resolved files]`
   - `git rebase --continue`

4. **Force push** (only on feature branches):
   ```bash
   git push --force-with-lease
   ```

## Safety Rules

**NEVER:**
- Force push to `main` or `master`
- Commit directly to `main` without PR
- Use `--no-verify` to skip hooks
- Commit sensitive files (.env, credentials)

**ALWAYS:**
- Create feature branches
- Write meaningful commit messages
- Review diff before committing
- Run tests before pushing

## Workflow Examples

### Feature Development
```
1. git checkout -b feature/user-profile
2. [make changes]
3. git add src/profile.js
4. git commit -m "feat(profile): add user profile page"
5. [more changes]
6. git commit -m "feat(profile): add avatar upload"
7. git push -u origin HEAD
8. gh pr create
```

### Bug Fix
```
1. git checkout -b fix/login-error
2. [fix the bug]
3. git add src/auth.js tests/auth.test.js
4. git commit -m "fix(auth): handle expired session correctly

   The login was failing silently when the session
   token was expired. Now shows proper error message.

   Fixes #789"
5. git push -u origin HEAD
6. gh pr create
```

### Hotfix
```
1. git checkout -b hotfix/critical-security-fix
2. [fix the issue]
3. git commit -m "fix(security): patch XSS vulnerability"
4. git push -u origin HEAD
5. gh pr create --label "priority:critical"
```

## Output Format

```
=== GIT WORKFLOW ===

Action: [branch/commit/pr/merge]
Branch: feature/user-profile
Status: Clean working directory

Changes to commit:
- src/profile.js (modified)
- src/profile.css (new)
- tests/profile.test.js (new)

Suggested commit:
  feat(profile): add user profile page

Ready to [commit/push/create PR]?
```

## Sources

- [Claude Code Git Integration](https://claudecode.io/tutorials/git-integration)
- [Git Flow in Claude Code](https://medium.com/@dan.avila7/complete-guide-to-setting-up-git-flow-in-claude-code)
- [Git Worktrees with Claude](https://medium.com/@dtunai/mastering-git-worktrees-with-claude-code)
