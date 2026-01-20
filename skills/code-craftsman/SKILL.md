---
name: code-craftsman
description: 코드 작업 전문 스킬. 구현, 리팩토링, 오류수정, 디버깅, 마이그레이션, 패턴 적용을 체계적으로 수행합니다. 사용 시점: (1) 새 기능 구현, (2) 코드 리팩토링 및 품질 개선, (3) 버그 수정 및 디버깅, (4) 레거시 코드 마이그레이션, (5) 디자인 패턴 적용, (6) 기술 부채 해결이 필요할 때.
---

# Code Craftsman

코드 작업을 체계적으로 수행하는 전문 스킬입니다.

## 작업 유형 선택

| 유형 | 트리거 | 참조 파일 |
|------|--------|-----------|
| **구현** | 새 기능, API, 컴포넌트 생성 | [implementation.md](references/implementation.md) |
| **리팩토링** | 코드 품질 개선, 구조 변경 | [refactoring.md](references/refactoring.md) |
| **디버깅** | 버그 수정, 오류 분석 | [debugging.md](references/debugging.md) |
| **마이그레이션** | 버전 업그레이드, 기술 스택 변경 | [migration.md](references/migration.md) |
| **패턴** | 디자인 패턴 적용, 아키텍처 개선 | [patterns.md](references/patterns.md) |

## 핵심 워크플로우

### 1. 분석 (Analyze)

```
1. 작업 범위 파악 → Grep/Glob으로 관련 파일 탐색
2. 의존성 분석 → 영향받는 모듈 식별
3. 복잡도 평가 → 단순/중간/복잡 분류
```

**복잡도별 접근:**
- **단순**: 직접 수정, TodoWrite 생략 가능
- **중간**: TodoWrite로 작업 추적
- **복잡**: Task 도구로 하위 작업 위임

### 2. 계획 (Plan)

```
복잡 작업 시 TodoWrite 활용:

Epic (대목표)
└── Story (기능 단위)
    └── Task (실행 단위)
        └── Subtask (세부 작업)
```

### 3. 실행 (Execute)

**안전한 수정 원칙:**
1. 수정 전 Read로 현재 상태 확인
2. StrReplace로 정확한 위치 수정
3. 수정 후 ReadLints로 오류 검증
4. 테스트 실행으로 기능 검증

### 4. 검증 (Validate)

```
- [ ] 린터 오류 없음
- [ ] 기존 테스트 통과
- [ ] 타입 검사 통과
- [ ] 의도한 동작 확인
```

## 페르소나 활성화

작업 유형에 따라 적절한 전문성 적용:

| 페르소나 | 전문 영역 | 활성화 시점 |
|----------|-----------|-------------|
| **Architect** | 구조 설계, 모듈 분리 | 대규모 리팩토링, 패턴 적용 |
| **Backend** | API, DB, 서버 로직 | 서버 구현, 데이터 처리 |
| **Frontend** | UI, 상태 관리, UX | 컴포넌트 구현, 인터랙션 |
| **Security** | 보안 취약점, 인증 | 보안 검토, 인증 구현 |
| **Performance** | 최적화, 병목 분석 | 성능 개선, 메모리 관리 |
| **Quality** | 코드 품질, 테스트 | 리팩토링, 테스트 작성 |

## MCP 통합

### Sequential MCP (복잡한 분석)
- 다단계 작업 분석 및 계획
- 의존성 체인 추적
- 영향 범위 평가

### Context7 MCP (프레임워크 패턴)
- React, Vue, Next.js 등 프레임워크별 베스트 프랙티스
- 라이브러리 API 참조
- 버전별 마이그레이션 가이드

### Serena MCP (심볼 기반 편집)
- 클래스/함수 단위 정밀 수정
- 참조 관계 추적
- 안전한 리네이밍

## 작업별 빠른 참조

### 구현 시
```
1. 요구사항 분석 → 인터페이스 설계
2. 스켈레톤 코드 생성
3. 핵심 로직 구현
4. 엣지 케이스 처리
5. 테스트 작성
```
상세: [implementation.md](references/implementation.md)

### 리팩토링 시
```
1. 코드 스멜 식별 (중복, 복잡도, 결합도)
2. 리팩토링 전략 선택
3. 점진적 수정 (작은 단위)
4. 각 단계 후 테스트 실행
```
상세: [refactoring.md](references/refactoring.md)

### 디버깅 시
```
1. 증상 수집 → 재현 조건 확인
2. 가설 수립 → 원인 범위 좁히기
3. 로그/브레이크포인트로 검증
4. 수정 → 회귀 테스트
```
상세: [debugging.md](references/debugging.md)

### 마이그레이션 시
```
1. 현재 상태 스냅샷
2. 호환성 체크리스트 작성
3. 점진적 마이그레이션 (기능별)
4. 롤백 계획 준비
```
상세: [migration.md](references/migration.md)

### 패턴 적용 시
```
1. 문제 패턴 식별
2. 적합한 디자인 패턴 선택
3. 점진적 리팩토링으로 적용
4. 패턴 문서화
```
상세: [patterns.md](references/patterns.md)

## 품질 게이트

모든 작업 완료 전 확인:

```
필수:
- [ ] 컴파일/빌드 성공
- [ ] 린터 오류 없음
- [ ] 기존 테스트 통과

권장:
- [ ] 새 코드 테스트 커버리지
- [ ] 코드 리뷰 가능 상태
- [ ] 문서화 (복잡한 로직)
```

## 참조 파일

| 파일 | 내용 | 언제 읽을까 |
|------|------|-------------|
| [implementation.md](references/implementation.md) | 구현 패턴, 체크리스트 | 새 기능 구현 시 |
| [refactoring.md](references/refactoring.md) | 리팩토링 기법, 코드 스멜 | 코드 품질 개선 시 |
| [debugging.md](references/debugging.md) | 디버깅 전략, 도구 | 버그 수정 시 |
| [migration.md](references/migration.md) | 마이그레이션 전략 | 기술 스택 변경 시 |
| [patterns.md](references/patterns.md) | 디자인 패턴 카탈로그 | 아키텍처 개선 시 |
