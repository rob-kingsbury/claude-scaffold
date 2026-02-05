---
name: adr
description: Create and manage Architecture Decision Records (ADRs). Document significant technical decisions with context, options, and rationale.
---

# ADR Skill

Create and manage Architecture Decision Records to document significant technical decisions.

## Invocation

```
/adr [action] [title]
```

Actions:
- `/adr new [title]` - Create new ADR
- `/adr list` - List all ADRs
- `/adr status [number]` - Check/update ADR status
- `/adr supersede [old] [new]` - Mark ADR as superseded

Or naturally: "document this decision", "create an ADR for", "why did we choose"

## What is an ADR?

An Architecture Decision Record captures:
- **Context** - Why we faced this decision
- **Decision** - What we chose
- **Consequences** - What happens because of this choice

ADRs create a decision log that helps future developers understand "why" not just "what."

## ADR Template

```markdown
# ADR-{number}: {Title}

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
**Date:** YYYY-MM-DD
**Deciders:** [who was involved]

## Context

[Describe the situation and forces at play. What problem are we solving?
What constraints do we have? Why is a decision needed now?]

## Decision

[State the decision clearly. Use active voice: "We will use X for Y."]

## Options Considered

### Option 1: {Name}
- **Pros:** [benefits]
- **Cons:** [drawbacks]

### Option 2: {Name}
- **Pros:** [benefits]
- **Cons:** [drawbacks]

### Option 3: {Name}
- **Pros:** [benefits]
- **Cons:** [drawbacks]

## Consequences

### Positive
- [Good outcomes]

### Negative
- [Trade-offs accepted]

### Neutral
- [Side effects, neither good nor bad]

## References

- [Links to relevant docs, issues, discussions]
```

## File Structure

```
docs/
└── adr/
    ├── README.md           # ADR index and guidelines
    ├── adr-0001-record-architecture-decisions.md
    ├── adr-0002-use-postgresql-for-database.md
    ├── adr-0003-adopt-typescript.md
    └── template.md         # ADR template
```

## Instructions for Claude

### Creating a New ADR

#### Step 1: Determine Next Number

```bash
# Find existing ADRs
ls docs/adr/adr-*.md 2>/dev/null | sort -V | tail -1

# Extract number
# If adr-0005.md exists, next is 0006
```

#### Step 2: Create ADR File

Use the template, filling in:
1. **Number** - Zero-padded (0001, 0002)
2. **Title** - Short, descriptive, kebab-case filename
3. **Date** - Today's date
4. **Status** - Start as "Proposed" or "Accepted"

```bash
# Create docs/adr if needed
mkdir -p docs/adr
```

#### Step 3: Write Content

Gather information through questions:
1. What decision needs to be made?
2. What options were considered?
3. What constraints exist (time, budget, skills, existing systems)?
4. Who was involved in the decision?
5. What are the consequences?

#### Step 4: Update Index

If `docs/adr/README.md` exists, add entry:

```markdown
| [ADR-0006](adr-0006-use-redis-for-caching.md) | Use Redis for Caching | Accepted | 2024-01-20 |
```

### Listing ADRs

```bash
# List all ADRs with status
for f in docs/adr/adr-*.md; do
  if [ -f "$f" ]; then
    STATUS=$(grep -m1 "^\*\*Status:\*\*" "$f" | sed 's/.*: //')
    TITLE=$(head -1 "$f" | sed 's/# ADR-[0-9]*: //')
    echo "$(basename $f .md) | $TITLE | $STATUS"
  fi
done
```

### Updating Status

Valid transitions:
- Proposed → Accepted
- Proposed → Rejected
- Accepted → Deprecated
- Accepted → Superseded by ADR-XXX

Update the Status line in the ADR file.

### Superseding an ADR

When a new decision replaces an old one:

1. Create new ADR explaining the change
2. Update old ADR:
   - Status: `Superseded by [ADR-XXXX](adr-xxxx-new-decision.md)`
3. Reference old ADR in new:
   - Add: `Supersedes [ADR-YYYY](adr-yyyy-old-decision.md)`

## Example ADRs

### Technology Choice

```markdown
# ADR-0002: Use PostgreSQL for Database

**Status:** Accepted
**Date:** 2024-01-10
**Deciders:** Tech Lead, Backend Team

## Context

We need a database for our new application. We expect:
- Complex relational data
- ACID compliance requirements
- Full-text search needs
- Moderate scale (millions of records)

## Decision

We will use PostgreSQL as our primary database.

## Options Considered

### Option 1: PostgreSQL
- **Pros:** ACID compliant, excellent JSON support, full-text search, mature ecosystem
- **Cons:** Requires more setup than SQLite, horizontal scaling requires extensions

### Option 2: MySQL
- **Pros:** Widely used, good performance, easy replication
- **Cons:** Weaker JSON support, licensing concerns (Oracle)

### Option 3: MongoDB
- **Pros:** Flexible schema, horizontal scaling, JSON-native
- **Cons:** Eventual consistency, complex transactions, different mental model

## Consequences

### Positive
- Strong data integrity guarantees
- Native JSON support for flexible fields
- Full-text search without separate service

### Negative
- Team needs PostgreSQL-specific training
- Vertical scaling limits may require sharding later

## References
- [PostgreSQL vs MySQL Comparison](https://example.com/pg-vs-mysql)
- Tech team discussion: #123
```

### Architecture Pattern

```markdown
# ADR-0005: Adopt Event Sourcing for Order Processing

**Status:** Accepted
**Date:** 2024-01-18
**Deciders:** Architecture Team

## Context

Our order processing system needs:
- Complete audit trail of all changes
- Ability to replay events for debugging
- Support for complex workflows with multiple states

Current CRUD approach loses history and makes debugging difficult.

## Decision

We will implement event sourcing for the Order domain only,
not the entire application.

## Options Considered

### Option 1: Full Event Sourcing
- **Pros:** Complete history everywhere
- **Cons:** Massive complexity increase, team unfamiliar

### Option 2: Event Sourcing for Orders Only
- **Pros:** Targeted benefits, manageable scope, learning opportunity
- **Cons:** Two patterns to maintain, integration complexity

### Option 3: Audit Log Tables
- **Pros:** Simple, familiar pattern
- **Cons:** Doesn't capture intent, can't replay

## Consequences

### Positive
- Orders have complete, auditable history
- Can replay order lifecycle for debugging
- Foundation for future event-driven features

### Negative
- Team needs training on event sourcing
- Order queries require projections
- Two persistence patterns in codebase
```

## ADR Index Template (README.md)

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for this project.

## What is an ADR?

An ADR captures a significant architectural decision along with its context and consequences.

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](adr-0001-record-architecture-decisions.md) | Record Architecture Decisions | Accepted | 2024-01-01 |
| [ADR-0002](adr-0002-use-postgresql-for-database.md) | Use PostgreSQL for Database | Accepted | 2024-01-10 |
| [ADR-0003](adr-0003-adopt-typescript.md) | Adopt TypeScript | Accepted | 2024-01-12 |

## Creating a New ADR

1. Copy `template.md`
2. Name it `adr-NNNN-short-title.md`
3. Fill in the sections
4. Add to index above
5. Submit PR for review

## Status Definitions

- **Proposed** - Under discussion
- **Accepted** - Approved and in effect
- **Deprecated** - No longer recommended but not replaced
- **Superseded** - Replaced by another ADR
- **Rejected** - Considered but not accepted
```

## Output Format

### After Creating ADR

```
=== ADR CREATED ===

File: docs/adr/adr-0006-use-redis-for-caching.md
Title: Use Redis for Caching
Status: Proposed

Sections completed:
- [x] Context
- [x] Decision
- [x] Options (3)
- [x] Consequences

Index updated: docs/adr/README.md

Next steps:
1. Review with team
2. Update status to Accepted when approved
```

### ADR List

```
=== ADR INDEX ===

Total: 5 ADRs

| # | Title | Status |
|---|-------|--------|
| 0001 | Record Architecture Decisions | Accepted |
| 0002 | Use PostgreSQL for Database | Accepted |
| 0003 | Adopt TypeScript | Accepted |
| 0004 | API Versioning Strategy | Accepted |
| 0005 | Event Sourcing for Orders | Proposed |

Statuses: 4 Accepted, 1 Proposed
```

## When to Write an ADR

Write an ADR when:
- Choosing between technologies (database, framework, library)
- Defining architecture patterns (microservices, monolith, event-driven)
- Making security decisions (auth strategy, encryption)
- Setting coding standards (style guide, testing strategy)
- Changing existing architecture

Don't write an ADR for:
- Minor implementation details
- Decisions easily reversed
- Standard practices everyone agrees on

## Sources

- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [When to Write ADRs](https://engineering.atspotify.com/2020/04/14/when-should-i-write-an-architecture-decision-record/)
