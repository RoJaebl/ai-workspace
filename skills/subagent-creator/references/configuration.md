# Configuration Reference

## Storage Locations

| Location | Scope | Priority |
|:---------|:------|:---------|
| `--agents` CLI flag | Current session | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All projects | 3 |
| Plugin's `agents/` | Where plugin enabled | 4 (lowest) |

When multiple subagents share the same name, higher-priority location wins.

## Model Selection

| Model | Use Case |
|:------|:---------|
| `haiku` | Fast, low-latency exploration |
| `sonnet` | Balanced capability (default) |
| `opus` | Complex reasoning |
| `inherit` | Same as parent conversation |

## Permission Modes

| Mode | Behavior |
|:-----|:---------|
| `default` | Standard permission prompts |
| `acceptEdits` | Auto-accept file edits |
| `dontAsk` | Auto-deny prompts (allowed tools still work) |
| `bypassPermissions` | Skip all permission checks (use with caution) |
| `plan` | Read-only exploration |

## Hooks

Define hooks in frontmatter for conditional control:

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/lint.sh"
```

### Available Hook Events

| Event | Matcher Input | When |
|:------|:--------------|:-----|
| `PreToolUse` | Tool name | Before tool execution |
| `PostToolUse` | Tool name | After tool execution |
| `Stop` | (none) | When subagent finishes |

### Hook Exit Codes

- `0`: Allow operation
- `2`: Block operation (error message via stderr feeds back to Claude)

### Hook Input (stdin JSON)

```json
{
  "tool_input": {
    "command": "the bash command being run"
  }
}
```

## CLI-Defined Subagents

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer.",
    "prompt": "You are a senior code reviewer.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

## Built-in Subagents

| Agent | Model | Tools | Purpose |
|:------|:------|:------|:--------|
| Explore | Haiku | Read-only | Codebase exploration |
| Plan | Inherit | Read-only | Planning research |
| general-purpose | Inherit | All | Complex multi-step tasks |
| Bash | Inherit | Bash | Terminal commands |

## Disabling Subagents

Add to settings.json:

```json
{
  "permissions": {
    "deny": ["Task(subagent-name)"]
  }
}
```

Or use CLI:

```bash
claude --disallowedTools "Task(Explore)"
```
