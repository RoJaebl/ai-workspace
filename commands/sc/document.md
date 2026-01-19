---
name: document
description: "Generate focused documentation for components, functions, APIs, and features"
category: utility
complexity: basic
mcp-servers: [serena, sequential]
personas: []
---

# /sc:document - Focused Documentation Generation

## Triggers

- Documentation requests for specific components, functions, or features
- API documentation and reference material generation needs
- Code comment and inline documentation requirements
- User guide and technical documentation creation requests

## Usage

```
/sc:document [target] [--type inline|external|api|guide] [--style brief|detailed] [--focus quality|security|performance|architecture] [--loop] [--serena] [--sequential] [--think-hard]
```

**Flags:**

- `--focus [domain]`: 특정 도메인에 집중한 문서화 (quality, security, performance, architecture)
- `--loop`: 반복 개선 사이클 활성화 (검증 게이트 포함)
- `--serena`: Serena MCP 활성화 (심볼 분석, 프로젝트 컨텍스트, 세션 지속성)
- `--sequential`: Sequential Thinking MCP 활성화 (복잡한 문서화 작업의 체계적 다단계 분석 및 계획)
- `--think-hard`: Sequential Thinking의 심층 분석 모드 활성화 (--sequential과 함께 사용)

## Behavioral Flow

1. **Analyze**: Examine target component structure, interfaces, and functionality
   - If `--serena`: Use Serena MCP for semantic code analysis, symbol navigation, and project context understanding
   - If `--sequential`: Use Sequential Thinking MCP for systematic multi-step analysis of complex documentation requirements:
     - Break down large documentation tasks into logical, manageable components
     - Analyze component dependencies and relationships step-by-step
     - Identify documentation scope boundaries and coverage requirements
     - Plan documentation structure with systematic component grouping
   - If `--think-hard`: Apply deep sequential reasoning to understand:
     - Complex documentation dependencies across multiple components
     - Cross-reference requirements and validation needs
     - Comprehensive coverage analysis for multi-audience documentation
     - Integration points with existing documentation ecosystem
   - If `--focus`: Apply domain-specific analysis patterns (quality, security, performance, architecture)
2. **Identify**: Determine documentation requirements and target audience context
   - Serena integration: Leverage project memory and cross-session context for consistency
   - Sequential integration: Use step-by-step reasoning to:
     - Identify documentation gaps through systematic component analysis
     - Prioritize content based on audience needs and component importance
     - Plan comprehensive coverage strategy with logical content organization
     - Validate documentation requirements completeness before generation
3. **Generate**: Create appropriate documentation content based on type and style
   - If `--loop`: Iterative improvement cycles with validation gates
   - If `--sequential`: Generate documentation following a carefully planned sequence:
     - Create content in logical dependency order (prerequisites before advanced topics)
     - Validate each section's structure and completeness before proceeding
     - Ensure consistent terminology and cross-references throughout
     - Apply systematic validation gates at each documentation milestone
4. **Format**: Apply consistent structure and organizational patterns
   - If `--sequential`: Organize documentation systematically:
     - Validate logical flow and information hierarchy
     - Check cross-reference accuracy and completeness
     - Ensure consistent formatting patterns across all sections
     - Apply systematic structure validation before finalization
5. **Integrate**: Ensure compatibility with existing project documentation ecosystem
   - If `--serena`: Persist documentation patterns to project memory for future consistency
   - If `--sequential`: Provide detailed step-by-step reasoning:
     - Document the systematic analysis process and decisions made
     - Provide recommendations based on comprehensive documentation assessment
     - Validate integration consistency with existing documentation standards
     - Generate improvement suggestions through systematic quality evaluation

Key behaviors:

- Code structure analysis with API extraction and usage pattern identification
- Multi-format documentation generation (inline, external, API reference, guides)
- Consistent formatting and cross-reference integration
- Language-specific documentation patterns and conventions
- **Serena Integration**: Semantic understanding, symbol-level analysis, project memory persistence
- **Sequential Thinking Integration**: Systematic multi-step analysis for complex documentation tasks, logical content organization, and comprehensive documentation planning
- **Focus Mode**: Domain-specific documentation patterns and expertise application
- **Loop Mode**: Iterative refinement with quality validation gates

## MCP Integration

- **Serena MCP** (when `--serena` flag is provided):

  - Semantic code analysis and symbol-level understanding
  - Project memory management for documentation pattern consistency
  - Cross-session context persistence for documentation standards
  - LSP functionality for accurate symbol navigation and reference extraction

- **Sequential Thinking MCP** (when `--sequential` flag is provided):
  - Systematic multi-step analysis of complex documentation requirements and large codebases
    - Breaks down large documentation projects into logical, manageable components
    - Analyzes component relationships and dependencies step-by-step
    - Identifies documentation scope boundaries and coverage gaps systematically
  - Logical breakdown of documentation tasks into coherent, structured components
    - Groups related functionality and concepts for optimal documentation organization
    - Plans documentation structure with systematic component hierarchy
    - Ensures logical flow and information architecture consistency
  - Step-by-step reasoning for documentation structure planning and content organization
    - Plans documentation structure with dependency-aware sequencing
    - Organizes content based on learning paths and conceptual dependencies
    - Validates logical flow and information hierarchy before generation
  - Dependency analysis and cross-reference validation through sequential thinking
    - Maps relationships between components, APIs, and concepts
    - Validates cross-reference accuracy and completeness systematically
    - Ensures documentation consistency across related components
  - Comprehensive documentation strategy planning for multi-component systems
    - Plans documentation coverage strategy for large-scale projects
    - Coordinates documentation generation across multiple components
    - Ensures comprehensive coverage without redundancy or gaps
  - Deep reasoning mode (with `--think-hard`) for complex scenarios:
    - Thorough analysis of documentation coverage requirements across multiple audiences
    - Comprehensive dependency mapping for complex multi-component systems
    - Detailed evaluation of integration requirements with existing documentation
    - Systematic assessment of documentation quality and completeness

## Tool Coordination

- **Read**: Component analysis and existing documentation review
- **Grep**: Reference extraction and pattern identification
- **Write**: Documentation file creation with proper formatting
- **Glob**: Multi-file documentation projects and organization
- **Serena Tools** (when `--serena`): Symbol operations, project memory, semantic search
- **Sequential Thinking Tools** (when `--sequential`): Multi-step reasoning, logical analysis, systematic planning, comprehensive documentation assessment
- **sequentialthinking**: Structured reasoning for complex documentation dependency analysis and content organization

## Key Patterns

- **Inline Documentation**: Code analysis → JSDoc/docstring generation → inline comments
- **API Documentation**: Interface extraction → reference material → usage examples
- **User Guides**: Feature analysis → tutorial content → implementation guidance
- **External Docs**: Component overview → detailed specifications → integration instructions
- **Serena-Enhanced Analysis**: Semantic understanding → symbol navigation → project context → memory persistence
- **Sequential Documentation Planning**: Complex requirements → systematic breakdown → dependency analysis → logical structure → comprehensive coverage → validation
- **Multi-Step Documentation Generation**: Requirement analysis → audience assessment → content prioritization → structured generation → cross-reference validation → integration
- **Focus-Driven Documentation**: Domain analysis → expertise application → targeted content generation
- **Sequential Structure Organization**: Component analysis → dependency mapping → logical grouping → systematic documentation generation → consistency validation
- **Step-by-Step Reasoning**: Each documentation decision is validated through systematic analysis before proceeding to next step
- **Iterative Refinement**: Generate → validate → improve → integrate (when `--loop` is active)

## Examples

### Inline Code Documentation

```
/sc:document src/auth/login.js --type inline
# Generates JSDoc comments with parameter and return descriptions
# Adds comprehensive inline documentation for functions and classes
```

### API Reference Generation

```
/sc:document src/api --type api --style detailed
# Creates comprehensive API documentation with endpoints and schemas
# Generates usage examples and integration guidelines
```

### User Guide Creation

```
/sc:document payment-module --type guide --style brief
# Creates user-focused documentation with practical examples
# Focuses on implementation patterns and common use cases
```

### Component Documentation

```
/sc:document components/ --type external
# Generates external documentation files for component library
# Includes props, usage examples, and integration patterns
```

### Serena-Enhanced Documentation

```
/sc:document src/auth --serena --focus quality
# Uses Serena MCP for semantic analysis and symbol-level understanding
# Applies quality-focused documentation patterns
# Persists documentation standards to project memory
```

### Iterative Documentation with Focus

```
/sc:document @implement.md --focus quality --loop --serena
# Analyzes implement.md with quality focus
# Uses Serena for comprehensive code understanding
# Iteratively improves documentation with validation gates
# Maintains consistency through project memory
```

### Sequential Thinking for Complex Multi-Component Documentation

```
/sc:document src/api --type api --sequential
# Uses Sequential Thinking MCP for systematic analysis:
#
# Step 1: Component Analysis
#   - Analyzes all API endpoints and their relationships
#   - Identifies endpoint groups by functionality (auth, users, payments)
#   - Maps dependencies between endpoints and data models
#
# Step 2: Structure Planning
#   - Plans documentation structure: Overview → Auth → Core APIs → Models → Errors
#   - Ensures prerequisites are documented before dependent content
#   - Validates logical flow and information hierarchy
#
# Step 3: Content Generation
#   - Generates documentation in planned sequence
#   - Validates each section before proceeding to next
#   - Ensures cross-references are accurate and complete
#
# Step 4: Integration Validation
#   - Validates consistency across all documentation sections
#   - Checks cross-reference accuracy and completeness
#   - Ensures comprehensive coverage without gaps
#
# Result: Well-structured API documentation with logical flow and accurate cross-references
```

### Deep Sequential Analysis with Think-Hard

```
/sc:document src/auth --type guide --sequential --think-hard
# Applies deep sequential reasoning for complex documentation:
#
# Deep Analysis Phase:
#   1. Audience Analysis: Identifies multiple audience types (developers, security, ops)
#      - Analyzes each audience's knowledge prerequisites
#      - Maps learning paths for different skill levels
#   2. Requirement Analysis: Comprehensive coverage assessment
#      - Identifies all documentation requirements systematically
#      - Evaluates content gaps and redundancy risks
#      - Plans coverage strategy for complete documentation
#   3. Dependency Mapping: Complex relationship analysis
#      - Maps conceptual dependencies (auth concepts → implementation)
#      - Analyzes cross-component relationships (auth ↔ user management)
#      - Validates documentation order based on dependencies
#   4. Structure Planning: Detailed organization strategy
#      - Plans documentation structure with multiple learning paths
#      - Ensures logical flow for different audience types
#      - Validates information architecture consistency
#   5. Integration Assessment: Comprehensive validation
#      - Evaluates integration with existing documentation
#      - Validates consistency with project documentation standards
#      - Ensures cross-reference accuracy across documentation ecosystem
#
# Output: Detailed reasoning chain visible in output, showing systematic analysis process
```

### Sequential Analysis for Large-Scale Documentation

```
/sc:document components/ --type external --sequential --style detailed
# Uses Sequential Thinking MCP to plan comprehensive documentation:
#
# Phase 1: Component Discovery and Analysis
#   - Systematically analyzes all components in the directory
#   - Identifies component categories and relationships
#   - Maps component dependencies and usage patterns
#
# Phase 2: Documentation Gap Analysis
#   - Identifies undocumented components systematically
#   - Evaluates existing documentation quality and completeness
#   - Prioritizes documentation needs based on component importance
#
# Phase 3: Structure Planning
#   - Groups related components for logical documentation organization
#   - Plans documentation structure: Overview → Categories → Components → Examples
#   - Ensures consistent documentation format across all components
#
# Phase 4: Generation and Validation
#   - Generates documentation following planned structure
#   - Validates consistency and completeness at each milestone
#   - Ensures proper cross-referencing between related components
#   - Validates cross-reference accuracy and link integrity
#
# Result: Comprehensive component documentation with consistent structure and accurate cross-references
```

### Combined Serena and Sequential Analysis

```
/sc:document src/auth --serena --sequential --focus quality
# Combines semantic understanding with systematic reasoning:
# - Serena provides symbol-level code understanding and project context
# - Sequential Thinking provides logical documentation structure and planning
# - Generates comprehensive documentation with both semantic and structural insights
# - Ensures consistency through project memory and systematic analysis
# - Best for complex multi-component systems requiring both deep understanding and structured organization
```

## Boundaries

**Will:**

- Generate focused documentation for specific components and features
- Create multiple documentation formats based on target audience needs
- Integrate with existing documentation ecosystems and maintain consistency
- Use Serena MCP for enhanced semantic analysis when `--serena` flag is provided
- Use Sequential Thinking MCP for systematic multi-step analysis when `--sequential` flag is provided
- Apply deep sequential reasoning for complex documentation tasks when `--think-hard` flag is used with `--sequential`
- Break down complex documentation requirements into logical components and generate comprehensive documentation strategies
- Provide step-by-step reasoning and validation for complex documentation structures
- Apply domain-specific patterns when `--focus` flag is specified
- Perform iterative improvement cycles when `--loop` flag is active

**Will Not:**

- Generate documentation without proper code analysis and context understanding
- Override existing documentation standards or project-specific conventions
- Create documentation that exposes sensitive implementation details
- Activate Serena MCP without explicit `--serena` flag (maintains backward compatibility)
- Activate Sequential Thinking MCP without explicit `--sequential` flag (maintains backward compatibility)
