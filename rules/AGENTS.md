# Master-Clone 아키텍처

> 이 문서는 프로젝트의 중앙 컨텍스트 허브입니다. 모든 에이전트와 규칙을 한 곳에서 관리합니다.

## 핵심 철학

```
Master-Clone = AI에게 판단을 맡기는 철학
- 우리는 규칙을 정의
- Claude는 최적의 실행 방법을 결정
```

**원칙:**

- 모든 핵심 컨텍스트를 중앙 문서에 집중
- 메인 에이전트가 동적으로 위임 결정
- 전문 subagent 과다 생성 방지
- Task()/Explore()/Planner() 기능 활용

---

## 작업 원칙

### 기본 작업 설정

**1. 사고 모드:**

- 모든 작업은 **'많은 생각' 모드**로 실행합니다
- 복잡한 문제 해결, 설계 결정, 아키텍처 판단 시 충분한 사고 과정을 거칩니다
- 빠른 판단보다 정확하고 깊이 있는 분석을 우선합니다

**2. 도구 사용:**

- **serena MCP**를 적극 활용합니다
- MCP를 통한 외부 서비스 및 도구 연동을 우선 고려합니다
- 필요한 경우 serena MCP의 기능을 조회하고 사용합니다

### 작업 금지 영역

**backend/ 폴더 - 절대 수정하지 마세요:**

- `backend/` 폴더 및 하위 모든 파일은 AI 에이전트가 수정할 수 없습니다
- 이 폴더는 별도 팀에서 관리하며, 프론트엔드 작업과 분리되어 있습니다
- backend 관련 변경이 필요한 경우, 사용자에게 알리고 직접 처리하도록 안내하세요

**허용되는 작업:**

- `portal/` 폴더: 프론트엔드 및 API Route Handler 작업
- `.cursor/` 폴더: 에이전트 규칙 및 스킬 관리
- `docs/` 폴더: 문서 작업

---

## 사용 가능한 에이전트

### 커스텀 에이전트

| 에이전트         | 모델   | 역할                             | 호출 시점                                       |
| :--------------- | :----- | :------------------------------- | :---------------------------------------------- |
| **master-clone** | sonnet | 작업 복잡성 분석, 위임 전략 수립 | 대규모 작업 시작 전, 병렬 처리 전략 필요 시     |
| **ui-architect** | Opus   | UI 비즈니스/디자인 로직 전문가   | 컴포넌트 설계, Presenter 패턴, 새 기능 구현 시  |
| **frontend**     | sonnet | 프론트엔드 개발 전문가           | React/Next.js 컴포넌트, 훅, 스타일링 작업 시    |
| **backend**      | sonnet | 백엔드 개발 전문가               | API 라우트, 서비스 로직, 데이터베이스 작업 시   |
| **frontend-fullstack** | sonnet | 프론트엔드 풀스택 전문가 | 프론트엔드 전체 계층(_types, _services, _hooks, _ui) + API Handler 작업 시 |
| **code-generator** | sonnet | 코드 생성 전문가 | 새 도메인/기능 전체 생성 시 ("생성", "만들어줘", "create") |
| **architect**    | sonnet | 시스템 아키텍처 전문가           | 구조 설계, 기술 의사결정, 리팩토링 전략 수립 시 |
| **planner**      | sonnet | 계획 수립 전문가                 | 작업 분석, 단계별 계획, 리스크 평가 시          |

### 빌트인 에이전트

| 에이전트           | 모델    | 도구      | 용도                       |
| :----------------- | :------ | :-------- | :------------------------- |
| **Explore**        | Haiku   | Read-only | 코드베이스 탐색, 구조 파악 |
| **Plan**           | Inherit | Read-only | 계획 수립, 연구            |
| **generalPurpose** | Inherit | All       | 복잡한 다단계 작업         |
| **Bash**           | Inherit | Bash      | 터미널 명령 실행           |

---

## 에이전트 상세

### master-clone

**위치:** `.cursor/agents/master-clone.md`

**역할:**

- 작업 복잡성 분석
- 위임 전략 수립 (직접 처리 / Explore / Task)
- 컨텍스트 효율성 최적화
- 안티패턴 감지

**위임 기준:**

| 작업 특성       | 파일 수 | 권장 전략                  |
| :-------------- | :------ | :------------------------- |
| 단순 수정       | 1-3     | 직접 처리                  |
| 탐색/분석       | 무관    | `Explore()`                |
| **계획 수립 필요** | **무관** | **`Planner()`**           |
| 중규모 작업     | 4-10    | 단일 `Task()`              |
| 대규모 리팩토링 | 10+     | `Planner()` → 병렬 `Task()` |
| 복잡한 기능 구현 | 무관   | `Planner()` → `Task()`     |

### planner

**위치:** `.cursor/agents/planner.md`

**역할:**

- 요구사항 분석 및 명확화
- 작업 분해 (WBS: Work Breakdown Structure)
- 의존성 분석 및 크리티컬 패스 식별
- 리스크 관리 및 대응 전략 수립
- 단계별 실행 계획 작성

**활용 시점:**

- 복잡한 기능 구현 전 설계가 필요할 때
- 요구사항이 모호하거나 다양한 해석이 가능할 때
- 대규모 리팩토링 전 전략 수립이 필요할 때
- 의존성이 복잡한 작업일 때

**출력물:**

- 요구사항 정리 문서
- 단계별 실행 계획서
- 위험 요소 및 대응 전략

### ui-architect

**위치:** `.cursor/agents/ui-architect.md`

**역할:**

- 비즈니스 로직 설계 (Context, Hook, Service)
- 디자인 로직 설계 (Section, Panel, Module, Modal)
- 데이터 흐름 설계 (Entity → DTO → Model → Presenter)
- 컴포넌트 아키텍처 수립

**작업 워크플로우:**

1. 분석: 기존 `_types/`, `_ui/`, `_hooks/` 구조 파악
2. 설계: 아키텍처 다이어그램 작성
3. 구현: 타입, 서비스, 훅, 컴포넌트 생성
4. 검증: 컨벤션 체크리스트 확인

### frontend-fullstack

**위치:** `.cursor/agents/frontend-fullstack.md`

**역할:**

- 프론트엔드 전체 계층 구현 (_types, _data, _services, _hooks, _ui, page)
- Next.js API Route Handler 구현 (route.ts)
- DTO ↔ Model 변환 (Adapter 패턴)
- Backend Service 구현 및 CMS API 연동
- Rails Architecture 준수 (계층 간 데이터 흐름 관리)

**작업 워크플로우:**

1. 계층 확인: 프론트엔드 계층인지 API 계층인지 판단
2. 스킬 참조: frontend-design-pattern 또는 backend-api-pattern
3. 구조 분석: 기존 코드 패턴 및 타입 확인
4. 구현: 네이밍 규칙 및 Temporal API 준수
5. 검증: 타입 안정성 및 데이터 흐름 확인

**자동 트리거 키워드:**

- "프론트 API", "프론트엔드 API", "frontend api"
- "Model 수정", "Presenter 수정"
- "_types", "_hooks", "_services" 작업
- "API Route Handler", "route.ts"
- "DTO", "Adapter" 변환

**데이터 흐름:**

```
UI (Presenter) → Hook (Model) → Frontend Service (Model)
  → API Handler (Model ↔ DTO 변환)
  → Backend Service (DTO) → CMS API
```

### code-generator

**위치:** `.cursor/agents/code-generator.md`

**역할:**

- 새로운 도메인/기능 전체 스택 생성
- 기존 패턴 (브로슈어, IR, 팝업) 참조하여 일관성 유지
- 프론트엔드부터 백엔드까지 완전한 스캐폴딩
- 네이밍 규칙, Temporal API 자동 적용
- Rails Architecture 준수

**작업 워크플로우:**

1. 요청 분석: 생성 대상, 참조 도메인, 범위 파악
2. 참조 도메인 선택:
   - 브로슈어: 문서 + 카테고리 + 번역 + 첨부파일
   - IR: 문서 + 카테고리 + 번역
   - 팝업: 단순 CRUD
3. 패턴 학습: 기존 도메인 구조 분석
4. 스캐폴딩 계획: 필요한 모든 파일 목록 작성
5. 파일 생성: 순차적으로 모든 파일 생성
   - 타입 → 서비스 → Context → Hook → UI
6. 통합: Context Provider 래핑, 라우팅 설정
7. 검증: 타입 오류, 린터 오류 확인

**자동 트리거 키워드:**

- "생성", "생성해줘", "만들어줘", "추가해줘" (새 도메인)
- "도메인 생성", "기능 생성", "페이지 생성"
- "새 도메인", "새 기능"
- "create", "generate", "scaffold", "add new"

**생성 범위:**

프론트엔드 (18개 파일):
- _types/ (4개): Model, Presenter, Category, Translation
- _services/ (3개): Interface, Mapper, Service
- _context/ (2개): Context, ServiceContext
- _hooks/ (5개): Create, Read(s), Read, Update, Delete
- _ui/ (3개): Content, List, Form
- page.tsx (1개)

API 계층 (8개 파일):
- route.ts (2개): 목록/생성, 상세/수정/삭제
- _backend/modules/ (6개): Module, Service, Interface, Endpoints, DTO, Adapter

**네이밍 자동 변환:**

```
입력: "공지사항" 또는 "notice"

자동 변환:
- 영문명: notice
- 복수형: notices
- PascalCase: Notice
- 한글명: 공지사항

파일명:
- notice.model.ts
- NoticeContext.tsx
- useCreateNotice.ts

메서드명:
- 공지사항_목록을_조회한다
- 공지사항을_생성한다
```

**사용 예시:**

```
사용자: "공지사항 도메인을 생성해줘"

에이전트:
1. 분석: 도메인명 "공지사항" (notice)
2. 참조: 브로슈어 (복잡한 구조)
3. 확인:
   다음 내용으로 생성합니다:
   - 도메인명: 공지사항 (notice)
   - 참조: 브로슈어 구조
   - 범위: 프론트엔드 (18개) + API (8개) = 총 26개 파일
   진행하시겠습니까?
4. 생성: [1/26] ~ [26/26] 순차 생성
5. 통합: Provider 래핑
6. 검증: ✓ 타입 오류 없음
완료!
```

---

## 핵심 규칙 요약

### 1. 이름 컨벤션 (`naming-convention.mdc`)

**폴더:**

- Private 폴더: `_` 접두사 (`_hooks/`, `_ui/`, `_types/`)
- Feature 폴더: 케밥케이스 (`video-gallery/`)
- 단일 도메인: 소문자 (`ir/`, `popup/`)

**파일:**

- 서비스: `{domain}.service.ts`
- 모델: `{domain}.model.ts`
- 프레젠터: `{domain}.presenter.ts`
- 훅: `use{Action}{Domain}.ts`

**UI 컴포넌트:**

- Section: `.section.tsx`
- Panel: `.panel.tsx`
- Module: `.module.tsx`
- Modal: `.modal.tsx`

**서비스 메서드:** 한글 사용

```typescript
IR을_조회한다(id: string): Promise<...>
IR_목록을_조회한다(params?: Params): Promise<...>
```

### 2. Temporal API (`temporal-api.mdc`)

**필수 사용:**

```typescript
import { generateId, nowISOString } from "@/lib/utils/temporal.util";

// ID 생성
const id = generateId("doc");

// 타임스탬프 생성
const timestamp = nowISOString();
```

**금지:**

- `new Date()`
- `Date.now()`
- `.toISOString()`

### 3. Rails Architecture (`rails-architecture` 스킬)

**핵심 철학:**

```
데이터가 하나의 레일(rail) 위를 따라 흐른다
```

**데이터 흐름:**

```
UI Layer (Presenter)
  ↓ Mapper
Hook Layer (Model)
  ↓
Frontend Service (Model)
  ↓ Mapper (API Handler에서)
API Handler (환승역: Model ↔ DTO 변환)
  ↓
Backend Service (DTO)
  ↓
CMS Backend API
```

**계층별 책임:**

| 계층 | 타입 | 책임 |
|-----|------|------|
| **Hook** | Presenter → Model | 비즈니스 로직, Mapper로 변환 |
| **Frontend Service** | Model | Model 입출력, API Route 호출 |
| **API Handler** | Model → DTO | 환승역, 도메인 경계 변환 |
| **Backend Service** | DTO | DTO 입출력, CMS API 호출 |

**변환 도구:**

- **Mapper** (프론트엔드): Presenter ↔ Model, Model → DTO
- **Adapter** (백엔드): DTO → Model

**원칙:**

```typescript
// ✅ 프론트엔드 서비스: Model만 사용
async 브로슈어를_수정한다(
  id: string,
  data: UpdateBrochureModel,  // Model
): Promise<ApiResponse<BrochurePresenter>>

// ✅ 백엔드 API 서비스: DTO만 사용
async updateBrochure(
  id: string,
  dto: UpdateBrochureDto,  // DTO
): Promise<ServiceResponse<BrochureModel>>

// ✅ API Handler: Model → DTO 변환
const dto = BrochureMapper.toUpdateDto(requestBody);
await backendService.updateBrochure(id, dto);
```

### 4. Adapter Design Pattern (`adapter-design-pattern` 스킬)

**핵심 개념:**

```
Backend API 도메인(DTO) ↔ Frontend 도메인(Model) 변환 계층
```

**위치:** `api/_backend/modules/.../types/{domain}.adapter.ts`

**역할:**

- API 경계에서 DTO ↔ Model 변환
- 필드명 매핑 (예: `isPublic` ↔ `isActive`)
- null/undefined 처리
- CQRS 패턴 지원

**Adapter 클래스 구조:**

```typescript
export class BrochureAdapter {
  // Response 변환: DTO → Model
  static fromBrochureResponse(dto: BrochureResponseDto): BrochureModel
  static fromBrochureListResponse(dto: ListDto): ListModel
  static fromBrochurePageResponse(dto: PageDto): PageModel

  // Request 변환: Model → DTO
  static toCreateBrochureRequest(model: CreateModel): CreateDto
  static toUpdateBrochureRequest(model: UpdateModel): UpdateDto
}
```

**필드명 매핑 예시:**

| Frontend Model | Backend DTO | 변환 방향 |
|---------------|-------------|----------|
| `isPublic` | `isActive` | 양방향 |
| `content` | `description` | 양방향 |
| `size` (페이지) | `limit` | 요청 시 |
| `code` | - | Frontend 전용 |

**데이터 흐름:**

```
API Handler (환승역)
  ↓ Model 수신
  ↓ Adapter.to...Request(model)  ✅ Model → DTO
  ↓
Backend Service
  ↓ DTO로 CMS API 호출
  ↓ Response DTO 수신
  ↓ Adapter.from...Response(dto)  ✅ DTO → Model
  ↓
API Handler
  ↓ Model 반환
```

**핵심 원칙:**

- **명확한 타입 사용**: unknown 금지, 명시적 Model 타입 사용
- **필드명 매핑 문서화**: 클래스 상단에 주석으로 명시
- **null 처리**: `dto.field ?? undefined` 패턴
- **CQRS 분리**: Command/Query Model 구분
- **단일 책임**: Adapter는 변환만 수행

---

## 위임 전략 가이드

### 언제 직접 처리?

- 1-3개 파일 수정
- 단순 버그 수정
- 설정 변경

```
사용자: "이 함수의 오타 수정해줘"
→ 직접 Edit 도구 사용
```

### 언제 Explore()?

- 코드베이스 구조 파악
- 패턴/사용처 검색
- 영향 범위 분석

```
사용자: "인증이 어떻게 처리되고 있어?"
→ Task(subagent_type="explore", ...)
```

### 언제 Task()?

- 5개 이상 파일 수정
- 반복적인 변경 작업
- 독립적으로 실행 가능한 작업

```
사용자: "전체 프로젝트에서 API 교체해줘"
→ Task(subagent_type="generalPurpose", ...)
```

### 언제 Planner()?

- 복잡한 기능 구현 전 설계 필요
- 요구사항이 모호하거나 다양한 해석 가능
- 대규모 리팩토링 전 전략 수립
- 의존성이 복잡한 작업
- 위험 요소 사전 파악 필요

```
사용자: "위키 시스템 구현해줘"
→ Task(subagent_type="planner", ...)
→ 계획서 기반으로 Task() 실행
```

```
사용자: "검색 기능 개선해줘"
→ Task(subagent_type="planner", ...) // 요구사항 명확화
→ 사용자 확인 후 실행
```

### 병렬 Task() 패턴

**디렉토리 분할:**

```
[Task 1] src/api/** 처리
[Task 2] src/services/** 처리
[Task 3] src/components/** 처리
→ 3개 요약 통합
```

**기능 분할:**

```
[Task 1] 로그인 로직
[Task 2] 토큰 관리
[Task 3] 권한 검증
→ 통합 검증
```

### Planner → Task 연계 패턴

**계획 기반 실행:**

```
[Step 1] Planner: 요구사항 분석 및 계획 수립
         → 출력: 단계별 계획서

[Step 2] Task: 계획에 따라 병렬/순차 실행
         → Task 1: 타입/인터페이스 정의
         → Task 2: 서비스 로직 구현
         → Task 3: UI 컴포넌트 구현

[Step 3] 검증: 계획 대비 결과 점검
```

**마이그레이션 패턴:**

```
[Step 1] Planner: 마이그레이션 전략 수립
         - 현재 상태 분석
         - 마이그레이션 순서 결정
         - 롤백 전략 수립

[Step 2] 계획에 따라 단계별 실행
         → 각 Task는 계획서 참조하여 일관성 유지
```

---

## 안티패턴

### ❌ 회피해야 할 것

1. **과도한 위임**
   - 한 줄 수정에 Task() 사용 ❌
   - 직접 처리가 더 효율적

2. **컨텍스트 게이트키핑**
   - 10개 이상의 전문 subagent ❌
   - 중앙화된 규칙 파일 권장

3. **무한 재귀**
   - Task 내부에서 Task 생성 ❌
   - Master가 직접 병렬 Task 생성

---

## 파일 구조

```
.cursor/
├── AGENTS.md              # 이 문서 (중앙 컨텍스트)
├── agents/
│   ├── master-clone.md    # 위임 전략 전문가
│   ├── ui-architect.md    # UI 아키텍처 전문가
│   ├── frontend.md        # 프론트엔드 전문가
│   ├── backend.md         # 백엔드 전문가
│   ├── architect.md       # 시스템 아키텍처 전문가
│   └── planner.md         # 계획 수립 전문가
├── rules/
│   ├── naming-convention.mdc  # 이름 컨벤션
│   └── temporal-api.mdc       # Temporal API 규칙
└── skills/
    ├── project/
    │   ├── rails-architecture/     # 계층화된 아키텍처 가이드
    │   ├── adapter-design-pattern/ # DTO ↔ Model 변환 패턴
    │   ├── api-flow-debugger/      # API 흐름 디버거
    │   └── model-change-impact-analyzer/  # 모델 변경 영향 분석
    └── ...                # 추가 스킬들
```

---

## 컨텍스트 효율성

```
전통적 Subagent:
10개 전문 Subagent × 각 10K = 100K 토큰 (항상)

Master-Clone:
규칙 파일: 5K (항상)
필요시만 Task() 생성
실제 사용: 15K 평균 (85% 절약!)
```

---

## 사용 예시

### 예시 1: 새 기능 구현

```
사용자: "새 IR 관리 페이지 만들어줘"

1. [master-clone] 복잡성 분석 → 중규모 작업
2. [planner] 요구사항 분석 및 계획 수립
3. [ui-architect] 아키텍처 설계
4. 계획에 따라 직접 구현 또는 Task() 위임
```

### 예시 2: 코드베이스 분석

```
사용자: "이 프로젝트 구조 설명해줘"

1. [Explore] 코드베이스 탐색
2. 요약 반환 (컨텍스트 절약)
```

### 예시 3: 대규모 리팩토링

```
사용자: "모든 Date를 Temporal로 변환해줘"

1. [master-clone] 복잡성 분석 → 대규모 작업
2. [planner] 마이그레이션 계획 수립
3. [Explore] 영향 범위 파악
4. [병렬 Task()] 계획에 따라 디렉토리별 변환
5. 계획 대비 검증
```

---

**마지막 업데이트:** 2026-01-21
**문서 버전:** 1.0
