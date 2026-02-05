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
├── CLAUDE.md                 # Project governance
├── HANDOFF.md                # Session continuity
├── .claude/
│   ├── context.md            # Project state (YAML + markdown)
│   ├── schema.md             # Database schema (if applicable)
│   ├── rules/
│   │   ├── code-architecture.md
│   │   ├── css-architecture.md
│   │   ├── database-queries.md
│   │   ├── development-workflow.md
│   │   └── security-checklist.md
│   ├── skills/
│   │   ├── session-start/
│   │   ├── handoff/
│   │   ├── audit/
│   │   └── [more skills...]
│   ├── hooks/                # Optional automation hooks
│   └── workflows.yaml
├── .gitignore
└── [stack-specific files]
```

## Skills Library

### Session Management
| Skill | Description |
|-------|-------------|
| **session-start** | Initialize work sessions, load context, check issues |
| **handoff** | End-of-session cleanup, commit, and context preservation |

### Development Workflow
| Skill | Description |
|-------|-------------|
| **tdd** | Test-Driven Development with Red-Green-Refactor cycle |
| **debug** | Systematic debugging: reproduce, isolate, identify, fix, verify |
| **fix-issue** | Load GitHub issue context and implement the solution |
| **plan** | Strategic planning and brainstorming before implementation |

### Code Quality
| Skill | Description |
|-------|-------------|
| **audit** | Security, quality, and accessibility audits |
| **code-review** | Comprehensive PR/code review checklist |
| **simplify** | Refactor for clarity without changing behavior |

### Git & Collaboration
| Skill | Description |
|-------|-------------|
| **git-workflow** | Branching strategy, conventional commits, PR flow |
| **pr-create** | Create well-structured pull requests |

### Design & UI
| Skill | Description |
|-------|-------------|
| **frontend-design** | Distinctive, production-grade UI avoiding generic AI aesthetics |
| **interface-design** | Systematic design tokens, consistency, and component patterns |

## Hooks Library

Hooks provide deterministic automation at specific points in Claude Code's lifecycle.

| Hook | Event | Purpose |
|------|-------|---------|
| **branch-protection.js** | PreToolUse | Block dangerous git operations on main |
| **auto-format.sh** | PostToolUse | Format code after edits |
| **run-tests.sh** | PostToolUse | Run related tests after changes |

See `library/hooks/README.md` for configuration details.

## Rules Library

| Rule | Purpose |
|------|---------|
| **code-architecture.md** | PHP/JS/TS coding standards, patterns |
| **css-architecture.md** | Mobile-first CSS, variables, BEM |
| **database-queries.md** | Query safety, schema management |
| **development-workflow.md** | Session management, commits, issues |
| **security-checklist.md** | OWASP-aligned security checks |

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **handoff** | "handoff", "end session" | Clean session end |
| **status** | "status" | Project overview |
| **audit** | "audit" | Run codebase audits |
| **sync** | "sync docs" | Keep documentation current |

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
# Clone to your projects directory
git clone https://github.com/rob-kingsbury/claude-scaffold.git ~/projects/claude-scaffold

# Create junction/symlink to ~/.claude/scaffold
# Windows (run as admin or use junction):
mklink /J "%USERPROFILE%\.claude\scaffold" "C:\path\to\claude-scaffold"

# macOS/Linux:
ln -s ~/projects/claude-scaffold ~/.claude/scaffold
```

### Per-Project

Copy specific items from `library/` into your project's `.claude/` folder.

## Existing Project Handling

If `.claude/` already exists when scaffolding, you'll be asked:

- **Merge** - Add missing files, preserve existing
- **Replace** - Overwrite with fresh scaffold
- **Cancel** - Abort scaffolding

## Resources & Inspiration

This scaffold system was informed by:

- [Anthropic Official Skills](https://github.com/anthropics/skills)
- [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [Claude Code Showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [Interface Design Plugin](https://github.com/Dammyjay93/interface-design)
- [Superpowers Skills](https://github.com/obra/superpowers)
- [Trail of Bits Security Skills](https://github.com/trailofbits)

## Contributing

PRs welcome for:
- New stack templates
- Additional skills
- Improved rules/patterns
- Hook examples

## License

MIT
