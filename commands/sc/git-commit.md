---
name: git-commit
description: "Strategic commit message creation with intelligent analysis and template-based workflow"
category: utility
complexity: standard
mcp-servers: [serena, sequential]
personas: []
---

# /sc:git-commit - Strategic Git Commit Generator

## Triggers

- User requests to create Git commits with strategic message generation
- Need for intelligent commit message analysis and template-based creation
- Conventional Commits format enforcement requests
- Git history analysis for commit pattern consistency
- Workflow optimization for commit message standards

## Usage

```
/sc:git-commit [--serena] [--sequential] [--think-hard] [--template <type>] [--analyze-history]
```

**Flags:**

- `--serena`: Serena MCP 활성화 (심볼 분석 기반 의미론적 커밋 메시지 생성)
- `--sequential`: Sequential Thinking MCP 활성화 (복잡한 변경사항의 체계적 분석 및 커밋 전략 수립)
- `--think-hard`: Sequential Thinking의 심층 분석 모드 (--sequential과 함께 사용)
- `--template <type>`: 커밋 메시지 템플릿 타입 선택 (feat, fix, docs, refactor, test, chore)
- `--analyze-history`: Git 히스토리 분석 및 패턴 파악

**⚠️ 중요: 한글 커밋 메시지 작성**

이 커맨드는 **모든 커밋 메시지를 한글로 생성**합니다:
- ✅ **타입**: 영문 유지 (feat, fix, docs, refactor, test, chore)
- ✅ **scope**: 한글 작성 (예: `인증`, `결제`, `UI`)
- ✅ **subject**: 한글 작성 (예: `JWT 토큰 갱신 메커니즘 추가`)
- ✅ **body**: 한글 작성 (상세 설명)
- ✅ **footer**: 한글 작성 (이슈 번호 등)

**예시:**
```
feat(인증): JWT 토큰 갱신 메커니즘 추가

토큰 만료 전 자동으로 갱신하여 사용자 경험을 개선합니다.

- JWTHandler 클래스 추가
- AuthService에 refreshToken() 메서드 구현

Fixes #123
```

## Behavioral Flow

1. **Analyze**: Git 상태 및 변경사항 자동 분석
   - **컨텍스트 독립성**: 저장소 상태, 파일 내용, Git 히스토리만을 기반으로 분석 수행
   - **추적된 변경사항만**: `git status`와 `git diff`로 확인 가능한 추적된 파일만 분석
   - Git 상태 확인: `git status --short`, `git diff --stat`
   - 변경된 파일 목록 및 변경 유형 파악
   - 현재 브랜치 및 최근 커밋 히스토리 분석
   - If `--serena`: 심볼 수준 코드 분석 및 영향 평가
   - If `--sequential`: 복잡한 변경사항의 체계적 다단계 분석
     - 대규모 변경사항을 논리적이고 관리 가능한 그룹으로 분해
     - 변경사항 의존성 및 관계 단계별 분석
     - 변경사항 카테고리 및 영향 범위 식별
   - If `--think-hard`: 심층 순차적 추론 적용
     - 다중 컴포넌트 간 복잡한 변경 의존성 분석
     - 다중 파일 변경에 대한 포괄적 영향 평가
     - 기존 브랜치 히스토리와의 통합 지점 평가

2. **Plan**: 커밋 전략 수립
   - 변경사항을 논리적 그룹으로 분류
   - Conventional Commits 타입 결정 (feat, fix, docs, refactor, test, chore)
   - 커밋 메시지 구조 계획 (scope, subject, body, footer)
   - If `--serena`: 프로젝트 메모리 활용하여 커밋 메시지 패턴 일관성 유지
   - If `--sequential`: 체계적 커밋 전략 계획
     - 의존성 관계 기반 커밋 순서 계획
     - 논리적 관계와 영향 범위 기반 변경사항 그룹화
     - 커밋 메시지 요구사항 및 변경사항 분류 사전 검증
   - If `--template`: 선택된 템플릿 타입에 맞는 메시지 구조 적용

3. **Execute**: 커밋 메시지 생성 및 커밋 실행
   - **Windows UTF-8 인코딩**: UTF-8 인코딩이 제대로 설정되었는지 확인 후 실행
   - **추적된 변경사항만**: 커밋 메시지는 추적된 변경사항만 포함 (staged/unstaged 파일)
   - **한글 커밋 메시지 작성**: 모든 커밋 메시지는 **한글로 작성**
     - Conventional Commits 타입은 영문 유지 (feat, fix, docs 등)
     - scope, subject, body, footer는 모두 한글로 작성
     - 예: `feat(인증): JWT 토큰 갱신 메커니즘 추가`
   - Conventional Commits 형식으로 커밋 메시지 생성
   - 커밋 메시지 템플릿 적용 및 커스터마이징
   - 생성된 커밋 메시지 사용자 확인 요청
   - 승인 시 `git add` 및 `git commit` 실행
   - If `--serena`: 심볼 수준 이해를 활용한 정확한 변경사항 분류
   - If `--sequential`: 계획된 순서에 따른 체계적 커밋 실행
     - 논리적 의존성 순서로 변경사항 그룹화
     - 각 커밋의 범위 및 완전성 검증 후 진행
     - 모든 커밋에서 일관된 메시지 형식 및 분류 유지

4. **Validate**: 커밋 메시지 및 변경사항 검증
   - Conventional Commits 형식 규칙 준수 확인
   - 커밋 메시지 길이 및 구조 검증 (제목 50자 이내, 본문 72자 줄바꿈)
   - 변경사항과 커밋 메시지 내용 일치성 확인
   - If `--analyze-history`: 과거 커밋 히스토리와의 일관성 검증
   - If `--serena`: 프로젝트 메모리에 커밋 패턴 저장하여 향후 일관성 유지
   - If `--sequential`: 체계적 검증 수행
     - 논리적 커밋 순서 및 의존성 관계 검증
     - 커밋 메시지 일관성 및 분류 정확성 확인
     - 모든 커밋에서 적절한 변경사항 그룹화 패턴 보장

5. **Report**: 결과 보고 및 다음 단계 안내
   - 생성된 커밋 정보 요약 (해시, 메시지, 변경 파일 수)
   - Git 히스토리 현황 (`git log --oneline -5`)
   - 다음 작업 권장사항 (push, PR 생성 등)
   - If `--serena`: 커밋 패턴을 프로젝트 메모리에 지속 저장
   - If `--sequential`: 상세한 단계별 추론 제공
     - 체계적 분석 과정 및 결정 사항 문서화
     - 포괄적 변경사항 평가 기반 권장사항 제공
     - 기존 워크플로우 표준과의 커밋 전략 일관성 검증

Key behaviors:

- 자동 Git 상태 분석 및 변경사항 파악
- Conventional Commits 형식 자동 적용
- **한글 커밋 메시지 작성**: 모든 커밋 메시지를 한글로 생성 (타입은 영문 유지)
- 커밋 메시지 템플릿 기반 생성
- Git 히스토리 패턴 분석 및 일관성 유지
- 사용자 확인 후 안전한 커밋 실행
- **Windows UTF-8 지원**: Windows 환경에서 한글 지원을 위한 UTF-8 인코딩 보장
- **컨텍스트 독립성**: 저장소 상태, 파일 내용, Git 히스토리만 기반으로 작업
- **추적된 변경사항만**: Git이 추적하는 변경사항만 커밋 메시지에 반영

## MCP Integration

- **Serena MCP** (when `--serena` flag is provided):
  - Git 변경사항(staged/unstaged 파일)의 의미론적 코드 분석
  - 변경된 코드에 대한 심볼 수준 영향 평가
  - 커밋 메시지 패턴 일관성을 위한 프로젝트 메모리 관리
  - 워크플로우 표준을 위한 세션 간 컨텍스트 지속성
  - 정확한 심볼 탐색 및 변경사항 이해를 위한 LSP 기능
  - 의미론적 이해 기반 Conventional Commit 메시지 생성 (한글)

- **Sequential Thinking MCP** (when `--sequential` flag is provided):
  - 복잡한 Git 작업 및 대규모 변경사항의 체계적 다단계 분석
  - 변경사항을 논리적이고 관리 가능한 그룹으로 분해
  - 변경사항 의존성 및 관계 단계별 분석
  - 커밋 전략 계획 및 변경사항 조직화를 위한 단계별 추론
  - 의존성 인식 그룹화를 통한 커밋 순서 계획
  - 다중 파일 변경에 대한 포괄적 커밋 전략 계획
  - Deep reasoning mode (with `--think-hard`):
    - 다중 컴포넌트 간 변경 의존성에 대한 철저한 분석
    - 복잡한 다중 파일 변경에 대한 포괄적 영향 매핑
    - 기존 브랜치 히스토리와의 커밋 전략 요구사항 상세 평가

## Tool Coordination

- **Bash**: Git 명령 실행 (git status, git diff, git add, git commit, git log)
  - **Windows UTF-8 지원**: Git 명령 실행 전 UTF-8 인코딩 설정 보장
  - PowerShell: `chcp 65001` 또는 `$OutputEncoding = [System.Text.Encoding]::UTF8`
- **Read**: 변경된 파일 내용 분석
- **Write**: 커밋 메시지 파일 생성 (UTF-8 인코딩)
- **Grep**: Git 로그 파싱 및 패턴 분석
- **Serena Tools** (when `--serena`): 심볼 작업, 프로젝트 메모리, 코드 변경사항 분석
- **Sequential Thinking Tools** (when `--sequential`): 다단계 추론, 논리적 분석, 체계적 계획

## Key Patterns

- **자동 분석 → 전략 수립 → 메시지 생성 → 검증 → 실행**
- **Git 상태 분석**: 현재 상태 → 변경사항 파악 → 커밋 타입 결정
- **템플릿 적용**: 변경사항 분류 → 템플릿 선택 → 메시지 커스터마이징
- **히스토리 분석**: 과거 커밋 → 패턴 파악 → 일관성 유지
- **Serena 강화 커밋**: 의미론적 변경사항 분석 → 심볼 수준 영향 평가 → Conventional Commit 메시지 생성
- **Sequential 커밋 계획**: 복잡한 변경사항 → 체계적 분해 → 의존성 분석 → 논리적 그룹화 → 포괄적 커밋 전략

## Examples

### 기본 사용 (자동 분석)

```
/sc:git-commit
# 1. 현재 Git 상태 자동 분석
# 2. 변경사항 기반 커밋 타입 결정
# 3. Conventional Commits 형식 메시지 생성
# 4. 사용자 확인 후 커밋 실행
```

**예상 출력:**

```markdown
## 📊 Git 상태 분석

**변경된 파일:** 3개
- src/auth/login.js (수정)
- src/auth/jwt.js (신규)
- tests/auth.test.js (수정)

**변경 유형:** 기능 추가 (feat)

## 📝 생성된 커밋 메시지

```
feat(auth): add JWT token refresh mechanism

- Implement token refresh logic in jwt.js
- Update login flow to support token refresh
- Add unit tests for token refresh functionality
```

이 메시지로 커밋하시겠습니까? (y/n)
```

### 템플릿 사용

```
/sc:git-commit --template fix
# fix 타입 템플릿 적용하여 버그 수정 커밋 생성
```

**예상 출력:**

```markdown
## 📝 Fix 템플릿 적용

```
fix(scope): <간단한 설명>

<문제 상황 설명>
<해결 방법 설명>

Fixes #<이슈 번호>
```

**변경사항 기반 메시지 생성:**
```
fix(auth): resolve token expiration handling issue

- Fixed incorrect expiration time calculation
- Added proper error handling for expired tokens
- Updated token validation logic

Fixes #123
```
```

### Git 히스토리 분석

```
/sc:git-commit --analyze-history
# 1. 최근 커밋 히스토리 분석 (최근 20개)
# 2. 커밋 메시지 패턴 파악
# 3. 일관된 스타일로 새 커밋 메시지 생성
```

**예상 출력:**

```markdown
## 📚 Git 히스토리 분석

**최근 커밋 패턴:**
- feat(auth): 5건
- fix(ui): 3건
- docs(readme): 2건

**커밋 메시지 스타일:**
- 평균 제목 길이: 42자
- 본문 포함 비율: 60%
- Footer 사용 비율: 30%

**권장 커밋 메시지 (패턴 기반):**
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
and reduce authentication failures.

- Add token refresh endpoint
- Update authentication middleware
- Add refresh token storage
```
```

### Serena 활용 의미론적 분석

```
/sc:git-commit --serena
# 1. Serena MCP로 변경된 코드의 심볼 수준 분석
# 2. 영향받는 컴포넌트 및 의존성 파악
# 3. 의미론적 이해 기반 커밋 메시지 생성
```

**예상 출력:**

```markdown
## 🔍 Serena 심볼 분석

**변경된 심볼:**
- `class AuthService` (수정)
  - `method refreshToken()` (신규)
  - `method validateToken()` (수정)
- `class JWTHandler` (신규)

**영향 평가:**
- 인증 시스템 핵심 로직 변경
- 토큰 관리 메커니즘 추가
- 기존 로그인 플로우 호환성 유지

**생성된 커밋 메시지:**
```
feat(auth): add JWT token refresh mechanism

Introduce automatic token refresh capability to enhance
security and user experience.

Changes:
- Add JWTHandler class for token lifecycle management
- Implement refreshToken() method in AuthService
- Update validateToken() to support refresh tokens
- Maintain backward compatibility with existing auth flow

Impact: Improves authentication reliability and reduces
session timeout issues.
```
```

### Sequential Thinking으로 복잡한 변경사항 분석

```
/sc:git-commit --sequential
# 1. 복잡한 변경사항을 체계적으로 분해
# 2. 변경사항 간 의존성 분석
# 3. 논리적 순서로 커밋 전략 수립
```

**예상 출력:**

```markdown
## 🧠 Sequential Thinking 분석

**Step 1: 변경사항 발견**
- 10개 파일 변경 확인
- 변경 카테고리: 인증(5), UI(3), 테스트(2)

**Step 2: 의존성 분석**
- 인증 변경 → UI 업데이트 (의존)
- UI 업데이트 → 테스트 추가 (의존)

**Step 3: 커밋 전략 수립**
```
권장 커밋 순서:

1. 커밋 1 (기반): 인증 핵심 로직
   - feat(auth): add JWT token refresh core logic

2. 커밋 2 (의존): UI 업데이트
   - feat(ui): update login page for token refresh

3. 커밋 3 (검증): 테스트 추가
   - test(auth): add token refresh test suite
```

**Step 4: 검증**
- 논리적 순서 확인: ✅
- 의존성 관계 확인: ✅
- 커밋 메시지 일관성: ✅
```

### Deep Sequential Analysis (--think-hard)

```
/sc:git-commit --sequential --think-hard
# 대규모 변경사항에 대한 심층 순차 분석
```

**예상 출력:**

```markdown
## 🧠 Deep Sequential Analysis

**Phase 1: Change Discovery**
- 25개 파일 변경 (인증 10, API 8, UI 5, 테스트 2)
- 3개 새 모듈 추가
- 5개 기존 모듈 수정

**Phase 2: Dependency Mapping**
```
의존성 그래프:
Core Auth (JWT) → API Layer → UI Components → Tests
     ↓
  Middleware → API Endpoints
     ↓
  Database Models
```

**Phase 3: Categorization Strategy**
```
그룹 1 (Foundation): 인증 핵심 및 미들웨어
그룹 2 (Integration): API 레이어 업데이트
그룹 3 (Presentation): UI 컴포넌트
그룹 4 (Validation): 테스트 및 문서
```

**Phase 4: Commit Strategy Planning**
```
커밋 1: feat(auth): add JWT token refresh core mechanism
커밋 2: feat(auth): add authentication middleware
커밋 3: feat(api): update endpoints for token refresh
커밋 4: feat(ui): implement token refresh in login flow
커밋 5: test(auth): add comprehensive token refresh tests
커밋 6: docs(auth): update authentication documentation
```

**Phase 5: Workflow Assessment**
- 기존 브랜치 히스토리와 일관성: ✅
- 프로젝트 커밋 표준 준수: ✅
- 워크플로우 요구사항 부합: ✅
```

### Serena + Sequential 결합

```
/sc:git-commit --serena --sequential
# 의미론적 이해 + 체계적 추론 결합
# 최고 품질의 커밋 메시지 생성
```

**예상 출력:**

```markdown
## 🔍 + 🧠 Combined Analysis

**Serena 심볼 분석:**
- 10개 클래스 수정/추가
- 25개 메서드 변경
- 영향 범위: 인증 시스템 전체

**Sequential 전략 수립:**
```
커밋 전략 (의존성 기반):

1. Core → 2. Integration → 3. Presentation → 4. Testing

각 단계별 상세 커밋 메시지 생성 완료
```

**최종 커밋 메시지 (Commit 1):**
```
feat(auth): add JWT token refresh core mechanism

Introduce comprehensive token refresh system with automatic
renewal and improved security.

Symbol Changes:
- Add JWTHandler class for token lifecycle management
- Implement refreshToken() in AuthService
- Add TokenRefreshMiddleware for automatic renewal

Technical Details:
- Support both access and refresh tokens
- Implement secure token rotation
- Add expiration validation and auto-refresh logic

Impact:
- Reduces authentication failures by 90%
- Improves user experience with seamless auth
- Maintains backward compatibility

Related: Part 1/4 of authentication enhancement series
```
```

### 모든 템플릿 타입 예제

```bash
# Feature 추가
/sc:git-commit --template feat
# feat(scope): add new feature

# Bug 수정
/sc:git-commit --template fix
# fix(scope): resolve bug issue

# 문서 업데이트
/sc:git-commit --template docs
# docs(scope): update documentation

# 리팩토링
/sc:git-commit --template refactor
# refactor(scope): improve code structure

# 테스트 추가
/sc:git-commit --template test
# test(scope): add test cases

# 빌드/설정 변경
/sc:git-commit --template chore
# chore(scope): update build configuration
```

### 한글 커밋 메시지 예제 (기본 동작)

```
/sc:git-commit
# 자동으로 한글 커밋 메시지 생성
```

**예상 출력 (한글 커밋 메시지):**

```markdown
## 📊 Git 상태 분석

**변경된 파일:** 3개
- src/auth/login.js (수정)
- src/auth/jwt.js (신규)
- tests/auth.test.js (수정)

**변경 유형:** 기능 추가 (feat)

## 📝 생성된 커밋 메시지 (한글)

```
feat(인증): JWT 토큰 갱신 메커니즘 추가

- jwt.js에 토큰 갱신 로직 구현
- 토큰 갱신을 지원하도록 로그인 플로우 업데이트
- 토큰 갱신 기능에 대한 유닛 테스트 추가
```

이 메시지로 커밋하시겠습니까? (y/n)
```

**실제 커밋 예제:**

```bash
# 기능 추가
feat(인증): JWT 토큰 자동 갱신 기능 구현

토큰 만료 전 자동으로 갱신하여 사용자 경험을 개선하고
인증 실패를 줄입니다.

- JWTHandler 클래스 추가 (토큰 생명주기 관리)
- AuthService에 refreshToken() 메서드 구현
- 자동 갱신을 위한 TokenRefreshMiddleware 추가

영향: 인증 실패 90% 감소, 끊김 없는 사용자 경험

# 버그 수정
fix(결제): 결제 금액 계산 오류 수정

부가세 계산 시 소수점 반올림 오류로 인해
실제 결제 금액과 불일치하는 문제 해결

- 부가세 계산 로직 수정 (Math.round 적용)
- 최종 금액 검증 로직 추가
- 결제 금액 테스트 케이스 보강

Fixes #456

# 문서 업데이트
docs(API): 인증 API 문서 업데이트

JWT 토큰 갱신 엔드포인트 및 사용법 추가

- POST /api/auth/refresh 엔드포인트 문서화
- 토큰 갱신 요청/응답 예제 추가
- 에러 코드 및 처리 방법 설명

# 리팩토링
refactor(인증): 인증 로직 모듈화 및 구조 개선

단일 책임 원칙을 적용하여 AuthService를
토큰 관리, 사용자 검증, 세션 관리로 분리

- JWTHandler로 토큰 관련 로직 분리
- UserValidator로 사용자 검증 로직 분리
- SessionManager로 세션 관리 로직 분리

영향: 코드 복잡도 40% 감소, 테스트 용이성 향상

# 테스트 추가
test(인증): JWT 토큰 갱신 테스트 스위트 추가

토큰 갱신 기능의 모든 시나리오를 커버하는
포괄적인 테스트 추가

- 정상 토큰 갱신 시나리오
- 만료된 리프레시 토큰 처리
- 유효하지 않은 토큰 처리
- 동시 갱신 요청 처리

커버리지: 인증 모듈 95% → 98%

# 빌드/설정 변경
chore(의존성): jsonwebtoken 라이브러리 업데이트

보안 취약점 수정을 위해 jsonwebtoken을
8.5.1에서 9.0.0으로 업그레이드

- 주요 변경사항: ES6 모듈 지원
- Breaking change: 콜백 방식 → Promise 방식
- 관련 코드 마이그레이션 완료

참고: https://github.com/auth0/node-jsonwebtoken/releases
```

## Boundaries

**Will:**

- Git 상태 및 변경사항 자동 분석
- Conventional Commits 형식 커밋 메시지 생성
- **한글로 커밋 메시지 작성** (타입은 영문, scope/subject/body/footer는 한글)
- 커밋 메시지 템플릿 제공 및 적용
- Git 히스토리 분석 및 패턴 일관성 유지
- 사용자 확인 후 안전한 커밋 실행
- Windows 환경에서 UTF-8 인코딩 보장 (한글 지원)
- 저장소 상태, 파일 내용, Git 히스토리만 기반으로 분석 (컨텍스트 독립성)
- Git이 추적하는 변경사항만 커밋 메시지에 포함 (추적된 변경사항만)
- `--serena` 플래그 제공 시 Serena MCP 활용하여 의미론적 분석
- `--sequential` 플래그 제공 시 Sequential Thinking MCP 활용하여 체계적 분석
- `--think-hard` 플래그와 `--sequential` 함께 사용 시 심층 순차 추론 적용

**Will Not:**

- 사용자 확인 없이 자동 커밋 실행
- 파괴적 Git 작업 수행 (force push, hard reset 등)
- 대화 컨텍스트나 이전 대화 내용을 커밋 분석에 반영 (저장소 상태만 기반)
- Git이 추적하지 않는 파일이나 변경사항을 커밋 메시지에 포함
- UTF-8 인코딩 설정 없이 Windows에서 Git 명령 실행 (한글 지원)
- 명시적 `--serena` 플래그 없이 Serena MCP 활성화 (하위 호환성 유지)
- 명시적 `--sequential` 플래그 없이 Sequential Thinking MCP 활성화
- Git 저장소가 아닌 디렉토리에서 작업 수행
- Conventional Commits 형식을 위반하는 커밋 메시지 생성
