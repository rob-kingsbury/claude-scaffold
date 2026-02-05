---
name: research
description: Research topics with parallel agents. Optionally track topics to explore later.
---

# Research Skill

Research topics using parallel agents for breadth. Track interesting tangents for later.

## Commands

| Command | Description |
|---------|-------------|
| `/research <topic>` | Research with 3 parallel agents |
| `/research <topic> --deep` | Deep research with 5 agents |
| `/research <topic> --save` | Save findings to .claude/knowledge/ |
| `/curiosity` | Show topics queued for later |
| `/curiosity add <topic>` | Queue a topic to research later |
| `/curiosity next` | Research the top queued topic |

## Instructions for Claude

### /research Command

1. Spawn 3 parallel agents with different search angles:
   - **GitHub agent**: Search repos, code examples, existing tools
   - **Web agent**: Search articles, docs, tutorials
   - **Solutions agent**: Find existing tools, compare alternatives

2. Wait for all agents to complete

3. Compile findings into:
   ```
   === FINDINGS: <topic> ===

   ## Key Discoveries
   | Discovery | Source | Relevance |

   ## Existing Solutions
   | Solution | Pros | Cons |

   ## Worth Exploring Later
   - [topic 1]
   - [topic 2]
   ```

4. If `--save`: Write summary to `.claude/knowledge/<topic-slug>.md`

5. Optionally add interesting tangents to curiosity queue

### /research --deep

Same as above but spawn 5 agents:
- GitHub repos
- Web articles
- Existing tools
- Academic/technical papers
- Community discussions (Reddit, HN, Discord)

### /curiosity Command

Read `.claude/curiosity-queue.json` and display:
```
=== CURIOSITY QUEUE ===

Topics to explore:
  1. [HIGH] Topic A (from: previous research)
  2. [MED]  Topic B (added manually)
  3. [LOW]  Topic C (tangent)

Run `/curiosity next` to research #1
```

### /curiosity add

```
/curiosity add "topic name" --priority high
```

Add to `.claude/curiosity-queue.json`:
```json
{
  "queue": [
    { "topic": "...", "priority": "high|medium|low", "source": "..." }
  ]
}
```

### /curiosity next

Research the top priority topic:
1. Read queue, get first item
2. Run `/research <topic> --save`
3. Remove from queue, add to completed

## Files

| File | Purpose |
|------|---------|
| `.claude/curiosity-queue.json` | Topics to research later |
| `.claude/knowledge/*.md` | Saved research findings |

## Example

```
User: /research "MCP server patterns"

Claude: === FINDINGS: MCP server patterns ===

## Key Discoveries
| Discovery | Source | Relevance |
|-----------|--------|-----------|
| Official MCP spec | modelcontextprotocol.io | HIGH |
| 100+ community servers | awesome-mcp-servers | HIGH |

## Existing Solutions
| Solution | Pros | Cons |
|----------|------|------|
| @anthropic/mcp-sdk | Official, TypeScript | Node only |

## Worth Exploring Later
- MCP Tasks protocol (async operations)
- MCP inspector (debugging)

Added 2 topics to curiosity queue.
```
