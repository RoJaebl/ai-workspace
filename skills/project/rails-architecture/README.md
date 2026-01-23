# Rails Architecture Skill

데이터가 하나의 레일 위를 따라 흐르는 계층화된 아키텍처 가이드라인입니다.

## Rails Architecture란?

기차가 레일 위를 달리듯, 데이터는 정해진 경로를 따라 각 레이어를 통과하며 명확한 변환을 거칩니다.

```
출발점 (UI) → 정거장 1 (Hook) → 정거장 2 (Frontend Service) 
    → 환승역 (API Handler) → 정거장 3 (Backend Service) → 종착역 (CMS)
```

### 핵심 개념

- **레일 (Rails)**: 데이터가 흐르는 명확한 타입 경로
- **정거장 (Stations)**: 각 레이어의 명확한 책임
- **환승역 (Transfer Station)**: 도메인 간 변환 지점
- **단일 흐름 (Single Flow)**: 하나의 데이터 기둥
- **분기 가능 (Branchable)**: 필요시 다른 레일로 분기

## 사용 시기

다음과 같은 경우에 이 스킬을 사용하세요:

- 새로운 도메인(기능)을 추가할 때
- 서비스 계층을 구임할 때
- 데이터 변환 로직을 작성할 때
- 프론트엔드와 백엔드 API 통신 구조를 설계할 때
- 아키텍처 리뷰가 필요할 때
- "레일즈", "아키텍처", "서비스 패턴", "DTO", "Model", "변환 로직" 등의 키워드가 언급될 때

## 주요 내용

### 1. 데이터 레일 (Data Rails)

```
Presenter Rail  → UI ↔ Hook
Model Rail      → Hook ↔ Frontend Service ↔ API Handler
DTO Rail        → API Handler ↔ Backend Service ↔ CMS
```

### 2. 정거장별 책임 (Stations)

- **출발점 (UI)**: 사용자 인터랙션, Presenter 렌더링
- **정거장 1 (Hook)**: 비즈니스 로직, 캐시 관리
- **정거장 2 (Frontend Service)**: 프론트 도메인, Model 기반
- **환승역 (API Handler)**: 도메인 변환 경계
- **정거장 3 (Backend Service)**: 백엔드 도메인, DTO 기반
- **종착역 (CMS)**: 실제 비즈니스 로직, DB 접근

### 3. 변환 규칙

- **Mapper**: 프론트엔드 도메인 (Presenter ↔ Model, Model → DTO)
- **Adapter**: 백엔드 API 도메인 (DTO ↔ Model)

## Rails 원칙

```
정거장 2 (Frontend Service):
  외부: Presenter → Model (Mapper)
  레일: Model Rail
  내부: Model → Presenter (Mapper)

환승역 (API Handler):
  진입: Model → DTO (Mapper) 🔄
  출발: Model 유지

정거장 3 (Backend Service):
  외부: DTO 입력
  레일: DTO Rail
  내부: DTO → Model (Adapter)
```

## 베스트 프랙티스

### ✅ DO
- 프론트 서비스는 Model 타입만 사용
- 백엔드 서비스는 DTO 타입만 사용
- 변환은 Mapper/Adapter에서 집중 처리
- API Handler가 도메인 간 변환 경계

### ❌ DON'T
- 프론트 서비스에서 DTO 사용 금지
- 백엔드 서비스에서 Model 사용 금지
- 서비스 내부에서 외부 도메인 변환 금지
- Hook에서 DTO 직접 생성 금지

## 안티 패턴 예시

### 1. 프론트엔드 서비스에서 DTO 사용
```typescript
// ❌ 잘못됨
async 브로슈어를_수정한다(id: string, dto: UpdateBrochureDto) {
  // DTO는 백엔드 도메인!
}

// ✅ 올바름
async 브로슈어를_수정한다(id: string, data: UpdateBrochureModel) {
  // Model은 프론트 도메인
}
```

### 2. 서비스 내부에서 외부 변환
```typescript
// ❌ 잘못됨
async 브로슈어를_수정한다(id: string, data: UpdateBrochureModel) {
  const dto = Mapper.toDto(data);  // 서비스 내부에서 변환
  await fetch(API, { body: JSON.stringify(dto) });
}

// ✅ 올바름
async 브로슈어를_수정한다(id: string, data: UpdateBrochureModel) {
  await fetch(API, { body: JSON.stringify(data) });  // Model 그대로
}

// API Handler에서 변환
export async function PATCH(request) {
  const body = await request.json();
  const dto = Mapper.toDto(body);  // Handler에서 변환
}
```

## 체크리스트

새로운 기능 추가 시:

- [ ] 프론트 서비스: Model 입출력
- [ ] 백엔드 서비스: DTO 입출력
- [ ] Hook: Presenter → Model 변환
- [ ] API Handler: Model ↔ DTO 변환
- [ ] Mapper/Adapter: 변환 로직 집중화

## 관련 스킬

- [API Flow Debugger](../api-flow-debugger/SKILL.md)
- [Model Change Impact Analyzer](../model-change-impact-analyzer/SKILL.md)

## 관련 규칙

- [Naming Convention](.cursor/rules/naming-convention.mdc)
- [Temporal API](.cursor/rules/temporal-api.mdc)
