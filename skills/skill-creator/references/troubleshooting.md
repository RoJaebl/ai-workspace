# Troubleshooting Skills

## Skill Not Triggering

The `description` field is how Claude decides whether to use your Skill. Vague descriptions don't give Claude enough information.

**Bad description:**
```yaml
description: Helps with documents
```

**Good description:**
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

A good description answers:
1. **What does this Skill do?** List specific capabilities.
2. **When should Claude use it?** Include trigger terms users would mention.

## Skill Doesn't Load

### Check File Path

Skills must be in the correct directory with exact filename `SKILL.md` (case-sensitive):

| Type       | Path                                         |
|------------|----------------------------------------------|
| Personal   | `~/.claude/skills/my-skill/SKILL.md`         |
| Project    | `.claude/skills/my-skill/SKILL.md`           |

### Check YAML Syntax

Invalid YAML prevents the Skill from loading:

- Frontmatter must start with `---` on line 1 (no blank lines before it)
- End with `---` before the Markdown content
- Use spaces for indentation (not tabs)

**Bad:**
```yaml

---
name: my-skill
---
```

**Good:**
```yaml
---
name: my-skill
description: Does something useful
---
```

### Run Debug Mode

Use `claude --debug` to see Skill loading errors.

## Skill Has Errors

### Check Dependencies

If your Skill uses external packages, they must be installed before Claude can use them:

```yaml
description: Process PDFs. Requires pypdf and pdfplumber packages.
```

### Check Script Permissions

Scripts need execute permissions:
```bash
chmod +x scripts/*.py
```

### Check File Paths

Use forward slashes (Unix style) in all paths:
- Good: `scripts/helper.py`
- Bad: `scripts\helper.py`

## Multiple Skills Conflict

If Claude uses the wrong Skill or seems confused, descriptions are too similar.

**Make descriptions distinct:**
- Instead of two skills with "data analysis" in both descriptions
- Use: "sales data in Excel files and CRM exports" vs "log files and system metrics"

## Plugin Skills Not Appearing

**Clear plugin cache and reinstall:**
```bash
rm -rf ~/.claude/plugins/cache
```

Then restart Claude Code and reinstall the plugin:
```bash
/plugin install plugin-name@marketplace-name
```

**Verify plugin structure:**
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── my-skill/
        └── SKILL.md
```

## Common Validation Errors

### Name Mismatch
```
Error: Skill name 'my_skill' doesn't match directory 'my-skill'
```
Fix: Use lowercase letters, numbers, and hyphens only. Name should match directory.

### Description Too Long
```
Error: Description exceeds 1024 characters
```
Fix: Shorten description. Move detailed explanations to the body.

### Missing Required Fields
```
Error: Missing required field 'description'
```
Fix: Both `name` and `description` are required in frontmatter.
