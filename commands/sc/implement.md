---
name: implement
description: "Feature and code implementation with intelligent persona activation and MCP integration"
category: workflow
complexity: standard
mcp-servers: [context7, sequential, magic, playwright, serena]
personas: [architect, frontend, backend, security, qa-specialist]
---

# /sc:implement - Feature Implementation

> **Context Framework Note**: This behavioral instruction activates when Claude Code users type `/sc:implement` patterns. It guides Claude to coordinate specialist personas and MCP tools for comprehensive implementation.

## Triggers

- Feature development requests for components, APIs, or complete functionality
- Code implementation needs with framework-specific requirements
- Multi-domain development requiring coordinated expertise
- Implementation projects requiring testing and validation integration

## Context Trigger Pattern

```
/sc:implement [feature-description] [--type component|api|service|feature] [--framework react|vue|express] [--safe] [--with-tests] [--serena]
```

**Flags:**

- `--serena`: Serena MCP 활성화 (심볼 분석, 프로젝트 컨텍스트, 세션 지속성)

**Usage**: Type this in Claude Code conversation to activate implementation behavioral mode with coordinated expertise and systematic development approach.

## Behavioral Flow

1. **Analyze**: Examine implementation requirements and detect technology context
   - If `--serena`: Use Serena MCP for semantic code analysis, symbol navigation, and project context understanding
2. **Plan**: Choose approach and activate relevant personas for domain expertise
   - Serena integration: Leverage project memory and cross-session context for implementation patterns
3. **Generate**: Create implementation code with framework-specific best practices
   - **Windows Korean Encoding**: When generating code with Korean comments or strings, validate encoding:
     - Test Korean character encoding: Verify Korean characters display correctly
     - Sequential validation: Try CP949 → EUC-KR → UTF-8 until Korean characters are properly encoded
     - File encoding: Ensure generated files use appropriate encoding for Korean characters
   - If `--serena`: Use symbol-level understanding for accurate code generation and integration
4. **Validate**: Apply security and quality validation throughout development
   - **Korean Encoding Validation**: Validate Korean characters in generated code and terminal output:
     - Check Korean comments and strings in code files
     - Verify Korean characters in terminal command output
     - Ensure Korean file paths are handled correctly
     - Report encoding issues if Korean characters are corrupted
5. **Integrate**: Update documentation and provide testing recommendations
   - **Korean Encoding Verification**: Verify Korean text in documentation and test output:
     - Check Korean characters in documentation files
     - Validate Korean text in test results and terminal output
     - Ensure Korean file paths in documentation are correct
   - If `--serena`: Persist implementation patterns to project memory for future consistency

Key behaviors:

- Context-based persona activation (architect, frontend, backend, security, qa)
- Framework-specific implementation via Context7 and Magic MCP integration
- Systematic multi-component coordination via Sequential MCP
- Comprehensive testing integration with Playwright for validation
- **Windows Korean Encoding Support**: Sequential encoding validation (CP949 → EUC-KR → UTF-8) for Korean character handling
  - Automatic encoding detection and validation for Windows environments
  - Korean character display verification in terminal output and file operations
  - Korean file path handling with appropriate encoding schemes
- **Serena Integration**: Semantic understanding, symbol-level analysis, project memory persistence

## MCP Integration

- **Context7 MCP**: Framework patterns and official documentation for React, Vue, Angular, Express
- **Magic MCP**: Auto-activated for UI component generation and design system integration
- **Sequential MCP**: Complex multi-step analysis and implementation planning
- **Playwright MCP**: Testing validation and quality assurance integration
- **Serena MCP** (when `--serena` flag is provided):
  - Semantic code analysis and symbol-level understanding for accurate implementation
  - Project memory management for implementation pattern consistency
  - Cross-session context persistence for development standards
  - LSP functionality for precise symbol navigation and reference extraction

## Windows Environment & Korean Encoding Validation

**Critical**: When working on Windows with Korean language support, validate Korean character encoding through multiple encoding schemes to ensure proper terminal operation and file handling.

### Encoding Validation Sequence

When executing terminal commands or handling Korean text on Windows, validate encoding in the following order:

1. **CP949 (Windows Default Korean Encoding)**:

   - First attempt: Use CP949 (Code Page 949, Windows default Korean encoding)
   - Set terminal encoding: `chcp 949` (CMD) or configure PowerShell for CP949
   - Test Korean character display: Verify Korean characters display correctly in terminal output
   - Validate file operations: Ensure Korean file paths and content are handled correctly

2. **EUC-KR (Extended Unix Code - Korean)**:

   - Second attempt: If CP949 fails, try EUC-KR encoding
   - Set terminal encoding: Configure terminal for EUC-KR if supported
   - Test Korean character display: Verify Korean characters display correctly
   - Validate file operations: Ensure Korean file paths and content are handled correctly

3. **UTF-8 (Universal Encoding)**:
   - Final attempt: Use UTF-8 encoding as fallback
   - Set terminal encoding: `chcp 65001` (CMD) or `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` (PowerShell)
   - Test Korean character display: Verify Korean characters display correctly
   - Validate file operations: Ensure Korean file paths and content are handled correctly

### Validation Process

1. **Before Terminal Operations**:

   - Detect Windows environment
   - Test Korean character encoding: Execute test command with Korean text
   - Verify encoding: Check if Korean characters display correctly
   - Set appropriate encoding: Configure terminal with working encoding scheme

2. **During Command Execution**:

   - Execute commands with encoding context
   - Monitor output for Korean character corruption
   - Validate file paths containing Korean characters
   - Verify Korean text in command output and file content

3. **After Operations**:
   - Validate Korean characters in generated files
   - Check Korean text in terminal output
   - Verify Korean file paths are handled correctly
   - Report encoding issues if Korean characters are corrupted

### Implementation Guidelines

- **Encoding Detection**: Automatically detect Windows environment and test encoding schemes
- **Sequential Validation**: Try CP949 → EUC-KR → UTF-8 in order until Korean characters display correctly
- **Error Handling**: If Korean characters are corrupted, try next encoding scheme
- **File Operations**: Ensure Korean file paths and content are handled correctly with chosen encoding
- **Cross-Platform Compatibility**: Maintain encoding standards while prioritizing Windows Korean support

## Tool Coordination

- **Write/Edit/MultiEdit**: Code generation and modification for implementation
  - **Windows Korean Encoding**: Ensure Korean characters in code and comments are properly encoded
  - Validate Korean text encoding when writing files (CP949 → EUC-KR → UTF-8 validation)
- **Read/Grep/Glob**: Project analysis and pattern detection for consistency
  - **Korean File Path Handling**: Handle Korean file paths correctly with appropriate encoding
- **Bash**: Terminal command execution and script running
  - **Windows Korean Encoding Validation**: Validate Korean character encoding before executing commands
    - Test encoding: Execute test command with Korean text to verify encoding
    - Sequential validation: Try CP949 → EUC-KR → UTF-8 until Korean characters display correctly
    - Set encoding: Configure terminal with working encoding scheme (`chcp 949`, `chcp 65001`, etc.)
    - Verify output: Check Korean characters in command output and file paths
- **TodoWrite**: Progress tracking for complex multi-file implementations
- **Task**: Delegation for large-scale feature development requiring systematic coordination
- **Serena Tools** (when `--serena`): Symbol operations, project memory, semantic search, code navigation

## Key Patterns

- **Context Detection**: Framework/tech stack → appropriate persona and MCP activation
- **Implementation Flow**: Requirements → code generation → validation → integration
- **Multi-Persona Coordination**: Frontend + Backend + Security → comprehensive solutions
- **Quality Integration**: Implementation → testing → documentation → validation
- **Serena-Enhanced Implementation**: Semantic understanding → symbol navigation → project context → memory persistence
- **Pattern Consistency**: Cross-session memory → implementation standards → code quality maintenance

## Examples

### React Component Implementation

```
/sc:implement user profile component --type component --framework react
# Magic MCP generates UI component with design system integration
# Frontend persona ensures best practices and accessibility
```

### API Service Implementation

```
/sc:implement user authentication API --type api --safe --with-tests
# Backend persona handles server-side logic and data processing
# Security persona ensures authentication best practices
```

### Full-Stack Feature

```
/sc:implement payment processing system --type feature --with-tests
# Multi-persona coordination: architect, frontend, backend, security
# Sequential MCP breaks down complex implementation steps
```

### Framework-Specific Implementation

```
/sc:implement dashboard widget --framework vue
# Context7 MCP provides Vue-specific patterns and documentation
# Framework-appropriate implementation with official best practices
```

### Serena-Enhanced Implementation

```
/sc:implement user authentication module --type feature --serena --with-tests
# Uses Serena MCP for semantic analysis and symbol-level understanding
# Leverages project memory for consistent implementation patterns
# Ensures accurate integration with existing codebase structure
```

### Complex Feature with Serena Integration

```
/sc:implement payment processing system --type feature --serena --safe --with-tests
# Multi-persona coordination: architect, frontend, backend, security
# Serena MCP provides deep code understanding and pattern consistency
# Sequential MCP breaks down complex implementation steps
# Persists implementation patterns to project memory for future reference
```

### Windows Korean Encoding Validation Example

```
/sc:implement 사용자 인증 모듈 --type feature --with-tests
# Windows 환경에서 한글 인코딩 검증:
#
# Step 1: CP949 인코딩 테스트
#   - chcp 949 실행하여 Windows 기본 한글 인코딩 설정
#   - 한글 문자 표시 테스트: "테스트" 출력 확인
#   - 한글 파일 경로 처리 확인
#   - 성공 시 CP949로 작업 진행
#
# Step 2: EUC-KR 인코딩 테스트 (CP949 실패 시)
#   - EUC-KR 인코딩 설정 시도
#   - 한글 문자 표시 테스트: "테스트" 출력 확인
#   - 한글 파일 경로 처리 확인
#   - 성공 시 EUC-KR로 작업 진행
#
# Step 3: UTF-8 인코딩 테스트 (EUC-KR 실패 시)
#   - chcp 65001 실행하여 UTF-8 인코딩 설정
#   - 한글 문자 표시 테스트: "테스트" 출력 확인
#   - 한글 파일 경로 처리 확인
#   - 성공 시 UTF-8로 작업 진행
#
# 결과: 한글이 정상적으로 표시되는 인코딩으로 작업 진행
# 생성된 코드의 한글 주석과 문자열이 올바르게 인코딩됨
```

### Korean Code Generation with Encoding Validation

```
/sc:implement 결제 처리 API --type api --framework express
# Windows 환경에서 한글 인코딩 검증 후 코드 생성:
#
# 1. 인코딩 검증: CP949 → EUC-KR → UTF-8 순서로 한글 표시 확인
# 2. 코드 생성: 한글 주석과 문자열이 올바르게 인코딩된 코드 생성
#    - 예: // 결제 처리 함수
#    - 예: const message = "결제가 완료되었습니다";
# 3. 파일 저장: 선택된 인코딩으로 파일 저장
# 4. 검증: 생성된 파일의 한글이 올바르게 표시되는지 확인
#
# 결과: 한글이 정상적으로 표시되는 코드 파일 생성
```

## Boundaries

**Will:**

- Implement features with intelligent persona activation and MCP coordination
- Apply framework-specific best practices and security validation
- Provide comprehensive implementation with testing and documentation integration
- Validate Korean character encoding on Windows (CP949 → EUC-KR → UTF-8 sequential validation)
- Ensure Korean characters display correctly in terminal output and generated files
- Handle Korean file paths correctly with appropriate encoding schemes
- Use Serena MCP for enhanced semantic analysis when `--serena` flag is provided
- Leverage project memory for consistent implementation patterns across sessions

**Will Not:**

- Make architectural decisions without appropriate persona consultation
- Implement features conflicting with security policies or architectural constraints
- Override user-specified safety constraints or bypass quality gates
- Execute terminal commands without validating Korean encoding on Windows (must test CP949 → EUC-KR → UTF-8)
- Generate code with Korean text without encoding validation (must ensure Korean characters are properly encoded)
- Activate Serena MCP without explicit `--serena` flag (maintains backward compatibility)
