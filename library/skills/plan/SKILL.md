---
name: plan
description: Strategic planning and brainstorming for features, architecture, and project direction. Use before implementing complex features.
---

# Plan Skill

Strategic planning and brainstorming before implementation.

## Invocation

```
/plan [feature/problem description]
```

Or naturally: "let's plan this", "brainstorm solutions", "think through this"

## When to Use

- Before implementing a complex feature
- When facing multiple solution paths
- Before making architectural decisions
- When requirements are unclear
- Before major refactors

## The Planning Process

### 1. UNDERSTAND
Clarify the problem before solving it.

### 2. EXPLORE
Generate multiple options without judgment.

### 3. EVALUATE
Compare options against criteria.

### 4. DECIDE
Choose and document the path forward.

### 5. PLAN
Break into actionable steps.

## Instructions for Claude

### Step 1: Understand the Problem

Ask clarifying questions:
```
Before I plan, I need to understand:

1. What is the core problem we're solving?
2. Who is affected by this?
3. What does success look like?
4. What constraints exist? (time, tech, resources)
5. What have you already tried or considered?
```

Summarize understanding:
```
## Problem Statement

[One sentence describing the core problem]

## Context
- Users affected: [who]
- Current state: [what exists now]
- Desired state: [what we want]

## Constraints
- [constraint 1]
- [constraint 2]
```

### Step 2: Explore Options

Generate 3-5 distinct approaches:

```
## Options

### Option A: [Name]
**Approach:** [Brief description]
**Pros:**
- [Pro 1]
- [Pro 2]
**Cons:**
- [Con 1]
- [Con 2]
**Effort:** [Low/Medium/High]
**Risk:** [Low/Medium/High]

### Option B: [Name]
...

### Option C: [Name]
...
```

**Rules for exploration:**
- Include at least one "safe" option
- Include at least one "ambitious" option
- Don't dismiss ideas too quickly
- Consider combinations

### Step 3: Evaluate Options

Create comparison matrix:

```
## Evaluation

| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Complexity | Low | Medium | High |
| Time to implement | 2 days | 1 week | 2 weeks |
| Maintainability | Good | Good | Complex |
| Scalability | Limited | Good | Excellent |
| Risk | Low | Medium | High |
| User impact | Medium | High | High |
```

### Step 4: Recommend and Decide

```
## Recommendation

**Recommended: Option B**

**Rationale:**
[2-3 sentences explaining why this option best balances the constraints and goals]

**Trade-offs accepted:**
- [Trade-off 1]
- [Trade-off 2]

**Risks to monitor:**
- [Risk 1]
- [Risk 2]
```

### Step 5: Create Action Plan

```
## Implementation Plan

### Phase 1: [Name] (Est: X days)
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Phase 2: [Name] (Est: X days)
- [ ] Task 4
- [ ] Task 5

### Phase 3: [Name] (Est: X days)
- [ ] Task 6
- [ ] Task 7

## Dependencies
- [Dependency 1]
- [Dependency 2]

## Milestones
1. [Milestone 1] - [Date/Condition]
2. [Milestone 2] - [Date/Condition]

## Success Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
```

## Output Format

```markdown
# Plan: [Feature/Problem Name]

## Problem Statement
[One sentence]

## Context
[Background and constraints]

## Options Considered
1. **[Option A]**: [Brief] — Pros: X, Cons: Y
2. **[Option B]**: [Brief] — Pros: X, Cons: Y
3. **[Option C]**: [Brief] — Pros: X, Cons: Y

## Decision
**Selected: [Option]**
Rationale: [Why]

## Implementation Plan

### Phase 1: [Name]
- [ ] Task 1
- [ ] Task 2

### Phase 2: [Name]
- [ ] Task 3
- [ ] Task 4

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| [Risk 1] | [How to handle] |

## Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

## Integration with Other Skills

### Before /tdd
Use /plan to design the feature, then /tdd to implement.

### Before /fix-issue
For complex issues, /plan the solution before implementing.

### With TodoWrite
Convert plan phases/tasks into tracked todos.

## Save Plans

Save important plans to `.claude/plans/[feature-name].md` for future reference.

```bash
# Example
.claude/plans/
├── user-authentication.md
├── payment-integration.md
└── api-v2-migration.md
```

## Sources

- [Superpowers Skills](https://github.com/obra/superpowers)
- [Engineering Planning](https://www.joelonsoftware.com/2007/10/26/evidence-based-scheduling/)
