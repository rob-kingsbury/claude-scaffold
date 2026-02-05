---
name: fix-issue
description: Load GitHub issue context and implement the fix or feature.
---

# Fix Issue Skill

Load a GitHub issue's full context and implement the solution.

## Invocation

```
/fix-issue [number]
```

Or naturally: "fix issue 123", "work on #45", "implement issue 78"

## What It Does

1. **Fetches issue details** from GitHub
2. **Analyzes requirements** from title, body, and comments
3. **Identifies affected files** based on issue description
4. **Proposes implementation approach**
5. **Implements the fix** with proper testing
6. **Prepares commit** that auto-closes the issue

## Instructions for Claude

When this skill is invoked:

### 1. Fetch Issue Details
```bash
gh issue view [number] --json title,body,labels,comments,assignees
```

### 2. Parse Requirements

Extract from the issue:
- **What**: The problem or feature
- **Why**: The motivation/impact
- **Acceptance criteria**: How to verify it's done
- **Labels**: bug, enhancement, priority, etc.

### 3. Analyze Codebase

Based on issue description, search for:
- Related files (Grep for keywords)
- Similar implementations (patterns to follow)
- Test files (to update)

### 4. Propose Approach

Output a brief plan:
```
=== ISSUE #[number]: [title] ===

Type: [bug/enhancement]
Priority: [from labels]

Understanding:
[1-2 sentence summary of the problem/feature]

Approach:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Files to modify:
- [file1] - [what change]
- [file2] - [what change]

Shall I proceed?
```

### 5. Implement

After user confirms:
- Make the changes
- Follow code architecture rules
- Add/update tests if applicable
- Run local tests

### 6. Prepare Commit

```bash
git add [specific files]
git commit -m "[type]: [description]

[detailed changes]

Fixes #[number]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 7. Output Summary

```
=== ISSUE #[number] FIXED ===

Changes:
- [file1:line] - [description]
- [file2:line] - [description]

Tests: [passed/added/updated]

Ready to push? (will close issue #[number])
```

## Commit Message Format

Based on issue type:

| Label | Prefix |
|-------|--------|
| bug | `fix:` |
| enhancement | `feat:` |
| documentation | `docs:` |
| refactor | `refactor:` |

Example:
```
fix: Prevent duplicate form submissions

- Add loading state to submit button
- Disable button while request in flight
- Show success/error toast on completion

Fixes #123
```

## Edge Cases

- **Issue has comments**: Read all comments for additional context
- **Issue is stale**: Ask user if requirements still accurate
- **Issue is vague**: Ask clarifying questions before implementing
- **Issue is too large**: Suggest breaking into smaller issues
