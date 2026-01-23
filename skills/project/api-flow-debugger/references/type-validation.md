# Type Validation Reference

This document provides detailed information about type validation algorithms and patterns used to detect inconsistencies between DTO, Model, and Presenter types.

## Table of Contents

1. [Validation Strategy](#validation-strategy)
2. [Field Comparison Algorithm](#field-comparison-algorithm)
3. [Common Field Mappings](#common-field-mappings)
4. [Type Mismatch Patterns](#type-mismatch-patterns)
5. [Adapter Validation](#adapter-validation)
6. [Mapper Validation](#mapper-validation)

## Validation Strategy

Type validation follows this hierarchy:

```
CMS API Response (JSON)
    ↓
DTO (*.dto.ts) ← Validate field names and types
    ↓ [Adapter]
Model (*.model.ts) ← Validate field names and types
    ↓ [Mapper]
Presenter (*.presenter.ts) ← Validate field names and types
```

### Validation Checkpoints

1. **DTO → Model (Adapter)**
   - Field name mappings (e.g., `name` → `fileName`)
   - Type conversions (e.g., `string` → `Date`)
   - Optional field handling (`undefined` vs `null`)
   - Array transformations

2. **Model → Presenter (Mapper)**
   - Business logic fields (computed properties)
   - Helper method availability
   - Immutability patterns (`copyWith`)
   - Factory methods (`create`, `createEmpty`)

## Change Impact Assessment

타입 불일치 발견 후, 수정 방안의 파급력을 평가하는 알고리즘입니다.

### Impact Scoring

```typescript
interface ImpactScore {
  filesAffected: number;
  layersAffected: string[];
  linesChanged: number;
  testCoverage: number;
  riskLevel: "low" | "medium" | "high";
  estimatedEffort: string; // "15 min", "1-2 hours", etc.
}

function assessAdapterPatternImpact(field: string): ImpactScore {
  return {
    filesAffected: 1,
    layersAffected: ["Adapter"],
    linesChanged: 10-20,
    testCoverage: 85, // Service integration tests
    riskLevel: "low",
    estimatedEffort: "15 minutes",
  };
}

function assessModelChangeImpact(
  domain: string,
  field: string
): ImpactScore {
  // Find all files using the Model
  const modelFiles = findModelUsages(domain, field);
  const presenterFiles = findPresenterUsages(domain, field);
  const mapperFiles = findMapperUsages(domain, field);
  const serviceFiles = findServiceUsages(domain, field);
  const hookFiles = findHookUsages(domain, field);
  const uiFiles = findUIUsages(domain, field);
  
  return {
    filesAffected: [
      ...modelFiles,
      ...presenterFiles,
      ...mapperFiles,
      ...serviceFiles,
      ...hookFiles,
      ...uiFiles,
    ].length,
    layersAffected: [
      "Model",
      "Presenter",
      "Mapper",
      "Service",
      "Hooks",
      "UI"
    ],
    linesChanged: estimateLines([...allFiles]),
    testCoverage: 60, // Requires full stack tests
    riskLevel: "high",
    estimatedEffort: "2-3 hours",
  };
}
```

### Comparison Matrix

```typescript
function compareResolutionStrategies(
  domain: string,
  mismatch: FieldMismatch
): ComparisonResult {
  const adapterImpact = assessAdapterPatternImpact(mismatch.field);
  const modelImpact = assessModelChangeImpact(domain, mismatch.field);
  
  return {
    recommended: adapterImpact.filesAffected < 3 ? "adapter" : "model",
    adapter: adapterImpact,
    model: modelImpact,
    reasoning: generateReasoning(adapterImpact, modelImpact),
  };
}
```

### File Discovery Rules

프론트엔드 계층별 파일 검색 패턴:

```typescript
const FRONTEND_LAYER_PATTERNS = {
  model: "(planning)/**/{domain}/_types/{domain}.model.ts",
  presenter: "(planning)/**/{domain}/_types/{domain}.presenter.ts",
  mapper: "(planning)/**/{domain}/_services/{domain}.mapper.ts",
  service: [
    "(planning)/**/{domain}/_services/{domain}.service.ts",
    "(current)/**/{domain}/_services/{domain}.service.ts",
  ],
  hooks: [
    "(planning)/**/{domain}/_hooks/**/*.ts",
    "(current)/**/{domain}/_hooks/**/*.ts",
  ],
  ui: [
    "(planning)/**/{domain}/_ui/**/*.tsx",
    "(current)/**/{domain}/_ui/**/*.tsx",
  ],
};

const BACKEND_LAYER_PATTERNS = {
  adapter: "api/_backend/**/{domain}/types/{domain}.adapter.ts",
  service: "api/_backend/**/{domain}/{domain}.service.ts",
};
```

### Example Impact Report

```markdown
# Change Impact Report: brochure-category.isPublic

## Scenario: Rename isPublic → isActive in Model

### Files Affected (8 files)

**Model Layer** (1 file)
- [ ] portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model.ts
  - Line 45: BrochureCategoryModel.isPublic
  - Line 78: UpdateBrochureCategoryModel.isPublic

**Presenter Layer** (1 file)
- [ ] portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_types/brochure-category.presenter.ts
  - Line 12: constructor parameter
  - Line 34: property definition
  - Line 56: copyWith method
  - Line 89: displayStatus method (uses isPublic)

**Mapper Layer** (1 file)
- [ ] portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_services/brochure.mapper.ts
  - Line 123: fromCategoryModel
  - Line 145: toCategoryModel
  - Line 167: toUpdateCategoryModel

**Service Layer** (1 file)
- [ ] portal/src/app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_services/brochure.service.ts
  - Line 201: 브로슈어_카테고리를_생성한다 (toCreateCategoryModel)
  - Line 234: 브로슈어_카테고리를_수정한다 (toUpdateCategoryModel)

**Hooks Layer** (2 files)
- [ ] .../brochure/_hooks/_mutation/useCreateBrochureCategory.ts
  - Line 23: Hook return type
- [ ] .../brochure/_hooks/_mutation/useUpdateBrochureCategory.ts
  - Line 31: Hook return type

**UI Layer** (2 files)
- [ ] .../brochure/_ui/BrochureCategoryForm.tsx
  - Line 45: Form field binding
  - Line 67: onSubmit handler
- [ ] .../brochure/_ui/BrochureCategoryList.tsx
  - Line 89: Display logic

### Estimated Changes: 150+ lines across 8 files

### Alternative: Adapter Pattern

**Files Affected (1 file)**
- [ ] portal/src/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter.ts
  - Add 10 lines in toUpdateCategoryRequest

### Estimated Changes: 10 lines in 1 file

### Recommendation: Use Adapter Pattern ✅
```

## Field Comparison Algorithm

### Step 1: Extract Field Definitions

```typescript
interface FieldDefinition {
  name: string;
  type: string;
  optional: boolean;
  array: boolean;
  nested?: FieldDefinition[];
}

function extractFields(filePath: string): FieldDefinition[] {
  // Parse TypeScript AST
  // Extract interface/type properties
  // Return field list
}
```

### Step 2: Compare Field Lists

```typescript
interface ComparisonResult {
  missingInTarget: FieldDefinition[];
  missingInSource: FieldDefinition[];
  typeMismatches: {
    field: string;
    sourceType: string;
    targetType: string;
  }[];
  optionalMismatches: {
    field: string;
    sourceOptional: boolean;
    targetOptional: boolean;
  }[];
}

function compareFields(
  source: FieldDefinition[],
  target: FieldDefinition[],
  mappings: Record<string, string> // Field name mappings
): ComparisonResult {
  // Apply field name mappings
  // Compare field presence
  // Compare types
  // Compare optional flags
  // Return results
}
```

### Step 3: Apply Known Mappings

```typescript
const KNOWN_MAPPINGS = {
  // Attachment fields
  'name': 'fileName',
  'url': 'fileUrl',
  'size': 'fileSize',
  
  // Category fields
  'isActive': 'isPublic',
  
  // Document fields
  'createdBy': 'authorId',
  
  // Translation fields
  'description': 'content',
  
  // Pagination fields
  'limit': 'size',
};
```

## Common Field Mappings

### Attachment Fields

```typescript
// DTO
interface AttachmentDto {
  id: string;
  name: string;      // ← Maps to fileName
  url: string;       // ← Maps to fileUrl
  size: number;      // ← Maps to fileSize
  mimeType: string;
}

// Model
interface AttachmentModel {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// Adapter
static _toAttachmentModel(dto: AttachmentDto): AttachmentModel {
  return {
    id: dto.id,
    fileName: dto.name,      // ✅ Mapping applied
    fileUrl: dto.url,        // ✅ Mapping applied
    fileSize: dto.size,      // ✅ Mapping applied
    mimeType: dto.mimeType,
  };
}
```

### Category Fields

```typescript
// DTO
interface CategoryDto {
  id: string;
  name: string;
  isActive: boolean;  // ← Maps to isPublic
}

// Model
interface CategoryModel {
  id: string;
  name: string;
  isPublic: boolean;
}

// Adapter
static fromCategoryResponse(dto: CategoryDto): CategoryModel {
  return {
    id: dto.id,
    name: dto.name,
    isPublic: dto.isActive,  // ✅ Mapping applied
  };
}
```

### Pagination Fields

```typescript
// DTO
interface PaginationDto {
  page: number;
  limit: number;     // ← Maps to size
  total: number;
  totalPages: number;
}

// Model
interface PaginationModel {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Adapter
static fromListResponse(dto: ListResponseDto): ListModel {
  return {
    items: dto.items.map(...),
    page: dto.page,
    size: dto.limit,        // ✅ Mapping applied
    total: dto.total,
    totalPages: dto.totalPages,
  };
}
```

### Author Fields

```typescript
// DTO
interface DocumentDto {
  id: string;
  createdBy: string;  // ← Maps to authorId
}

// Model
interface DocumentModel {
  id: string;
  authorId: string;
  authorName: string;  // Backend doesn't provide this
}

// Adapter
static fromDocumentResponse(dto: DocumentDto): DocumentModel {
  return {
    id: dto.id,
    authorId: dto.createdBy,   // ✅ Mapping applied
    authorName: "",            // ✅ Default value for missing field
  };
}
```

## Type Mismatch Patterns

### Pattern 1: Optional Field Handling

```typescript
// DTO - Field might not exist in response
interface BrochureDto {
  translations?: TranslationDto[];  // Optional array
}

// Model - Always has the field, but might be empty
interface BrochureModel {
  translations: TranslationModel[] | undefined;
}

// ❌ Wrong - Can cause undefined errors
static fromResponse(dto: BrochureDto): BrochureModel {
  return {
    translations: dto.translations.map(...), // Error if undefined
  };
}

// ✅ Correct - Handle optional field
static fromResponse(dto: BrochureDto): BrochureModel {
  return {
    translations: dto.translations
      ? dto.translations.map(...)
      : undefined,
  };
}
```

### Pattern 2: Empty Array vs Undefined

```typescript
// DTO - Empty response
interface ListResponseDto {
  items: ItemDto[];
}

// Model - Should always be valid structure
interface ListModel {
  items: ItemModel[];
  page: number;
  size: number;
  total: number;
}

// ❌ Wrong - Doesn't handle empty/invalid response
static fromListResponse(dto: ListResponseDto): ListModel {
  return {
    items: dto.items.map(...),
    page: dto.page,
    size: dto.limit,
    total: dto.total,
  };
}

// ✅ Correct - Provide default structure
static fromListResponse(dto: ListResponseDto): ListModel {
  if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
    return {
      items: [],
      page: 1,
      size: 20,
      total: 0,
    };
  }
  return {
    items: dto.items.map(...),
    page: dto.page,
    size: dto.limit,
    total: dto.total,
  };
}
```

### Pattern 3: Nested Object Mapping

```typescript
// DTO - Nested structure
interface DocumentDto {
  id: string;
  category: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

// Model - Nested with different field names
interface DocumentModel {
  id: string;
  category: {
    id: string;
    name: string;
    isPublic: boolean;  // ← Different from DTO
  };
}

// ✅ Correct - Map nested fields
static fromResponse(dto: DocumentDto): DocumentModel {
  return {
    id: dto.id,
    category: {
      id: dto.category.id,
      name: dto.category.name,
      isPublic: dto.category.isActive,  // ✅ Nested mapping
    },
  };
}
```

### Pattern 4: Array Item Transformation

```typescript
// DTO - Array of DTOs
interface DocumentDto {
  attachments: AttachmentDto[];
}

// Model - Array of Models
interface DocumentModel {
  attachments: AttachmentModel[];
}

// ✅ Correct - Map each array item
static fromResponse(dto: DocumentDto): DocumentModel {
  return {
    attachments: dto.attachments.map(att => ({
      fileName: att.name,      // ✅ Apply mapping to each item
      fileUrl: att.url,
      fileSize: att.size,
    })),
  };
}
```

## Adapter Validation

### Validation Checklist

When validating an Adapter:

1. **Check Response Methods** (`from...Response`)
   - [ ] All DTO fields are mapped to Model fields
   - [ ] Field name mappings are applied
   - [ ] Optional fields are handled
   - [ ] Nested objects are mapped recursively
   - [ ] Arrays are transformed correctly
   - [ ] Default values for missing fields

2. **Check Request Methods** (`to...Request`)
   - [ ] All Model fields map to DTO fields
   - [ ] Reverse field name mappings applied
   - [ ] Optional fields handled
   - [ ] Create vs Update DTOs handled correctly

3. **Check Helper Methods** (private `_to...` methods)
   - [ ] Consistent with public methods
   - [ ] Reusable for nested conversions
   - [ ] Handle edge cases

### Example Validation

```typescript
// Adapter to validate
export class BrochureAdapter {
  static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
    const koTranslation = dto.translations.find(t => t.languageId.includes("ko"));
    
    return {
      id: dto.id,
      code: "brochure",
      authorId: dto.createdBy ?? "",           // ✅ Field mapping + default
      authorName: "",                          // ✅ Default for missing field
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      publishedAt: undefined,                  // ✅ Default for missing field
      order: dto.order,
      isPublic: dto.isPublic,
      title: koTranslation?.title ?? dto.translations[0]?.title ?? "",
      translations: this._toTranslationModelArray(dto.translations, dto.id),
      attachments: this._toAttachmentModelArray(dto.attachments, dto.id),
    };
  }
}

// Validation results:
// ✅ createdBy → authorId (mapped)
// ✅ authorName default provided
// ✅ publishedAt default provided
// ✅ Nested translations handled
// ✅ Nested attachments handled
```

## Mapper Validation

### Validation Checklist

When validating a Mapper:

1. **Check Model → Presenter** (`fromModel`)
   - [ ] All Model fields copied to Presenter
   - [ ] Nested objects converted recursively
   - [ ] Arrays converted using helper methods
   - [ ] Uses Presenter factory methods

2. **Check Presenter → Model** (`toModel`)
   - [ ] All Presenter fields copied to Model
   - [ ] Helper methods excluded
   - [ ] Computed properties excluded

3. **Check Create/Update Methods**
   - [ ] `toCreateModel` excludes id, timestamps
   - [ ] `toUpdateModel` handles partial updates
   - [ ] Nested objects handled

### Example Validation

```typescript
// Mapper to validate
export class BrochureMapper {
  static fromModel(model: BrochureModel): BrochurePresenter {
    return BrochurePresenter.create({
      id: model.id,
      code: model.code,
      authorId: model.authorId,
      authorName: model.authorName,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      publishedAt: model.publishedAt,
      order: model.order,
      isPublic: model.isPublic,
      title: model.title,
      attachments: model.attachments
        ? this.fromAttachmentModelArray(model.attachments)  // ✅ Array converted
        : undefined,
      category: model.category
        ? this.fromCategoryModel(model.category)            // ✅ Nested converted
        : undefined,
      translations: model.translations
        ? this.fromTranslationModelArray(model.translations)
        : undefined,
    });
  }
}

// Validation results:
// ✅ All Model fields present
// ✅ Uses Presenter.create factory
// ✅ Nested objects converted with helper methods
// ✅ Optional fields handled
```

## Type Extraction from Source Code

### TypeScript AST Approach (Recommended)

```typescript
import * as ts from "typescript";

function extractInterfaceFields(sourceFile: ts.SourceFile): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      node.members.forEach(member => {
        if (ts.isPropertySignature(member)) {
          fields.push({
            name: member.name.getText(),
            type: member.type?.getText() || "unknown",
            optional: !!member.questionToken,
            array: member.type?.kind === ts.SyntaxKind.ArrayType,
          });
        }
      });
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return fields;
}
```

### Regex Approach (Fallback)

```typescript
function extractFieldsWithRegex(content: string): FieldDefinition[] {
  const fieldRegex = /^\s*(\w+)(\?)?:\s*(.+?);?\s*$/gm;
  const fields: FieldDefinition[] = [];
  
  let match;
  while ((match = fieldRegex.exec(content)) !== null) {
    fields.push({
      name: match[1],
      optional: !!match[2],
      type: match[3].trim(),
      array: match[3].includes("[]"),
    });
  }
  
  return fields;
}
```

## Validation Report Format

```typescript
interface ValidationReport {
  domain: string;
  timestamp: string;
  layers: {
    dtoToModel: LayerValidation;
    modelToPresenter: LayerValidation;
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
}

interface LayerValidation {
  sourceFile: string;
  targetFile: string;
  adapterFile?: string;
  mapperFile?: string;
  issues: ValidationIssue[];
}

interface ValidationIssue {
  severity: "critical" | "warning" | "info";
  type: "missing_field" | "type_mismatch" | "mapping_missing" | "optional_mismatch";
  field: string;
  details: string;
  suggestion?: string;
}
```

## Best Practices

1. **Run validation regularly** - After any type definition changes
2. **Update mappings** - Keep KNOWN_MAPPINGS in sync with Adapters
3. **Document exceptions** - Some differences are intentional (computed fields)
4. **Automate in CI** - Run as part of build/test pipeline
5. **Track history** - Save validation reports to detect regressions
