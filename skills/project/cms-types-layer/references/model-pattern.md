# Model Pattern Guide

Model은 프론트엔드에서 사용하는 데이터 구조를 정의하는 TypeScript 인터페이스입니다. Next.js API handler의 DTO와 독립적으로 정의되어 UI 요구사항에 맞게 관리됩니다.

## Table of Contents

1. [File Structure](#file-structure)
2. [Query Models](#query-models)
3. [Command Models](#command-models)
4. [Naming Conventions](#naming-conventions)
5. [Field Types](#field-types)
6. [Documentation](#documentation)

---

## File Structure

Model 파일은 `_types/{domain}.model.ts` 형식으로 작성하며, **CQRS(Command Query Responsibility Segregation)** 패턴에 따라 두 섹션으로 구분됩니다:

```typescript
/**
 * {도메인명} 모델 정의
 *
 * @description UI에서 사용하는 {도메인} 관련 데이터 모델을 정의합니다.
 * DTO와 독립적으로 정의되어 UI 요구사항에 맞게 관리됩니다.
 */

// ============================================
// Query Models (조회 - 읽기 전용)
// ============================================

// 1. Query 결과 모델 (하위 → 상위 순서)
//    - 첨부파일, 번역, 카테고리, 메인 엔티티
//    - 페이지 아이템, 페이지네이션, 목록

// 2. Query 파라미터 모델
//    - 목록 조회 파라미터 (페이지네이션, 필터링)

// ============================================
// Command Models (변경 - 쓰기 작업)
// ============================================

// 생성(Create) → 수정(Update) → 삭제(Delete) 순서로 정의
// URL path parameter (id 등)는 Model에 포함하지 않음
```

### CQRS 구분 기준

**Query Models (조회):**

- **목적**: 데이터를 읽기만 하는 작업 (부수효과 없음)
- **포함**:
  - Query 결과 모델 (Next.js API handler에서 받은 데이터)
  - Query 파라미터 모델 (조회 조건)
- **특징**: 시스템 상태를 변경하지 않음

**Command Models (변경):**

- **목적**: 데이터를 생성, 수정, 삭제하는 작업 (부수효과 있음)
- **포함**:
  - Create Models (생성 요청)
  - Update Models (수정 요청)
- **특징**: 시스템 상태를 변경함

---

## Query Models

Query Model은 데이터 조회 작업(읽기)에 사용되는 모델로, Query 결과와 Query 파라미터를 포함합니다.

### Query 결과 모델

Next.js API handler에서 받아온 데이터를 프론트엔드에서 사용하기 위한 형태로 정의합니다.

### 정의 순서 (하위 → 상위)

**의존성 순서를 따라 정의합니다:**

```typescript
// 1. 첨부파일 (Attachment) - 최하위
export interface BrochureAttachmentModel {
	id: string;
	documentId: string;
	name: string;
	url: string;
	size: number;
	mimeType?: string;
	uploadedAt?: string;
}

// 2. 번역 (Translation) - 첨부파일을 포함할 수 있음
export interface BrochureTranslationModel {
	documentId: string;
	languageId: string;
	title: string;
	content: string;
	createdAt?: string;
	updatedAt?: string;
}

// 3. 카테고리 (Category) - 독립적
export interface BrochureCategoryModel {
	id: string;
	name: string;
	description?: string;
	order?: number;
	isPublic?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

// 4. 메인 엔티티 (Main Entity) - 모든 하위 엔티티 포함
export interface BrochureModel {
	id: string;
	creatorId: string;
	updatorId: string;
	categoryId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	order?: number;
	isPublic?: boolean;
	// 관계 필드
	attachments?: BrochureAttachmentModel[];
	translations?: BrochureTranslationModel[];
}

// 5. 페이지 아이템 (Page Item) - 목록 조회용 간소화 모델
export interface BrochurePageItemModel {
	id: string;
	isPublic: boolean;
	order: number;
	title: string;
	description: string | null;
	categoryName?: string;
	createdAt: string;
	updatedAt: string;
}

// 6. 페이지네이션 (Page) - 페이지 아이템 배열 포함
export interface BrochurePageModel {
	items: BrochurePageItemModel[];
	page: number;
	size: number;
	total: number;
	totalPages: number;
}

// 7. 카테고리 목록 (Categories) - 카테고리 배열 포함
export interface BrochureCategoriesModel {
	items: BrochureCategoryModel[];
	total: number;
}
```

### 단건 조회 (Read by ID)

**URL path parameter로 전달되는 ID는 별도 Model이 필요하지 않습니다:**

단건 조회 작업은 ID만 필요하며, 이는 URL path parameter(`/api/brochure/[id]`)로 직접 전달할 수 있는 값이므로 별도 Model interface가 필요하지 않습니다.

**예시:**

```typescript
// ❌ 불필요한 Model 정의
export interface ReadBrochureModel {
	id: string;
}

// ✅ 올바른 방식 - 서비스 메서드에서 직접 primitive 타입 사용
// 브로슈어를_조회한다(id: string): Promise<BrochureModel>

// API 엔드포인트: GET /api/brochure/[id]
// 프론트엔드 서비스: await fetch(`/api/brochure/${id}`)
```

**적용 조건:**
- URL path parameter로 전달되는 단일 ID(string)
- primitive 타입으로 표현 가능한 값

### Query 파라미터 모델

조회 작업에 필요한 파라미터(페이지네이션, 필터링)를 정의합니다.

페이지네이션 및 필터링 파라미터:

```typescript
/**
 * 브로슈어 목록 조회 파라미터 모델
 */
export interface ReadBrochurePageModel {
	page?: number;
	size?: number;
	categoryId?: string;
	keyword?: string;
	isPublic?: boolean;
}
```

---

## Command Models

Command Model은 데이터 변경 작업(생성, 수정, 삭제)에 사용되는 모델입니다.

### URL Path Parameter 원칙

**모든 CRUD 작업에서 URL path parameter로 전달 가능한 값은 Model로 감싸지 않습니다.**

이 원칙은 API의 RESTful 특성을 따르며, URL 경로를 통해 리소스를 식별하는 경우 해당 식별자를 별도 Model interface로 래핑하지 않고 직접 primitive 타입으로 전달합니다.

#### 적용 대상

| 작업 | HTTP Method | URL 패턴 | Parameter |
|------|-------------|----------|-----------|
| **단건 조회** | GET | `/api/brochure/[id]` | `id: string` |
| **수정** | PUT/PATCH | `/api/brochure/[id]` | `id: string` + body |
| **삭제** | DELETE | `/api/brochure/[id]` | `id: string` |

#### URL parameter로 전달 가능한 값

- **Primitive 타입**: `string`, `number`, `boolean`
- **단일 ID 값**: 리소스를 고유하게 식별하는 값
- **단순 플래그**: true/false와 같은 boolean 값

#### Model이 필요한 경우

URL parameter가 아닌 **요청 body**에 전달되는 복잡한 데이터:

| 상황 | 예시 | 이유 |
|------|------|------|
| 복잡한 데이터 구조 | `UpdateBrochureFormDataModel` | 여러 필드와 파일을 포함 |
| 배열 또는 객체 | `UpdateBrochureOrderModel` | items 배열 포함 |
| 다중 필드 요청 | `CreateBrochureModel` | translations, categoryId 등 다수 필드 |

**예시:**

```typescript
// ✅ 올바른 방식 - URL parameter는 Model로 감싸지 않음
interface BrochureService {
	브로슈어를_조회한다(id: string): Promise<BrochureModel>;
	브로슈어를_수정한다(id: string, data: UpdateBrochureFormDataModel): Promise<BrochureModel>;
	브로슈어를_삭제한다(id: string): Promise<void>;
	브로슈어_공개를_수정한다(id: string, isPublic: boolean): Promise<BrochureModel>;
}

// ❌ 잘못된 방식 - 불필요한 Model 래핑
interface DeleteBrochureModel {
	id: string;
}
interface ReadBrochureModel {
	id: string;
}
```

#### 프론트엔드-백엔드 매핑

```typescript
// 프론트엔드 서비스
async 브로슈어를_삭제한다(id: string): Promise<void> {
	await fetch(`/api/brochure/${id}`, { method: 'DELETE' });
}

// Next.js API Route Handler
// app/api/brochure/[id]/route.ts
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	// params.id는 URL path parameter에서 자동 추출
	await brochureService.브로슈어를_삭제한다(params.id);
	return Response.json({ success: true });
}
```

이 원칙을 따르면 불필요한 타입 래핑을 방지하고, RESTful API의 의도를 명확하게 표현할 수 있습니다.

---

### 생성 요청 (Create)

REST API 요청의 Content-Type에 따라 Model 네이밍이 달라집니다.

#### JSON 전송 (application/json)

파일 업로드가 없는 단순 데이터 생성:

```typescript
/**
 * 브로슈어 카테고리 생성 요청 모델
 */
export interface CreateBrochureCategoryModel {
	name: string;
	description?: string;
	order?: number;
}
```

**네이밍 패턴:** `Create{Domain}Model`

**사용 시기:**
- JSON만으로 처리 가능한 경우
- 파일 업로드가 필요 없는 경우
- 단순 텍스트 데이터만 전송하는 경우

#### FormData 전송 (multipart/form-data)

파일 업로드를 포함한 데이터 생성:

```typescript
/**
 * 브로슈어 생성 요청 모델
 * @description FormData를 명시적으로 래핑하여 타입 안전성 제공
 */
export interface CreateBrochureFormDataModel {
	/** multipart/form-data 형식의 폼 데이터 */
	formData: FormData;
}
```

**네이밍 패턴:** `Create{Domain}FormDataModel`

**사용 시기:**
- 파일 업로드가 필요한 경우
- 이미지, PDF, 문서 등의 첨부파일을 포함하는 경우
- multipart/form-data 전송이 필요한 경우

**주의사항:**

- `id`, `createdAt`, `updatedAt`는 제외 (API handler에서 생성)
- 필수 필드와 선택적 필드 구분
- FormData는 Presenter에서 생성, Mapper가 변환
- **네이밍에 `FormData`가 포함되면 파일 업로드 가능, 없으면 JSON 전송**

### 수정 요청 (Update)

생성과 마찬가지로 REST API 요청의 Content-Type에 따라 Model 네이밍이 달라집니다.

#### JSON 전송 (application/json)

파일 업로드가 없는 단순 데이터 수정:

```typescript
/**
 * 브로슈어 카테고리 수정 요청 모델
 * @description 카테고리 수정 데이터
 * @note ID는 URL path parameter로 전달되므로 Model에 포함하지 않음
 */
export interface UpdateBrochureCategoryModel {
	name: string; // 필수 필드
	description?: string;
	isPublic?: boolean;
	order?: number;
}
```

**네이밍 패턴:** `Update{Domain}Model` 또는 `Update{Domain}{Field}Model`

**사용 시기:**
- JSON만으로 처리 가능한 경우
- 파일 업로드가 필요 없는 경우
- 특정 필드만 수정하는 경우

**예시:**
```typescript
// 특정 필드만 수정
export interface UpdateBrochurePublishModel {
	isPublished: boolean;
}

// 순서 변경
export interface UpdateBrochureOrderModel {
	items: Array<{
		brochureId: string;
		order: number;
	}>;
}
```

#### FormData 전송 (multipart/form-data)

파일 업로드를 포함한 데이터 수정:

```typescript
/**
 * 브로슈어 수정 요청 모델
 * @description 브로슈어 수정 데이터
 * @note ID는 URL path parameter로 전달되므로 Model에 포함하지 않음
 *
 * [전송 형식]
 * - FormData로 전송 (파일 업로드 지원)
 * - translations: JSON 문자열로 변환
 * - categoryId: 문자열 (필수)
 * - files: File[] (선택)
 */
export interface UpdateBrochureFormDataModel {
	translations?: BrochureTranslationModel[];
	categoryId: string;
	files?: File[];
	publishedAt?: string;
	order?: number;
	isPublic?: boolean;
}
```

**네이밍 패턴:** `Update{Domain}FormDataModel`

**사용 시기:**
- 파일 업로드가 필요한 경우
- 기존 첨부파일을 유지하면서 새 파일을 추가하는 경우
- multipart/form-data 전송이 필요한 경우

**네이밍 규칙 요약:**
- `Update{Domain}Model` → JSON 전송 (파일 없음)
- `Update{Domain}FormDataModel` → FormData 전송 (파일 포함)
- `Update{Domain}{Field}Model` → 특정 필드만 수정 (JSON)

### 삭제 요청 (Delete)

삭제 작업은 **[URL Path Parameter 원칙](#url-path-parameter-원칙)**을 가장 명확하게 보여주는 예시입니다.

삭제는 ID만 필요하며, 이는 URL path parameter(`DELETE /api/brochure/[id]`)로 직접 전달할 수 있는 값이므로 **별도 Model interface가 필요하지 않습니다.**

**왜 Model이 필요 없는가?**

| 이유 | 설명 |
|------|------|
| **단일 값** | ID 하나만 필요 (primitive 타입) |
| **URL로 충분** | RESTful 방식으로 URL 경로에 리소스 식별자 포함 |
| **요청 body 없음** | DELETE 요청은 일반적으로 body를 사용하지 않음 |

**올바른 구현 패턴:**

```typescript
// ✅ 프론트엔드 서비스 인터페이스
interface BrochureService {
	브로슈어를_삭제한다(id: string): Promise<void>;
}

// ✅ 프론트엔드 서비스 구현
class BrochureServiceImpl implements BrochureService {
	async 브로슈어를_삭제한다(id: string): Promise<void> {
		await fetch(`/api/brochure/${id}`, { method: 'DELETE' });
	}
}

// ✅ Next.js API Route Handler
// app/api/brochure/[id]/route.ts
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	await brochureService.브로슈어를_삭제한다(params.id);
	return Response.json({ success: true });
}
```

**잘못된 패턴 (사용 금지):**

```typescript
// ❌ 불필요한 Model 정의
export interface DeleteBrochureModel {
	id: string;
}

// ❌ 불필요한 래핑으로 코드 복잡도 증가
async 브로슈어를_삭제한다(model: DeleteBrochureModel): Promise<void> {
	await fetch(`/api/brochure/${model.id}`, { method: 'DELETE' });
}
```

**관련 작업:**

단순 토글이나 상태 변경도 동일한 원칙을 따릅니다:

```typescript
// ✅ URL parameter + 단일 primitive 값
브로슈어_공개를_수정한다(id: string, isPublic: boolean): Promise<BrochureModel>
IR_공개를_수정한다(id: string, isPublic: boolean): Promise<IrModel>

// API 호출 예시
await fetch(`/api/brochure/${id}/public`, {
	method: 'PATCH',
	body: JSON.stringify({ isPublic })
});
```

---

## Naming Conventions

### Interface 이름 패턴

#### Query Models (조회)

| 용도          | 패턴                      | 예시                      |
| ------------- | ------------------------- | ------------------------- |
| 메인 엔티티   | `{Domain}Model`           | `BrochureModel`           |
| 하위 엔티티   | `{Domain}{SubEntity}Model`| `BrochureAttachmentModel` |
| 목록 아이템   | `{Domain}PageItemModel`   | `BrochurePageItemModel`   |
| 페이지네이션  | `{Domain}PageModel`       | `BrochurePageModel`       |
| 카테고리 목록 | `{Domain}CategoriesModel` | `BrochureCategoriesModel` |
| 조회 파라미터 | `Read{Domain}PageModel`   | `ReadBrochurePageModel`   |

#### Command Models (변경)

| 용도                     | 패턴                            | 예시                             | 전송 방식              |
| ------------------------ | ------------------------------- | -------------------------------- | ---------------------- |
| 생성 (JSON)              | `Create{Domain}Model`           | `CreateBrochureCategoryModel`    | application/json       |
| 생성 (파일 포함)         | `Create{Domain}FormDataModel`   | `CreateBrochureFormDataModel`    | multipart/form-data    |
| 수정 (JSON)              | `Update{Domain}Model`           | `UpdateBrochureCategoryModel`    | application/json       |
| 수정 (파일 포함)         | `Update{Domain}FormDataModel`   | `UpdateBrochureFormDataModel`    | multipart/form-data    |
| 특정 필드 수정           | `Update{Domain}{Field}Model`    | `UpdateBrochurePublishModel`     | application/json       |

**네이밍 규칙:**
- `FormData`가 포함되면 → 파일 업로드 가능 (multipart/form-data)
- `FormData`가 없으면 → JSON 전송 (application/json)

---

## Field Types

### 기본 타입

```typescript
// 문자열
id: string;
name: string;
content: string;

// 숫자
order: number;
size: number;
page: number;

// Boolean
isPublic: boolean;
isActive: boolean;

// 선택적
description?: string;
publishedAt?: string;
```

### 특수 타입

**배열 타입:**

```typescript
attachments?: BrochureAttachmentModel[];
translations?: BrochureTranslationModel[];
items: BrochurePageItemModel[];
```

**Union 타입:**

```typescript
description: string | null;
// null 허용 (undefined와 다름)
```

**타임스탬프 (항상 string):**

```typescript
createdAt: string;  // ISO 8601 형식
updatedAt: string;  // ISO 8601 형식
publishedAt?: string;  // 선택적
```

---

## Documentation

### JSDoc 주석 패턴

**인터페이스 레벨:**

```typescript
/**
 * 브로슈어 모델
 */
export interface BrochureModel {
	// ...
}
```

**필드 레벨:**

```typescript
export interface BrochureModel {
	/** 문서 고유 ID (Primary Key) */
	id: string;

	/** 생성자 ID (Index) */
	creatorId: string;

	/** 카테고리 ID (Foreign Key) */
	categoryId: string;

	/** 생성 일시 (ISO 8601, Index) */
	createdAt: string;

	/** 첨부파일 목록 (1:N) */
	attachments?: BrochureAttachmentModel[];
}
```

**복잡한 Model에 대한 추가 설명:**

```typescript
/**
 * 브로슈어 수정 요청 모델
 * @description 브로슈어 수정 데이터 (ID는 별도 파라미터로 전달)
 *
 * [전송 형식]
 * - FormData로 전송 (파일 업로드 지원)
 * - translations: JSON 문자열로 변환
 * - categoryId: 문자열 (필수)
 * - files: File[] (선택)
 */
export interface UpdateBrochureFormDataModel {
	// ...
}
```

---

## Example: Complete Model File

브로슈어 도메인의 완전한 예시:

```typescript
/**
 * 브로슈어 모델 정의
 *
 * @description UI에서 사용하는 브로슈어 관련 데이터 모델을 정의합니다.
 * DTO와 독립적으로 정의되어 UI 요구사항에 맞게 관리됩니다.
 */

// ============================================
// Query Models (조회)
// ============================================

/**
 * 브로슈어 첨부파일 모델
 */
export interface BrochureAttachmentModel {
	id: string;
	documentId: string;
	name: string;
	url: string;
	size: number;
	mimeType?: string;
	uploadedAt?: string;
}

/**
 * 브로슈어 번역 모델
 */
export interface BrochureTranslationModel {
	documentId: string;
	languageId: string;
	title: string;
	content: string;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * 브로슈어 카테고리 모델
 */
export interface BrochureCategoryModel {
	id: string;
	name: string;
	description?: string;
	order?: number;
	isPublic?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * 브로슈어 모델
 */
export interface BrochureModel {
	id: string;
	creatorId: string;
	updatorId: string;
	categoryId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	order?: number;
	isPublic?: boolean;
	attachments?: BrochureAttachmentModel[];
	translations?: BrochureTranslationModel[];
}

/**
 * 브로슈어 목록 아이템 모델
 */
export interface BrochurePageItemModel {
	id: string;
	isPublic: boolean;
	order: number;
	title: string;
	description: string | null;
	categoryName?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * 브로슈어 목록 모델 (페이지네이션 포함)
 */
export interface BrochurePageModel {
	items: BrochurePageItemModel[];
	page: number;
	size: number;
	total: number;
	totalPages: number;
}

/**
 * 브로슈어 카테고리 목록 모델
 */
export interface BrochureCategoriesModel {
	items: BrochureCategoryModel[];
	total: number;
}

// --------------------------------------------
// Query 파라미터
// --------------------------------------------

/**
 * 브로슈어 목록 조회 파라미터 모델
 */
export interface ReadBrochurePageModel {
	page?: number;
	size?: number;
	categoryId?: string;
	keyword?: string;
	isPublic?: boolean;
}

// ============================================
// Command Models (변경)
// ============================================

// --------------------------------------------
// 생성 (Create)
// --------------------------------------------

/**
 * 브로슈어 생성 요청 모델
 * @description FormData를 명시적으로 래핑하여 타입 안전성 제공
 */
export interface CreateBrochureFormDataModel {
	formData: FormData;
}

/**
 * 브로슈어 카테고리 생성 요청 모델
 */
export interface CreateBrochureCategoryModel {
	name: string;
	description?: string;
	order?: number;
}

// --------------------------------------------
// 수정 (Update)
// --------------------------------------------

/**
 * 브로슈어 수정 요청 모델 (파일 업로드 포함)
 */
export interface UpdateBrochureFormDataModel {
	translations?: BrochureTranslationModel[];
	categoryId: string;
	files?: File[];
	publishedAt?: string;
	order?: number;
	isPublic?: boolean;
}

/**
 * 브로슈어 카테고리 수정 요청 모델
 */
export interface UpdateBrochureCategoryModel {
	name: string;
	description?: string;
	isPublic?: boolean;
	order?: number;
}

// --------------------------------------------
// 삭제 (Delete)
// --------------------------------------------
// params로 전달 가능한 primitive 값(ID)은 Model로 감싸지 않음
```

---

## Checklist

Model 정의 시 확인사항:

- [ ] 파일명이 `{domain}.model.ts` 형식인가?
- [ ] CQRS 패턴에 따라 Query Models와 Command Models로 구분했는가?
- [ ] Query 결과 모델이 하위 → 상위 순서로 정의되었는가?
- [ ] Command Models이 Create → Update 순서로 정의되었는가?
- [ ] 모든 인터페이스에 JSDoc 주석이 있는가?
- [ ] 필수/선택적 필드가 올바르게 구분되었는가?
- [ ] 타임스탬프 필드가 string 타입인가?
- [ ] ID 필드 네이밍이 일관성 있는가?
- [ ] params로 전달 가능한 primitive 값을 Model로 감싸지 않았는가?
