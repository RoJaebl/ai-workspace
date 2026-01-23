/**
 * Adapter 필드 추가 템플릿
 * 
 * @description DTO와 Model 간 필드 매핑 추가 템플릿입니다.
 * 
 * 사용법:
 * 1. {domain}, {Xxx}, {newField} 등을 실제 값으로 치환
 * 2. 필드명 매핑 규칙에 따라 변환 로직 작성
 * 3. 필요한 부분만 복사하여 기존 Adapter에 추가
 */

import type {
  XxxResponseDto,
  XxxListResponseDto,
  CreateXxxDto,
  UpdateXxxDto,
} from "./xxx.dto";

import type {
  XxxModel,
  CreateXxxModel,
  UpdateXxxModel,
  XxxsModel,
} from "@/app/(planning)/plan/(cms)/cms/**/{domain}/_types/xxx.model";

/**
 * Xxx 어댑터
 * 
 * @description DTO ↔ Model 양방향 변환을 담당하는 클래스입니다.
 * 
 * 필드명 매핑 규칙:
 *   - 첨부파일: fileName ↔ name, fileUrl ↔ url, fileSize ↔ size
 *   - 상태: isActive ↔ isPublic
 *   - 작성자: createdBy ↔ authorId
 *   - 페이지네이션: limit ↔ size
 *   - 번역: description ↔ content
 */
export class XxxAdapter {
  // ============================================
  // Response 변환: DTO → Model
  // ============================================
  
  /**
   * XxxResponseDto → XxxModel
   * @description 상세 조회/생성/수정 응답 변환
   */
  static fromXxxResponse(dto: XxxResponseDto): XxxModel {
    return {
      id: dto.id,
      code: "xxx",
      // ... 기존 필드들
      
      // 🔹 필드명이 같은 경우 (그대로 전달)
      newField: dto.newField,
      
      // 🔹 필드명이 다른 경우 (매핑)
      name: dto.fileName,          // fileName → name
      url: dto.fileUrl,            // fileUrl → url
      size: dto.fileSize,          // fileSize → size
      isPublic: dto.isActive,      // isActive → isPublic
      authorId: dto.createdBy,     // createdBy → authorId
      
      // 🔹 null → undefined 변환
      description: dto.description ?? undefined,
      publishedAt: dto.publishedAt ?? undefined,
      
      // 🔹 기본값 제공 (백엔드 미제공)
      authorName: "",              // 빈 문자열 (나중에 별도 조회)
      viewCount: 0,                // Required 필드, 기본값
      localStatus: "draft",        // 클라이언트 전용 상태
      
      // 🔹 타입 변환
      order: parseInt(dto.order, 10), // string → number
      
      // 🔹 관계 필드 (하위 Adapter 호출)
      category: dto.category 
        ? this.fromCategoryResponse(dto.category)
        : undefined,
      
      // 🔹 배열 필드 (각 항목 변환)
      translations: this._toTranslationModelArray(dto.translations, dto.id),
      attachments: this._toAttachmentModelArray(dto.attachments, dto.id),
    };
  }
  
  /**
   * XxxListResponseDto → XxxsModel (목록 조회 + 페이지네이션)
   */
  static fromXxxsResponse(dto: XxxListResponseDto): XxxsModel {
    if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
      return {
        items: [],
        page: 1,
        size: 20,
        total: 0,
        totalPages: 0,
      };
    }
    
    return {
      items: dto.items.map(item => this._fromListItem(item)),
      page: dto.page,
      size: dto.limit,          // limit → size 매핑
      total: dto.total,
      totalPages: dto.totalPages,
    };
  }
  
  // ============================================
  // Request 변환: Model → DTO
  // ============================================
  
  /**
   * CreateXxxModel → CreateXxxDto
   * @description 생성 요청 변환
   */
  static toCreateXxxRequest(model: CreateXxxModel): CreateXxxDto {
    return {
      // ... 기존 필드
      
      // 🔹 필드명 역매핑
      fileName: model.name,        // name → fileName
      fileUrl: model.url,          // url → fileUrl
      fileSize: model.size,        // size → fileSize
      isActive: model.isPublic,    // isPublic → isActive
      
      // 🔹 undefined → null 변환 (백엔드가 null 기대)
      description: model.description ?? null,
      
      // 🔹 타입 역변환
      order: model.order.toString(), // number → string
    };
  }
  
  /**
   * UpdateXxxModel → UpdateXxxDto
   * @description 수정 요청 변환
   */
  static toUpdateXxxRequest(model: UpdateXxxModel): UpdateXxxDto {
    return {
      // ... 동일한 매핑 규칙 적용
      fileName: model.name,
      // ...
    };
  }
  
  /**
   * ListParams → URLSearchParams
   * @description 목록 조회 파라미터 변환
   */
  static toListParams(params: { page: number; size: number }): URLSearchParams {
    const searchParams = new URLSearchParams();
    searchParams.append("page", params.page.toString());
    searchParams.append("limit", params.size.toString()); // size → limit
    return searchParams;
  }
  
  // ============================================
  // Private 헬퍼 메서드
  // ============================================
  
  /**
   * 하위 엔티티 변환 (private)
   */
  private static _toTranslationModel(
    dto: TranslationDto,
    documentId: string,
  ): TranslationModel {
    return {
      documentId,
      languageId: dto.languageId,
      title: dto.title,
      content: dto.description,  // description → content 매핑
    };
  }
  
  /**
   * 배열 변환 헬퍼
   */
  private static _toTranslationModelArray(
    dtos: TranslationDto[] | null,
    documentId: string,
  ): TranslationModel[] {
    if (!dtos || dtos.length === 0) return [];
    return dtos.map(dto => this._toTranslationModel(dto, documentId));
  }
}

// ============================================
// 패턴별 예시
// ============================================

/**
 * 예시 1: 필드명만 다른 경우
 */
export class Example1Adapter {
  static fromResponse(dto: { fileName: string }): { name: string } {
    return {
      name: dto.fileName, // 단순 매핑
    };
  }
  
  static toRequest(model: { name: string }): { fileName: string } {
    return {
      fileName: model.name, // 역매핑
    };
  }
}

/**
 * 예시 2: 값 의미는 같지만 이름이 다른 경우
 */
export class Example2Adapter {
  static fromResponse(dto: { isActive: boolean }): { isPublic: boolean } {
    return {
      isPublic: dto.isActive, // 의미 매핑
    };
  }
  
  static toRequest(model: { isPublic: boolean }): { isActive: boolean } {
    return {
      isActive: model.isPublic, // 역매핑
    };
  }
}

/**
 * 예시 3: null ↔ undefined 변환
 */
export class Example3Adapter {
  static fromResponse(dto: { field: string | null }): { field: string | undefined } {
    return {
      field: dto.field ?? undefined, // null → undefined
    };
  }
  
  static toRequest(model: { field: string | undefined }): { field: string | null } {
    return {
      field: model.field ?? null, // undefined → null
    };
  }
}

/**
 * 예시 4: 구조 변환 (평탄 → 중첩)
 */
export class Example4Adapter {
  static fromResponse(dto: {
    translationTitle: string;
    translationContent: string;
  }): {
    translation: { title: string; content: string };
  } {
    return {
      translation: {
        title: dto.translationTitle,
        content: dto.translationContent,
      },
    };
  }
}

/**
 * 예시 5: 구조 변환 (중첩 → 평탄)
 */
export class Example5Adapter {
  static toRequest(model: {
    translation: { title: string; content: string };
  }): {
    translationTitle: string;
    translationContent: string;
  } {
    return {
      translationTitle: model.translation.title,
      translationContent: model.translation.content,
    };
  }
}

/**
 * 예시 6: 배열 필드 매핑
 */
export class Example6Adapter {
  static fromResponse(dto: {
    items: Array<{ fileName: string; fileUrl: string }>;
  }): {
    items: Array<{ name: string; url: string }>;
  } {
    return {
      items: dto.items?.map(item => ({
        name: item.fileName,  // 각 항목마다 매핑
        url: item.fileUrl,
      })) ?? [],
    };
  }
}

/**
 * 예시 7: 타입 변환
 */
export class Example7Adapter {
  // string → number
  static fromResponse(dto: { viewCount: string }): { viewCount: number } {
    return {
      viewCount: parseInt(dto.viewCount, 10),
    };
  }
  
  // number → string
  static toRequest(model: { viewCount: number }): { viewCount: string } {
    return {
      viewCount: model.viewCount.toString(),
    };
  }
}

/**
 * 예시 8: 조건부 변환
 */
export class Example8Adapter {
  // Enum string → boolean
  static fromResponse(dto: {
    status: "ACTIVE" | "INACTIVE";
  }): {
    isPublic: boolean;
  } {
    return {
      isPublic: dto.status === "ACTIVE",
    };
  }
  
  // boolean → Enum string
  static toRequest(model: {
    isPublic: boolean;
  }): {
    status: "ACTIVE" | "INACTIVE";
  } {
    return {
      status: model.isPublic ? "ACTIVE" : "INACTIVE",
    };
  }
}

/**
 * 예시 9: 기본값 제공
 */
export class Example9Adapter {
  static fromResponse(dto: XxxResponseDto): XxxModel {
    return {
      id: dto.id,
      title: dto.title,
      
      // 백엔드 미제공 필드에 기본값
      authorName: "",           // 빈 문자열
      publishedAt: undefined,   // Optional
      viewCount: 0,             // Required, 기본값
      isLocal: true,            // 클라이언트 전용
    };
  }
}

/**
 * 예시 10: 중첩 배열 변환
 */
export class Example10Adapter {
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

// ============================================
// 주의사항
// ============================================

/**
 * 타입별 변환 가이드:
 * 
 * 1. Primitive 타입
 *    - 필드명 매핑만 수행
 *    - Optional 처리: ?? undefined
 * 
 * 2. null vs undefined
 *    - Response: null → undefined
 *    - Request: undefined → null
 * 
 * 3. 관계 객체
 *    - 하위 Adapter 메서드 호출
 *    - null/undefined 체크 필수
 * 
 * 4. 배열
 *    - map() 사용하여 각 항목 변환
 *    - null/빈 배열 처리
 * 
 * 5. 타입 변환
 *    - parseInt(), toString() 등 사용
 *    - 변환 실패 케이스 처리
 */

/**
 * 매핑 규칙 문서화 가이드:
 * 
 * 파일 상단에 명시적으로 매핑 규칙을 주석으로 작성:
 * 
 * 1. 카테고리별 그룹화 (첨부파일, 번역, 카테고리 등)
 * 2. 양방향 화살표 사용 (↔)
 * 3. 실제 필드명 사용
 * 4. 특별한 변환 로직은 별도 설명
 * 
 * 예시:
 * /**
 *  * 필드명 매핑 규칙:
 *  *   - 첨부파일: fileName ↔ name, fileUrl ↔ url
 *  *   - 상태: isActive ↔ isPublic
 *  *   - 타입 변환: viewCount (string → number)
 *  *\/
 */
