/**
 * Backend Service 연동 예시
 * 
 * 이 파일은 Backend Service에서 Adapter를 사용하여
 * DTO → Model 변환을 수행하는 패턴을 보여줍니다.
 * 
 * 위치: app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_services/brochure.service.ts
 */

// ============================================
// Import 예시
// ============================================

// Adapter (DTO ↔ Model 변환)
import { BrochureAdapter } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter";

// DTO 타입 (Backend 도메인)
import type {
  CreateBrochureCategoryDto,
  UpdateBrochureCategoryDto,
  BrochureCategoryResponseDto,
  BrochureCategoryListResponseDto,
} from "@/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.dto";

// Model 타입 (Frontend 도메인)
import type {
  BrochureCategoryModel,
  BrochureCategoryListModel,
} from "../_types/brochure.model";

// Service Response 타입
import type { ServiceResponse } from "@/app/api/_backend/types/service-response";

// ============================================
// Backend Service 구현
// ============================================

/**
 * BrochureService
 * 
 * Backend API와 통신하는 서비스 계층
 * - DTO로 API 호출
 * - Adapter로 DTO → Model 변환
 * - ServiceResponse<Model> 반환
 */
export class BrochureService {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string, token: string | null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * HTTP 헤더 생성
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = this.token;
    }

    return headers;
  }

  /**
   * API 호출 공통 에러 처리
   */
  private async handleApiCall<T>(
    apiCall: () => Promise<T>,
    errorMessage: string
  ): Promise<ServiceResponse<T>> {
    try {
      const data = await apiCall();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(errorMessage, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : errorMessage,
      };
    }
  }

  // ============================================
  // GET: 목록 조회
  // ============================================

  /**
   * Category 목록 조회
   * 
   * 데이터 흐름:
   *   1. Backend API 호출
   *   2. Response DTO 수신
   *   3. Adapter로 DTO → Model 변환
   *   4. ServiceResponse<Model> 반환
   */
  async getCategories(): Promise<ServiceResponse<BrochureCategoryListModel>> {
    return this.handleApiCall(async () => {
      // ✅ 1. Backend API 호출
      const response = await fetch(
        `${this.baseUrl}/brochure/categories`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // ✅ 2. Response DTO 수신
      const result = await response.json();

      // 응답 로그 (디버깅용)
      console.log("API Response (DTO):", result);

      // ✅ 3. Adapter로 DTO → Model 변환
      const model = BrochureAdapter.fromCategoryListResponse(
        result as BrochureCategoryListResponseDto
      );

      // 변환 로그 (디버깅용)
      console.log("DTO → Model 변환:", {
        dto: result,
        model: model,
      });

      // ✅ 4. Model 반환
      return model;
    }, "카테고리 목록 조회 중 오류가 발생했습니다.");
  }

  /**
   * Category 단일 조회
   */
  async getCategory(
    categoryId: string
  ): Promise<ServiceResponse<BrochureCategoryModel>> {
    return this.handleApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}/brochure/categories/${categoryId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      // ✅ Adapter로 변환
      return BrochureAdapter.fromCategoryResponse(
        result as BrochureCategoryResponseDto
      );
    }, "카테고리 조회 중 오류가 발생했습니다.");
  }

  // ============================================
  // POST: 생성
  // ============================================

  /**
   * Category 생성
   * 
   * 데이터 흐름:
   *   1. DTO 수신 (API Handler에서 변환됨)
   *   2. Backend API 호출 (DTO 전송)
   *   3. Response DTO 수신
   *   4. Adapter로 DTO → Model 변환
   *   5. ServiceResponse<Model> 반환
   */
  async createCategory(
    dto: CreateBrochureCategoryDto
  ): Promise<ServiceResponse<BrochureCategoryModel>> {
    return this.handleApiCall(async () => {
      // DTO 로그 (디버깅용)
      console.log("Creating category with DTO:", dto);

      // ✅ 1. Backend API 호출 (DTO 전송)
      const response = await fetch(
        `${this.baseUrl}/brochure/categories`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(dto),  // ✅ DTO 직렬화
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status}`
        );
      }

      // ✅ 2. Response DTO 수신
      const result = await response.json();

      // 응답 로그 (디버깅용)
      console.log("API Response (DTO):", result);

      // ✅ 3. Adapter로 DTO → Model 변환
      const model = BrochureAdapter.fromCategoryResponse(
        result as BrochureCategoryResponseDto
      );

      // 필드명 매핑 로그 (디버깅용)
      console.log("필드명 매핑 확인:", {
        dto_isActive: result.isActive,
        model_isPublic: model.isPublic,
        mapped: result.isActive === model.isPublic,
      });

      // ✅ 4. Model 반환
      return model;
    }, "카테고리 생성 중 오류가 발생했습니다.");
  }

  // ============================================
  // PUT: 수정
  // ============================================

  /**
   * Category 수정
   * 
   * 데이터 흐름:
   *   1. DTO 수신 (API Handler에서 변환됨)
   *   2. Backend API 호출 (DTO 전송)
   *   3. Response DTO 수신
   *   4. Adapter로 DTO → Model 변환
   *   5. ServiceResponse<Model> 반환
   */
  async updateCategory(
    categoryId: string,
    dto: UpdateBrochureCategoryDto
  ): Promise<ServiceResponse<BrochureCategoryModel>> {
    return this.handleApiCall(async () => {
      // DTO 로그 (디버깅용)
      console.log("Updating category with DTO:", {
        categoryId,
        dto,
      });

      // ✅ 1. Backend API 호출 (DTO 전송)
      const response = await fetch(
        `${this.baseUrl}/brochure/categories/${categoryId}`,
        {
          method: "PUT",
          headers: this.getHeaders(),
          body: JSON.stringify(dto),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // ✅ 2. Response DTO 수신
      const result = await response.json();

      // ✅ 3. Adapter로 DTO → Model 변환
      return BrochureAdapter.fromCategoryResponse(
        result as BrochureCategoryResponseDto
      );
    }, "카테고리 수정 중 오류가 발생했습니다.");
  }

  // ============================================
  // DELETE: 삭제
  // ============================================

  /**
   * Category 삭제
   * 
   * 데이터 흐름:
   *   1. Backend API 호출 (ID만 전달)
   *   2. 성공 응답 수신
   *   3. ServiceResponse 반환 (Adapter 불필요)
   */
  async deleteCategory(
    categoryId: string
  ): Promise<ServiceResponse<void>> {
    return this.handleApiCall(async () => {
      // ✅ Backend API 호출
      const response = await fetch(
        `${this.baseUrl}/brochure/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // 삭제는 반환값 없음
      return;
    }, "카테고리 삭제 중 오류가 발생했습니다.");
  }

  // ============================================
  // PATCH: 부분 수정
  // ============================================

  /**
   * Category 순서 변경
   * 
   * 데이터 흐름:
   *   1. 요청 데이터 수신
   *   2. Backend API 호출
   *   3. Response DTO 수신
   *   4. Adapter로 변환
   *   5. Model 반환
   */
  async updateCategoryOrder(
    categoryId: string,
    data: { order: number; updatedBy?: string }
  ): Promise<ServiceResponse<BrochureCategoryModel>> {
    return this.handleApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}/brochure/categories/${categoryId}/order`,
        {
          method: "PATCH",
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      // ✅ Adapter로 변환
      return BrochureAdapter.fromCategoryResponse(
        result as BrochureCategoryResponseDto
      );
    }, "순서 변경 중 오류가 발생했습니다.");
  }
}

// ============================================
// 고급 패턴: 요청 인터셉터
// ============================================

/**
 * 요청 전처리 (로깅, 인증 등)
 */
class BrochureServiceWithInterceptor extends BrochureService {
  private logRequest(method: string, url: string, body?: unknown) {
    console.log(`[API Request] ${method} ${url}`, {
      timestamp: new Date().toISOString(),
      body,
    });
  }

  private logResponse(method: string, url: string, response: unknown) {
    console.log(`[API Response] ${method} ${url}`, {
      timestamp: new Date().toISOString(),
      response,
    });
  }

  /**
   * 인터셉터가 적용된 createCategory
   */
  async createCategory(
    dto: CreateBrochureCategoryDto
  ): Promise<ServiceResponse<BrochureCategoryModel>> {
    const url = `${this.baseUrl}/brochure/categories`;
    
    // ✅ 요청 로깅
    this.logRequest("POST", url, dto);

    const result = await super.createCategory(dto);

    // ✅ 응답 로깅
    if (result.success) {
      this.logResponse("POST", url, result.data);
    }

    return result;
  }
}

// ============================================
// 고급 패턴: 재시도 로직
// ============================================

/**
 * 재시도 로직이 적용된 Service
 */
class BrochureServiceWithRetry extends BrochureService {
  private maxRetries = 3;
  private retryDelay = 1000; // 1초

  /**
   * 재시도 로직
   */
  private async retry<T>(
    fn: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retry(fn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * 재시도가 적용된 getCategories
   */
  async getCategories(): Promise<ServiceResponse<BrochureCategoryListModel>> {
    return this.handleApiCall(async () => {
      // ✅ 재시도 로직 적용
      return this.retry(async () => {
        const response = await fetch(
          `${this.baseUrl}/brochure/categories`,
          {
            method: "GET",
            headers: this.getHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        return BrochureAdapter.fromCategoryListResponse(
          result as BrochureCategoryListResponseDto
        );
      });
    }, "카테고리 목록 조회 중 오류가 발생했습니다.");
  }
}

// ============================================
// 고급 패턴: 캐싱
// ============================================

/**
 * 캐싱이 적용된 Service
 */
class BrochureServiceWithCache extends BrochureService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5분

  /**
   * 캐시 확인
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * 캐시 저장
   */
  private setCachedData(key: string, data: unknown) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 캐싱이 적용된 getCategories
   */
  async getCategories(): Promise<ServiceResponse<BrochureCategoryListModel>> {
    const cacheKey = "categories";

    // ✅ 캐시 확인
    const cached = this.getCachedData<BrochureCategoryListModel>(cacheKey);
    if (cached) {
      console.log("캐시에서 데이터 반환");
      return {
        success: true,
        data: cached,
      };
    }

    // ✅ API 호출
    const result = await super.getCategories();

    // ✅ 캐시 저장
    if (result.success && result.data) {
      this.setCachedData(cacheKey, result.data);
    }

    return result;
  }
}

// ============================================
// 핵심 원칙 요약
// ============================================

/**
 * Backend Service 핵심 원칙:
 * 
 * 1. **DTO 사용**:
 *    - API 호출 시 DTO만 사용
 *    - Model은 사용하지 않음
 * 
 * 2. **Adapter 사용** (내부):
 *    - Response DTO → Model 변환
 *    - from...Response 메서드 호출
 * 
 * 3. **ServiceResponse 반환**:
 *    - success, data, error 구조
 *    - Model 타입으로 반환
 * 
 * 4. **에러 처리**:
 *    - handleApiCall 유틸리티 사용
 *    - try-catch로 예외 처리
 *    - 사용자 친화적 에러 메시지
 * 
 * 5. **로깅**:
 *    - 요청/응답 로깅 (디버깅용)
 *    - 필드명 매핑 확인 로그
 *    - 타입 변환 로그
 * 
 * 6. **확장성**:
 *    - 인터셉터 패턴
 *    - 재시도 로직
 *    - 캐싱 전략
 */
