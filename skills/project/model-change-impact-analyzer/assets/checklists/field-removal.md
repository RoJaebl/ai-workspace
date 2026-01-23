# 필드 삭제 체크리스트

Model에서 필드를 삭제할 때 모든 계층에서 필요한 변경 사항을 확인하는 체크리스트입니다.

## ⚠️ 중요: Breaking Change

필드 삭제는 **Breaking Change**입니다. 프로덕션 환경에서는 신중하게 진행해야 합니다.

## 변경 순서

필드 삭제는 **Top-down** 방식으로 진행합니다:

**프론트엔드 + 백엔드**: 1. UI → 2. Hooks → 3. Service → 4. Mapper → 5. Presenter → 6. Model → 7. Adapter → 8. DTO

**프론트엔드만**: 1. UI → 2. Hooks → 3. Service → 4. Mapper → 5. Presenter → 6. Model

## 삭제 전 확인사항

- [ ] **필드가 정말 필요 없는지 확인**
  - 다른 기능에서 사용하지 않는지
  - 미래에 필요하지 않을지
  - 데이터베이스에 저장된 값은 어떻게 할지

- [ ] **대체 방안 검토**
  - Deprecated 표시 후 점진적 제거
  - 다른 필드로 마이그레이션

- [ ] **영향 범위 파악**
  ```bash
  # 프로젝트 전체에서 필드 사용 확인
  grep -r "deprecated_field" portal/src/
  ```

## 1. UI 계층

### 파일: `_ui/**/*.tsx`

- [ ] **렌더링 코드 제거**
  ```typescript
  // ❌ 제거
  // <TableCell>{item.deprecated_field}</TableCell>
  ```

- [ ] **조건부 렌더링 제거**
  ```typescript
  // ❌ 제거
  // {item.deprecated_field && <div>{item.deprecated_field}</div>}
  ```

- [ ] **폼 입력 필드 제거**
  ```typescript
  // ❌ 제거
  // <Input
  //   value={formData.deprecated_field}
  //   onChange={(e) => updateFormData({ deprecated_field: e.target.value })}
  // />
  ```

- [ ] **테이블 컬럼 제거**
  ```typescript
  const columns = [
    // ❌ 제거
    // {
    //   header: "Deprecated Field",
    //   cell: (row) => row.deprecated_field,
    // },
  ];
  ```

- [ ] **상세 패널 표시 제거**
  ```typescript
  // ❌ 제거
  // <DetailRow label="Deprecated Field" value={item.deprecated_field} />
  ```

## 2. Hooks 계층

### 파일: `_hooks/**/*.ts`

- [ ] **특정 필드 참조 제거**
  ```typescript
  // ❌ 제거
  // const { deprecated_field } = presenter;
  ```

- [ ] **필드 사용 로직 제거**
  ```typescript
  // ❌ 제거
  // if (item.deprecated_field) {
  //   // ...
  // }
  ```

- [ ] **필드 필터링 제거**
  ```typescript
  // ❌ 제거
  // const filtered = items.filter(item => item.deprecated_field === value);
  ```

## 3. Service 계층

### 파일: `_services/*.service.ts`

- [ ] **Service 로직에서 필드 처리 제거**
  ```typescript
  // Mock 데이터에서 제거
  private static mockData: XxxModel[] = [
    {
      // deprecated_field: "...", // ❌ 제거
    },
  ];
  ```

- [ ] **특별한 비즈니스 로직 제거**
  ```typescript
  // ❌ 제거
  // if (data.deprecated_field) {
  //   // 특별 처리
  // }
  ```

- [ ] **검증 로직 제거**
  ```typescript
  // ❌ 제거
  // if (!data.deprecated_field) {
  //   throw new Error("Deprecated field is required");
  // }
  ```

## 4. Mapper 계층

### 파일: `_services/*.mapper.ts`

- [ ] **fromModel()에서 변환 제거**
  ```typescript
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      // ... 기존 필드
      // deprecated_field: model.deprecated_field, // ❌ 제거
    });
  }
  ```

- [ ] **toModel()에서 역변환 제거**
  ```typescript
  static toModel(presenter: XxxPresenter): XxxModel {
    return {
      // ... 기존 필드
      // deprecated_field: presenter.deprecated_field, // ❌ 제거
    };
  }
  ```

- [ ] **toCreateModel()에서 제거**
  ```typescript
  static toCreateModel(presenter: XxxPresenter): CreateXxxModel {
    return {
      // ... 기존 필드
      // deprecated_field: presenter.deprecated_field, // ❌ 제거
    };
  }
  ```

- [ ] **toUpdateModel()에서 제거**
  ```typescript
  static toUpdateModel(presenter: XxxPresenter): UpdateXxxModel {
    return {
      // ... 기존 필드
      // deprecated_field: presenter.deprecated_field, // ❌ 제거
    };
  }
  ```

## 5. Presenter 계층

### 파일: `_types/*.presenter.ts`

- [ ] **readonly 필드 제거**
  ```typescript
  export class XxxPresenter implements XxxModel {
    // readonly deprecated_field: string; // ❌ 제거
  }
  ```

- [ ] **private constructor 파라미터 제거**
  ```typescript
  private constructor(data: {
    // ... 기존 필드
    // deprecated_field: string; // ❌ 제거
  }) {
    // ... 기존 할당
    // this.deprecated_field = data.deprecated_field; // ❌ 제거
  }
  ```

- [ ] **create() 메서드 파라미터 제거**
  ```typescript
  static create(data: {
    // ... 기존 필드
    // deprecated_field: string; // ❌ 제거
  }): XxxPresenter {
    return new XxxPresenter({
      // ... 기존 전달
      // deprecated_field: data.deprecated_field, // ❌ 제거
    });
  }
  ```

- [ ] **copyWith() 로직 제거**
  ```typescript
  copyWith(updates: Partial<XxxPresenter>): XxxPresenter {
    return XxxPresenter.create({
      // ... 기존 필드
      // deprecated_field: updates.deprecated_field ?? this.deprecated_field, // ❌ 제거
    });
  }
  ```

- [ ] **createEmpty() 기본값 제거**
  ```typescript
  static createEmpty(): XxxPresenter {
    return XxxPresenter.create({
      // ... 기존 필드
      // deprecated_field: "", // ❌ 제거
    });
  }
  ```

- [ ] **헬퍼 메서드 제거**
  ```typescript
  // ❌ 제거
  // static displayDeprecatedField(value?: string): string {
  //   return value ?? "-";
  // }
  
  // displayDeprecatedField(): string {
  //   return XxxPresenter.displayDeprecatedField(this.deprecated_field);
  // }
  ```

## 6. Model 계층

### 파일: `_types/*.model.ts`

- [ ] **메인 Model interface에서 필드 제거**
  ```typescript
  export interface XxxModel {
    // ... 기존 필드
    // deprecated_field: string; // ❌ 제거
  }
  ```

- [ ] **CreateModel에서 필드 제거**
  ```typescript
  export interface CreateXxxModel {
    // ... 기존 필드
    // deprecated_field: string; // ❌ 제거
  }
  ```

- [ ] **UpdateModel에서 필드 제거**
  ```typescript
  export interface UpdateXxxModel {
    // ... 기존 필드
    // deprecated_field?: string; // ❌ 제거
  }
  ```

- [ ] **JSDoc 주석 제거**

## 7. DTO & Adapter 계층 (백엔드 연동 시)

### 파일: `api/_backend/**/{domain}/types/{domain}.adapter.ts`

- [ ] **Response 변환에서 매핑 제거**
  
  ```typescript
  export class XxxAdapter {
    static fromXxxResponse(dto: XxxResponseDto): XxxModel {
      return {
        // ... 기존 필드
        // deprecated_field: dto.deprecated_field, // ❌ 제거
        
        // 또는 매핑이 있었다면
        // name: dto.deprecatedFieldName, // ❌ 제거
      };
    }
  }
  ```

- [ ] **Request 변환에서 역매핑 제거**
  
  ```typescript
  static toCreateXxxRequest(model: CreateXxxModel): CreateXxxDto {
    return {
      // ... 기존 필드
      // deprecatedFieldName: model.deprecated_field, // ❌ 제거
    };
  }
  ```

- [ ] **Private 헬퍼 메서드 제거** (해당 필드 전용 메서드가 있는 경우)
  
  ```typescript
  // ❌ 제거
  // private static _toDeprecatedFieldModel(dto: DeprecatedDto): DeprecatedModel {
  //   return { ... };
  // }
  ```

- [ ] **필드명 매핑 규칙 주석 업데이트**
  
  파일 상단의 매핑 규칙에서 제거:
  
  ```typescript
  /**
   * 필드명 매핑 규칙:
   *   - 첨부파일: fileName ↔ name
   *   // - deprecated: oldName ↔ deprecated_field // ❌ 제거
   */
  ```

### 파일: `api/_backend/**/{domain}/types/{domain}.dto.ts`

- [ ] **백엔드도 필드를 제거했는지 확인**
  
  백엔드 API 문서 또는 실제 응답 확인

- [ ] **Response DTO에서 필드 제거** (백엔드도 제거한 경우)
  
  ```typescript
  export interface XxxResponseDto {
    // ... 기존 필드
    // deprecated_field: string; // ❌ 제거
  }
  ```

- [ ] **Request DTO에서 필드 제거** (백엔드도 제거한 경우)
  
  ```typescript
  export interface CreateXxxDto {
    // ... 기존 필드
    // deprecated_field: string; // ❌ 제거
  }
  ```

- [ ] **백엔드가 아직 제공하는 경우**
  
  DTO는 유지하고 Adapter에서만 무시:
  
  ```typescript
  // DTO는 유지 (백엔드 스펙 그대로)
  export interface XxxResponseDto {
    deprecated_field: string; // 유지
  }
  
  // Adapter에서 무시
  export class XxxAdapter {
    static fromResponse(dto: XxxResponseDto): XxxModel {
      return {
        // deprecated_field 사용하지 않음 (무시)
      };
    }
  }
  ```

### 변경 시나리오

**시나리오 A: 프론트엔드만 제거**
→ UI부터 Model까지 제거 → Adapter에서 무시 → DTO는 유지

**시나리오 B: 백엔드도 제거**
→ UI부터 Model까지 제거 → Adapter 매핑 제거 → DTO 제거

## 8. 검증

### 완전 제거 확인

- [ ] **프로젝트 전체 검색**
  ```bash
  # 필드명으로 검색
  grep -r "deprecated_field" portal/src/
  
  # 결과가 없어야 함
  ```

- [ ] **대소문자 구분 없이 검색**
  ```bash
  grep -ri "deprecated_field" portal/src/
  ```

- [ ] **카멜케이스 변형도 확인**
  ```bash
  # deprecatedField 형태도 확인
  grep -r "deprecatedField" portal/src/
  ```

### 타입 검증

- [ ] **TypeScript 컴파일 에러 없음**
  ```bash
  npm run type-check
  ```

- [ ] **Linter 에러 없음**
  ```bash
  npm run lint
  ```

- [ ] **unused variable 경고 없음**

### 런타임 테스트

- [ ] **목록 조회 동작 확인**
  - 필드 제거 후에도 정상 작동

- [ ] **상세 조회 동작 확인**
  - 필드 제거 후에도 정상 작동

- [ ] **생성/수정 동작 확인**
  - 필드 없이도 정상 저장

- [ ] **기존 데이터 호환성 확인**
  - 기존 데이터에 필드가 있어도 에러 없음

### 기존 기능 영향 확인

- [ ] **관련 없는 기능 정상 작동**
- [ ] **기존 테스트 통과**
- [ ] **회귀 테스트 수행**

## 9. 데이터베이스 고려사항

### 백엔드 연동 시

- [ ] **백엔드 API 스펙 확인**
  - 백엔드에서도 필드를 제거했는지 확인
  - 아직 제거 안 했으면 프론트에서만 무시

- [ ] **기존 데이터 처리**
  - DB에 남아있는 데이터는 어떻게 할지
  - 마이그레이션 필요 여부

- [ ] **API 호환성**
  - 구버전 API와의 호환성
  - 점진적 배포 전략

## 10. 점진적 제거 전략

필드 삭제가 위험한 경우 점진적으로 제거:

### 1단계: Deprecated 표시

```typescript
export interface XxxModel {
  /**
   * @deprecated 이 필드는 더 이상 사용되지 않습니다. 대신 newField를 사용하세요.
   * 2024-02-01에 제거될 예정입니다.
   */
  deprecated_field?: string;
}
```

### 2단계: UI에서 숨김

```typescript
// 렌더링은 하지 않지만 데이터는 유지
// <TableCell>{item.deprecated_field}</TableCell> // 주석 처리
```

### 3단계: 로깅 추가

```typescript
if (data.deprecated_field) {
  console.warn("deprecated_field is still being used:", data.id);
}
```

### 4단계: 모니터링

- 로그를 통해 사용 빈도 확인
- 충분한 기간 동안 관찰 (예: 1개월)

### 5단계: 완전 제거

- 사용이 0으로 확인되면 완전 제거
- 이 체크리스트 따라 진행

## 11. 롤백 계획

문제 발생 시 롤백:

- [ ] **Git 커밋 단위로 분리**
  - 각 계층별로 커밋
  - 롤백이 쉽도록

- [ ] **백업 브랜치 생성**
  ```bash
  git checkout -b backup/remove-deprecated-field
  ```

- [ ] **배포 전 스테이징 테스트**
  - 실제 데이터로 테스트
  - 문제 없는지 확인

## 완료 확인

모든 항목을 체크한 후:

- [ ] **grep 결과 0개**
- [ ] **타입 에러 0개**
- [ ] **린트 경고 0개**
- [ ] **테스트 통과**
- [ ] **런타임 정상 작동**
- [ ] **커밋 및 PR 생성**

---

## 참고

- **템플릿**: 필드 삭제 시 참고할 코드 패턴
- **상세 가이드**: `references/change-propagation-guide.md` - 시나리오 2 참조
- **문제 해결**: `references/troubleshooting.md`

## 주의사항

⚠️ **Breaking Change**: 필드 삭제는 되돌리기 어려우므로 신중하게 진행하세요.

✅ **안전한 방법**: Deprecated 표시 → 숨김 → 모니터링 → 제거 순서로 점진적으로 진행하세요.
