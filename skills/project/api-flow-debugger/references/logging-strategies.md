# Logging Strategies Reference

This document provides comprehensive logging strategies for each layer of the API flow, including exact code templates and best practices.

## Table of Contents

1. [Logging Philosophy](#logging-philosophy)
2. [Frontend Service Logging](#frontend-service-logging)
3. [API Handler Logging](#api-handler-logging)
4. [Backend Service Logging](#backend-service-logging)
5. [Adapter Logging](#adapter-logging)
6. [Mapper Logging](#mapper-logging)
7. [Advanced Logging Patterns](#advanced-logging-patterns)
8. [Performance Considerations](#performance-considerations)

## Logging Philosophy

### Core Principles

1. **Log at boundaries** - Log when data crosses layer boundaries
2. **Log transformations** - Log before and after type conversions
3. **Log failures** - Always log error details with context
4. **Don't log everything** - Focus on debugging needs
5. **Structure logs** - Use consistent format for easy searching

### Log Levels (Conceptual)

```typescript
// This project uses console.log, but conceptually:
// - console.log: Normal flow information
// - console.error: Errors and exceptions
// - console.warn: Unexpected but handled situations
```

### Standard Log Format

```typescript
// Template
console.log('[Layer] Action:', {
  // Primary data
  key: value,
  // Context
  timestamp: new Date().toISOString(),
  // Additional metadata
});
```

## Frontend Service Logging

### Where to Log

Log in Frontend Service when:
- Making API calls to Next.js API routes
- Converting Model → Presenter
- Handling responses from API
- Encountering errors

### Request Logging Template

```typescript
// Before API call
async 브로슈어_목록을_조회한다(params?: BrochureListParams): Promise<ApiResponse<BrochuresPresenter>> {
  console.log('[Frontend Service] 브로슈어_목록을_조회한다 요청:', {
    endpoint: BROCHURE_API.브로슈어_목록_조회,
    params: params || {},
    timestamp: new Date().toISOString(),
  });

  const queryString = params ? this.buildQueryString(params) : '';
  const url = queryString ? `${BROCHURE_API.브로슈어_목록_조회}?${queryString}` : BROCHURE_API.브로슈어_목록_조회;

  // ... fetch call
}
```

### Response Logging Template

```typescript
// After API call
async 브로슈어_목록을_조회한다(params?: BrochureListParams): Promise<ApiResponse<BrochuresPresenter>> {
  // ... request logging and fetch call ...

  const json = await response.json();

  console.log('[Frontend Service] 브로슈어_목록을_조회한다 응답:', {
    success: json.success,
    hasData: !!json.data,
    dataType: json.data?.constructor.name,
    itemCount: json.data?.items?.length,
    error: json.message,
    statusCode: response.status,
  });

  // ... process response
}
```

### Conversion Logging Template

```typescript
// Model → Presenter conversion
async 브로슈어_목록을_조회한다(params?: BrochureListParams): Promise<ApiResponse<BrochuresPresenter>> {
  // ... fetch and response ...

  if (json.success && json.data) {
    console.log('[Frontend Service] Model → Presenter 변환 시작:', {
      modelData: json.data,
      itemCount: json.data.items?.length,
    });

    const presenter = BrochureMapper.fromModelArray(json.data.items);

    console.log('[Frontend Service] Model → Presenter 변환 완료:', {
      presenterCount: presenter.length,
      samplePresenter: presenter[0],
    });

    return { success: true, data: presenter };
  }
}
```

### Error Logging Template

```typescript
// Error handling
async 브로슈어_목록을_조회한다(params?: BrochureListParams): Promise<ApiResponse<BrochuresPresenter>> {
  try {
    // ... main logic ...
  } catch (error) {
    console.error('[Frontend Service] 브로슈어_목록을_조회한다 에러:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : '브로슈어 목록 조회 실패',
    };
  }
}
```

### Complete Example

```typescript
async 브로슈어_목록을_조회한다(params?: BrochureListParams): Promise<ApiResponse<BrochuresPresenter>> {
  // 1. Log request
  console.log('[Frontend Service] 브로슈어_목록을_조회한다 요청:', {
    endpoint: BROCHURE_API.브로슈어_목록_조회,
    params,
  });

  try {
    // 2. Make API call
    const response = await fetch(url);
    const json = await response.json();

    // 3. Log response
    console.log('[Frontend Service] 브로슈어_목록을_조회한다 응답:', {
      success: json.success,
      itemCount: json.data?.items?.length,
      statusCode: response.status,
    });

    // 4. Convert and log
    if (json.success && json.data) {
      console.log('[Frontend Service] Model → Presenter 변환');
      const presenter = BrochureMapper.fromModelArray(json.data.items);
      return { success: true, data: presenter };
    }

    return json;
  } catch (error) {
    // 5. Log error
    console.error('[Frontend Service] 에러:', {
      error: error instanceof Error ? error.message : String(error),
      params,
    });
    return { success: false, message: '조회 실패' };
  }
}
```

## API Handler Logging

### Where to Log

Log in API Handler (route.ts) when:
- Receiving requests
- Extracting authentication tokens
- Calling Backend Service
- Returning responses
- Handling errors

### Request Reception Template

```typescript
// At the start of handler
export async function GET(request: NextRequest) {
  console.log('[API Handler] GET 요청 수신:', {
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // ... rest of handler
}
```

### Authentication Logging Template

```typescript
// After token extraction
export async function POST(request: NextRequest) {
  const cmsToken = getCmsAccessTokenFromCookies();

  console.log('[API Handler] 인증 토큰 확인:', {
    hasToken: !!cmsToken,
    tokenLength: cmsToken?.length,
  });

  if (!cmsToken) {
    console.warn('[API Handler] 인증 토큰 없음');
    return NextResponse.json(
      { success: false, message: "CMS 인증이 필요합니다." },
      { status: 401 }
    );
  }

  // ... rest of handler
}
```

### Request Body Logging Template

```typescript
// For POST/PATCH requests
export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log('[API Handler] 요청 바디:', {
    bodyKeys: Object.keys(body),
    bodySize: JSON.stringify(body).length,
    sample: body, // Be careful with sensitive data
  });

  // ... rest of handler
}
```

### Backend Service Call Logging Template

```typescript
// Before and after service call
export async function GET() {
  const cmsToken = getCmsAccessTokenFromCookies();
  const service = BrochureModule.getInstance().getBrochureService(cmsToken);

  console.log('[API Handler] Backend Service 호출 시작:', {
    serviceType: service.constructor.name,
  });

  const result = await service.getBrochures();

  console.log('[API Handler] Backend Service 호출 완료:', {
    success: result.success,
    hasData: !!result.data,
    dataType: result.data?.constructor.name,
    error: result.message,
  });

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
```

### Adapter Call Logging Template

```typescript
// When using Adapter in handler
export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log('[API Handler] Adapter 변환 시작:', {
    bodyKeys: Object.keys(body),
  });

  const createDto = BrochureAdapter.toCreateCategoryRequest(body);

  console.log('[API Handler] Adapter 변환 완료:', {
    dtoKeys: Object.keys(createDto),
    dto: createDto,
  });

  // ... service call
}
```

### Complete Example

```typescript
export async function POST(request: NextRequest) {
  // 1. Log request
  console.log('[API Handler] POST 요청 수신:', {
    url: request.url,
  });

  // 2. Check authentication
  const cmsToken = getCmsAccessTokenFromCookies();
  console.log('[API Handler] 인증:', { hasToken: !!cmsToken });

  if (!cmsToken) {
    console.warn('[API Handler] 인증 실패');
    return NextResponse.json(
      { success: false, message: "인증 필요" },
      { status: 401 }
    );
  }

  // 3. Parse body
  const body = await request.json();
  console.log('[API Handler] 요청 바디:', { keys: Object.keys(body) });

  // 4. Convert with Adapter
  console.log('[API Handler] Adapter 변환');
  const createDto = BrochureAdapter.toCreateCategoryRequest(body);

  // 5. Call service
  console.log('[API Handler] Service 호출');
  const service = BrochureModule.getInstance().getBrochureService(cmsToken);
  const result = await service.createCategory(createDto);

  // 6. Log result
  console.log('[API Handler] 응답:', {
    success: result.success,
    statusCode: result.success ? 201 : 500,
  });

  return NextResponse.json(result, {
    status: result.success ? 201 : 500,
  });
}
```

## Backend Service Logging

### Where to Log

Log in Backend Service when:
- Making fetch calls to CMS API
- Receiving CMS API responses
- Converting DTO → Model via Adapter
- Handling errors in handleApiCall

### Fetch Request Logging Template

```typescript
// Before fetch call
async getBrochures(searchParams?: URLSearchParams): Promise<ServiceResponse<BrochuresModel>> {
  return this.handleApiCall(async () => {
    const endpoint = /* construct endpoint */;

    console.log('[Backend Service] CMS API 호출:', {
      endpoint,
      method: 'GET',
      hasSearchParams: !!searchParams,
      searchParams: searchParams?.toString(),
      hasToken: !!this.accessToken,
    });

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    // ... handle response
  }, "브로슈어 목록 조회에 실패했습니다.");
}
```

### Fetch Response Logging Template

```typescript
// After fetch call
async getBrochures(searchParams?: URLSearchParams): Promise<ServiceResponse<BrochuresModel>> {
  return this.handleApiCall(async () => {
    // ... fetch call ...

    const result = await response.json();

    console.log('[Backend Service] CMS API 응답:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : [],
    });

    if (!response.ok) {
      console.error('[Backend Service] CMS API 에러:', {
        status: response.status,
        message: result.message || "Unknown error",
        result,
      });
      throw new Error(result.message || "브로슈어 목록 조회 실패");
    }

    // ... adapter conversion
  }, "브로슈어 목록 조회에 실패했습니다.");
}
```

### Adapter Conversion Logging Template

```typescript
// Before and after Adapter conversion
async getBrochures(searchParams?: URLSearchParams): Promise<ServiceResponse<BrochuresModel>> {
  return this.handleApiCall(async () => {
    // ... fetch and response check ...

    console.log('[Backend Service] DTO → Model 변환 시작:', {
      dtoType: result.constructor.name,
      dtoKeys: Object.keys(result),
      itemCount: result.items?.length,
    });

    const model = BrochureAdapter.fromBrochuresResponse(result as BrochureListResponseDto);

    console.log('[Backend Service] DTO → Model 변환 완료:', {
      modelKeys: Object.keys(model),
      itemCount: model.items?.length,
      pagination: {
        page: model.page,
        size: model.size,
        total: model.total,
      },
    });

    return model;
  }, "브로슈어 목록 조회에 실패했습니다.");
}
```

### Error in handleApiCall

```typescript
// BaseService.handleApiCall already logs errors
// But you can add context before calling it
async getBrochures(searchParams?: URLSearchParams): Promise<ServiceResponse<BrochuresModel>> {
  console.log('[Backend Service] getBrochures 시작:', {
    hasSearchParams: !!searchParams,
  });

  const result = await this.handleApiCall(async () => {
    // ... operation ...
  }, "브로슈어 목록 조회에 실패했습니다.");

  console.log('[Backend Service] getBrochures 완료:', {
    success: result.success,
  });

  return result;
}
```

### Complete Example

```typescript
async getBrochures(searchParams?: URLSearchParams): Promise<ServiceResponse<BrochuresModel>> {
  return this.handleApiCall(async () => {
    // 1. Prepare endpoint
    const queryString = searchParams?.toString() ?? "";
    const endpoint = queryString
      ? `${BROCHURE_ENDPOINTS.브로슈어_목록_조회}?${queryString}`
      : BROCHURE_ENDPOINTS.브로슈어_목록_조회;

    // 2. Log request
    console.log('[Backend Service] CMS API 호출:', {
      endpoint,
      queryString,
    });

    // 3. Fetch
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const result = await response.json();

    // 4. Log response
    console.log('[Backend Service] CMS API 응답:', {
      ok: response.ok,
      status: response.status,
      itemCount: result.items?.length,
    });

    if (!response.ok) {
      throw new Error(result.message || "조회 실패");
    }

    // 5. Log conversion
    console.log('[Backend Service] DTO → Model 변환');
    const model = BrochureAdapter.fromBrochuresResponse(result);

    console.log('[Backend Service] 변환 완료:', {
      itemCount: model.items.length,
    });

    return model;
  }, "브로슈어 목록 조회에 실패했습니다.");
}
```

## Adapter Logging

### Where to Log

Log in Adapter when:
- Converting DTO → Model (Response methods)
- Converting Model → DTO (Request methods)
- Applying field name mappings
- Handling edge cases (empty arrays, missing fields)

### Response Conversion Template

```typescript
// DTO → Model conversion
static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel {
  console.log('[Adapter] DTO → Model 변환 시작:', {
    method: 'fromBrochureResponse',
    dtoId: dto.id,
    dtoKeys: Object.keys(dto),
    translationCount: dto.translations?.length,
    attachmentCount: dto.attachments?.length,
  });

  const model = {
    id: dto.id,
    // ... field mappings ...
    authorId: dto.createdBy ?? "",  // Mapping: createdBy → authorId
    translations: this._toTranslationModelArray(dto.translations, dto.id),
    attachments: this._toAttachmentModelArray(dto.attachments, dto.id),
  };

  console.log('[Adapter] DTO → Model 변환 완료:', {
    modelId: model.id,
    modelKeys: Object.keys(model),
    translationCount: model.translations?.length,
    attachmentCount: model.attachments?.length,
  });

  return model;
}
```

### Request Conversion Template

```typescript
// Model → DTO conversion
static toCreateBrochureRequest(model: CreateBrochureModel): CreateBrochureDto {
  console.log('[Adapter] Model → DTO 변환 시작:', {
    method: 'toCreateBrochureRequest',
    modelKeys: Object.keys(model),
    translationCount: model.translations?.length,
  });

  const dto = {
    // ... field mappings ...
    translations: model.translations?.map(t => ({
      languageId: t.languageId,
      title: t.title,
      content: t.description,  // Mapping: description → content
    })),
  };

  console.log('[Adapter] Model → DTO 변환 완료:', {
    dtoKeys: Object.keys(dto),
    translationCount: dto.translations?.length,
  });

  return dto;
}
```

### Field Mapping Logging Template

```typescript
// Detailed field mapping log
static _toAttachmentModel(dto: AttachmentDto, documentId: string): AttachmentModel {
  console.log('[Adapter] Attachment DTO → Model:', {
    input: {
      id: dto.id,
      name: dto.name,          // Will map to fileName
      url: dto.url,            // Will map to fileUrl
      size: dto.size,          // Will map to fileSize
    },
    mappings: {
      'name → fileName': dto.name,
      'url → fileUrl': dto.url,
      'size → fileSize': dto.size,
    },
  });

  return {
    id: dto.id,
    documentId,
    fileName: dto.name,
    fileUrl: dto.url,
    fileSize: dto.size,
    mimeType: dto.mimeType,
    languageId: dto.languageId,
    uploadedAt: dto.uploadedAt,
  };
}
```

## Mapper Logging

### Where to Log

Log in Mapper when:
- Converting Model → Presenter
- Converting Presenter → Model
- Creating Create/Update models
- Handling nested conversions

### Model → Presenter Logging Template

```typescript
// Model → Presenter conversion
static fromModel(model: BrochureModel): BrochurePresenter {
  console.log('[Mapper] Model → Presenter 변환:', {
    modelId: model.id,
    hasCategory: !!model.category,
    translationCount: model.translations?.length,
    attachmentCount: model.attachments?.length,
  });

  const presenter = BrochurePresenter.create({
    // ... all model fields ...
    category: model.category
      ? this.fromCategoryModel(model.category)
      : undefined,
    translations: model.translations
      ? this.fromTranslationModelArray(model.translations)
      : undefined,
  });

  console.log('[Mapper] 변환 완료:', {
    presenterId: presenter.id,
  });

  return presenter;
}
```

### Presenter → Create Model Template

```typescript
// Presenter → CreateModel
static toCreateModel(presenter: BrochurePresenter): CreateBrochureModel {
  console.log('[Mapper] Presenter → CreateModel:', {
    presenterId: presenter.id,
    hasTranslations: !!presenter.translations,
  });

  // Note: Exclude id, createdAt, updatedAt
  return {
    code: presenter.code,
    authorId: presenter.authorId,
    // ... other fields except id, timestamps
  };
}
```

## Advanced Logging Patterns

### Conditional Logging

```typescript
// Only log in development
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log('[Debug] Detailed info:', { /* ... */ });
}
```

### Performance Logging

```typescript
// Measure operation time
const startTime = performance.now();

// ... operation ...

const endTime = performance.now();
console.log('[Performance] Operation took:', {
  duration: `${(endTime - startTime).toFixed(2)}ms`,
  operation: 'getBrochures',
});
```

### Diff Logging

```typescript
// Log before/after transformation
console.log('[Adapter] Transformation:', {
  before: { keys: Object.keys(dto), sample: dto },
  after: { keys: Object.keys(model), sample: model },
  diff: {
    'name → fileName': { before: dto.name, after: model.fileName },
    'isActive → isPublic': { before: dto.isActive, after: model.isPublic },
  },
});
```

### Stack Trace Logging

```typescript
// Include stack trace for debugging
try {
  // ... operation ...
} catch (error) {
  console.error('[Error] With stack trace:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: { /* additional context */ },
  });
}
```

## Performance Considerations

### 1. Avoid Logging Large Objects

```typescript
// ❌ Bad - Logs entire object
console.log('[Adapter]', { dto });

// ✅ Good - Logs summary
console.log('[Adapter]', {
  dtoId: dto.id,
  dtoKeys: Object.keys(dto),
  itemCount: dto.items?.length,
});
```

### 2. Use Conditional Logging

```typescript
// Only log when debugging specific issue
const DEBUG_ADAPTER = process.env.DEBUG_ADAPTER === 'true';

if (DEBUG_ADAPTER) {
  console.log('[Adapter] Detailed debug:', { /* ... */ });
}
```

### 3. Remove Logs Before Production

```typescript
// Use environment check
if (process.env.NODE_ENV !== 'production') {
  console.log('[Debug]', { /* ... */ });
}
```

### 4. Structured Logging

```typescript
// Use consistent structure for easier parsing/filtering
const log = (layer: string, action: string, data: object) => {
  console.log(`[${layer}] ${action}:`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Usage
log('Adapter', 'DTO → Model', { dtoId, modelKeys });
```

## Best Practices

1. **Log at boundaries** - When data crosses layers
2. **Include context** - Enough info to reproduce the issue
3. **Use consistent format** - `[Layer] Action:` pattern
4. **Don't log sensitive data** - Passwords, tokens, personal info
5. **Log errors with detail** - Message, stack, context
6. **Clean up logs** - Remove debug logs before committing
7. **Use structured data** - Objects instead of string concatenation
