---
skill_name: rails-architecture
version: 1.0.0
description: Rails Architecture - 데이터가 하나의 레일 위를 따라 흐르는 계층화된 아키텍처 가이드라인
tags: [rails-architecture, architecture, service-layer, dto, model, presenter, mapper, adapter, patterns, single-flow]
author: AI Agent
created_at: 2026-01-23
updated_at: 2026-01-23
---

# Rails Architecture

> 데이터가 레일 위를 따라 흐르는 계층화된 아키텍처

## 목차
1. [개요](#개요)
2. [Rails Architecture 철학](#rails-architecture-철학)
3. [아키텍처 원칙](#아키텍처-원칙)
4. [프론트엔드 서비스 (Model 기반)](#프론트엔드-서비스-model-기반)
5. [백엔드 API 서비스 (DTO 기반)](#백엔드-api-서비스-dto-기반)
6. [데이터 변환 패턴](#데이터-변환-패턴)
7. [폴더 구조](#폴더-구조)
8. [네이밍 규칙](#네이밍-규칙)
9. [베스트 프랙티스](#베스트-프랙티스)
10. [안티 패턴](#안티-패턴)

---

## 개요

Lumir Portal은 **Rails Architecture**를 사용하여 데이터가 하나의 레일 위를 따라 흐르는 명확한 계층 구조를 구현합니다.

기차가 레일 위를 달리듯, 데이터는 정해진 경로를 따라 각 레이어(정거장)를 통과하며 명확한 변환을 거칩니다. 이를 통해 프론트엔드와 백엔드 간의 명확한 책임 분리와 예측 가능한 데이터 흐름을 보장합니다.

---

## Rails Architecture 철학

### 핵심 컨셉

**"데이터는 하나의 레일(rail) 위를 따라 흐른다"**

```
UI Layer (출발점)
  ↓ Presenter Rail
Hook Layer (1번 정거장: 비즈니스 로직)
  ↓ Model Rail
Frontend Service (2번 정거장: 프론트 도메인)
  ↓ Model Rail
API Handler (환승역: 도메인 변환 경계)
  ↓ DTO Rail
Backend Service (3번 정거장: 백엔드 도메인)
  ↓ DTO Rail
CMS Backend (종착역)
```

### 설계 원칙

1. **단일 흐름 (Single Flow)**: 데이터는 명확한 하나의 경로를 따라 흐름
2. **명확한 정거장 (Clear Stations)**: 각 레이어는 고유한 책임을 가진 정거장
3. **타입 레일 (Type Rails)**: 각 구간은 명확한 타입으로 정의된 레일
4. **환승역 (Transfer Station)**: API Handler는 프론트/백엔드 도메인 간 환승역
5. **분기 가능 (Branchable)**: 잘 정돈된 레일 위에서는 필요시 다른 흐름으로 분기 가능

### Rails의 장점

- **직관적 이해**: 기차-레일 메타포로 아키텍처를 쉽게 이해
- **명확한 흐름**: 데이터가 어디로 가는지 항상 명확
- **분기 가능성**: 잘 정돈된 레일은 필요시 다른 방향으로 분기 가능
- **일관성**: 다른 도메인도 동일한 레일 패턴을 적용 가능
- **에러 추적**: 어느 정거장에서 문제가 생겼는지 명확하게 추적

### 핵심 원칙

1. **프론트엔드 서비스 (정거장 2)**: Model 기반 (UI 도메인)
2. **백엔드 API 서비스 (정거장 3)**: DTO 기반 (API 도메인)
3. **API Route Handler (환승역)**: 두 도메인 간의 변환 경계

---

## 아키텍처 원칙

### 1. 계층별 책임 (Rails 다이어그램)

```
┌─────────────────────────────────────────────┐
│ UI Layer (출발점)                            │
│ React Components                            │
│  - 사용자 인터랙션 처리                       │
│  - Presenter 기반 렌더링                     │
└─────────────┬───────────────────────────────┘
              │ Presenter Rail 🚂
              ▼
┌─────────────────────────────────────────────┐
│ Hook Layer (정거장 1)                        │
│ Custom Hooks                                │
│  - 비즈니스 로직                              │
│  - Presenter ↔ Model 변환 (Mapper)          │
│  - 캐시 관리 (SWR)                           │
└─────────────┬───────────────────────────────┘
              │ Model Rail 🚂
              ▼
┌─────────────────────────────────────────────┐
│ Frontend Service (정거장 2)                  │
│ current/{domain}.service.ts                 │
│  - Model 입력/출력                           │
│  - Next.js API Route 호출                   │
│  - Model → Presenter 변환 (Mapper)          │
└─────────────┬───────────────────────────────┘
              │ Model Rail 🚂
              ▼
┌─────────────────────────────────────────────┐
│ ⚡ API Route Handler (환승역) ⚡              │
│ api/{domain}/route.ts                       │
│  - Model → DTO 변환 (Mapper)                │
│  - Backend Service 호출                      │
│  - DTO → Model 변환 (Adapter)               │
└─────────────┬───────────────────────────────┘
              │ DTO Rail 🚂
              ▼
┌─────────────────────────────────────────────┐
│ Backend Service (정거장 3)                   │
│ api/_backend/{domain}.service.ts            │
│  - DTO 입력/출력                             │
│  - CMS 백엔드 API 호출                       │
│  - DTO → Model 변환 (Adapter)               │
└─────────────┬───────────────────────────────┘
              │ DTO Rail 🚂
              ▼
┌─────────────────────────────────────────────┐
│ CMS Backend API (종착역)                     │
│  - 실제 비즈니스 로직                         │
│  - 데이터베이스 접근                          │
└─────────────────────────────────────────────┘
```

### 2. 데이터 레일 (Type Rails)

```
출발점          → Presenter Rail
정거장 1        → Model Rail (프론트 도메인)
   (Hook)          ↕ Mapper (외부 변환)
정거장 2        → Model Rail (프론트 도메인)
   (Frontend)      ↕ Mapper (내부 변환)
환승역 🔄       → Model ↔ DTO 변환 지점
   (API Handler)   ↕ Mapper/Adapter (경계 변환)
정거장 3        → DTO Rail (백엔드 도메인)
   (Backend)       ↕ Adapter (내부 변환)
종착역          → DTO Rail (CMS API)
```

### 3. 레일 전환 규칙

| 구간 | 레일 타입 | 변환 도구 | 변환 위치 |
|------|----------|----------|----------|
| UI → Hook | Presenter | - | - |
| Hook (외부) | Presenter → Model | Mapper | Hook 진입 전 |
| Hook → Frontend Service | Model | - | - |
| Frontend Service (내부) | Model → Presenter | Mapper | 응답 처리 시 |
| Frontend → API Handler | Model | - | - |
| **API Handler (요청)** | **Model → DTO** | **Mapper** | **환승역 진입** |
| API Handler → Backend | DTO | - | - |
| Backend Service (내부) | DTO → Model | Adapter | 응답 처리 시 |
| **API Handler (응답)** | **Model 유지** | - | **환승역 출발** |

---

## 프론트엔드 서비스 (Model 기반)

### 위치
```
portal/src/app/(current)/current/(cms)/cms/(admin)/homepage/{domain}/_services/
```

### 책임
1. **Model 입력 받기** (DTO 아님!)
2. Next.js API Route 호출
3. 응답 Model 받기
4. **Model → Presenter 변환** (내부)

### 구조

```typescript
// 파일: {domain}.service.ts
export class Current{Domain}Service implements {Domain}Service {
  
  // ✅ Model을 받음
  async {도메인}_카테고리를_수정한다(
    categoryId: string,
    data: Update{Domain}CategoryModel,  // Model 입력
  ): Promise<ApiResponse<{Domain}CategoryPresenter>> {
    try {
      // 1. Model을 Next.js API Route로 전송
      const response = await fetch(API_ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),  // Model 그대로 전송
        credentials: "include",
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      // 2. 응답 Model → Presenter 변환 (내부)
      const presenter = {Domain}Mapper.fromCategoryModel(result.data);
      
      return { success: true, data: presenter };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "에러 메시지",
      };
    }
  }
}
```

### Hook에서의 사용

```typescript
// 파일: _hooks/_action/useUpdate{Domain}.ts
export function useUpdate{Domain}() {
  const { {도메인}_카테고리를_수정한다 } = use{Domain}Service();
  
  const updateCategory = useCallback(
    async (categoryId: string, presenter: {Domain}CategoryPresenter) => {
      // ✅ Presenter → Model 변환 (Hook에서)
      const updateModel = {Domain}Mapper.toUpdateCategoryModel(presenter);
      
      // ✅ 서비스는 Model을 받음
      const response = await {도메인}_카테고리를_수정한다(
        categoryId,
        updateModel
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "수정 실패");
      }
      
      // 캐시 갱신
      await mutate(cacheKey);
      
      return response.data;
    },
    [{도메인}_카테고리를_수정한다]
  );
  
  return { updateCategory };
}
```

---

## 백엔드 API 서비스 (DTO 기반)

### 위치
```
portal/src/app/api/_backend/modules/cms/admin/homepage/{domain}/
```

### 책임
1. **DTO 입력 받기** (Model 아님!)
2. CMS 백엔드 API 호출
3. 응답 DTO 받기
4. **DTO → Model 변환** (내부)

### 구조

```typescript
// 파일: {domain}.service.ts
import { BaseService, ServiceResponse } from "@/app/api/_backend/common/base.service";

export class {Domain}Service extends BaseService implements {Domain}ServiceInterface {
  constructor(accessToken?: string) {
    super(accessToken);
  }
  
  /**
   * 카테고리 수정
   * 
   * @param id - 카테고리 ID
   * @param dto - 백엔드 API DTO (호출자에서 Model → DTO 변환 후 전달)
   */
  async updateCategory(
    id: string,
    dto: Update{Domain}CategoryDto,  // DTO 입력
  ): Promise<ServiceResponse<{Domain}CategoryModel>> {
    // 파라미터 검증
    if (!id?.trim()) {
      return {
        success: false,
        message: "카테고리 ID가 필요합니다.",
      };
    }
    
    return this.handleApiCall(async () => {
      // 1. DTO를 CMS 백엔드 API로 전송
      const response = await fetch(ENDPOINTS.카테고리_수정(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(dto),  // DTO 그대로 전송
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "카테고리 수정 실패");
      }
      
      // 2. 응답 DTO → Model 변환 (내부, Adapter 사용)
      return {Domain}Adapter.fromCategoryResponse(
        result.data as {Domain}CategoryResponseDto
      );
    }, "카테고리 수정에 실패했습니다.");
  }
}
```

### BaseService

모든 백엔드 API 서비스는 `BaseService`를 상속받아 공통 에러 처리와 응답 변환을 제공합니다.

```typescript
// 파일: api/_backend/common/base.service.ts
export abstract class BaseService {
  protected accessToken: string;
  
  constructor(accessToken?: string) {
    // 토큰 초기화 (쿠키에서 자동 추출 또는 명시적 전달)
  }
  
  // 공통 API 호출 처리
  protected async handleApiCall<T>(
    apiCall: () => Promise<T>,
    errorMessage: string
  ): Promise<ServiceResponse<T>> {
    try {
      const data = await apiCall();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : errorMessage,
      };
    }
  }
}
```

---

## 데이터 변환 패턴

### 1. Mapper (프론트엔드 도메인)

**위치**: `portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/{domain}/_services/{domain}.mapper.ts`

**책임**:
- Presenter ↔ Model 변환
- Model → DTO 변환 (API Handler에서 사용)

```typescript
export class {Domain}Mapper {
  // ============================================
  // Presenter ↔ Model 변환
  // ============================================
  
  /**
   * Model → Presenter 변환
   * @description 프론트엔드 서비스 내부에서 사용
   */
  static fromModel(model: {Domain}Model): {Domain}Presenter {
    return {Domain}Presenter.create({
      id: model.id,
      name: model.name,
      isPublic: model.isPublic,
      // ...
    });
  }
  
  /**
   * Presenter → Model 변환
   * @description Hook에서 사용 (서비스 호출 전)
   */
  static toModel(presenter: {Domain}Presenter): {Domain}Model {
    return {
      id: presenter.id,
      name: presenter.name,
      isPublic: presenter.isPublic,
      // ...
    };
  }
  
  // ============================================
  // Create/Update Model 변환
  // ============================================
  
  /**
   * Presenter → UpdateModel 변환
   * @description Hook에서 사용
   */
  static toUpdateCategoryModel(
    presenter: {Domain}CategoryPresenter
  ): Update{Domain}CategoryModel {
    return {
      name: presenter.name,
      description: presenter.description,
      isPublic: presenter.isPublic,
      // ...
    };
  }
  
  // ============================================
  // Model → DTO 변환 (API Handler용)
  // ============================================
  
  /**
   * UpdateCategoryModel → Backend DTO 변환
   * 
   * @description
   * - **Next.js API Route Handler에서 사용**
   * - 프론트엔드 서비스는 Model을 전달
   * - API Handler가 이 메서드로 DTO 변환
   * - 필드명 매핑 (예: isPublic → isActive)
   * 
   * @param model - Update{Domain}CategoryModel (프론트엔드 Model)
   * @returns Backend Update{Domain}CategoryDto 형식
   * 
   * @example
   * // API Route Handler에서 사용
   * const dto = {Domain}Mapper.toUpdateCategoryDto(requestBody);
   * await backendService.updateCategory(id, dto);
   */
  static toUpdateCategoryDto(
    model: Update{Domain}CategoryModel
  ): Update{Domain}CategoryDto {
    return {
      name: model.name || "",              // optional → required
      description: model.description,
      isActive: model.isPublic ?? true,    // isPublic → isActive 매핑
      // code, order 필드 제외 (백엔드에서 사용하지 않음)
    };
  }
}
```

### 2. Adapter (백엔드 API 도메인)

**위치**: `portal/src/app/api/_backend/modules/cms/admin/homepage/{domain}/types/{domain}.adapter.ts`

**책임**:
- DTO ↔ Model 변환 (백엔드 API와 프론트엔드 Model 간)

```typescript
export class {Domain}Adapter {
  // ============================================
  // DTO → Model 변환 (백엔드 서비스 내부)
  // ============================================
  
  /**
   * CategoryResponseDto → CategoryModel 변환
   * @description 백엔드 API 서비스 내부에서 사용
   */
  static fromCategoryResponse(
    dto: {Domain}CategoryResponseDto
  ): {Domain}CategoryModel {
    return {
      id: dto.id,
      code: "{domain}",
      name: dto.name,
      description: dto.description ?? undefined,
      order: dto.order,
      isPublic: dto.isActive,        // ✅ isActive → isPublic 변환
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
  
  /**
   * CategoryListResponseDto → CategoriesModel 변환
   */
  static fromCategoriesListResponse(
    dto: {Domain}CategoryListResponseDto
  ): {Domain}CategoriesModel {
    return {
      items: dto.items.map(item => this.fromCategoryResponse(item)),
      total: dto.total,
    };
  }
  
  // ============================================
  // Model → Request DTO 변환 (API Handler용)
  // ============================================
  
  /**
   * Update 파라미터 → Backend DTO 변환
   * @description API Handler에서 사용
   */
  static toUpdateCategoryRequest(params: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  }): Update{Domain}CategoryDto {
    return {
      name: params.name || "",
      description: params.description,
      isActive: params.isPublic ?? true,  // ✅ isPublic → isActive 변환
    };
  }
}
```

### 3. API Route Handler (변환 경계)

**위치**: `portal/src/app/api/cms/homepage/{domain}-categories/[id]/route.ts`

**책임**:
- 요청 Model → DTO 변환
- 백엔드 서비스 호출
- 응답 DTO → Model 변환

```typescript
import { NextRequest, NextResponse } from "next/server";
import { {Domain}Service } from "@/app/api/_backend/modules/cms/admin/homepage/{domain}/{domain}.service";
import { {Domain}Mapper } from "@/app/(planning)/plan/(cms)/cms/(admin)/homepage/{domain}/_services/{domain}.mapper";
import { {Domain}Adapter } from "@/app/api/_backend/modules/cms/admin/homepage/{domain}/types/{domain}.adapter";

/**
 * PATCH /api/cms/homepage/{domain}-categories/[id]
 * 카테고리 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 요청 body 파싱 (Model)
    const body = await request.json();
    
    // 2. Model → DTO 변환 (Mapper 사용)
    const dto = {Domain}Mapper.toUpdateCategoryDto(body);
    
    // 3. 백엔드 API 서비스 호출 (DTO 전달)
    const service = new {Domain}Service();
    const result = await service.updateCategory(params.id, dto);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    
    // 4. 응답 Model 그대로 반환 (이미 Adapter에서 변환됨)
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "서버 에러",
      },
      { status: 500 }
    );
  }
}
```

---

## 폴더 구조

### 프론트엔드 (Planning)

```
portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/{domain}/
├── _context/              # React Context
│   ├── {Domain}Context.tsx
│   └── {Domain}ServiceContext.tsx
├── _data/                 # Mock 데이터
│   └── *.mock.ts
├── _hooks/                # Custom Hooks
│   └── _action/           # CRUD Hooks
│       ├── useCreate{Domain}.ts
│       ├── useRead{Domain}s.ts
│       ├── useUpdate{Domain}.ts
│       └── useDelete{Domain}.ts
├── _services/             # 서비스 계층
│   ├── {domain}.interface.ts    # 서비스 인터페이스
│   ├── {domain}.mapper.ts       # Mapper (Presenter ↔ Model, Model → DTO)
│   └── {domain}.service.ts      # Mock 서비스 구현
├── _types/                # 타입 정의
│   ├── {domain}.model.ts        # Model (비즈니스 도메인)
│   └── {domain}.presenter.ts    # Presenter (UI 도메인)
├── _ui/                   # UI 컴포넌트
│   ├── {Domain}List.section/
│   ├── {Domain}Detail.panel/
│   └── {Domain}Form.section/
├── _utils/                # 유틸리티
└── page.tsx               # 페이지 컴포넌트
```

### 프론트엔드 (Current)

```
portal/src/app/(current)/current/(cms)/cms/(admin)/homepage/{domain}/
└── _services/
    ├── {domain}.endpoints.ts    # API 엔드포인트 상수
    └── {domain}.service.ts      # Real API 서비스 (Model 기반)
```

### 백엔드 API

```
portal/src/app/api/_backend/modules/cms/admin/homepage/{domain}/
├── {domain}.endpoints.ts         # 백엔드 API 엔드포인트
├── {domain}.module.ts            # 모듈 설정
├── {domain}.service.interface.ts # 서비스 인터페이스
├── {domain}.service.ts           # 서비스 구현 (DTO 기반)
└── types/
    ├── {domain}.dto.ts           # DTO 정의
    └── {domain}.adapter.ts       # Adapter (DTO ↔ Model)
```

### API Route Handler

```
portal/src/app/api/cms/homepage/{domain}-categories/
├── route.ts                      # GET, POST (목록)
└── [id]/
    └── route.ts                  # GET, PATCH, DELETE (단건)
```

---

## 네이밍 규칙

### 1. 서비스 메서드 (한글)

프론트엔드 서비스 인터페이스는 **한글 메서드명**을 사용합니다.

```typescript
// ✅ 올바른 예시
interface {Domain}Service {
  {도메인}_목록을_조회한다(): Promise<...>;
  {도메인}을_조회한다(id: string): Promise<...>;
  {도메인}을_생성한다(data: Create{Domain}Model): Promise<...>;
  {도메인}을_수정한다(id: string, data: Update{Domain}Model): Promise<...>;
  {도메인}을_삭제한다(id: string): Promise<...>;
  
  {도메인}_카테고리_목록을_조회한다(): Promise<...>;
  {도메인}_카테고리를_생성한다(data: CreateCategoryModel): Promise<...>;
  {도메인}_카테고리를_수정한다(id: string, data: UpdateCategoryModel): Promise<...>;
}
```

백엔드 API 서비스는 **영문 메서드명**을 사용합니다.

```typescript
// ✅ 올바른 예시
interface {Domain}ServiceInterface {
  get{Domain}s(params?: URLSearchParams): Promise<ServiceResponse<{Domain}sModel>>;
  get{Domain}(id: string): Promise<ServiceResponse<{Domain}Model>>;
  create{Domain}(dto: Create{Domain}Dto): Promise<ServiceResponse<{Domain}Model>>;
  update{Domain}(id: string, dto: Update{Domain}Dto): Promise<ServiceResponse<{Domain}Model>>;
  delete{Domain}(id: string): Promise<ServiceResponse<{ deleted: boolean }>>;
  
  getCategories(): Promise<ServiceResponse<{Domain}CategoriesModel>>;
  createCategory(dto: CreateCategoryDto): Promise<ServiceResponse<CategoryModel>>;
  updateCategory(id: string, dto: UpdateCategoryDto): Promise<ServiceResponse<CategoryModel>>;
}
```

### 2. 파일명

| 유형 | 패턴 | 예시 |
|-----|------|------|
| 서비스 구현 | `{domain}.service.ts` | `brochure.service.ts` |
| 서비스 인터페이스 | `{domain}.interface.ts` | `brochure.interface.ts` |
| Mapper | `{domain}.mapper.ts` | `brochure.mapper.ts` |
| Adapter | `{domain}.adapter.ts` | `brochure.adapter.ts` |
| DTO | `{domain}.dto.ts` | `brochure.dto.ts` |
| Model | `{domain}.model.ts` | `brochure.model.ts` |
| Presenter | `{domain}.presenter.ts` | `brochure.presenter.ts` |
| Endpoints | `{domain}.endpoints.ts` | `brochure.endpoints.ts` |

### 3. 타입명

| 타입 | 패턴 | 예시 |
|-----|------|------|
| Model | `{Domain}Model` | `BrochureModel` |
| Presenter | `{Domain}Presenter` | `BrochurePresenter` |
| DTO | `{Domain}Dto` | `BrochureDto` |
| Create Model | `Create{Domain}Model` | `CreateBrochureModel` |
| Update Model | `Update{Domain}Model` | `UpdateBrochureModel` |
| Create DTO | `Create{Domain}Dto` | `CreateBrochureDto` |
| Update DTO | `Update{Domain}Dto` | `UpdateBrochureDto` |
| Service Response | `ServiceResponse<T>` | `ServiceResponse<BrochureModel>` |
| API Response | `ApiResponse<T>` | `ApiResponse<BrochurePresenter>` |

---

## 베스트 프랙티스

### 1. 프론트엔드 서비스

✅ **DO**:
```typescript
// Model 입력 받기
async 브로슈어를_수정한다(
  id: string,
  data: UpdateBrochureModel,  // ✅ Model
): Promise<ApiResponse<BrochurePresenter>>

// Model을 API Route로 전송
body: JSON.stringify(data)  // ✅ Model 그대로

// 응답 Model → Presenter 변환 (내부)
const presenter = BrochureMapper.fromModel(result.data);
```

❌ **DON'T**:
```typescript
// DTO 입력 받기 (잘못됨!)
async 브로슈어를_수정한다(
  id: string,
  dto: UpdateBrochureDto,  // ❌ DTO (백엔드 도메인)
): Promise<ApiResponse<BrochurePresenter>>

// 서비스 내부에서 Model → DTO 변환 (잘못됨!)
const dto = BrochureMapper.toUpdateDto(data);  // ❌
body: JSON.stringify(dto)
```

### 2. 백엔드 API 서비스

✅ **DO**:
```typescript
// DTO 입력 받기
async updateBrochure(
  id: string,
  dto: UpdateBrochureDto,  // ✅ DTO
): Promise<ServiceResponse<BrochureModel>>

// DTO를 백엔드 API로 전송
body: JSON.stringify(dto)  // ✅ DTO 그대로

// 응답 DTO → Model 변환 (내부, Adapter)
return BrochureAdapter.fromResponse(result.data);
```

❌ **DON'T**:
```typescript
// Model 입력 받기 (잘못됨!)
async updateBrochure(
  id: string,
  model: UpdateBrochureModel,  // ❌ Model (프론트 도메인)
): Promise<ServiceResponse<BrochureModel>>

// 서비스 내부에서 Model → DTO 변환 (잘못됨!)
const dto = BrochureAdapter.toDto(model);  // ❌
body: JSON.stringify(dto)
```

### 3. Hook

✅ **DO**:
```typescript
const updateBrochure = useCallback(
  async (presenter: BrochurePresenter) => {
    // Presenter → Model 변환 (외부)
    const model = BrochureMapper.toUpdateModel(presenter);
    
    // 서비스는 Model을 받음
    const response = await 브로슈어를_수정한다(id, model);
    
    return response.data;
  },
  [브로슈어를_수정한다]
);
```

❌ **DON'T**:
```typescript
const updateBrochure = useCallback(
  async (presenter: BrochurePresenter) => {
    // Presenter → DTO 변환 (잘못됨!)
    const dto = BrochureMapper.toUpdateDto(presenter);  // ❌
    
    // 서비스에 DTO 전달 (잘못됨!)
    const response = await 브로슈어를_수정한다(id, dto);  // ❌
  },
  [브로슈어를_수정한다]
);
```

### 4. API Route Handler

✅ **DO**:
```typescript
export async function PATCH(request: NextRequest) {
  const body = await request.json();  // Model
  
  // Model → DTO 변환 (Handler에서)
  const dto = BrochureMapper.toUpdateDto(body);
  
  // 백엔드 서비스 호출 (DTO 전달)
  const service = new BrochureService();
  const result = await service.updateBrochure(id, dto);
  
  // 응답 Model 반환 (이미 변환됨)
  return NextResponse.json({ success: true, data: result.data });
}
```

❌ **DON'T**:
```typescript
export async function PATCH(request: NextRequest) {
  const body = await request.json();  // Model
  
  // 변환 없이 Model을 백엔드 서비스에 전달 (잘못됨!)
  const service = new BrochureService();
  const result = await service.updateBrochure(id, body);  // ❌
  
  return NextResponse.json({ success: true, data: result.data });
}
```

---

## 안티 패턴

### ❌ 1. 프론트엔드 서비스에서 DTO 사용

```typescript
// ❌ 잘못된 예시
class CurrentBrochureService {
  async 브로슈어를_수정한다(
    id: string,
    dto: UpdateBrochureDto,  // ❌ DTO는 백엔드 도메인
  ) {
    // ...
  }
}
```

**문제점**:
- 프론트엔드 도메인(Model)과 백엔드 도메인(DTO)이 혼재
- 서비스의 책임이 불명확
- 테스트 어려움

**해결**:
```typescript
// ✅ 올바른 예시
class CurrentBrochureService {
  async 브로슈어를_수정한다(
    id: string,
    data: UpdateBrochureModel,  // ✅ Model
  ) {
    // Model을 그대로 전송
  }
}
```

### ❌ 2. 백엔드 API 서비스에서 Model 사용

```typescript
// ❌ 잘못된 예시
class BrochureService extends BaseService {
  async updateBrochure(
    id: string,
    model: UpdateBrochureModel,  // ❌ Model은 프론트 도메인
  ) {
    // ...
  }
}
```

**문제점**:
- 백엔드 API 계약(DTO)과 불일치
- API 스펙 변경 시 전체 시스템 영향
- 도메인 경계 불명확

**해결**:
```typescript
// ✅ 올바른 예시
class BrochureService extends BaseService {
  async updateBrochure(
    id: string,
    dto: UpdateBrochureDto,  // ✅ DTO
  ) {
    // DTO를 그대로 전송
  }
}
```

### ❌ 3. 서비스 내부에서 외부 변환

```typescript
// ❌ 잘못된 예시
class CurrentBrochureService {
  async 브로슈어를_수정한다(
    id: string,
    data: UpdateBrochureModel,
  ) {
    // ❌ 서비스 내부에서 Model → DTO 변환
    const dto = BrochureMapper.toUpdateDto(data);
    
    const response = await fetch(API, {
      body: JSON.stringify(dto),
    });
  }
}
```

**문제점**:
- 서비스가 Model과 DTO 모두 알아야 함
- 변환 책임이 서비스에 있음
- API Handler의 역할 침범

**해결**:
```typescript
// ✅ 올바른 예시
class CurrentBrochureService {
  async 브로슈어를_수정한다(
    id: string,
    data: UpdateBrochureModel,
  ) {
    // ✅ Model을 그대로 전송 (Handler가 변환)
    const response = await fetch(API, {
      body: JSON.stringify(data),
    });
  }
}

// API Handler에서 변환
export async function PATCH(request: NextRequest) {
  const body = await request.json();  // Model
  const dto = BrochureMapper.toUpdateDto(body);  // ✅ Handler에서 변환
  // ...
}
```

### ❌ 4. Hook에서 DTO 직접 생성

```typescript
// ❌ 잘못된 예시
const updateBrochure = useCallback(
  async (presenter: BrochurePresenter) => {
    // ❌ Hook에서 Presenter → DTO 직접 변환
    const dto = {
      name: presenter.name,
      isActive: presenter.isPublic,  // 필드명 매핑까지 Hook에서
    };
    
    const response = await 브로슈어를_수정한다(id, dto);
  },
  []
);
```

**문제점**:
- Hook이 백엔드 API 스펙을 알아야 함
- 필드명 매핑 로직이 Hook에 분산
- Mapper의 역할 무시

**해결**:
```typescript
// ✅ 올바른 예시
const updateBrochure = useCallback(
  async (presenter: BrochurePresenter) => {
    // ✅ Mapper를 사용한 변환
    const model = BrochureMapper.toUpdateModel(presenter);
    
    // 서비스는 Model을 받음
    const response = await 브로슈어를_수정한다(id, model);
  },
  []
);
```

---

## 체크리스트

새로운 도메인을 추가하거나 기존 도메인을 수정할 때 다음을 확인하세요:

### 프론트엔드 서비스
- [ ] Model 타입을 입력으로 받는가?
- [ ] Model을 Next.js API Route로 전송하는가?
- [ ] 응답 Model → Presenter 변환을 내부에서 수행하는가?
- [ ] DTO를 직접 다루지 않는가?

### 백엔드 API 서비스
- [ ] DTO 타입을 입력으로 받는가?
- [ ] DTO를 CMS 백엔드 API로 전송하는가?
- [ ] 응답 DTO → Model 변환을 내부에서 수행하는가? (Adapter 사용)
- [ ] BaseService를 상속받았는가?
- [ ] Model을 직접 다루지 않는가?

### Hook
- [ ] Presenter → Model 변환을 외부에서 수행하는가? (Mapper 사용)
- [ ] 서비스에 Model을 전달하는가?
- [ ] DTO를 직접 생성하지 않는가?

### API Route Handler
- [ ] 요청 Model → DTO 변환을 수행하는가? (Mapper 사용)
- [ ] 백엔드 서비스에 DTO를 전달하는가?
- [ ] 응답 Model을 그대로 반환하는가?

### Mapper
- [ ] Presenter ↔ Model 변환 메서드가 있는가?
- [ ] Model → DTO 변환 메서드가 있는가? (API Handler용)
- [ ] JSDoc으로 사용처를 명시했는가?

### Adapter
- [ ] DTO → Model 변환 메서드가 있는가?
- [ ] 필드명 매핑을 올바르게 처리하는가? (예: isActive → isPublic)

---

## 참고 자료

- [Naming Convention Rules](.cursor/rules/naming-convention.mdc)
- [Temporal API Rules](.cursor/rules/temporal-api.mdc)
- [API Flow Debugger Skill](.cursor/skills/project/api-flow-debugger/SKILL.md)
- [Model Change Impact Analyzer](.cursor/skills/project/model-change-impact-analyzer/SKILL.md)

---

**버전**: 1.0.0  
**최종 업데이트**: 2026-01-23  
**작성자**: AI Agent
