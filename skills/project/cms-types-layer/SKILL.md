---
name: cms-types-layer
description: Guide for implementing Model, Presenter, and Mapper patterns in CMS _types folder. Use when creating or modifying _types files (*.model.ts, *-request.presenter.ts, *-response.presenter.ts), defining Model interfaces, writing Presenter classes with factory methods and UI helpers, implementing Mapper conversion logic, working with CRUD patterns (Read/Create/Update/Delete), organizing domain types (brochure, IR, electronic-notice, news, story, etc.), or questions about Model/Presenter/Mapper architecture, naming conventions, file structure, or type conversion patterns.
---

# CMS Types Layer Pattern

## Overview

이 스킬은 CMS 도메인(브로슈어, IR, 전자공시, 뉴스 등)의 `_types` 폴더 작업을 위한 완전한 가이드를 제공합니다. Model/Presenter/Mapper 패턴의 파일 구조, 네이밍 컨벤션, 클래스 작성 방법, 변환 로직을 다룹니다.

**주요 개념:**
- **Model**: 비즈니스 로직용 데이터 인터페이스 (CRUD별 분리)
- **Presenter**: UI 계층용 불변 클래스 (팩토리 메서드, UI 헬퍼)
- **Mapper**: Model ↔ Presenter 변환 로직

## File Structure

각 CMS 도메인은 다음과 같은 파일 구조를 따릅니다:

```
{domain}/
├── _types/
│   ├── {domain}.model.ts              # Model 인터페이스 정의
│   ├── {domain}-request.presenter.ts  # 요청용 Presenter 클래스
│   └── {domain}-response.presenter.ts # 응답용 Presenter 클래스
└── _services/
    └── {domain}.mapper.ts             # Model ↔ Presenter 변환
```

**예시:**
```
brochure/
├── _types/
│   ├── brochure.model.ts
│   ├── brochure-request.presenter.ts
│   └── brochure-response.presenter.ts
└── _services/
    └── brochure.mapper.ts
```

## When to Use Each Pattern

### Model 정의 (`{domain}.model.ts`)
- 백엔드 DTO와 독립적인 프론트엔드 데이터 구조 정의
- CRUD 작업별 Model 인터페이스 분리 (Read, Create, Update)
- 응답 Model과 요청 Model을 섹션으로 구분

### Presenter 클래스 (`*-presenter.ts`)
- UI 계층에서 사용하는 불변 데이터 객체
- 팩토리 메서드 (`create()`, `createEmpty()`)
- 불변성 패턴 (`copyWith()`)
- UI 헬퍼 메서드 (`display~()`, `get~()`, `has~()`)

### Mapper (`{domain}.mapper.ts`)
- Model ↔ Presenter 양방향 변환
- CRUD 작업별 변환 메서드
- 네이밍 컨벤션 준수

## Quick Start

### 1. Model 작성부터 시작

[references/model-pattern.md](references/model-pattern.md)를 참조하여:
- 응답 Model 정의 (하위 엔티티 → 상위 엔티티 순서)
- 요청 Model 정의 (Query/Command 분류)

### 2. Response Presenter 작성

[references/presenter-pattern.md](references/presenter-pattern.md)를 참조하여:
- 하위 엔티티 Presenter부터 작성
- 메인 엔티티 Presenter 작성
- 목록 Presenter 작성

### 3. Request Presenter 작성

[references/presenter-pattern.md](references/presenter-pattern.md)를 참조하여:
- 조회 파라미터 Presenter 작성
- FormData Presenter 작성 (생성/수정)
- 유효성 검증 메서드 추가

### 4. Mapper 작성

[references/mapper-pattern.md](references/mapper-pattern.md)를 참조하여:
- Model → Presenter 변환 (`to~Presenter`)
- Presenter → Model 변환 (`from~Presenter`)
- 하위 엔티티 변환 메서드 포함

## Core Principles

### 1. 계층 분리
- **Model**: 비즈니스 로직과 데이터 구조 (interface)
- **Presenter**: UI 표현과 불변성 (class)
- **Mapper**: 계층 간 변환 로직 (static methods)

### 2. 네이밍 컨벤션
프로젝트의 [`naming-convention.mdc`](../../../../../../.cursor/rules/naming-convention.mdc) 규칙을 준수:
- 파일: `{domain}.model.ts`, `{domain}-request.presenter.ts`
- 클래스: `{Domain}Presenter`, `{Domain}Model`
- 메서드: `to{CRUD}{Domain}Presenter`, `from{CRUD}{Domain}Presenter`

### 3. Temporal API 사용
프로젝트의 [`temporal-api.mdc`](../../../../../../.cursor/rules/temporal-api.mdc) 규칙을 준수:
- 타임스탬프: `nowISOString()`
- ID 생성: `generateId("prefix")`
- Date API 사용 금지

### 4. 불변성 패턴
모든 Presenter 클래스는:
- `readonly` 필드 사용
- `private constructor`
- `static create()` 팩토리 메서드
- `copyWith()` 메서드로 부분 업데이트

## Detailed Guides

### Model 정의 패턴
자세한 내용은 [references/model-pattern.md](references/model-pattern.md) 참조:
- 응답 Model 구조 (Attachment, Translation, Category, Main Entity, Page)
- 요청 Model 구조 (Query, Command)
- 네이밍 규칙과 타입 정의

### Presenter 클래스 패턴
자세한 내용은 [references/presenter-pattern.md](references/presenter-pattern.md) 참조:
- 필수 구성요소 (constructor, create, createEmpty, copyWith)
- UI 헬퍼 메서드 작성법
- Request vs Response Presenter 차이점
- 유효성 검증 패턴

### Mapper 변환 패턴
자세한 내용은 [references/mapper-pattern.md](references/mapper-pattern.md) 참조:
- 네이밍 컨벤션 (`to~` vs `from~`)
- CRUD별 변환 메서드
- 하위 엔티티 변환
- FormData 변환 로직

## Common Patterns

### 새 도메인 추가 시
1. `{domain}.model.ts` 생성 및 Model 인터페이스 정의
2. `{domain}-response.presenter.ts` 생성 및 응답 Presenter 작성
3. `{domain}-request.presenter.ts` 생성 및 요청 Presenter 작성
4. `{domain}.mapper.ts` 생성 및 변환 로직 작성

### 기존 도메인 수정 시
1. Model 필드 변경
2. 해당 Presenter 클래스 업데이트
3. Mapper 변환 로직 확인 및 수정
4. 타입 체크 (TypeScript 에러 확인)

### 하위 엔티티 추가 시
1. Model 인터페이스 정의 (하위 엔티티)
2. Presenter 클래스 작성 (하위 엔티티)
3. 상위 엔티티에 관계 필드 추가
4. Mapper에 하위 엔티티 변환 메서드 추가

## Checklist

새 _types 작업 시 확인 사항:

- [ ] Model 파일명이 `{domain}.model.ts` 형식인가?
- [ ] Presenter 파일명이 `-request.presenter.ts`, `-response.presenter.ts` 형식인가?
- [ ] Mapper 파일이 `_services/{domain}.mapper.ts`에 위치하는가?
- [ ] 모든 Presenter 클래스가 `create()`, `createEmpty()`, `copyWith()` 메서드를 가지는가?
- [ ] Mapper 메서드가 `to~Presenter` 또는 `from~Presenter` 네이밍을 따르는가?
- [ ] 타임스탬프 생성 시 `nowISOString()`을 사용하는가?
- [ ] 모든 필드가 `readonly`로 선언되었는가?
- [ ] UI 헬퍼 메서드가 필요한 곳에 구현되었는가?

## References

세부 가이드는 다음 파일을 참조하세요:

1. **[Model Pattern](references/model-pattern.md)**: Model 인터페이스 정의 가이드
2. **[Presenter Pattern](references/presenter-pattern.md)**: Presenter 클래스 작성 가이드
3. **[Mapper Pattern](references/mapper-pattern.md)**: Mapper 변환 로직 가이드

## Related Skills

- **[Frontend Design Pattern](../frontend-design-pattern/SKILL.md)**: 전체 프론트엔드 계층 구조
- **[Backend API Pattern](../backend-api-pattern/SKILL.md)**: 백엔드 API 통신 패턴
- **[Adapter Design Pattern](../adapter-design-pattern/SKILL.md)**: DTO ↔ Model 변환 패턴
