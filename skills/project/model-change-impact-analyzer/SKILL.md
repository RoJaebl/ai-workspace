---
name: model-change-impact-analyzer
description: Model 필드 변경 시 프론트엔드 전체 계층(Presenter, Mapper, Service, Hooks, UI)에 미치는 영향을 자동으로 분석하고, 변경 순서, 체크리스트, 타입 검증 결과를 제공합니다. Model 변경, 필드 추가/삭제, 타입 변경, 영향도 분석, 변경 전파 추적, Presenter 업데이트, Mapper 수정 시 사용합니다.
---

# Model Change Impact Analyzer

프론트엔드 Model 변경 시 영향을 받는 모든 계층(Presenter, Mapper, Service, Hooks, UI)을 자동으로 분석하고 변경 가이드를 제공하는 스킬입니다.

## Architecture Overview

이 프로젝트는 명확히 분리된 타입 계층 구조를 사용합니다:

```
Backend API → DTO → Adapter → Model → Mapper → Presenter → Service → Hooks → UI
```

### 각 계층의 역할

**DTO** (`api/_backend/**/types/*.dto.ts`)
- 백엔드 API 응답/요청 타입
- 백엔드 스펙과 1:1 일치
- 필드명이 프론트엔드와 다를 수 있음 (예: fileName, fileUrl, isActive)

**Adapter** (`api/_backend/**/types/*.adapter.ts`)
- DTO ↔ Model 양방향 변환
- 필드명 매핑 (예: fileName → name, fileUrl → url)
- fromXxxResponse(), toXxxRequest() 메서드
- 백엔드 스펙 변경 시 완충 역할
- null ↔ undefined 변환, 기본값 제공

**Model** (`_types/*.model.ts`)
- UI 계층의 데이터 구조 명세 (타입 계약)
- Interface로 정의되며 비즈니스 로직의 기준이 됨
- Create/Update 변형 포함

**Presenter** (`_types/*.presenter.ts`)
- Model을 구현하는 클래스
- UI 헬퍼 메서드 제공 (display*, get*)
- 불변성 패턴 (copyWith)
- readonly 필드

**Mapper** (`_services/*.mapper.ts`)
- Model ↔ Presenter 양방향 변환
- fromModel(), toModel(), toCreateModel(), toUpdateModel()
- 배열 변환 지원

**Service** (`_services/*.service.ts`)
- 비즈니스 로직 + API 호출
- 한글 메서드명 사용 (예: IR을_조회한다)
- Model 타입 사용

**Hooks** (`_hooks/**/*.ts`)
- React 커스텀 훅
- useRead*, useCreate*, useUpdate*, useDelete*
- Presenter 타입 반환

**UI** (`_ui/**/*.tsx`)
- React 컴포넌트
- .section, .panel, .module 접미사
- Presenter 사용하여 렌더링

## Quick Start

Model 변경 시 다음 순서로 진행하세요:

### 1. 영향 파일 탐색

도메인명으로 관련 파일을 찾습니다:

```bash
cd /root/documents/lumir-portal/.cursor/skills/model-change-impact-analyzer
node scripts/find-impact-files.ts <domain>
```

예시:
```bash
node scripts/find-impact-files.ts brochure
```

### 2. 변경 순서 확인

**필드 추가 - 백엔드 연동 시** (bottom-up):
0. DTO 확인 → 1. Adapter 매핑 → 2. Model → 3. Presenter → 4. Mapper → 5. Service → 6. Hooks → 7. UI

**필드 추가 - 프론트엔드 전용** (bottom-up):
1. Model → 2. Presenter → 3. Mapper → 4. Service → 5. Hooks → 6. UI

**필드 삭제** (top-down):
1. UI → 2. Hooks → 3. Service → 4. Mapper → 5. Presenter → 6. Model → 7. Adapter (백엔드 연동 시) → 8. DTO (백엔드도 제거 시)

**백엔드 스펙 변경 시** (Adapter만):
1. DTO → 2. Adapter → 완료 (나머지 계층 영향 없음!)

### 3. 체크리스트 적용

변경 유형에 맞는 체크리스트를 참조하세요:
- 필드 추가: `assets/checklists/field-addition.md`
- 필드 삭제: `assets/checklists/field-removal.md`
- 타입 변경: `assets/checklists/type-change.md`

### 4. 타입 검증

변경 후 타입 일관성을 검증합니다:

```bash
node scripts/validate-type-consistency.ts <domain>
```

### 5. 다이어그램 확인 (선택)

변경 전파 경로를 시각화합니다:

```bash
node scripts/generate-impact-diagram.ts <domain> <fieldName>
```

## File Discovery

스크립트가 자동으로 탐색하는 파일 패턴:

### DTO 계층 (백엔드 연동 시)
```
portal/src/app/api/_backend/**/{domain}/types/{domain}.dto.ts
```

### Adapter 계층 (백엔드 연동 시)
```
portal/src/app/api/_backend/**/{domain}/types/{domain}.adapter.ts
```

### Model 계층
```
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_types/{domain}.model.ts
```

### Presenter 계층
```
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_types/{domain}.presenter.ts
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_types/{domain}-*.presenter.ts
```

### Mapper 계층
```
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_services/{domain}.mapper.ts
```

### Service 계층
```
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_services/{domain}.service.ts
portal/src/app/(current)/current/(cms)/cms/**/{domain}/_services/{domain}.service.ts
```

### Hooks 계층
```
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_hooks/**/*.ts
```

### UI 계층
```
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_ui/**/*.section.tsx
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_ui/**/*.panel.tsx
portal/src/app/(planning)/plan/(cms)/cms/**/{domain}/_ui/**/*.module.tsx
```

## Change Detection Workflow

### Model 변경 유형

**1. 필드 추가**
- 새 필드가 모든 계층에 전파되어야 함
- Optional vs Required 구분 중요
- 기본값 처리 전략 필요

**2. 필드 삭제**
- 의존하는 코드를 역순으로 제거
- UI → Hooks → Service → Mapper → Presenter → Model
- 완전히 제거되었는지 grep 검증 권장

**3. 타입 변경**
- 타입 캐스팅 및 변환 로직 업데이트
- 타입 가드 추가 필요 여부 확인
- Union 타입 처리 주의

**4. 필수/선택 변경**
- `field: Type` ↔ `field?: Type`
- Optional 처리 로직 업데이트
- UI에서 타입 가드 추가/제거

**5. 관계 변경**
- 중첩 객체 (category, translations 등)
- Mapper에서 하위 Presenter 변환 로직 추가
- Service에서 관계 데이터 fetch 로직 확인

## Impact Analysis Process

### Phase 1: File Discovery (1-2분)

`find-impact-files.ts` 실행:
- 도메인명 기반 Glob 패턴 매칭
- 파일 존재 여부 확인
- 파일 경로 및 메타데이터 수집
- JSON 형식으로 출력

### Phase 2: Type Validation (2-3분)

`validate-type-consistency.ts` 실행:
- Model 필드 ↔ Presenter 필드 비교
- Mapper 변환 메서드 검증
- Service 메서드 시그니처 확인
- 누락된 변환 로직 보고

### Phase 3: Change Application (5-10분)

체크리스트를 따라 순차적으로 변경:
1. Model interface 업데이트
2. Presenter class 업데이트
3. Mapper 메서드 업데이트
4. Service 로직 업데이트 (필요시)
5. Hooks 업데이트 (필요시)
6. UI 컴포넌트 업데이트 (필요시)

### Phase 4: Verification

- TypeScript 컴파일 에러 확인
- Linter 경고 확인
- 런타임 테스트
- 기존 기능 영향 확인

## Change Propagation Order

### 필드 추가 - 백엔드 연동 (Bottom-up with Adapter)

```
0. DTO (백엔드 스펙 확인)
   ↓ maps to
1. Adapter (필드명 매핑)
   ↓ converts to
2. Model
   ↓ implements
3. Presenter (readonly 필드 추가)
   ↓ uses
4. Mapper (fromModel, toModel 업데이트)
   ↓ uses
5. Service (비즈니스 로직 추가)
   ↓ called by
6. Hooks (새 필드 노출)
   ↓ provides to
7. UI (렌더링 로직 추가)
```

**이유**: Adapter가 백엔드와 프론트엔드 사이의 완충 역할을 하여 필드명/타입 차이를 흡수합니다.

### 필드 추가 - 프론트엔드 전용 (Bottom-up)

```
1. Model
   ↓ implements
2. Presenter (readonly 필드 추가)
   ↓ uses
3. Mapper (fromModel, toModel 업데이트)
   ↓ uses
4. Service (비즈니스 로직 추가)
   ↓ called by
5. Hooks (새 필드 노출)
   ↓ provides to
6. UI (렌더링 로직 추가)
```

**이유**: 하위 계층부터 변경하면 상위 계층에서 타입 에러가 명확히 표시됩니다.

### 필드 삭제 (Top-down)

```
1. UI (렌더링 제거)
   ↓ uses
2. Hooks (필드 참조 제거)
   ↓ calls
3. Service (로직 제거)
   ↓ uses
4. Mapper (변환 제거)
   ↓ uses
5. Presenter (필드 제거)
   ↓ implements
6. Model (필드 삭제)
   ↓ converts to
7. Adapter (매핑 제거, 백엔드 연동 시)
   ↓ maps to
8. DTO (백엔드도 제거 시)
```

**이유**: 사용처부터 제거해야 "unused" 에러를 방지하고 안전하게 삭제할 수 있습니다.

### 백엔드 필드명 변경 (Adapter만)

```
1. DTO (백엔드 스펙 반영)
   ↓
2. Adapter (매핑만 수정)
   ↓
✅ 완료 (Model 이하 계층 영향 없음!)
```

**이유**: Adapter가 백엔드 변경을 흡수하므로 프론트엔드 전체 계층이 보호됩니다.

## Common Patterns

### Optional 필드 추가

**Model**:
```typescript
export interface IrModel {
  // 기존 필드...
  publishedAt?: string; // 추가
}
```

**Presenter**:
```typescript
export class IrPresenter implements IrModel {
  readonly publishedAt?: string; // 추가
  
  private constructor(data: {
    // 기존 필드...
    publishedAt?: string; // 추가
  }) {
    // ...
    this.publishedAt = data.publishedAt; // 추가
  }
  
  static create(data: {
    // 기존 필드...
    publishedAt?: string; // 추가
  }): IrPresenter {
    return new IrPresenter({
      // 기존 필드...
      publishedAt: data.publishedAt, // 추가
    });
  }
  
  copyWith(updates: Partial<IrPresenter>): IrPresenter {
    return IrPresenter.create({
      // 기존 필드...
      publishedAt: updates.publishedAt ?? this.publishedAt, // 추가
    });
  }
  
  // 헬퍼 메서드 (선택)
  static displayPublishedAt(date?: string): string {
    return date ? formatDate(date) : "-";
  }
}
```

**Mapper**:
```typescript
export class IrMapper {
  static fromModel(model: IrModel): IrPresenter {
    return IrPresenter.create({
      // 기존 필드...
      publishedAt: model.publishedAt, // 추가
    });
  }
  
  static toModel(presenter: IrPresenter): IrModel {
    return {
      // 기존 필드...
      publishedAt: presenter.publishedAt, // 추가
    };
  }
}
```

### Required 필드 추가

Optional과 동일하지만 `?` 제거 및 기본값 제공 필요:

**Presenter**:
```typescript
static createEmpty(): IrPresenter {
  return IrPresenter.create({
    // 기존 필드...
    viewCount: 0, // Required이므로 기본값 제공
  });
}
```

### 중첩 객체 추가

**Model**:
```typescript
export interface IrModel {
  category?: IrCategoryModel; // 추가
}
```

**Mapper**:
```typescript
static fromModel(model: IrModel): IrPresenter {
  return IrPresenter.create({
    // 기존 필드...
    category: model.category 
      ? this.fromCategoryModel(model.category) // 하위 Mapper 호출
      : undefined,
  });
}
```

## Troubleshooting

### 타입 에러: Property does not exist

**원인**: Model에 필드가 있지만 Presenter에 없음

**해결**:
1. Presenter 클래스에 readonly 필드 추가
2. constructor 파라미터에 추가
3. create() 메서드에 추가
4. copyWith()에 추가

### 변환 에러: Cannot read property of undefined

**원인**: Mapper에서 optional 필드를 제대로 처리하지 않음

**해결**:
```typescript
// ❌ 잘못된 코드
attachments: model.attachments.map(...)

// ✅ 올바른 코드
attachments: model.attachments 
  ? model.attachments.map(...)
  : undefined
```

### 린트 경고: Unused variable

**원인**: 필드를 삭제했지만 일부 계층에 남아있음

**해결**:
1. 프로젝트 전체에서 필드명 검색
2. 모든 사용처 제거 확인
3. Top-down 순서로 삭제

## Advanced Features

### Change Detection Script

변경된 필드를 자동으로 감지합니다:

```bash
node scripts/analyze-model-changes.ts <domain>
```

이 스크립트는:
- 추가된 필드 목록
- 삭제된 필드 목록
- 타입이 변경된 필드 목록

을 출력합니다.

### Impact Diagram

변경 전파 경로를 Mermaid 다이어그램으로 시각화합니다:

```bash
node scripts/generate-impact-diagram.ts <domain> <fieldName>
```

### Detailed Guides

더 자세한 시나리오별 가이드는 다음 문서를 참조하세요:

- **DTO-Adapter 필드 매핑**: `references/dto-adapter-field-mapping.md` (백엔드 연동 시)
- **변경 전파 가이드**: `references/change-propagation-guide.md`

## Template Files

변경을 빠르게 적용할 수 있는 템플릿:

- **Adapter 업데이트**: `assets/templates/adapter-update.template.ts` (백엔드 연동 시)
- **Presenter 업데이트**: `assets/templates/presenter-update.template.ts`
- **Mapper 업데이트**: `assets/templates/mapper-update.template.ts`

## Usage Examples

### Example 1: Brochure에 publishedAt 필드 추가

**1단계: 파일 찾기**
```bash
node scripts/find-impact-files.ts brochure
```

**2단계: Model 업데이트**
```typescript
// brochure.model.ts
export interface BrochureModel {
  // 기존 필드...
  publishedAt?: string; // 추가
}
```

**3단계: Presenter 업데이트**
```typescript
// brochure.presenter.ts
export class BrochurePresenter implements BrochureModel {
  readonly publishedAt?: string; // 추가
  // create(), copyWith() 업데이트...
}
```

**4단계: Mapper 업데이트**
```typescript
// brochure.mapper.ts
static fromModel(model: BrochureModel): BrochurePresenter {
  return BrochurePresenter.create({
    // 기존 필드...
    publishedAt: model.publishedAt, // 추가
  });
}
```

**5단계: 검증**
```bash
node scripts/validate-type-consistency.ts brochure
```

### Example 2: IR에서 deprecated_field 삭제

**1단계: UI에서 사용 제거**
```typescript
// IrList.section.tsx
// {ir.deprecated_field} 제거
```

**2단계: Service에서 제거**
```typescript
// ir.service.ts
// deprecated_field 처리 로직 제거
```

**3단계: Mapper에서 제거**
```typescript
// ir.mapper.ts
// deprecated_field 변환 로직 제거
```

**4단계: Presenter에서 제거**
```typescript
// ir.presenter.ts
// readonly deprecated_field 제거
```

**5단계: Model에서 제거**
```typescript
// ir.model.ts
// deprecated_field 필드 제거
```

**6단계: 검증**
```bash
# 프로젝트 전체에서 검색
grep -r "deprecated_field" portal/src/
```

## Best Practices

### 1. 한 번에 하나씩
- 여러 필드를 동시에 변경하지 마세요
- 각 필드마다 전체 계층을 완료한 후 다음 필드로 진행

### 2. 타입 에러를 가이드로 활용
- TypeScript 컴파일 에러는 변경이 필요한 위치를 알려줍니다
- 에러가 없어질 때까지 계층별로 수정

### 3. 테스트 주도
- 변경 전 기존 기능 테스트
- 변경 후 새 기능 테스트
- 회귀 테스트 수행

### 4. 커밋 전략
- 계층별로 커밋 (Model → Presenter → Mapper → Service)
- 각 커밋이 컴파일 가능하도록 유지
- 롤백이 쉽도록 작은 단위로 커밋

### 5. 문서화
- Model 필드에 JSDoc 주석 추가
- 변경 사유를 커밋 메시지에 명시
- Breaking change는 CHANGELOG에 기록

## Maintenance

### 프로젝트 구조 변경 시

파일 탐색 패턴이 변경되면 스크립트를 업데이트하세요:
- `scripts/find-impact-files.ts`의 Glob 패턴 수정
- 새로운 계층 추가 시 패턴 추가

### 네이밍 컨벤션 변경 시

파일명 패턴이 변경되면:
- 스크립트의 정규식 패턴 업데이트
- 예: `*.service.ts` → `*.api.ts`

### 새 도메인 추가 시

새 도메인이 추가되면 스크립트로 검증:
```bash
node scripts/find-impact-files.ts <new-domain>
```

모든 필수 파일이 올바르게 탐색되는지 확인하세요.
