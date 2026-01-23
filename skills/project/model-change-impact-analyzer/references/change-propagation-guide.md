# 변경 전파 상세 가이드

Model 변경이 각 계층으로 전파되는 과정을 시나리오별로 상세히 설명합니다.

## Table of Contents

- [시나리오 1: 필드 추가](#시나리오-1-필드-추가)
- [시나리오 2: 필드 삭제](#시나리오-2-필드-삭제)
- [시나리오 3: 타입 변경](#시나리오-3-타입-변경)
- [시나리오 4: Optional ↔ Required 변경](#시나리오-4-optional--required-변경)
- [시나리오 5: 관계 필드 추가](#시나리오-5-관계-필드-추가)
- [시나리오 6: 배열 필드 추가](#시나리오-6-배열-필드-추가)
- [시나리오 7: 필드 이름 변경](#시나리오-7-필드-이름-변경)

---

## 시나리오 1: 필드 추가

Optional 또는 Required 필드를 Model에 추가하는 시나리오입니다.

### 예시: Brochure에 publishedAt 필드 추가

**목표**: 발행일 필드를 추가하여 UI에 표시

**변경 순서**: Model → Presenter → Mapper → Service → Hooks → UI (Bottom-up)

#### 1단계: Model 업데이트

파일: `portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model.ts`

```typescript
export interface BrochureModel {
  id: string;
  code: Extract<DocumentCode, "brochure">;
  // ... 기존 필드들
  
  /** 발행 일시 (ISO 8601) */
  publishedAt?: string; // ✅ 추가
}
```

**Create/Update Model도 업데이트:**

```typescript
export interface CreateBrochureModel {
  // ... 기존 필드들
  publishedAt?: string; // ✅ 추가
}

export interface UpdateBrochureModel {
  // ... 기존 필드들
  publishedAt?: string; // ✅ 추가
}
```

#### 2단계: Presenter 업데이트

파일: `brochure.presenter.ts`

```typescript
export class BrochurePresenter implements BrochureModel {
  // 1. readonly 필드 추가
  readonly publishedAt?: string; // ✅ 추가
  
  // 2. constructor 파라미터 추가
  private constructor(data: {
    // ... 기존 파라미터
    publishedAt?: string; // ✅ 추가
  }) {
    // ... 기존 할당
    this.publishedAt = data.publishedAt; // ✅ 추가
  }
  
  // 3. create() 메서드 업데이트
  static create(data: {
    // ... 기존 파라미터
    publishedAt?: string; // ✅ 추가
  }): BrochurePresenter {
    return new BrochurePresenter({
      // ... 기존 전달
      publishedAt: data.publishedAt, // ✅ 추가
    });
  }
  
  // 4. copyWith() 업데이트
  copyWith(updates: Partial<BrochurePresenter>): BrochurePresenter {
    return BrochurePresenter.create({
      // ... 기존 필드
      publishedAt: updates.publishedAt ?? this.publishedAt, // ✅ 추가
    });
  }
  
  // 5. 헬퍼 메서드 추가 (선택)
  static displayPublishedAt(date?: string): string {
    return date ? formatDate(date) : "미발행";
  }
  
  displayPublishedAt(): string {
    return BrochurePresenter.displayPublishedAt(this.publishedAt);
  }
}
```

#### 3단계: Mapper 업데이트

파일: `brochure.mapper.ts`

```typescript
export class BrochureMapper {
  // fromModel() 업데이트
  static fromModel(model: BrochureModel): BrochurePresenter {
    return BrochurePresenter.create({
      // ... 기존 필드
      publishedAt: model.publishedAt, // ✅ 추가
    });
  }
  
  // toModel() 업데이트
  static toModel(presenter: BrochurePresenter): BrochureModel {
    return {
      // ... 기존 필드
      publishedAt: presenter.publishedAt, // ✅ 추가
    };
  }
  
  // toCreateModel() 업데이트
  static toCreateModel(presenter: BrochurePresenter): CreateBrochureModel {
    return {
      // ... 기존 필드
      publishedAt: presenter.publishedAt, // ✅ 추가
    };
  }
  
  // toUpdateModel() 업데이트
  static toUpdateModel(presenter: BrochurePresenter): UpdateBrochureModel {
    return {
      // ... 기존 필드
      publishedAt: presenter.publishedAt, // ✅ 추가
    };
  }
}
```

#### 4단계: Service 업데이트 (필요시)

파일: `brochure.service.ts`

대부분의 경우 Service는 Model 타입을 사용하므로 자동으로 반영됩니다.
특별한 비즈니스 로직이 필요한 경우에만 수정합니다.

```typescript
// Mock Service의 경우 Mock 데이터에 추가
private static mockBrochures: BrochureModel[] = [
  {
    id: "doc-1",
    // ... 기존 필드
    publishedAt: nowISOString(), // ✅ 추가
  },
];
```

#### 5단계: Hooks 업데이트 (필요시)

파일: `_hooks/_action/useReadBrochures.ts`

Hooks는 Presenter 타입을 사용하므로 대부분 자동으로 반영됩니다.
특정 필드만 사용하는 경우 확인이 필요합니다.

```typescript
// 일반적으로 수정 불필요
export function useReadBrochures() {
  // ... brochure.publishedAt 자동 사용 가능
}
```

#### 6단계: UI 업데이트 (필요시)

파일: `_ui/BrochureList.section.tsx`

```typescript
// 목록에 발행일 표시
<TableCell>{brochure.displayPublishedAt()}</TableCell>

// 또는 직접 사용
<TableCell>
  {brochure.publishedAt ? formatDate(brochure.publishedAt) : "미발행"}
</TableCell>
```

파일: `_ui/BrochureForm.section.tsx`

```typescript
// 폼에 발행일 입력 필드 추가
<DatePicker
  label="발행일"
  value={formData.publishedAt}
  onChange={(date) => updateFormData({ publishedAt: date })}
/>
```

#### 검증

```bash
# 1. 타입 검증
node scripts/validate-type-consistency.ts brochure

# 2. TypeScript 컴파일
npm run type-check

# 3. 런타임 테스트
# - 목록 조회 시 publishedAt 표시 확인
# - 생성/수정 시 publishedAt 저장 확인
```

---

## 시나리오 2: 필드 삭제

더 이상 사용하지 않는 필드를 Model에서 제거하는 시나리오입니다.

### 예시: IR에서 deprecated_field 삭제

**목표**: 더 이상 사용하지 않는 필드 제거

**변경 순서**: UI → Hooks → Service → Mapper → Presenter → Model (Top-down)

#### 1단계: UI에서 제거

파일: `_ui/IrList.section.tsx`

```typescript
// ❌ 제거
// <TableCell>{ir.deprecated_field}</TableCell>
```

#### 2단계: Hooks에서 제거

파일: `_hooks/_action/useReadIrs.ts`

```typescript
// 특정 필드만 사용하는 경우 제거
// const { deprecated_field } = ir; // ❌ 제거
```

#### 3단계: Service에서 제거

파일: `ir.service.ts`

```typescript
// Mock 데이터에서 제거
private static mockIrs: IrModel[] = [
  {
    id: "ir-1",
    // deprecated_field: "...", // ❌ 제거
  },
];
```

#### 4단계: Mapper에서 제거

파일: `ir.mapper.ts`

```typescript
static fromModel(model: IrModel): IrPresenter {
  return IrPresenter.create({
    // ... 기존 필드
    // deprecated_field: model.deprecated_field, // ❌ 제거
  });
}

static toModel(presenter: IrPresenter): IrModel {
  return {
    // ... 기존 필드
    // deprecated_field: presenter.deprecated_field, // ❌ 제거
  };
}
```

#### 5단계: Presenter에서 제거

파일: `ir.presenter.ts`

```typescript
export class IrPresenter implements IrModel {
  // readonly deprecated_field: string; // ❌ 제거
  
  private constructor(data: {
    // deprecated_field: string; // ❌ 제거
  }) {
    // this.deprecated_field = data.deprecated_field; // ❌ 제거
  }
  
  static create(data: {
    // deprecated_field: string; // ❌ 제거
  }): IrPresenter {
    // deprecated_field: data.deprecated_field, // ❌ 제거
  }
  
  copyWith(updates: Partial<IrPresenter>): IrPresenter {
    // deprecated_field: updates.deprecated_field ?? this.deprecated_field, // ❌ 제거
  }
}
```

#### 6단계: Model에서 제거

파일: `ir.model.ts`

```typescript
export interface IrModel {
  // ... 기존 필드
  // deprecated_field: string; // ❌ 제거
}
```

#### 검증

```bash
# 1. 프로젝트 전체에서 필드명 검색
grep -r "deprecated_field" portal/src/

# 2. 결과가 없어야 함 (완전 제거됨)

# 3. TypeScript 컴파일
npm run type-check

# 4. Lint 확인
npm run lint
```

---

## 시나리오 3: 타입 변경

필드의 타입을 변경하는 시나리오입니다.

### 예시: isPublic의 타입을 boolean → boolean | undefined로 변경

**변경 순서**: Model → Presenter → Mapper → Service → UI

#### 1단계: Model 타입 변경

```typescript
export interface BrochureModel {
  // isPublic: boolean; // ❌ 기존
  isPublic?: boolean; // ✅ 변경 (Optional)
}
```

#### 2단계: Presenter 타입 변경

```typescript
export class BrochurePresenter implements BrochureModel {
  // readonly isPublic: boolean; // ❌ 기존
  readonly isPublic?: boolean; // ✅ 변경
  
  // createEmpty()도 업데이트
  static createEmpty(): BrochurePresenter {
    return BrochurePresenter.create({
      // isPublic: false, // ❌ 기존
      isPublic: undefined, // ✅ 변경 (또는 생략)
    });
  }
}
```

#### 3단계: Mapper 확인

타입 변경이므로 Mapper는 대부분 수정 불필요:

```typescript
static fromModel(model: BrochureModel): BrochurePresenter {
  return BrochurePresenter.create({
    isPublic: model.isPublic, // 자동으로 타입 추론
  });
}
```

#### 4단계: Service 확인

Service 로직에서 타입 호환성 확인:

```typescript
// 기존에 boolean으로 가정하던 코드가 있다면 타입 가드 추가
if (brochure.isPublic === true) {
  // ...
}
```

#### 5단계: UI 업데이트

타입 가드 추가:

```typescript
// ❌ 기존
{brochure.isPublic ? "공개" : "비공개"}

// ✅ 변경
{brochure.isPublic === true ? "공개" : 
 brochure.isPublic === false ? "비공개" : 
 "미설정"}

// 또는
{brochure.isPublic ?? false ? "공개" : "비공개"}
```

---

## 시나리오 4: Optional ↔ Required 변경

필드의 필수/선택 여부를 변경하는 시나리오입니다.

### 예시 A: Optional → Required (viewCount?: number → viewCount: number)

#### 1단계: Model 변경

```typescript
export interface BrochureModel {
  // viewCount?: number; // ❌ 기존
  viewCount: number; // ✅ 변경 (Required)
}
```

#### 2단계: Presenter 변경

```typescript
export class BrochurePresenter implements BrochureModel {
  // readonly viewCount?: number; // ❌ 기존
  readonly viewCount: number; // ✅ 변경
  
  // createEmpty()에 기본값 필수
  static createEmpty(): BrochurePresenter {
    return BrochurePresenter.create({
      // ... 기존 필드
      viewCount: 0, // ✅ 기본값 제공 필수
    });
  }
}
```

#### 3단계: UI 업데이트

타입 가드 제거 가능:

```typescript
// ❌ 기존 (Optional이었을 때)
{brochure.viewCount ?? 0}

// ✅ 변경 (Required이므로 타입 가드 불필요)
{brochure.viewCount}
```

### 예시 B: Required → Optional (title: string → title?: string)

**주의**: Required → Optional 변경은 Breaking Change가 아니므로 안전합니다.

#### 1단계: Model 변경

```typescript
export interface BrochureModel {
  // title: string; // ❌ 기존
  title?: string; // ✅ 변경
}
```

#### 2단계: Presenter 변경

```typescript
export class BrochurePresenter implements BrochureModel {
  // readonly title: string; // ❌ 기존
  readonly title?: string; // ✅ 변경
  
  // createEmpty()에서 생략 가능
  static createEmpty(): BrochurePresenter {
    return BrochurePresenter.create({
      // title: "", // ❌ 제거 가능
    });
  }
}
```

#### 3단계: UI 업데이트

타입 가드 추가:

```typescript
// ❌ 기존 (Required였을 때)
<h1>{brochure.title}</h1>

// ✅ 변경 (Optional이므로 타입 가드 추가)
<h1>{brochure.title ?? "제목 없음"}</h1>
```

---

## 시나리오 5: 관계 필드 추가

중첩 객체(category, author 등)를 추가하는 시나리오입니다.

### 예시: Brochure에 category 필드 추가

#### 1단계: 하위 Model 정의

파일: `brochure.model.ts`

```typescript
// 하위 Model 먼저 정의
export interface BrochureCategoryModel {
  id: string;
  code: Extract<DocumentCode, "brochure">;
  name: string;
  description?: string;
  order?: number;
}

// 메인 Model에 추가
export interface BrochureModel {
  // ... 기존 필드
  category?: BrochureCategoryModel; // ✅ 추가
}
```

#### 2단계: 하위 Presenter 정의

파일: `brochure-category.presenter.ts` (새 파일)

```typescript
export class BrochureCategoryPresenter implements BrochureCategoryModel {
  readonly id: string;
  readonly code: Extract<DocumentCode, "brochure">;
  readonly name: string;
  readonly description?: string;
  readonly order?: number;
  
  private constructor(data: {...}) {
    // ... 초기화
  }
  
  static create(data: {...}): BrochureCategoryPresenter {
    return new BrochureCategoryPresenter(data);
  }
  
  copyWith(updates: Partial<BrochureCategoryPresenter>): BrochureCategoryPresenter {
    return BrochureCategoryPresenter.create({...});
  }
}
```

#### 3단계: 메인 Presenter에 추가

파일: `brochure.presenter.ts`

```typescript
import { BrochureCategoryPresenter } from "./brochure-category.presenter";

export class BrochurePresenter implements BrochureModel {
  // ... 기존 필드
  readonly category?: BrochureCategoryPresenter; // ✅ 추가
  
  private constructor(data: {
    // ... 기존 필드
    category?: BrochureCategoryPresenter; // ✅ 추가
  }) {
    // ... 기존 할당
    this.category = data.category; // ✅ 추가
  }
  
  static create(data: {
    // ... 기존 필드
    category?: BrochureCategoryPresenter; // ✅ 추가
  }): BrochurePresenter {
    return new BrochurePresenter({
      // ... 기존 전달
      category: data.category, // ✅ 추가
    });
  }
  
  copyWith(updates: Partial<BrochurePresenter>): BrochurePresenter {
    return BrochurePresenter.create({
      // ... 기존 필드
      category: updates.category ?? this.category, // ✅ 추가
    });
  }
  
  // 헬퍼 메서드 추가
  getCategoryName(): string {
    return this.category?.name ?? "미분류";
  }
  
  hasCategoryId(categoryId: string): boolean {
    return this.category?.id === categoryId;
  }
}
```

#### 4단계: Mapper에 하위 변환 메서드 추가

파일: `brochure.mapper.ts`

```typescript
export class BrochureMapper {
  // 메인 변환 메서드 업데이트
  static fromModel(model: BrochureModel): BrochurePresenter {
    return BrochurePresenter.create({
      // ... 기존 필드
      category: model.category 
        ? this.fromCategoryModel(model.category) // 하위 Mapper 호출
        : undefined,
    });
  }
  
  static toModel(presenter: BrochurePresenter): BrochureModel {
    return {
      // ... 기존 필드
      category: presenter.category
        ? this.toCategoryModel(presenter.category)
        : undefined,
    };
  }
  
  // 하위 변환 메서드 추가
  static fromCategoryModel(
    model: BrochureCategoryModel
  ): BrochureCategoryPresenter {
    return BrochureCategoryPresenter.create({
      id: model.id,
      code: model.code,
      name: model.name,
      description: model.description,
      order: model.order,
    });
  }
  
  static toCategoryModel(
    presenter: BrochureCategoryPresenter
  ): BrochureCategoryModel {
    return {
      id: presenter.id,
      code: presenter.code,
      name: presenter.name,
      description: presenter.description,
      order: presenter.order,
    };
  }
}
```

#### 5단계: UI 업데이트

```typescript
// 카테고리 표시
<div>
  <span>카테고리: {brochure.getCategoryName()}</span>
</div>

// 또는 직접 접근
<div>
  {brochure.category && (
    <Badge>{brochure.category.name}</Badge>
  )}
</div>
```

---

## 시나리오 6: 배열 필드 추가

배열 필드(translations, attachments 등)를 추가하는 시나리오입니다.

### 예시: Brochure에 attachments 필드 추가

#### 1단계: 하위 Model 정의

```typescript
export interface BrochureAttachmentModel {
  id: string;
  documentId: string;
  name: string;
  url: string;
  size: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface BrochureModel {
  // ... 기존 필드
  attachments?: BrochureAttachmentModel[]; // ✅ 추가
}
```

#### 2단계: 하위 Presenter 정의

```typescript
export class BrochureAttachmentPresenter implements BrochureAttachmentModel {
  // ... 필드 및 메서드 정의
}
```

#### 3단계: 메인 Presenter 업데이트

```typescript
export class BrochurePresenter implements BrochureModel {
  readonly attachments?: BrochureAttachmentPresenter[]; // ✅ 추가
  
  // 배열 관련 헬퍼 메서드
  getAttachmentCount(): number {
    return this.attachments?.length ?? 0;
  }
  
  hasAttachments(): boolean {
    return (this.attachments?.length ?? 0) > 0;
  }
  
  getAttachmentById(id: string): BrochureAttachmentPresenter | undefined {
    return this.attachments?.find((a) => a.id === id);
  }
}
```

#### 4단계: Mapper에 배열 변환 추가

```typescript
export class BrochureMapper {
  static fromModel(model: BrochureModel): BrochurePresenter {
    return BrochurePresenter.create({
      // ... 기존 필드
      attachments: model.attachments
        ? model.attachments.map((a) => this.fromAttachmentModel(a))
        : undefined,
      
      // 또는 헬퍼 메서드 사용
      // attachments: model.attachments
      //   ? this.fromAttachmentModelArray(model.attachments)
      //   : undefined,
    });
  }
  
  // 하위 변환 메서드
  static fromAttachmentModel(
    model: BrochureAttachmentModel
  ): BrochureAttachmentPresenter {
    return BrochureAttachmentPresenter.create({...});
  }
  
  // 배열 변환 헬퍼
  static fromAttachmentModelArray(
    models: BrochureAttachmentModel[]
  ): BrochureAttachmentPresenter[] {
    return models.map((model) => this.fromAttachmentModel(model));
  }
}
```

#### 5단계: UI 업데이트

```typescript
// 첨부파일 목록 표시
{brochure.hasAttachments() && (
  <div>
    <h3>첨부파일 ({brochure.getAttachmentCount()})</h3>
    <ul>
      {brochure.attachments?.map((attachment) => (
        <li key={attachment.id}>
          <a href={attachment.url}>{attachment.name}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

---

## 시나리오 7: 필드 이름 변경

필드의 이름을 변경하는 시나리오입니다.

### 예시: documentCode → code로 변경

**주의**: 필드 이름 변경은 Breaking Change이므로 신중해야 합니다.

#### 전략 A: 직접 변경 (권장하지 않음)

모든 계층에서 한 번에 변경합니다. 커밋이 크고 롤백이 어렵습니다.

#### 전략 B: 점진적 변경 (권장)

1. 새 필드 추가 (code)
2. 기존 필드 유지 (documentCode)
3. 점진적으로 사용처를 code로 변경
4. documentCode 제거

#### 단계별 가이드 (전략 B)

**1단계: 새 필드 추가**

```typescript
export interface BrochureModel {
  code: Extract<DocumentCode, "brochure">; // ✅ 새 필드
  documentCode: Extract<DocumentCode, "brochure">; // 기존 필드 (deprecated)
}
```

**2단계: Presenter에서 호환성 유지**

```typescript
export class BrochurePresenter implements BrochureModel {
  readonly code: Extract<DocumentCode, "brochure">;
  
  // 기존 필드를 getter로 제공 (deprecated)
  get documentCode(): Extract<DocumentCode, "brochure"> {
    return this.code;
  }
}
```

**3단계: 점진적 마이그레이션**

각 사용처에서 documentCode → code로 변경:

```typescript
// ❌ 기존
if (brochure.documentCode === "brochure") { ... }

// ✅ 변경
if (brochure.code === "brochure") { ... }
```

**4단계: 모든 사용처 변경 후 기존 필드 제거**

```bash
# 사용처 확인
grep -r "documentCode" portal/src/

# 결과가 없으면 제거
```

```typescript
export interface BrochureModel {
  code: Extract<DocumentCode, "brochure">;
  // documentCode: Extract<DocumentCode, "brochure">; // ❌ 제거
}
```

---

## 시나리오 8: 백엔드 필드명 변경 (Adapter로 완충)

백엔드 API 스펙이 변경되어 필드명이 달라진 경우, Adapter에서만 수정하여 나머지 계층의 변경을 최소화합니다.

### 예시: 백엔드가 fileName → attachmentName으로 변경

**목표**: 백엔드 스펙 변경의 영향을 Adapter에서 차단

**변경 순서**: DTO → Adapter만 수정 (나머지 계층 영향 없음)

#### 1단계: 백엔드 스펙 확인

백엔드 API 문서 또는 실제 응답 확인:

```json
// 기존 응답
{
  "fileName": "document.pdf",
  "fileUrl": "https://...",
  "fileSize": 1024
}

// 변경된 응답
{
  "attachmentName": "document.pdf",  // 필드명 변경
  "fileUrl": "https://...",
  "fileSize": 1024
}
```

#### 2단계: DTO 업데이트

파일: `api/_backend/**/{domain}/types/{domain}.dto.ts`

```typescript
export interface BrochureAttachmentDto {
  // fileName: string; // ❌ 백엔드에서 제거
  attachmentName: string; // ✅ 백엔드에서 변경
  fileUrl: string;
  fileSize: number;
}
```

#### 3단계: Adapter 매핑만 수정

파일: `api/_backend/**/{domain}/types/{domain}.adapter.ts`

```typescript
export class BrochureAdapter {
  /**
   * 필드명 매핑 규칙:
   *   - 첨부파일: attachmentName ↔ name (변경됨)
   *   - 첨부파일: fileUrl ↔ url
   *   - 첨부파일: fileSize ↔ size
   */
  private static _toAttachmentModel(
    dto: BrochureAttachmentDto,
    documentId: string,
  ): BrochureAttachmentModel {
    return {
      id: generateTempId("att"),
      documentId,
      // name: dto.fileName, // ❌ 기존
      name: dto.attachmentName, // ✅ 변경 - Adapter만 수정
      url: dto.fileUrl,
      size: dto.fileSize,
      uploadedAt: undefined,
    };
  }
}
```

#### 4단계: Model 확인

파일: `brochure.model.ts`

```typescript
// ✅ 변경 불필요! 이미 `name`을 사용 중
export interface BrochureAttachmentModel {
  id: string;
  documentId: string;
  name: string;      // 그대로 유지
  url: string;
  size: number;
  uploadedAt?: string;
}
```

#### 5단계: Presenter, Mapper, Service, Hooks, UI 확인

```typescript
// ✅ 모두 변경 불필요!

// Presenter
export class BrochureAttachmentPresenter {
  readonly name: string; // 그대로 유지
}

// Mapper
export class BrochureMapper {
  static fromAttachmentModel(model: BrochureAttachmentModel) {
    return BrochureAttachmentPresenter.create({
      name: model.name, // 그대로 유지
    });
  }
}

// UI
<div>{attachment.name}</div> // 그대로 유지
```

**모두 변경 불필요!** ✅

Adapter가 백엔드 변경을 흡수했기 때문에 나머지 계층은 영향 없습니다.

#### 검증

```bash
# 1. 타입 체크
npm run type-check

# 2. 런타임 테스트
# 백엔드 API 호출하여 데이터 정상 표시 확인
```

**결과**: 
- **수정된 파일**: 2개 (DTO, Adapter)
- **영향 없는 파일**: Model, Presenter, Mapper, Service, Hooks, UI (6개 계층!)

#### 장점

1. **변경 격리**: 백엔드 스펙 변경이 프론트엔드 전체로 전파되지 않음
2. **작업량 최소화**: Adapter 파일 1개만 수정
3. **안정성**: 프론트엔드 로직 변경 없이 백엔드 연동만 조정
4. **빠른 대응**: 백엔드 스펙 변경 시 즉시 대응 가능

### 추가 예시: 여러 필드명 동시 변경

**상황**: 백엔드가 첨부파일 관련 필드를 모두 변경

```typescript
// 기존 DTO
interface AttachmentDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

// 변경된 DTO
interface AttachmentDto {
  name: string;        // fileName → name
  url: string;         // fileUrl → url
  size: number;        // fileSize → size
}

// Adapter만 수정
export class Adapter {
  static toAttachmentModel(dto: AttachmentDto): AttachmentModel {
    return {
      // ❌ 기존
      // name: dto.fileName,
      // url: dto.fileUrl,
      // size: dto.fileSize,
      
      // ✅ 변경 (필드명이 일치하게 됨)
      name: dto.name,
      url: dto.url,
      size: dto.size,
    };
  }
}

// Model은 그대로!
interface AttachmentModel {
  name: string; // 그대로
  url: string;  // 그대로
  size: number; // 그대로
}
```

---

## 변경 시 주의사항

### 1. Breaking Changes 식별

다음 변경은 Breaking Change입니다:

- **Required 필드 추가**: 기존 데이터에 없으면 에러
- **필드 삭제**: 사용하는 곳에서 에러
- **필드 이름 변경**: 사용하는 곳에서 에러
- **Optional → Required**: 기존 undefined 값 처리 필요

### 2. 안전한 변경

다음 변경은 안전합니다:

- **Optional 필드 추가**: 기존 코드 영향 없음
- **Required → Optional**: 타입 가드만 추가하면 됨
- **타입 확장** (string → string | null): 호환 가능

### 3. 테스트 전략

각 단계마다 테스트:

```bash
# 1. 타입 검증
node scripts/validate-type-consistency.ts <domain>

# 2. 컴파일
npm run type-check

# 3. 린트
npm run lint

# 4. 유닛 테스트
npm run test

# 5. 런타임 테스트
# 실제 앱 실행하여 기능 확인
```

### 4. 커밋 전략

계층별로 커밋:

```
feat(brochure): add publishedAt field to Model
feat(brochure): add publishedAt field to Presenter
feat(brochure): add publishedAt field conversion to Mapper
feat(brochure): display publishedAt in UI
```

각 커밋이 컴파일 가능하도록 유지하면 롤백이 쉽습니다.

---

## 마치며

Model 변경은 프론트엔드 전체에 영향을 미칩니다. 이 가이드를 참고하여 체계적으로 변경을 전파하고, 각 단계마다 검증하여 안정적인 코드를 유지하세요.

**추가 참고자료**:
- `assets/checklists/` - 변경 유형별 체크리스트
- `assets/templates/` - Presenter/Mapper 업데이트 템플릿
- `references/troubleshooting.md` - 문제 해결 가이드
