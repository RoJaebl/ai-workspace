# Mapper Pattern Guide

Mapper는 Model과 Presenter 간의 변환 로직을 담당하는 정적 클래스입니다. 모든 메서드는 static으로 정의되며, 일관된 네이밍 컨벤션을 따릅니다.

## Table of Contents

1. [File Structure](#file-structure)
2. [Naming Conventions](#naming-conventions)
3. [Model to Presenter](#model-to-presenter)
4. [Presenter to Model](#presenter-to-model)
5. [FormData Conversion](#formdata-conversion)
6. [Nested Entity Conversion](#nested-entity-conversion)

---

## File Structure

Mapper는 `_services/{domain}.mapper.ts` 위치에 작성합니다:

```
{domain}/
├── _types/
│   ├── {domain}.model.ts
│   ├── {domain}-request.presenter.ts
│   └── {domain}-response.presenter.ts
└── _services/
    └── {domain}.mapper.ts  ← Mapper 위치
```

### 파일 구조 예시

```typescript
/**
 * 브로슈어 도메인 변환 맵퍼
 *
 * @description
 * - Model ↔ Presenter 변환 로직을 담당합니다.
 * - 백엔드 DTO 변환은 백엔드 adapter에서 처리합니다.
 *
 * 네이밍 패턴:
 * - Model → Presenter: to{CRUD}{Domain}Presenter (입력: Model, 출력: Presenter)
 * - Presenter → Model: from{CRUD}{Domain}Presenter (입력: Presenter, 출력: Model)
 */

import type {
  BrochureModel,
  // ...
} from "../_types/brochure.model";

import {
  BrochurePresenter,
  // ...
} from "../_types/brochure-response.presenter";

import {
  ReadBrochurePagePresenter,
  CreateBrochureFormDataPresenter,
  UpdateBrochureFormDataPresenter,
} from "../_types/brochure-request.presenter";

export class BrochureMapper {
  // ============================================
  // Model → Presenter 변환
  // ============================================

  // ============================================
  // Presenter → Model 변환
  // ============================================
}
```

---

## Naming Conventions

### 핵심 원칙

**Model → Presenter (to):**
```typescript
// 읽기(Read) 작업: Model을 받아 Presenter 생성
static to{CRUD}{Domain}Presenter(model: Model): Presenter
```

**Presenter → Model (from):**
```typescript
// 쓰기(Create/Update) 작업: Presenter를 받아 Model 생성
static from{CRUD}{Domain}Presenter(presenter: Presenter): Model
```

### CRUD별 메서드 네이밍

| CRUD | 방향 | 패턴 | 예시 |
|------|-----|-----|-----|
| **Read** | Model → Presenter | `toRead{Domain}Presenter` | `toReadBrochurePresenter` |
| **Read** | Model → Presenter | `toRead{Domain}PagePresenter` | `toReadBrochurePagePresenter` |
| **Create** | Presenter → Model | `fromCreate{Domain}Presenter` | `fromCreateCategoryPresenter` |
| **Update** | Presenter → Model | `fromUpdate{Domain}Presenter` | `fromUpdateBrochurePresenter` |

### 하위 엔티티 네이밍

| 엔티티 | 방향 | 패턴 | 예시 |
|--------|-----|-----|-----|
| 첨부파일 | Model → Presenter | `toRead{Entity}Presenter` | `toReadAttachmentPresenter` |
| 번역 | Model → Presenter | `toRead{Entity}Presenter` | `toReadTranslationPresenter` |
| 카테고리 | Model → Presenter | `toRead{Entity}Presenter` | `toReadCategoryPresenter` |
| 카테고리 | Presenter → Model | `fromCreate{Entity}Presenter` | `fromCreateCategoryPresenter` |
| 카테고리 | Presenter → Model | `fromUpdate{Entity}Presenter` | `fromUpdateCategoryPresenter` |

---

## Model to Presenter

Model → Presenter 변환은 백엔드에서 받은 데이터를 UI에서 사용하기 위한 형태로 변환합니다.

### 메인 엔티티 변환

```typescript
/**
 * BrochureModel → BrochurePresenter 변환
 *
 * @description 백엔드에서 받은 브로슈어 Model을 UI용 Presenter로 변환합니다.
 * @param model - BrochureModel 인스턴스
 * @returns BrochurePresenter 인스턴스
 */
static toReadBrochurePresenter(model: BrochureModel): BrochurePresenter {
  return BrochurePresenter.create({
    id: model.id,
    creatorId: model.creatorId,
    updatorId: model.updatorId,
    categoryId: model.categoryId,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    publishedAt: model.publishedAt,
    order: model.order,
    isPublic: model.isPublic,
    // 하위 엔티티 변환
    attachments: model.attachments
      ? model.attachments.map((a) => this.toReadAttachmentPresenter(a))
      : undefined,
    translations: model.translations
      ? model.translations.map((t) => this.toReadTranslationPresenter(t))
      : undefined,
  });
}
```

**특징:**
- 모든 필드를 1:1로 매핑
- 하위 엔티티는 `map()`으로 배열 변환
- undefined 체크 후 변환 (optional chaining)

### 페이지네이션 변환

**페이지 아이템:**
```typescript
/**
 * BrochurePageItemModel → BrochurePageItemPresenter 변환
 *
 * @description 페이지 목록 아이템 Model을 Presenter로 변환합니다.
 * @param model - BrochurePageItemModel 인스턴스
 * @returns BrochurePageItemPresenter 인스턴스
 */
static toReadBrochurePageItemPresenter(
  model: BrochurePageItemModel,
): BrochurePageItemPresenter {
  return BrochurePageItemPresenter.create({
    id: model.id,
    isPublic: model.isPublic,
    order: model.order,
    title: model.title,
    description: model.description,
    categoryName: model.categoryName,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  });
}
```

**페이지:**
```typescript
/**
 * BrochurePageModel → BrochurePagePresenter 변환 (페이지네이션 포함)
 *
 * @description
 * - 페이지네이션 메타데이터를 포함한 목록 응답을 Presenter로 변환합니다.
 * - items 배열은 각 항목을 toReadBrochurePageItemPresenter()로 변환합니다.
 *
 * @param model - BrochurePageModel 인스턴스
 * @returns BrochurePagePresenter 인스턴스
 */
static toReadBrochurePagePresenter(
  model: BrochurePageModel,
): BrochurePagePresenter {
  return BrochurePagePresenter.create({
    items: model.items.map((m) => this.toReadBrochurePageItemPresenter(m)),
    page: model.page,
    size: model.size,
    total: model.total,
    totalPages: model.totalPages,
  });
}
```

### 하위 엔티티 변환

**첨부파일:**
```typescript
/**
 * BrochureAttachmentModel → BrochureAttachmentPresenter 변환
 *
 * @description 첨부파일 Model을 Presenter로 변환합니다.
 * @param model - BrochureAttachmentModel 인스턴스
 * @returns BrochureAttachmentPresenter 인스턴스
 */
static toReadAttachmentPresenter(
  model: BrochureAttachmentModel,
): BrochureAttachmentPresenter {
  return BrochureAttachmentPresenter.create({
    id: model.id,
    documentId: model.documentId,
    languageId: "",  // 필요시 기본값 설정
    name: model.name,
    url: model.url,
    size: model.size,
    mimeType: model.mimeType,
    uploadedAt: model.uploadedAt,
  });
}
```

**번역:**
```typescript
/**
 * BrochureTranslationModel → BrochureTranslationPresenter 변환
 *
 * @description 번역 Model을 Presenter로 변환합니다.
 * @param model - BrochureTranslationModel 인스턴스
 * @returns BrochureTranslationPresenter 인스턴스
 */
static toReadTranslationPresenter(
  model: BrochureTranslationModel,
): BrochureTranslationPresenter {
  return BrochureTranslationPresenter.create({
    documentId: model.documentId,
    languageId: model.languageId,
    title: model.title,
    content: model.content,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  });
}
```

**카테고리:**
```typescript
/**
 * BrochureCategoryModel → BrochureCategoryPresenter 변환
 *
 * @description 카테고리 Model을 Presenter로 변환합니다.
 * @param model - BrochureCategoryModel 인스턴스
 * @returns BrochureCategoryPresenter 인스턴스
 */
static toReadCategoryPresenter(
  model: BrochureCategoryModel,
): BrochureCategoryPresenter {
  return BrochureCategoryPresenter.create({
    id: model.id,
    code: model.code,
    name: model.name,
    description: model.description,
    order: model.order,
    isPublic: model.isPublic,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  });
}
```

---

## Presenter to Model

Presenter → Model 변환은 UI에서 입력받은 데이터를 백엔드로 전송하기 위한 형태로 변환합니다.

### Update 변환

```typescript
/**
 * BrochurePresenter → UpdateBrochureModel 변환
 *
 * @description Presenter에서 브로슈어 수정용 Model을 생성합니다.
 * @param presenter - BrochurePresenter 인스턴스
 * @returns UpdateBrochureModel
 */
static fromUpdateBrochurePresenter(
  presenter: BrochurePresenter,
): UpdateBrochureModel {
  return {
    translations: presenter.translations
      ? presenter.translations.map((t) =>
          this.fromUpdateTranslationPresenter(t),
        )
      : undefined,
    categoryId: presenter.categoryId,
    // files는 UI에서 직접 전달하므로 Mapper에서는 포함하지 않음
    publishedAt: presenter.publishedAt,
    order: presenter.order,
    isPublic: presenter.isPublic,
  };
}
```

**특징:**
- `id`, `createdAt`, `updatedAt` 제외 (백엔드에서 관리)
- 필요한 필드만 포함
- 하위 엔티티는 해당 변환 메서드 사용

### Create 변환

**카테고리 생성:**
```typescript
/**
 * BrochureCategoryPresenter → CreateBrochureCategoryModel 변환
 *
 * @description Presenter에서 카테고리 생성용 Model을 생성합니다.
 * @param presenter - BrochureCategoryPresenter 인스턴스
 * @returns CreateBrochureCategoryModel
 */
static fromCreateCategoryPresenter(
  presenter: BrochureCategoryPresenter,
): CreateBrochureCategoryModel {
  return {
    code: presenter.code,
    name: presenter.name,
    description: presenter.description,
    order: presenter.order,
  };
}
```

**특징:**
- `id`, 타임스탬프, `isPublic` 제외
- 생성에 필요한 최소 필드만 포함

### 조회 파라미터 변환

```typescript
/**
 * ReadBrochurePagePresenter → ReadBrochurePageModel 변환
 *
 * @description
 * - UI 계층의 Presenter를 Service 계층의 Model로 변환합니다.
 * - Hook에서 Service 호출 전 이 메서드를 사용합니다.
 *
 * @param presenter - ReadBrochurePagePresenter 인스턴스
 * @returns ReadBrochurePageModel
 */
static fromReadBrochurePagePresenter(
  presenter: ReadBrochurePagePresenter,
): ReadBrochurePageModel {
  return {
    page: presenter.page,
    size: presenter.size,
    categoryId: presenter.categoryId,
    keyword: presenter.keyword,
    isPublic: presenter.isPublic,
  };
}
```

**특징:**
- 1:1 매핑 (모든 필드 optional)
- 추가 변환 로직 없음

### 하위 엔티티 변환

**번역 업데이트:**
```typescript
/**
 * BrochureTranslationPresenter → BrochureTranslationModel 변환
 *
 * @description Presenter에서 번역 Model을 생성합니다. (Update 작업용)
 * @param presenter - BrochureTranslationPresenter 인스턴스
 * @returns BrochureTranslationModel
 */
static fromUpdateTranslationPresenter(
  presenter: BrochureTranslationPresenter,
): BrochureTranslationModel {
  return {
    documentId: presenter.documentId,
    languageId: presenter.languageId,
    title: presenter.title,
    content: presenter.content,
    createdAt: presenter.createdAt,
    updatedAt: presenter.updatedAt,
  };
}
```

**카테고리 업데이트:**
```typescript
/**
 * BrochureCategoryPresenter → UpdateBrochureCategoryModel 변환
 *
 * @description Presenter에서 카테고리 수정용 Model을 생성합니다.
 * @param presenter - BrochureCategoryPresenter 인스턴스
 * @returns UpdateBrochureCategoryModel
 */
static fromUpdateCategoryPresenter(
  presenter: BrochureCategoryPresenter,
): UpdateBrochureCategoryModel {
  return {
    code: presenter.code,
    name: presenter.name,
    description: presenter.description,
    isPublic: presenter.isPublic,
    order: presenter.order,
  };
}
```

---

## FormData Conversion

FormData 변환은 파일 업로드를 포함한 생성/수정 작업에 사용됩니다.

### Create FormData 변환

```typescript
/**
 * CreateBrochureFormDataPresenter → FormData 변환
 *
 * @description
 * - Mapper가 FormData 생성 책임을 가집니다.
 * - BrochurePresenter의 translations를 백엔드 DTO 형식으로 변환합니다.
 * - 필드명 변환: content → description (프론트엔드 vs 백엔드)
 * - 파일 업로드를 FormData에 추가합니다.
 *
 * @param formDataPresenter - CreateBrochureFormDataPresenter 인스턴스
 * @returns FormData 객체
 */
static fromCreateBrochureFormDataPresenter(
  formDataPresenter: CreateBrochureFormDataPresenter,
): FormData {
  const formData = new FormData();
  const presenter = formDataPresenter.getPresenter();
  const files = formDataPresenter.getFiles();

  // translations를 백엔드 DTO 형식으로 변환하여 JSON 문자열로 추가
  if (presenter.translations && presenter.translations.length > 0) {
    const translationsDto = presenter.translations.map((translation) => ({
      languageId: translation.languageId,
      title: translation.title,
      description: translation.content || null, // content → description 필드명 변환
    }));
    formData.append("translations", JSON.stringify(translationsDto));
  }

  // categoryId 추가
  if (presenter.categoryId) {
    formData.append("categoryId", presenter.categoryId);
  }

  // 파일 추가
  files.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
}
```

**주요 포인트:**
- FormData 생성은 Mapper의 책임
- 백엔드 DTO 형식에 맞게 필드명 변환 (`content` → `description`)
- 복잡한 객체는 JSON.stringify()로 변환
- 파일은 `append()`로 직접 추가

### Update FormData 변환

```typescript
/**
 * UpdateBrochureFormDataPresenter → UpdateBrochureModel 변환
 *
 * @description FormDataPresenter를 UpdateBrochureModel로 변환합니다.
 * @param formDataPresenter - UpdateBrochureFormDataPresenter 인스턴스
 * @returns UpdateBrochureModel
 */
static fromUpdateBrochureFormDataPresenter(
  formDataPresenter: UpdateBrochureFormDataPresenter,
): UpdateBrochureModel {
  const presenter = formDataPresenter.getPresenter();
  const files = formDataPresenter.getFiles();

  return {
    translations: presenter.translations
      ? presenter.translations.map((t) =>
          this.fromUpdateTranslationPresenter(t),
        )
      : undefined,
    categoryId: presenter.categoryId,
    files: files.length > 0 ? files : undefined,
    publishedAt: presenter.publishedAt,
    order: presenter.order,
    isPublic: presenter.isPublic,
  };
}
```

**주요 포인트:**
- FormData 생성보다는 Model 생성에 집중
- files 배열이 비어있으면 undefined 처리
- Service에서 FormData로 변환 처리

---

## Nested Entity Conversion

하위 엔티티 변환 시 고려사항입니다.

### 배열 변환 패턴

**Model → Presenter:**
```typescript
static toReadBrochurePresenter(model: BrochureModel): BrochurePresenter {
  return BrochurePresenter.create({
    // ...
    attachments: model.attachments
      ? model.attachments.map((a) => this.toReadAttachmentPresenter(a))
      : undefined,
    translations: model.translations
      ? model.translations.map((t) => this.toReadTranslationPresenter(t))
      : undefined,
  });
}
```

**Presenter → Model:**
```typescript
static fromUpdateBrochurePresenter(
  presenter: BrochurePresenter,
): UpdateBrochureModel {
  return {
    // ...
    translations: presenter.translations
      ? presenter.translations.map((t) =>
          this.fromUpdateTranslationPresenter(t),
        )
      : undefined,
  };
}
```

### Optional Chaining 사용

```typescript
// ✅ 올바른 방식
attachments: model.attachments
  ? model.attachments.map((a) => this.toReadAttachmentPresenter(a))
  : undefined,

// ❌ 잘못된 방식 (null 체크 없음)
attachments: model.attachments.map((a) => this.toReadAttachmentPresenter(a)),
```

### 기본값 설정

필요시 기본값을 설정합니다:

```typescript
static toReadAttachmentPresenter(
  model: BrochureAttachmentModel,
): BrochureAttachmentPresenter {
  return BrochureAttachmentPresenter.create({
    id: model.id,
    documentId: model.documentId,
    languageId: model.languageId || "",  // 기본값 설정
    name: model.name,
    url: model.url,
    size: model.size || 0,  // 기본값 설정
    mimeType: model.mimeType,
    uploadedAt: model.uploadedAt,
  });
}
```

---

## Complete Example

완전한 Mapper 예시:

```typescript
/**
 * 브로슈어 도메인 변환 맵퍼
 */

import type {
  BrochureModel,
  BrochurePageModel,
  BrochurePageItemModel,
  BrochureCategoryModel,
  BrochureTranslationModel,
  BrochureAttachmentModel,
  ReadBrochurePageModel,
  UpdateBrochureModel,
  CreateBrochureCategoryModel,
  UpdateBrochureCategoryModel,
} from "../_types/brochure.model";

import {
  BrochurePresenter,
  BrochurePagePresenter,
  BrochurePageItemPresenter,
  BrochureCategoryPresenter,
  BrochureTranslationPresenter,
  BrochureAttachmentPresenter,
} from "../_types/brochure-response.presenter";
import {
  ReadBrochurePagePresenter,
  CreateBrochureFormDataPresenter,
  UpdateBrochureFormDataPresenter,
} from "../_types/brochure-request.presenter";

export class BrochureMapper {
  // ============================================
  // Model → Presenter 변환
  // ============================================

  static toReadBrochurePresenter(model: BrochureModel): BrochurePresenter {
    return BrochurePresenter.create({
      id: model.id,
      creatorId: model.creatorId,
      updatorId: model.updatorId,
      categoryId: model.categoryId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      publishedAt: model.publishedAt,
      order: model.order,
      isPublic: model.isPublic,
      attachments: model.attachments
        ? model.attachments.map((a) => this.toReadAttachmentPresenter(a))
        : undefined,
      translations: model.translations
        ? model.translations.map((t) => this.toReadTranslationPresenter(t))
        : undefined,
    });
  }

  static toReadBrochurePageItemPresenter(
    model: BrochurePageItemModel,
  ): BrochurePageItemPresenter {
    return BrochurePageItemPresenter.create({
      id: model.id,
      isPublic: model.isPublic,
      order: model.order,
      title: model.title,
      description: model.description,
      categoryName: model.categoryName,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toReadBrochurePagePresenter(
    model: BrochurePageModel,
  ): BrochurePagePresenter {
    return BrochurePagePresenter.create({
      items: model.items.map((m) => this.toReadBrochurePageItemPresenter(m)),
      page: model.page,
      size: model.size,
      total: model.total,
      totalPages: model.totalPages,
    });
  }

  static toReadCategoryPresenter(
    model: BrochureCategoryModel,
  ): BrochureCategoryPresenter {
    return BrochureCategoryPresenter.create({
      id: model.id,
      code: model.code,
      name: model.name,
      description: model.description,
      order: model.order,
      isPublic: model.isPublic,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toReadTranslationPresenter(
    model: BrochureTranslationModel,
  ): BrochureTranslationPresenter {
    return BrochureTranslationPresenter.create({
      documentId: model.documentId,
      languageId: model.languageId,
      title: model.title,
      content: model.content,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toReadAttachmentPresenter(
    model: BrochureAttachmentModel,
  ): BrochureAttachmentPresenter {
    return BrochureAttachmentPresenter.create({
      id: model.id,
      documentId: model.documentId,
      languageId: "",
      name: model.name,
      url: model.url,
      size: model.size,
      mimeType: model.mimeType,
      uploadedAt: model.uploadedAt,
    });
  }

  // ============================================
  // Presenter → Model 변환
  // ============================================

  static fromUpdateBrochurePresenter(
    presenter: BrochurePresenter,
  ): UpdateBrochureModel {
    return {
      translations: presenter.translations
        ? presenter.translations.map((t) =>
            this.fromUpdateTranslationPresenter(t),
          )
        : undefined,
      categoryId: presenter.categoryId,
      publishedAt: presenter.publishedAt,
      order: presenter.order,
      isPublic: presenter.isPublic,
    };
  }

  static fromCreateCategoryPresenter(
    presenter: BrochureCategoryPresenter,
  ): CreateBrochureCategoryModel {
    return {
      code: presenter.code,
      name: presenter.name,
      description: presenter.description,
      order: presenter.order,
    };
  }

  static fromUpdateCategoryPresenter(
    presenter: BrochureCategoryPresenter,
  ): UpdateBrochureCategoryModel {
    return {
      code: presenter.code,
      name: presenter.name,
      description: presenter.description,
      isPublic: presenter.isPublic,
      order: presenter.order,
    };
  }

  static fromUpdateTranslationPresenter(
    presenter: BrochureTranslationPresenter,
  ): BrochureTranslationModel {
    return {
      documentId: presenter.documentId,
      languageId: presenter.languageId,
      title: presenter.title,
      content: presenter.content,
      createdAt: presenter.createdAt,
      updatedAt: presenter.updatedAt,
    };
  }

  static fromCreateBrochureFormDataPresenter(
    formDataPresenter: CreateBrochureFormDataPresenter,
  ): FormData {
    const formData = new FormData();
    const presenter = formDataPresenter.getPresenter();
    const files = formDataPresenter.getFiles();

    if (presenter.translations && presenter.translations.length > 0) {
      const translationsDto = presenter.translations.map((translation) => ({
        languageId: translation.languageId,
        title: translation.title,
        description: translation.content || null,
      }));
      formData.append("translations", JSON.stringify(translationsDto));
    }

    if (presenter.categoryId) {
      formData.append("categoryId", presenter.categoryId);
    }

    files.forEach((file) => {
      formData.append("files", file);
    });

    return formData;
  }

  static fromUpdateBrochureFormDataPresenter(
    formDataPresenter: UpdateBrochureFormDataPresenter,
  ): UpdateBrochureModel {
    const presenter = formDataPresenter.getPresenter();
    const files = formDataPresenter.getFiles();

    return {
      translations: presenter.translations
        ? presenter.translations.map((t) =>
            this.fromUpdateTranslationPresenter(t),
          )
        : undefined,
      categoryId: presenter.categoryId,
      files: files.length > 0 ? files : undefined,
      publishedAt: presenter.publishedAt,
      order: presenter.order,
      isPublic: presenter.isPublic,
    };
  }

  static fromReadBrochurePagePresenter(
    presenter: ReadBrochurePagePresenter,
  ): ReadBrochurePageModel {
    return {
      page: presenter.page,
      size: presenter.size,
      categoryId: presenter.categoryId,
      keyword: presenter.keyword,
      isPublic: presenter.isPublic,
    };
  }
}
```

---

## Checklist

Mapper 작성 시 확인사항:

- [ ] 파일이 `_services/{domain}.mapper.ts`에 위치하는가?
- [ ] 모든 메서드가 `static`인가?
- [ ] Model → Presenter 메서드가 `to~Presenter` 네이밍을 따르는가?
- [ ] Presenter → Model 메서드가 `from~Presenter` 네이밍을 따르는가?
- [ ] CRUD별 메서드 네이밍이 일관성 있는가?
- [ ] 하위 엔티티 변환 메서드가 있는가?
- [ ] 배열 변환 시 optional chaining을 사용하는가?
- [ ] FormData 변환 로직이 있는가? (파일 업로드 시)
- [ ] JSDoc 주석이 모든 메서드에 있는가?
- [ ] import 경로가 올바른가?
