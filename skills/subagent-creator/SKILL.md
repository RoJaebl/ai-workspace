---
name: create-subagent
description: Create custom AI subagents for Cursor. Use when users want to create a subagent, set up task-specific agents, configure code reviewers, debuggers, or domain-specific assistants with custom prompts.
---

# Create Custom Subagents

Subagents are specialized AI assistants with custom system prompts, specific tool access, and independent permissions.

## Quick Start

1. Determine scope: user-level (`~/.claude/agents/`) or project-level (`.claude/agents/`)
2. Create a Markdown file with YAML frontmatter
3. Define `name`, `description`, and system prompt

## Subagent File Format

```markdown
---
name: my-agent
description: What this agent does. When to use it.
tools: Read, Grep, Glob, Bash
model: sonnet
---

System prompt goes here. Guide the agent's behavior.
```

## Required Fields

| Field | Description |
|:------|:------------|
| `name` | Lowercase with hyphens (e.g., `code-reviewer`) |
| `description` | When Claude should delegate to this agent |

## Optional Fields

| Field | Values | Default |
|:------|:-------|:--------|
| `tools` | Tool names (comma-separated) | Inherit all |
| `disallowedTools` | Tools to deny | None |
| `model` | `sonnet`, `opus`, `haiku`, `inherit` | `sonnet` |
| `permissionMode` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` | `default` |
| `skills` | Skills to load at startup | None |
| `hooks` | Lifecycle hooks | None |

## Available Tools

Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch, plus MCP tools.

For read-only agents: `tools: Read, Grep, Glob, Bash`

## Workflow

1. **Choose scope** - User-level for personal, project-level for team
2. **Write description** - Claude uses this to decide when to delegate
3. **Select tools** - Grant only necessary permissions
4. **Set model** - `haiku` for speed, `sonnet` for capability, `opus` for complex tasks
5. **Write prompt** - Clear, focused instructions

## References

- **Detailed configuration**: See [references/configuration.md](references/configuration.md)
- **Example subagents**: See [references/examples.md](references/examples.md)

## Templates

Use templates from `assets/templates/` as starting points:

| Template | Purpose |
|:---------|:--------|
| `code-reviewer.md` | Read-only code review |
| `debugger.md` | Bug investigation and fixing |
| `data-scientist.md` | Data analysis and SQL |
| `db-reader.md` | Read-only database queries with hook validation |
