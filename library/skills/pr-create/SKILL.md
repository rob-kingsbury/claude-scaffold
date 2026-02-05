---
name: pr-create
description: Create well-structured pull requests with proper descriptions, test plans, and context. Use when ready to merge feature branches.
---

# PR Create Skill

Create professional pull requests with comprehensive descriptions.

## Invocation

```
/pr-create
```

Or naturally: "create a PR", "open pull request", "submit for review"

## PR Structure

### Title Format
```
type(scope): brief description

Examples:
feat(auth): add password reset functionality
fix(api): handle null response from payment service
docs(readme): update installation instructions
```

### Body Template

```markdown
## Summary
[1-3 bullet points describing what this PR does]

## Motivation
[Why is this change needed? Link to issue if applicable]

## Changes
[Detailed list of changes made]

## Test Plan
[How to verify this works]

## Screenshots
[If UI changes, before/after screenshots]

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console.log or debug code
```

## Instructions for Claude

### Step 1: Analyze Changes

```bash
# Get current branch
git branch --show-current

# Compare with main
git log origin/main..HEAD --oneline
git diff origin/main --stat
git diff origin/main
```

### Step 2: Identify PR Type

Based on changes:
- `feat` - New functionality
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code restructure
- `test` - Test additions
- `chore` - Maintenance

### Step 3: Draft Title

```
[type](scope): [what changed]

Rules:
- Lowercase
- No period at end
- Under 72 characters
- Imperative mood ("add" not "added")
```

### Step 4: Write Summary

Analyze all commits and summarize:
- What the PR accomplishes
- Key changes (3-5 bullets max)
- Any breaking changes

### Step 5: Document Test Plan

```markdown
## Test Plan

### Automated Tests
- [ ] Unit tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)

### Manual Testing
1. [Step to reproduce scenario]
2. [Expected result]
3. [Verify behavior]

### Edge Cases Tested
- [ ] [Edge case 1]
- [ ] [Edge case 2]
```

### Step 6: Create PR

```bash
# Ensure branch is pushed
git push -u origin HEAD

# Create PR
gh pr create --title "type(scope): description" --body "$(cat <<'EOF'
## Summary
- [Change 1]
- [Change 2]

## Motivation
[Why this change]

Fixes #[issue number]

## Changes
- [Detailed change 1]
- [Detailed change 2]

## Test Plan
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] [Specific test scenario]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No debug code remaining
- [ ] Follows code style guidelines
EOF
)"
```

### Step 7: Add Labels and Reviewers

```bash
# Add labels
gh pr edit --add-label "enhancement"

# Request review (if known)
gh pr edit --add-reviewer username
```

## PR Size Guidelines

| Size | Files | Lines | Review Time |
|------|-------|-------|-------------|
| XS | 1-2 | <50 | Quick |
| S | 3-5 | 50-200 | 15 min |
| M | 6-10 | 200-500 | 30 min |
| L | 11-20 | 500-1000 | 1 hour |
| XL | 20+ | 1000+ | Split it! |

**Best Practice:** Keep PRs small and focused. Large PRs should be split.

## Handling Different Scenarios

### Feature PR
```markdown
## Summary
Add user profile page with avatar upload

## Motivation
Users need to customize their profiles. Implements requirements from #123.

## Changes
- Add ProfilePage component
- Implement avatar upload to S3
- Add profile update API endpoint
- Update user schema with avatar_url

## Test Plan
1. Navigate to /profile
2. Upload an image
3. Verify image appears
4. Refresh page and confirm persistence
```

### Bug Fix PR
```markdown
## Summary
Fix crash when user has no email address

## Motivation
Users without email (OAuth-only) were causing app crashes.

## Root Cause
The email validation was running before checking if email exists.

## Changes
- Add null check before email validation
- Add test for users without email

## Test Plan
1. Create OAuth user without email
2. Verify no crash on login
3. Verify email-dependent features gracefully degrade
```

### Refactor PR
```markdown
## Summary
Extract authentication logic into AuthService

## Motivation
Auth logic was scattered across multiple controllers, making it hard to maintain.

## Changes
- Create AuthService class
- Move login/logout/register logic to service
- Update controllers to use service
- Add unit tests for AuthService

## Test Plan
- All existing auth tests pass
- New unit tests cover AuthService methods
- Manual login/logout/register still works

## Notes
No behavior changes. This is purely a structural refactor.
```

## Output Format

```markdown
=== PR READY ===

Branch: feature/user-profile
Base: main
Commits: 5

Title: feat(profile): add user profile page

Files changed: 8
Lines: +245, -12

PR URL: https://github.com/org/repo/pull/123

Next steps:
1. Review the PR description
2. Request reviewers
3. Address any CI failures
```

## Integration

### With /code-review
After creating PR, use `/code-review [PR#]` to self-review before requesting others.

### With /tdd
Ensure all features were developed test-first before creating PR.

### With /git-workflow
PR creation is the final step in the git workflow.

## Sources

- [How to Write Good PR Descriptions](https://github.blog/2015-01-21-how-to-write-the-perfect-pull-request/)
- [Conventional Commits](https://www.conventionalcommits.org/)
