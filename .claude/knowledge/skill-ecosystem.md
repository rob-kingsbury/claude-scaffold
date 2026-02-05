# Knowledge: Claude Code Skill Ecosystem

**Researched:** 2026-02-05
**Source:** /research "Claude Code skill ideas for developer productivity"
**Confidence:** High (multiple GitHub repos + articles confirmed)

## Key Facts

1. **202+ community skills** exist across VoltAgent's awesome-agent-skills repo
2. **obra/superpowers** is the most battle-tested collection with `/brainstorm` → `/write-plan` → `/execute-plan` workflow
3. **Severance pattern** uses UserPromptSubmit hook injection for memory that survives context compaction (~75% reliability)
4. **TDD Guard** demonstrates hook-based quality gates that block violations
5. **levnikolaevich** has 37 skills covering full delivery workflow with numbered phases
6. **Official anthropics/skills** repo has canonical examples including MCP server builder

## Major Repositories

| Repo | Skills | Focus |
|------|--------|-------|
| anthropics/skills | ~10 | Official reference implementations |
| obra/superpowers | 20+ | Battle-tested workflow skills |
| levnikolaevich/claude-code-skills | 37 | Full delivery workflow |
| VoltAgent/awesome-agent-skills | 202+ | Cross-platform compatibility |
| Trail of Bits | 25+ | Security-focused skills |

## Patterns Worth Adopting

1. **Three-command workflow** (brainstorm → plan → execute)
2. **Memory injection hooks** for context compaction survival
3. **Numbered skill phases** for organized workflows
4. **Quality gate hooks** that block on violations
5. **Markdown-driven templates** (Scaffdog pattern)

## Scaffolding Tools Insights

| Tool | Key Strength | Gap |
|------|--------------|-----|
| Copier | Template updates | Python-only |
| Scaffdog | Markdown templates | No AI |
| Backstage | Org standards | Heavy infra |
| Lefthook | Parallel hooks | Manual config |

## Sources

- https://github.com/anthropics/skills
- https://github.com/obra/superpowers
- https://github.com/VoltAgent/awesome-agent-skills
- https://github.com/levnikolaevich/claude-code-skills
- https://github.com/blas0/Severance
- https://github.com/nizos/tdd-guard
- https://scaff.dog/

## Related Topics

- [[obra/superpowers three-command workflow]]
- [[Severance memory injection pattern]]
- [[TDD Guard hook patterns]]

## Tangents Discovered

- obra/superpowers workflow worth deep dive
- Severance memory pattern could enhance session-start skill
- TDD Guard could inform our hooks library
- Scaffdog markdown approach for stack templates
