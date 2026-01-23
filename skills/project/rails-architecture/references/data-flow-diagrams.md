# Rails Architecture - 데이터 흐름 다이어그램

> 레일 위를 달리는 데이터의 여정

## 목차
1. [전체 아키텍처 (Rails 다이어그램)](#전체-아키텍처-rails-다이어그램)
2. [CRUD 흐름](#crud-흐름)
3. [타입 변환 흐름](#타입-변환-흐름)
4. [레일 전환 지점](#레일-전환-지점)
5. [에러 처리 흐름](#에러-처리-흐름)

---

## 전체 아키텍처 (Rails 다이어그램)

```
┌─────────────────────────────────────────────────────────┐
│                 UI Layer (출발점) 🚉                     │
│                 (React Components)                      │
│                                                         │
│  - Presenter 기반 렌더링                                 │
│  - 사용자 인터랙션 처리                                  │
└────────────────────┬────────────────────────────────────┘
                     │ Presenter Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Hook Layer (정거장 1) 🏢                    │
│                 (Custom Hooks)                          │
│                                                         │
│  - 비즈니스 로직                                         │
│  - Presenter ↔ Model 변환 (Mapper) ← 외부 변환         │
│  - 캐시 관리 (SWR)                                       │
└────────────────────┬────────────────────────────────────┘
                     │ Model Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│        Frontend Service Layer (정거장 2) 🏢              │
│              (current/{domain}.service.ts)              │
│                                                         │
│  - Model 입력/출력 (DTO 아님!)                          │
│  - Next.js API Route 호출                               │
│  - Model → Presenter 변환 (Mapper) ← 내부 변환         │
└────────────────────┬────────────────────────────────────┘
                     │ Model Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│      ⚡ API Route Handler (환승역) 🔄 ⚡                  │
│        (api/cms/homepage/{domain}/route.ts)             │
│                                                         │
│  - Model → DTO 변환 (Mapper) ← 경계 변환 (요청)        │
│  - Backend Service 호출                                 │
│  - DTO → Model 변환 (Adapter) ← 경계 변환 (응답)       │
│  - 인증/권한 처리                                        │
└────────────────────┬────────────────────────────────────┘
                     │ DTO Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│      Backend API Service Layer (정거장 3) 🏢             │
│        (api/_backend/{domain}.service.ts)               │
│                                                         │
│  - DTO 입력/출력 (Model 아님!)                          │
│  - CMS 백엔드 API 호출                                   │
│  - DTO → Model 변환 (Adapter) ← 내부 변환              │
│  - BaseService 상속 (공통 에러 처리)                     │
└────────────────────┬────────────────────────────────────┘
                     │ DTO Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│           CMS Backend API (종착역) 🏁                    │
│                 (Actual Backend)                        │
│                                                         │
│  - 실제 비즈니스 로직                                     │
│  - 데이터베이스 접근                                      │
│  - DTO 입력/출력                                         │
└─────────────────────────────────────────────────────────┘
```

### 레일 타입 요약

| 구간 | 레일 타입 | 비고 |
|------|----------|------|
| 출발점 → 정거장 1 | Presenter Rail | UI 데이터 |
| 정거장 1 → 정거장 2 | Model Rail | 프론트 도메인 |
| 정거장 2 → 환승역 | Model Rail | 프론트 도메인 유지 |
| 환승역 진입 | **Model → DTO 변환** | **레일 전환** 🔄 |
| 환승역 → 정거장 3 | DTO Rail | 백엔드 도메인 |
| 정거장 3 → 종착역 | DTO Rail | 백엔드 도메인 유지 |

---

## CRUD 흐름

### 1. 조회 (Read) - 레일 여정

```
[GET Request] 🚉 출발!

UI Component (출발점)
  ↓ Presenter Rail 🚂
Hook: useReadBrochure(id) (정거장 1)
  ↓ (변환 없음)
  ↓ Model Rail 🚂
Frontend Service: 브로슈어를_조회한다(id) (정거장 2)
  ↓ GET /api/cms/homepage/brochures/{id}
  ↓ Model Rail 🚂
API Handler: GET (환승역 🔄)
  ↓ (변환 없음 - ID만 전달)
  ↓ DTO Rail 🚂
Backend Service: getBrochure(id) (정거장 3)
  ↓ GET {CMS_API}/admin/brochures/{id}
  ↓ Authorization: Bearer {token}
  ↓ DTO Rail 🚂
CMS Backend API (종착역 🏁)
  ↓ 응답: BrochureResponseDto
  ↓ DTO Rail 🚂 (복귀 시작)
Backend Service (정거장 3)
  ↓ Adapter.fromBrochureResponse(dto)
  ↓ BrochureModel
  ↓ DTO → Model 변환 완료
API Handler (환승역 🔄)
  ↓ (Model 그대로 통과)
  ↓ Model Rail 🚂
Frontend Service (정거장 2)
  ↓ Mapper.fromModel(model)
  ↓ BrochurePresenter
  ↓ Presenter Rail 🚂
Hook (정거장 1)
  ↓ BrochurePresenter
  ↓ Presenter Rail 🚂
UI Component (출발점 복귀) 🚉
  ↓ 렌더링 완료! ✨
```

### 2. 생성 (Create) - 레일 여정

```
[POST Request] 🚉 출발!

UI Component (출발점)
  ↓ Presenter (Form Data)
  ↓ Presenter Rail 🚂
Hook: useCreateBrochure() (정거장 1)
  ↓ Mapper.toCreateModel(presenter)
  ↓ CreateBrochureModel
  ↓ Model Rail 🚂
Frontend Service: 브로슈어를_생성한다(createModel) (정거장 2)
  ↓ POST /api/cms/homepage/brochures
  ↓ body: CreateBrochureModel (JSON)
  ↓ Model Rail 🚂
API Handler: POST (환승역 🔄 - 레일 전환!)
  ↓ Mapper.toCreateDto(model)
  ↓ CreateBrochureDto
  ↓ DTO Rail 🚂
Backend Service: createBrochure(dto) (정거장 3)
  ↓ POST {CMS_API}/admin/brochures
  ↓ Authorization: Bearer {token}
  ↓ body: CreateBrochureDto (JSON)
  ↓ DTO Rail 🚂
CMS Backend API (종착역 🏁)
  ↓ 응답: BrochureResponseDto
  ↓ DTO Rail 🚂 (복귀 시작)
Backend Service (정거장 3)
  ↓ Adapter.fromBrochureResponse(dto)
  ↓ BrochureModel
  ↓ DTO → Model 변환 완료
API Handler (환승역 🔄)
  ↓ (Model 그대로 통과)
  ↓ Model Rail 🚂
Frontend Service (정거장 2)
  ↓ Mapper.fromModel(model)
  ↓ BrochurePresenter
  ↓ Presenter Rail 🚂
Hook (정거장 1)
  ↓ mutate(cacheKey) - 캐시 갱신
  ↓ BrochurePresenter
  ↓ Presenter Rail 🚂
UI Component (출발점 복귀) 🚉
  ↓ 상태 업데이트 완료! ✨
```

### 3. 수정 (Update)

```
[PATCH Request]

UI Component
  ↓ Presenter (Updated Form Data)
Hook: useUpdateBrochure()
  ↓ Mapper.toUpdateModel(presenter)
  ↓ UpdateBrochureModel
Frontend Service: 브로슈어를_수정한다(id, updateModel)
  ↓ PATCH /api/cms/homepage/brochures/{id}
  ↓ body: UpdateBrochureModel (JSON)
API Handler: PATCH
  ↓ Mapper.toUpdateDto(model)
  ↓ UpdateBrochureDto
Backend Service: updateBrochure(id, dto)
  ↓ PUT {CMS_API}/admin/brochures/{id}
  ↓ Authorization: Bearer {token}
  ↓ body: UpdateBrochureDto (JSON)
CMS Backend API
  ↓ 응답: BrochureResponseDto
Backend Service
  ↓ Adapter.fromBrochureResponse(dto)
  ↓ BrochureModel
API Handler
  ↓ (변환 없음)
  ↓ BrochureModel
Frontend Service
  ↓ Mapper.fromModel(model)
  ↓ BrochurePresenter
Hook
  ↓ mutate(cacheKey) - 캐시 갱신
  ↓ BrochurePresenter
UI Component
  ↓ 상태 업데이트
```

### 4. 삭제 (Delete)

```
[DELETE Request]

UI Component
  ↓ id
Hook: useDeleteBrochure()
  ↓ (변환 없음)
Frontend Service: 브로슈어를_삭제한다(id)
  ↓ DELETE /api/cms/homepage/brochures/{id}
API Handler: DELETE
  ↓ (변환 없음)
Backend Service: deleteBrochure(id)
  ↓ DELETE {CMS_API}/admin/brochures/{id}
  ↓ Authorization: Bearer {token}
CMS Backend API
  ↓ 응답: { success: true }
Backend Service
  ↓ { deleted: true }
API Handler
  ↓ (변환 없음)
  ↓ { success: true }
Frontend Service
  ↓ (변환 없음)
  ↓ { success: true }
Hook
  ↓ mutate(cacheKey) - 캐시 갱신
  ↓ void
UI Component
  ↓ UI 업데이트 (목록에서 제거)
```

---

## 레일 전환 지점

### 환승역에서의 레일 전환 (Update 요청 예시)

```
┌─────────────────────────────────────────────────────────┐
│ UI Component (출발점) 🚉                                 │
│   presenter = {                                         │
│     id: "br-123",                                       │
│     name: "2024 연례보고서",                             │
│     isPublic: true,  ← 프론트 도메인 필드               │
│     ...                                                 │
│   }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │ Presenter Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Hook (정거장 1): Mapper.toUpdateModel(presenter)        │
│   model = {                                             │
│     name: "2024 연례보고서",                             │
│     isPublic: true,  ← 여전히 isPublic                 │
│     ...                                                 │
│   }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │ Model Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend Service (정거장 2)                              │
│   - Model을 그대로 전송                                  │
│   body: JSON.stringify(model)                          │
└────────────────────┬────────────────────────────────────┘
                     │ Model Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│ ⚡ API Handler (환승역) 🔄 - 레일 전환!                  │
│   Mapper.toUpdateDto(model)                            │
│   dto = {                                               │
│     name: "2024 연례보고서",                             │
│     isActive: true,  ← isPublic → isActive 변환!       │
│     ...                                                 │
│   }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │ DTO Rail 🚂 (레일 타입 변경됨!)
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Backend Service (정거장 3)                               │
│   - DTO를 그대로 전송                                    │
│   body: JSON.stringify(dto)                            │
└────────────────────┬────────────────────────────────────┘
                     │ DTO Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│ CMS Backend API (종착역) 🏁                              │
│   - DTO 처리                                            │
│   - DB 업데이트                                          │
└────────────────────┬────────────────────────────────────┘
                     │ DTO Rail 🚂 (복귀 시작)
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Backend Service (정거장 3)                               │
│   Adapter.fromBrochureResponse(dto)                    │
│   model = {                                             │
│     id: "br-123",                                       │
│     name: "2024 연례보고서",                             │
│     isPublic: true,  ← isActive → isPublic 역변환!     │
│     ...                                                 │
│   }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │ Model Rail 🚂 (환승역 통과)
                     ▼
┌─────────────────────────────────────────────────────────┐
│ API Handler (환승역) 🔄                                  │
│   - Model 그대로 반환 (레일 유지)                        │
└────────────────────┬────────────────────────────────────┘
                     │ Model Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend Service (정거장 2)                              │
│   Mapper.fromModel(model)                              │
│   presenter = {                                         │
│     id: "br-123",                                       │
│     name: "2024 연례보고서",                             │
│     isPublic: true,  ← Model의 isPublic 유지          │
│     ...                                                 │
│     // + 헬퍼 메서드들                                   │
│   }                                                     │
└────────────────────┬────────────────────────────────────┘
                     │ Presenter Rail 🚂
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Hook → UI Component (출발점 복귀) 🚉                     │
│   - Presenter로 렌더링                                   │
└─────────────────────────────────────────────────────────┘
```

### 타입 변환 흐름

레일이 전환되는 지점과 타입 매핑:

| 위치 | 변환 전 | 변환 후 | 변환 도구 | 레일 타입 |
|------|--------|--------|----------|----------|
| 정거장 1 (Hook) | Presenter | Model | Mapper | Presenter → Model Rail |
| 정거장 2 (Frontend) | Model | Presenter | Mapper | Model → Presenter Rail |
| **환승역 (요청)** | **Model** | **DTO** | **Mapper** | **Model → DTO Rail** 🔄 |
| 정거장 3 (Backend) | DTO | Model | Adapter | DTO → Model |
| 환승역 (응답) | Model | Model | - | Model Rail 유지 |

### 필드 매핑 요약

| 계층 | 필드명 | 타입 | 설명 |
|-----|--------|------|------|
| UI → Hook | `isPublic` | Model | 프론트 도메인 |
| Hook → Frontend Service | `isPublic` | Model | 변환 없음 |
| API Handler (요청) | `isActive` | DTO | **isPublic → isActive 변환** |
| Backend Service → CMS API | `isActive` | DTO | 변환 없음 |
| CMS API → Backend Service | `isActive` | DTO | 응답 |
| Backend Service (응답) | `isPublic` | Model | **isActive → isPublic 역변환** |
| API Handler → Frontend Service | `isPublic` | Model | 변환 없음 |
| Frontend Service → Hook | `isPublic` | Presenter | 변환 없음 |

---

## 에러 처리 흐름

### 1. CMS API 에러

```
CMS Backend API
  ↓ 400 Bad Request
  ↓ { success: false, message: "Invalid data" }
Backend Service
  ↓ response.ok === false
  ↓ throw new Error(result.message)
  ↓ handleApiCall() catch
  ↓ ServiceResponse<T> {
       success: false,
       message: "Invalid data"
     }
API Handler
  ↓ result.success === false
  ↓ NextResponse.json(
       { success: false, message: result.message },
       { status: 400 }
     )
Frontend Service
  ↓ result.success === false
  ↓ return {
       success: false,
       error: result.message
     }
Hook
  ↓ response.success === false
  ↓ throw new Error(response.error)
UI Component
  ↓ catch (error)
  ↓ 에러 토스트/메시지 표시
```

### 2. 네트워크 에러

```
Frontend Service
  ↓ fetch() throws
  ↓ catch (error)
  ↓ return {
       success: false,
       error: error.message
     }
Hook
  ↓ response.success === false
  ↓ throw new Error(response.error)
UI Component
  ↓ catch (error)
  ↓ "네트워크 에러" 표시
```

### 3. 백엔드 서비스 에러

```
Backend Service
  ↓ fetch() throws (timeout, network, etc.)
  ↓ handleApiCall() catch
  ↓ ServiceResponse<T> {
       success: false,
       message: "백엔드 서비스 에러 메시지"
     }
API Handler
  ↓ result.success === false
  ↓ NextResponse.json(
       { success: false, message: result.message },
       { status: 500 }
     )
[... 위와 동일 ...]
```

### 4. 파라미터 검증 에러

```
Backend Service
  ↓ if (!id?.trim())
  ↓ return {
       success: false,
       message: "ID가 필요합니다."
     }
API Handler
  ↓ result.success === false
  ↓ NextResponse.json(
       { success: false, message: result.message },
       { status: 400 }
     )
[... 위와 동일 ...]
```

---

## 응답 타입 통일

모든 계층에서 일관된 응답 타입 사용:

### Frontend Service
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Backend Service
```typescript
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}
```

### API Handler
```typescript
// NextResponse.json() 형식
{
  success: boolean;
  data?: T;
  message?: string;
}
```

---

## 캐시 관리 흐름 (SWR)

### 조회 (Read)

```
Hook: useReadBrochure(id)
  ↓ useSWR(key, fetcher)
  ↓ key = `brochure-${id}`
  ↓ fetcher = () => service.브로슈어를_조회한다(id)
  ↓
  ↓ 캐시 Hit?
  ├─ Yes → 캐시 데이터 반환 (즉시)
  │         Background: revalidate
  │
  └─ No  → Service 호출
            ↓ Frontend Service
            ↓ API Handler
            ↓ Backend Service
            ↓ CMS API
            ↓ 응답 데이터
            ↓ 캐시 저장
            ↓ UI 업데이트
```

### 수정 (Update)

```
Hook: useUpdateBrochure()
  ↓ updateBrochure(id, presenter)
  ↓ Service 호출
  ↓ ... (수정 로직)
  ↓ 성공
  ↓ mutate(`brochure-${id}`) ← 특정 캐시 무효화
  ↓ mutate(
       (key) => key.startsWith("brochure-list")
     ) ← 관련 목록 캐시 모두 무효화
  ↓ SWR이 자동 revalidate
  ↓ UI 업데이트
```

### 삭제 (Delete)

```
Hook: useDeleteBrochure()
  ↓ deleteBrochure(id)
  ↓ Service 호출
  ↓ ... (삭제 로직)
  ↓ 성공
  ↓ mutate(`brochure-${id}`, undefined) ← 캐시 제거
  ↓ mutate(
       (key) => key.startsWith("brochure-list"),
       undefined,
       { revalidate: true }
     ) ← 목록 캐시 무효화 및 재조회
  ↓ UI 업데이트
```

---

## 요약

### 핵심 원칙

1. **타입 경계**
   - 프론트 도메인: Presenter, Model (isPublic)
   - 백엔드 도메인: DTO (isActive)
   - 경계: API Route Handler

2. **변환 위치**
   - Hook: Presenter ↔ Model (외부)
   - Frontend Service: Model → Presenter (내부)
   - API Handler: Model ↔ DTO (경계)
   - Backend Service: DTO → Model (내부)

3. **에러 처리**
   - 모든 계층에서 일관된 응답 타입
   - try-catch로 에러 캐치
   - 에러 메시지 전파

4. **캐시 관리**
   - SWR 사용
   - 수정/삭제 후 mutate로 캐시 무효화
   - 자동 revalidate
