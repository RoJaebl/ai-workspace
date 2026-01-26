# Presenter Pattern Guide

Presenter는 UI 계층에서 사용하는 불변 데이터 클래스입니다. Model 인터페이스를 구현하며, 팩토리 메서드, 불변성 패턴, UI 헬퍼 메서드를 제공합니다.

## Table of Contents

1. [File Structure](#file-structure)
2. [Class Structure](#class-structure)
3. [Response Presenters](#response-presenters)
4. [Request Presenters](#request-presenters)
5. [UI Helper Methods](#ui-helper-methods)
6. [Validation Patterns](#validation-patterns)

---

## File Structure

Presenter는 두 파일로 분리됩니다:

```
_types/
├── {domain}-request.presenter.ts   # 요청용 Presenter
└── {domain}-response.presenter.ts  # 응답용 Presenter
```

**Request Presenter:**
- 조회 파라미터 Presenter (`Read{Domain}PagePresenter`)
- FormData Presenter (`Create{Domain}FormDataPresenter`, `Update{Domain}FormDataPresenter`)

**Response Presenter:**
- 엔티티 Presenter (하위 → 상위 순서)
- 목록 Presenter (`{Domain}PagePresenter`, `{Domain}CategoriesPresenter`)

---

## Class Structure

### 필수 구성요소

모든 Presenter 클래스는 다음 요소를 포함해야 합니다:

```typescript
export class BrochurePresenter implements BrochureModel {
  // 1. readonly 필드
  readonly id: string;
  readonly createdAt: string;
  // ...

  // 2. private constructor
  private constructor(data: {...}) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    // ...
  }

  // 3. 팩토리 메서드
  static create(data: {...}): BrochurePresenter {
    return new BrochurePresenter(data);
  }

  // 4. 빈 인스턴스 생성
  static createEmpty(): BrochurePresenter {
    return BrochurePresenter.create({
      id: "",
      createdAt: nowISOString(),
      // ...
    });
  }

  // 5. 불변성 패턴
  copyWith(updates: Partial<BrochurePresenter>): BrochurePresenter {
    return BrochurePresenter.create({
      id: updates.id ?? this.id,
      createdAt: updates.createdAt ?? this.createdAt,
      // ...
    });
  }

  // 6. UI 헬퍼 메서드 (선택적)
  displayCreatedAt(): string {
    return formatDate(this.createdAt);
  }
}
```

### 1. readonly 필드

**모든 필드는 readonly로 선언:**
```typescript
export class BrochurePresenter implements BrochureModel {
  readonly id: string;
  readonly creatorId: string;
  readonly updatorId: string;
  readonly categoryId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
  readonly order?: number;
  readonly isPublic?: boolean;
  
  // 관계 필드
  readonly translations?: BrochureTranslationPresenter[];
  readonly attachments?: BrochureAttachmentPresenter[];
}
```

**이유:**
- 불변성 보장
- 예기치 않은 변경 방지
- `copyWith()` 메서드를 통한 안전한 업데이트

### 2. private constructor

**생성자는 항상 private:**
```typescript
private constructor(data: {
  id: string;
  createdAt: string;
  updatedAt: string;
  // ...
}) {
  this.id = data.id;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
  // ...
}
```

**이유:**
- 팩토리 메서드를 통한 생성 강제
- 생성 로직 중앙화
- 유효성 검증 가능

### 3. 팩토리 메서드 (create)

**static create() 메서드:**
```typescript
/**
 * 데이터로부터 Presenter 인스턴스 생성
 *
 * @description 주어진 데이터로 Presenter 인스턴스를 생성합니다.
 * @param data 브로슈어 데이터 (필수)
 * @returns BrochurePresenter 인스턴스
 */
static create(data: {
  id: string;
  creatorId: string;
  updatorId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  order?: number;
  isPublic?: boolean;
  translations?: BrochureTranslationPresenter[];
  attachments?: BrochureAttachmentPresenter[];
}): BrochurePresenter {
  return new BrochurePresenter({
    id: data.id,
    creatorId: data.creatorId,
    updatorId: data.updatorId,
    categoryId: data.categoryId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    order: data.order,
    isPublic: data.isPublic,
    translations: data.translations,
    attachments: data.attachments,
  });
}
```

### 4. 빈 인스턴스 생성 (createEmpty)

**static createEmpty() 메서드:**
```typescript
/**
 * 빈 브로슈어 Presenter 생성 (폼 초기화용)
 *
 * @returns 빈 BrochurePresenter 인스턴스
 */
static createEmpty(): BrochurePresenter {
  return BrochurePresenter.create({
    id: "",
    creatorId: "",
    updatorId: "",
    categoryId: "",
    createdAt: nowISOString(),
    updatedAt: nowISOString(),
    isPublic: false,
  });
}
```

**용도:**
- 폼 초기화
- 새 엔티티 생성 준비
- 테스트용 더미 데이터

**주의사항:**
- `nowISOString()` 사용 (Date API 금지)
- 기본값은 비즈니스 요구사항에 맞게 설정

### 5. 불변성 패턴 (copyWith)

**copyWith() 메서드:**
```typescript
/**
 * 불변성을 유지하면서 일부 속성만 변경한 새 인스턴스 생성
 *
 * @param updates 변경할 속성들 (필수)
 * @returns BrochurePresenter 인스턴스
 */
copyWith(updates: Partial<BrochurePresenter>): BrochurePresenter {
  return BrochurePresenter.create({
    // Model 명세 필드
    id: updates.id ?? this.id,
    creatorId: updates.creatorId ?? this.creatorId,
    updatorId: updates.updatorId ?? this.updatorId,
    categoryId: updates.categoryId ?? this.categoryId,
    createdAt: updates.createdAt ?? this.createdAt,
    updatedAt: updates.updatedAt ?? this.updatedAt,
    publishedAt: updates.publishedAt ?? this.publishedAt,
    order: updates.order ?? this.order,
    isPublic: updates.isPublic ?? this.isPublic,
    // 관계 필드
    translations: (updates.translations ?? this.translations) as
      | BrochureTranslationPresenter[]
      | undefined,
    attachments: (updates.attachments ?? this.attachments) as
      | BrochureAttachmentPresenter[]
      | undefined,
  });
}
```

**선택적 필드 처리:**
```typescript
// ✅ 올바른 방식 - "in" 연산자 사용
copyWith(updates: Partial<BrochurePresenter>): BrochurePresenter {
  return BrochurePresenter.create({
    categoryId: "categoryId" in updates ? updates.categoryId : this.categoryId,
    isPublic: "isPublic" in updates ? updates.isPublic : this.isPublic,
    // ...
  });
}

// ❌ 잘못된 방식 - null/undefined 구분 불가
copyWith(updates: Partial<BrochurePresenter>): BrochurePresenter {
  return BrochurePresenter.create({
    categoryId: updates.categoryId ?? this.categoryId,
    // undefined를 의도적으로 설정하려 해도 기존 값이 사용됨
  });
}
```

---

## Response Presenters

응답 Presenter는 백엔드에서 받은 데이터를 UI에서 사용하기 위한 형태로 변환합니다.

### 파일 구조

**`{domain}-response.presenter.ts`:**
```typescript
/**
 * {도메인} 응답 Presenter 모음
 *
 * @description
 * - UI 계층에서 사용하는 응답 데이터 Presenter 클래스를 정의합니다.
 * - 의존성 순서대로 정의되어 있습니다 (하위 → 상위).
 */

import type {
  BrochureModel,
  BrochureAttachmentModel,
  // ...
} from "./brochure.model";
import { nowISOString } from "@/lib/utils/temporal.util";
import { formatDate } from "@/cms/_utils/date";

// ============================================
// 하위 엔티티 Presenters
// ============================================

export class BrochureAttachmentPresenter implements BrochureAttachmentModel {
  // ...
}

export class BrochureTranslationPresenter implements BrochureTranslationModel {
  // ...
}

export class BrochureCategoryPresenter implements BrochureCategoryModel {
  // ...
}

// ============================================
// 메인 엔티티 Presenter
// ============================================

export class BrochurePresenter implements BrochureModel {
  // ...
}

// ============================================
// 목록 Presenters
// ============================================

export class BrochurePageItemPresenter implements BrochurePageItemModel {
  // ...
}

export class BrochurePagePresenter implements BrochurePageModel {
  // ...
}

export class BrochureCategoriesPresenter {
  // ...
}
```

### 하위 엔티티 Presenter 예시

**첨부파일 Presenter:**
```typescript
export class BrochureAttachmentPresenter implements BrochureAttachmentModel {
  readonly id: string;
  readonly documentId: string;
  readonly languageId: string;
  readonly name: string;
  readonly url: string;
  readonly size: number;
  readonly mimeType?: string;
  readonly uploadedAt?: string;

  private constructor(data: {
    id: string;
    documentId: string;
    languageId: string;
    name: string;
    url: string;
    size: number;
    mimeType?: string;
    uploadedAt?: string;
  }) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.languageId = data.languageId;
    this.name = data.name;
    this.url = data.url;
    this.size = data.size;
    this.mimeType = data.mimeType;
    this.uploadedAt = data.uploadedAt;
  }

  static create(data: {
    id: string;
    documentId: string;
    languageId: string;
    name: string;
    url: string;
    size: number;
    mimeType?: string;
    uploadedAt?: string;
  }): BrochureAttachmentPresenter {
    return new BrochureAttachmentPresenter(data);
  }

  copyWith(
    updates: Partial<BrochureAttachmentPresenter>,
  ): BrochureAttachmentPresenter {
    return BrochureAttachmentPresenter.create({
      id: updates.id ?? this.id,
      documentId: updates.documentId ?? this.documentId,
      languageId: updates.languageId ?? this.languageId,
      name: updates.name ?? this.name,
      url: updates.url ?? this.url,
      size: updates.size ?? this.size,
      mimeType: updates.mimeType ?? this.mimeType,
      uploadedAt: updates.uploadedAt ?? this.uploadedAt,
    });
  }

  /**
   * 정적 헬퍼 메서드: 파일 타입 확인
   */
  static getFileType(name: string): "image" | "pdf" | "other" {
    const extension = name.split(".").pop()?.toLowerCase();
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    if (extension === "pdf") return "pdf";
    if (extension && imageExtensions.includes(extension)) return "image";
    return "other";
  }

  /**
   * 정적 헬퍼 메서드: 파일 크기 표시용 텍스트 반환
   */
  static displaySize(size: number): string {
    return formatDisplaySize(size);
  }
}
```

### 페이지네이션 Presenter 예시

**목록 Presenter with SWR 캐시 역직렬화 처리:**
```typescript
export class BrochurePagePresenter implements BrochurePageModel {
  readonly items: BrochurePageItemPresenter[];
  readonly page: number;
  readonly size: number;
  readonly total: number;
  readonly totalPages: number;

  private constructor(data: {
    items: BrochurePageItemPresenter[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
  }) {
    this.items = data.items;
    this.page = data.page;
    this.size = data.size;
    this.total = data.total;
    this.totalPages = data.totalPages;
  }

  /**
   * 데이터로부터 Presenter 인스턴스 생성
   *
   * @description
   * - 주어진 데이터로 Presenter 인스턴스를 생성합니다.
   * - SWR 캐시에서 역직렬화된 일반 객체(POJO)도 안전하게 처리합니다.
   * - 내부적으로 instanceof 체크를 통해 방어적으로 변환합니다 (Defensive Programming).
   * - 사용처에서는 역직렬화를 신경 쓸 필요 없이 바로 호출할 수 있습니다.
   */
  static create(data: {
    items: BrochurePageItemPresenter[];
    page: number;
    size: number;
    total: number;
    totalPages: number;
  }): BrochurePagePresenter {
    // 방어 코드: items가 undefined이거나 배열이 아닌 경우 빈 배열로 처리
    const safeItems = Array.isArray(data.items) ? data.items : [];

    // SWR 캐시 역직렬화 대응: items 배열의 각 항목을 Presenter 인스턴스로 변환
    const presenters = safeItems.map((item) =>
      item instanceof BrochurePageItemPresenter
        ? item
        : BrochurePageItemPresenter.create(item),
    );

    return new BrochurePagePresenter({
      items: presenters,
      page: data.page,
      size: data.size,
      total: data.total,
      totalPages: data.totalPages,
    });
  }

  static createEmpty(): BrochurePagePresenter {
    return BrochurePagePresenter.create({
      items: [],
      page: 1,
      size: 20,
      total: 0,
      totalPages: 1,
    });
  }

  copyWith(updates: Partial<BrochurePagePresenter>): BrochurePagePresenter {
    return BrochurePagePresenter.create({
      items: updates.items ?? this.items,
      page: updates.page ?? this.page,
      size: updates.size ?? this.size,
      total: updates.total ?? this.total,
      totalPages: updates.totalPages ?? this.totalPages,
    });
  }

  // UI 헬퍼 메서드
  hasItems(): boolean {
    return this.items.length > 0;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  isFirstPage(): boolean {
    return this.page === 1;
  }

  isLastPage(): boolean {
    return this.page >= this.totalPages;
  }

  hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  hasPrevPage(): boolean {
    return this.page > 1;
  }
}
```

---

## Request Presenters

요청 Presenter는 프론트엔드에서 백엔드로 전송할 데이터를 관리합니다.

### 파일 구조

**`{domain}-request.presenter.ts`:**
```typescript
/**
 * {도메인} 요청 Presenter 모음
 *
 * @description
 * - UI 계층에서 사용하는 요청 파라미터 Presenter 클래스를 정의합니다.
 */

import type { ReadBrochurePageModel } from "./brochure.model";
import { BrochurePresenter } from "./brochure-response.presenter";

// ============================================
// 조회 요청 (Query)
// ============================================

export class ReadBrochurePagePresenter implements ReadBrochurePageModel {
  // ...
}

// ============================================
// 생성/수정 요청 (Command)
// ============================================

export class CreateBrochureFormDataPresenter {
  // ...
}

export class UpdateBrochureFormDataPresenter {
  // ...
}
```

### 조회 파라미터 Presenter

```typescript
export class ReadBrochurePagePresenter implements ReadBrochurePageModel {
  readonly page?: number;
  readonly size?: number;
  readonly categoryId?: string;
  readonly keyword?: string;
  readonly isPublic?: boolean;

  private constructor(data: {
    page?: number;
    size?: number;
    categoryId?: string;
    keyword?: string;
    isPublic?: boolean;
  }) {
    this.page = data.page;
    this.size = data.size;
    this.categoryId = data.categoryId;
    this.keyword = data.keyword;
    this.isPublic = data.isPublic;
  }

  static create(data: {
    page?: number;
    size?: number;
    categoryId?: string;
    keyword?: string;
    isPublic?: boolean;
  }): ReadBrochurePagePresenter {
    return new ReadBrochurePagePresenter(data);
  }

  static createEmpty(): ReadBrochurePagePresenter {
    return ReadBrochurePagePresenter.create({});
  }

  copyWith(updates: Partial<ReadBrochurePagePresenter>): ReadBrochurePagePresenter {
    return ReadBrochurePagePresenter.create({
      page: updates.page ?? this.page,
      size: updates.size ?? this.size,
      categoryId: "categoryId" in updates ? updates.categoryId : this.categoryId,
      keyword: updates.keyword ?? this.keyword,
      isPublic: "isPublic" in updates ? updates.isPublic : this.isPublic,
    });
  }

  // UI 헬퍼 메서드
  hasFilter(): boolean {
    return !!(this.categoryId || this.keyword || this.isPublic !== undefined);
  }

  isSearchActive(): boolean {
    return !!this.keyword && this.keyword.length > 0;
  }
}
```

### FormData Presenter (생성)

```typescript
/** 최대 파일 크기 (10MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 유효성 검증 결과
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 브로슈어 FormData Presenter (생성 전용)
 *
 * @description
 * - 브로슈어 생성 시 FormData 전송을 위한 데이터 컨테이너 역할을 수행합니다.
 * - BrochurePresenter와 파일 배열을 보유하며, Mapper가 이를 FormData로 변환합니다.
 * - 유효성 검증 로직을 포함하여 필수 필드 및 파일 크기를 검증합니다.
 */
export class CreateBrochureFormDataPresenter {
  private readonly presenter: BrochurePresenter;
  private readonly files: File[];

  private constructor(presenter: BrochurePresenter, files: File[]) {
    this.presenter = presenter;
    this.files = files;
  }

  static create(
    presenter: BrochurePresenter,
    files?: File[],
  ): CreateBrochureFormDataPresenter {
    return new CreateBrochureFormDataPresenter(presenter, files || []);
  }

  getPresenter(): BrochurePresenter {
    return this.presenter;
  }

  getFiles(): File[] {
    return this.files;
  }

  copyWith(updates: {
    presenter?: BrochurePresenter;
    files?: File[];
  }): CreateBrochureFormDataPresenter {
    return new CreateBrochureFormDataPresenter(
      updates.presenter ?? this.presenter,
      updates.files ?? this.files,
    );
  }

  /**
   * 유효성 검증
   *
   * @description
   * - 필수 필드 검증: 카테고리, 최소 1개 언어의 콘텐츠
   * - 파일 크기 검증: 10MB 이하
   */
  validate(): ValidationResult {
    const errors: string[] = [];

    // 카테고리 필수 검증
    if (!this.presenter.categoryId) {
      errors.push("카테고리를 선택해주세요.");
    }

    // 유효한 번역 데이터 확인 (제목 또는 내용이 있는 번역)
    const hasValidTranslation = this.presenter.translations?.some(
      (t) =>
        (t.title && t.title.trim() !== "") ||
        (t.content && t.content.trim() !== ""),
    );

    if (!hasValidTranslation) {
      errors.push("최소 하나 이상의 언어로 제목 또는 내용을 입력해주세요.");
    }

    // 파일 크기 검증 (10MB 제한)
    const oversizedFiles = this.files.filter(
      (file) => file.size > MAX_FILE_SIZE,
    );
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      errors.push(
        `파일 크기는 10MB를 초과할 수 없습니다. (초과 파일: ${fileNames})`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

### FormData Presenter (수정)

```typescript
export class UpdateBrochureFormDataPresenter {
  private readonly brochureId: string;
  private readonly presenter: BrochurePresenter;
  private readonly files: File[];

  private constructor(
    brochureId: string,
    presenter: BrochurePresenter,
    files: File[],
  ) {
    this.brochureId = brochureId;
    this.presenter = presenter;
    this.files = files;
  }

  static create(
    brochureId: string,
    presenter: BrochurePresenter,
    files?: File[],
  ): UpdateBrochureFormDataPresenter {
    return new UpdateBrochureFormDataPresenter(brochureId, presenter, files || []);
  }

  getBrochureId(): string {
    return this.brochureId;
  }

  getPresenter(): BrochurePresenter {
    return this.presenter;
  }

  getFiles(): File[] {
    return this.files;
  }

  copyWith(updates: {
    brochureId?: string;
    presenter?: BrochurePresenter;
    files?: File[];
  }): UpdateBrochureFormDataPresenter {
    return new UpdateBrochureFormDataPresenter(
      updates.brochureId ?? this.brochureId,
      updates.presenter ?? this.presenter,
      updates.files ?? this.files,
    );
  }

  validate(): ValidationResult {
    const errors: string[] = [];

    // brochureId 필수 검증
    if (!this.brochureId || this.brochureId.trim() === "") {
      errors.push("브로슈어 ID가 필요합니다.");
    }

    // 카테고리 필수 검증
    if (!this.presenter.categoryId) {
      errors.push("카테고리를 선택해주세요.");
    }

    // 유효한 번역 데이터 확인
    const hasValidTranslation = this.presenter.translations?.some(
      (t) =>
        (t.title && t.title.trim() !== "") ||
        (t.content && t.content.trim() !== ""),
    );

    if (!hasValidTranslation) {
      errors.push("최소 하나 이상의 언어로 제목 또는 내용을 입력해주세요.");
    }

    // 파일 크기 검증
    const oversizedFiles = this.files.filter(
      (file) => file.size > MAX_FILE_SIZE,
    );
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      errors.push(
        `파일 크기는 10MB를 초과할 수 없습니다. (초과 파일: ${fileNames})`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

---

## UI Helper Methods

UI 헬퍼 메서드는 Presenter에서 제공하는 편의 메서드입니다.

### 정적 vs 인스턴스 메서드

**정적 메서드 (Static):**
```typescript
/**
 * UI 헬퍼 메서드: 작성일 포맷팅 반환
 */
static displayCreatedAt(createdAt?: string): string {
  return createdAt ? formatDate(createdAt) : "-";
}
```

**인스턴스 메서드:**
```typescript
/**
 * UI 헬퍼 메서드: 작성일 포맷팅 반환 (인스턴스 메서드)
 */
displayCreatedAt(): string {
  return BrochurePresenter.displayCreatedAt(this.createdAt);
}
```

**사용 시기:**
- 정적: 외부에서 값을 받아 처리할 때
- 인스턴스: 현재 객체의 필드를 사용할 때

### 공통 UI 헬퍼 패턴

**display~ 메서드 (포맷팅):**
```typescript
// 날짜 포맷팅
displayCreatedAt(): string {
  return formatDate(this.createdAt);
}

// 공개 상태 텍스트
displayPublicStatus(): string {
  return this.isPublic ? "공개" : "비공개";
}

// 파일 크기
static displaySize(size: number): string {
  return formatDisplaySize(size);
}
```

**get~ 메서드 (값 조회):**
```typescript
// 특정 언어의 번역 가져오기
getTranslation(languageId: string): BrochureTranslationPresenter | undefined {
  return this.translations?.find((t) => t.languageId === languageId);
}

// 특정 언어의 제목 가져오기 (fallback 포함)
getTitle(languageId: string, fallbackLanguageId?: string): string {
  return BrochureTranslationPresenter.getTitle(
    this.translations || [],
    languageId,
    fallbackLanguageId,
  );
}
```

**has~ / is~ 메서드 (상태 확인):**
```typescript
// 아이템 존재 여부
hasItems(): boolean {
  return this.items.length > 0;
}

// 빈 목록 여부
isEmpty(): boolean {
  return this.items.length === 0;
}

// 첫 페이지 여부
isFirstPage(): boolean {
  return this.page === 1;
}

// 마지막 페이지 여부
isLastPage(): boolean {
  return this.page >= this.totalPages;
}
```

### Translation 헬퍼 패턴

**Fallback 로직이 있는 헬퍼:**
```typescript
/**
 * 번역 필드를 fallback 로직과 함께 가져오는 제네릭 헬퍼
 */
private static getFieldWithFallback<T>(
  translations: BrochureTranslationPresenter[],
  languageId: string,
  fieldGetter: (translation: BrochureTranslationPresenter) => T | undefined,
  isEmpty: (value: T | undefined) => boolean,
  defaultValue: T,
  fallbackLanguageId?: string,
): T {
  if (!translations || translations.length === 0) {
    return defaultValue;
  }

  // 1. 요청한 언어의 번역 찾기
  const translation = this.getTranslation(translations, languageId);
  const value = translation ? fieldGetter(translation) : undefined;
  if (!isEmpty(value)) {
    return value as T;
  }

  // 2. fallback 언어가 있으면 fallback 언어의 번역 찾기
  if (fallbackLanguageId) {
    const fallbackTranslation = this.getTranslation(
      translations,
      fallbackLanguageId,
    );
    const fallbackValue = fallbackTranslation
      ? fieldGetter(fallbackTranslation)
      : undefined;
    if (!isEmpty(fallbackValue)) {
      return fallbackValue as T;
    }
  }

  // 3. 둘 다 없으면 첫 번째 번역의 값 반환
  if (translations.length > 0) {
    const firstValue = fieldGetter(translations[0]);
    if (!isEmpty(firstValue)) {
      return firstValue as T;
    }
  }

  return defaultValue;
}

/**
 * 번역 배열에서 특정 언어의 제목을 가져오는 정적 메서드
 */
static getTitle(
  translations: BrochureTranslationPresenter[],
  languageId: string,
  fallbackLanguageId?: string,
): string {
  return this.getFieldWithFallback(
    translations,
    languageId,
    (t) => t.title,
    (v) => !v,
    "",
    fallbackLanguageId,
  );
}
```

---

## Validation Patterns

### ValidationResult 인터페이스

```typescript
/**
 * 유효성 검증 결과
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

### validate() 메서드 패턴

```typescript
/**
 * 유효성 검증
 *
 * @description
 * - 필수 필드 검증: 카테고리, 최소 1개 언어의 콘텐츠
 * - 파일 크기 검증: 10MB 이하
 *
 * @returns 검증 결과 { valid: boolean, errors: string[] }
 */
validate(): ValidationResult {
  const errors: string[] = [];

  // 필수 필드 검증
  if (!this.presenter.categoryId) {
    errors.push("카테고리를 선택해주세요.");
  }

  // 비즈니스 로직 검증
  const hasValidTranslation = this.presenter.translations?.some(
    (t) =>
      (t.title && t.title.trim() !== "") ||
      (t.content && t.content.trim() !== ""),
  );

  if (!hasValidTranslation) {
    errors.push("최소 하나 이상의 언어로 제목 또는 내용을 입력해주세요.");
  }

  // 파일 검증
  const oversizedFiles = this.files.filter(
    (file) => file.size > MAX_FILE_SIZE,
  );
  if (oversizedFiles.length > 0) {
    const fileNames = oversizedFiles.map((f) => f.name).join(", ");
    errors.push(
      `파일 크기는 10MB를 초과할 수 없습니다. (초과 파일: ${fileNames})`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 사용 예시

```typescript
// Hook에서 validate() 사용
const createBrochure = async (formDataPresenter: CreateBrochureFormDataPresenter) => {
  // 유효성 검증
  const validation = formDataPresenter.validate();
  if (!validation.valid) {
    // 에러 메시지 표시
    validation.errors.forEach((error) => {
      console.error(error);
    });
    return;
  }

  // 검증 통과 시 API 호출
  await service.브로슈어를_생성한다(formDataPresenter);
};
```

---

## Checklist

Presenter 작성 시 확인사항:

- [ ] 파일명이 `{domain}-request.presenter.ts` 또는 `{domain}-response.presenter.ts` 형식인가?
- [ ] 모든 필드가 `readonly`로 선언되었는가?
- [ ] Constructor가 `private`인가?
- [ ] `static create()` 메서드가 있는가?
- [ ] `static createEmpty()` 메서드가 있는가? (필요시)
- [ ] `copyWith()` 메서드가 있는가?
- [ ] 선택적 필드 업데이트 시 `"in"` 연산자를 사용했는가?
- [ ] UI 헬퍼 메서드가 적절히 구현되었는가?
- [ ] FormData Presenter에 `validate()` 메서드가 있는가?
- [ ] 페이지네이션 Presenter에 SWR 캐시 역직렬화 처리가 있는가?
- [ ] JSDoc 주석이 모든 메서드에 있는가?
