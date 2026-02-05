# MCP Server Recommendations

Model Context Protocol (MCP) servers extend Claude Code's capabilities through external tools and data sources.

## What is MCP?

MCP is an open standard created by Anthropic that enables AI assistants to connect to external tools, databases, APIs, and services. When configured, Claude Code can use these tools naturally during conversations.

## Recommended MCP Servers

### Development Essentials

| Server | Purpose | Install |
|--------|---------|---------|
| **filesystem** | Local file access | `npx @anthropic/mcp-server-filesystem` |
| **github** | Repository management | `npx @anthropic/mcp-server-github` |
| **postgres** | PostgreSQL database | `npx @anthropic/mcp-server-postgres` |
| **sqlite** | SQLite database | `npx @anthropic/mcp-server-sqlite` |

### Productivity

| Server | Purpose | Install |
|--------|---------|---------|
| **google-drive** | Cloud documents | `npx @anthropic/mcp-server-google-drive` |
| **slack** | Team communication | `npx @anthropic/mcp-server-slack` |
| **linear** | Issue tracking | `npx @anthropic/mcp-server-linear` |
| **notion** | Documentation | Community server |

### Code Quality

| Server | Purpose | Install |
|--------|---------|---------|
| **puppeteer** | Browser automation | `npx @anthropic/mcp-server-puppeteer` |
| **playwright** | E2E testing | Community server |
| **context7** | Up-to-date docs | `npx @upstash/context7-mcp` |

### AI & Search

| Server | Purpose | Install |
|--------|---------|---------|
| **brave-search** | Web search | `npx @anthropic/mcp-server-brave-search` |
| **firecrawl** | Web scraping | `npx firecrawl-mcp` |
| **exa** | AI-powered search | Community server |

## Configuration

MCP servers are configured in Claude Code's settings. See the example configurations in this folder.

### Global Configuration

Location: `~/.claude/settings.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem", "/path/to/allowed/dir"]
    }
  }
}
```

### Project-Specific Configuration

Location: `.claude/settings.local.json` (gitignored)

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost/db"
      }
    }
  }
}
```

## Stack-Specific Recommendations

### PHP/MySQL Projects
- filesystem (local file ops)
- github (repo management)
- MySQL community server

### Laravel Projects
- filesystem
- github
- postgres or mysql
- redis (for queues/cache)

### React/Supabase Projects
- filesystem
- github
- supabase (community server)
- vercel (deployment)

### Node CLI Projects
- filesystem
- github
- npm (package management)

### Static/GSAP Sites
- filesystem
- github
- puppeteer (visual testing)
- cloudflare/vercel (deployment)

## Security Considerations

1. **Limit filesystem access** - Only allow directories needed for the project
2. **Use environment variables** - Never hardcode credentials in config files
3. **Project-local configs** - Keep sensitive MCP configs in gitignored files
4. **Principle of least privilege** - Only enable servers you actually need

## Tool Search

Claude Code automatically enables Tool Search when MCP tool descriptions exceed 10% of context. This loads tools on-demand rather than preloading all of them, reducing context usage by up to 47%.

**Requirements:** Sonnet 4+ or Opus 4+ (Haiku doesn't support Tool Search)

## Resources

- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)
- [MCP Official Site](https://modelcontextprotocol.io/)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [MCP Directory](https://mcp.so)
