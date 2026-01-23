---
name: Adapter Design Pattern
description: Backend API 도메인(DTO)과 Frontend 도메인(Model) 간의 변환 계층 설계 및 구현 가이드
trigger:
  - Adapter
  - DTO 변환
  - Model 변환
  - 필드명 매핑
  - Request 변환
  - Response 변환
  - API 경계
  - 도메인 변환
  - CQRS 패턴
  - Command Model
  - Query Model
version: 1.0.0
author: AI Agent
created: 2026-01-23
updated: 2026-01-23
---

# Adapter Design Pattern

Backend API 도메인(DTO)과 Frontend 도메인(Model) 간의 변환 계층을 설계하고 구현하는 가이드입니다.

## 목차

1. [개념 및 원칙](#1-개념-및-원칙)
2. [설계 가이드](#2-설계-가이드)
3. [필드명 매핑 패턴](#3-필드명-매핑-패턴)
4. [구현 패턴](#4-구현-패턴)
5. [API Handler 연동](#5-api-handler-연동)
6. [검증 및 테스트](#6-검증-및-테스트)
7. [체크리스트](#7-체크리스트)
8. [참고 자료](#8-참고-자료)

---

## 1. 개념 및 원칙

### 1.1 Adapter란?

**정의**: Backend API 도메인(DTO)과 Frontend 도메인(Model) 간의 변환 계층

**역할**:
- 경계 계층에서의 데이터 변환
- 필드명 매핑 (예: `isPublic` ↔ `isActive`)
- 타입 변환 및 기본값 설정
- null/undefined 처리

**위치**: `api/_backend/modules/.../types/{domain}.adapter.ts`

### 1.2 CQRS 패턴 연계

Adapter는 CQRS(Command Query Responsibility Segregation) 패턴과 밀접하게 연관됩니다.

#### Command Models (요청 전용)

```typescript
// 생성 요청 (id, createdAt, updatedAt 제외)
interface CreateBrochureModel {
  code: Extract<DocumentCode, "brochure">;
  title: string;
  content?: string;
  // id, createdAt, updatedAt 제외
}

// 수정 요청 (부분 업데이트, optional 필드)
interface UpdateBrochureModel {
  title?: string;
  content?: string;
  isPublic?: boolean;
}
```

#### Query Models (응답 전용)

```typescript
// 읽기/응답 (전체 필드 포함)
interface BrochureModel {
  id: string;
  code: Extract<DocumentCode, "brochure">;
  title: string;
  content?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Adapter의 책임

- **Request 변환** (`to...Request` 계열):
  - Command Model → DTO 변환
  - API Handler에서 호출
  - 필드명 매핑 수행 (예: `isPublic` → `isActive`)

- **Response 변환** (`from...Response` 계열):
  - DTO → Query Model 변환
  - Backend Service 내부에서 호출
  - 필드명 역매핑 수행 (예: `isActive` → `isPublic`)

### 1.3 Rails Architecture 내 위치

Adapter는 **환승역(API Handler)**에서 레일을 전환하는 역할을 수행합니다.

```
Frontend
  ↓ (Model Rail)
  ↓
API Handler (환승역)
  ↓ Model 수신
  ↓ Adapter.to...Request(model) 호출
  ↓ DTO로 변환
  ↓ (DTO Rail)
  ↓
Backend Service
  ↓ DTO로 백엔드 API 호출
  ↓ Response DTO 수신
  ↓ Adapter.from...Response(dto) 호출 (내부)
  ↓ Model로 변환
  ↓ (Model Rail)
  ↓
API Handler
  ↓ Model 반환
  ↓
Frontend
```

**핵심 원칙**:
- **Model Rail**: Frontend Service, Hooks, Components는 Model만 사용
- **DTO Rail**: Backend Service, CMS API는 DTO만 사용
- **Adapter**: 두 레일 간의 변환기 역할

---

## 2. 설계 가이드

### 2.1 Adapter 클래스 구조

```typescript
export class BrochureAdapter {
  // ============================================
  // Response 변환: DTO → Model
  // ============================================
  
  /**
   * 단일 Brochure 응답 변환
   */
  static fromBrochureResponse(
    dto: BrochureResponseDto
  ): BrochureModel {
    // 구현...
  }

  /**
   * Brochure 목록 응답 변환
   */
  static fromBrochureListResponse(
    dto: BrochureListResponseDto
  ): BrochureListModel {
    // 구현...
  }

  /**
   * Brochure 페이지 응답 변환
   */
  static fromBrochurePageResponse(
    dto: BrochurePageResponseDto
  ): BrochurePageModel {
    // 구현...
  }

  // ============================================
  // Request 변환: Model → DTO
  // ============================================
  
  /**
   * Brochure 생성 요청 변환
   */
  static toCreateBrochureRequest(
    model: CreateBrochureModel
  ): CreateBrochureDto {
    // 구현...
  }

  /**
   * Brochure 수정 요청 변환
   */
  static toUpdateBrochureRequest(
    model: UpdateBrochureModel
  ): UpdateBrochureDto {
    // 구현...
  }

  /**
   * Brochure 공개 상태 수정 요청 변환
   */
  static toUpdateBrochurePublicRequest(
    model: UpdateBrochurePublicModel
  ): UpdateBrochurePublicDto {
    // 구현...
  }

  // ============================================
  // Category 변환 (하위 엔티티)
  // ============================================
  
  static fromCategoryResponse(
    dto: BrochureCategoryResponseDto
  ): BrochureCategoryModel {
    // 구현...
  }

  static toCreateCategoryRequest(
    model: CreateBrochureCategoryModel
  ): CreateBrochureCategoryDto {
    // 구현...
  }

  // ... 기타 Category 변환 메서드
}
```

### 2.2 메서드 네이밍 규칙

| 변환 방향 | 패턴 | 입력 타입 | 출력 타입 | 설명 |
|----------|------|----------|----------|------|
| 단일 Response | `from{Domain}Response` | `{Domain}ResponseDto` | `{Domain}Model` | 단일 엔티티 응답 변환 |
| 배열 Response | `from{Domain}ListResponse` | `{Domain}ListResponseDto` | `{Domain}ListModel` | 배열 응답 변환 |
| 페이지 Response | `from{Domain}PageResponse` | `{Domain}PageResponseDto` | `{Domain}PageModel` | 페이지네이션 응답 변환 |
| Create 요청 | `toCreate{Domain}Request` | `Create{Domain}Model` | `Create{Domain}Dto` | 생성 요청 변환 |
| Update 요청 | `toUpdate{Domain}Request` | `Update{Domain}Model` | `Update{Domain}Dto` | 수정 요청 변환 |
| 액션 요청 | `toUpdate{Domain}{Action}Request` | `Update{Domain}{Action}Model` | `Update{Domain}{Action}Dto` | 특정 액션 요청 변환 |
| 하위 엔티티 | `from{SubEntity}Response` | `{SubEntity}ResponseDto` | `{SubEntity}Model` | 하위 엔티티 응답 변환 |

### 2.3 입력 타입 결정 원칙

#### ✅ 권장: 명확한 Model 타입 사용

```typescript
/**
 * Category 생성 요청 변환
 * @param model - 명확한 타입의 생성 요청 모델
 */
static toCreateCategoryRequest(
  model: CreateBrochureCategoryModel  // ✅ 명확한 타입
): CreateBrochureCategoryDto {
  return {
    name: model.name,
    description: model.description,
    order: model.order,
  };
}
```

**장점**:
- 타입 안정성 향상
- 재사용 가능
- IDE 자동완성 지원
- 타입 변경 시 영향 범위 추적 가능

#### ⚠️ 비권장: 익명 객체 사용

```typescript
/**
 * Category 순서 변경 요청 변환
 * @param body - 익명 객체 (임시 방편)
 */
static toUpdateCategoryOrderRequest(body: {
  order: number;
  updatedBy?: string;
}): UpdateBrochureCategoryOrderDto {
  return {
    order: body.order,
    updatedBy: body.updatedBy,
  };
}
```

**문제점**:
- 타입 재사용 불가
- IDE 지원 제한적
- 유지보수 어려움

**개선 방법**:

```typescript
// {domain}.model.ts 파일에 추가
export interface UpdateBrochureCategoryOrderModel {
  order: number;
  updatedBy?: string;
}

// {domain}.adapter.ts에서 사용
static toUpdateCategoryOrderRequest(
  model: UpdateBrochureCategoryOrderModel  // ✅ 명확한 타입
): UpdateBrochureCategoryOrderDto {
  return {
    order: model.order,
    updatedBy: model.updatedBy,
  };
}
```

#### ❌ 절대 금지: unknown 타입 사용

```typescript
static toCreateRequest(body: unknown)  // ❌ 타입 불명확
```

**이유**:
- 타입 안정성 완전 상실
- 런타임 에러 위험
- IDE 자동완성 불가

---

## 3. 필드명 매핑 패턴

### 3.1 매핑 규칙 문서화

Adapter 클래스 상단에 필드명 매핑 규칙을 명시하세요.

```typescript
/**
 * BrochureAdapter
 * 
 * 필드명 매핑:
 *   Frontend Model       Backend DTO       변환 방향
 *   ---------------      -----------       ---------
 *   - isPublic       ↔   isActive          양방향
 *   - content        ↔   description       양방향
 *   - size (페이지)  →   limit             요청 시
 *   - name (파일)    ←   fileName          응답 시
 *   - url (파일)     ←   fileUrl           응답 시
 * 
 * 조건부 매핑:
 *   - null → undefined 변환
 *   - optional → required 변환 (기본값 설정)
 *   - code 필드는 Frontend 전용 (백엔드 미사용)
 */
export class BrochureAdapter {
  // ...
}
```

### 3.2 매핑 테이블

| Frontend Model | Backend DTO | 변환 방향 | 비고 |
|---------------|-------------|----------|------|
| `isPublic` | `isActive` | 양방향 | boolean 타입 |
| `content` | `description` | 양방향 | optional string |
| `size` (페이지네이션) | `limit` | 요청 시 | 숫자 타입 |
| `page` | `page` | 양방향 | 1-based indexing |
| `name` (파일) | `fileName` | 응답 시 | 첨부파일 |
| `url` (파일) | `fileUrl` | 응답 시 | 첨부파일 |
| `code` | - | Frontend 전용 | 백엔드 미사용 |

### 3.3 조건부 매핑 규칙

#### null → undefined 변환

```typescript
static fromBrochureResponse(
  dto: BrochureResponseDto
): BrochureModel {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.description ?? undefined,  // ✅ null → undefined
    // ...
  };
}
```

#### Optional → Required 변환 (기본값 설정)

```typescript
static toUpdateBrochureRequest(
  model: UpdateBrochureModel
): UpdateBrochureDto {
  return {
    title: model.title || "",  // ✅ optional → required (빈 문자열)
    isActive: model.isPublic ?? true,  // ✅ 기본값 설정
    // ...
  };
}
```

#### 배열 변환

```typescript
static fromBrochureResponse(
  dto: BrochureResponseDto
): BrochureModel {
  return {
    id: dto.id,
    categories: dto.categories?.map(cat => 
      this.fromCategoryResponse(cat)
    ) ?? [],  // ✅ null/undefined → 빈 배열
    // ...
  };
}
```

---

## 4. 구현 패턴

### 4.1 Response 변환 구현

#### 단일 엔티티 응답

```typescript
/**
 * Brochure 응답 변환
 * 
 * 필드명 매핑:
 *   - isActive → isPublic
 *   - description → content
 */
static fromBrochureResponse(
  dto: BrochureResponseDto
): BrochureModel {
  return {
    id: dto.id,
    code: "brochure",  // ✅ 고정값 (Frontend 전용)
    title: dto.title,
    content: dto.description ?? undefined,  // ✅ 필드명 매핑 + null 처리
    isPublic: dto.isActive,  // ✅ 필드명 매핑
    categoryId: dto.categoryId ?? undefined,
    order: dto.order,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy ?? undefined,
    updatedBy: dto.updatedBy ?? undefined,
  };
}
```

#### 목록 응답

```typescript
/**
 * Brochure 목록 응답 변환
 */
static fromBrochureListResponse(
  dto: BrochureListResponseDto
): BrochureListModel {
  return {
    items: dto.items.map(item => this.fromBrochureResponse(item)),
    total: dto.total,
  };
}
```

#### 페이지네이션 응답

```typescript
/**
 * Brochure 페이지 응답 변환
 */
static fromBrochurePageResponse(
  dto: BrochurePageResponseDto
): BrochurePageModel {
  return {
    items: dto.items.map(item => this.fromBrochureResponse(item)),
    pagination: {
      page: dto.page,
      size: dto.limit,  // ✅ 필드명 매핑: limit → size
      total: dto.total,
      totalPages: Math.ceil(dto.total / dto.limit),
    },
  };
}
```

#### 하위 엔티티 응답

```typescript
/**
 * Category 응답 변환
 * 
 * 필드명 매핑:
 *   - isActive → isPublic
 */
static fromCategoryResponse(
  dto: BrochureCategoryResponseDto
): BrochureCategoryModel {
  return {
    id: dto.id,
    code: "brochure",  // ✅ 고정값
    name: dto.name,
    description: dto.description ?? undefined,
    order: dto.order,
    isPublic: dto.isActive,  // ✅ 필드명 매핑
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
```

### 4.2 Request 변환 구현

#### Create 요청

```typescript
/**
 * Brochure 생성 요청 변환
 * 
 * 제외 필드:
 *   - id, createdAt, updatedAt (서버에서 생성)
 *   - code (Frontend 전용, 백엔드 미사용)
 */
static toCreateBrochureRequest(
  model: CreateBrochureModel
): CreateBrochureDto {
  return {
    title: model.title,
    description: model.content,  // ✅ 필드명 매핑
    categoryId: model.categoryId,
    order: model.order,
    createdBy: model.createdBy,
    // code 필드 제외 (백엔드 미사용)
  };
}
```

#### Update 요청

```typescript
/**
 * Brochure 수정 요청 변환
 * 
 * 필드명 매핑:
 *   - content → description
 *   - isPublic → isActive
 */
static toUpdateBrochureRequest(
  model: UpdateBrochureModel
): UpdateBrochureDto {
  return {
    title: model.title || "",  // ✅ optional → required
    description: model.content,  // ✅ 필드명 매핑
    isActive: model.isPublic ?? true,  // ✅ 필드명 매핑 + 기본값
    categoryId: model.categoryId,
    order: model.order,
    updatedBy: model.updatedBy,
  };
}
```

#### 특정 액션 요청

```typescript
/**
 * Brochure 공개 상태 수정 요청 변환
 * 
 * 필드명 매핑:
 *   - isPublic → isActive
 */
static toUpdateBrochurePublicRequest(
  model: UpdateBrochurePublicModel
): UpdateBrochurePublicDto {
  return {
    isActive: model.isPublic,  // ✅ 필드명 매핑
    updatedBy: model.updatedBy,
  };
}
```

#### Category 요청

```typescript
/**
 * Category 생성 요청 변환
 */
static toCreateCategoryRequest(
  model: CreateBrochureCategoryModel
): CreateBrochureCategoryDto {
  return {
    name: model.name,
    description: model.description,
    order: model.order,
    createdBy: model.createdBy,
  };
}

/**
 * Category 수정 요청 변환
 */
static toUpdateCategoryRequest(
  model: UpdateBrochureCategoryModel
): UpdateBrochureCategoryDto {
  return {
    name: model.name || "",
    description: model.description,
    isActive: model.isPublic ?? true,  // ✅ 필드명 매핑
    updatedBy: model.updatedBy,
  };
}
```

---

## 5. API Handler 연동

### 5.1 요청 변환 (Handler → Backend)

API Handler는 **환승역** 역할을 수행하며, Adapter를 사용해 Model을 DTO로 변환합니다.

```typescript
// API Handler: route.ts
import { BrochureModule } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/brochure.module";
import { BrochureAdapter } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter";
import type { CreateBrochureCategoryModel } from "@/app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model";

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization");
  
  // ✅ Model 수신
  const body: CreateBrochureCategoryModel = await request.json();

  // ✅ Adapter로 Model → DTO 변환
  const dto = BrochureAdapter.toCreateCategoryRequest(body);

  // ✅ Backend Service 호출 (DTO 전달)
  const service = BrochureModule.getInstance().getBrochureService(token);
  const result = await service.createCategory(dto);

  // result는 ServiceResponse<BrochureCategoryModel> 타입
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  // ✅ Model 반환
  return NextResponse.json(result.data);
}
```

### 5.2 응답 변환 (Backend → Handler)

Backend Service는 내부적으로 Adapter를 사용해 DTO를 Model로 변환합니다.

```typescript
// Backend Service: brochure.service.ts
import { BrochureAdapter } from "./types/brochure.adapter";
import type { 
  CreateBrochureCategoryDto, 
  BrochureCategoryResponseDto 
} from "./types/brochure.dto";
import type { BrochureCategoryModel } from "@/app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model";

export class BrochureService {
  /**
   * Category 생성
   */
  async createCategory(
    dto: CreateBrochureCategoryDto
  ): Promise<ServiceResponse<BrochureCategoryModel>> {
    return this.handleApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}/brochure/categories`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(dto),  // ✅ DTO 전송
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      // ✅ Adapter로 DTO → Model 변환 (내부)
      return BrochureAdapter.fromCategoryResponse(
        result as BrochureCategoryResponseDto
      );
    }, "카테고리 생성 중 오류가 발생했습니다.");
  }
}
```

### 5.3 전체 흐름 요약

```
1. Frontend Service
   ↓ (Model)
   
2. API Handler (환승역)
   ↓ Model 수신
   ↓ Adapter.toCreateRequest(model)
   ↓ DTO로 변환
   
3. Backend Service
   ↓ DTO로 CMS API 호출
   ↓ Response DTO 수신
   ↓ Adapter.fromResponse(dto) (내부)
   ↓ Model로 변환
   
4. API Handler
   ↓ Model 반환
   
5. Frontend Service
   ↓ (Model)
```

**핵심 원칙**:
- API Handler는 Model ↔ DTO 변환만 수행
- Backend Service는 DTO만 사용해 API 호출
- Frontend Service는 Model만 사용

---

## 6. 검증 및 테스트

### 6.1 타입 검증

#### 입력/출력 타입 일치 확인

```typescript
// ✅ 타입 검증 통과
const dto: CreateBrochureCategoryDto = BrochureAdapter.toCreateCategoryRequest(
  model as CreateBrochureCategoryModel
);

const model: BrochureCategoryModel = BrochureAdapter.fromCategoryResponse(
  dto as BrochureCategoryResponseDto
);
```

#### 필드명 매핑 검증

```typescript
// ✅ 매핑 검증
const dto = { isActive: true };
const model = BrochureAdapter.fromCategoryResponse(dto);
expect(model.isPublic).toBe(true);  // isActive → isPublic
```

### 6.2 데이터 변환 검증

#### 유닛 테스트 예시

```typescript
import { describe, it, expect } from "vitest";
import { BrochureAdapter } from "./brochure.adapter";
import type { 
  CreateBrochureCategoryModel, 
  BrochureCategoryResponseDto 
} from "./types";

describe("BrochureAdapter", () => {
  describe("toCreateCategoryRequest", () => {
    it("should convert CreateModel to CreateDto", () => {
      const model: CreateBrochureCategoryModel = {
        code: "brochure",
        name: "Test Category",
        description: "Test Description",
        order: 1,
        createdBy: "user-1",
      };

      const dto = BrochureAdapter.toCreateCategoryRequest(model);

      expect(dto.name).toBe("Test Category");
      expect(dto.description).toBe("Test Description");
      expect(dto.order).toBe(1);
      expect(dto.createdBy).toBe("user-1");
      expect(dto).not.toHaveProperty("code");  // ✅ 백엔드 미사용
    });

    it("should handle optional fields", () => {
      const model: CreateBrochureCategoryModel = {
        code: "brochure",
        name: "Test Category",
        order: 1,
        // description 생략
      };

      const dto = BrochureAdapter.toCreateCategoryRequest(model);

      expect(dto.name).toBe("Test Category");
      expect(dto.description).toBeUndefined();
    });
  });

  describe("fromCategoryResponse", () => {
    it("should convert ResponseDto to Model with field mapping", () => {
      const dto: BrochureCategoryResponseDto = {
        id: "cat-1",
        name: "Test Category",
        description: "Test Description",
        isActive: true,  // DTO 필드
        order: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const model = BrochureAdapter.fromCategoryResponse(dto);

      expect(model.id).toBe("cat-1");
      expect(model.code).toBe("brochure");  // ✅ 고정값 확인
      expect(model.isPublic).toBe(true);  // ✅ 매핑 확인: isActive → isPublic
      expect(model.name).toBe("Test Category");
    });

    it("should handle null values", () => {
      const dto: BrochureCategoryResponseDto = {
        id: "cat-1",
        name: "Test Category",
        description: null,  // null 값
        isActive: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const model = BrochureAdapter.fromCategoryResponse(dto);

      expect(model.description).toBeUndefined();  // ✅ null → undefined
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve data through Model → DTO → Model conversion", () => {
      const originalModel: BrochureCategoryModel = {
        id: "cat-1",
        code: "brochure",
        name: "Test Category",
        description: "Test Description",
        isPublic: true,
        order: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      // Model → DTO
      const updateModel: UpdateBrochureCategoryModel = {
        name: originalModel.name,
        description: originalModel.description,
        isPublic: originalModel.isPublic,
      };
      const dto = BrochureAdapter.toUpdateCategoryRequest(updateModel);

      // DTO → Model (백엔드 응답 시뮬레이션)
      const responseDto: BrochureCategoryResponseDto = {
        id: originalModel.id,
        name: dto.name,
        description: dto.description ?? null,
        isActive: dto.isActive ?? true,
        order: originalModel.order,
        createdAt: originalModel.createdAt,
        updatedAt: originalModel.updatedAt,
      };
      const resultModel = BrochureAdapter.fromCategoryResponse(responseDto);

      // 검증
      expect(resultModel.name).toBe(originalModel.name);
      expect(resultModel.description).toBe(originalModel.description);
      expect(resultModel.isPublic).toBe(originalModel.isPublic);
    });
  });
});
```

### 6.3 엔드투엔드 흐름 검증

#### 통합 테스트 예시

```typescript
describe("Brochure API Integration", () => {
  it("should create category with correct data flow", async () => {
    // 1. Frontend Model 생성
    const createModel: CreateBrochureCategoryModel = {
      code: "brochure",
      name: "New Category",
      order: 1,
    };

    // 2. API Handler 호출
    const response = await fetch("/api/cms/admin/homepage/brochure-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createModel),
    });

    // 3. 응답 검증
    expect(response.ok).toBe(true);
    
    const result: BrochureCategoryModel = await response.json();
    
    // 4. Model 검증
    expect(result.id).toBeDefined();
    expect(result.code).toBe("brochure");
    expect(result.name).toBe("New Category");
    expect(result.order).toBe(1);
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });
});
```

---

## 7. 체크리스트

Adapter 구현 시 다음 항목을 확인하세요:

### 파일 구조
- [ ] Adapter 클래스 생성 (`{domain}.adapter.ts`)
- [ ] 파일 위치: `api/_backend/modules/.../types/{domain}.adapter.ts`

### 문서화
- [ ] 필드명 매핑 주석 작성 (클래스 상단)
- [ ] 각 메서드에 JSDoc 주석 추가
- [ ] 매핑 규칙 명시 (양방향/단방향)

### Response 변환 메서드
- [ ] `from{Domain}Response` 구현
- [ ] `from{Domain}ListResponse` 구현 (필요 시)
- [ ] `from{Domain}PageResponse` 구현 (필요 시)
- [ ] 하위 엔티티 변환 메서드 구현 (필요 시)

### Request 변환 메서드
- [ ] `toCreate{Domain}Request` 구현
- [ ] `toUpdate{Domain}Request` 구현
- [ ] 액션별 변환 메서드 구현 (필요 시)

### 타입 안정성
- [ ] 입력 타입 명확하게 정의 (unknown 사용 금지)
- [ ] Model 타입 우선 사용 (익명 객체 최소화)
- [ ] 반환 타입 명시

### 필드 처리
- [ ] 필드명 매핑 수행 (예: `isPublic` ↔ `isActive`)
- [ ] null → undefined 변환
- [ ] optional → required 변환 (기본값 설정)
- [ ] Frontend 전용 필드 처리 (예: `code`)
- [ ] 백엔드 미사용 필드 제외

### API Handler 연동
- [ ] API Handler에서 Adapter 사용
- [ ] Model → DTO 변환 수행
- [ ] Backend Service로 DTO 전달

### Backend Service 연동
- [ ] Backend Service에서 Adapter 사용 (내부)
- [ ] DTO → Model 변환 수행
- [ ] Model 반환

### 검증
- [ ] 타입 검증 통과
- [ ] 데이터 변환 검증 통과
- [ ] 유닛 테스트 작성
- [ ] 왕복 변환 테스트 (Model → DTO → Model)
- [ ] 통합 테스트 작성 (선택)

---

## 8. 참고 자료

### 8.1 기존 구현 예시

#### Brochure Adapter
- [`brochure.adapter.ts`](../../../../api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter.ts)
  - 타입 명확, 일관된 패턴
  - 필드명 매핑 예시: `isActive` ↔ `isPublic`

#### DTO 정의
- [`brochure.dto.ts`](../../../../api/_backend/modules/cms/admin/homepage/brochure/types/brochure.dto.ts)
  - DTO 인터페이스 정의
  - Request/Response DTO 분리

#### Model 정의
- [`brochure.model.ts`](../../../../../(current)/current/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model.ts)
  - Model 인터페이스 정의
  - Command/Query Model 분리

#### API Handler
- [`route.ts`](../../../../api/(cms)/cms/(admin)/homepage/(brochure)/brochure-categories/route.ts)
  - Adapter 사용 예시
  - Model ↔ DTO 변환

#### Backend Service
- [`brochure.service.ts`](../../../../../(current)/current/(cms)/cms/(admin)/homepage/brochure/_services/brochure.service.ts)
  - Adapter 사용 예시 (내부)
  - API 호출 및 변환

### 8.2 관련 스킬

- [Rails Architecture](../rails-architecture/SKILL.md)
  - 데이터 흐름 및 레일 개념
  - 환승역(API Handler) 역할

- [API Flow Debugger](../api-flow-debugger/SKILL.md)
  - 타입 불일치 디버깅
  - 데이터 흐름 추적

- [Model Change Impact Analyzer](../model-change-impact-analyzer/SKILL.md)
  - Model 변경 시 영향 분석
  - Adapter 업데이트 가이드

### 8.3 규칙

- [Naming Convention](../../../../.cursor/rules/naming-convention.mdc)
  - 파일/클래스/메서드 네이밍 규칙
  - 타입 계층 구조

- [Temporal API](../../../../.cursor/rules/temporal-api.mdc)
  - 날짜/시간 처리 규칙
  - 타임스탬프 생성

### 8.4 추가 리소스

- **CQRS 패턴**: [Martin Fowler - CQRS](https://martinfowler.com/bliki/CQRS.html)
- **Adapter 패턴**: [Refactoring Guru - Adapter Pattern](https://refactoring.guru/design-patterns/adapter)
- **DTO vs Model**: [StackOverflow - DTO vs Domain Model](https://stackoverflow.com/questions/1058250/what-is-the-difference-between-a-dto-and-a-domain-model)

---

## 9. 자주 묻는 질문 (FAQ)

### Q1. Adapter와 Mapper의 차이는?

**Adapter**:
- 위치: `api/_backend/modules/.../types/{domain}.adapter.ts`
- 역할: Backend API 도메인(DTO) ↔ Frontend 도메인(Model) 변환
- 필드명 매핑 수행 (예: `isPublic` ↔ `isActive`)
- 경계 계층에서 사용

**Mapper**:
- 위치: `(current)/(cms)/.../_types/{domain}.mapper.ts`
- 역할: Model ↔ Presenter 변환
- 필드명 매핑 없음 (동일한 도메인 내)
- Frontend 내부에서 사용

### Q2. 언제 익명 객체 대신 Model 타입을 정의해야 하나?

**Model 타입 정의 권장**:
- 타입이 2회 이상 사용될 때
- 다른 파일에서 참조할 때
- IDE 자동완성이 필요할 때
- 타입 안정성이 중요할 때

**익명 객체 허용**:
- 일회성 타입
- 매우 간단한 구조 (1-2개 필드)
- 임시 구현 (추후 리팩토링 예정)

### Q3. null과 undefined 처리 규칙은?

**기본 원칙**:
- Backend DTO: `null` 사용
- Frontend Model: `undefined` 사용

**변환 규칙**:
```typescript
// DTO → Model: null → undefined
content: dto.description ?? undefined

// Model → DTO: undefined → null (자동)
description: model.content  // undefined는 JSON에서 생략됨
```

### Q4. 페이지네이션 필드명 매핑은?

| Frontend | Backend | 설명 |
|----------|---------|------|
| `page` | `page` | 페이지 번호 (1-based) |
| `size` | `limit` | 페이지 크기 |
| `total` | `total` | 전체 항목 수 |
| `totalPages` | - | Frontend 계산 |

```typescript
static fromPageResponse(dto: PageResponseDto): PageModel {
  return {
    items: dto.items.map(item => this.fromResponse(item)),
    pagination: {
      page: dto.page,
      size: dto.limit,  // ✅ limit → size
      total: dto.total,
      totalPages: Math.ceil(dto.total / dto.limit),
    },
  };
}
```

### Q5. Adapter 테스트는 필수인가?

**권장**:
- 필드명 매핑이 있는 경우: **필수**
- 복잡한 변환 로직이 있는 경우: **필수**
- 단순 1:1 매핑: 선택

**최소 테스트**:
- 필드명 매핑 검증
- null/undefined 처리 검증
- 왕복 변환 검증 (Model → DTO → Model)

---

## 10. 버전 히스토리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0.0 | 2026-01-23 | 초기 버전 작성 | AI Agent |

---

**문서 끝**
