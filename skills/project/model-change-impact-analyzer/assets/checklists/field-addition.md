# 필드 추가 체크리스트

Model에 새로운 필드를 추가할 때 모든 계층에서 필요한 변경 사항을 확인하는 체크리스트입니다.

## 변경 순서

필드 추가는 **Bottom-up** 방식으로 진행합니다:

**백엔드 연동 시**: 0. DTO & Adapter → 1. Model → 2. Presenter → 3. Mapper → 4. Service → 5. Hooks → 6. UI

**프론트엔드 전용**: 1. Model → 2. Presenter → 3. Mapper → 4. Service → 5. Hooks → 6. UI

## 0. DTO & Adapter 계층 (백엔드 연동 시)

### 백엔드 API 스펙 확인

- [ ] **백엔드 API 문서 확인**
  - 새 필드가 백엔드에서 제공되는지 확인
  - 필드명이 프론트엔드와 동일한지 확인
  - 필드 타입 확인 (string, number, boolean 등)

- [ ] **DTO 업데이트** (필요시)
  
  파일: `api/_backend/**/{domain}/types/{domain}.dto.ts`
  
  ```typescript
  // Response DTO
  export interface XxxResponseDto {
    // 기존 필드...
    backendFieldName: string; // 백엔드 필드명 그대로
  }
  
  // Request DTO (Create/Update)
  export interface CreateXxxDto {
    // 기존 필드...
    backendFieldName: string;
  }
  ```

### Adapter 매핑 추가

- [ ] **Response 변환 (DTO → Model)**
  
  파일: `api/_backend/**/{domain}/types/{domain}.adapter.ts`
  
  ```typescript
  export class XxxAdapter {
    static fromXxxResponse(dto: XxxResponseDto): XxxModel {
      return {
        // 기존 필드...
        
        // 🔹 필드명이 같은 경우
        newField: dto.newField,
        
        // 🔹 필드명이 다른 경우 (매핑)
        name: dto.fileName,      // fileName → name
        url: dto.fileUrl,        // fileUrl → url
        size: dto.fileSize,      // fileSize → size
        isPublic: dto.isActive,  // isActive → isPublic
        authorId: dto.createdBy, // createdBy → authorId
        
        // 🔹 null → undefined 변환
        description: dto.description ?? undefined,
        
        // 🔹 기본값 제공 (백엔드 미제공)
        authorName: "",          // 백엔드 미제공
        publishedAt: undefined,  // 프론트 전용 필드
      };
    }
  }
  ```

- [ ] **Request 변환 (Model → DTO)**
  
  ```typescript
  static toCreateXxxRequest(model: CreateXxxModel): CreateXxxDto {
    return {
      // 기존 필드...
      
      // 🔹 필드명 역매핑
      fileName: model.name,    // name → fileName
      fileUrl: model.url,      // url → fileUrl
      fileSize: model.size,    // size → fileSize
      isActive: model.isPublic, // isPublic → isActive
      
      // 🔹 undefined → null 변환 (백엔드가 null 기대 시)
      description: model.description ?? null,
    };
  }
  ```

- [ ] **필드명 매핑 규칙 문서화**
  
  파일 상단에 주석으로 매핑 규칙 명시:
  
  ```typescript
  /**
   * 필드명 매핑 규칙:
   *   - 첨부파일: fileName ↔ name, fileUrl ↔ url, fileSize ↔ size
   *   - 상태: isActive ↔ isPublic
   *   - 작성자: createdBy ↔ authorId
   *   - 페이지네이션: limit ↔ size
   */
  ```

- [ ] **Optional/null 처리 확인**
  
  ```typescript
  // Optional 필드 변환
  static fromXxxResponse(dto: XxxResponseDto): XxxModel {
    return {
      // null → undefined 변환
      description: dto.description ?? undefined,
      
      // 기본값 제공
      viewCount: dto.viewCount ?? 0,
    };
  }
  ```

### 변경 시나리오

**시나리오 A: 백엔드에서 필드 제공**
→ DTO 업데이트 → Adapter 매핑 추가 → Model에 추가

**시나리오 B: 백엔드에서 제공하지 않음**
→ Adapter에서 기본값 제공 → Model에 Optional로 추가

**시나리오 C: 백엔드 필드명이 다름**
→ DTO는 백엔드명 사용 → Adapter에서 프론트엔드명으로 매핑

## 1. Model 계층

### 파일: `_types/{domain}.model.ts`

- [ ] **메인 Model interface에 필드 정의**
  ```typescript
  export interface XxxModel {
    // 기존 필드...
    newField: string; // 또는 newField?: string
  }
  ```

- [ ] **CreateModel에 필드 추가** (필요시)
  ```typescript
  export interface CreateXxxModel {
    // 기존 필드...
    newField: string;
  }
  ```

- [ ] **UpdateModel에 필드 추가** (필요시)
  ```typescript
  export interface UpdateXxxModel {
    // 기존 필드...
    newField?: string; // Update는 보통 optional
  }
  ```

- [ ] **필수/선택 여부 명확히 지정**
  - Required: `field: Type`
  - Optional: `field?: Type`
  - 기본값이 있으면 Required, 없으면 Optional

- [ ] **JSDoc 주석 작성**
  ```typescript
  /** 새 필드 설명 */
  newField: string;
  ```

- [ ] **관계 필드인 경우 하위 Model도 정의** (필요시)
  ```typescript
  export interface XxxSubModel {
    // 하위 엔티티 필드...
  }
  ```

## 2. Presenter 계층

### 파일: `_types/{domain}.presenter.ts`

- [ ] **Presenter 클래스에 readonly 필드 추가**
  ```typescript
  export class XxxPresenter implements XxxModel {
    readonly newField: string; // Model과 동일한 타입
    // ...
  }
  ```

- [ ] **private constructor 파라미터에 필드 추가**
  ```typescript
  private constructor(data: {
    // 기존 필드...
    newField: string;
  }) {
    // ...
    this.newField = data.newField; // 할당
  }
  ```

- [ ] **create() 메서드에 필드 추가**
  ```typescript
  static create(data: {
    // 기존 필드...
    newField: string;
  }): XxxPresenter {
    return new XxxPresenter({
      // 기존 필드...
      newField: data.newField,
    });
  }
  ```

- [ ] **copyWith() 메서드에 필드 업데이트 로직 추가**
  ```typescript
  copyWith(updates: Partial<XxxPresenter>): XxxPresenter {
    return XxxPresenter.create({
      // 기존 필드...
      newField: updates.newField ?? this.newField, // Nullish coalescing
    });
  }
  ```

- [ ] **createEmpty()에 기본값 추가** (Required 필드의 경우)
  ```typescript
  static createEmpty(): XxxPresenter {
    return XxxPresenter.create({
      // 기존 필드...
      newField: "", // 또는 적절한 기본값
    });
  }
  ```

- [ ] **헬퍼 메서드 추가** (필요시)
  ```typescript
  // Static 헬퍼
  static displayNewField(value?: string): string {
    return value ?? "-";
  }
  
  // Instance 헬퍼
  displayNewField(): string {
    return XxxPresenter.displayNewField(this.newField);
  }
  ```

- [ ] **관계 필드인 경우 하위 Presenter도 추가** (필요시)

## 3. Mapper 계층

### 파일: `_services/{domain}.mapper.ts`

- [ ] **fromModel()에 변환 로직 추가**
  ```typescript
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      // 기존 필드...
      newField: model.newField,
    });
  }
  ```

- [ ] **toModel()에 역변환 로직 추가**
  ```typescript
  static toModel(presenter: XxxPresenter): XxxModel {
    return {
      // 기존 필드...
      newField: presenter.newField,
    };
  }
  ```

- [ ] **fromModelArray() 지원 확인**
  - 배열 변환이 자동으로 동작하는지 확인
  - fromModel()이 올바르게 구현되면 자동 지원됨

- [ ] **toCreateModel()에 필드 추가** (필요시)
  ```typescript
  static toCreateModel(presenter: XxxPresenter): CreateXxxModel {
    return {
      // 기존 필드...
      newField: presenter.newField,
    };
  }
  ```

- [ ] **toUpdateModel()에 필드 추가** (필요시)
  ```typescript
  static toUpdateModel(presenter: XxxPresenter): UpdateXxxModel {
    return {
      // 기존 필드...
      newField: presenter.newField,
    };
  }
  ```

- [ ] **Optional 필드 처리 확인**
  ```typescript
  // ✅ 올바른 Optional 처리
  category: model.category 
    ? this.fromCategoryModel(model.category) 
    : undefined,
  
  // ❌ 잘못된 처리 (undefined 에러 가능)
  category: this.fromCategoryModel(model.category),
  ```

- [ ] **관계 필드 변환 메서드 추가** (필요시)
  ```typescript
  static fromSubModel(model: XxxSubModel): XxxSubPresenter {
    // 하위 엔티티 변환 로직
  }
  ```

## 4. Service 계층

### 파일: `_services/{domain}.service.ts`

- [ ] **Service interface에 메서드 시그니처 업데이트** (필요시)
  ```typescript
  export interface XxxService {
    Xxx를_조회한다(id: string): Promise<ApiResponse<XxxModel>>;
    // 시그니처가 변경되면 업데이트
  }
  ```

- [ ] **Service 구현에 필드 처리 로직 추가** (필요시)
  - 대부분의 경우 자동으로 처리됨
  - 특별한 비즈니스 로직이 필요한 경우에만 수정

- [ ] **Mock Service에도 동일하게 적용**
  ```typescript
  // Mock 데이터에 새 필드 추가
  private static mockData: XxxModel[] = [
    {
      // 기존 필드...
      newField: "mock value", // 추가
    },
  ];
  ```

- [ ] **Create/Update 메서드 확인**
  - Model 타입을 사용하므로 자동으로 반영됨
  - 특별한 변환 로직이 필요한지 확인

## 5. Hooks 계층

### 파일: `_hooks/**/*.ts`

- [ ] **Hooks에서 새 필드를 사용하는지 확인**
  - 대부분의 경우 자동으로 처리됨
  - Presenter 타입을 사용하므로 타입 안정성 보장

- [ ] **반환 타입이 업데이트된 Presenter를 사용하는지 확인**
  ```typescript
  export function useReadXxx() {
    // 반환 타입이 XxxPresenter를 사용하므로 자동 반영
    return {
      xxx: data, // XxxPresenter
      // ...
    };
  }
  ```

- [ ] **특정 필드만 사용하는 훅이 있는지 확인** (드물음)
  ```typescript
  // 특정 필드를 직접 사용하는 경우 업데이트 필요
  const { newField } = presenter;
  ```

## 6. UI 계층

### 파일: `_ui/**/*.tsx`

- [ ] **UI 컴포넌트에서 새 필드 렌더링 추가** (필요시)
  ```typescript
  // List 컴포넌트
  <div>{item.newField}</div>
  
  // 또는 헬퍼 메서드 사용
  <div>{item.displayNewField()}</div>
  ```

- [ ] **폼 컴포넌트에 입력 필드 추가** (필요시)
  ```typescript
  <Input
    value={formData.newField}
    onChange={(e) => updateFormData({ newField: e.target.value })}
  />
  ```

- [ ] **Optional 필드의 경우 타입 가드 추가** (필요시)
  ```typescript
  {item.newField && <div>{item.newField}</div>}
  
  // 또는
  {item.newField ?? "-"}
  ```

- [ ] **테이블 컬럼 추가** (필요시)
  ```typescript
  const columns = [
    // 기존 컬럼...
    {
      header: "새 필드",
      cell: (row) => row.newField,
    },
  ];
  ```

- [ ] **상세 패널에 필드 표시** (필요시)
  ```typescript
  <DetailRow label="새 필드" value={item.newField} />
  ```

## 7. 검증

### 타입 검증

- [ ] **TypeScript 컴파일 에러 없음**
  ```bash
  npm run type-check
  # 또는
  tsc --noEmit
  ```

- [ ] **Linter 에러 없음**
  ```bash
  npm run lint
  ```

### 런타임 테스트

- [ ] **목록 조회 테스트**
  - 새 필드가 올바르게 표시되는지 확인
  - Optional 필드는 undefined 처리 확인

- [ ] **상세 조회 테스트**
  - 새 필드가 올바르게 표시되는지 확인

- [ ] **생성 테스트** (필요시)
  - 새 필드를 입력하여 생성
  - 생성된 데이터에 필드가 포함되는지 확인

- [ ] **수정 테스트** (필요시)
  - 새 필드를 수정
  - 수정된 데이터가 올바르게 저장되는지 확인

### 기존 기능 영향 확인

- [ ] **기존 목록 조회 동작 확인**
  - 새 필드 추가로 인한 기존 기능 영향 없음

- [ ] **기존 생성/수정 동작 확인**
  - 기존 필드들이 여전히 올바르게 동작

- [ ] **기존 테스트 통과 확인**
  - 단위 테스트 실행
  - 통합 테스트 실행

## 8. 문서화

- [ ] **Model 필드에 JSDoc 주석 추가**
  ```typescript
  /**
   * 새 필드 설명
   * @remarks 추가 정보나 사용 예시
   */
  newField: string;
  ```

- [ ] **변경 사유를 커밋 메시지에 명시**
  ```
  feat(brochure): publishedAt 필드 추가
  
  - Model, Presenter, Mapper에 publishedAt 필드 추가
  - UI에서 발행일 표시 기능 추가
  ```

- [ ] **Breaking change인 경우 CHANGELOG 기록** (Required 필드 추가 시)

## 9. Optional vs Required 처리

### Optional 필드 (field?: Type)

- [ ] **Presenter.createEmpty()에서 생략 가능**
- [ ] **UI에서 타입 가드 사용**
  ```typescript
  {item.newField && <div>{item.newField}</div>}
  ```
- [ ] **Mapper에서 undefined 체크**
  ```typescript
  newField: model.newField ?? undefined
  ```

### Required 필드 (field: Type)

- [ ] **Presenter.createEmpty()에서 기본값 제공 필수**
  ```typescript
  static createEmpty(): XxxPresenter {
    return XxxPresenter.create({
      // ...
      newField: "", // 기본값 필수
    });
  }
  ```
- [ ] **UI에서 타입 가드 불필요**
- [ ] **생성 폼에서 필수 입력 표시**

## 10. 중첩 객체 (Relation) 처리

관계 필드 (category, translations 등)를 추가하는 경우:

- [ ] **하위 Model 정의**
  ```typescript
  export interface XxxSubModel {
    // 하위 필드...
  }
  ```

- [ ] **하위 Presenter 정의**
  ```typescript
  export class XxxSubPresenter implements XxxSubModel {
    // 하위 Presenter 구현
  }
  ```

- [ ] **Mapper에 하위 변환 메서드 추가**
  ```typescript
  static fromSubModel(model: XxxSubModel): XxxSubPresenter {
    return XxxSubPresenter.create({ /* ... */ });
  }
  
  static toSubModel(presenter: XxxSubPresenter): XxxSubModel {
    return { /* ... */ };
  }
  ```

- [ ] **메인 Mapper에서 하위 Mapper 호출**
  ```typescript
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      // ...
      subEntity: model.subEntity 
        ? this.fromSubModel(model.subEntity)
        : undefined,
    });
  }
  ```

- [ ] **Service에서 관계 데이터 fetch 로직 확인**

## 완료 확인

모든 항목을 체크한 후:

- [ ] **타입 에러 0개**
- [ ] **린트 경고 0개**
- [ ] **테스트 통과**
- [ ] **커밋 생성**
- [ ] **PR 생성 및 리뷰 요청**

---

## 참고

- **템플릿**: `assets/templates/presenter-update.template.ts`
- **상세 가이드**: `references/change-propagation-guide.md`
- **문제 해결**: `references/troubleshooting.md`
