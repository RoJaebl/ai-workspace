---
name: api-flow-debugger
description: Debug and trace API request/response flow between frontend service, API handler, and backend service in Next.js CMS application. Use when experiencing type mismatches (DTO/Model/Presenter conversion), data loss (missing translations/attachments/relations), error tracking issues (unclear failure points), request validation problems, or response flow confusion. Provides automatic flow tracing, type consistency validation, logging strategies, and data flow diagrams.
---

# API Flow Debugger

## Overview

This skill helps debug and trace API request/response flow in the Next.js CMS application's 3-layer architecture. It automatically identifies files across the stack, validates type conversions, suggests logging strategies, and generates visual diagrams to pinpoint issues quickly.

## Architecture Overview

The project uses a 3-layer API architecture:

```
Frontend Service → API Handler (route.ts) → Backend Service → CMS API
     ↓                    ↓                       ↓              ↓
  Presenter  ←  Mapper  ← Model  ←  Adapter  ←  DTO  ←  JSON Response
```

### Layer Responsibilities

1. **Frontend Service** (`(planning)` or `(current)` directories)
   - Uses Presenter types for UI rendering
   - Calls internal Next.js API routes
   - Handles Model → Presenter conversion via Mapper

2. **API Handler** (`app/api/(cms)/.../route.ts`)
   - Next.js API route endpoints
   - Extracts authentication token from cookies
   - Calls Backend Service via Module pattern
   - Returns `ServiceResponse<Model>` to frontend

3. **Backend Service** (`app/api/_backend/modules/...`)
   - Extends BaseService for error handling
   - Makes fetch calls to external CMS API
   - Converts DTO → Model via Adapter
   - Handles authentication headers

4. **Type Conversion Layers**
   - **DTO**: External CMS API response types
   - **Adapter**: DTO ↔ Model conversion (handles field name mapping)
   - **Model**: Business logic types (Create/Update variants)
   - **Mapper**: Model ↔ Presenter conversion
   - **Presenter**: UI types with helper methods

## Quick Start

When you encounter an API issue, follow this workflow:

### Step 1: Identify the Domain

Determine which domain you're working with (e.g., "brochure", "ir", "news").

### Step 2: Trace the Flow

Run the flow tracer script to find all related files:

```bash
cd /root/documents/lumir-portal/.cursor/skills/api-flow-debugger
node scripts/trace-api-flow.ts <domain-name>
```

This outputs:
- Frontend Service file path
- API Handler file paths
- Backend Service file path
- All type files (DTO, Model, Presenter, Adapter, Mapper)
- Endpoints file

### Step 3: Validate Types

Check for type inconsistencies:

```bash
node scripts/validate-types.ts <domain-name>
```

This reports:
- DTO vs Model field mismatches
- Model vs Presenter field differences
- Missing optional fields
- Type incompatibilities

### Step 3.5: Assess Change Impact

타입 불일치 발견 시, 수정 방안의 파급력을 평가합니다:

```bash
node scripts/assess-change-impact.ts <domain-name> <field-change>
```

예시:
```bash
# 카테고리 isPublic → isActive 변경 시 영향도
node scripts/assess-change-impact.ts brochure-category "isPublic->isActive"
```

출력 예시:
```
📊 Change Impact Analysis

Option 1: Adapter Pattern (Recommended) ✅
  Files to modify: 1
  - api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter.ts
  
  Affected layers: Backend Service only
  Estimated effort: 15 minutes
  Risk level: Low

Option 2: Model Type Change ⚠️
  Files to modify: 8+
  - (planning)/**/brochure/_types/brochure.model.ts
  - (planning)/**/brochure/_types/brochure-category.presenter.ts
  - (planning)/**/brochure/_services/brochure.mapper.ts
  - (planning)/**/brochure/_services/brochure.service.ts
  - (planning)/**/brochure/_hooks/**/*.ts (4 files)
  - (planning)/**/brochure/_ui/**/*.tsx (multiple components)
  
  Affected layers: Model, Presenter, Mapper, Service, Hooks, UI
  Estimated effort: 2-3 hours
  Risk level: High
  
Recommendation: Use Adapter Pattern
```

### Step 4: Add Strategic Logging

Based on the issue, add logging using templates from `assets/logging-templates/`:

- **Frontend issues**: Use `frontend-service.ts.template`
- **API routing issues**: Use `api-handler.ts.template`
- **Backend fetch issues**: Use `backend-service.ts.template`
- **Type conversion issues**: Use `adapter.ts.template`

### Step 5: Visualize the Flow

Generate a sequence diagram to understand the complete flow:

```bash
node scripts/generate-flow-diagram.ts <domain-name> <operation>
```

Operations: `list`, `get`, `create`, `update`, `delete`

## Debugging Workflow

### Phase 1: Automatic Flow Tracing (1-2 minutes)

The skill automatically locates all relevant files for your domain:

```
📁 Frontend Service
  - (planning)/**/{domain}/_services/{domain}.service.ts
  - (current)/**/{domain}/_services/{domain}.service.ts

📁 API Handlers
  - api/(cms)/**/{domain}/*/route.ts

📁 Backend Service
  - api/_backend/**/{domain}/{domain}.service.ts

📁 Type Files
  - DTO: api/_backend/**/{domain}/types/{domain}.dto.ts
  - Model: (planning)/**/{domain}/_types/{domain}.model.ts
  - Presenter: (planning)/**/{domain}/_types/{domain}.presenter.ts
  - Adapter: api/_backend/**/{domain}/types/{domain}.adapter.ts
  - Mapper: (planning)/**/{domain}/_services/{domain}.mapper.ts

📁 Configuration
  - Endpoints: **/{domain}.endpoints.ts
```

### Phase 2: Type Validation (2-3 minutes)

The validator compares type definitions across layers:

**DTO vs Model Validation**
- Checks field name mappings in Adapter
- Identifies missing conversions
- Flags type mismatches

**Model vs Presenter Validation**
- Checks Mapper conversion logic
- Identifies missing fields
- Validates optional field handling

**Common Mismatches**
```typescript
// DTO uses different field names
DTO: { name, url, size, isActive, limit }
Model: { fileName, fileUrl, fileSize, isPublic, size }
```

### Phase 3: Logging Strategy (1-2 minutes)

Add targeted logging based on the issue:

**Request Issues** → Log at Frontend Service + API Handler

**Response Issues** → Log at Backend Service + Adapter

**Type Conversion Issues** → Log at Adapter + Mapper

**Authentication Issues** → Log at API Handler

See [references/logging-strategies.md](references/logging-strategies.md) for detailed templates.

### Phase 4: Diagram Generation (1 minute)

Generate visual representations:

**Sequence Diagram** - Shows complete request/response flow

**Type Conversion Diagram** - Shows data transformation at each layer

**Error Path Diagram** - Highlights where errors can occur

### Phase 5: Deep Analysis (as needed)

When automatic tools don't reveal the issue:

1. **Read specific files** identified in Phase 1
2. **Search for patterns** using Grep (field names, type definitions)
3. **Validate Adapter/Mapper logic** manually
4. **Check error handling** in BaseService.handleApiCall
5. **Verify endpoints** match route definitions

## Common Issues

### Issue 0: Type Mismatch Resolution Strategy (최소 파급력 원칙)

**중요**: DTO와 Model 간 타입 불일치 발견 시, 아래 순서대로 해결 방안을 검토합니다.

**우선순위 1: Adapter 완충 패턴 (권장) ✅**

**적용 시기**:
- 백엔드 API 스펙 변경 시
- 필드명 불일치 (isActive vs isPublic)
- 필수/선택 여부 차이 (name: string vs name?: string)
- 추가 필드가 DTO에만 존재하거나 Model에만 필요한 경우

**장점**:
- 변경 범위: Adapter 파일 1개
- 프론트엔드 계층 영향 없음 (Model, Presenter, Mapper, Hooks, UI 수정 불필요)
- 빠른 배포 가능
- 도메인 모델 안정성 유지

**구현 예시**:
```typescript
// 백엔드 DTO
interface UpdateBrochureCategoryDto {
  name: string;        // required
  description?: string;
  isActive: boolean;   // required
}

// 프론트엔드 Model (기존 유지)
interface UpdateBrochureCategoryModel {
  name?: string;       // optional
  description?: string;
  isPublic?: boolean;  // optional, 다른 필드명
}

// ✅ 해결: Adapter에서 변환
// Backend Service 또는 Frontend Service에서 사용
static toUpdateCategoryRequest(model: UpdateCategoryModel): UpdateCategoryDto {
  return {
    name: model.name || "",              // optional → required (기본값 제공)
    description: model.description,
    isActive: model.isPublic ?? true,    // isPublic → isActive 매핑
  };
}
```

**우선순위 2: Model 타입 수정 (신중히 검토) ⚠️**

**적용 시기** (다음 조건을 **모두** 만족할 때만):
- Adapter 패턴으로 해결 불가능한 구조적 불일치
- 백엔드 스펙이 비즈니스 도메인 표준이 됨
- 프론트엔드 전체 리팩토링 리소스 확보됨
- 장기적으로 유지보수에 더 유리함

**단점**:
- 변경 범위: Model, Presenter, Mapper, Service, Hooks, UI
- 프론트엔드 전체 계층 수정 필요
- 배포 시간 증가
- 회귀 테스트 필요

**영향 범위 예시**:
```
Model 필드 변경: isPublic → isActive
→ Presenter 클래스 수정 (필드명, 메서드명)
→ Mapper 수정 (fromModel, toModel)
→ Service 메서드 시그니처 수정
→ Hooks 반환 타입 수정
→ UI 컴포넌트 프로퍼티 수정
→ 모든 참조 코드 검색 및 수정
```

**결정 기준 체크리스트**:
- [ ] Adapter 패턴으로 해결 불가능한가?
- [ ] 백엔드 스펙이 장기적으로 고정인가?
- [ ] 프론트엔드 전체 리팩토링 일정이 확보되었는가?
- [ ] 팀 전체가 변경 사항을 인지하고 있는가?

**우선순위 3: 백엔드 API 수정 요청**

**적용 시기**:
- 백엔드 스펙이 RESTful 표준을 위반
- 필수 필드가 실제로는 선택적이어야 하는 경우
- 일관성 없는 네이밍 (다른 엔드포인트는 isPublic 사용)

---

### Issue 1: Field Name Mapping Error

> **Note**: Consider using the Adapter pattern first (see [Issue 0](#issue-0-type-mismatch-resolution-strategy-최소-파급력-원칙)) to minimize change impact.

**Symptom**: Frontend shows `undefined` for a field that exists in API response

**Cause**: Adapter doesn't map DTO field name to Model field name

**Solution**:
```typescript
// In Adapter
static _toAttachmentModel(dto: AttachmentDto): AttachmentModel {
  return {
    fileName: dto.name,      // ✅ Map name → fileName
    fileUrl: dto.url,        // ✅ Map url → fileUrl
    fileSize: dto.size,      // ✅ Map size → fileSize
  };
}
```

**How to find**: Run `validate-types.ts` to see field mismatches

---

### Issue 2: Missing Relation Data

**Symptom**: Arrays like `translations` or `attachments` are always `undefined`

**Cause**: Backend Service doesn't request related data from CMS API

**Solution**:
```typescript
// In Backend Service
const endpoint = `${ENDPOINTS.브로슈어_조회}?include=translations,attachments,category`;
```

**How to find**: Check Backend Service fetch calls for `include` query params

---

### Issue 3: Pagination Field Mismatch

> **Note**: This is a typical case for Adapter pattern (see [Issue 0](#issue-0-type-mismatch-resolution-strategy-최소-파급력-원칙)).

**Symptom**: Pagination shows wrong values or `undefined` for `size`

**Cause**: CMS API uses `limit` but Model expects `size`

**Solution**:
```typescript
// In Adapter
static fromBrochuresResponse(dto: BrochureListResponseDto): BrochuresModel {
  return {
    items: dto.items.map(...),
    page: dto.page,
    size: dto.limit,        // ✅ Map limit → size
    total: dto.total,
    totalPages: dto.totalPages,
  };
}
```

**How to find**: Run `validate-types.ts` on list response types

---

### Issue 4: Empty Array vs Undefined

**Symptom**: UI crashes or shows "Cannot read property of undefined"

**Cause**: Backend Service doesn't handle empty responses

**Solution**:
```typescript
// In Adapter
static fromBrochuresResponse(dto: BrochureListResponseDto): BrochuresModel {
  // ✅ Handle empty/invalid responses
  if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
    return {
      items: [],
      page: 1,
      size: 20,
      total: 0,
      totalPages: 0,
    };
  }
  // ... rest of conversion
}
```

**How to find**: Check Adapter methods for null/empty checks

---

### Issue 5: Authentication Token Issues

**Symptom**: 401 Unauthorized errors

**Cause**: Token not extracted from cookies or expired

**Solution**:
```typescript
// In API Handler (route.ts)
const cmsToken = getCmsAccessTokenFromCookies();

if (!cmsToken) {
  return NextResponse.json(
    { success: false, message: "CMS 인증이 필요합니다." },
    { status: 401 }
  );
}
```

**How to find**: Add logging at API Handler to check `!!cmsToken`

---

### Issue 6: ServiceResponse Structure Violations

**Symptom**: Frontend receives unexpected response format

**Cause**: Backend Service doesn't use ServiceResponse correctly

**Solution**:
```typescript
// In Backend Service - Use BaseService.handleApiCall
return this.handleApiCall(async () => {
  const response = await fetch(...);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || "Operation failed");
  }
  
  return AdapterFromResponse(result); // Return data, not wrapped
}, "Error message for catch block");
```

**How to find**: Check that methods return `Promise<ServiceResponse<T>>`

---

See [references/common-issues.md](references/common-issues.md) for more examples and detailed explanations.

## Advanced Features

### Custom Type Validation

Add custom validation rules to `scripts/validate-types.ts`:

```typescript
// Check for specific naming patterns
function validateNamingConvention(field: Field): ValidationResult {
  // Custom logic
}
```

### Domain-Specific Flow Diagrams

Extend `scripts/generate-flow-diagram.ts` to handle domain-specific patterns:

```typescript
// Add custom sequence steps
if (domain === 'brochure' && operation === 'create') {
  // Add translation handling steps
}
```

### Mock vs Real Service Comparison

Compare behavior between Mock and Real services:

```typescript
// In trace-api-flow.ts
const mockService = findFiles('(planning)/**/{domain}/_services/{domain}.service.ts');
const realService = findFiles('(current)/**/{domain}/_services/{domain}.service.ts');
```

## Resources

This skill includes:

### Scripts (`scripts/`)

- **trace-api-flow.ts** - Automatically finds all files in the API flow
- **validate-types.ts** - Compares type definitions across layers
- **generate-flow-diagram.ts** - Creates Mermaid sequence diagrams

All scripts are TypeScript and can be executed with `node` (uses ts-node internally).

### References (`references/`)

- **type-validation.md** - Detailed type comparison algorithms
- **flow-tracing.md** - File finding patterns and glob rules
- **logging-strategies.md** - Layer-specific logging templates
- **common-issues.md** - Extended troubleshooting guide

Load these when you need deep details on a specific aspect.

### Assets (`assets/`)

- **logging-templates/** - Copy-paste ready logging code for each layer
  - `frontend-service.ts.template`
  - `api-handler.ts.template`
  - `backend-service.ts.template`
  - `adapter.ts.template`

## Usage Examples

### Example 1: "Brochure list not showing"

```bash
# Step 1: Trace flow
node scripts/trace-api-flow.ts brochure

# Step 2: Validate types
node scripts/validate-types.ts brochure

# Step 3: Generate diagram
node scripts/generate-flow-diagram.ts brochure list

# Step 4: Add logging (if needed)
# Use templates from assets/logging-templates/
```

### Example 2: "Attachments are undefined"

```bash
# Find the issue
node scripts/validate-types.ts brochure

# Check output for:
# - Missing 'include' parameter in Backend Service
# - Field name mapping in Adapter (_toAttachmentModel)
```

### Example 3: "500 error, unclear where it fails"

```bash
# Add logging at each layer
# 1. API Handler - Check token and request body
# 2. Backend Service - Check fetch call and response
# 3. Adapter - Check DTO structure

# Use templates from assets/logging-templates/
```

## Tips

1. **Always start with flow tracing** - Know which files are involved before debugging
2. **Use type validation early** - Catch mismatches before they cause runtime errors
3. **Add logging strategically** - Don't log everything, target the suspected layer
4. **Diagrams help communication** - Share Mermaid diagrams with team members
5. **Check BaseService.handleApiCall** - Most errors are caught and logged there

## Integration with Project Conventions

This skill respects the project's naming conventions defined in `.cursor/rules/naming-convention.mdc`:

- **Services**: `{domain}.service.ts` with 한글 method names
- **Mappers**: `{domain}.mapper.ts` with `fromModel`, `toModel` patterns
- **Adapters**: `{domain}.adapter.ts` with `fromResponse`, `toRequest` patterns
- **Endpoints**: `{domain}.endpoints.ts` with 한글 constant names
- **Private folders**: Use `_` prefix (`_types`, `_services`, etc.)

This ensures the skill can reliably find files across the codebase.
