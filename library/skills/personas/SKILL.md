---
name: personas
description: Create realistic UX personas for testing, user stories, and product development. Generates consistent, reusable personas with goals, frustrations, and behaviors.
---

# Personas Skill

Create and manage UX personas for testing, user stories, and product decisions.

## Invocation

```
/personas [create|list|use] [persona-name]
```

Or naturally: "create a persona", "who are our users", "test as a frustrated admin"

## Commands

| Command | Description |
|---------|-------------|
| `/personas create` | Create new persona with guided questions |
| `/personas create <type>` | Create persona from archetype |
| `/personas list` | Show all project personas |
| `/personas use <name>` | Test/review from persona's perspective |

## Persona Archetypes

Quick-start templates for common user types:

| Archetype | Description | Typical Goals |
|-----------|-------------|---------------|
| **power-user** | Expert who uses advanced features daily | Efficiency, shortcuts, customization |
| **casual-user** | Occasional user, wants simplicity | Get task done quickly, no learning curve |
| **admin** | Manages users, settings, permissions | Control, oversight, bulk operations |
| **newbie** | First-time user, needs guidance | Understand basics, not feel lost |
| **skeptic** | Resistant to change, needs convincing | Proof it works, minimal disruption |
| **mobile-first** | Primarily uses phone/tablet | Touch-friendly, works offline |
| **accessibility** | Uses assistive technology | Screen reader support, keyboard nav |
| **busy-exec** | Limited time, needs quick insights | Dashboards, summaries, delegation |

## Persona Template

```markdown
# Persona: [Name]

## Demographics
- **Age:** [range]
- **Role:** [job title/relationship to product]
- **Tech Comfort:** [1-5 scale]
- **Usage Frequency:** [daily/weekly/monthly/rarely]

## Context
- **Environment:** [Where they use the product]
- **Devices:** [Desktop/mobile/tablet preferences]
- **Time Available:** [How much time they typically have]

## Goals
1. [Primary goal]
2. [Secondary goal]
3. [Tertiary goal]

## Frustrations
1. [Pain point 1]
2. [Pain point 2]
3. [Pain point 3]

## Behaviors
- [How they typically approach tasks]
- [What they do when stuck]
- [How they learn new features]

## Quotes
> "[Something they might say that captures their mindset]"

## Scenario
[Brief story of them using the product]
```

## Instructions for Claude

### create Command

**Without archetype - ask questions:**

```
To create a useful persona, I need to understand:

1. What role does this user have? (job, relationship to product)
2. What's their primary goal when using this?
3. What frustrates them most about similar tools?
4. How tech-savvy are they? (1-5)
5. How often would they use this? (daily/weekly/monthly)
6. Any constraints? (time, device, accessibility needs)
```

**With archetype - generate immediately:**

```
/personas create power-user
```

Generates a fully-formed persona based on the archetype, customized to the project context.

### list Command

```
=== PROJECT PERSONAS ===

1. Sarah Chen (Power User)
   Role: Senior Analyst | Tech: 5/5 | Frequency: Daily
   Goals: Efficiency, keyboard shortcuts, bulk operations

2. Mike Rodriguez (Casual User)
   Role: Sales Rep | Tech: 3/5 | Frequency: Weekly
   Goals: Quick data entry, mobile-friendly

3. Dr. Priya Sharma (Admin)
   Role: Department Head | Tech: 2/5 | Frequency: Monthly
   Goals: User management, reporting, compliance

Stored in: .claude/personas/
```

### use Command

Test or review from persona's perspective:

```
/personas use sarah-chen

Now reviewing this feature as Sarah Chen (Power User):

Sarah would likely:
- Look for keyboard shortcuts immediately
- Be frustrated by the 3-click workflow (wants 1-click)
- Appreciate the bulk select, but want "select all"
- Ask "where's the export to CSV?"

Suggested improvements for Sarah:
1. Add Ctrl+Enter shortcut for submit
2. Add "Select All" checkbox
3. Add CSV export option
4. Show keyboard hints on hover
```

## Persona-Driven Testing

### Usability Walkthrough

```
Testing [Feature] as [Persona]:

First Impression:
- What would they notice first?
- What would confuse them?

Task Completion:
- Can they achieve their goal?
- How many steps/clicks?
- Where might they get stuck?

Emotional Response:
- Frustrated? Delighted? Confused?
- Would they come back?

Verdict: [PASS/NEEDS WORK/FAIL]
Recommendations: [List]
```

### Edge Case Discovery

Each persona reveals different edge cases:

| Persona | Reveals |
|---------|---------|
| Power User | Missing shortcuts, batch operations |
| Newbie | Unclear labels, missing guidance |
| Mobile User | Touch targets, responsive issues |
| Accessibility | Screen reader, keyboard navigation |
| Busy Exec | Information density, quick actions |

## Storage

Save personas to `.claude/personas/`:

```
.claude/personas/
├── sarah-chen.md
├── mike-rodriguez.md
├── dr-priya-sharma.md
└── _archetypes/
    ├── power-user.md
    ├── casual-user.md
    └── admin.md
```

## Integration with Other Skills

### With /plan
```
Before planning, consider: Who are the primary personas?
This helps prioritize features and identify edge cases.
```

### With /testing
```
E2E tests should cover scenarios for each persona.
"As Sarah (power user), I should be able to..."
```

### With /accessibility
```
Always include an accessibility persona to ensure
assistive technology users aren't forgotten.
```

## Example Personas

### Tech-Savvy Power User

```markdown
# Persona: Sarah Chen

## Demographics
- **Age:** 28-35
- **Role:** Senior Data Analyst
- **Tech Comfort:** 5/5
- **Usage Frequency:** Daily (4+ hours)

## Context
- **Environment:** Open office, dual monitors
- **Devices:** Desktop primary, laptop for travel
- **Time Available:** Wants to maximize efficiency

## Goals
1. Process data faster than with spreadsheets
2. Create repeatable workflows
3. Share insights with team quickly

## Frustrations
1. Tools that require mouse for everything
2. No keyboard shortcuts
3. Can't automate repetitive tasks
4. Slow load times

## Behaviors
- Reads documentation before asking
- Customizes everything possible
- Creates own shortcuts/macros
- Shares tips with colleagues

## Quotes
> "If I have to click three buttons to do something I do 100 times a day, that's 200 wasted clicks."

## Scenario
Sarah opens the dashboard at 8am, uses Ctrl+D to jump to data import,
drags in 5 CSV files at once, hits Ctrl+Enter to process all,
then Ctrl+E to export the combined report—all in under 30 seconds.
```

### Time-Pressed Manager

```markdown
# Persona: Marcus Thompson

## Demographics
- **Age:** 45-55
- **Role:** Regional Sales Director
- **Tech Comfort:** 2/5
- **Usage Frequency:** Weekly (30 min max)

## Context
- **Environment:** Conference rooms, car, airport
- **Devices:** iPhone primary, iPad secondary
- **Time Available:** 5-10 minutes between meetings

## Goals
1. See team performance at a glance
2. Approve requests quickly
3. Forward reports to executives

## Frustrations
1. Too many clicks to find information
2. Can't use on phone effectively
3. Notifications for things that don't need him
4. Complex features he'll never use

## Behaviors
- Delegates detailed work to team
- Wants summaries, not details
- Calls someone if stuck (won't read help)
- Makes decisions quickly with limited info

## Quotes
> "Just tell me if we're on track or not. I don't need all the details."

## Scenario
Marcus checks his phone between meetings. He needs to see if his team
hit their targets this week. He wants a big green checkmark or red X,
maybe tap to see which reps need attention, then move on.
```

## Sources

- [Nielsen Norman Group: Personas](https://www.nngroup.com/articles/persona/)
- [Alan Cooper: The Inmates Are Running the Asylum](https://www.oreilly.com/library/view/the-inmates-are/0672326140/)
- [Indi Young: Mental Models](https://rosenfeldmedia.com/books/mental-models/)
