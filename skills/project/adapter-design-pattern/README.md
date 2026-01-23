# Adapter Design Pattern Skill

Backend API 도메인(DTO)과 Frontend 도메인(Model) 간의 변환 계층을 설계하고 구현하는 스킬입니다.

## 개요

이 스킬은 **Rails Architecture**의 핵심 개념인 **환승역(API Handler)**에서 레일을 전환하는 Adapter 패턴을 다룹니다.

```
Model Rail ←→ Adapter ←→ DTO Rail
```

## 주요 내용

1. **개념 및 원칙**
   - Adapter의 역할과 책임
   - CQRS 패턴과의 연계
   - Rails Architecture 내 위치

2. **설계 가이드**
   - Adapter 클래스 구조
   - 메서드 네이밍 규칙
   - 입력 타입 결정 원칙

3. **필드명 매핑 패턴**
   - 매핑 규칙 문서화
   - 조건부 매핑 (null → undefined, optional → required)
   - 페이지네이션 필드 매핑

4. **구현 패턴**
   - Response 변환 (DTO → Model)
   - Request 변환 (Model → DTO)
   - 하위 엔티티 변환

5. **API Handler 연동**
   - 요청 변환 흐름
   - 응답 변환 흐름
   - 전체 데이터 흐름

6. **검증 및 테스트**
   - 타입 검증
   - 데이터 변환 검증
   - 유닛 테스트 예시

## 사용 시기

다음과 같은 상황에서 이 스킬을 사용하세요:

- ✅ Backend API와 Frontend 간 필드명이 다를 때
- ✅ DTO ↔ Model 변환이 필요할 때
- ✅ CQRS 패턴을 적용할 때
- ✅ API 경계 계층을 설계할 때
- ✅ 도메인 분리가 필요할 때

## 트리거 키워드

다음 키워드가 언급되면 이 스킬이 활성화됩니다:

- `Adapter`
- `DTO 변환`
- `Model 변환`
- `필드명 매핑`
- `Request 변환`
- `Response 변환`
- `API 경계`
- `도메인 변환`
- `CQRS 패턴`

## 파일 구조

```
adapter-design-pattern/
├── SKILL.md                     # 메인 스킬 문서
├── README.md                    # 이 파일
└── examples/                    # 예시 코드
    ├── adapter-example.ts       # Adapter 구현 예시
    ├── api-handler-example.ts   # API Handler 연동 예시
    └── backend-service-example.ts # Backend Service 연동 예시
```

## 빠른 시작

### 1. Adapter 클래스 생성

```typescript
// api/_backend/modules/.../types/{domain}.adapter.ts
export class BrochureAdapter {
  // Response 변환: DTO → Model
  static fromBrochureResponse(
    dto: BrochureResponseDto
  ): BrochureModel {
    return {
      id: dto.id,
      code: "brochure",
      isPublic: dto.isActive,  // ✅ 필드명 매핑
      // ...
    };
  }

  // Request 변환: Model → DTO
  static toCreateBrochureRequest(
    model: CreateBrochureModel
  ): CreateBrochureDto {
    return {
      title: model.title,
      isActive: model.isPublic,  // ✅ 필드명 매핑
      // ...
    };
  }
}
```

### 2. API Handler에서 사용

```typescript
// API Handler: route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // ✅ Model → DTO 변환
  const dto = BrochureAdapter.toCreateRequest(body);
  
  // Backend Service 호출
  const result = await service.create(dto);
  
  return NextResponse.json(result);
}
```

### 3. Backend Service에서 사용

```typescript
// Backend Service
async create(dto: CreateDto): Promise<ServiceResponse<Model>> {
  return this.handleApiCall(async () => {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(dto),  // DTO 전송
    });
    
    const result = await response.json();
    
    // ✅ DTO → Model 변환
    return Adapter.fromResponse(result);
  }, "에러 메시지");
}
```

## 핵심 원칙

1. **명확한 타입 사용**: unknown 대신 명시적 Model 타입 사용
2. **필드명 매핑**: 주석으로 매핑 규칙 명시
3. **null 처리**: `dto.field ?? undefined` 패턴 사용
4. **CQRS 분리**: Command/Query Model 구분
5. **단일 책임**: Adapter는 변환만 수행

## 관련 스킬

- [Rails Architecture](../rails-architecture/SKILL.md) - 데이터 흐름 및 레일 개념
- [API Flow Debugger](../api-flow-debugger/SKILL.md) - 타입 불일치 디버깅
- [Model Change Impact Analyzer](../model-change-impact-analyzer/SKILL.md) - Model 변경 영향 분석

## 관련 규칙

- [Naming Convention](../../../.cursor/rules/naming-convention.mdc) - 네이밍 규칙
- [Temporal API](../../../.cursor/rules/temporal-api.mdc) - 날짜/시간 처리

## 체크리스트

Adapter 구현 전 확인 사항:

- [ ] 필드명 매핑이 필요한가?
- [ ] Command/Query Model이 분리되어 있는가?
- [ ] DTO 타입이 정의되어 있는가?
- [ ] Model 타입이 정의되어 있는가?
- [ ] API Handler 위치를 파악했는가?
- [ ] Backend Service 구조를 이해했는가?

## 버전 정보

- **Version**: 1.0.0
- **Author**: AI Agent
- **Created**: 2026-01-23
- **Updated**: 2026-01-23

## 라이센스

이 스킬은 Lumir Portal 프로젝트의 일부입니다.

---

**자세한 내용은 [SKILL.md](./SKILL.md) 문서를 참조하세요.**
