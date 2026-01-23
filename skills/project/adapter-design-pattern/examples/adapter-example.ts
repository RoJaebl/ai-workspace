/**
 * Adapter 구현 예시
 * 
 * 이 파일은 Adapter 패턴의 완전한 구현 예시를 제공합니다.
 * Backend API 도메인(DTO)과 Frontend 도메인(Model) 간의 변환을 수행합니다.
 */

// ============================================
// DTO 정의 (Backend API 응답/요청)
// ============================================

interface BrochureResponseDto {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;  // Backend 필드명
  categoryId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

interface BrochureListResponseDto {
  items: BrochureResponseDto[];
  total: number;
}

interface BrochurePageResponseDto {
  items: BrochureResponseDto[];
  page: number;
  limit: number;  // Backend 필드명
  total: number;
}

interface CreateBrochureDto {
  title: string;
  description?: string;
  categoryId?: string;
  order: number;
  createdBy?: string;
}

interface UpdateBrochureDto {
  title: string;
  description?: string;
  isActive?: boolean;  // Backend 필드명
  categoryId?: string;
  order?: number;
  updatedBy?: string;
}

interface BrochureCategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;  // Backend 필드명
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateBrochureCategoryDto {
  name: string;
  description?: string;
  order: number;
  createdBy?: string;
}

// ============================================
// Model 정의 (Frontend 도메인)
// ============================================

type DocumentCode = "brochure" | "ir" | "news";

interface BrochureModel {
  id: string;
  code: Extract<DocumentCode, "brochure">;
  title: string;
  content?: string;  // Frontend 필드명
  isPublic: boolean;  // Frontend 필드명
  categoryId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

interface CreateBrochureModel {
  code: Extract<DocumentCode, "brochure">;
  title: string;
  content?: string;
  categoryId?: string;
  order: number;
  createdBy?: string;
}

interface UpdateBrochureModel {
  title?: string;
  content?: string;
  isPublic?: boolean;
  categoryId?: string;
  order?: number;
  updatedBy?: string;
}

interface BrochureListModel {
  items: BrochureModel[];
  total: number;
}

interface BrochurePageModel {
  items: BrochureModel[];
  pagination: {
    page: number;
    size: number;  // Frontend 필드명
    total: number;
    totalPages: number;
  };
}

interface BrochureCategoryModel {
  id: string;
  code: Extract<DocumentCode, "brochure">;
  name: string;
  description?: string;
  isPublic: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateBrochureCategoryModel {
  code: Extract<DocumentCode, "brochure">;
  name: string;
  description?: string;
  order: number;
  createdBy?: string;
}

// ============================================
// Adapter 구현
// ============================================

/**
 * BrochureAdapter
 * 
 * Backend API 도메인(DTO)과 Frontend 도메인(Model) 간의 변환 계층
 * 
 * 필드명 매핑:
 *   Frontend Model       Backend DTO       변환 방향
 *   ---------------      -----------       ---------
 *   - isPublic       ↔   isActive          양방향
 *   - content        ↔   description       양방향
 *   - size (페이지)  →   limit             요청 시
 *   - code           -   (없음)            Frontend 전용
 * 
 * 조건부 매핑:
 *   - null → undefined 변환
 *   - optional → required 변환 (기본값 설정)
 *   - 배열: null/undefined → []
 */
export class BrochureAdapter {
  // ============================================
  // Response 변환: DTO → Model
  // ============================================
  
  /**
   * Brochure 응답 변환
   * 
   * @param dto - Backend API 응답 DTO
   * @returns Frontend Model
   * 
   * 필드명 매핑:
   *   - isActive → isPublic
   *   - description → content
   */
  static fromBrochureResponse(
    dto: BrochureResponseDto
  ): BrochureModel {
    return {
      id: dto.id,
      code: "brochure",  // ✅ 고정값 (Frontend 전용)
      title: dto.title,
      content: dto.description ?? undefined,  // ✅ 필드명 매핑 + null 처리
      isPublic: dto.isActive,  // ✅ 필드명 매핑
      categoryId: dto.categoryId ?? undefined,
      order: dto.order,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      createdBy: dto.createdBy ?? undefined,
      updatedBy: dto.updatedBy ?? undefined,
    };
  }

  /**
   * Brochure 목록 응답 변환
   * 
   * @param dto - Backend API 목록 응답 DTO
   * @returns Frontend 목록 Model
   */
  static fromBrochureListResponse(
    dto: BrochureListResponseDto
  ): BrochureListModel {
    return {
      items: dto.items.map(item => this.fromBrochureResponse(item)),
      total: dto.total,
    };
  }

  /**
   * Brochure 페이지 응답 변환
   * 
   * @param dto - Backend API 페이지 응답 DTO
   * @returns Frontend 페이지 Model
   * 
   * 필드명 매핑:
   *   - limit → size
   */
  static fromBrochurePageResponse(
    dto: BrochurePageResponseDto
  ): BrochurePageModel {
    return {
      items: dto.items.map(item => this.fromBrochureResponse(item)),
      pagination: {
        page: dto.page,
        size: dto.limit,  // ✅ 필드명 매핑: limit → size
        total: dto.total,
        totalPages: Math.ceil(dto.total / dto.limit),
      },
    };
  }

  /**
   * Category 응답 변환
   * 
   * @param dto - Backend API Category 응답 DTO
   * @returns Frontend Category Model
   * 
   * 필드명 매핑:
   *   - isActive → isPublic
   */
  static fromCategoryResponse(
    dto: BrochureCategoryResponseDto
  ): BrochureCategoryModel {
    return {
      id: dto.id,
      code: "brochure",  // ✅ 고정값
      name: dto.name,
      description: dto.description ?? undefined,
      isPublic: dto.isActive,  // ✅ 필드명 매핑
      order: dto.order,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  // ============================================
  // Request 변환: Model → DTO
  // ============================================
  
  /**
   * Brochure 생성 요청 변환
   * 
   * @param model - Frontend 생성 요청 Model
   * @returns Backend API 생성 요청 DTO
   * 
   * 제외 필드:
   *   - id, createdAt, updatedAt (서버에서 생성)
   *   - code (Frontend 전용, 백엔드 미사용)
   * 
   * 필드명 매핑:
   *   - content → description
   */
  static toCreateBrochureRequest(
    model: CreateBrochureModel
  ): CreateBrochureDto {
    return {
      title: model.title,
      description: model.content,  // ✅ 필드명 매핑
      categoryId: model.categoryId,
      order: model.order,
      createdBy: model.createdBy,
      // code 필드 제외 (백엔드 미사용)
    };
  }

  /**
   * Brochure 수정 요청 변환
   * 
   * @param model - Frontend 수정 요청 Model
   * @returns Backend API 수정 요청 DTO
   * 
   * 필드명 매핑:
   *   - content → description
   *   - isPublic → isActive
   */
  static toUpdateBrochureRequest(
    model: UpdateBrochureModel
  ): UpdateBrochureDto {
    return {
      title: model.title || "",  // ✅ optional → required (기본값)
      description: model.content,  // ✅ 필드명 매핑
      isActive: model.isPublic ?? true,  // ✅ 필드명 매핑 + 기본값
      categoryId: model.categoryId,
      order: model.order,
      updatedBy: model.updatedBy,
    };
  }

  /**
   * Category 생성 요청 변환
   * 
   * @param model - Frontend Category 생성 요청 Model
   * @returns Backend API Category 생성 요청 DTO
   */
  static toCreateCategoryRequest(
    model: CreateBrochureCategoryModel
  ): CreateBrochureCategoryDto {
    return {
      name: model.name,
      description: model.description,
      order: model.order,
      createdBy: model.createdBy,
      // code 필드 제외 (백엔드 미사용)
    };
  }
}

// ============================================
// 사용 예시
// ============================================

/**
 * 예시 1: Response 변환 (DTO → Model)
 */
function exampleResponseConversion() {
  // Backend API 응답 시뮬레이션
  const dto: BrochureResponseDto = {
    id: "brochure-1",
    title: "회사 소개서",
    description: "2024년 회사 소개서입니다.",
    isActive: true,  // Backend 필드명
    categoryId: "cat-1",
    order: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "user-1",
    updatedBy: "user-1",
  };

  // ✅ Adapter로 변환
  const model = BrochureAdapter.fromBrochureResponse(dto);

  console.log("Model:", model);
  // {
  //   id: "brochure-1",
  //   code: "brochure",
  //   title: "회사 소개서",
  //   content: "2024년 회사 소개서입니다.",  // 필드명 변경
  //   isPublic: true,  // 필드명 변경
  //   categoryId: "cat-1",
  //   order: 1,
  //   createdAt: "2024-01-01T00:00:00Z",
  //   updatedAt: "2024-01-01T00:00:00Z",
  //   createdBy: "user-1",
  //   updatedBy: "user-1",
  // }
}

/**
 * 예시 2: Request 변환 (Model → DTO)
 */
function exampleRequestConversion() {
  // Frontend 생성 요청
  const model: CreateBrochureModel = {
    code: "brochure",
    title: "신규 소개서",
    content: "신규 소개서 내용",  // Frontend 필드명
    order: 2,
    createdBy: "user-1",
  };

  // ✅ Adapter로 변환
  const dto = BrochureAdapter.toCreateBrochureRequest(model);

  console.log("DTO:", dto);
  // {
  //   title: "신규 소개서",
  //   description: "신규 소개서 내용",  // 필드명 변경
  //   order: 2,
  //   createdBy: "user-1",
  // }
}

/**
 * 예시 3: 페이지네이션 응답 변환
 */
function examplePaginationConversion() {
  const dto: BrochurePageResponseDto = {
    items: [
      {
        id: "brochure-1",
        title: "소개서 1",
        description: null,
        isActive: true,
        categoryId: null,
        order: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        createdBy: null,
        updatedBy: null,
      },
    ],
    page: 1,
    limit: 20,  // Backend 필드명
    total: 100,
  };

  // ✅ Adapter로 변환
  const model = BrochureAdapter.fromBrochurePageResponse(dto);

  console.log("Page Model:", model);
  // {
  //   items: [{ ... }],
  //   pagination: {
  //     page: 1,
  //     size: 20,  // 필드명 변경
  //     total: 100,
  //     totalPages: 5,
  //   }
  // }
}

/**
 * 예시 4: null 처리
 */
function exampleNullHandling() {
  const dto: BrochureResponseDto = {
    id: "brochure-1",
    title: "소개서",
    description: null,  // null 값
    isActive: true,
    categoryId: null,  // null 값
    order: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: null,
    updatedBy: null,
  };

  const model = BrochureAdapter.fromBrochureResponse(dto);

  console.log("content:", model.content);  // undefined (null → undefined 변환)
  console.log("categoryId:", model.categoryId);  // undefined
}
