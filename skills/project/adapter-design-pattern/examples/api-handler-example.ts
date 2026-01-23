/**
 * API Handler 연동 예시
 * 
 * 이 파일은 API Handler(환승역)에서 Adapter를 사용하여
 * Model ↔ DTO 변환을 수행하는 패턴을 보여줍니다.
 * 
 * 위치: api/(cms)/cms/(admin)/homepage/(brochure)/brochure-categories/route.ts
 */

import { NextRequest, NextResponse } from "next/server";

// ============================================
// Import 예시
// ============================================

// Backend Module (DI Container)
import { BrochureModule } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/brochure.module";

// Adapter (Model ↔ DTO 변환)
import { BrochureAdapter } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter";

// Model 타입 (Frontend 도메인)
import type {
  CreateBrochureCategoryModel,
  UpdateBrochureCategoryModel,
  BrochureCategoryModel,
} from "@/app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model";

// DTO 타입 (Backend 도메인) - 필요시에만 import
// import type { CreateBrochureCategoryDto } from "@/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.dto";

// ============================================
// GET: 목록 조회
// ============================================

/**
 * GET /api/cms/admin/homepage/brochure-categories
 * 
 * Category 목록 조회
 * 
 * 데이터 흐름:
 *   1. API Handler가 요청 수신
 *   2. Backend Service 호출 (DTO 없음, 조회만)
 *   3. Backend Service 내부에서 Adapter로 DTO → Model 변환
 *   4. API Handler가 Model 반환
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ 1. 인증 토큰 추출
    const token = request.headers.get("Authorization");

    // ✅ 2. Backend Service 인스턴스 가져오기 (DI)
    const service = BrochureModule.getInstance().getBrochureService(token);

    // ✅ 3. Backend Service 호출
    //     - Service 내부에서 Adapter.fromResponse() 호출
    //     - Model로 변환되어 반환됨
    const result = await service.getCategories();

    // ✅ 4. 에러 처리
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // ✅ 5. Model 반환
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "카테고리 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// ============================================
// POST: 생성
// ============================================

/**
 * POST /api/cms/admin/homepage/brochure-categories
 * 
 * Category 생성
 * 
 * 데이터 흐름:
 *   1. API Handler가 Model 수신
 *   2. Adapter로 Model → DTO 변환
 *   3. Backend Service 호출 (DTO 전달)
 *   4. Backend Service 내부에서 Adapter로 DTO → Model 변환
 *   5. API Handler가 Model 반환
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ 1. 인증 토큰 추출
    const token = request.headers.get("Authorization");

    // ✅ 2. Request Body 파싱 (Model)
    const body: CreateBrochureCategoryModel = await request.json();

    // ✅ 3. Adapter로 Model → DTO 변환 (환승역 역할)
    const dto = BrochureAdapter.toCreateCategoryRequest(body);
    
    // 변환 로그 (디버깅용)
    console.log("Model → DTO 변환:", {
      model: body,
      dto: dto,
    });

    // ✅ 4. Backend Service 호출 (DTO 전달)
    const service = BrochureModule.getInstance().getBrochureService(token);
    const result = await service.createCategory(dto);

    // ✅ 5. 에러 처리
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // ✅ 6. Model 반환 (이미 Service에서 변환됨)
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "카테고리 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}

// ============================================
// PUT: 수정
// ============================================

/**
 * PUT /api/cms/admin/homepage/brochure-categories/[categoryId]
 * 
 * Category 수정
 * 
 * 데이터 흐름:
 *   1. API Handler가 Model 수신
 *   2. Adapter로 Model → DTO 변환
 *   3. Backend Service 호출 (DTO 전달)
 *   4. Backend Service 내부에서 Adapter로 DTO → Model 변환
 *   5. API Handler가 Model 반환
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    // ✅ 1. 인증 토큰 추출
    const token = request.headers.get("Authorization");

    // ✅ 2. 경로 파라미터 추출
    const { categoryId } = params;

    // ✅ 3. Request Body 파싱 (Model)
    const body: UpdateBrochureCategoryModel = await request.json();

    // ✅ 4. Adapter로 Model → DTO 변환
    const dto = BrochureAdapter.toUpdateCategoryRequest(body);
    
    // 변환 로그 (디버깅용)
    console.log("Model → DTO 변환:", {
      categoryId,
      model: body,
      dto: dto,
      fieldMapping: {
        isPublic: body.isPublic,
        isActive: dto.isActive,
      },
    });

    // ✅ 5. Backend Service 호출 (DTO 전달)
    const service = BrochureModule.getInstance().getBrochureService(token);
    const result = await service.updateCategory(categoryId, dto);

    // ✅ 6. 에러 처리
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // ✅ 7. Model 반환
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "카테고리 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE: 삭제
// ============================================

/**
 * DELETE /api/cms/admin/homepage/brochure-categories/[categoryId]
 * 
 * Category 삭제
 * 
 * 데이터 흐름:
 *   1. API Handler가 요청 수신 (ID만)
 *   2. Backend Service 호출 (ID 전달, DTO 변환 불필요)
 *   3. Backend Service 내부에서 삭제 수행
 *   4. API Handler가 성공 응답 반환
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    // ✅ 1. 인증 토큰 추출
    const token = request.headers.get("Authorization");

    // ✅ 2. 경로 파라미터 추출
    const { categoryId } = params;

    // ✅ 3. Backend Service 호출 (ID만 전달, Adapter 불필요)
    const service = BrochureModule.getInstance().getBrochureService(token);
    const result = await service.deleteCategory(categoryId);

    // ✅ 4. 에러 처리
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // ✅ 5. 성공 응답
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "카테고리 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH: 부분 수정 (특정 액션)
// ============================================

/**
 * PATCH /api/cms/admin/homepage/brochure-categories/[categoryId]/order
 * 
 * Category 순서 변경
 * 
 * 데이터 흐름:
 *   1. API Handler가 요청 수신
 *   2. Adapter로 변환 (필요시)
 *   3. Backend Service 호출
 *   4. Model 반환
 */
export async function PATCH_ORDER(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const token = request.headers.get("Authorization");
    const { categoryId } = params;
    
    // ✅ Request Body 파싱
    const body = await request.json();
    const { order, updatedBy } = body;

    // ✅ Adapter 사용 (필요시)
    // - 간단한 경우: Adapter 없이 직접 전달
    // - 복잡한 경우: Adapter로 변환
    
    // 방법 1: 직접 전달 (간단한 경우)
    const service = BrochureModule.getInstance().getBrochureService(token);
    const result = await service.updateCategoryOrder(categoryId, {
      order,
      updatedBy,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating category order:", error);
    return NextResponse.json(
      { error: "순서 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

// ============================================
// 에러 처리 유틸리티
// ============================================

/**
 * 공통 에러 응답 생성
 */
function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * ServiceResponse 에러 처리
 */
function handleServiceError<T>(
  result: { success: boolean; error?: string; data?: T }
): NextResponse | T {
  if (!result.success) {
    throw new Error(result.error || "알 수 없는 오류가 발생했습니다.");
  }
  return result.data as T;
}

// ============================================
// 사용 예시 - 통합 패턴
// ============================================

/**
 * 권장 패턴: 에러 처리 유틸리티 활용
 */
export async function POST_WITH_UTILITY(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    const body: CreateBrochureCategoryModel = await request.json();

    // ✅ Adapter로 변환
    const dto = BrochureAdapter.toCreateCategoryRequest(body);

    // ✅ Service 호출
    const service = BrochureModule.getInstance().getBrochureService(token);
    const result = await service.createCategory(dto);

    // ✅ 에러 처리 (유틸리티 사용)
    const data = handleServiceError(result);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "요청 처리에 실패했습니다."
    );
  }
}

// ============================================
// 핵심 원칙 요약
// ============================================

/**
 * API Handler 핵심 원칙:
 * 
 * 1. **환승역 역할**:
 *    - Model Rail ↔ DTO Rail 변환
 *    - Adapter를 사용해 변환 수행
 * 
 * 2. **요청 변환** (Model → DTO):
 *    - Request Body를 Model로 파싱
 *    - Adapter.to...Request(model) 호출
 *    - DTO를 Backend Service에 전달
 * 
 * 3. **응답 변환** (DTO → Model):
 *    - Backend Service 내부에서 변환
 *    - API Handler는 변환된 Model 수신
 *    - 그대로 반환
 * 
 * 4. **에러 처리**:
 *    - ServiceResponse의 success 체크
 *    - 적절한 HTTP 상태 코드 반환
 *    - 사용자 친화적 에러 메시지
 * 
 * 5. **타입 안정성**:
 *    - Model 타입 명시
 *    - DTO 타입은 Adapter에 위임
 *    - 반환 타입 일관성 유지
 */
