# ai-workspace

> 🤖 Platform-agnostic AI coding assistant configurations

Works with any AI platform following the workspace pattern:
`.claude/`, `.cursor/`, `.aider/`, etc.

## 📁 Universal Structure
```
commands/     # Reusable slash commands
agents/       # Specialized AI agents  
skills/       # Auto-applied expertise
rules/        # Project memory & guidelines
```

## 🔌 Platform Support

| Platform | Directory | Status |
|----------|-----------|--------|
| Claude Code | `.claude/` | ✅ Full |
| Cursor | `.cursor/` | 🚧 Planned |
| Aider | `.aider/` | 🚧 Planned |

## 🚀 Quick Start
```bash
# For Claude Code
cp -r ai-workspace/commands .claude/
cp -r ai-workspace/agents .claude/
cp -r ai-workspace/skills .claude/

# For other platforms (future)
cp -r ai-workspace/commands .cursor/
```

## 🎯 Philosophy

AI workspace configurations should be:
- **Platform-agnostic**: Same structure, different platform
- **Reusable**: Write once, use everywhere
- **Shareable**: Git-friendly, team-ready
- **Composable**: Mix and match as needed