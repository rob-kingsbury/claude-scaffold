---
name: changelog
description: Generate CHANGELOG.md from conventional commits. Groups changes by version, categorizes by type, and supports multiple formats.
---

# Changelog Skill

Auto-generate a structured CHANGELOG.md from conventional commit history.

## Invocation

```
/changelog [version]
```

Examples:
- `/changelog` - Generate full changelog
- `/changelog 1.2.0` - Generate entry for specific version
- `/changelog unreleased` - Show unreleased changes since last tag

Or naturally: "generate changelog", "update changelog", "what changed since last release"

## Output Format

Follows [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- feat(auth): add password reset functionality (#123)

### Fixed
- fix(api): handle null response from payment service (#456)

## [1.2.0] - 2024-01-15

### Added
- feat(profile): add user avatar upload
- feat(dashboard): add analytics widget

### Changed
- refactor(auth): extract auth logic to service

### Fixed
- fix(login): handle expired session correctly (#789)

### Security
- fix(xss): sanitize user input in comments
```

## Category Mapping

| Commit Type | Changelog Section |
|-------------|-------------------|
| `feat` | Added |
| `fix` | Fixed |
| `docs` | Documentation |
| `style` | Styling |
| `refactor` | Changed |
| `perf` | Performance |
| `test` | Testing |
| `build` | Build |
| `ci` | CI/CD |
| `chore` | Maintenance |
| `revert` | Reverted |
| `security` or security-related fix | Security |

## Instructions for Claude

### Step 1: Gather Git Information

```bash
# Get all tags (versions)
git tag --sort=-v:refname

# Get latest tag
git describe --tags --abbrev=0 2>/dev/null || echo "no tags"

# Get commit range for unreleased
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -n "$LATEST_TAG" ]; then
  git log ${LATEST_TAG}..HEAD --oneline
else
  git log --oneline
fi

# Get full log with conventional commit parsing
git log --pretty=format:"%h|%s|%an|%ad" --date=short
```

### Step 2: Parse Commits

For each commit, extract:
1. **Hash** - Short commit hash
2. **Type** - feat, fix, docs, etc.
3. **Scope** - Optional (auth), (api), etc.
4. **Subject** - The description
5. **Issue** - Linked issue number if present (#123)
6. **Breaking** - Check for BREAKING CHANGE or !

Parsing pattern:
```
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?(!)?: (.+)$
```

### Step 3: Group by Version

1. Find all version tags
2. Get commits between tags
3. Group "Unreleased" for commits after latest tag

```bash
# Commits between two tags
git log v1.1.0..v1.2.0 --oneline

# Commits since tag (unreleased)
git log v1.2.0..HEAD --oneline

# Tag date
git log -1 --format=%ad --date=short v1.2.0
```

### Step 4: Categorize by Type

Group commits into sections:
- **Added** - New features (feat)
- **Changed** - Changes to existing functionality (refactor, style)
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes (fix)
- **Security** - Security patches
- **Performance** - Performance improvements (perf)
- **Documentation** - Docs only (docs)

### Step 5: Format Entry

For each commit:
```markdown
- {type}({scope}): {subject} (#{issue})
```

If no scope:
```markdown
- {type}: {subject}
```

### Step 6: Generate or Update CHANGELOG.md

If CHANGELOG.md exists:
1. Read existing content
2. Insert new section after header
3. Preserve existing entries

If creating new:
```markdown
# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

{generated sections}

[Unreleased]: https://github.com/{owner}/{repo}/compare/{latest-tag}...HEAD
```

## Handling Special Cases

### Breaking Changes

Look for:
- `!` after type/scope: `feat(api)!: remove deprecated endpoint`
- `BREAKING CHANGE:` in commit body

Format as:
```markdown
### BREAKING CHANGES
- **api**: remove deprecated endpoint - migration guide at docs/migration.md
```

### Linked Issues

Extract from:
- Subject: `fix: handle error (#123)`
- Footer: `Fixes #123`, `Closes #456`

Format with link:
```markdown
- fix: handle error ([#123](https://github.com/owner/repo/issues/123))
```

### Scoped Changes

Group by scope when useful:
```markdown
### Fixed
- **api**: handle null response (#456)
- **api**: validate request body (#457)
- **auth**: fix token refresh (#458)
```

### Non-Conventional Commits

Skip or group under "Other":
```markdown
### Other
- Update dependencies
- Merge pull request #100
```

## Full Workflow

```bash
# 1. Check for existing changelog
ls CHANGELOG.md

# 2. Get version info
git describe --tags --abbrev=0
git tag --sort=-v:refname | head -5

# 3. Get commits
git log --pretty=format:"%h|%s" $(git describe --tags --abbrev=0 2>/dev/null)..HEAD

# 4. Generate changelog content
# [Claude analyzes and formats]

# 5. Write/update CHANGELOG.md
# Use Write tool

# 6. Verify
cat CHANGELOG.md | head -50
```

## Output Examples

### For a New Release

```markdown
=== CHANGELOG GENERATED ===

Version: 1.3.0
Date: 2024-01-20
Commits: 15

Sections:
- Added: 5 entries
- Fixed: 7 entries
- Changed: 2 entries
- Security: 1 entry

Breaking Changes: 0

File: CHANGELOG.md updated
Lines added: 35

Preview:
## [1.3.0] - 2024-01-20

### Added
- feat(dashboard): add real-time notifications
- feat(api): add batch processing endpoint
...
```

### For Unreleased Changes

```markdown
=== UNRELEASED CHANGES ===

Since: v1.2.0 (2024-01-15)
Commits: 8

### Added
- feat(search): add fuzzy matching
- feat(export): support CSV format

### Fixed
- fix(pagination): correct offset calculation
- fix(cache): handle expiry correctly

Ready to release? Run: git tag -a v1.3.0 -m "Release 1.3.0"
```

## Integration

### With /git-workflow
Use changelog to document changes before release tags.

### With /pr-create
Reference changelog updates in PR description.

### Automation Hook (Optional)

Add to `.claude/settings.json` to auto-generate on release:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": { "command": "git tag" },
      "command": "echo 'Consider running /changelog to update CHANGELOG.md'"
    }]
  }
}
```

## Sources

- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
