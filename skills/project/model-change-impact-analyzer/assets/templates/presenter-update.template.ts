/**
 * Presenter 필드 추가 템플릿
 * 
 * @description Model에 새 필드를 추가한 후 Presenter를 업데이트하는 템플릿입니다.
 * 
 * 사용법:
 * 1. {newField}, {NewField}, {Type} 등을 실제 값으로 치환
 * 2. Optional 여부에 따라 `?` 추가/제거
 * 3. 필요한 부분만 복사하여 기존 Presenter에 추가
 */

import type { XxxModel } from "./xxx.model";
import { nowISOString } from "@/lib/utils/temporal.util";
import { formatDate } from "@/cms/_utils/date";

/**
 * Xxx 도메인 Presenter
 */
export class XxxPresenter implements XxxModel {
  // ============================================
  // 1. readonly 필드 추가
  // ============================================
  readonly id: string;
  readonly code: string;
  // ... 기존 필드들
  
  // 🔹 여기에 새 필드 추가
  readonly newField: string; // Optional이면: readonly newField?: string;
  // 관계 필드라면: readonly newRelation?: SubPresenter;
  
  // ============================================
  // 2. private constructor 파라미터 추가
  // ============================================
  private constructor(data: {
    id: string;
    code: string;
    // ... 기존 필드들
    
    // 🔹 여기에 새 필드 추가
    newField: string; // Optional이면: newField?: string;
    // 관계 필드라면: newRelation?: SubPresenter;
  }) {
    this.id = data.id;
    this.code = data.code;
    // ... 기존 필드 할당
    
    // 🔹 여기에 새 필드 할당 추가
    this.newField = data.newField;
    // 관계 필드라면: this.newRelation = data.newRelation;
  }

  // ============================================
  // 3. create() 메서드에 파라미터 추가
  // ============================================
  static create(data: {
    id: string;
    code: string;
    // ... 기존 필드들
    
    // 🔹 여기에 새 필드 추가
    newField: string; // Optional이면: newField?: string;
    // 관계 필드라면: newRelation?: SubPresenter;
  }): XxxPresenter {
    return new XxxPresenter({
      id: data.id,
      code: data.code,
      // ... 기존 필드들
      
      // 🔹 여기에 새 필드 전달 추가
      newField: data.newField,
      // 관계 필드라면: newRelation: data.newRelation,
    });
  }

  // ============================================
  // 4. createEmpty()에 기본값 추가 (Required 필드의 경우)
  // ============================================
  static createEmpty(): XxxPresenter {
    return XxxPresenter.create({
      id: "",
      code: "xxx",
      createdAt: nowISOString(),
      updatedAt: nowISOString(),
      // ... 기존 필드 기본값
      
      // 🔹 Required 필드라면 기본값 필수
      newField: "", // 빈 문자열, 0, false 등 적절한 기본값
      
      // 🔹 Optional 필드라면 생략 가능
      // newField: undefined, (또는 아예 작성하지 않음)
    });
  }

  // ============================================
  // 5. copyWith()에 업데이트 로직 추가
  // ============================================
  copyWith(updates: Partial<XxxPresenter>): XxxPresenter {
    return XxxPresenter.create({
      id: updates.id ?? this.id,
      code: updates.code ?? this.code,
      // ... 기존 필드들
      
      // 🔹 여기에 새 필드 업데이트 로직 추가
      newField: updates.newField ?? this.newField,
      
      // 관계 필드라면:
      // newRelation: updates.newRelation ?? this.newRelation,
    });
  }

  // ============================================
  // 6. UI 헬퍼 메서드 추가 (필요시)
  // ============================================
  
  // Static 헬퍼 메서드
  static displayNewField(value?: string): string {
    return value ?? "-";
  }
  
  // 날짜 필드인 경우
  static displayNewDateField(date?: string): string {
    return date ? formatDate(date) : "-";
  }
  
  // Boolean 필드인 경우
  static displayNewBooleanField(value?: boolean): string {
    return value ? "활성" : "비활성";
  }
  
  // 숫자 포맷팅
  static displayNewNumberField(value?: number): string {
    return value !== undefined ? value.toLocaleString() : "-";
  }
  
  // Instance 헬퍼 메서드
  displayNewField(): string {
    return XxxPresenter.displayNewField(this.newField);
  }
  
  displayNewDateField(): string {
    return XxxPresenter.displayNewDateField(this.newField as string);
  }
  
  // ============================================
  // 7. Getter 메서드 추가 (필요시)
  // ============================================
  
  // 관계 필드에서 특정 하위 엔티티를 가져오는 경우
  getSubEntityById(id: string): SubPresenter | undefined {
    return this.subEntities?.find((item) => item.id === id);
  }
  
  // 조건부 값 반환
  getNewFieldOrDefault(): string {
    return this.newField ?? "기본값";
  }
}

// ============================================
// 패턴별 예시
// ============================================

/**
 * 예시 1: Optional 문자열 필드 추가
 */
export class Example1Presenter {
  readonly publishedAt?: string;
  
  private constructor(data: { publishedAt?: string }) {
    this.publishedAt = data.publishedAt;
  }
  
  static create(data: { publishedAt?: string }): Example1Presenter {
    return new Example1Presenter({ publishedAt: data.publishedAt });
  }
  
  static createEmpty(): Example1Presenter {
    return Example1Presenter.create({
      // Optional이므로 생략 가능
    });
  }
  
  copyWith(updates: Partial<Example1Presenter>): Example1Presenter {
    return Example1Presenter.create({
      publishedAt: updates.publishedAt ?? this.publishedAt,
    });
  }
  
  static displayPublishedAt(date?: string): string {
    return date ? formatDate(date) : "미발행";
  }
}

/**
 * 예시 2: Required 숫자 필드 추가
 */
export class Example2Presenter {
  readonly viewCount: number;
  
  private constructor(data: { viewCount: number }) {
    this.viewCount = data.viewCount;
  }
  
  static create(data: { viewCount: number }): Example2Presenter {
    return new Example2Presenter({ viewCount: data.viewCount });
  }
  
  static createEmpty(): Example2Presenter {
    return Example2Presenter.create({
      viewCount: 0, // Required이므로 기본값 필수
    });
  }
  
  copyWith(updates: Partial<Example2Presenter>): Example2Presenter {
    return Example2Presenter.create({
      viewCount: updates.viewCount ?? this.viewCount,
    });
  }
  
  static displayViewCount(count: number): string {
    return count.toLocaleString();
  }
}

/**
 * 예시 3: 중첩 객체 (관계) 필드 추가
 */
export class Example3Presenter {
  readonly category?: CategoryPresenter;
  
  private constructor(data: { category?: CategoryPresenter }) {
    this.category = data.category;
  }
  
  static create(data: { category?: CategoryPresenter }): Example3Presenter {
    return new Example3Presenter({ category: data.category });
  }
  
  static createEmpty(): Example3Presenter {
    return Example3Presenter.create({
      // Optional이므로 생략 가능
    });
  }
  
  copyWith(updates: Partial<Example3Presenter>): Example3Presenter {
    return Example3Presenter.create({
      category: updates.category ?? this.category,
    });
  }
  
  // Getter 메서드
  getCategoryName(): string {
    return this.category?.name ?? "미분류";
  }
  
  hasCategoryId(categoryId: string): boolean {
    return this.category?.id === categoryId;
  }
}

/**
 * 예시 4: 배열 필드 추가
 */
export class Example4Presenter {
  readonly translations?: TranslationPresenter[];
  
  private constructor(data: { translations?: TranslationPresenter[] }) {
    this.translations = data.translations;
  }
  
  static create(data: { translations?: TranslationPresenter[] }): Example4Presenter {
    return new Example4Presenter({ translations: data.translations });
  }
  
  static createEmpty(): Example4Presenter {
    return Example4Presenter.create({
      translations: [], // 빈 배열 또는 undefined
    });
  }
  
  copyWith(updates: Partial<Example4Presenter>): Example4Presenter {
    return Example4Presenter.create({
      translations: updates.translations ?? this.translations,
    });
  }
  
  // 배열 관련 헬퍼 메서드
  getTranslation(languageId: string): TranslationPresenter | undefined {
    return this.translations?.find((t) => t.languageId === languageId);
  }
  
  hasTranslation(languageId: string): boolean {
    return this.translations?.some((t) => t.languageId === languageId) ?? false;
  }
  
  getTranslationCount(): number {
    return this.translations?.length ?? 0;
  }
}

/**
 * 예시 5: Boolean 필드 추가
 */
export class Example5Presenter {
  readonly isPublic: boolean;
  
  private constructor(data: { isPublic: boolean }) {
    this.isPublic = data.isPublic;
  }
  
  static create(data: { isPublic: boolean }): Example5Presenter {
    return new Example5Presenter({ isPublic: data.isPublic });
  }
  
  static createEmpty(): Example5Presenter {
    return Example5Presenter.create({
      isPublic: false, // 기본값 false
    });
  }
  
  copyWith(updates: Partial<Example5Presenter>): Example5Presenter {
    return Example5Presenter.create({
      isPublic: updates.isPublic ?? this.isPublic,
    });
  }
  
  static displayPublicStatus(isPublic: boolean): string {
    return isPublic ? "공개" : "비공개";
  }
  
  displayPublicStatus(): string {
    return Example5Presenter.displayPublicStatus(this.isPublic);
  }
}

// ============================================
// 타입별 기본값 가이드
// ============================================

/**
 * Required 필드의 적절한 기본값:
 * 
 * - string: "" (빈 문자열)
 * - number: 0
 * - boolean: false (또는 true, 비즈니스 로직에 따라)
 * - Date/ISO string: nowISOString()
 * - Array: []
 * - Object: undefined (또는 빈 객체)
 * - Enum: 기본값에 해당하는 enum 값
 */

/**
 * Optional vs Required 결정 가이드:
 * 
 * Optional (field?: Type):
 * - 사용자가 입력하지 않아도 되는 필드
 * - 서버에서 제공하지 않을 수 있는 필드
 * - 조건부로만 존재하는 필드
 * 
 * Required (field: Type):
 * - 항상 존재해야 하는 필드
 * - 기본값이 명확한 필드
 * - 비즈니스 로직에 필수적인 필드
 */
