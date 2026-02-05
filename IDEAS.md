# Claude Scaffold - Ideas Backlog

Compiled from research agents + ecosystem knowledge. Prioritized by value/effort.

---

## Skills Ideas

### Currently Have (35 skills)
- [x] session-start, handoff, agents (Session Management)
- [x] plan, personas, frontend-design, interface-design, research (Planning & Design)
- [x] tdd, debug, fix-issue, testing, refactor (Development)
- [x] audit, code-review, simplify, performance, accessibility (Quality)
- [x] api-docs, db-migrate, changelog, adr, env (Documentation & Config)
- [x] git-workflow, pr-create, deploy, docker, ci-cd, github-actions (Git & Deploy)
- [x] roadmap (Project Management)
- [x] autopilot (Automation)
- [x] auth, deps, error-handling (Security & Reliability)
- [x] i18n (Internationalization)

### High Priority (Would use frequently)

| Skill | Description | Effort |
|-------|-------------|--------|
| ~~**changelog**~~ | ~~Auto-generate CHANGELOG.md from commits (conventional commits)~~ | DONE |
| ~~**adr**~~ | ~~Architecture Decision Records - document why decisions were made~~ | DONE |
| ~~**roadmap**~~ | ~~Project roadmap generation, milestone tracking, priority visualization~~ | DONE |
| ~~**deps**~~ | ~~Dependency audit, updates, security vulnerabilities (npm audit, etc.)~~ | DONE |
| ~~**env**~~ | ~~Environment setup - .env templates, validation, documentation~~ | DONE |
| **secrets** | Secret detection, rotation reminders, vault integration | Medium |
| **migrations** | Database migration generation and verification | Medium |
| **storybook** | Component documentation and visual testing setup | Medium |
| **seo** | SEO audit checklist, meta tags, structured data | Low |
| **analytics** | Event tracking setup (GA4, Mixpanel, Posthog patterns) | Low |
| ~~**error-handling**~~ | ~~Error boundary patterns, logging, monitoring setup~~ | DONE |
| ~~**github-actions**~~ | ~~CI/CD workflow templates (test, build, deploy, release)~~ | DONE |

### Medium Priority (Useful for some projects)

| Skill | Description | Effort |
|-------|-------------|--------|
| ~~**i18n**~~ | ~~Internationalization setup, translation workflow~~ | DONE |
| **email** | Email templates (transactional, marketing) | Low |
| **feature-flags** | Feature flag setup (LaunchDarkly, custom) | Medium |
| **caching** | Caching strategies, Redis patterns, CDN setup | Medium |
| **rate-limiting** | API rate limiting patterns | Low |
| **websockets** | Real-time communication setup | Medium |
| **queue** | Background job patterns (BullMQ, etc.) | Medium |
| **monorepo** | Turborepo/Nx setup and patterns | High |
| **graphql** | GraphQL schema design, resolvers | Medium |
| **openapi** | OpenAPI spec generation and validation | Medium |

### Niche/Experimental

| Skill | Description | Effort |
|-------|-------------|--------|
| **legal** | Privacy policy, ToS, cookie consent templates | Low |
| **onboarding** | User onboarding flow patterns | Medium |
| **payments** | Stripe/payment integration patterns | High |
| **auth** | Authentication patterns (JWT, OAuth, sessions) | High |
| **multi-tenant** | Multi-tenancy architecture patterns | High |
| **event-sourcing** | Event sourcing and CQRS patterns | High |
| **ai-integration** | LLM API integration patterns | Medium |
| **voice** | Voice UI patterns (Alexa, Google Assistant) | High |

---

## MCP Server Ideas

### High Value (Common use cases)

| Server | Purpose | Status |
|--------|---------|--------|
| **filesystem** | Local file operations | Have |
| **github** | GitHub API access | Have |
| **brave-search** | Web search | Have |
| **postgres** | PostgreSQL queries | Recommended |
| **mysql** | MySQL queries | Recommended |
| **sqlite** | SQLite for local DBs | Recommended |
| **redis** | Cache and queue operations | Recommended |
| **docker** | Container management | Recommended |

### Medium Value (Project-specific)

| Server | Purpose | Notes |
|--------|---------|-------|
| **supabase** | Supabase project management | |
| **vercel** | Vercel deployment | |
| **cloudflare** | Workers, KV, R2 | |
| **aws** | AWS services | |
| **stripe** | Payment operations | |
| **twilio** | SMS/communications | |
| **sendgrid** | Email sending | |
| **algolia** | Search | |

### Emerging/Experimental

| Server | Purpose | Notes |
|--------|---------|-------|
| **context7** | Enhanced context management | In global config |
| **puppeteer** | Browser automation | |
| **playwright** | E2E testing | |
| **linear** | Issue tracking | |
| **notion** | Documentation | |
| **slack** | Team notifications | |

---

## Hook Ideas

### Currently Have (11 hooks)
- [x] branch-protection.js (PreToolUse)
- [x] pii-blocker.js (PreToolUse) - Block PII (SSNs, credit cards, phones, emails)
- [x] secrets-blocker.js (PreToolUse) - Block secrets (API keys, passwords, tokens)
- [x] auto-format.sh (PostToolUse)
- [x] run-tests.sh (PostToolUse)
- [x] lint-check.js (PreToolUse)
- [x] commit-message-check.js (PreToolUse)
- [x] security-scan.js (PreToolUse)
- [x] file-size-check.js (PreToolUse)
- [x] agent-notify.js (PostToolUse)
- [x] type-check.js (PreToolUse) - TypeScript check before edits

### Ideas to Add

| Hook | Event | Purpose |
|------|-------|---------|
| ~~**type-check.js**~~ | ~~PreToolUse~~ | ~~Run TypeScript check before edits~~ DONE |
| **deps-check.js** | PostToolUse | Check for new dependency vulnerabilities |
| **build-verify.js** | PostToolUse | Verify build still works after changes |
| **coverage-check.js** | PostToolUse | Warn if test coverage drops |
| **changelog-reminder.js** | PreToolUse | Remind to update changelog on version bump |
| **migration-check.js** | PostToolUse | Verify migrations are reversible |
| **env-sync.js** | PostToolUse | Sync .env.example when .env changes |
| **docs-stale.js** | PostToolUse | Warn if docs haven't been updated with code |

---

## Stack Ideas

### Currently Have (8 stacks)
- [x] php-mysql, laravel
- [x] react-supabase, nextjs-prisma
- [x] node-cli
- [x] static-gsap, astro-content
- [x] python-fastapi

### Ideas to Add

| Stack | Use Case | Effort |
|-------|----------|--------|
| **vue-nuxt** | Vue.js full-stack | Medium |
| **svelte-kit** | Svelte full-stack | Medium |
| **remix** | React with nested routing | Medium |
| **electron** | Desktop apps | High |
| **tauri** | Rust-based desktop apps | High |
| **expo** | React Native mobile | High |
| **flutter** | Cross-platform mobile | High |
| **go-fiber** | Go web APIs | Medium |
| **rust-axum** | Rust web APIs | High |
| **deno-fresh** | Deno islands architecture | Medium |
| **bun-elysia** | Bun + Elysia framework | Low |
| **hono** | Edge-first framework | Low |

---

## Rule Ideas

### Currently Have (7 rules)
- [x] code-architecture.md
- [x] css-architecture.md
- [x] database-queries.md
- [x] development-workflow.md
- [x] security-checklist.md
- [x] thinking-mode.md
- [x] api-design.md

### Ideas to Add

| Rule | Purpose |
|------|---------|
| ~~**api-design.md**~~ | ~~RESTful conventions, error formats, versioning~~ DONE |
| **testing-strategy.md** | What to test, coverage targets, mocking |
| **error-handling.md** | Error types, logging levels, user messages |
| **performance-budget.md** | Bundle size, load time, Core Web Vitals |
| **accessibility-standards.md** | WCAG level, testing requirements |
| **git-conventions.md** | Branch names, commit format, PR templates |
| **documentation-standards.md** | What to document, format, maintenance |
| **dependency-policy.md** | When to add deps, version pinning, auditing |

---

## Research Insights

### MCP Tasks Protocol (Nov 2025)
- New async primitive in MCP spec
- "Call-now, fetch-later" pattern
- Built-in progress streaming and cancellation
- Foundation for proper background agent support
- Currently experimental but worth monitoring

### Prior Art Worth Studying
- **BullMQ** - Job queue patterns, retry logic, rate limiting
- **Temporal** - Durable execution, workflow orchestration
- **Celery** - Event monitoring, agent pattern
- **Cursor Background Agents** - UX patterns for IDE integration

### Patterns from awesome-claude-skills
- Most skills focus on specific frameworks (React, Vue, etc.)
- Few skills for cross-cutting concerns (security, testing)
- Gap: DevOps/infrastructure skills
- Gap: Project management integration skills

### Patterns from Research (Feb 2026)
- **obra/superpowers** - `/brainstorm` → `/write-plan` → `/execute-plan` workflow (20+ skills)
- **Severance** - Memory injection via UserPromptSubmit hook survives context compaction (~75% vs 30%)
- **TDD Guard** - Hook that blocks code modifications violating TDD principles
- **VoltAgent** - 202+ skills with cross-platform compatibility (Cursor, Copilot, Gemini)
- **levnikolaevich** - 37 skills with numbered phases for delivery workflow

---

## Effort vs Impact Grid

```
                        HIGH IMPACT
                            │
     ┌──────────────────────┼──────────────────────┐
     │                      │                      │
     │   DO FIRST           │   PLAN CAREFULLY     │
     │   (Quick Wins)       │   (Strategic)        │
     │                      │                      │
     │   • changelog        │   • auth             │
     │   • adr              │   • github-actions   │
     │   • env              │   • deps             │
     │   • roadmap          │   • error-handling   │
     │   • seo              │   • migrations       │
     │   • analytics        │   • storybook        │
     │   • type-check hook  │   • i18n             │
     │   • env-sync hook    │   • feature-flags    │
     │   • api-design rule  │   • caching          │
     │                      │                      │
LOW ─┼──────────────────────┼──────────────────────┼─ HIGH
EFFORT                      │                      │  EFFORT
     │                      │                      │
     │   FILL-INS           │   AVOID/DEFER        │
     │   (If time permits)  │   (Low ROI)          │
     │                      │                      │
     │   • email            │   • monorepo         │
     │   • rate-limiting    │   • payments         │
     │   • legal            │   • multi-tenant     │
     │   • bun-elysia stack │   • event-sourcing   │
     │   • hono stack       │   • voice            │
     │   • docs-stale hook  │   • mobile stacks    │
     │                      │   • desktop stacks   │
     │                      │   • graphql          │
     │                      │                      │
     └──────────────────────┼──────────────────────┘
                            │
                        LOW IMPACT
```

## Implementation Queue

### Now (Quick Wins)
- [x] ~~pii-blocker hook~~ DONE
- [x] ~~secrets-blocker hook~~ DONE
- [x] ~~changelog~~ DONE - Auto-generate from conventional commits
- [x] ~~adr~~ DONE - Architecture decision records
- [x] ~~env~~ DONE - Environment setup templates

### Next (High Value)
- [x] ~~roadmap~~ DONE - Project roadmap from GitHub issues
- [x] ~~github-actions~~ DONE - CI/CD workflow templates
- [x] ~~type-check hook~~ DONE - TypeScript check before edits
- [x] ~~api-design rule~~ DONE - RESTful conventions doc

### Later (More Effort)
- [x] ~~auth~~ DONE - Authentication patterns
- [x] ~~deps~~ DONE - Dependency audit skill
- [x] ~~error-handling~~ DONE - Error boundary patterns

---

## Future MCP Server Ideas

### mcp-research (Research persistence)

**Current:** `/research` skill uses parallel agents + JSON/markdown files for persistence.

**MCP server would add:**
- SQLite storage for better querying
- Cross-project knowledge sharing
- Full-text search across findings

**Worth building?** Probably not until the skill proves its value. JSON files work fine for now.
