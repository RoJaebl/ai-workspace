# 타입 변경 체크리스트

Model 필드의 타입을 변경할 때 모든 계층에서 필요한 변경 사항을 확인하는 체크리스트입니다.

## 변경 순서

타입 변경은 **Bottom-up** 방식으로 진행합니다:

**백엔드 연동 시**: 0. DTO & Adapter → 1. Model → 2. Presenter → 3. Mapper → 4. Service → 5. Hooks → 6. UI

**프론트엔드만**: 1. Model → 2. Presenter → 3. Mapper → 4. Service → 5. Hooks → 6. UI

## 변경 전 확인사항

- [ ] **타입 변경이 필요한 이유 명확화**
  - 비즈니스 로직 변경
  - 백엔드 API 스펙 변경
  - 타입 안정성 개선

- [ ] **호환성 검토**
  - Breaking Change 여부 확인
  - 기존 데이터 호환성
  - 점진적 마이그레이션 필요 여부

- [ ] **변경 유형 파악**
  - 확장 (string → string | null) ✅ 안전
  - 축소 (string | null → string) ⚠️ 위험
  - 완전 변경 (string → number) ⚠️ 위험

## 0. DTO & Adapter 계층 (백엔드 연동 시)

### 백엔드 API 스펙 확인

- [ ] **타입 변경 출처 확인**
  - 백엔드 스펙이 변경되었는지
  - 프론트엔드만 타입을 변경하는지
  - 양쪽 모두 타입을 변경하는지

### 시나리오 A: 백엔드 타입 변경

백엔드 API 스펙이 변경된 경우:

- [ ] **DTO 타입 변경**
  
  파일: `api/_backend/**/{domain}/types/{domain}.dto.ts`
  
  ```typescript
  export interface XxxResponseDto {
    // viewCount: string; // ❌ 기존
    viewCount: number;    // ✅ 변경 (백엔드에서 변경됨)
  }
  ```

- [ ] **Adapter 변환 로직 수정 또는 제거**
  
  파일: `api/_backend/**/{domain}/types/{domain}.adapter.ts`
  
  ```typescript
  export class XxxAdapter {
    static fromResponse(dto: XxxResponseDto): XxxModel {
      return {
        // ❌ 기존 (string → number 변환 필요했음)
        // viewCount: parseInt(dto.viewCount, 10),
        
        // ✅ 변경 (타입 일치, 변환 불필요)
        viewCount: dto.viewCount, // 그대로 전달
      };
    }
  }
  ```

### 시나리오 B: 프론트엔드만 타입 변경

프론트엔드만 타입을 변경하는 경우:

- [ ] **Adapter에 타입 변환 로직 추가**
  
  파일: `api/_backend/**/{domain}/types/{domain}.adapter.ts`
  
  ```typescript
  export class XxxAdapter {
    static fromResponse(dto: XxxResponseDto): XxxModel {
      return {
        // DTO는 string 유지, Model은 number로 변경
        // ❌ 기존 (타입 일치했음)
        // viewCount: dto.viewCount,
        
        // ✅ 변경 (타입 변환 추가)
        viewCount: parseInt(dto.viewCount, 10), // string → number
      };
    }
    
    static toRequest(model: CreateXxxModel): CreateXxxDto {
      return {
        // Model은 number, DTO는 string
        viewCount: model.viewCount.toString(), // number → string
      };
    }
  }
  ```

- [ ] **타입 변환 실패 케이스 처리**
  
  ```typescript
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // parseInt 실패 시 기본값
      viewCount: isNaN(parseInt(dto.viewCount, 10)) 
        ? 0 
        : parseInt(dto.viewCount, 10),
    };
  }
  ```

### 시나리오 C: Optional ↔ Required 변경

- [ ] **DTO 타입 Optional 변경**
  
  ```typescript
  export interface XxxResponseDto {
    // field: string; // ❌ 기존 (Required)
    field?: string;   // ✅ 변경 (Optional)
  }
  ```

- [ ] **Adapter에서 undefined 처리**
  
  ```typescript
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // Optional 처리
      field: dto.field ?? undefined,
      
      // 또는 기본값 제공
      field: dto.field ?? "",
    };
  }
  ```

### null ↔ undefined 변환

- [ ] **Response 변환에서 null → undefined**
  
  ```typescript
  static fromResponse(dto: { field: string | null }): { field: string | undefined } {
    return {
      field: dto.field ?? undefined,
    };
  }
  ```

- [ ] **Request 변환에서 undefined → null**
  
  ```typescript
  static toRequest(model: { field: string | undefined }): { field: string | null } {
    return {
      field: model.field ?? null,
    };
  }
  ```

## 1. Model 계층

### 파일: `_types/*.model.ts`

- [ ] **메인 Model interface에서 타입 변경**
  ```typescript
  export interface XxxModel {
    // isPublic: boolean; // ❌ 기존
    isPublic?: boolean; // ✅ 변경 (Optional로 변경)
    
    // 또는
    // viewCount: string; // ❌ 기존
    // viewCount: number; // ✅ 변경 (타입 변경)
  }
  ```

- [ ] **CreateModel 타입 변경**
  ```typescript
  export interface CreateXxxModel {
    // ... 동일하게 변경
  }
  ```

- [ ] **UpdateModel 타입 변경**
  ```typescript
  export interface UpdateXxxModel {
    // ... 동일하게 변경
  }
  ```

- [ ] **JSDoc 주석 업데이트**
  ```typescript
  /**
   * 공개 여부
   * @remarks 기본값은 false. undefined는 미설정 상태를 의미함.
   */
  isPublic?: boolean;
  ```

## 2. Presenter 계층

### 파일: `_types/*.presenter.ts`

- [ ] **readonly 필드 타입 변경**
  ```typescript
  export class XxxPresenter implements XxxModel {
    // readonly isPublic: boolean; // ❌ 기존
    readonly isPublic?: boolean; // ✅ 변경
  }
  ```

- [ ] **constructor 파라미터 타입 변경**
  ```typescript
  private constructor(data: {
    // isPublic: boolean; // ❌ 기존
    isPublic?: boolean; // ✅ 변경
  }) {
    this.isPublic = data.isPublic;
  }
  ```

- [ ] **create() 메서드 타입 변경**
  ```typescript
  static create(data: {
    // isPublic: boolean; // ❌ 기존
    isPublic?: boolean; // ✅ 변경
  }): XxxPresenter {
    return new XxxPresenter({
      isPublic: data.isPublic,
    });
  }
  ```

- [ ] **createEmpty() 기본값 조정**
  ```typescript
  static createEmpty(): XxxPresenter {
    return XxxPresenter.create({
      // isPublic: false, // ❌ 기존 (Required였을 때)
      isPublic: undefined, // ✅ 변경 (Optional이므로 undefined 가능)
      // 또는 생략
    });
  }
  ```

- [ ] **copyWith() 타입 호환성 확인**
  ```typescript
  copyWith(updates: Partial<XxxPresenter>): XxxPresenter {
    return XxxPresenter.create({
      // ... 기존 필드
      isPublic: updates.isPublic ?? this.isPublic, // 자동으로 타입 추론
    });
  }
  ```

- [ ] **헬퍼 메서드 타입 시그니처 변경**
  ```typescript
  // Optional로 변경된 경우 파라미터도 Optional로
  static displayPublicStatus(isPublic?: boolean): string {
    return isPublic === true ? "공개" : 
           isPublic === false ? "비공개" : 
           "미설정";
  }
  ```

## 3. Mapper 계층

### 파일: `_services/*.mapper.ts`

- [ ] **fromModel() 타입 변환 확인**
  ```typescript
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      // ... 기존 필드
      isPublic: model.isPublic, // 자동으로 타입 추론 (대부분 수정 불필요)
    });
  }
  ```

- [ ] **toModel() 타입 변환 확인**
  ```typescript
  static toModel(presenter: XxxPresenter): XxxModel {
    return {
      // ... 기존 필드
      isPublic: presenter.isPublic, // 자동으로 타입 추론
    };
  }
  ```

- [ ] **타입 캐스팅 필요 여부 확인**
  ```typescript
  // 완전히 다른 타입으로 변경된 경우 변환 로직 필요
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      // viewCount: model.viewCount, // ❌ string → number 변환 필요
      viewCount: parseInt(model.viewCount, 10), // ✅ 명시적 변환
    });
  }
  ```

- [ ] **Optional 처리 로직 확인**
  ```typescript
  // Optional로 변경된 경우 undefined 체크
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      // category: this.fromCategoryModel(model.category), // ❌ 에러 가능
      category: model.category 
        ? this.fromCategoryModel(model.category) 
        : undefined, // ✅ Optional 처리
    });
  }
  ```

## 4. Service 계층

### 파일: `_services/*.service.ts`

- [ ] **Service 로직에서 타입 호환성 확인**
  ```typescript
  // ❌ 기존 (Required였을 때)
  // if (data.isPublic) { ... }
  
  // ✅ 변경 (Optional이므로 명시적 체크)
  if (data.isPublic === true) { ... }
  ```

- [ ] **Mock 데이터 타입 업데이트**
  ```typescript
  private static mockData: XxxModel[] = [
    {
      // isPublic: true, // ❌ 기존
      isPublic: true, // ✅ 변경 (타입은 같지만 의미 변경)
    },
  ];
  ```

- [ ] **검증 로직 업데이트**
  ```typescript
  // Required → Optional 변경 시 검증 제거
  // if (!data.isPublic) {
  //   throw new Error("isPublic is required");
  // } // ❌ 제거
  ```

## 5. Hooks 계층

### 파일: `_hooks/**/*.ts`

- [ ] **Hooks에서 타입 호환성 확인**
  - Presenter 타입을 사용하므로 대부분 자동 반영
  - 특정 필드를 직접 사용하는 경우 확인 필요

- [ ] **조건부 로직 업데이트**
  ```typescript
  // ❌ 기존
  // if (item.isPublic) { ... }
  
  // ✅ 변경 (Optional이므로 명시적 체크)
  if (item.isPublic === true) { ... }
  ```

## 6. UI 계층

### 파일: `_ui/**/*.tsx`

- [ ] **타입 가드 추가/제거**
  ```typescript
  // Required → Optional 변경 시 타입 가드 추가
  // ❌ 기존
  // <div>{item.isPublic ? "공개" : "비공개"}</div>
  
  // ✅ 변경
  <div>
    {item.isPublic === true ? "공개" : 
     item.isPublic === false ? "비공개" : 
     "미설정"}
  </div>
  
  // 또는 Nullish coalescing
  {item.isPublic ?? false ? "공개" : "비공개"}
  ```

- [ ] **폼 입력 타입 업데이트**
  ```typescript
  // string → number 변경 시
  <Input
    type="number" // type 변경
    value={formData.viewCount}
    onChange={(e) => updateFormData({ 
      viewCount: parseInt(e.target.value, 10) // 파싱 추가
    })}
  />
  ```

- [ ] **조건부 렌더링 업데이트**
  ```typescript
  // Optional로 변경 시 존재 여부 체크
  {item.optionalField && <div>{item.optionalField}</div>}
  ```

## 7. 검증

### 타입 검증

- [ ] **TypeScript 컴파일 에러 없음**
  ```bash
  npm run type-check
  ```

- [ ] **타입 추론 확인**
  - IDE에서 타입이 올바르게 추론되는지 확인

- [ ] **Strict 모드 통과**
  - tsconfig.json의 strict 옵션 활성화 상태에서 확인

### 런타임 테스트

- [ ] **기존 데이터 호환성 테스트**
  - 기존 타입 데이터가 새 타입으로 변환되는지
  - 예: string "123" → number 123

- [ ] **Optional 변경 시 undefined 처리 테스트**
  - undefined 값이 UI에서 올바르게 표시되는지
  - 폼 입력에서 빈 값 처리 확인

- [ ] **타입 변경 후 CRUD 동작 확인**
  - 생성/조회/수정/삭제 모두 정상 작동

### 엣지 케이스 테스트

- [ ] **null vs undefined 처리**
  ```typescript
  // Optional 필드의 null vs undefined 구분
  item.field === null // null인 경우
  item.field === undefined // undefined인 경우
  item.field == null // null 또는 undefined
  ```

- [ ] **빈 값 처리**
  ```typescript
  // 빈 문자열 "", 0, false 등의 falsy 값 처리
  item.field || "default" // ❌ 0, false도 "default"로 처리됨
  item.field ?? "default" // ✅ null/undefined만 "default"
  ```

- [ ] **타입 변환 경계값 테스트**
  ```typescript
  // string → number 변환 시
  parseInt("") // NaN
  parseInt("abc") // NaN
  parseInt("123.45") // 123 (소수점 버림)
  ```

## 8. 타입 변경 유형별 가이드

### A. Required → Optional (field: Type → field?: Type)

**안전한 변경** ✅

```typescript
// Model
// isPublic: boolean; → isPublic?: boolean;

// UI 업데이트 필요
{item.isPublic ?? false ? "공개" : "비공개"}
```

- [ ] UI에 타입 가드 추가
- [ ] 기본값 처리 전략 결정
- [ ] createEmpty()에서 생략 가능

### B. Optional → Required (field?: Type → field: Type)

**Breaking Change** ⚠️

```typescript
// Model
// isPublic?: boolean; → isPublic: boolean;

// createEmpty()에 기본값 필수
static createEmpty(): XxxPresenter {
  return XxxPresenter.create({
    isPublic: false, // 기본값 필수
  });
}
```

- [ ] 기존 데이터에 값이 있는지 확인
- [ ] 기본값 제공 전략 수립
- [ ] UI에서 타입 가드 제거 가능

### C. 타입 확장 (Type → Type | OtherType)

**안전한 변경** ✅

```typescript
// string → string | null
// isPublic: boolean → isPublic: boolean | undefined (Optional과 동일)

// Union 타입
// status: "active" → status: "active" | "inactive" | "pending"
```

- [ ] 새 타입 케이스 처리 로직 추가
- [ ] UI에서 모든 케이스 렌더링

### D. 타입 축소 (Type | OtherType → Type)

**Breaking Change** ⚠️

```typescript
// string | null → string
// 기존 null 값 처리 필요
```

- [ ] 기존 데이터 마이그레이션
- [ ] null 값을 기본값으로 변환

### E. 완전히 다른 타입 (Type → OtherType)

**Breaking Change** ⚠️

```typescript
// string → number
// "123" → 123

// Mapper에서 변환 로직 필수
static fromModel(model: XxxModel): XxxPresenter {
  return XxxPresenter.create({
    viewCount: parseInt(model.viewCount, 10),
  });
}
```

- [ ] Mapper에 명시적 변환 로직 추가
- [ ] 변환 실패 케이스 처리
- [ ] 기존 데이터 마이그레이션

## 9. 점진적 변경 전략

Breaking Change인 경우 점진적 변경:

### 1단계: 타입 확장 (호환성 유지)

```typescript
// 기존
isPublic: boolean;

// 중간 단계 (Union 타입)
isPublic: boolean | undefined;

// 최종
isPublic?: boolean;
```

### 2단계: 코드 업데이트

- 새 타입을 지원하도록 코드 수정
- 타입 가드 추가

### 3단계: 타입 축소

- 충분히 안정화되면 불필요한 타입 제거

## 10. 롤백 계획

- [ ] **Git 커밋 분리**
  - Model 타입 변경 커밋
  - Presenter 타입 변경 커밋
  - UI 타입 가드 추가 커밋

- [ ] **Feature Flag 활용**
  ```typescript
  const NEW_TYPE_ENABLED = process.env.NEW_TYPE_ENABLED === "true";
  
  if (NEW_TYPE_ENABLED) {
    // 새 타입 로직
  } else {
    // 기존 타입 로직
  }
  ```

## 완료 확인

모든 항목을 체크한 후:

- [ ] **타입 에러 0개**
- [ ] **린트 경고 0개**
- [ ] **테스트 통과**
- [ ] **엣지 케이스 처리**
- [ ] **기존 데이터 호환성 확인**
- [ ] **커밋 및 PR 생성**

---

## 참고

- **상세 가이드**: `references/change-propagation-guide.md` - 시나리오 3 참조
- **문제 해결**: `references/troubleshooting.md`

## 주의사항

⚠️ **타입 변경은 신중하게**: Breaking Change 가능성을 항상 고려하세요.

✅ **점진적 변경**: 큰 타입 변경은 여러 단계로 나누어 진행하세요.
