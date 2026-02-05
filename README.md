# Claude Scaffold

Project scaffolding system for Claude Code with battle-tested patterns extracted from production codebases.

## What This Does

1. **Reads your idea** from a simple markdown file
2. **Runs adaptive AMA dialog** to gather requirements (ultrathink mode)
3. **Generates complete project scaffold** with proven patterns:
   - `CLAUDE.md` (project governance)
   - `.claude/` folder (context, rules, skills, workflows)
   - Stack-specific starter files
   - GitHub repo (optional)

## Quick Start

### Option 1: Via Skill (Recommended)

```bash
# In a new project folder with idea.md
/scaffold
```

### Option 2: Manual Setup

1. Create a folder for your new project
2. Add an `idea.md` file describing what you want to build
3. Tell Claude: "scaffold this project"

## Available Stacks

| Stack | Use Case | Based On |
|-------|----------|----------|
| `php-mysql` | Traditional web apps | AI-TA, Pebble |
| `laravel` | SaaS, client portals | Daybook |
| `react-supabase` | Modern SPAs | BandPilot |
| `node-cli` | CLI tools, automation | EVA-QA |
| `static-gsap` | Marketing sites | Stompers Redesign |

## What Gets Created

```
your-project/
├── CLAUDE.md                 # Project governance & communication style
├── HANDOFF.md                # Session continuity
├── .claude/
│   ├── context.md            # Project state (YAML + markdown)
│   ├── schema.md             # Database schema (if applicable)
│   ├── rules/
│   │   ├── code-architecture.md
│   │   ├── css-architecture.md
│   │   ├── database-queries.md
│   │   └── development-workflow.md
│   ├── skills/
│   │   ├── session-start/
│   │   ├── handoff/
│   │   └── audit/
│   └── workflows.yaml
├── .gitignore
└── [stack-specific files]
```

## The AMA Dialog

The scaffold skill asks questions adaptively:

**Always asked:**
- What problem does this solve?
- Who is the primary user?
- What's the MVP scope?
- What tech stack?

**Conditional (based on answers):**
- Database entities and relationships
- Auth method and roles
- Payment model and tiers
- API style and consumers
- Deployment target
- Security requirements

Results are saved to `~/.claude/scaffold/dialogs/{project}.md` for future reference.

## Installation

### Global (Recommended)

```bash
# Clone to htdocs (version controlled)
git clone https://github.com/rob-kingsbury/claude-scaffold.git ~/projects/claude-scaffold

# Symlink to ~/.claude (global access)
# Windows:
mklink /D "%USERPROFILE%\.claude\scaffold" "C:\path\to\claude-scaffold"

# macOS/Linux:
ln -s ~/projects/claude-scaffold ~/.claude/scaffold
```

### Per-Project

Copy the `library/` contents into your project's `.claude/` folder.

## Included Patterns

### Rules Library

- **code-architecture.md** - PHP/JS/TS coding standards
- **css-architecture.md** - Mobile-first CSS with variables
- **database-queries.md** - Query safety and schema management
- **development-workflow.md** - Session management, commits, issues
- **security-checklist.md** - OWASP-aligned security checks

### Skills Library

- **session-start** - Initialize work sessions properly
- **handoff** - Clean session handoff with context preservation
- **audit** - Security, quality, and accessibility audits
- **simplify** - Refactor for clarity without changing behavior
- **fix-issue** - Load GitHub issue and implement fix

### Workflows

- **handoff.yaml** - End-of-session automation
- **status.yaml** - Project status overview
- **audit.yaml** - Codebase audit triggers
- **sync.yaml** - Documentation sync

## Existing Project Handling

If `.claude/` already exists when scaffolding, you'll be asked:

- **Merge** - Add missing files, preserve existing
- **Replace** - Overwrite with fresh scaffold
- **Cancel** - Abort scaffolding

## Contributing

This is a personal scaffolding system but PRs are welcome for:
- New stack templates
- Improved rules/patterns
- Bug fixes in skills

## License

MIT
