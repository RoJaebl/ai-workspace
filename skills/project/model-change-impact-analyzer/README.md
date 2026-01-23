# Model Change Impact Analyzer

프론트엔드 Model 변경 시 영향받는 모든 계층(Presenter, Mapper, Service, Hooks, UI)을 자동으로 분석하고 변경 가이드를 제공하는 Cursor 스킬입니다.

## 📋 개요

이 프로젝트는 명확히 분리된 타입 계층 구조를 사용합니다:

```
Backend API → DTO → Adapter → Model → Mapper → Presenter → Service → Hooks → UI
```

Model을 변경하면 모든 상위 계층에 영향이 전파됩니다. 이 스킬은 영향받는 파일을 자동으로 찾고, 변경 순서를 제시하며, 체크리스트를 제공합니다.

## 🚀 빠른 시작

### 1. 영향받는 파일 찾기

```bash
cd /root/documents/lumir-portal/.cursor/skills/model-change-impact-analyzer
node scripts/find-impact-files.ts <domain>
```

예시:
```bash
node scripts/find-impact-files.ts brochure
node scripts/find-impact-files.ts ir
```

### 2. 현재 필드 구조 확인

```bash
node scripts/analyze-model-changes.ts <domain>
```

### 3. 타입 일관성 검증

```bash
node scripts/validate-type-consistency.ts <domain>
```

### 4. 영향도 다이어그램 생성

```bash
node scripts/generate-impact-diagram.ts <domain> [fieldName]
```

## 📂 스킬 구조

```
model-change-impact-analyzer/
├── SKILL.md                              # 메인 가이드
├── README.md                             # 이 파일
├── scripts/                              # 자동화 스크립트
│   ├── find-impact-files.ts              # 영향 파일 탐색
│   ├── analyze-model-changes.ts          # Model 변경 감지
│   ├── validate-type-consistency.ts      # 타입 일관성 검증
│   └── generate-impact-diagram.ts        # 영향도 다이어그램
├── assets/
│   ├── templates/                        # 코드 템플릿
│   │   ├── presenter-update.template.ts
│   │   └── mapper-update.template.ts
│   └── checklists/                       # 변경 체크리스트
│       ├── field-addition.md
│       ├── field-removal.md
│       └── type-change.md
└── references/                           # 상세 가이드
    └── change-propagation-guide.md
```

## 🔄 변경 시나리오별 가이드

### 시나리오 1: 필드 추가

**변경 순서**: Model → Presenter → Mapper → Service → Hooks → UI (Bottom-up)

1. 영향 파일 찾기
2. `assets/checklists/field-addition.md` 참조
3. 순차적으로 변경
4. 타입 일관성 검증

**상세 가이드**: `references/change-propagation-guide.md` - 시나리오 1

### 시나리오 2: 필드 삭제

**변경 순서**: UI → Hooks → Service → Mapper → Presenter → Model (Top-down)

1. 사용처 확인 (`grep -r "fieldName"`)
2. `assets/checklists/field-removal.md` 참조
3. 역순으로 제거
4. 완전 제거 확인

**상세 가이드**: `references/change-propagation-guide.md` - 시나리오 2

### 시나리오 3: 타입 변경

**변경 순서**: Model → Presenter → Mapper → Service → UI

1. Breaking Change 여부 확인
2. `assets/checklists/type-change.md` 참조
3. 타입 가드 추가/제거
4. 엣지 케이스 테스트

**상세 가이드**: `references/change-propagation-guide.md` - 시나리오 3

## 🛠️ 스크립트 상세

### find-impact-files.ts

도메인명으로 관련된 모든 파일을 찾습니다.

```bash
node scripts/find-impact-files.ts brochure
```

**출력**:
- Model 파일 경로
- Presenter 파일 경로
- Mapper 파일 경로
- Service 파일 목록
- Hooks 파일 목록
- UI 컴포넌트 목록
- 변경 순서 가이드

### analyze-model-changes.ts

Model 파일의 현재 필드 구조를 분석합니다.

```bash
node scripts/analyze-model-changes.ts brochure
```

**출력**:
- Required 필드 목록
- Optional 필드 목록
- Git diff (변경사항이 있는 경우)
- Next steps 가이드

### validate-type-consistency.ts

Model, Presenter, Mapper 간 타입 일관성을 검증합니다.

```bash
node scripts/validate-type-consistency.ts brochure
```

**검증 항목**:
- Model 필드가 Presenter에 모두 존재하는지
- Mapper의 fromModel()에서 모든 필드를 변환하는지
- Mapper의 toModel()에서 모든 필드를 변환하는지

**출력**:
- ✅ 통과한 검증 항목
- ❌ 실패한 검증 항목
- ⚠️ 경고 항목
- 수정 방법 제안

### generate-impact-diagram.ts

변경 전파 경로를 Mermaid 다이어그램으로 시각화합니다.

```bash
node scripts/generate-impact-diagram.ts brochure publishedAt
```

**출력**:
- 의존성 다이어그램
- 필드 추가 플로우 (Bottom-up)
- 필드 삭제 플로우 (Top-down)
- 다이어그램 파일 (output/ 폴더)

## 📝 체크리스트

### 필드 추가 (field-addition.md)

- Model 계층: interface 정의, JSDoc 작성
- Presenter 계층: readonly 필드, create(), copyWith()
- Mapper 계층: fromModel(), toModel(), 배열 변환
- Service 계층: 비즈니스 로직, Mock 데이터
- Hooks 계층: 반환 타입 확인
- UI 계층: 렌더링, 폼 입력, 타입 가드
- 검증: 타입 체크, 린트, 런타임 테스트

### 필드 삭제 (field-removal.md)

- 삭제 전: 사용처 확인, 대체 방안 검토
- UI 계층: 렌더링 제거
- Hooks 계층: 필드 참조 제거
- Service 계층: 로직 제거
- Mapper 계층: 변환 제거
- Presenter 계층: 필드 및 메서드 제거
- Model 계층: interface에서 제거
- 검증: grep 결과 0개, 완전 제거 확인

### 타입 변경 (type-change.md)

- 변경 전: Breaking Change 여부, 호환성 검토
- Model 계층: 타입 변경, JSDoc 업데이트
- Presenter 계층: 필드 타입, 기본값 조정
- Mapper 계층: 타입 캐스팅, 변환 로직
- Service 계층: 타입 호환성, 검증 로직
- UI 계층: 타입 가드, 조건부 렌더링
- 검증: 타입 에러, 엣지 케이스, 호환성

## 🎯 템플릿

### Presenter 업데이트 템플릿

`assets/templates/presenter-update.template.ts`

새 필드를 Presenter에 추가하는 전체 패턴을 제공합니다:
- readonly 필드 추가
- constructor 파라미터 추가
- create() 메서드 업데이트
- copyWith() 업데이트
- createEmpty() 기본값
- 헬퍼 메서드 예시

### Mapper 업데이트 템플릿

`assets/templates/mapper-update.template.ts`

새 필드를 Mapper에 추가하는 전체 패턴을 제공합니다:
- fromModel() 변환
- toModel() 역변환
- 배열 변환
- toCreateModel(), toUpdateModel()
- 하위 엔티티 변환
- 타입별 변환 패턴

## 📚 상세 가이드

### change-propagation-guide.md

시나리오별 상세 가이드:
- 시나리오 1: 필드 추가 (publishedAt 예시)
- 시나리오 2: 필드 삭제 (deprecated_field 예시)
- 시나리오 3: 타입 변경 (boolean → boolean | undefined)
- 시나리오 4: Optional ↔ Required 변경
- 시나리오 5: 관계 필드 추가 (category)
- 시나리오 6: 배열 필드 추가 (attachments)
- 시나리오 7: 필드 이름 변경

각 시나리오마다 단계별로 코드 예시와 함께 설명합니다.

## 🔧 사용 예시

### 예시 1: Brochure에 publishedAt 필드 추가

```bash
# 1. 영향 파일 찾기
node scripts/find-impact-files.ts brochure

# 2. Model 업데이트
# brochure.model.ts에 publishedAt?: string 추가

# 3. Presenter 업데이트
# assets/templates/presenter-update.template.ts 참조

# 4. Mapper 업데이트
# assets/templates/mapper-update.template.ts 참조

# 5. 타입 검증
node scripts/validate-type-consistency.ts brochure

# 6. 다이어그램 확인
node scripts/generate-impact-diagram.ts brochure publishedAt
```

### 예시 2: IR에서 deprecated_field 삭제

```bash
# 1. 사용처 확인
grep -r "deprecated_field" portal/src/

# 2. UI부터 역순으로 제거
# assets/checklists/field-removal.md 참조

# 3. 완전 제거 확인
grep -r "deprecated_field" portal/src/
# (결과 없어야 함)

# 4. 타입 검증
node scripts/validate-type-consistency.ts ir
```

## ⚡ Best Practices

### 1. 한 번에 하나씩
여러 필드를 동시에 변경하지 말고, 각 필드마다 전체 계층을 완료한 후 다음으로 진행하세요.

### 2. 타입 에러를 가이드로 활용
TypeScript 컴파일 에러는 변경이 필요한 위치를 알려줍니다.

### 3. 계층별 커밋
각 계층을 완료할 때마다 커밋하여 롤백이 쉽도록 하세요.

```bash
git commit -m "feat(brochure): add publishedAt to Model"
git commit -m "feat(brochure): add publishedAt to Presenter"
git commit -m "feat(brochure): add publishedAt conversion to Mapper"
```

### 4. 검증은 필수
변경 후 반드시 타입 검증, 린트, 테스트를 수행하세요.

```bash
npm run type-check
npm run lint
npm run test
```

## 🐛 문제 해결

### 타입 에러: Property does not exist

**원인**: Model에 필드가 있지만 Presenter에 없음

**해결**: Presenter 클래스에 readonly 필드 추가 및 메서드 업데이트

### 변환 에러: Cannot read property of undefined

**원인**: Mapper에서 optional 필드를 제대로 처리하지 않음

**해결**: Optional 체크 추가
```typescript
category: model.category ? this.fromCategoryModel(model.category) : undefined
```

### 린트 경고: Unused variable

**원인**: 필드를 삭제했지만 일부 계층에 남아있음

**해결**: grep으로 프로젝트 전체 검색 후 완전 제거

## 🎓 추가 학습

- **SKILL.md**: 스킬 사용법 및 아키텍처 설명
- **references/change-propagation-guide.md**: 시나리오별 상세 가이드
- **assets/checklists/**: 변경 유형별 체크리스트
- **assets/templates/**: 코드 템플릿

## 🤝 기여

이 스킬을 개선하고 싶으시면:
1. 새로운 시나리오를 `references/change-propagation-guide.md`에 추가
2. 체크리스트를 `assets/checklists/`에 추가
3. 스크립트 개선 제안

## 📞 지원

문제가 발생하면:
1. `references/change-propagation-guide.md` 확인
2. 해당 체크리스트 다시 확인
3. 타입 검증 스크립트 실행

---

**버전**: 1.0.0  
**마지막 업데이트**: 2026-01-23  
**관리자**: Cursor AI Skills Team
