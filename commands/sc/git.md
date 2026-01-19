---
name: git
description: "Git operations with intelligent commit messages and workflow optimization"
category: utility
complexity: basic
mcp-servers: [serena, sequential]
personas: []
---

# /sc:git - Git Operations

## Triggers

- Git repository operations: status, add, commit, push, pull, branch
- Need for intelligent commit message generation
- Repository workflow optimization requests
- Branch management and merge operations

## Usage

```
/sc:git [operation] [args] [--smart-commit] [--interactive] [--serena] [--sequential] [--think-hard]
```

**Flags:**

- `--serena`: Serena MCP 활성화 (심볼 분석, 프로젝트 컨텍스트, 의미론적 커밋 메시지 생성)
- `--sequential`: Sequential Thinking MCP 활성화 (복잡한 Git 작업의 체계적 다단계 분석 및 계획)
- `--think-hard`: Sequential Thinking의 심층 분석 모드 활성화 (--sequential과 함께 사용)

## Behavioral Flow

1. **Analyze**: Check repository state and working directory changes
   - **Important**: Base analysis solely on repository state, file contents, and Git history. Do not reference conversation context or previous dialogue when analyzing changes or generating commit messages.
   - **Tracked Changes Only**: Analyze only changes that are tracked by Git (staged and unstaged files visible in `git status` and `git diff`). Commit messages must reflect only the actual tracked changes, not assumptions or untracked modifications.
   - If `--serena`: Use Serena MCP for semantic code analysis of changed files, symbol-level impact assessment, and project context understanding
   - If `--sequential`: Use Sequential Thinking MCP for systematic multi-step analysis of complex Git operations:
     - Break down large change sets into logical, manageable groups
     - Analyze change dependencies and relationships step-by-step
     - Identify change categories and their impact boundaries
     - Plan commit strategy with systematic change grouping
   - If `--think-hard`: Apply deep sequential reasoning to understand:
     - Complex change dependencies across multiple files and components
     - Cross-file impact assessment and validation requirements
     - Comprehensive commit strategy for multi-component changes
     - Integration points with existing branch history and workflow
2. **Validate**: Ensure operation is appropriate for current Git context
   - Serena integration: Leverage project memory for commit message patterns and workflow consistency
   - Sequential integration: Use step-by-step reasoning to:
     - Validate change grouping logic through systematic analysis
     - Prioritize commits based on dependency relationships and impact
     - Plan comprehensive commit strategy with logical change organization
     - Validate commit message requirements completeness before generation
3. **Execute**: Run Git command with intelligent automation
   - **Windows UTF-8 Encoding**: Ensure UTF-8 encoding is properly configured before executing Git commands
     - Set terminal encoding: `chcp 65001` (CMD) or `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` (PowerShell)
     - Verify Git encoding configuration: `git config --global core.quotepath false` and UTF-8 commit encoding
     - Prepend encoding setup to Git commands when necessary for Korean character support
   - If `--serena`: Use symbol-level understanding for accurate change categorization
   - If `--sequential`: Execute Git operations following a carefully planned sequence:
     - Group changes in logical dependency order (foundational changes before dependent ones)
     - Validate each commit's scope and completeness before proceeding
     - Ensure consistent commit message format and categorization throughout
     - Apply systematic validation gates at each commit milestone
4. **Optimize**: Apply smart commit messages and workflow patterns
   - **Tracked Changes Only**: Commit messages must be composed exclusively from tracked changes (staged/unstaged files). Include only what is actually changed according to `git status` and `git diff`. Do not include information about untracked files, assumptions, or changes not visible in Git's tracking.
   - **UTF-8 Encoding for Messages**: All commit messages must be generated and written in UTF-8 encoding
     - Ensure Korean characters are properly encoded in UTF-8 format
     - Write commit messages to files using UTF-8 encoding without BOM
     - Validate Korean character display before committing
     - Use UTF-8 encoding when reading/writing commit message files
   - If `--serena`: Generate semantic commit messages based on symbol-level analysis and project context
   - If `--sequential`: Organize commits systematically:
     - Validate logical commit sequence and dependency relationships
     - Check commit message consistency and categorization accuracy
     - Ensure proper change grouping patterns across all commits
     - Apply systematic commit strategy validation before finalization
5. **Report**: Provide status and next steps guidance
   - If `--serena`: Persist commit patterns to project memory for future consistency
   - If `--sequential`: Provide detailed step-by-step reasoning:
     - Document the systematic analysis process and decisions made
     - Provide recommendations based on comprehensive change assessment
     - Validate commit strategy consistency with existing workflow standards
     - Generate improvement suggestions through systematic quality evaluation

Key behaviors:

- Generate conventional commit messages based on change analysis
- Apply consistent branch naming conventions
- Handle merge conflicts with guided resolution
- Provide clear status summaries and workflow recommendations
- **Windows UTF-8 Support**: Ensure proper UTF-8 encoding configuration for Windows environments with Korean language support
  - Set terminal encoding to UTF-8 before Git operations (`chcp 65001` or PowerShell UTF-8 setup)
  - Configure Git for UTF-8 commit encoding and disable quotepath for Korean file paths
  - Validate Korean character encoding in commit messages and file paths
- **Context Independence**: All Git operations and commit message generation must be based solely on repository state, file contents, and Git history. Conversation context or previous dialogue must not influence analysis or decisions.
- **Tracked Changes Only**: Commit messages must reflect only tracked changes visible in Git (staged/unstaged files from `git status` and `git diff`). Do not include information about untracked files, assumptions, or changes not actually tracked by Git.
- **Serena Integration**: Semantic understanding of code changes, symbol-level impact assessment, project memory persistence
- **Sequential Thinking Integration**: Systematic multi-step analysis for complex Git operations, logical change organization, and comprehensive commit strategy planning

## MCP Integration

- **Serena MCP** (when `--serena` flag is provided):

  - Semantic code analysis of git changes (staged/unstaged files)
  - Symbol-level impact assessment for changed code
  - Project memory management for commit message pattern consistency
  - Cross-session context persistence for workflow standards
  - LSP functionality for accurate symbol navigation and change understanding
  - Conventional commit message generation based on semantic understanding

- **Sequential Thinking MCP** (when `--sequential` flag is provided):
  - Systematic multi-step analysis of complex Git operations and large change sets
    - Breaks down large change sets into logical, manageable groups
    - Analyzes change dependencies and relationships step-by-step
    - Identifies change categories and their impact boundaries systematically
  - Logical breakdown of changes into coherent, structured commit groups
    - Groups related changes for optimal commit organization
    - Plans commit strategy with systematic change hierarchy
    - Ensures logical commit sequence and dependency relationships
  - Step-by-step reasoning for commit strategy planning and change organization
    - Plans commit sequence with dependency-aware grouping
    - Organizes changes based on logical relationships and impact scope
    - Validates commit message requirements and change categorization before execution
  - Dependency analysis and change impact validation through sequential thinking
    - Maps relationships between changed files, components, and their dependencies
    - Validates change grouping accuracy and completeness systematically
    - Ensures commit consistency across related changes
  - Comprehensive commit strategy planning for multi-file changes
    - Plans commit strategy for large-scale change sets
    - Coordinates commit grouping across multiple files and components
    - Ensures comprehensive change coverage without redundancy or gaps
  - Deep reasoning mode (with `--think-hard`) for complex scenarios:
    - Thorough analysis of change dependencies across multiple components
    - Comprehensive impact mapping for complex multi-file changes
    - Detailed evaluation of commit strategy requirements with existing branch history
    - Systematic assessment of commit message quality and workflow consistency

## Windows Environment & UTF-8 Encoding

**Critical**: When working on Windows with Korean language support, ensure UTF-8 encoding is properly configured to prevent message corruption and command execution issues.

### Encoding Configuration Requirements

1. **Terminal Encoding Setup**:

   - Set PowerShell/Command Prompt encoding to UTF-8 before executing Git commands
   - Use `chcp 65001` (PowerShell: `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`) to set UTF-8 code page
   - Verify encoding with `chcp` command (should display "65001" for UTF-8)

2. **Git Configuration**:

   - Set Git core.quotepath to false: `git config --global core.quotepath false`
   - Set Git i18n.commitencoding to UTF-8: `git config --global i18n.commitencoding utf-8`
   - Set Git i18n.logoutputencoding to UTF-8: `git config --global i18n.logoutputencoding utf-8`
   - For Windows PowerShell: `git config --global core.editor "code --wait"` (or configure editor with UTF-8 support)

3. **Command Execution**:

   - All Git commands executed via Bash tool must ensure UTF-8 encoding context
   - When executing commands, prepend with encoding setup: `chcp 65001 >nul && git [command]`
   - For PowerShell: Set encoding before command execution: `$OutputEncoding = [System.Text.Encoding]::UTF8; git [command]`

4. **Commit Message Handling**:

   - All commit messages must be generated and written in UTF-8 encoding
   - When writing commit messages to files, ensure file encoding is UTF-8 without BOM
   - Use UTF-8 encoding when reading/writing commit message files
   - Validate Korean characters display correctly before committing

5. **File Path Handling**:
   - Handle Korean file paths correctly by ensuring UTF-8 encoding
   - Use `git config --global core.quotepath false` to prevent path encoding issues
   - When displaying file paths, ensure proper UTF-8 encoding for Korean characters

### Implementation Guidelines

- **Before Git Operations**: Always verify or set UTF-8 encoding context
- **Command Execution**: Prepend encoding setup commands when necessary
- **Message Generation**: Ensure all text output uses UTF-8 encoding
- **Error Handling**: Check for encoding-related errors and provide guidance
- **Cross-Platform Compatibility**: Maintain UTF-8 encoding standards across Windows/Linux/Mac

## Tool Coordination

- **Bash**: Git command execution and repository operations
  - **Windows UTF-8 Support**: Ensure UTF-8 encoding is set before executing Git commands
  - Use `chcp 65001` (Windows) or set `$OutputEncoding` (PowerShell) before Git operations
  - Verify encoding context for Korean character support in commit messages and file paths
- **Read**: Repository state analysis and configuration review
- **Grep**: Log parsing and status analysis
- **Write**: Commit message generation and documentation
  - **UTF-8 Encoding**: All commit messages and documentation must be written in UTF-8 encoding
  - Ensure file encoding is UTF-8 without BOM for proper Korean character support
- **Serena Tools** (when `--serena`): Symbol operations, project memory, semantic search, code change analysis
- **Sequential Thinking Tools** (when `--sequential`): Multi-step reasoning, logical analysis, systematic planning, comprehensive change assessment
- **sequentialthinking**: Structured reasoning for complex change dependency analysis and commit strategy organization

## Key Patterns

- **Smart Commits**: Analyze changes → generate conventional commit message
- **Status Analysis**: Repository state → actionable recommendations
- **Branch Strategy**: Consistent naming and workflow enforcement
- **Error Recovery**: Conflict resolution and state restoration guidance
- **Serena-Enhanced Commits**: Semantic change analysis → symbol-level impact assessment → conventional commit message generation
- **Pattern Consistency**: Cross-session memory → commit message standards → workflow consistency
- **Sequential Commit Planning**: Complex changes → systematic breakdown → dependency analysis → logical grouping → comprehensive commit strategy → validation
- **Multi-Step Change Analysis**: Change discovery → dependency mapping → impact assessment → categorization → commit grouping → message generation
- **Sequential Change Organization**: Change analysis → dependency mapping → logical grouping → systematic commit generation → consistency validation
- **Step-by-Step Reasoning**: Each commit decision is validated through systematic analysis before proceeding to next step

## Examples

### Smart Status Analysis

```
/sc:git status
# Analyzes repository state with change summary
# Provides next steps and workflow recommendations
```

### Intelligent Commit

```
/sc:git commit --smart-commit
# Generates conventional commit message from change analysis
# Applies best practices and consistent formatting
```

### Interactive Operations

```
/sc:git merge feature-branch --interactive
# Guided merge with conflict resolution assistance
```

### Serena-Enhanced Commit Message Generation

```
/sc:git commit --serena --smart-commit
# Uses Serena MCP for semantic analysis of code changes
# Generates conventional commit message based on symbol-level impact assessment
# Leverages project memory for consistent commit message patterns
# Example output: "feat(auth): add JWT token refresh mechanism"
```

### Semantic Change Analysis

```
/sc:git status --serena
# Analyzes repository state with semantic understanding
# Provides symbol-level impact assessment for changed files
# Suggests appropriate commit message based on code changes
# Maintains consistency through project memory
```

### Complex Feature Commit with Serena

```
/sc:git commit --serena --smart-commit
# For complex multi-file changes:
# - Analyzes all changed symbols and their relationships
# - Identifies affected components and their impact
# - Generates comprehensive commit message with semantic understanding
# - Persists commit patterns for future reference
```

### Sequential Thinking for Complex Multi-File Commit Strategy

```
/sc:git commit --sequential --smart-commit
# Uses Sequential Thinking MCP for systematic analysis:
#
# Step 1: Change Analysis
#   - Analyzes all changed files and their relationships
#   - Identifies change groups by functionality (auth, UI, tests)
#   - Maps dependencies between files and components
#
# Step 2: Commit Strategy Planning
#   - Plans commit sequence: Core changes → Dependencies → Tests → Documentation
#   - Ensures foundational changes are committed before dependent ones
#   - Validates logical grouping and change categorization
#
# Step 3: Commit Message Generation
#   - Generates commit messages following planned sequence
#   - Validates each commit's scope before proceeding to next
#   - Ensures consistent commit message format and categorization
#
# Step 4: Strategy Validation
#   - Validates consistency across all planned commits
#   - Checks change grouping accuracy and completeness
#   - Ensures comprehensive change coverage without gaps
#
# Result: Well-organized commit strategy with logical sequence and consistent messages
```

### Deep Sequential Analysis with Think-Hard for Large Change Set

```
/sc:git commit --sequential --think-hard --smart-commit
# Applies deep sequential reasoning for complex changes:
#
# Deep Analysis Phase:
#   1. Change Discovery: Identifies all changed files systematically
#      - Analyzes file relationships and dependencies
#      - Maps component boundaries and impact scope
#   2. Dependency Analysis: Comprehensive relationship mapping
#      - Identifies change dependencies (file A depends on file B)
#      - Evaluates impact scope and affected components
#      - Plans commit order based on dependency relationships
#   3. Categorization Strategy: Detailed change grouping
#      - Groups changes by functionality and impact type
#      - Plans commit sequence: Core → Features → Tests → Docs
#      - Validates change categorization consistency
#   4. Commit Strategy Planning: Detailed organization strategy
#      - Plans commit sequence with multiple logical groups
#      - Ensures proper change grouping for different change types
#      - Validates commit message requirements completeness
#   5. Workflow Assessment: Comprehensive validation
#      - Evaluates integration with existing branch history
#      - Validates consistency with project commit standards
#      - Ensures commit strategy aligns with workflow requirements
#
# Output: Detailed reasoning chain visible in output, showing systematic analysis process
```

### Sequential Analysis for Multi-Component Feature Branch

```
/sc:git status --sequential
# Uses Sequential Thinking MCP to plan comprehensive commit strategy:
#
# Phase 1: Change Discovery and Analysis
#   - Systematically analyzes all changed files in working directory
#   - Identifies change categories and relationships
#   - Maps file dependencies and component boundaries
#
# Phase 2: Change Grouping Analysis
#   - Groups related changes for logical commit organization
#   - Evaluates change dependencies and impact scope
#   - Prioritizes commits based on dependency relationships
#
# Phase 3: Commit Strategy Planning
#   - Plans commit sequence: Foundation → Features → Integration → Tests
#   - Ensures consistent commit message format across all commits
#   - Validates logical flow and change categorization
#
# Phase 4: Strategy Validation
#   - Validates commit strategy consistency and completeness
#   - Checks change grouping accuracy and dependency relationships
#   - Ensures comprehensive change coverage without redundancy
#   - Validates commit message requirements and categorization
#
# Result: Comprehensive commit strategy with consistent structure and logical sequence
```

### Combined Serena and Sequential Analysis

```
/sc:git commit --serena --sequential --smart-commit
# Combines semantic understanding with systematic reasoning:
# - Serena provides symbol-level code understanding and change impact assessment
# - Sequential Thinking provides logical commit strategy and change organization
# - Generates comprehensive commit messages with both semantic and structural insights
# - Ensures consistency through project memory and systematic analysis
# - Best for complex multi-file changes requiring both deep understanding and structured organization
```

### Windows UTF-8 Encoding Setup Example

```
# PowerShell UTF-8 Setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001

# Git UTF-8 Configuration
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

# Then execute Git commands
/sc:git commit --smart-commit
# All commit messages will be properly encoded in UTF-8
# Korean characters will display correctly in commit messages and file paths
```

### Korean Commit Message Example

```
/sc:git commit --smart-commit
# With UTF-8 encoding properly configured:
# - Korean commit messages are generated correctly
# - Example: "feat(인증): JWT 토큰 갱신 메커니즘 추가"
# - File paths with Korean characters are handled correctly
# - All output displays Korean characters properly
```

## Boundaries

**Will:**

- Execute Git operations with intelligent automation
- Generate conventional commit messages from change analysis
- Provide workflow optimization and best practice guidance
- Ensure UTF-8 encoding configuration for Windows environments with Korean language support
- Set terminal encoding to UTF-8 and configure Git for UTF-8 commit encoding before operations
- Handle Korean characters correctly in commit messages and file paths
- Use Serena MCP for enhanced semantic analysis when `--serena` flag is provided
- Generate semantic commit messages based on symbol-level understanding
- Leverage project memory for consistent commit message patterns across sessions
- Use Sequential Thinking MCP for systematic multi-step analysis when `--sequential` flag is provided
- Apply deep sequential reasoning for complex Git operations when `--think-hard` flag is used with `--sequential`
- Break down complex change sets into logical components and generate comprehensive commit strategies
- Provide step-by-step reasoning and validation for complex commit strategies

**Will Not:**

- Modify repository configuration without explicit authorization
- Execute destructive operations without confirmation
- Handle complex merges requiring manual intervention
- Reference conversation context or previous dialogue when analyzing changes or generating commit messages (must base decisions solely on repository state, file contents, and Git history)
- Include information about untracked files, assumptions, or changes not tracked by Git in commit messages (commit messages must reflect only tracked changes visible in `git status` and `git diff`)
- Execute Git commands without ensuring UTF-8 encoding context on Windows (must set encoding before operations for Korean character support)
- Generate commit messages without UTF-8 encoding validation (must ensure Korean characters are properly encoded)
- Activate Serena MCP without explicit `--serena` flag (maintains backward compatibility)
- Activate Sequential Thinking MCP without explicit `--sequential` flag (maintains backward compatibility)
