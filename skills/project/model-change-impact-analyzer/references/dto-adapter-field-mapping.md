# DTO-Adapter 필드 매핑 가이드

백엔드 DTO와 프론트엔드 Model 간 필드명이 다를 때 Adapter에서 매핑하는 방법을 설명합니다.

## 개요

Adapter는 백엔드 API 스펙 변경의 영향을 최소화하는 **완충 계층(Buffer Layer)**입니다.

### Adapter의 역할

1. **필드명 변환**: 백엔드 필드명 ↔ 프론트엔드 필드명 매핑
2. **타입 변환**: string ↔ number, null ↔ undefined 등
3. **구조 변환**: 평탄한 구조 ↔ 중첩 구조
4. **기본값 제공**: 백엔드에서 제공하지 않는 필드에 기본값 설정
5. **변경 격리**: 백엔드 스펙 변경 시 Adapter만 수정하여 프론트엔드 보호

### 데이터 흐름

```
Backend API Response (JSON)
  ↓
DTO (백엔드 스펙 그대로)
  ↓
Adapter.fromXxxResponse() [필드명/타입 변환]
  ↓
Model (프론트엔드 스펙)
  ↓
Mapper.fromModel()
  ↓
Presenter
  ↓
Service → Hooks → UI
```

## 일반적인 매핑 패턴

### 1. 필드명만 다른 경우

가장 일반적인 케이스입니다. 의미는 같지만 네이밍 컨벤션이 다른 경우입니다.

```typescript
// DTO (백엔드)
interface BrochureAttachmentDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

// Model (프론트엔드)
interface BrochureAttachmentModel {
  name: string;
  url: string;
  size: number;
}

// Adapter
export class BrochureAdapter {
  static toAttachmentModel(dto: BrochureAttachmentDto): BrochureAttachmentModel {
    return {
      name: dto.fileName,   // 매핑
      url: dto.fileUrl,     // 매핑
      size: dto.fileSize,   // 매핑
    };
  }
  
  // 역변환 (Request 생성 시)
  static fromAttachmentModel(model: BrochureAttachmentModel): BrochureAttachmentDto {
    return {
      fileName: model.name,   // 역매핑
      fileUrl: model.url,     // 역매핑
      fileSize: model.size,   // 역매핑
    };
  }
}
```

### 2. 값의 의미는 같지만 이름이 다른 경우

```typescript
// DTO: isActive (활성 상태)
// Model: isPublic (공개 상태)
// 의미는 같지만 용어가 다름

export class CategoryAdapter {
  static fromCategoryResponse(dto: CategoryResponseDto): CategoryModel {
    return {
      id: dto.id,
      name: dto.name,
      isPublic: dto.isActive, // isActive → isPublic
    };
  }
  
  static toCreateCategoryRequest(model: CreateCategoryModel): CreateCategoryDto {
    return {
      name: model.name,
      isActive: model.isPublic, // isPublic → isActive
    };
  }
}
```

### 3. null vs undefined 변환

TypeScript에서는 undefined를 선호하지만, 백엔드는 null을 사용하는 경우가 많습니다.

```typescript
// DTO: string | null (백엔드)
// Model: string | undefined (프론트엔드)

export class Adapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // null → undefined 변환
      description: dto.description ?? undefined,
      
      // 또는 null일 때 빈 문자열로
      // description: dto.description ?? "",
    };
  }
  
  static toRequest(model: XxxModel): XxxDto {
    return {
      // undefined → null 변환 (백엔드가 null 기대)
      description: model.description ?? null,
    };
  }
}
```

### 4. 구조 변환 (평탄 → 중첩)

백엔드는 평탄한 구조, 프론트엔드는 중첩 구조를 선호하는 경우입니다.

```typescript
// DTO: 평탄한 구조
interface IrResponseDto {
  id: string;
  translationTitle: string;
  translationContent: string;
  attachmentFileName: string;
  attachmentFileUrl: string;
}

// Model: 중첩 구조
interface IrModel {
  id: string;
  translation: {
    title: string;
    content: string;
  };
  attachment: {
    name: string;
    url: string;
  };
}

// Adapter
export class IrAdapter {
  static fromResponse(dto: IrResponseDto): IrModel {
    return {
      id: dto.id,
      // 평탄한 필드를 중첩 구조로 변환
      translation: {
        title: dto.translationTitle,
        content: dto.translationContent,
      },
      attachment: {
        name: dto.attachmentFileName,
        url: dto.attachmentFileUrl,
      },
    };
  }
}
```

### 5. 기본값 제공

백엔드에서 제공하지 않지만 프론트엔드에 필요한 필드에 기본값을 제공합니다.

```typescript
// Model에 있지만 DTO에 없는 필드
export class Adapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      id: dto.id,
      title: dto.title,
      
      // 백엔드에서 제공하지 않는 필드들
      authorName: "",          // 빈 문자열 (나중에 별도 조회)
      publishedAt: undefined,  // Optional, 프론트 전용
      viewCount: 0,            // Required, 기본값
      localState: "draft",     // 클라이언트 전용 상태
    };
  }
}
```

### 6. 타입 변환

백엔드와 프론트엔드의 타입이 다른 경우입니다.

```typescript
// DTO: string
// Model: number

export class Adapter {
  static fromResponse(dto: { viewCount: string }): { viewCount: number } {
    return {
      viewCount: parseInt(dto.viewCount, 10), // string → number
    };
  }
  
  static toRequest(model: { viewCount: number }): { viewCount: string } {
    return {
      viewCount: model.viewCount.toString(), // number → string
    };
  }
}
```

### 7. 배열 필드 매핑

배열의 각 항목마다 매핑이 필요한 경우입니다.

```typescript
// DTO
interface XxxResponseDto {
  items: Array<{
    fileName: string;
    fileUrl: string;
  }>;
}

// Model
interface XxxModel {
  items: Array<{
    name: string;
    url: string;
  }>;
}

// Adapter
export class Adapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      items: dto.items.map(item => ({
        name: item.fileName,  // 각 항목마다 매핑
        url: item.fileUrl,
      })),
    };
  }
}
```

## 프로젝트의 일반적인 매핑 규칙

### 표준 매핑 테이블

| DTO (백엔드) | Model (프론트엔드) | 설명 | 도메인 |
|---|---|---|---|
| fileName | name | 파일 이름 | 첨부파일 |
| fileUrl | url | 파일 URL | 첨부파일 |
| fileSize | size | 파일 크기 (bytes) | 첨부파일 |
| isActive | isPublic | 활성/공개 상태 | 카테고리 |
| createdBy | authorId | 작성자 ID | 문서 |
| limit | size | 페이지 크기 | 페이지네이션 |
| description | content | 내용 | 번역 |

### 실제 프로젝트 예시

**Brochure Adapter**:
```typescript
/**
 * 필드명 매핑 규칙:
 *   - 첨부파일: fileName ↔ name, fileUrl ↔ url, fileSize ↔ size
 *   - 번역: description ↔ content
 *   - 카테고리: isActive ↔ isPublic
 *   - 문서: createdBy ↔ authorId
 *   - 페이지네이션: limit ↔ size
 *   - 오더: brochures[].id ↔ items[].brochureId
 */
```

## Model 필드 변경 시 Adapter 영향

### 시나리오 1: 프론트엔드에서 필드 추가

**상황**: Model에 `publishedAt` 필드를 추가하고 싶음

#### 옵션 A: 백엔드에서 제공하는 경우

```typescript
// 1단계: DTO 업데이트
export interface XxxResponseDto {
  // 기존 필드...
  publishedAt: string; // 백엔드에서 추가됨
}

// 2단계: Adapter 매핑 추가
export class XxxAdapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // 기존 필드...
      publishedAt: dto.publishedAt, // 그대로 전달
    };
  }
}

// 3단계: Model 업데이트
export interface XxxModel {
  // 기존 필드...
  publishedAt: string; // 추가
}

// 4단계: 이후 Presenter, Mapper, Service, UI 업데이트
```

#### 옵션 B: 백엔드에서 제공하지 않는 경우

```typescript
// 1단계: Adapter에서 기본값 제공
export class XxxAdapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // 기존 필드...
      publishedAt: undefined, // 프론트엔드 전용 필드, 기본값
    };
  }
}

// 2단계: Model에 Optional로 추가
export interface XxxModel {
  // 기존 필드...
  publishedAt?: string; // Optional (백엔드 미제공)
}

// 3단계: 이후 Presenter, Mapper, Service, UI 업데이트
```

### 시나리오 2: 백엔드 필드명 변경

**상황**: 백엔드가 `fileName` → `attachmentName`으로 변경

**핵심**: Adapter만 수정하면 나머지 계층은 영향 없음! ✅

```typescript
// DTO 업데이트 (백엔드 스펙 반영)
interface BrochureAttachmentDto {
  // fileName: string; // ❌ 기존
  attachmentName: string; // ✅ 백엔드에서 변경
  fileUrl: string;
  fileSize: number;
}

// Adapter만 수정
export class BrochureAdapter {
  static toAttachmentModel(dto: BrochureAttachmentDto): BrochureAttachmentModel {
    return {
      // name: dto.fileName, // ❌ 기존
      name: dto.attachmentName, // ✅ 변경 - Adapter만 수정
      url: dto.fileUrl,
      size: dto.fileSize,
    };
  }
}

// Model은 그대로! (변경 불필요)
interface BrochureAttachmentModel {
  name: string; // 그대로 유지
  url: string;
  size: number;
}

// Presenter, Mapper, Service, Hooks, UI 모두 변경 불필요!
```

**결과**: 
- 수정 파일: 2개 (DTO, Adapter)
- 영향 없는 파일: Model, Presenter, Mapper, Service, Hooks, UI

### 시나리오 3: 백엔드 타입 변경

**상황**: 백엔드가 `viewCount: string` → `viewCount: number`로 변경

```typescript
// DTO 업데이트
interface XxxResponseDto {
  // viewCount: string; // ❌ 기존
  viewCount: number;    // ✅ 변경
}

// Adapter 변환 로직 수정 (또는 제거)
export class XxxAdapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // viewCount: parseInt(dto.viewCount, 10), // ❌ 기존 (string → number 변환)
      viewCount: dto.viewCount,                   // ✅ 변경 (타입 일치, 변환 불필요)
    };
  }
}

// Model은 그대로
interface XxxModel {
  viewCount: number; // 그대로 유지
}
```

## 필드명 매핑 Best Practices

### 1. 매핑 규칙 문서화

Adapter 파일 상단에 매핑 규칙을 명시적으로 문서화하세요:

```typescript
/**
 * 브로슈어 어댑터 정의
 *
 * @description DTO ↔ Model 양방향 변환을 담당하는 클래스입니다.
 *
 * 필드명 매핑 규칙:
 *   - 첨부파일: fileName ↔ name, fileUrl ↔ url, fileSize ↔ size
 *   - 번역: description ↔ content
 *   - 카테고리: isActive ↔ isPublic
 *   - 문서: createdBy ↔ authorId
 *   - 페이지네이션: limit ↔ size
 *   - 오더: brochures[].id ↔ items[].brochureId
 */
export class BrochureAdapter {
  // ...
}
```

### 2. 일관성 유지

같은 의미의 필드는 프로젝트 전체에서 동일한 이름을 사용하세요:

**✅ 올바른 예시** (일관성 있음):
```typescript
// 모든 첨부파일에서 동일한 매핑
// Brochure: fileName → name
// IR: fileName → name
// News: fileName → name
```

**❌ 잘못된 예시** (일관성 없음):
```typescript
// 도메인마다 다른 매핑
// Brochure: fileName → name
// IR: fileName → filename  // ❌ 다름
// News: fileName → fileName // ❌ 매핑 안함
```

### 3. 타입 안전성

any 타입 사용을 피하고 명시적 타입을 사용하세요:

```typescript
// ❌ 잘못된 예시
static fromResponse(dto: any): any {
  return {
    name: dto.fileName,
  };
}

// ✅ 올바른 예시
static fromResponse(dto: XxxResponseDto): XxxModel {
  return {
    name: dto.fileName,
  };
}
```

### 4. 변환 로직 집중

DTO와 Model 간 변환은 Adapter에서만 수행하세요:

**✅ 올바른 구조**:
```
DTO → Adapter → Model → Mapper → Presenter
     [변환]            [변환]
```

**❌ 잘못된 구조**:
```
DTO → Service → Model (Service에서 직접 변환)
     [변환]
```

### 5. 양방향 변환 제공

Response뿐만 아니라 Request 변환도 제공하세요:

```typescript
export class XxxAdapter {
  // Response: DTO → Model
  static fromXxxResponse(dto: XxxResponseDto): XxxModel { ... }
  
  // Request: Model → DTO
  static toCreateXxxRequest(model: CreateXxxModel): CreateXxxDto { ... }
  static toUpdateXxxRequest(model: UpdateXxxModel): UpdateXxxDto { ... }
}
```

## 변환 패턴 상세

### 패턴 1: 단순 매핑

```typescript
export class Adapter {
  static fromResponse(dto: {
    backendName: string;
  }): {
    frontendName: string;
  } {
    return {
      frontendName: dto.backendName,
    };
  }
}
```

### 패턴 2: 조건부 변환

```typescript
export class Adapter {
  static fromResponse(dto: {
    status: "ACTIVE" | "INACTIVE";
  }): {
    isPublic: boolean;
  } {
    return {
      isPublic: dto.status === "ACTIVE", // 문자열 → boolean
    };
  }
}
```

### 패턴 3: 다중 필드 결합

```typescript
export class Adapter {
  static fromResponse(dto: {
    firstName: string;
    lastName: string;
  }): {
    fullName: string;
  } {
    return {
      fullName: `${dto.firstName} ${dto.lastName}`, // 결합
    };
  }
}
```

### 패턴 4: 필드 분리

```typescript
export class Adapter {
  static toRequest(model: {
    fullName: string;
  }): {
    firstName: string;
    lastName: string;
  } {
    const [firstName, lastName] = model.fullName.split(" ");
    return {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
    };
  }
}
```

### 패턴 5: 배열 변환 + 매핑

```typescript
export class Adapter {
  static fromResponse(dto: {
    attachments: Array<{
      fileName: string;
      fileUrl: string;
    }>;
  }): {
    attachments: Array<{
      name: string;
      url: string;
    }>;
  } {
    return {
      attachments: dto.attachments?.map(att => ({
        name: att.fileName,  // 각 항목마다 매핑
        url: att.fileUrl,
      })) ?? [],
    };
  }
}
```

### 패턴 6: 중첩 배열 변환

```typescript
export class Adapter {
  static fromResponse(dto: {
    translations: Array<{
      languageId: string;
      files: Array<{
        fileName: string;
        fileUrl: string;
      }>;
    }>;
  }): {
    translations: Array<{
      languageId: string;
      attachments: Array<{
        name: string;
        url: string;
      }>;
    }>;
  } {
    return {
      translations: dto.translations?.map(trans => ({
        languageId: trans.languageId,
        attachments: trans.files?.map(file => ({
          name: file.fileName,  // 중첩된 배열도 매핑
          url: file.fileUrl,
        })) ?? [],
      })) ?? [],
    };
  }
}
```

## Adapter 변경 체크리스트

### 새 필드 추가 시

- [ ] 백엔드 API 문서에서 필드 확인
- [ ] DTO에 백엔드 필드명으로 추가
- [ ] Adapter.fromResponse()에 매핑 추가
- [ ] Adapter.toRequest()에 역매핑 추가
- [ ] 매핑 규칙 주석 업데이트
- [ ] null/undefined 처리 확인
- [ ] 타입 변환 필요 여부 확인

### 백엔드 필드명 변경 시

- [ ] DTO에서 필드명 변경
- [ ] Adapter 매핑만 수정
- [ ] Model 이하 계층 영향 없음 확인
- [ ] 테스트 실행

### 백엔드 타입 변경 시

- [ ] DTO 타입 변경
- [ ] Adapter 변환 로직 조정 (또는 제거)
- [ ] Model 이하 계층 영향 없음 확인

## 문제 해결

### 에러: Property does not exist on type DTO

**원인**: Adapter에서 DTO에 없는 필드를 참조

**해결**:
```typescript
// ❌ 잘못된 코드
name: dto.fileName, // fileName이 DTO에 없음

// ✅ 해결 1: DTO 확인 후 올바른 필드명 사용
name: dto.attachmentName, // 백엔드 스펙 확인

// ✅ 해결 2: 백엔드 미제공 시 기본값
name: "", // 기본값 제공
```

### 에러: Type 'null' is not assignable to type 'string | undefined'

**원인**: null과 undefined 타입 불일치

**해결**:
```typescript
// ❌ 잘못된 코드
description: dto.description, // dto.description이 null일 수 있음

// ✅ 올바른 코드
description: dto.description ?? undefined, // null → undefined
```

### 에러: Expected 2 arguments, but got 1 (Adapter 메서드)

**원인**: Adapter 메서드 시그니처 변경

**해결**:
```typescript
// Adapter 메서드에 새 파라미터 추가
static toAttachmentModel(
  dto: AttachmentDto,
  documentId: string, // 추가 파라미터
): AttachmentModel {
  return {
    documentId, // 추가 필드
    name: dto.fileName,
  };
}

// 호출하는 곳에서도 파라미터 전달
const attachment = XxxAdapter.toAttachmentModel(dto.attachment, dto.id);
```

## 실전 예시

### 예시 1: Brochure Attachment 매핑

**백엔드 DTO**:
```typescript
interface BrochureAttachmentDto {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}
```

**프론트엔드 Model**:
```typescript
interface BrochureAttachmentModel {
  id: string;        // DTO에 없음, Adapter에서 생성
  documentId: string; // DTO에 없음, Adapter에서 추가
  name: string;      // fileName 매핑
  url: string;       // fileUrl 매핑
  size: number;      // fileSize 매핑
  mimeType?: string; // mimeType (그대로, Optional)
  uploadedAt?: string; // DTO에 없음, 기본값
}
```

**Adapter 구현**:
```typescript
export class BrochureAdapter {
  /**
   * 첨부파일 DTO → Model 변환
   * @private 내부에서만 사용
   */
  private static _toAttachmentModel(
    dto: BrochureAttachmentDto,
    documentId: string, // 추가 파라미터
  ): BrochureAttachmentModel {
    return {
      id: generateTempId("att"),  // Adapter에서 ID 생성
      documentId,                  // 파라미터에서 전달
      name: dto.fileName,          // 매핑
      url: dto.fileUrl,            // 매핑
      size: dto.fileSize,          // 매핑
      mimeType: dto.mimeType ?? undefined, // null → undefined
      uploadedAt: undefined,       // 백엔드 미제공, 기본값
    };
  }
  
  /**
   * 첨부파일 배열 변환
   */
  private static _toAttachmentModelArray(
    dtos: BrochureAttachmentDto[] | null,
    documentId: string,
  ): BrochureAttachmentModel[] {
    if (!dtos || dtos.length === 0) return [];
    return dtos.map(dto => this._toAttachmentModel(dto, documentId));
  }
}
```

### 예시 2: 페이지네이션 매핑

**백엔드 DTO**:
```typescript
interface ListResponseDto {
  items: ItemDto[];
  total: number;
  page: number;
  limit: number;      // 백엔드는 limit 사용
  totalPages: number;
}
```

**프론트엔드 Model**:
```typescript
interface ItemsModel {
  items: ItemModel[];
  total: number;
  page: number;
  size: number;       // 프론트엔드는 size 사용
  totalPages: number;
}
```

**Adapter 구현**:
```typescript
export class Adapter {
  static fromListResponse(dto: ListResponseDto): ItemsModel {
    return {
      items: dto.items.map(item => this.fromItemResponse(item)),
      total: dto.total,
      page: dto.page,
      size: dto.limit,        // limit → size 매핑
      totalPages: dto.totalPages,
    };
  }
  
  // Request 시 역매핑
  static toListParams(params: { page: number; size: number }): URLSearchParams {
    const searchParams = new URLSearchParams();
    searchParams.append("page", params.page.toString());
    searchParams.append("limit", params.size.toString()); // size → limit 역매핑
    return searchParams;
  }
}
```

## 테스트 전략

### 1. 매핑 정확성 테스트

```typescript
describe("BrochureAdapter", () => {
  it("should map fileName to name", () => {
    const dto: BrochureAttachmentDto = {
      fileName: "test.pdf",
      fileUrl: "https://example.com/test.pdf",
      fileSize: 1024,
    };
    
    const model = BrochureAdapter.toAttachmentModel(dto, "doc-123");
    
    expect(model.name).toBe("test.pdf");
    expect(model.url).toBe("https://example.com/test.pdf");
    expect(model.size).toBe(1024);
  });
  
  it("should convert null to undefined", () => {
    const dto: XxxDto = {
      description: null,
    };
    
    const model = Adapter.fromResponse(dto);
    
    expect(model.description).toBeUndefined();
  });
});
```

### 2. 역변환 테스트

```typescript
describe("BrochureAdapter - Round Trip", () => {
  it("should maintain data integrity after round trip", () => {
    const originalDto: BrochureAttachmentDto = {
      fileName: "document.pdf",
      fileUrl: "https://example.com/doc.pdf",
      fileSize: 2048,
    };
    
    // DTO → Model → DTO
    const model = BrochureAdapter.toAttachmentModel(originalDto, "doc-1");
    const resultDto = BrochureAdapter.fromAttachmentModel(model);
    
    expect(resultDto.fileName).toBe(originalDto.fileName);
    expect(resultDto.fileUrl).toBe(originalDto.fileUrl);
    expect(resultDto.fileSize).toBe(originalDto.fileSize);
  });
});
```

## 유지보수 가이드

### 백엔드 API 버전 관리

백엔드 API가 버전별로 다른 경우:

```typescript
export class BrochureAdapter {
  // v1 API
  static fromResponseV1(dto: BrochureResponseDtoV1): BrochureModel {
    return {
      name: dto.fileName, // v1 필드명
    };
  }
  
  // v2 API
  static fromResponseV2(dto: BrochureResponseDtoV2): BrochureModel {
    return {
      name: dto.name, // v2에서 필드명 변경됨
    };
  }
  
  // 현재 버전 사용
  static fromResponse(dto: BrochureResponseDto): BrochureModel {
    return this.fromResponseV2(dto); // 최신 버전 사용
  }
}
```

### 점진적 마이그레이션

백엔드 스펙이 점진적으로 변경되는 경우:

```typescript
export class Adapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      // 신규 필드와 레거시 필드 모두 지원
      name: dto.name ?? dto.fileName ?? "", // 신규 우선, 레거시 폴백
    };
  }
}
```

## 참고 자료

- **필드 추가 체크리스트**: `assets/checklists/field-addition.md` - 0단계 참조
- **Adapter 템플릿**: `assets/templates/adapter-update.template.ts`
- **변경 전파 가이드**: `references/change-propagation-guide.md` - 시나리오 8
