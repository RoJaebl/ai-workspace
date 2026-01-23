---
name: git
description: "사용자 메시지 기반 Git 커밋 생성 - 일반 모드와 체계적 계획 모드"
category: utility
complexity: enhanced
mcp-servers: []
personas: []
---

# /git - 메시지 기반 Git 커밋

> **한글 Conventional Commits**: 사용자 메시지로 빠르게 커밋하거나, --task 플래그로 변경사항을 분석하여 체계적인 커밋 계획을 수립합니다.

## Triggers

- 사용자가 커밋 메시지를 직접 입력하여 빠르게 커밋하고 싶을 때
- Conventional Commits 형식을 검증하고 싶을 때
- 변경사항을 분석하여 체계적인 커밋을 작성하고 싶을 때
- 여러 커밋 옵션 중에서 선택하고 싶을 때
- Git 워크플로우를 최적화하고 싶을 때

## Usage

```
/git [message] [--task]
```

**인자:**

- `[message]`: 커밋 메시지 또는 작업 설명 (필수)
- `--task`: 체계적 커밋 계획 모드 활성화 (선택적)

**모드:**

1. **일반 모드** (메시지만 입력): Conventional Commits 형식 검증 후 커밋
2. **계획 모드** (--task 플래그): 변경사항 분석 후 대화형 커밋 옵션 제시

## Behavioral Flow

### 일반 모드 (메시지 검증 후 커밋)

1. **Analyze**: 입력된 커밋 메시지 파싱
   - 메시지 구조 분석
   - Conventional Commits 형식 확인
   - 타입, scope, subject 추출
   
2. **Validate**: Conventional Commits 형식 검증
   - **타입 검증**: feat, fix, docs, refactor, test, chore, style, perf, ci 중 하나인지 확인
   - **형식 검증**: `<type>(<scope>): <subject>` 패턴 확인
   - **한글 지원**: scope와 subject는 한글 허용
   - **Subject 규칙**: 50자 이내, 마침표 없음, 명령형/현재형
   - 검증 실패 시: 오류 메시지 및 수정 제안 제공
   
3. **Execute**: Git 커밋 실행
   - `git status` 확인
   - `git add .` 또는 `git add -A` 실행
   - 입력된 메시지로 `git commit` 실행
   - **Windows UTF-8**: 한글 메시지를 위한 인코딩 설정
   
4. **Validate**: 커밋 성공 확인
   - 커밋 해시 확인
   - 변경사항 파일 수 확인
   
5. **Report**: 결과 보고
   - 커밋 정보 출력
   - 다음 단계 안내 (push, PR 등)

### 계획 모드 (--task 플래그)

1. **Analyze**: Git 상태 및 변경사항 분석
   - **Context Independence**: 저장소 상태, 파일 내용, Git 히스토리만 기반으로 분석
   - **Tracked Changes Only**: `git status`와 `git diff`로 확인 가능한 추적된 변경사항만 분석
   - `git status --short`: 변경된 파일 목록
   - `git diff --stat`: 변경 통계
   - `git log --oneline -5`: 최근 커밋 히스토리
   - 파일별 변경 유형 확인 (M, A, D, R)
   - 파일 경로 기반 scope 추론
   
2. **Plan**: 커밋 전략 수립 (git-expert 스킬 참조)
   - **변경 유형 결정**:
     - 새 기능/파일 → `feat`
     - 버그 수정 → `fix`
     - 문서 변경 → `docs`
     - 코드 구조 변경 → `refactor`
     - 테스트 파일 → `test`
     - 설정 파일 → `chore`
   - **Scope 결정**:
     - 파일 경로 분석 (예: src/auth/* → 인증)
     - 변경된 모듈/컴포넌트 이름 사용
     - 한글로 작성
   - **커밋 옵션 생성** (3-5개):
     - 단일 커밋 (전체 변경사항 포함)
     - 간결한 커밋 (핵심만)
     - 복수 커밋 (논리적 그룹으로 분리)
   
3. **Execute**: 대화형 선택 및 커밋
   - 사용자에게 커밋 옵션 제시
   - 선택된 옵션 확인
   - `git add` 및 `git commit` 실행
   - **Windows UTF-8**: 한글 메시지 인코딩 설정
   
4. **Validate**: 커밋 메시지 및 변경사항 검증
   - Conventional Commits 형식 규칙 준수 확인
   - 변경사항과 커밋 메시지 내용 일치성 확인
   - 제목 50자 이내, 본문 72자 줄바꿈 확인
   
5. **Report**: 결과 보고 및 다음 단계 안내
   - 커밋 정보 요약 (해시, 메시지, 변경 파일 수)
   - Git 히스토리 현황 (`git log --oneline -5`)
   - 다음 작업 권장사항 (push, PR 생성 등)

Key behaviors:

- **한글 Conventional Commits**: 타입은 영문, scope/subject/body/footer는 한글
- **형식 검증**: 일반 모드에서 Conventional Commits 형식 자동 검증
- **변경사항 분석**: 계획 모드에서 Git 상태 자동 분석
- **대화형 옵션**: 계획 모드에서 3-5개 커밋 옵션 제시
- **안전한 커밋**: 사용자 확인 후 커밋 실행
- **Windows UTF-8 지원**: 한글 메시지를 위한 인코딩 설정
- **Context Independence**: 저장소 상태만 기반으로 분석 (대화 컨텍스트 참조 금지)
- **Tracked Changes Only**: 추적된 변경사항만 커밋 메시지에 포함

## Tool Coordination

- **Bash**: Git 명령 실행
  - `git status --short`: 변경 파일 목록
  - `git diff --stat`: 변경 통계
  - `git log --oneline -5`: 최근 커밋
  - `git add`: 변경사항 스테이징
  - `git commit`: 커밋 실행
  - **Windows UTF-8**: `chcp 65001` 또는 PowerShell UTF-8 설정
- **Read**: git-expert 스킬 참조
  - `.cursor/skills/git-expert/SKILL.md`: 커밋 메시지 가이드
  - `.cursor/skills/git-expert/references/commit-messages.md`: Conventional Commits 타입 및 템플릿
- **AskQuestion**: 대화형 옵션 선택 (계획 모드)

## Key Patterns

- **일반 모드**: 메시지 입력 → 형식 검증 → 커밋 실행
- **계획 모드**: Git 상태 분석 → 변경사항 분류 → 옵션 생성 → 사용자 선택 → 커밋 실행
- **형식 검증**: `<type>(<scope>): <subject>` 패턴 확인
- **Scope 추론**: 파일 경로 기반 자동 scope 결정
- **한글 메시지**: 타입은 영문, 나머지는 한글
- **UTF-8 인코딩**: Windows 환경에서 한글 지원

## Examples

### 예제 1: 일반 모드 - 정상 형식

```
/git "feat(인증): JWT 토큰 갱신 추가"

# 실행 과정:
# 1. 형식 검증: ✅ 통과
# 2. git status 확인
# 3. git add . 실행
# 4. git commit -m "feat(인증): JWT 토큰 갱신 추가" 실행
# 5. 결과 보고

# 예상 출력:
## ✅ 커밋 완료

**커밋 해시**: abc1234
**메시지**: feat(인증): JWT 토큰 갱신 추가
**변경 파일**: 3개

## 다음 단계

- `git push` 로 원격 저장소에 푸시
- PR 생성을 위해 `gh pr create` 실행
```

### 예제 2: 일반 모드 - 형식 오류

```
/git "인증 기능 추가"

# 실행 과정:
# 1. 형식 검증: ❌ 실패 (타입 없음)
# 2. 오류 메시지 출력
# 3. 수정 제안 제공

# 예상 출력:
## ❌ Conventional Commits 형식 오류

**입력된 메시지**: "인증 기능 추가"

**오류**: 커밋 타입이 없습니다.

## 올바른 형식

```
<type>(<scope>): <subject>
```

**예시:**
- `feat(인증): 인증 기능 추가`
- `fix(인증): 인증 버그 수정`
- `docs(API): API 문서 업데이트`

## 사용 가능한 타입

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 변경
- **refactor**: 코드 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드, 설정, 의존성 등

## 수정 제안

```
feat(인증): 인증 기능 추가
```

다시 시도하시겠습니까? [Y/n]
```

### 예제 3: 계획 모드 - 단일 커밋

```
/git "인증 기능 개선" --task

# 실행 과정:
# 1. Git 상태 분석
# 2. 변경사항 분류
# 3. 커밋 옵션 생성
# 4. 사용자 선택
# 5. 커밋 실행

# 예상 출력:
## 📊 Git 상태 분석

**변경된 파일**: 5개
- src/auth/jwt.js (수정)
- src/auth/login.js (수정)
- src/ui/LoginPage.js (수정)
- tests/auth.test.js (추가)
- docs/api/auth.md (수정)

**변경 유형**: 기능 추가 (feat)
**Scope**: 인증

## 💡 추천 커밋 옵션

다음 중 하나를 선택하세요:

### 옵션 1 (추천) - 단일 커밋
```
feat(인증): JWT 토큰 갱신 메커니즘 추가

토큰 만료 전 자동으로 갱신하여 사용자 경험을 개선합니다.

- JWTHandler 클래스 추가
- AuthService에 refreshToken() 메서드 구현
- 로그인 페이지 토큰 갱신 연동
- 토큰 갱신 테스트 추가
- API 문서 업데이트
```

### 옵션 2 - 간결한 커밋
```
feat(인증): 인증 시스템 개선 및 토큰 관리 추가
```

→ 선택: [1/2/수정/취소] 
# 사용자가 1 선택
# git commit 실행

## ✅ 커밋 완료

**커밋 해시**: def5678
**메시지**: feat(인증): JWT 토큰 갱신 메커니즘 추가
**변경 파일**: 5개
```

### 예제 4: 계획 모드 - 복수 커밋 제안

```
/git "대규모 인증 시스템 리팩토링" --task

# 실행 과정:
# 1. Git 상태 분석 (10개 파일 변경)
# 2. 변경사항을 논리적 그룹으로 분류
# 3. 복수 커밋 옵션 제안
# 4. 사용자 선택
# 5. 순차적 커밋 실행

# 예상 출력:
## 📊 Git 상태 분석

**변경된 파일**: 10개
- src/auth/jwt.js (수정)
- src/auth/login.js (수정)
- src/auth/middleware.js (추가)
- src/api/auth.endpoint.js (수정)
- src/ui/LoginPage.js (수정)
- src/ui/RegisterPage.js (수정)
- tests/auth.test.js (추가)
- tests/api.test.js (수정)
- docs/api/auth.md (수정)
- docs/guide/authentication.md (추가)

## 💡 추천 커밋 옵션

### 옵션 1 - 단일 커밋
```
refactor(인증): 인증 시스템 전면 리팩토링
```

### 옵션 2 - 기능별 2개 커밋
```
커밋 1: refactor(인증): 인증 핵심 로직 모듈화
커밋 2: feat(UI): 인증 UI 개선 및 API 연동
```

### 옵션 3 (추천) - 논리적 4개 커밋
```
커밋 1: refactor(인증): JWT 토큰 핵심 로직 구현
  - src/auth/jwt.js
  - src/auth/login.js
  - src/auth/middleware.js

커밋 2: refactor(API): 인증 API 엔드포인트 업데이트
  - src/api/auth.endpoint.js

커밋 3: feat(UI): 로그인/회원가입 페이지 개선
  - src/ui/LoginPage.js
  - src/ui/RegisterPage.js

커밋 4: test(인증): 인증 테스트 스위트 추가
  - tests/auth.test.js
  - tests/api.test.js

커밋 5: docs(인증): 인증 API 문서 업데이트
  - docs/api/auth.md
  - docs/guide/authentication.md
```

→ 선택: [1/2/3/수정/취소]
# 사용자가 3 선택
# 5개 커밋 순차 실행

## ✅ 커밋 완료 (5개)

**커밋 1**: abc1234 - refactor(인증): JWT 토큰 핵심 로직 구현
**커밋 2**: def5678 - refactor(API): 인증 API 엔드포인트 업데이트
**커밋 3**: ghi9012 - feat(UI): 로그인/회원가입 페이지 개선
**커밋 4**: jkl3456 - test(인증): 인증 테스트 스위트 추가
**커밋 5**: mno7890 - docs(인증): 인증 API 문서 업데이트

## 다음 단계

- `git push` 로 원격 저장소에 푸시
- PR 생성: `gh pr create --title "인증 시스템 리팩토링"`
```

### 예제 5: Windows UTF-8 설정

```
# PowerShell UTF-8 Setup
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001

# Git UTF-8 Configuration
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

# 커밋 실행
/git "feat(인증): JWT 토큰 갱신 메커니즘 추가"

# 한글 메시지가 올바르게 표시됨:
## ✅ 커밋 완료

**커밋 해시**: abc1234
**메시지**: feat(인증): JWT 토큰 갱신 메커니즘 추가
**변경 파일**: 3개

# 커밋 로그 확인
git log --oneline -1
# abc1234 feat(인증): JWT 토큰 갱신 메커니즘 추가
```

### 예제 6: 한글 Conventional Commits 예제

```
# 기능 추가
/git "feat(인증): JWT 토큰 자동 갱신 기능 구현"

# 버그 수정
/git "fix(결제): 결제 금액 계산 오류 수정"

# 문서 업데이트
/git "docs(API): 인증 API 문서 업데이트"

# 리팩토링
/git "refactor(인증): 인증 로직 모듈화 및 구조 개선"

# 테스트 추가
/git "test(인증): JWT 토큰 갱신 테스트 스위트 추가"

# 빌드/설정 변경
/git "chore(의존성): jsonwebtoken 라이브러리 업데이트"

# 스타일 변경
/git "style(전체): Prettier 포맷 적용"

# 성능 개선
/git "perf(쿼리): 조회 쿼리 최적화"

# CI/CD 설정
/git "ci(배포): GitHub Actions 워크플로우 추가"
```

## Boundaries

**Will:**

- 사용자 입력 메시지로 빠른 커밋 생성
- Conventional Commits 형식 자동 검증
- 형식 오류 시 구체적인 수정 제안 제공
- --task 플래그로 Git 상태 자동 분석
- 변경사항 기반 커밋 옵션 3-5개 생성
- 대화형으로 커밋 옵션 선택
- 복수 커밋 제안 (논리적 그룹으로 분리)
- 한글 Conventional Commits 생성 (타입은 영문, scope/subject는 한글)
- Windows 환경에서 UTF-8 인코딩 보장
- 저장소 상태, 파일 내용, Git 히스토리만 기반으로 분석
- 추적된 변경사항만 커밋 메시지에 포함
- git-expert 스킬 참조하여 일관된 커밋 메시지 생성

**Will Not:**

- 사용자 확인 없이 자동 커밋 실행
- 형식이 틀린 메시지를 그대로 커밋 (일반 모드)
- 파괴적 Git 작업 수행 (force push, hard reset 등)
- 대화 컨텍스트나 이전 대화 내용을 커밋 분석에 반영
- Git이 추적하지 않는 파일이나 변경사항을 커밋 메시지에 포함
- UTF-8 인코딩 설정 없이 Windows에서 Git 명령 실행
- Git 저장소가 아닌 디렉토리에서 작업 수행
- Conventional Commits 형식을 위반하는 커밋 메시지 생성
- 커밋 메시지 body나 footer를 자동 생성 (사용자가 제공하지 않은 경우)
