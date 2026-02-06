# Deep Thinking Mode

**How to invoke adaptive thinking when you need thorough analysis.**

## Trigger Phrases

When you want Claude to give something deep thought, use phrases like:

- "Think deeply about this"
- "Give this some real thought"
- "Ultrathink this"
- "I want thorough analysis"
- "Consider this carefully"

## When It Helps

Deep thinking is valuable for:

| Task | Why |
|------|-----|
| Architecture decisions | Multiple valid approaches, long-term implications |
| Security-sensitive code | Edge cases, attack vectors |
| Complex debugging | Systematic root cause analysis |
| Major refactors | Ripple effects across codebase |
| Planning new features | Requirements, trade-offs, phasing |

## Integration with /plan

The `/plan` skill includes automatic complexity assessment. For high-complexity tasks, Claude will naturally provide deeper analysis. You can also explicitly request it:

```
/plan [feature] - think deeply about this
```

## When NOT Needed

Skip deep thinking for:
- Simple bug fixes
- Minor tweaks
- Clear, straightforward tasks
- Single-file changes with obvious solutions

## Sources

- [Anthropic: Claude Think Tool](https://www.anthropic.com/engineering/claude-think-tool)
