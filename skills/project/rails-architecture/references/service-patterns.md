# Rails Architecture - 서비스 패턴 상세 가이드

> 각 정거장의 역할과 책임

## 목차
1. [정거장 2: 프론트엔드 서비스](#정거장-2-프론트엔드-서비스)
2. [정거장 3: 백엔드 API 서비스](#정거장-3-백엔드-api-서비스)
3. [환승역: API Route Handler](#환승역-api-route-handler)
4. [실전 예시 (전체 레일 여정)](#실전-예시-전체-레일-여정)

---

## 정거장 2: 프론트엔드 서비스

### 역할
- Model Rail에서 운행하는 정거장
- Next.js API Route와 통신
- UI 도메인(Model) 기반 처리
- 프론트엔드 비즈니스 로직 캡슐화

### 위치
```
portal/src/app/(current)/current/(cms)/cms/(admin)/homepage/{domain}/_services/
```

### 구조

```typescript
// {domain}.service.ts
import { BROCHURE_API } from "./brochure.endpoints";
import type { BrochureService } from "@/app/(planning)/...";
import { BrochureMapper } from "@/app/(planning)/...";
import type { ApiResponse } from "@/app/(planning)/...";
import type {
  BrochureModel,
  CreateBrochureModel,
  UpdateBrochureModel,
} from "@/app/(planning)/...";
import type { BrochurePresenter } from "@/app/(planning)/...";

export class CurrentBrochureService implements BrochureService {
  
  // ============================================
  // 목록 조회
  // ============================================
  
  async 브로슈어_목록을_조회한다(
    params?: BrochureListParams
  ): Promise<ApiResponse<BrochuresModel>> {
    try {
      // 쿼리 파라미터 구성
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", String(params.page));
      if (params?.size) searchParams.append("size", String(params.size));
      
      const queryString = searchParams.toString();
      const url = queryString
        ? `${BROCHURE_API.브로슈어_목록_조회}?${queryString}`
        : BROCHURE_API.브로슈어_목록_조회;
      
      // Next.js API Route 호출
      const response = await fetch(url, {
        credentials: "include",
      });
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message || "목록 조회에 실패했습니다.",
        };
      }
      
      // ✅ 응답 Model → Presenter 변환 (내부)
      const presenters = result.data.items.map((model: BrochureModel) =>
        BrochureMapper.fromModel(model)
      );
      
      return {
        success: true,
        data: {
          items: presenters,
          page: result.data.page,
          size: result.data.size,
          total: result.data.total,
          totalPages: result.data.totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "목록 조회 실패",
      };
    }
  }
  
  // ============================================
  // 단건 조회
  // ============================================
  
  async 브로슈어를_조회한다(
    brochureId: string
  ): Promise<ApiResponse<BrochurePresenter>> {
    try {
      const response = await fetch(
        BROCHURE_API.브로슈어_상세_조회(brochureId),
        { credentials: "include" }
      );
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message || "조회에 실패했습니다.",
        };
      }
      
      // ✅ 응답 Model → Presenter 변환 (내부)
      const presenter = BrochureMapper.fromModel(result.data);
      
      return { success: true, data: presenter };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "조회 실패",
      };
    }
  }
  
  // ============================================
  // 생성
  // ============================================
  
  async 브로슈어를_생성한다(
    data: CreateBrochureModel
  ): Promise<ApiResponse<BrochurePresenter>> {
    try {
      // ✅ Model을 그대로 전송
      const response = await fetch(BROCHURE_API.브로슈어_생성, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),  // Model
        credentials: "include",
      });
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message || "생성에 실패했습니다.",
        };
      }
      
      // ✅ 응답 Model → Presenter 변환 (내부)
      const presenter = BrochureMapper.fromModel(result.data);
      
      return { success: true, data: presenter };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "생성 실패",
      };
    }
  }
  
  // ============================================
  // 수정
  // ============================================
  
  async 브로슈어를_수정한다(
    brochureId: string,
    data: UpdateBrochureModel
  ): Promise<ApiResponse<BrochurePresenter>> {
    try {
      // ✅ Model을 그대로 전송
      const response = await fetch(BROCHURE_API.브로슈어_수정(brochureId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),  // Model
        credentials: "include",
      });
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message || "수정에 실패했습니다.",
        };
      }
      
      // ✅ 응답 Model → Presenter 변환 (내부)
      const presenter = BrochureMapper.fromModel(result.data);
      
      return { success: true, data: presenter };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "수정 실패",
      };
    }
  }
  
  // ============================================
  // 삭제
  // ============================================
  
  async 브로슈어를_삭제한다(
    brochureId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(BROCHURE_API.브로슈어_삭제(brochureId), {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message || "삭제에 실패했습니다.",
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "삭제 실패",
      };
    }
  }
}
```

### 핵심 포인트

1. **Model 타입만 사용**
   - 입력: `CreateBrochureModel`, `UpdateBrochureModel`
   - 출력: `BrochurePresenter` (Model 변환 후)
   - DTO 사용 금지

2. **내부 변환**
   - 응답 Model → Presenter 변환
   - Mapper 사용

3. **에러 처리**
   - try-catch로 모든 에러 캐치
   - `ApiResponse<T>` 타입 반환

---

## 정거장 3: 백엔드 API 서비스

### 역할
- DTO Rail에서 운행하는 정거장
- CMS 백엔드 API와 통신
- API 도메인(DTO) 기반 처리
- 백엔드 API 계약 준수

### 위치
```
portal/src/app/api/_backend/modules/cms/admin/homepage/{domain}/
```

### 구조

```typescript
// {domain}.service.ts
import {
  BaseService,
  ServiceResponse,
} from "@/app/api/_backend/common/base.service";
import { BrochureServiceInterface } from "./brochure.service.interface";
import { BROCHURE_ENDPOINTS } from "./brochure.endpoints";
import { BrochureAdapter } from "./types/brochure.adapter";
import type {
  BrochureResponseDto,
  BrochureListResponseDto,
  CreateBrochureDto,
  UpdateBrochureDto,
} from "./types/brochure.dto";
import type {
  BrochureModel,
  BrochuresModel,
} from "@/app/(planning)/...";

export class BrochureService
  extends BaseService
  implements BrochureServiceInterface
{
  constructor(accessToken?: string) {
    super(accessToken);
  }
  
  // ============================================
  // 목록 조회
  // ============================================
  
  async getBrochures(
    searchParams?: URLSearchParams
  ): Promise<ServiceResponse<BrochuresModel>> {
    return this.handleApiCall(async () => {
      const queryString = searchParams?.toString() ?? "";
      const endpoint = queryString
        ? `${BROCHURE_ENDPOINTS.브로슈어_목록_조회}?${queryString}`
        : BROCHURE_ENDPOINTS.브로슈어_목록_조회;
      
      // CMS 백엔드 API 호출
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "브로슈어 목록 조회 실패");
      }
      
      // ✅ 응답 DTO → Model 변환 (내부, Adapter)
      return BrochureAdapter.fromBrochuresResponse(
        result as BrochureListResponseDto
      );
    }, "브로슈어 목록 조회에 실패했습니다.");
  }
  
  // ============================================
  // 단건 조회
  // ============================================
  
  async getBrochure(id: string): Promise<ServiceResponse<BrochureModel>> {
    if (!id?.trim()) {
      return {
        success: false,
        message: "브로슈어 ID가 필요합니다.",
      };
    }
    
    return this.handleApiCall(async () => {
      const response = await fetch(BROCHURE_ENDPOINTS.브로슈어_상세_조회(id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "브로슈어 조회 실패");
      }
      
      // ✅ 응답 DTO → Model 변환 (내부, Adapter)
      return BrochureAdapter.fromBrochureResponse(
        result.data as BrochureResponseDto
      );
    }, "브로슈어 조회에 실패했습니다.");
  }
  
  // ============================================
  // 생성
  // ============================================
  
  async createBrochure(
    dto: CreateBrochureDto
  ): Promise<ServiceResponse<BrochureModel>> {
    return this.handleApiCall(async () => {
      // ✅ DTO를 그대로 전송
      const response = await fetch(BROCHURE_ENDPOINTS.브로슈어_생성, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(dto),  // DTO
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "브로슈어 생성 실패");
      }
      
      // ✅ 응답 DTO → Model 변환 (내부, Adapter)
      return BrochureAdapter.fromBrochureResponse(
        result.data as BrochureResponseDto
      );
    }, "브로슈어 생성에 실패했습니다.");
  }
  
  // ============================================
  // 수정
  // ============================================
  
  async updateBrochure(
    id: string,
    dto: UpdateBrochureDto
  ): Promise<ServiceResponse<BrochureModel>> {
    if (!id?.trim()) {
      return {
        success: false,
        message: "브로슈어 ID가 필요합니다.",
      };
    }
    
    return this.handleApiCall(async () => {
      // ✅ DTO를 그대로 전송
      const response = await fetch(BROCHURE_ENDPOINTS.브로슈어_수정(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(dto),  // DTO
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "브로슈어 수정 실패");
      }
      
      // ✅ 응답 DTO → Model 변환 (내부, Adapter)
      return BrochureAdapter.fromBrochureResponse(
        result.data as BrochureResponseDto
      );
    }, "브로슈어 수정에 실패했습니다.");
  }
  
  // ============================================
  // 삭제
  // ============================================
  
  async deleteBrochure(
    id: string
  ): Promise<ServiceResponse<{ deleted: boolean }>> {
    if (!id?.trim()) {
      return {
        success: false,
        message: "브로슈어 ID가 필요합니다.",
      };
    }
    
    return this.handleApiCall(async () => {
      const response = await fetch(BROCHURE_ENDPOINTS.브로슈어_삭제(id), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "브로슈어 삭제 실패");
      }
      
      return { deleted: true };
    }, "브로슈어 삭제에 실패했습니다.");
  }
}
```

### 핵심 포인트

1. **DTO 타입만 사용**
   - 입력: `CreateBrochureDto`, `UpdateBrochureDto`
   - 출력: `BrochureModel` (DTO 변환 후)
   - Model(프론트 도메인) 사용 금지

2. **BaseService 상속**
   - `handleApiCall()` 사용
   - 공통 에러 처리
   - `ServiceResponse<T>` 반환

3. **파라미터 검증**
   - ID 필수 체크
   - 조기 반환

4. **내부 변환**
   - 응답 DTO → Model 변환
   - Adapter 사용

---

## 환승역: API Route Handler

### 역할
- Model Rail과 DTO Rail의 환승역 🔄
- 프론트엔드와 백엔드 API 서비스 연결
- **레일 전환 지점**: Model ↔ DTO 변환 경계
- 인증/권한 처리

### 위치
```
portal/src/app/api/cms/homepage/{domain}s/
  ├── route.ts              # GET, POST (목록, 생성)
  └── [id]/
      └── route.ts          # GET, PATCH, DELETE (단건)
```

### 구조

```typescript
// api/cms/homepage/brochures/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BrochureService } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/brochure.service";
import { BrochureMapper } from "@/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_services/brochure.mapper";

/**
 * GET /api/cms/homepage/brochures
 * 브로슈어 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    
    // 백엔드 서비스 호출
    const service = new BrochureService();
    const result = await service.getBrochures(searchParams);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    
    // ✅ Model 그대로 반환 (이미 Adapter에서 변환됨)
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

/**
 * POST /api/cms/homepage/brochures
 * 브로슈어 생성
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 body 파싱 (Model)
    const body = await request.json();
    
    // 2. Model → DTO 변환 (Mapper 사용)
    const dto = BrochureMapper.toCreateDto(body);
    
    // 3. 백엔드 서비스 호출 (DTO 전달)
    const service = new BrochureService();
    const result = await service.createBrochure(dto);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    
    // 4. 응답 Model 반환 (이미 변환됨)
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

```typescript
// api/cms/homepage/brochures/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { BrochureService } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/brochure.service";
import { BrochureMapper } from "@/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_services/brochure.mapper";

/**
 * GET /api/cms/homepage/brochures/[id]
 * 브로슈어 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = new BrochureService();
    const result = await service.getBrochure(params.id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }
    
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

/**
 * PATCH /api/cms/homepage/brochures/[id]
 * 브로슈어 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 요청 body 파싱 (Model)
    const body = await request.json();
    
    // 2. Model → DTO 변환 (Mapper 사용)
    const dto = BrochureMapper.toUpdateDto(body);
    
    // 3. 백엔드 서비스 호출 (DTO 전달)
    const service = new BrochureService();
    const result = await service.updateBrochure(params.id, dto);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    
    // 4. 응답 Model 반환
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

/**
 * DELETE /api/cms/homepage/brochures/[id]
 * 브로슈어 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = new BrochureService();
    const result = await service.deleteBrochure(params.id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
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

### 핵심 포인트

1. **변환 경계**
   - 요청: Model → DTO (Mapper)
   - 응답: Model 그대로 (이미 Adapter에서 변환됨)

2. **에러 처리**
   - HTTP 상태 코드 적절히 설정
   - 에러 메시지 반환

3. **인증**
   - BaseService가 쿠키에서 토큰 자동 추출
   - 별도 인증 처리 불필요 (현재 구조)

---

## 실전 예시 (전체 레일 여정)

### 브로슈어 수정 - 데이터가 레일을 따라 흐르는 과정

```typescript
// 1. UI Component
function BrochureForm() {
  const { updateBrochure } = useUpdateBrochure();
  
  const handleSubmit = async (presenter: BrochurePresenter) => {
    await updateBrochure(id, presenter);  // Presenter 전달
  };
}

// 2. Hook
export function useUpdateBrochure() {
  const { 브로슈어를_수정한다 } = useBrochureService();
  
  const updateBrochure = useCallback(
    async (id: string, presenter: BrochurePresenter) => {
      // ✅ Presenter → Model 변환 (외부)
      const model = BrochureMapper.toUpdateModel(presenter);
      
      // ✅ 서비스에 Model 전달
      const response = await 브로슈어를_수정한다(id, model);
      
      if (!response.success) {
        throw new Error(response.error);
      }
      
      await mutate(cacheKey);
      return response.data;
    },
    [브로슈어를_수정한다]
  );
  
  return { updateBrochure };
}

// 3. Frontend Service
export class CurrentBrochureService {
  async 브로슈어를_수정한다(
    id: string,
    data: UpdateBrochureModel  // ✅ Model 받음
  ): Promise<ApiResponse<BrochurePresenter>> {
    // ✅ Model을 그대로 전송
    const response = await fetch(API, {
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    // ✅ 응답 Model → Presenter 변환 (내부)
    const presenter = BrochureMapper.fromModel(result.data);
    
    return { success: true, data: presenter };
  }
}

// 4. API Route Handler
export async function PATCH(request: NextRequest) {
  const body = await request.json();  // Model
  
  // ✅ Model → DTO 변환 (Handler에서)
  const dto = BrochureMapper.toUpdateDto(body);
  
  // ✅ 백엔드 서비스에 DTO 전달
  const service = new BrochureService();
  const result = await service.updateBrochure(id, dto);
  
  // ✅ 응답 Model 반환
  return NextResponse.json({ success: true, data: result.data });
}

// 5. Backend Service
export class BrochureService extends BaseService {
  async updateBrochure(
    id: string,
    dto: UpdateBrochureDto  // ✅ DTO 받음
  ): Promise<ServiceResponse<BrochureModel>> {
    return this.handleApiCall(async () => {
      // ✅ DTO를 그대로 전송
      const response = await fetch(CMS_API, {
        body: JSON.stringify(dto),
      });
      
      const result = await response.json();
      
      // ✅ 응답 DTO → Model 변환 (내부, Adapter)
      return BrochureAdapter.fromResponse(result.data);
    }, "수정 실패");
  }
}
```

### 레일 여정 정리

```
UI Component (출발점) 🚉
  ↓ Presenter Rail 🚂
Hook (정거장 1) - 외부 변환
  ↓ Presenter → Model (Mapper)
  ↓ Model Rail 🚂
Frontend Service (정거장 2)
  ↓ Model Rail 🚂
API Handler (환승역 🔄) - 레일 전환!
  ↓ Model → DTO (Mapper)
  ↓ DTO Rail 🚂
Backend Service (정거장 3)
  ↓ DTO Rail 🚂
CMS Backend API (종착역) 🏁
  ↓ DTO Rail 🚂 (복귀)
Backend Service (정거장 3) - 내부 변환
  ↓ DTO → Model (Adapter)
  ↓ Model Rail 🚂
API Handler (환승역 🔄) - Model 유지
  ↓ Model Rail 🚂
Frontend Service (정거장 2) - 내부 변환
  ↓ Model → Presenter (Mapper)
  ↓ Presenter Rail 🚂
Hook (정거장 1)
  ↓ Presenter Rail 🚂
UI Component (출발점 복귀) 🚉
```

---

## 요약

### 정거장별 책임

| 정거장 | 레일 타입 | 입력 | 출력 | 변환 위치 | 변환 도구 |
|--------|----------|------|------|----------|----------|
| **출발점 (UI)** | Presenter Rail | - | Presenter | - | - |
| **정거장 1 (Hook)** | Presenter/Model Rail | Presenter | Presenter | 외부 | Mapper |
| **정거장 2 (Frontend)** | Model Rail | Model | Presenter | 내부 | Mapper |
| **환승역 (API Handler)** 🔄 | **Model ↔ DTO** | Model | Model | 요청/응답 | Mapper |
| **정거장 3 (Backend)** | DTO Rail | DTO | Model | 내부 | Adapter |
| **종착역 (CMS)** | DTO Rail | DTO | DTO | - | - |

### Rails 핵심 원칙

- **정거장 2 (Frontend Service)**: Model Rail에서 운행
- **정거장 3 (Backend Service)**: DTO Rail에서 운행
- **환승역 (API Handler)**: Model ↔ DTO 레일 전환 지점 🔄
- **하나의 흐름**: 데이터는 명확한 레일을 따라 흐름
