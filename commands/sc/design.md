---
name: design
description: "Design system architecture, APIs, and component interfaces with comprehensive specifications"
category: utility
complexity: basic
mcp-servers: [serena, sequential]
personas: []
---

# /sc:design - System and Component Design

## Triggers

- Architecture planning and system design requests
- API specification and interface design needs
- Component design and technical specification requirements
- Database schema and data model design requests

## Usage

```
/sc:design [target] [--type architecture|api|component|database] [--format diagram|spec|code] [--serena] [--sequential] [--think-hard]
```

**Flags:**

- `--serena`: Serena MCP 활성화 (심볼 분석, 프로젝트 컨텍스트, 설계 패턴 메모리)
- `--sequential`: Sequential Thinking MCP 활성화 (복잡한 설계 작업의 체계적 다단계 분석 및 계획)
- `--think-hard`: Sequential Thinking의 심층 분석 모드 활성화 (--sequential과 함께 사용)

## Behavioral Flow

1. **Analyze**: Examine target requirements and existing system context
   - If `--serena`: Use Serena MCP for semantic code analysis, symbol navigation, and project context understanding
   - If `--sequential`: Use Sequential Thinking MCP for systematic multi-step analysis of complex design requirements:
     - Break down large design tasks into logical, manageable components
     - Analyze component dependencies and relationships step-by-step
     - Identify design scope boundaries and integration requirements
     - Plan design structure with systematic component grouping
   - If `--think-hard`: Apply deep sequential reasoning to understand:
     - Complex design dependencies across multiple components
     - Cross-component integration requirements and validation needs
     - Comprehensive architecture analysis for multi-layer systems
     - Integration points with existing system architecture
2. **Plan**: Define design approach and structure based on type and format
   - Serena integration: Leverage project memory and cross-session context for design pattern consistency
   - Sequential integration: Use step-by-step reasoning to:
     - Identify design gaps through systematic component analysis
     - Prioritize design elements based on system importance and dependencies
     - Plan comprehensive design strategy with logical structure organization
     - Validate design requirements completeness before creation
3. **Design**: Create comprehensive specifications with industry best practices
   - If `--sequential`: Generate design following a carefully planned sequence:
     - Create specifications in logical dependency order (foundation before dependent components)
     - Validate each design element's structure and completeness before proceeding
     - Ensure consistent patterns and cross-references throughout
     - Apply systematic validation gates at each design milestone
4. **Validate**: Ensure design meets requirements and maintainability standards
   - If `--sequential`: Validate design systematically:
     - Check logical flow and architectural hierarchy
     - Validate cross-component integration accuracy and completeness
     - Ensure consistent design patterns across all components
     - Apply systematic structure validation before finalization
5. **Document**: Generate clear design documentation with diagrams and specifications
   - If `--serena`: Persist design patterns to project memory for future consistency
   - If `--sequential`: Provide detailed step-by-step reasoning:
     - Document the systematic analysis process and design decisions made
     - Provide recommendations based on comprehensive design assessment
     - Validate integration consistency with existing system architecture
     - Generate improvement suggestions through systematic quality evaluation

Key behaviors:

- Requirements-driven design approach with scalability considerations
- Industry best practices integration for maintainable solutions
- Multi-format output (diagrams, specifications, code) based on needs
- Validation against existing system architecture and constraints
- **Serena Integration**: Semantic understanding, symbol-level analysis, project memory persistence for design patterns
- **Sequential Thinking Integration**: Systematic multi-step analysis for complex design tasks, logical structure organization, and comprehensive architecture planning
- **Deep Analysis Mode**: Thorough evaluation of design dependencies and integration requirements when `--think-hard` is used with `--sequential`

## MCP Integration

- **Serena MCP** (when `--serena` flag is provided):

  - Semantic code analysis and symbol-level understanding for design context
  - Project memory management for design pattern consistency
  - Cross-session context persistence for architectural standards
  - LSP functionality for accurate symbol navigation and dependency extraction
  - Design pattern recognition and reuse from project history

- **Sequential Thinking MCP** (when `--sequential` flag is provided):
  - Systematic multi-step analysis of complex design requirements and large systems
    - Breaks down large design projects into logical, manageable components
    - Analyzes component relationships and dependencies step-by-step
    - Identifies design scope boundaries and integration gaps systematically
  - Logical breakdown of design tasks into coherent, structured components
    - Groups related functionality and concepts for optimal design organization
    - Plans design structure with systematic component hierarchy
    - Ensures logical flow and architectural consistency
  - Step-by-step reasoning for design structure planning and architecture organization
    - Plans design structure with dependency-aware sequencing
    - Organizes components based on architectural layers and dependencies
    - Validates logical flow and architectural hierarchy before generation
  - Dependency analysis and integration validation through sequential thinking
    - Maps relationships between components, APIs, and system layers
    - Validates integration accuracy and completeness systematically
    - Ensures design consistency across related components
  - Comprehensive architecture strategy planning for multi-component systems
    - Plans design coverage strategy for large-scale projects
    - Coordinates design generation across multiple system layers
    - Ensures comprehensive coverage without redundancy or gaps
  - Deep reasoning mode (with `--think-hard`) for complex scenarios:
    - Thorough analysis of architecture requirements across multiple system layers
    - Comprehensive dependency mapping for complex multi-component systems
    - Detailed evaluation of integration requirements with existing architecture
    - Systematic assessment of design quality and architectural consistency

## Tool Coordination

- **Read**: Requirements analysis and existing system examination
- **Grep/Glob**: Pattern analysis and system structure investigation
- **Write**: Design documentation and specification generation
- **Bash**: External design tool integration when needed
- **Serena Tools** (when `--serena`): Symbol operations, project memory, semantic search, design pattern analysis
- **Sequential Thinking Tools** (when `--sequential`): Multi-step reasoning, logical analysis, systematic planning, comprehensive design assessment
- **sequentialthinking**: Structured reasoning for complex design dependency analysis and architecture organization

## Key Patterns

- **Architecture Design**: Requirements → system structure → scalability planning
- **API Design**: Interface specification → RESTful/GraphQL patterns → documentation
- **Component Design**: Functional requirements → interface design → implementation guidance
- **Database Design**: Data requirements → schema design → relationship modeling
- **Serena-Enhanced Analysis**: Semantic understanding → symbol navigation → project context → design pattern memory persistence
- **Sequential Design Planning**: Complex requirements → systematic breakdown → dependency analysis → logical structure → comprehensive architecture → validation
- **Multi-Step Design Generation**: Requirement analysis → component assessment → design prioritization → structured generation → integration validation → documentation
- **Sequential Architecture Organization**: Component analysis → dependency mapping → logical grouping → systematic design generation → consistency validation
- **Step-by-Step Reasoning**: Each design decision is validated through systematic analysis before proceeding to next step

## Examples

### System Architecture Design

```
/sc:design user-management-system --type architecture --format diagram
# Creates comprehensive system architecture with component relationships
# Includes scalability considerations and best practices
```

### API Specification Design

```
/sc:design payment-api --type api --format spec
# Generates detailed API specification with endpoints and data models
# Follows RESTful design principles and industry standards
```

### Component Interface Design

```
/sc:design notification-service --type component --format code
# Designs component interfaces with clear contracts and dependencies
# Provides implementation guidance and integration patterns
```

### Database Schema Design

```
/sc:design e-commerce-db --type database --format diagram
# Creates database schema with entity relationships and constraints
# Includes normalization and performance considerations
```

### Serena-Enhanced Architecture Design

```
/sc:design user-management-system --type architecture --serena
# Uses Serena MCP for semantic analysis and symbol-level understanding
# Applies architectural patterns from project memory
# Persists design decisions to project memory for consistency
```

### Sequential Thinking for Complex Multi-Component Design

```
/sc:design payment-system --type architecture --sequential
# Uses Sequential Thinking MCP for systematic analysis:
#
# Step 1: Component Analysis
#   - Analyzes all system components and their relationships
#   - Identifies component groups by functionality (payment, auth, notification)
#   - Maps dependencies between components and data flows
#
# Step 2: Architecture Planning
#   - Plans design structure: Overview → Core Services → APIs → Data Models → Integration
#   - Ensures foundational components are designed before dependent ones
#   - Validates logical flow and architectural hierarchy
#
# Step 3: Design Generation
#   - Generates design specifications in planned sequence
#   - Validates each component design before proceeding to next
#   - Ensures consistent patterns and cross-references throughout
#
# Step 4: Integration Validation
#   - Validates consistency across all design components
#   - Checks integration accuracy and completeness
#   - Ensures comprehensive coverage without gaps
#
# Result: Well-structured architecture design with logical flow and accurate component relationships
```

### Deep Sequential Analysis with Think-Hard

```
/sc:design microservices-platform --type architecture --sequential --think-hard
# Applies deep sequential reasoning for complex architecture:
#
# Deep Analysis Phase:
#   1. System Layer Analysis: Identifies multiple architectural layers (API, service, data)
#      - Analyzes each layer's requirements and constraints
#      - Maps dependencies between layers and components
#   2. Requirement Analysis: Comprehensive coverage assessment
#      - Identifies all design requirements systematically
#      - Evaluates design gaps and integration risks
#      - Plans coverage strategy for complete architecture
#   3. Dependency Mapping: Complex relationship analysis
#      - Maps architectural dependencies (services → APIs → data)
#      - Analyzes cross-service relationships and communication patterns
#      - Validates design order based on dependencies
#   4. Structure Planning: Detailed organization strategy
#      - Plans architecture structure with multiple integration paths
#      - Ensures logical flow for different system layers
#      - Validates architectural consistency
#   5. Integration Assessment: Comprehensive validation
#      - Evaluates integration with existing system architecture
#      - Validates consistency with project architectural standards
#      - Ensures cross-reference accuracy across design ecosystem
#
# Output: Detailed reasoning chain visible in output, showing systematic analysis process
```

### Sequential Analysis for Large-Scale API Design

```
/sc:design api-gateway --type api --sequential --format spec
# Uses Sequential Thinking MCP to plan comprehensive API design:
#
# Phase 1: Endpoint Discovery and Analysis
#   - Systematically analyzes all API endpoints and their relationships
#   - Identifies endpoint categories and dependencies
#   - Maps endpoint dependencies and data models
#
# Phase 2: Design Gap Analysis
#   - Identifies undocumented endpoints systematically
#   - Evaluates existing API design quality and completeness
#   - Prioritizes design needs based on endpoint importance
#
# Phase 3: Structure Planning
#   - Groups related endpoints for logical API organization
#   - Plans API structure: Overview → Auth → Core APIs → Models → Errors
#   - Ensures consistent API design patterns across all endpoints
#
# Phase 4: Generation and Validation
#   - Generates API specifications following planned structure
#   - Validates consistency and completeness at each milestone
#   - Ensures proper relationships between related endpoints
#   - Validates integration accuracy and API contract integrity
#
# Result: Comprehensive API design with consistent structure and accurate endpoint relationships
```

### Combined Serena and Sequential Analysis

```
/sc:design notification-service --type component --serena --sequential
# Combines semantic understanding with systematic reasoning:
# - Serena provides symbol-level code understanding and project context
# - Sequential Thinking provides logical design structure and planning
# - Generates comprehensive design with both semantic and structural insights
# - Ensures consistency through project memory and systematic analysis
# - Best for complex multi-component systems requiring both deep understanding and structured organization
```

## Boundaries

**Will:**

- Create comprehensive design specifications with industry best practices
- Generate multiple format outputs (diagrams, specs, code) based on requirements
- Validate designs against maintainability and scalability standards
- Use Serena MCP for enhanced semantic analysis when `--serena` flag is provided
- Use Sequential Thinking MCP for systematic multi-step analysis when `--sequential` flag is provided
- Apply deep sequential reasoning for complex design tasks when `--think-hard` flag is used with `--sequential`
- Break down complex design requirements into logical components and generate comprehensive architecture strategies
- Provide step-by-step reasoning and validation for complex design structures

**Will Not:**

- Generate actual implementation code (use /sc:implement for implementation)
- Modify existing system architecture without explicit design approval
- Create designs that violate established architectural constraints
- Activate Serena MCP without explicit `--serena` flag (maintains backward compatibility)
- Activate Sequential Thinking MCP without explicit `--sequential` flag (maintains backward compatibility)
