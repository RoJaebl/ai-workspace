---
name: analyze
description: "Comprehensive code analysis across quality, security, performance, and architecture domains"
category: utility
complexity: basic
mcp-servers: [serena, sequential, playwright]
personas: []
---

# /sc:analyze - Code Analysis and Quality Assessment

## Triggers

- Code quality assessment requests for projects or specific components
- Security vulnerability scanning and compliance validation needs
- Performance bottleneck identification and optimization planning
- Architecture review and technical debt assessment requirements

## Usage

```
/sc:analyze [target] [--focus quality|security|performance|architecture] [--depth quick|deep] [--format text|json|report] [--serena] [--sequential] [--think-hard] [--playwright]
```

**Flags:**

- `--serena`: Serena MCP 활성화 (심볼 분석, 프로젝트 컨텍스트, 의미론적 코드 분석)
- `--sequential`: Sequential Thinking MCP 활성화 (복잡한 코드 분석 작업의 체계적 다단계 분석 및 계획)
- `--think-hard`: Sequential Thinking의 심층 분석 모드 활성화 (--sequential과 함께 사용)
- `--playwright`: Playwright MCP 활성화 (브라우저 기반 동적 분석, UI 컴포넌트 검증, 런타임 동작 분석)

## Behavioral Flow

1. **Discover**: Categorize source files using language detection and project analysis
   - If `--serena`: Use Serena MCP for semantic code understanding, symbol navigation, and project context analysis
   - If `--sequential`: Use Sequential Thinking MCP for systematic multi-step analysis of complex codebases:
     - Break down large codebases into logical, manageable components
     - Analyze component relationships and dependencies step-by-step
     - Identify analysis scope boundaries and coverage requirements
     - Plan analysis strategy with systematic component grouping
   - If `--think-hard`: Apply deep sequential reasoning to understand:
     - Complex code dependencies across multiple components and modules
     - Cross-domain impact assessment and validation requirements
     - Comprehensive analysis strategy for multi-domain codebases
     - Integration points with existing code patterns and architectural decisions
2. **Scan**: Apply domain-specific analysis techniques and pattern matching
   - If `--serena`: Leverage symbol-level analysis for deeper understanding of code relationships and dependencies
   - Serena integration: Use project memory for consistent analysis patterns and historical context
   - If `--sequential`: Apply analysis techniques following a carefully planned sequence:
     - Analyze components in logical dependency order (foundational components before dependent ones)
     - Validate each component's analysis completeness before proceeding
     - Ensure consistent analysis patterns and categorization throughout
     - Apply systematic validation gates at each analysis milestone
   - If `--playwright`: Use Playwright MCP for browser-based dynamic analysis:
     - Launch application in real browser environment for runtime behavior analysis
     - Capture UI component rendering and interaction patterns
     - Analyze accessibility compliance through browser automation
     - Validate security vulnerabilities through browser-based testing
     - Measure performance metrics in actual browser runtime
3. **Evaluate**: Generate prioritized findings with severity ratings and impact assessment
   - If `--serena`: Assess symbol-level impact and cross-reference dependencies for accurate severity assessment
   - If `--playwright`: Evaluate runtime behavior and UI interactions:
     - Assess UI component behavior and accessibility compliance
     - Validate security vulnerabilities through browser-based testing
     - Measure actual performance metrics in browser environment
     - Identify runtime issues not detectable through static analysis
   - If `--sequential`: Evaluate findings systematically:
     - Prioritize findings based on dependency relationships and impact scope
     - Validate severity ratings through systematic impact analysis
     - Ensure consistent severity assessment patterns across all findings
     - Apply systematic evaluation validation before recommendation generation
4. **Recommend**: Create actionable recommendations with implementation guidance
   - If `--serena`: Provide symbol-aware recommendations based on semantic understanding of code structure
   - If `--playwright`: Provide browser-validated recommendations:
     - Include recommendations based on actual runtime behavior observations
     - Provide UI/UX improvement suggestions validated through browser testing
     - Include accessibility fixes validated through browser automation
     - Provide performance optimization recommendations based on browser metrics
   - If `--sequential`: Generate recommendations following a logical sequence:
     - Prioritize recommendations based on dependency relationships and impact
     - Validate recommendation completeness through systematic analysis
     - Ensure consistent recommendation format and categorization throughout
     - Apply systematic recommendation validation before report generation
5. **Report**: Present comprehensive analysis with metrics and improvement roadmap
   - If `--serena`: Persist analysis patterns to project memory for future consistency and trend tracking
   - If `--sequential`: Provide detailed step-by-step reasoning:
     - Document the systematic analysis process and decisions made
     - Provide recommendations based on comprehensive code assessment
     - Validate report consistency with existing analysis standards
     - Generate improvement suggestions through systematic quality evaluation

Key behaviors:

- Multi-domain analysis combining static analysis and heuristic evaluation
- Intelligent file discovery and language-specific pattern recognition
- Severity-based prioritization of findings and recommendations
- Comprehensive reporting with metrics, trends, and actionable insights
- **Serena Integration**: Semantic understanding, symbol-level analysis, project memory persistence, cross-session context
- **Sequential Thinking Integration**: Systematic multi-step analysis for complex codebases, logical component organization, and comprehensive analysis strategy planning
- **Playwright Integration**: Browser-based dynamic analysis, UI component validation, runtime behavior assessment, accessibility compliance testing, and performance measurement in actual browser environment

## MCP Integration

- **Serena MCP** (when `--serena` flag is provided):

  - Semantic code analysis and symbol-level understanding for comprehensive assessment
  - Symbol navigation and dependency analysis for accurate impact assessment
  - Project memory management for analysis pattern consistency and historical tracking
  - Cross-session context persistence for analysis standards and trend identification
  - LSP functionality for accurate symbol navigation, reference extraction, and code relationship mapping
  - Deep code understanding through semantic analysis of functions, classes, and their interactions

- **Sequential Thinking MCP** (when `--sequential` flag is provided):

  - Systematic multi-step analysis of complex codebases and large projects
    - Breaks down large codebases into logical, manageable components
    - Analyzes component relationships and dependencies step-by-step
    - Identifies analysis scope boundaries and coverage gaps systematically
  - Logical breakdown of analysis tasks into coherent, structured components
    - Groups related code components for optimal analysis organization
    - Plans analysis strategy with systematic component hierarchy
    - Ensures logical analysis sequence and dependency relationships
  - Step-by-step reasoning for analysis strategy planning and component organization
    - Plans analysis sequence with dependency-aware component grouping
    - Organizes analysis based on logical relationships and impact scope
    - Validates analysis requirements and component categorization before execution
  - Dependency analysis and impact validation through sequential thinking
    - Maps relationships between code components, modules, and their dependencies
    - Validates analysis grouping accuracy and completeness systematically
    - Ensures analysis consistency across related components
  - Comprehensive analysis strategy planning for multi-domain codebases
    - Plans analysis strategy for large-scale projects across multiple domains
    - Coordinates analysis across multiple components and modules
    - Ensures comprehensive coverage without redundancy or gaps
  - Deep reasoning mode (with `--think-hard`) for complex scenarios:
    - Thorough analysis of code dependencies across multiple components and modules
    - Comprehensive impact mapping for complex multi-domain codebases
    - Detailed evaluation of analysis requirements with existing code patterns and architectural decisions
    - Systematic assessment of analysis quality and completeness across domains

- **Playwright MCP** (when `--playwright` flag is provided):
  - Browser-based dynamic analysis and runtime behavior assessment
    - Launches application in real browser environment for actual runtime analysis
    - Captures UI component rendering, interaction patterns, and accessibility compliance
    - Validates security vulnerabilities through browser-based testing and interaction simulation
    - Measures performance metrics in actual browser runtime environment
  - UI component validation and interaction testing
    - Tests UI components in real browser environment for accurate behavior assessment
    - Validates accessibility compliance through browser automation and accessibility tree analysis
    - Identifies UI/UX issues through actual user interaction simulation
    - Captures screenshots and snapshots for visual regression analysis
  - Runtime security analysis through browser automation
    - Tests security vulnerabilities through browser-based attack simulation
    - Validates XSS, CSRF, and other client-side security issues in actual browser environment
    - Analyzes network requests and responses for security assessment
    - Tests authentication and authorization flows through browser automation
  - Performance analysis in browser environment
    - Measures actual page load times, rendering performance, and runtime metrics
    - Analyzes JavaScript execution performance and memory usage in browser
    - Identifies performance bottlenecks through browser performance profiling
    - Validates performance optimizations in actual browser runtime
  - Cross-browser compatibility analysis
    - Tests application behavior across different browser engines
    - Validates compatibility issues and browser-specific behaviors
    - Identifies cross-browser rendering and functionality differences

## Tool Coordination

- **Glob**: File discovery and project structure analysis
- **Grep**: Pattern analysis and code search operations
- **Read**: Source code inspection and configuration analysis
- **Bash**: External analysis tool execution and validation
- **Write**: Report generation and metrics documentation
- **Serena Tools** (when `--serena`): Symbol operations, project memory, semantic search, code navigation, dependency analysis
- **Sequential Thinking Tools** (when `--sequential`): Multi-step reasoning, logical analysis, systematic planning, comprehensive code assessment
- **sequentialthinking**: Structured reasoning for complex code dependency analysis and analysis strategy organization
- **Playwright Tools** (when `--playwright`): Browser automation, page navigation, element interaction, screenshot capture, network monitoring, performance profiling, accessibility testing

## Key Patterns

- **Domain Analysis**: Quality/Security/Performance/Architecture → specialized assessment
- **Pattern Recognition**: Language detection → appropriate analysis techniques
- **Severity Assessment**: Issue classification → prioritized recommendations
- **Report Generation**: Analysis results → structured documentation
- **Serena-Enhanced Analysis**: Semantic understanding → symbol navigation → dependency mapping → comprehensive assessment
- **Pattern Consistency**: Cross-session memory → analysis standards → trend identification → historical context
- **Sequential Analysis Planning**: Complex codebases → systematic breakdown → dependency analysis → logical grouping → comprehensive analysis strategy → validation
- **Multi-Step Code Analysis**: Code discovery → dependency mapping → impact assessment → categorization → finding prioritization → recommendation generation
- **Sequential Component Organization**: Component analysis → dependency mapping → logical grouping → systematic analysis generation → consistency validation
- **Step-by-Step Reasoning**: Each analysis decision is validated through systematic analysis before proceeding to next step
- **Browser-Based Dynamic Analysis**: Static analysis → browser launch → runtime behavior capture → UI validation → accessibility testing → performance measurement → comprehensive assessment
- **Playwright-Enhanced Analysis**: Code analysis → browser validation → runtime behavior assessment → UI/UX evaluation → security testing → performance profiling → actionable recommendations

## Examples

### Comprehensive Project Analysis

```
/sc:analyze
# Multi-domain analysis of entire project
# Generates comprehensive report with key findings and roadmap
```

### Focused Security Assessment

```
/sc:analyze src/auth --focus security --depth deep
# Deep security analysis of authentication components
# Vulnerability assessment with detailed remediation guidance
```

### Performance Optimization Analysis

```
/sc:analyze --focus performance --format report
# Performance bottleneck identification
# Generates HTML report with optimization recommendations
```

### Quick Quality Check

```
/sc:analyze src/components --focus quality --depth quick
# Rapid quality assessment of component directory
# Identifies code smells and maintainability issues
```

### Serena-Enhanced Security Analysis

```
/sc:analyze src/auth --focus security --depth deep --serena
# Uses Serena MCP for semantic analysis and symbol-level understanding
# Identifies security vulnerabilities through deep code relationship analysis
# Assesses impact across symbol dependencies and cross-references
# Persists security patterns to project memory for future analysis
```

### Semantic Architecture Review

```
/sc:analyze --focus architecture --serena --format report
# Comprehensive architecture analysis with semantic understanding
# Maps symbol relationships and dependencies across the codebase
# Identifies architectural patterns and anti-patterns through code structure analysis
# Generates detailed report with symbol-level insights
```

### Quality Analysis with Project Context

```
/sc:analyze src/api --focus quality --serena --depth deep
# Leverages project memory for consistent quality assessment patterns
# Uses semantic understanding to identify code quality issues
# Provides symbol-aware recommendations based on code structure
# Maintains analysis consistency through cross-session context
```

### Sequential Thinking for Complex Multi-Domain Analysis

```
/sc:analyze src --sequential --depth deep
# Uses Sequential Thinking MCP for systematic analysis:
#
# Step 1: Component Discovery
#   - Analyzes all components and their relationships
#   - Identifies component groups by domain (auth, api, ui, utils)
#   - Maps dependencies between components and modules
#
# Step 2: Analysis Strategy Planning
#   - Plans analysis sequence: Foundation → Core → Features → Integration
#   - Ensures foundational components are analyzed before dependent ones
#   - Validates logical grouping and component categorization
#
# Step 3: Domain-Specific Analysis
#   - Applies analysis techniques following planned sequence
#   - Validates each component's analysis completeness before proceeding
#   - Ensures consistent analysis patterns and categorization
#
# Step 4: Findings Integration
#   - Validates consistency across all analysis findings
#   - Checks severity rating accuracy and completeness
#   - Ensures comprehensive coverage without gaps
#
# Result: Well-organized analysis with logical sequence and consistent findings
```

### Deep Sequential Analysis with Think-Hard for Large Codebase

```
/sc:analyze --focus architecture --sequential --think-hard --depth deep
# Applies deep sequential reasoning for complex codebase analysis:
#
# Deep Analysis Phase:
#   1. Codebase Discovery: Identifies all components systematically
#      - Analyzes component relationships and dependencies
#      - Maps architectural boundaries and impact scope
#   2. Dependency Analysis: Comprehensive relationship mapping
#      - Identifies component dependencies (module A depends on module B)
#      - Evaluates impact scope and affected components
#      - Plans analysis order based on dependency relationships
#   3. Domain Categorization Strategy: Detailed component grouping
#      - Groups components by domain (quality, security, performance, architecture)
#      - Plans analysis sequence: Core → Features → Integration → Tests
#      - Validates component categorization consistency
#   4. Analysis Strategy Planning: Detailed organization strategy
#      - Plans analysis sequence with multiple logical groups
#      - Ensures proper component grouping for different analysis domains
#      - Validates analysis requirements completeness
#   5. Architectural Assessment: Comprehensive validation
#      - Evaluates integration with existing architectural patterns
#      - Validates consistency with project analysis standards
#      - Ensures analysis strategy aligns with architectural requirements
#
# Output: Detailed reasoning chain visible in output, showing systematic analysis process
```

### Sequential Analysis for Multi-Domain Security Assessment

```
/sc:analyze src/auth --focus security --sequential --depth deep
# Uses Sequential Thinking MCP to plan comprehensive security analysis:
#
# Phase 1: Component Discovery and Analysis
#   - Systematically analyzes all authentication components
#   - Identifies security-related patterns and relationships
#   - Maps component dependencies and security boundaries
#
# Phase 2: Security Pattern Analysis
#   - Groups related security components for logical analysis organization
#   - Evaluates security dependencies and impact scope
#   - Prioritizes security analysis based on dependency relationships
#
# Phase 3: Analysis Strategy Planning
#   - Plans analysis sequence: Core Security → Authentication → Authorization → Session Management
#   - Ensures consistent security analysis format across all components
#   - Validates logical flow and security pattern categorization
#
# Phase 4: Findings Validation
#   - Validates security analysis consistency and completeness
#   - Checks vulnerability assessment accuracy and dependency relationships
#   - Ensures comprehensive security coverage without redundancy
#   - Validates severity rating requirements and categorization
#
# Result: Comprehensive security analysis with consistent structure and logical sequence
```

### Combined Serena and Sequential Analysis

```
/sc:analyze src/api --focus quality --serena --sequential --depth deep
# Combines semantic understanding with systematic reasoning:
# - Serena provides symbol-level code understanding and impact assessment
# - Sequential Thinking provides logical analysis strategy and component organization
# - Generates comprehensive analysis with both semantic and structural insights
# - Ensures consistency through project memory and systematic analysis
# - Best for complex multi-component codebases requiring both deep understanding and structured organization
```

### Playwright-Enhanced UI Component Analysis

```
/sc:analyze src/components --focus quality --playwright
# Uses Playwright MCP for browser-based dynamic analysis:
# - Launches application in real browser environment
# - Tests UI components in actual browser runtime
# - Validates accessibility compliance through browser automation
# - Captures screenshots for visual regression analysis
# - Measures performance metrics in browser environment
# - Identifies runtime issues not detectable through static analysis
```

### Browser-Based Security Analysis

```
/sc:analyze src/auth --focus security --playwright --depth deep
# Uses Playwright MCP for browser-based security testing:
# - Tests security vulnerabilities through browser automation
# - Validates XSS, CSRF, and client-side security issues
# - Analyzes network requests and responses for security assessment
# - Tests authentication and authorization flows
# - Identifies security issues through actual browser interaction
```

### Performance Analysis with Browser Validation

```
/sc:analyze --focus performance --playwright --format report
# Uses Playwright MCP for browser-based performance analysis:
# - Measures actual page load times and rendering performance
# - Analyzes JavaScript execution performance in browser
# - Identifies performance bottlenecks through browser profiling
# - Validates performance optimizations in actual runtime
# - Generates performance report with browser-validated metrics
```

### Accessibility Analysis with Playwright

```
/sc:analyze src/ui --focus quality --playwright
# Uses Playwright MCP for accessibility compliance testing:
# - Tests accessibility through browser automation
# - Validates accessibility tree and ARIA attributes
# - Identifies accessibility issues through browser testing
# - Provides accessibility recommendations based on browser validation
```

### Combined Static and Dynamic Analysis

```
/sc:analyze src --focus quality --serena --playwright --depth deep
# Combines static and dynamic analysis:
# - Serena provides symbol-level code understanding
# - Playwright validates runtime behavior in browser environment
# - Generates comprehensive analysis with both static and dynamic insights
# - Best for web applications requiring both code analysis and runtime validation
```

### Full-Stack Analysis with Playwright

```
/sc:analyze --focus architecture --playwright --sequential --depth deep
# Uses Playwright with Sequential Thinking for comprehensive analysis:
# - Sequential Thinking plans systematic analysis strategy
# - Playwright validates runtime behavior at each analysis milestone
# - Combines structured analysis with browser-based validation
# - Ensures comprehensive coverage with both static and dynamic insights
```

## Boundaries

**Will:**

- Perform comprehensive static code analysis across multiple domains
- Generate severity-rated findings with actionable recommendations
- Provide detailed reports with metrics and improvement guidance
- Use Serena MCP for enhanced semantic analysis when `--serena` flag is provided
- Leverage symbol-level understanding for accurate impact assessment and dependency analysis
- Utilize project memory for consistent analysis patterns and historical context tracking
- Use Sequential Thinking MCP for systematic multi-step analysis when `--sequential` flag is provided
- Apply deep sequential reasoning for complex codebase analysis when `--think-hard` flag is used with `--sequential`
- Break down complex codebases into logical components and generate comprehensive analysis strategies
- Provide step-by-step reasoning and validation for complex analysis structures
- Use Playwright MCP for browser-based dynamic analysis when `--playwright` flag is provided
- Perform runtime behavior assessment, UI component validation, and accessibility testing through browser automation
- Validate security vulnerabilities and measure performance metrics in actual browser environment

**Will Not:**

- Execute dynamic analysis requiring code compilation or runtime (unless `--playwright` flag is provided)
- Modify source code or apply fixes without explicit user consent
- Analyze external dependencies beyond import and usage patterns
- Activate Serena MCP without explicit `--serena` flag (maintains backward compatibility)
- Activate Sequential Thinking MCP without explicit `--sequential` flag (maintains backward compatibility)
- Activate Playwright MCP without explicit `--playwright` flag (maintains backward compatibility)
