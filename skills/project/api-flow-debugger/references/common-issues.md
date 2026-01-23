# Common Issues Reference

This document provides an extended troubleshooting guide with detailed explanations, root causes, and solutions for common API flow issues.

## Table of Contents

1. [Type Conversion Issues](#type-conversion-issues)
2. [Data Loss Issues](#data-loss-issues)
3. [Authentication Issues](#authentication-issues)
4. [Response Structure Issues](#response-structure-issues)
5. [Edge Case Handling](#edge-case-handling)
6. [Performance Issues](#performance-issues)

## Type Conversion Issues

### Issue 0: Choosing the Right Resolution Strategy

**Symptom:**
```typescript
// Type validation script reports mismatch
DTO field: isActive (boolean, required)
Model field: isPublic (boolean, optional)
```

**Decision Tree:**

1. **Can Adapter handle the conversion?**
   - Field name difference? → YES → Use Adapter
   - Required vs optional? → YES → Use Adapter (provide default)
   - Type coercion needed? → YES → Use Adapter
   - Structural change needed? → NO → Consider Model change

2. **Is backend spec final?**
   - Temporary API? → Use Adapter (isolate changes)
   - Stable API? → Consider Model alignment
   - External API? → Always use Adapter

3. **What's the impact scope?**
   - Adapter: 1 file, 10-20 lines
   - Model: 5-10+ files, 100+ lines

**Resolution: Adapter Pattern (90% of cases)**

```typescript
// In Adapter or Service layer
static toUpdateCategoryRequest(model: UpdateCategoryModel): UpdateCategoryDto {
  return {
    name: model.name || "",               // Handle optional → required
    description: model.description,
    isActive: model.isPublic ?? true,     // Map isPublic → isActive
  };
}
```

**Why Adapter First?**

| Aspect | Adapter Pattern | Model Change |
|--------|----------------|--------------|
| Files changed | 1 | 8+ |
| Layers affected | Backend Service | All (Model, Presenter, Mapper, Hooks, UI) |
| Test scope | Service integration | Full stack |
| Deployment risk | Low | High |
| Time to fix | 15 min | 2-3 hours |

**When to Change Model Instead:**

Only if ALL of these are true:
- [ ] Adapter cannot handle the conversion (structural change)
- [ ] Backend spec is stable and follows domain standards
- [ ] Team has bandwidth for full stack refactoring
- [ ] Change improves long-term maintainability

**Example: When Model Change is Justified**

```typescript
// Backend changed from flat structure to nested
// OLD DTO
interface BrochureDto {
  title: string;
  content: string;
  authorId: string;
}

// NEW DTO (nested author object)
interface BrochureDto {
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

// This is a structural change - Adapter can handle it, but
// if we want to expose author details in UI, Model change makes sense
```

---

### Issue 1: Field Name Mapping Missing

> **Note**: This is a classic case for Adapter pattern. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy) for the resolution strategy.

**Symptom:**
```typescript
// Frontend shows undefined for fileName
console.log(brochure.attachments[0].fileName); // undefined
```

**Root Cause:**

DTO from CMS API uses `name`, but Model expects `fileName`. Adapter doesn't apply the mapping.

**Location:** `api/_backend/**/${domain}/types/${domain}.adapter.ts`

**Investigation Steps:**

1. Check DTO definition:
```typescript
// brochure.dto.ts
interface BrochureAttachmentDto {
  id: string;
  name: string;         // ← CMS API field name
  url: string;
  size: number;
}
```

2. Check Model definition:
```typescript
// brochure.model.ts
interface BrochureAttachmentModel {
  id: string;
  fileName: string;     // ← Expected by frontend
  fileUrl: string;
  fileSize: number;
}
```

3. Check Adapter implementation:
```typescript
// brochure.adapter.ts - BEFORE FIX
static _toAttachmentModel(dto: AttachmentDto): AttachmentModel {
  return {
    id: dto.id,
    fileName: dto.name,    // ← MISSING or wrong
    // ...
  };
}
```

**Solution:**

```typescript
// brochure.adapter.ts - AFTER FIX
static _toAttachmentModel(dto: AttachmentDto, documentId: string): AttachmentModel {
  return {
    id: dto.id,
    documentId,
    fileName: dto.name,      // ✅ Map name → fileName
    fileUrl: dto.url,        // ✅ Map url → fileUrl
    fileSize: dto.size,      // ✅ Map size → fileSize
    mimeType: dto.mimeType,
    languageId: dto.languageId,
    uploadedAt: dto.uploadedAt,
  };
}
```

**Prevention:**

- Run type validation script regularly
- Document all field mappings in Adapter file header
- Use TypeScript strict mode to catch missing properties

---

### Issue 2: Boolean Field Naming Inconsistency

> **Note**: Perfect example of when to use Adapter pattern instead of changing Model. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy).

**Symptom:**
```typescript
// Category shows as inactive when it should be active
console.log(category.isPublic); // false (but isActive was true in CMS)
```

**Root Cause:**

CMS API uses `isActive`, but Model uses `isPublic`. Adapter doesn't map the field.

**Investigation Steps:**

1. Check DTO:
```typescript
interface BrochureCategoryDto {
  id: string;
  name: string;
  isActive: boolean;    // ← CMS API field
}
```

2. Check Model:
```typescript
interface BrochureCategoryModel {
  id: string;
  name: string;
  isPublic: boolean;    // ← Model field
}
```

**Solution:**

```typescript
// Adapter
static fromCategoryResponse(dto: CategoryDto): CategoryModel {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? undefined,
    order: dto.order,
    isPublic: dto.isActive,      // ✅ Map isActive → isPublic
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

// Reverse mapping for requests
static toUpdateCategoryRequest(model: UpdateCategoryModel): UpdateCategoryDto {
  return {
    name: model.name,
    description: model.description,
    isActive: model.isPublic,    // ✅ Map isPublic → isActive
  };
}
```

---

### Issue 3: Pagination Field Mismatch

> **Note**: Another Adapter pattern use case. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy).

**Symptom:**
```typescript
// Pagination shows undefined for size
console.log(pagination.size); // undefined
console.log(pagination.limit); // 20 (wrong property name)
```

**Root Cause:**

CMS API returns `limit`, Model expects `size`.

**Investigation:**

```typescript
// DTO
interface BrochureListResponseDto {
  items: BrochureListItemDto[];
  page: number;
  limit: number;        // ← CMS API field
  total: number;
  totalPages: number;
}

// Model
interface BrochuresModel {
  items: BrochureModel[];
  page: number;
  size: number;         // ← Model field
  total: number;
  totalPages: number;
}
```

**Solution:**

```typescript
// Adapter
static fromBrochuresResponse(dto: BrochureListResponseDto): BrochuresModel {
  // Handle empty response
  if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
    return {
      items: [],
      page: 1,
      size: 20,          // ✅ Use 'size' not 'limit'
      total: 0,
      totalPages: 0,
    };
  }

  return {
    items: dto.items.map((item) => this._fromListItemResponse(item)),
    page: dto.page,
    size: dto.limit,     // ✅ Map limit → size
    total: dto.total,
    totalPages: dto.totalPages,
  };
}
```

---

### Issue 4: Author Field Mapping

> **Note**: Use Adapter pattern for field name mapping. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy).

**Symptom:**
```typescript
// Author ID is undefined
console.log(document.authorId); // undefined
```

**Root Cause:**

CMS API uses `createdBy`, Model uses `authorId`.

**Solution:**

```typescript
// Adapter
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    id: dto.id,
    code: "brochure",
    authorId: dto.createdBy ?? "",        // ✅ Map createdBy → authorId
    authorName: "",                       // ✅ Default for missing field
    // ... other fields
  };
}
```

## Data Loss Issues

### Issue 5: Missing Relation Data

**Symptom:**
```typescript
// translations array is always undefined
console.log(brochure.translations); // undefined
```

**Root Cause:**

Backend Service doesn't request related data from CMS API. The API requires `include` query parameter to return relations.

**Investigation Steps:**

1. Check Backend Service fetch call:
```typescript
// BEFORE FIX - Missing include parameter
const response = await fetch(BROCHURE_ENDPOINTS.브로슈어_조회, {
  method: "GET",
  headers: { /* ... */ },
});
```

2. Check CMS API documentation to see what relations are available

**Solution:**

```typescript
// AFTER FIX - Include relations
async getBrochure(id: string): Promise<ServiceResponse<BrochureModel>> {
  return this.handleApiCall(async () => {
    // ✅ Add include parameter for relations
    const endpoint = `${BROCHURE_ENDPOINTS.브로슈어_조회}?include=translations,attachments,category`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // ... rest of code
  }, "브로슈어 조회에 실패했습니다.");
}
```

**Common Relations to Include:**
- `translations` - Multi-language content
- `attachments` - File attachments
- `category` - Category information
- `author` - Author details (if needed)

---

### Issue 6: Empty Array vs Undefined Handling

**Symptom:**
```typescript
// UI crashes: Cannot read property 'map' of undefined
brochure.attachments.map(...) // Error
```

**Root Cause:**

Backend Service doesn't handle case when CMS API returns empty or missing array.

**Investigation:**

Check Adapter for empty array handling:

```typescript
// BEFORE FIX - No empty check
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    // ... fields
    attachments: this._toAttachmentModelArray(dto.attachments, dto.id), // ← Fails if dto.attachments is undefined
  };
}
```

**Solution:**

```typescript
// AFTER FIX - Handle empty/undefined
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    // ... fields
    attachments: dto.attachments && dto.attachments.length > 0
      ? this._toAttachmentModelArray(dto.attachments, dto.id)
      : undefined,  // ✅ Return undefined for empty, not empty array
  };
}

// Helper method should also check
static _toAttachmentModelArray(
  dtos: AttachmentDto[] | undefined,
  documentId: string
): AttachmentModel[] | undefined {
  if (!dtos || dtos.length === 0) {
    return undefined;  // ✅ Consistent handling
  }
  return dtos.map(dto => this._toAttachmentModel(dto, documentId));
}
```

**Alternative Pattern (Always Return Array):**

```typescript
// If UI always expects array (never undefined)
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    // ... fields
    attachments: dto.attachments && dto.attachments.length > 0
      ? this._toAttachmentModelArray(dto.attachments, dto.id)
      : [],  // ✅ Return empty array for consistency
  };
}
```

---

### Issue 7: List Response Empty Handling

**Symptom:**
```typescript
// List page crashes with undefined pagination
console.log(result.data.page); // undefined
```

**Root Cause:**

Adapter doesn't provide default structure for empty list responses.

**Solution:**

```typescript
// Adapter
static fromBrochuresResponse(dto: BrochureListResponseDto): BrochuresModel {
  // ✅ Handle invalid/empty response upfront
  if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
    return {
      items: [],
      page: 1,
      size: 20,
      total: 0,
      totalPages: 0,
    };
  }

  // Normal processing
  return {
    items: dto.items.map((item) => this._fromListItemResponse(item)),
    page: dto.page,
    size: dto.limit,
    total: dto.total,
    totalPages: dto.totalPages,
  };
}
```

---

### Issue 8: Nested Object Missing

> **Note**: Adapter pattern handles nested object conversions. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy).

**Symptom:**
```typescript
// Category object is undefined when it exists in DTO
console.log(brochure.category); // undefined
```

**Root Cause:**

Adapter doesn't convert nested category object.

**Investigation:**

```typescript
// Check DTO structure
interface BrochureResponseDto {
  id: string;
  // ... fields
  category?: {
    id: string;
    name: string;
    isActive: boolean;
  };
}
```

**Solution:**

```typescript
// Adapter - Convert nested object
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    id: dto.id,
    // ... other fields
    category: dto.category
      ? {
          id: dto.category.id,
          name: dto.category.name,
          isPublic: dto.category.isActive,  // ✅ Apply field mapping
          order: dto.category.order,
          createdAt: dto.category.createdAt,
          updatedAt: dto.category.updatedAt,
        }
      : undefined,  // ✅ Handle missing category
  };
}

// Or use helper method
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    // ... fields
    category: dto.category
      ? this.fromCategoryResponse(dto.category)  // ✅ Reuse existing converter
      : undefined,
  };
}
```

## Authentication Issues

### Issue 9: Token Not Found

**Symptom:**
```typescript
// 401 Unauthorized error
// Response: { success: false, message: "CMS 인증이 필요합니다." }
```

**Root Cause:**

Authentication token not in cookies, expired, or not extracted correctly.

**Investigation Steps:**

1. Check API Handler:
```typescript
// route.ts
const cmsToken = getCmsAccessTokenFromCookies();

console.log('[API Handler] Token:', {
  hasToken: !!cmsToken,
  tokenLength: cmsToken?.length,
});
```

2. Check browser cookies:
```javascript
// In browser console
document.cookie.split(';').forEach(c => console.log(c));
```

3. Check if user is logged in to CMS

**Solutions:**

**Solution A - Token Missing:**
```typescript
// Ensure user is authenticated before API call
if (!isAuthenticated) {
  router.push('/login');
  return;
}
```

**Solution B - Token Expired:**
```typescript
// Handle 401 in Frontend Service
async 브로슈어_목록을_조회한다(): Promise<ApiResponse<BrochuresPresenter>> {
  const response = await fetch(BROCHURE_API.브로슈어_목록_조회);
  
  if (response.status === 401) {
    // ✅ Token expired, redirect to login
    window.location.href = '/login';
    return { success: false, message: '인증이 만료되었습니다' };
  }
  
  // ... rest of code
}
```

**Solution C - Wrong Cookie Name:**
```typescript
// Check getCmsAccessTokenFromCookies implementation
export function getCmsAccessTokenFromCookies(): string | undefined {
  const cookieStore = cookies();
  const authToken = cookieStore.get("cmsAccessToken"); // ✅ Correct cookie name
  return authToken?.value;
}
```

---

### Issue 10: Token Not Sent to CMS API

**Symptom:**
```typescript
// Backend Service gets 401 from CMS API
// But API Handler has valid token
```

**Root Cause:**

Backend Service doesn't include Authorization header in fetch call.

**Investigation:**

```typescript
// Check Backend Service fetch call
const response = await fetch(endpoint, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    // ❌ Authorization header missing
  },
});
```

**Solution:**

```typescript
// Add Authorization header
const response = await fetch(endpoint, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${this.accessToken}`,  // ✅ Include token
  },
});
```

## Response Structure Issues

### Issue 11: ServiceResponse Not Used

**Symptom:**
```typescript
// Frontend receives unexpected response format
// Expected: { success: true, data: {...} }
// Got: {...} (raw data without wrapper)
```

**Root Cause:**

Backend Service returns raw data instead of ServiceResponse.

**Investigation:**

```typescript
// BEFORE FIX - Returns raw data
async getBrochures(): Promise<ServiceResponse<BrochuresModel>> {
  const response = await fetch(...);
  const result = await response.json();
  return result;  // ❌ Wrong - returns raw CMS API response
}
```

**Solution:**

```typescript
// AFTER FIX - Use handleApiCall
async getBrochures(): Promise<ServiceResponse<BrochuresModel>> {
  return this.handleApiCall(async () => {
    const response = await fetch(...);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "조회 실패");
    }
    
    // Convert and return data (handleApiCall wraps in ServiceResponse)
    return BrochureAdapter.fromBrochuresResponse(result);
  }, "브로슈어 목록 조회에 실패했습니다.");
}
```

---

### Issue 12: API Handler Returns Wrong Status Code

**Symptom:**
```typescript
// Always returns 200 even on error
// Frontend can't distinguish success from failure
```

**Root Cause:**

API Handler doesn't set status code based on result.

**Investigation:**

```typescript
// BEFORE FIX - Always 200
export async function GET() {
  const service = /* ... */;
  const result = await service.getBrochures();
  
  return NextResponse.json(result);  // ❌ No status code
}
```

**Solution:**

```typescript
// AFTER FIX - Set appropriate status codes
export async function GET() {
  const cmsToken = getCmsAccessTokenFromCookies();
  
  // ✅ 401 for missing auth
  if (!cmsToken) {
    return NextResponse.json(
      { success: false, message: "CMS 인증이 필요합니다." },
      { status: 401 }
    );
  }
  
  const service = BrochureModule.getInstance().getBrochureService(cmsToken);
  const result = await service.getBrochures();
  
  // ✅ 200 for success, 500 for error
  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}

// For POST (create)
export async function POST(request: NextRequest) {
  // ... auth and body parsing ...
  
  const result = await service.createBrochure(createDto);
  
  // ✅ 201 for successful creation
  return NextResponse.json(result, {
    status: result.success ? 201 : 500,
  });
}
```

## Edge Case Handling

### Issue 13: Korean Translation Not Found

**Symptom:**
```typescript
// Title is empty even though translations exist
console.log(brochure.title); // ""
```

**Root Cause:**

Adapter assumes Korean translation exists, but it doesn't.

**Investigation:**

```typescript
// BEFORE FIX - No fallback
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  const koTranslation = dto.translations.find(t => t.languageId.includes("ko"));
  
  return {
    // ... fields
    title: koTranslation.title,  // ❌ Error if koTranslation is undefined
  };
}
```

**Solution:**

```typescript
// AFTER FIX - Multiple fallbacks
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  const koTranslation = dto.translations.find(t => t.languageId.includes("ko"));
  
  return {
    // ... fields
    title: koTranslation?.title              // ✅ Try Korean first
           ?? dto.translations[0]?.title      // ✅ Fallback to first translation
           ?? "",                             // ✅ Fallback to empty string
  };
}
```

---

### Issue 14: ID Field Type Mismatch

> **Note**: Type coercion in Adapter is the right approach. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy).

**Symptom:**
```typescript
// Comparison fails: brochure.id === selectedId
// One is string, other is number
```

**Root Cause:**

CMS API returns ID as number, but Model expects string.

**Solution:**

```typescript
// Adapter - Convert ID to string
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    id: String(dto.id),  // ✅ Ensure string type
    // ... rest of fields
  };
}
```

---

### Issue 15: Date Format Issues

> **Note**: Date format normalization belongs in Adapter. See [Issue 0](#issue-0-choosing-the-right-resolution-strategy).

**Symptom:**
```typescript
// Date displays as "Invalid Date"
console.log(new Date(brochure.createdAt)); // Invalid Date
```

**Root Cause:**

Date string format from API is not ISO 8601 compatible.

**Solution:**

```typescript
// Adapter - Normalize date format
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  return {
    // ... fields
    createdAt: dto.createdAt,  // If already ISO 8601
    // OR if normalization needed:
    createdAt: new Date(dto.createdAt).toISOString(),
  };
}
```

## Performance Issues

### Issue 16: Slow List Queries

**Symptom:**
```typescript
// List page takes 5+ seconds to load
```

**Investigation:**

1. Check if pagination is used:
```typescript
// Frontend Service
const params: BrochureListParams = {
  page: 1,
  size: 20,  // ✅ Limit results
};
```

2. Check if unnecessary includes are requested:
```typescript
// Backend Service - Don't include everything for list view
const endpoint = `${ENDPOINTS.브로슈어_목록_조회}`; // ✅ No includes for list
// NOT: `${ENDPOINTS.브로슈어_목록_조회}?include=translations,attachments`
```

3. Check network tab for actual request size

**Solution:**

```typescript
// Use lightweight list response (no relations)
async getBrochures(params?: BrochureListParams): Promise<ServiceResponse<BrochuresModel>> {
  return this.handleApiCall(async () => {
    // ✅ List endpoint should return minimal data
    const searchParams = params ? this.buildSearchParams(params) : undefined;
    const queryString = searchParams?.toString() ?? "";
    const endpoint = queryString
      ? `${BROCHURE_ENDPOINTS.브로슈어_목록_조회}?${queryString}`
      : BROCHURE_ENDPOINTS.브로슈어_목록_조회;
    
    // Don't add include parameter for list - only for detail view
    // ...
  }, "조회 실패");
}
```

## Debugging Checklist

When encountering an issue, check in this order:

1. **Frontend Service**
   - [ ] Correct endpoint used
   - [ ] Request parameters formatted correctly
   - [ ] Response handled properly
   - [ ] Mapper conversion correct

2. **API Handler**
   - [ ] Authentication token extracted
   - [ ] Request body parsed correctly
   - [ ] Adapter used for conversions
   - [ ] Correct status codes returned

3. **Backend Service**
   - [ ] Correct CMS API endpoint
   - [ ] Authorization header included
   - [ ] Query parameters correct (include, pagination)
   - [ ] handleApiCall used properly
   - [ ] Adapter conversion applied

4. **Adapter**
   - [ ] All field mappings applied
   - [ ] Nested objects converted
   - [ ] Arrays handled correctly
   - [ ] Empty/null cases handled
   - [ ] Default values provided

5. **Mapper**
   - [ ] Model → Presenter correct
   - [ ] Helper methods used for nested objects
   - [ ] Factory methods used

6. **Type Definitions**
   - [ ] DTO matches CMS API response
   - [ ] Model fields consistent with business logic
   - [ ] Presenter includes helper methods
