---
name: git-expert
description: Git 저장소 작업 전문가. 커밋 메시지 생성, 브랜치 관리, 상태 분석, 워크플로우 최적화를 수행합니다. 커밋을 작성하거나, Git 상태를 분석하거나, 브랜치를 관리하거나, 변경사항을 검토할 때 사용합니다. 한글 커밋 메시지와 Conventional Commits 형식을 지원합니다.
---

# Git Expert

Git 저장소 작업을 위한 전문 스킬입니다.

## 핵심 기능

1. **커밋 메시지 생성** - 변경사항 분석 기반 한글 Conventional Commits 메시지 생성
2. **상태 분석** - Git 상태 및 변경사항 파악, 다음 작업 권장
3. **브랜치 관리** - 브랜치 생성, 전환, 병합, 삭제
4. **워크플로우 최적화** - 일관된 패턴 유지, 히스토리 분석

## 기본 워크플로우

### 1. 상태 분석

```bash
git status --short
git diff --stat
git log --oneline -5
```

### 2. 변경사항 분류

- 변경 유형 파악 (feat, fix, docs, refactor, test, chore)
- 영향 범위 식별 (scope)
- 논리적 그룹화

### 3. 커밋 실행

```bash
git add <files>
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>

<footer>
EOF
)"
```

## 커밋 메시지 형식

**모든 커밋 메시지는 한글로 작성합니다:**

- `type`: 영문 유지 (feat, fix, docs, refactor, test, chore)
- `scope`: 한글 (예: 인증, 결제, UI)
- `subject`: 한글 (예: JWT 토큰 갱신 메커니즘 추가)
- `body`: 한글 (상세 설명)
- `footer`: 한글 (이슈 번호 등)

**예시:**

```
feat(인증): JWT 토큰 갱신 메커니즘 추가

토큰 만료 전 자동으로 갱신하여 사용자 경험을 개선합니다.

- JWTHandler 클래스 추가
- AuthService에 refreshToken() 메서드 구현

Fixes #123
```

## 참조 문서

- **커밋 메시지 가이드**: [references/commit-messages.md](references/commit-messages.md) - 타입별 상세 가이드, 템플릿, 예제
- **Git 작업 가이드**: [references/operations.md](references/operations.md) - 브랜치 관리, 병합, 충돌 해결, 히스토리 관리

## Windows UTF-8 지원

Windows 환경에서 한글 커밋 메시지 작성 시:

```powershell
# PowerShell UTF-8 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001

# Git UTF-8 설정
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

## 안전 규칙

- 사용자 확인 없이 자동 커밋 금지
- 파괴적 작업 금지 (force push, hard reset 등)
- Git 설정 변경 금지
- 추적되지 않은 파일은 커밋 메시지에 포함하지 않음
