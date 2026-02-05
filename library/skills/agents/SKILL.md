---
name: agents
description: Monitor and manage background agents. Show status, wait for completion, view logs, and see history.
---

# Agents Skill

Monitor background agents spawned via the Task tool with `run_in_background: true`.

## Invocation

```
/agents [status|wait|log|history|cancel] [agent-id]
```

Or naturally: "check on the agents", "wait for agents to finish", "show agent history"

## Commands

| Command | Description |
|---------|-------------|
| `/agents` | Quick status of all running agents |
| `/agents status` | Detailed status with progress |
| `/agents wait` | Block until all agents complete |
| `/agents log <id>` | Show full output for specific agent |
| `/agents history` | Show recent completed agents |
| `/agents cancel <id>` | Stop a running agent |

## Instructions for Claude

### Default / status Command

Display running and recently completed agents:

```
=== BACKGROUND AGENTS ===

Running (3):
  a1b2c3d  Research MCP servers       [████░░░░░░] ~2min
  e4f5g6h  Explore codebase           [██████░░░░] ~1min
  i7j8k9l  Search for patterns        [█░░░░░░░░░] ~4min

Recently Completed (2):
  m0n1o2p  Find existing skills       ✓ 45s ago (12,340 tokens)
  q3r4s5t  Check documentation        ✓ 2min ago (8,921 tokens)

Use `/agents log <id>` to view output
Use `/agents wait` to block until all complete
```

**Implementation:**
1. Check for known background task IDs from recent Task tool responses
2. For each ID, use TaskOutput tool with `block: false` to check status
3. Parse output for progress indicators if available
4. Display formatted table

### wait Command

Block until all running agents complete:

```
Waiting for 3 agents to complete...

✓ a1b2c3d  Research MCP servers       Complete (15,432 tokens)
✓ e4f5g6h  Explore codebase           Complete (9,876 tokens)
✓ i7j8k9l  Search for patterns        Complete (21,543 tokens)

All agents complete. Total: 46,851 tokens
```

**Implementation:**
1. Identify all running agents
2. Use TaskOutput tool with `block: true` for each
3. Report results as they complete
4. Summarize total tokens used

### log Command

Show full output for a specific agent:

```
/agents log a1b2c3d

=== AGENT OUTPUT: a1b2c3d ===
Description: Research MCP servers
Status: Completed
Duration: 2m 34s
Tokens: 15,432

--- Output ---
[Full agent output here]
```

**Implementation:**
1. Use TaskOutput tool to get full output
2. Format with header showing metadata
3. Display complete output content

### history Command

Show recently completed agents from persistent history:

```
=== AGENT HISTORY (Last 10) ===

| Time | ID | Description | Tokens |
|------|-------|-------------|--------|
| 5min ago | a1b2c3d | Research MCP servers | 15,432 |
| 8min ago | e4f5g6h | Explore codebase | 9,876 |
| 12min ago | q3r4s5t | Check documentation | 8,921 |
...

Total agents today: 23
Total tokens today: 187,432
```

**Implementation:**
1. Read `.claude/agent-history.json` if it exists
2. Format as table with recent entries
3. Show summary statistics

### cancel Command

Stop a running agent:

```
/agents cancel a1b2c3d

Cancelling agent a1b2c3d (Research MCP servers)...
✓ Agent cancelled successfully
```

**Implementation:**
1. Use TaskStop tool with the agent ID
2. Confirm cancellation
3. Update status display

## Integration with Hook

This skill works best with the `agent-notify.js` hook which:
- Sends desktop notifications when agents complete
- Persists agent history to `.claude/agent-history.json`

See `library/hooks/agent-notify.js` for the hook implementation.

## Example Workflow

```
# Spawn background agents
User: Search for MCP servers, existing skills, and hook patterns in parallel

Claude: [Spawns 3 background agents]

# Check status
User: /agents

Claude: Shows status table with 3 running agents

# Do other work while agents run...

# Wait for completion
User: /agents wait

Claude: Blocks, shows each completing, summarizes results

# View specific output
User: /agents log a1b2c3d

Claude: Shows full research output
```

## Notes

- Agent IDs are short hashes (7 chars) from the full agent ID
- Progress bars are estimates based on token usage and time
- History persists across sessions via JSON file
- Desktop notifications require the hook to be configured
