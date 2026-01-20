# Skill Examples

## Simple Skill (Single File)

A minimal skill needs only a `SKILL.md` file:

```
commit-helper/
└── SKILL.md
```

```yaml
---
name: generating-commit-messages
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Generating Commit Messages

## Instructions

1. Run `git diff --staged` to see changes
2. Suggest a commit message with:
   - Summary under 50 characters
   - Detailed description
   - Affected components

## Best practices

- Use present tense
- Explain what and why, not how
```

## Multi-File Skill with Progressive Disclosure

For complex skills, use progressive disclosure:

```
pdf-processing/
├── SKILL.md              # Overview and quick start
├── FORMS.md              # Form field mappings
├── REFERENCE.md          # API details
└── scripts/
    ├── fill_form.py      # Utility to populate form fields
    └── validate.py       # Checks PDFs for required fields
```

**SKILL.md:**

````yaml
---
name: pdf-processing
description: Extract text, fill forms, merge PDFs. Use when working with PDF files, forms, or document extraction.
allowed-tools: Read, Bash(python:*)
---

# PDF Processing

## Quick start

Extract text:
```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For form filling, see [FORMS.md](FORMS.md).
For detailed API reference, see [REFERENCE.md](REFERENCE.md).
````

## Visual Output Skill

Skills can bundle scripts that generate visual output (HTML, charts, etc.):

```
codebase-visualizer/
├── SKILL.md
└── scripts/
    └── visualize.py
```

**SKILL.md:**

````yaml
---
name: codebase-visualizer
description: Generate an interactive collapsible tree visualization of your codebase. Use when exploring a new repo or understanding project structure.
allowed-tools: Bash(python:*)
---

# Codebase Visualizer

Generate an interactive HTML tree view that shows your project's file structure.

## Usage

Run the visualization script from your project root:

```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```

This creates `codebase-map.html` and opens it in your browser.
````

## Skill with Restricted Tools

Use `allowed-tools` for read-only or security-sensitive operations:

```yaml
---
name: code-auditor
description: Audit code for security vulnerabilities without making changes.
allowed-tools: Read, Grep, Glob
---

# Code Auditor

Read-only security audit. Cannot modify files.

## Steps

1. Scan for common vulnerability patterns
2. Check dependency versions
3. Report findings in structured format
```

## Skill with Forked Context

Use `context: fork` for complex operations that shouldn't clutter the main conversation:

```yaml
---
name: deep-analysis
description: Perform deep code analysis with detailed findings
context: fork
agent: Explore
---

# Deep Analysis

This skill runs in an isolated context. Results are summarized back to the main conversation.
```

## Skill with Hooks

Define hooks scoped to the skill's lifecycle:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh $TOOL_INPUT"
          once: true
---
```

## Hidden Skill (Model-Only)

Use `user-invocable: false` to hide from slash menu while allowing Claude to use it:

```yaml
---
name: internal-review-standards
description: Apply internal code review standards when reviewing pull requests
user-invocable: false
---

# Internal Review Standards

Claude can invoke this skill programmatically, but users won't see it in the `/` menu.
```
