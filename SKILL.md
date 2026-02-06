---
name: scaffold
description: Project scaffolding system with adaptive AMA dialog. Creates new projects with battle-tested patterns from existing codebases.
---

# Project Scaffolding Skill

This skill creates new Claude Code projects with proven patterns extracted from production codebases.

## Invocation

```
/scaffold [path-to-idea.md]
```

Or in a new folder with an `idea.md` file:
```
scaffold this project
```

## What It Does

1. **Reads** your `idea.md` (simple project description)
2. **Runs adaptive AMA dialog** (ultrathink mode) to gather requirements
3. **Selects** appropriate stack and patterns from library
4. **Generates** complete project scaffold with:
   - `CLAUDE.md` (project governance)
   - `.claude/` folder (context, rules, skills, workflows)
   - Stack-specific starter files
   - GitHub repo (optional)

## AMA Dialog (Adaptive)

The dialog starts with core questions and goes deeper based on your answers:

**Core (always asked):**
- What problem does this solve?
- Who is the primary user?
- What's the MVP scope?
- What tech stack?

**Conditional depth:**
- Database? → Entity relationships, audit requirements
- Payments? → Stripe, pricing tiers, free tier
- Auth? → Method, roles, multi-tenant
- API? → REST/GraphQL, rate limiting, versioning

## Available Stacks

| Stack | Use Case | Based On |
|-------|----------|----------|
| `php-mysql` | Traditional web apps | AI-TA, Pebble |
| `laravel` | SaaS, client portals | Daybook |
| `react-supabase` | Modern SPAs | BandPilot |
| `node-cli` | CLI tools, automation | EVA-QA, MCP tools |
| `static-gsap` | Marketing sites | Stompers Redesign |

## Existing Project Handling

If `.claude/` already exists, the skill will ask:
- **Merge**: Add missing files, preserve existing
- **Replace**: Overwrite with fresh scaffold
- **Cancel**: Abort scaffolding

## Output

```
project-name/
├── CLAUDE.md                 # Project governance
├── HANDOFF.md                # Session continuity
├── .claude/
│   ├── context.md            # Project state (YAML + markdown)
│   ├── schema.md             # Database schema (if applicable)
│   ├── style-guide.json      # CSS/design tokens (if applicable)
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

## Saved Dialogs

AMA results are saved to `~/.claude/scaffold/dialogs/{project-name}.md` for future reference. This captures the "why" behind architectural decisions.

## Instructions for Claude

When this skill is invoked:

1. **Check for idea.md** in current directory or provided path
2. **Read idea.md** to understand the project concept
3. **Load AMA questions** from `ama/questions.yaml`
4. **Run adaptive dialog** using ultrathink mode:
   - Start with CORE questions
   - Branch into relevant categories based on answers
   - Summarize understanding and confirm before proceeding
5. **Save dialog** to `dialogs/{project-name}.md`
6. **Check for existing .claude/** folder:
   - If exists: Ask merge/replace/cancel
   - If not: Proceed with creation
7. **Select stack** from `library/stacks/` based on tech answers
8. **Generate scaffold**:
   - Copy stack template files
   - Copy relevant rules from `library/rules/`
   - Copy relevant skills from `library/skills/`
   - Generate `CLAUDE.md` with project-specific content
   - Generate `context.md` with YAML metadata from AMA
   - Generate `schema.md` if database project
9. **Offer GitHub repo creation** via `gh repo create`
10. **Output summary** with next steps

## Ultrathink Mode

During the AMA dialog, use adaptive thinking to:
- Analyze answers for implicit requirements
- Identify potential technical challenges
- Consider edge cases the user may not have mentioned
- Recommend patterns from similar projects in the library
- Flag scope creep or over-engineering risks
