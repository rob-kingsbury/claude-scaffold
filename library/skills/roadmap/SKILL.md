---
name: roadmap
description: Generate project roadmaps from GitHub issues and milestones. Visualize priorities, track progress, and plan releases.
---

# Roadmap Skill

Generate and maintain project roadmaps from GitHub issues, milestones, and labels.

## Invocation

```
/roadmap [action]
```

Actions:
- `/roadmap` - Generate roadmap from current issues
- `/roadmap milestones` - Show milestone progress
- `/roadmap next` - What's coming in next release
- `/roadmap update` - Refresh ROADMAP.md

Or naturally: "show the roadmap", "what's planned", "update roadmap"

## Output Format

### ROADMAP.md Template

```markdown
# Roadmap

Last updated: 2024-01-20

## Current Focus (v1.3)

**Target:** February 2024
**Progress:** 60% (6/10 issues closed)

### In Progress
- [ ] #45 - User profile page
- [ ] #47 - Email notifications

### Completed
- [x] #42 - Dashboard redesign
- [x] #43 - API rate limiting
- [x] #44 - Search functionality

## Up Next (v1.4)

**Target:** March 2024

- [ ] #50 - Team collaboration features
- [ ] #51 - Export to PDF
- [ ] #52 - Dark mode

## Future Considerations

- Mobile app (evaluating React Native vs Flutter)
- Integrations (Slack, Discord)
- Enterprise features (SSO, audit logs)

## Recently Completed (v1.2)

Released: January 2024

- [x] #30 - Authentication overhaul
- [x] #31 - Performance improvements
- [x] #32 - Bug fixes
```

## Instructions for Claude

### Generate Roadmap

#### Step 1: Gather GitHub Data

```bash
# Get open milestones
gh api repos/{owner}/{repo}/milestones --jq '.[] | {title, due_on, open_issues, closed_issues}'

# Get issues by milestone
gh issue list --milestone "v1.3" --state all --json number,title,state,labels

# Get issues by label (if no milestones)
gh issue list --label "priority:high" --state open --json number,title,labels
gh issue list --label "enhancement" --state open --json number,title,labels

# Get recently closed issues
gh issue list --state closed --limit 20 --json number,title,closedAt,milestone
```

#### Step 2: Categorize Issues

Group by:
1. **Milestone** (preferred) - v1.3, v1.4, etc.
2. **Labels** (fallback):
   - `priority:critical` → Current Focus
   - `priority:high` → Up Next
   - `priority:medium` → Future
   - `enhancement` vs `bug` for categorization

#### Step 3: Calculate Progress

For each milestone:
```
progress = closed_issues / (open_issues + closed_issues) * 100
```

#### Step 4: Generate Sections

**Current Focus:**
- Active milestone or high-priority issues
- Show progress percentage
- List in-progress and completed

**Up Next:**
- Next milestone or medium-priority issues
- Target date if available

**Future Considerations:**
- Low-priority or "someday" labeled issues
- Icebox items
- Ideas being evaluated

**Recently Completed:**
- Last closed milestone
- Last 10-20 closed issues if no milestones

### Update Existing Roadmap

```bash
# Check if ROADMAP.md exists
ls ROADMAP.md

# Read current content
cat ROADMAP.md
```

Preserve:
- Future Considerations (manual entries)
- Custom sections
- Commentary/notes

Update:
- Progress percentages
- Issue states (open/closed)
- New issues added to milestones

### Create from Scratch

If no milestones exist, suggest creating them:

```bash
# Create milestone
gh api repos/{owner}/{repo}/milestones -f title="v1.0" -f description="Initial release" -f due_on="2024-03-01T00:00:00Z"

# Assign issues to milestone
gh issue edit 42 --milestone "v1.0"
```

## Visualization Formats

### Text-Based Timeline

```
2024
├── Jan ────────────────────────────────────────
│   v1.2 [████████████████████] 100% - Released
│
├── Feb ────────────────────────────────────────
│   v1.3 [████████████--------]  60% - In Progress
│         ├── #45 User profiles
│         ├── #47 Email notifications
│         └── #48 Settings page
│
├── Mar ────────────────────────────────────────
│   v1.4 [--------------------]   0% - Planned
│         ├── #50 Team features
│         └── #51 PDF export
│
└── Q2+ ────────────────────────────────────────
    Future
          ├── Mobile app
          └── Integrations
```

### Kanban-Style

```
┌─────────────────┬─────────────────┬─────────────────┐
│    BACKLOG      │   IN PROGRESS   │      DONE       │
├─────────────────┼─────────────────┼─────────────────┤
│ #50 Team        │ #45 Profiles    │ #42 Dashboard   │
│ #51 PDF export  │ #47 Emails      │ #43 Rate limit  │
│ #52 Dark mode   │                 │ #44 Search      │
└─────────────────┴─────────────────┴─────────────────┘
```

### Priority Matrix

```
                    HIGH IMPACT
                        │
     ┌──────────────────┼──────────────────┐
     │                  │                  │
     │   DO FIRST       │   SCHEDULE       │
     │   #45 Profiles   │   #50 Teams      │
     │   #47 Emails     │   #51 PDF        │
LOW ─┼──────────────────┼──────────────────┼─ HIGH
EFFORT                  │                  │  EFFORT
     │   QUICK WINS     │   DELEGATE       │
     │   #52 Dark mode  │   #60 Mobile     │
     │   #53 Tooltips   │                  │
     │                  │                  │
     └──────────────────┼──────────────────┘
                        │
                    LOW IMPACT
```

## Label Conventions

Recommended labels for roadmap generation:

| Label | Purpose |
|-------|---------|
| `priority:critical` | Must be in current release |
| `priority:high` | Should be in current release |
| `priority:medium` | Next release |
| `priority:low` | Future/backlog |
| `type:feature` | New functionality |
| `type:enhancement` | Improvement to existing |
| `type:bug` | Bug fix |
| `type:tech-debt` | Refactoring/cleanup |
| `status:in-progress` | Currently being worked on |
| `status:blocked` | Waiting on something |

## Output Examples

### After Generation

```
=== ROADMAP GENERATED ===

Source: GitHub milestones + issues
Milestones: 3 (1 completed, 1 active, 1 planned)
Total issues: 45

Current: v1.3 (60% complete)
- 4 in progress
- 6 completed
- Target: Feb 15, 2024

File: ROADMAP.md created/updated

Preview:
# Roadmap
## Current Focus (v1.3)
...
```

### Milestone Progress

```
=== MILESTONE PROGRESS ===

v1.2 - Initial Release
[████████████████████] 100% (12/12)
Released: Jan 10, 2024

v1.3 - User Experience
[████████████--------]  60% (6/10)
Target: Feb 15, 2024
Remaining: 4 issues

v1.4 - Collaboration
[--------------------]   0% (0/8)
Target: Mar 30, 2024
```

### Next Release Preview

```
=== NEXT RELEASE: v1.3 ===

Target: February 15, 2024
Progress: 60% (6/10 issues)

Remaining Work:
- #45 User profile page [in-progress]
- #47 Email notifications [in-progress]
- #48 Settings page [open]
- #49 Onboarding flow [open]

Blockers:
- #47 blocked by email provider setup

At Risk:
- #49 not yet started, may slip to v1.4
```

## Integration

### With /changelog
After release, use `/changelog` to generate release notes from closed issues.

### With /github-actions
Set up automated roadmap updates on issue close:
```yaml
on:
  issues:
    types: [closed]
jobs:
  update-roadmap:
    # Trigger roadmap regeneration
```

### With /plan
Use roadmap context when planning new features to understand priorities.

## Best Practices

1. **Use milestones** - More reliable than labels for releases
2. **Set due dates** - Even rough estimates help planning
3. **Keep it updated** - Stale roadmaps lose trust
4. **Link to issues** - Make it navigable
5. **Include "why"** - Context helps stakeholders understand priorities
6. **Be honest** - Don't over-commit, show blockers

## Sources

- [GitHub Project Planning](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Product Roadmap Best Practices](https://www.productplan.com/learn/what-is-a-product-roadmap/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
