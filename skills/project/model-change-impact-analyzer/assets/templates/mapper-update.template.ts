/**
 * Mapper 필드 추가 템플릿
 * 
 * @description Model에 새 필드를 추가한 후 Mapper를 업데이트하는 템플릿입니다.
 * 
 * 사용법:
 * 1. {newField}, {Type} 등을 실제 값으로 치환
 * 2. Optional 여부에 따라 처리 로직 조정
 * 3. 필요한 부분만 복사하여 기존 Mapper에 추가
 */

import type {
  XxxModel,
  CreateXxxModel,
  UpdateXxxModel,
} from "../_types/xxx.model";
import { XxxPresenter } from "../_types/xxx.presenter";

/**
 * Xxx 도메인 Mapper
 */
export class XxxMapper {
  // ============================================
  // 1. fromModel() - Model → Presenter
  // ============================================
  static fromModel(model: XxxModel): XxxPresenter {
    return XxxPresenter.create({
      id: model.id,
      code: model.code,
      // ... 기존 필드들
      
      // 🔹 여기에 새 필드 변환 추가
      newField: model.newField,
      
      // Optional 필드라면:
      // newField: model.newField ?? undefined,
      
      // 관계 필드라면 (하위 Mapper 호출):
      // newRelation: model.newRelation 
      //   ? this.fromSubModel(model.newRelation)
      //   : undefined,
      
      // 배열 필드라면:
      // newArray: model.newArray
      //   ? this.fromSubModelArray(model.newArray)
      //   : undefined,
    });
  }

  // ============================================
  // 2. toModel() - Presenter → Model
  // ============================================
  static toModel(presenter: XxxPresenter): XxxModel {
    return {
      id: presenter.id,
      code: presenter.code,
      // ... 기존 필드들
      
      // 🔹 여기에 새 필드 역변환 추가
      newField: presenter.newField,
      
      // Optional 필드라면:
      // newField: presenter.newField ?? undefined,
      
      // 관계 필드라면:
      // newRelation: presenter.newRelation
      //   ? this.toSubModel(presenter.newRelation)
      //   : undefined,
      
      // 배열 필드라면:
      // newArray: presenter.newArray
      //   ? this.toSubModelArray(presenter.newArray)
      //   : undefined,
    };
  }

  // ============================================
  // 3. fromModelArray() - 배열 변환
  // ============================================
  // 일반적으로 자동으로 동작하므로 수정 불필요
  static fromModelArray(models: XxxModel[]): XxxPresenter[] {
    return models.map((model) => this.fromModel(model));
  }

  static toModelArray(presenters: XxxPresenter[]): XxxModel[] {
    return presenters.map((presenter) => this.toModel(presenter));
  }

  // ============================================
  // 4. toCreateModel() - Create 요청용
  // ============================================
  // Create 시 필요한 필드만 포함 (id, createdAt, updatedAt 제외)
  static toCreateModel(presenter: XxxPresenter): CreateXxxModel {
    return {
      code: presenter.code,
      // ... 기존 필드들
      
      // 🔹 새 필드가 Create에 필요하면 추가
      newField: presenter.newField,
      
      // Optional이면:
      // newField: presenter.newField ?? undefined,
    };
  }

  // ============================================
  // 5. toUpdateModel() - Update 요청용
  // ============================================
  // Update는 보통 모든 필드가 optional
  static toUpdateModel(presenter: XxxPresenter): UpdateXxxModel {
    return {
      code: presenter.code,
      // ... 기존 필드들
      
      // 🔹 새 필드 추가 (Update는 보통 optional)
      newField: presenter.newField,
    };
  }

  // ============================================
  // 6. 하위 엔티티 변환 메서드 (관계 필드의 경우)
  // ============================================
  
  // 하위 Model → Presenter
  static fromSubModel(model: SubModel): SubPresenter {
    return SubPresenter.create({
      id: model.id,
      // ... 하위 필드들
    });
  }

  // 하위 Presenter → Model
  static toSubModel(presenter: SubPresenter): SubModel {
    return {
      id: presenter.id,
      // ... 하위 필드들
    };
  }

  // 배열 변환
  static fromSubModelArray(models: SubModel[]): SubPresenter[] {
    return models.map((model) => this.fromSubModel(model));
  }

  static toSubModelArray(presenters: SubPresenter[]): SubModel[] {
    return presenters.map((presenter) => this.toSubModel(presenter));
  }
}

// ============================================
// 패턴별 예시
// ============================================

/**
 * 예시 1: Optional 문자열 필드
 */
export class Example1Mapper {
  static fromModel(model: { publishedAt?: string }): any {
    return {
      // Optional 필드는 있는 그대로 전달
      publishedAt: model.publishedAt,
      
      // 또는 명시적으로 undefined 처리
      // publishedAt: model.publishedAt ?? undefined,
    };
  }

  static toModel(presenter: { publishedAt?: string }): any {
    return {
      publishedAt: presenter.publishedAt,
    };
  }
}

/**
 * 예시 2: Required 숫자 필드
 */
export class Example2Mapper {
  static fromModel(model: { viewCount: number }): any {
    return {
      // Required 필드는 그대로 전달
      viewCount: model.viewCount,
    };
  }

  static toModel(presenter: { viewCount: number }): any {
    return {
      viewCount: presenter.viewCount,
    };
  }
}

/**
 * 예시 3: 중첩 객체 (관계) 필드
 */
export class Example3Mapper {
  static fromModel(model: { category?: CategoryModel }): any {
    return {
      // 관계 필드는 하위 Mapper 호출
      category: model.category 
        ? this.fromCategoryModel(model.category)
        : undefined,
    };
  }

  static toModel(presenter: { category?: CategoryPresenter }): any {
    return {
      category: presenter.category
        ? this.toCategoryModel(presenter.category)
        : undefined,
    };
  }

  // 하위 Mapper
  static fromCategoryModel(model: CategoryModel): CategoryPresenter {
    return CategoryPresenter.create({
      id: model.id,
      name: model.name,
    });
  }

  static toCategoryModel(presenter: CategoryPresenter): CategoryModel {
    return {
      id: presenter.id,
      name: presenter.name,
    };
  }
}

/**
 * 예시 4: 배열 필드
 */
export class Example4Mapper {
  static fromModel(model: { translations?: TranslationModel[] }): any {
    return {
      // 배열 필드는 map으로 각 항목 변환
      translations: model.translations
        ? model.translations.map((t) => this.fromTranslationModel(t))
        : undefined,
      
      // 또는 헬퍼 메서드 사용
      // translations: model.translations
      //   ? this.fromTranslationModelArray(model.translations)
      //   : undefined,
    };
  }

  static toModel(presenter: { translations?: TranslationPresenter[] }): any {
    return {
      translations: presenter.translations
        ? presenter.translations.map((t) => this.toTranslationModel(t))
        : undefined,
    };
  }

  static fromTranslationModel(model: TranslationModel): TranslationPresenter {
    return TranslationPresenter.create({
      languageId: model.languageId,
      title: model.title,
    });
  }

  static toTranslationModel(presenter: TranslationPresenter): TranslationModel {
    return {
      languageId: presenter.languageId,
      title: presenter.title,
    };
  }

  // 배열 변환 헬퍼
  static fromTranslationModelArray(
    models: TranslationModel[]
  ): TranslationPresenter[] {
    return models.map((model) => this.fromTranslationModel(model));
  }

  static toTranslationModelArray(
    presenters: TranslationPresenter[]
  ): TranslationModel[] {
    return presenters.map((presenter) => this.toTranslationModel(presenter));
  }
}

/**
 * 예시 5: Boolean 필드
 */
export class Example5Mapper {
  static fromModel(model: { isPublic: boolean }): any {
    return {
      // Boolean은 그대로 전달
      isPublic: model.isPublic,
    };
  }

  static toModel(presenter: { isPublic: boolean }): any {
    return {
      isPublic: presenter.isPublic,
    };
  }
}

/**
 * 예시 6: Enum 필드
 */
export class Example6Mapper {
  static fromModel(model: { status: "active" | "inactive" }): any {
    return {
      // Enum/Union 타입은 그대로 전달
      status: model.status,
    };
  }

  static toModel(presenter: { status: "active" | "inactive" }): any {
    return {
      status: presenter.status,
    };
  }
}

/**
 * 예시 7: 중첩된 배열 (첨부파일 등)
 */
export class Example7Mapper {
  static fromModel(model: {
    translations?: Array<{
      languageId: string;
      attachments?: AttachmentModel[];
    }>;
  }): any {
    return {
      translations: model.translations?.map((t) => ({
        languageId: t.languageId,
        // 중첩된 배열도 변환
        attachments: t.attachments
          ? t.attachments.map((a) => this.fromAttachmentModel(a))
          : undefined,
      })),
    };
  }

  static fromAttachmentModel(model: AttachmentModel): AttachmentPresenter {
    return AttachmentPresenter.create({
      id: model.id,
      name: model.name,
      url: model.url,
    });
  }
}

// ============================================
// 타입별 변환 가이드
// ============================================

/**
 * 타입별 변환 패턴:
 * 
 * 1. Primitive 타입 (string, number, boolean)
 *    - 그대로 전달
 *    - Optional이면 `?? undefined` 처리 (선택)
 * 
 * 2. 관계 객체 (category, author 등)
 *    - 하위 Mapper 호출
 *    - null/undefined 체크 필수
 * 
 * 3. 배열 (translations, attachments 등)
 *    - map() 사용하여 각 항목 변환
 *    - 빈 배열 vs undefined 구분
 * 
 * 4. 날짜 (ISO 8601 string)
 *    - 문자열 그대로 전달
 *    - Date 객체 변환 불필요
 * 
 * 5. Enum/Union 타입
 *    - 타입 캐스팅 필요 시 as 사용
 */

/**
 * 주의사항:
 * 
 * 1. Optional 처리
 *    ❌ 잘못된 예: attachments: model.attachments.map(...)
 *    ✅ 올바른 예: attachments: model.attachments?.map(...) ?? undefined
 * 
 * 2. 중첩 변환
 *    - 하위 Mapper를 먼저 작성
 *    - 순환 참조 주의
 * 
 * 3. Create/Update Model
 *    - Create: id, createdAt, updatedAt 제외
 *    - Update: 모든 필드 optional
 * 
 * 4. 타입 안정성
 *    - any 사용 지양
 *    - 명시적 타입 지정 권장
 */
