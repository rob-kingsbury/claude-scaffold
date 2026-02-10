# Stack Management Guide

How to add, edit, and remove stacks (and other library components) in claude-scaffold.

---

## Architecture Overview

```
library/
├── registry.yaml          # SINGLE SOURCE OF TRUTH - update this first
├── stacks/{name}/         # Stack definitions
│   └── stack.yaml
├── skills/{name}/         # Skill definitions
│   └── SKILL.md
├── rules/                 # Rule files
│   └── {name}.md
├── hooks/                 # Hook scripts
│   └── {name}.{js|sh}
├── workflows/             # Workflow definitions
│   └── {name}.yaml
├── templates/             # Core templates (shared by all stacks)
│   ├── CLAUDE.md.template
│   ├── context.md.template
│   └── HANDOFF.md.template
└── mcp/                   # MCP server configs
    └── settings.{name}.example.json
```

**The registry (`library/registry.yaml`) is the central manifest.** Always update it when adding, editing, or removing any component.

---

## Stack Format

Use **inline content** (file contents embedded in stack.yaml). This is the preferred format - it's self-contained and easier to maintain than external template references.

### Required Fields

```yaml
# Header comment describing the stack
name: stack-name                    # kebab-case, matches folder name
description: One-line description   # Shows in tables and AMA dialog

tech:                               # Technology versions and tools
  frontend: ...
  backend: ...
  # Add relevant categories

structure:                          # Directory and file organization
  root:
    - dir/                          # Add trailing slash for directories
    - file.ext
  subdir:
    - nested-file.ext               # Comment describing purpose

files:                              # Inline file contents (the starter code)
  path/to/file.ext: |
    file contents here

init_commands:                      # Commands to run after scaffolding
  - "command one"
  - "command two"

conventions:                        # Coding standards for this stack
  naming:
    files: case-convention
  patterns:
    - Pattern description

rules_to_copy:                      # Rules from library/rules/ to include
  - development-workflow.md         # Always include this one

skills_to_copy:                     # Skills from library/skills/ to include
  - session-start                   # Always include these three
  - handoff
  - audit

mcp_servers:                        # Recommended MCP servers
  - filesystem                      # Always include these two
  - github

sources:                            # Reference documentation URLs
  - https://docs.example.com/
```

### Optional Fields

```yaml
based_on: ["project-name"]          # Production projects this was extracted from
commands:                           # Named commands (alternative to init_commands)
  dev: "npm run dev"
  build: "npm run build"
```

---

## Operations

### Add a Stack

1. **Create the directory and stack file:**
   ```
   library/stacks/{name}/stack.yaml
   ```

2. **Write the stack.yaml** following the format above. Use an existing inline stack as a starting point:
   - Simple frontend: copy from `html-css-js`
   - Full-stack with DB: copy from `nextjs-prisma`
   - API backend: copy from `python-fastapi`
   - Content/blog site: copy from `astro-content`

3. **Update the registry** (`library/registry.yaml`):
   ```yaml
   # Add to the stacks list:
   - name: your-stack
     description: One-line description
     path: library/stacks/your-stack/stack.yaml
     format: inline
     based_on: []
     tags: [relevant, tags]
   ```

4. **Update the AMA questions** (`ama/questions.yaml`):
   - Add an option under `core > stack > options`
   - Add keyword triggers under `follow_up_triggers` if needed

5. **Update documentation:**
   - `README.md` - Add row to "Available Stacks" table
   - `SKILL.md` - Add row to "Available Stacks" table

6. **Checklist:**
   - [ ] `stack.yaml` created with inline content format
   - [ ] `registry.yaml` updated with new entry
   - [ ] `ama/questions.yaml` updated with new option
   - [ ] `README.md` table updated
   - [ ] `SKILL.md` table updated
   - [ ] All `rules_to_copy` exist in `library/rules/`
   - [ ] All `skills_to_copy` exist in `library/skills/`
   - [ ] `init_commands` tested and working

### Edit a Stack

1. **Edit the stack.yaml** directly in `library/stacks/{name}/stack.yaml`
2. **Update registry.yaml** if the description, tags, or format changed
3. **Update README.md / SKILL.md** if the description or use case changed

### Remove a Stack

1. **Delete the directory:** `library/stacks/{name}/`
2. **Remove from registry.yaml:** Delete the entry from the `stacks` list
3. **Remove from AMA questions:** Remove the option from `ama/questions.yaml`
4. **Remove from docs:** Remove rows from `README.md` and `SKILL.md`
5. **Check for orphaned MCP configs:** Remove from `library/mcp/` if stack-specific

### Add a Skill

1. Create `library/skills/{name}/SKILL.md`
2. Add entry to the appropriate category in `registry.yaml > skills`
3. Add row to the skills table in `README.md`

### Add a Rule

1. Create `library/rules/{name}.md`
2. Add entry to `registry.yaml > rules` with `applies_to` stacks
3. Add row to the rules table in `README.md`
4. Add to `rules_to_copy` in relevant `stack.yaml` files

### Add a Hook

1. Create `library/hooks/{name}.{js|sh}`
2. Add entry to `registry.yaml > hooks` (under `pre_tool_use` or `post_tool_use`)
3. Add row to the hooks table in `README.md`

### Add a Workflow

1. Create `library/workflows/{name}.yaml`
2. Add entry to `registry.yaml > workflows` with trigger phrases
3. Add row to the workflows table in `README.md`

---

## Stack Design Principles

1. **Inline over templates** - Embed file contents directly in stack.yaml. External `.template` files are a legacy pattern that creates maintenance burden.

2. **Minimal starter code** - Include just enough to demonstrate the stack's patterns. Don't scaffold an entire application; give a working skeleton.

3. **Real patterns from real projects** - When possible, extract patterns from production codebases. Document the source in `based_on`.

4. **Progressive complexity** - Start simple. A stack should scaffold a project that works immediately after running `init_commands`.

5. **Convention documentation** - The `conventions` section is as important as the file contents. It tells Claude how to extend the project correctly.

6. **Always include core skills** - Every stack should copy at minimum: `session-start`, `handoff`, `audit`.

7. **Always include core rules** - Every stack should copy at minimum: `development-workflow.md`.

---

## Validation

Quick checks to verify a stack is well-formed:

```bash
# Stack file exists and is valid YAML
cat library/stacks/{name}/stack.yaml

# Stack is in the registry
grep "{name}" library/registry.yaml

# Stack is in AMA options
grep "{name}\|{display name}" ama/questions.yaml

# Stack is in README
grep "{name}" README.md

# Stack is in SKILL.md
grep "{name}" SKILL.md

# Referenced rules exist
# (check rules_to_copy entries against library/rules/)

# Referenced skills exist
# (check skills_to_copy entries against library/skills/)
```

---

## Converting Template-Ref Stacks to Inline

Several older stacks (php-mysql, laravel, react-supabase, node-cli, static-gsap) use the `template-refs` format where files reference external `.template` files that haven't been created yet. To convert:

1. Open the stack.yaml
2. Replace the `files` list format:
   ```yaml
   # FROM (template-refs):
   files:
     - path: index.html
       template: index.html.template

   # TO (inline):
   files:
     index.html: |
       <!DOCTYPE html>
       ...actual file contents...
   ```
3. Update `format: inline` in registry.yaml
4. Delete any `.template` files that were created

---

## File Touchpoints Summary

When modifying the library, here's every file that may need updating:

| Action | Files to Update |
|--------|----------------|
| Add stack | `stack.yaml`, `registry.yaml`, `ama/questions.yaml`, `README.md`, `SKILL.md` |
| Edit stack | `stack.yaml`, possibly `registry.yaml`, `README.md`, `SKILL.md` |
| Remove stack | Delete folder, `registry.yaml`, `ama/questions.yaml`, `README.md`, `SKILL.md` |
| Add skill | `SKILL.md` (skill), `registry.yaml`, `README.md` |
| Add rule | `{name}.md`, `registry.yaml`, `README.md`, relevant `stack.yaml` files |
| Add hook | `{name}.js/sh`, `registry.yaml`, `README.md` |
| Add workflow | `{name}.yaml`, `registry.yaml`, `README.md` |
