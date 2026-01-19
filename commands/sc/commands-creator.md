---
name: commands-creator
description: "Interactive command file creator with templates and validation"
category: utility
complexity: enhanced
mcp-servers: []
personas: []
---

# /commands-creator - Command File Creator

> **대화형 커맨드 생성 도구**: 템플릿 기반으로 새로운 Commands 파일을 쉽게 생성합니다.

## 사용법

```bash
# 대화형 모드 (권장)
/commands-creator --interactive

# 템플릿 선택
/commands-creator --template [template-name] --name [command-name]

# 기존 커맨드 검증
/commands-creator --validate [command-file]

# 템플릿 목록 보기
/commands-creator --list-templates
```

## 명령어 인자

- **$1**: 동작 모드 (`create`, `validate`, `list`) 또는 템플릿 이름
- **$2**: 커맨드 이름 (create 모드일 때)
- **--interactive**: 대화형 질문 모드
- **--template [name]**: 템플릿 선택
- **--name [name]**: 커맨드 이름
- **--validate [file]**: 기존 커맨드 검증
- **--list-templates**: 사용 가능한 템플릿 목록

---

## 작업 프로세스

$ARGUMENTS

### 🎯 동작 모드 결정

인자가 없거나 `--interactive`인 경우: **대화형 모드**
`--list-templates`인 경우: **템플릿 목록 표시**
`--validate`인 경우: **검증 모드**
그 외: **빠른 생성 모드**

---

## 📋 대화형 모드 (Interactive Mode)

다음 질문들을 순서대로 하고 답변을 수집하세요:

### 1단계: 기본 정보

**Q1: 커맨드 이름을 입력하세요 (kebab-case)**
예시: `my-command`, `analyze-security`, `git-smart-commit`
```
→ 답변: [사용자 입력 대기]
```

**Q2: 커맨드 설명을 한 줄로 입력하세요**
예시: "Analyze code security vulnerabilities"
```
→ 답변: [사용자 입력 대기]
```

**Q3: 커맨드 타입을 선택하세요**
```
1. basic-command         - 기본 Claude Code Command
2. superclaude-utility   - SuperClaude 유틸리티 커맨드
3. superclaude-workflow  - SuperClaude 워크플로우 커맨드
4. git-workflow          - Git 워크플로우 자동화
5. code-review           - 코드 리뷰 템플릿
6. testing               - 테스트 자동화
7. documentation         - 문서 생성
8. custom                - 빈 템플릿 (직접 작성)

→ 선택: [사용자 입력 대기]
```

### 2단계: 고급 설정 (템플릿에 따라)

#### 기본 Commands 설정

**Q4: 인자가 필요한가요?**
```
1. 예 - 필요한 인자를 정의
2. 아니오 - 인자 없이 실행

→ 선택: [사용자 입력 대기]
```

**Q4-1 (예를 선택한 경우): 인자 힌트를 입력하세요**
예시: `<file-path>`, `[target] [options]`, `<pr-number> [priority]`
```
→ 답변: [사용자 입력 대기]
```

**Q5: 필요한 도구를 선택하세요 (여러 개 선택 가능)**
```
1. Read        - 파일 읽기
2. Write       - 파일 쓰기
3. Edit        - 파일 편집
4. Grep        - 패턴 검색
5. Glob        - 파일 탐색
6. Bash        - 터미널 명령 (특정 명령 지정 필요)

→ 선택: [사용자 입력 대기]
```

**Q5-1 (Bash 선택 시): 허용할 명령을 입력하세요**
예시: `git:*`, `npm run test:*`, `git add:* git commit:*`
```
→ 답변: [사용자 입력 대기]
```

#### SuperClaude 추가 설정

**Q6: 카테고리를 선택하세요**
```
1. workflow       - 개발 워크플로우
2. utility        - 유틸리티 도구
3. analysis       - 분석 및 평가
4. orchestration  - 오케스트레이션
5. special        - 특수 목적

→ 선택: [사용자 입력 대기]
```

**Q7: 복잡도를 선택하세요**
```
1. basic      - 기본 기능
2. standard   - 표준 기능
3. enhanced   - 향상된 기능
4. advanced   - 고급 기능

→ 선택: [사용자 입력 대기]
```

**Q8: MCP 통합이 필요한가요?**
```
1. Serena          - 심볼 분석, 프로젝트 메모리
2. Sequential      - 다단계 체계적 분석
3. Context7        - 프레임워크 문서
4. Magic           - UI 컴포넌트 생성
5. Playwright      - 브라우저 테스팅
6. 없음            - 기본 도구만 사용

→ 선택 (여러 개 가능): [사용자 입력 대기]
```

**Q9: 활성화할 페르소나를 선택하세요 (선택사항)**
```
1. architect      - 시스템 아키텍트
2. frontend       - 프론트엔드 개발자
3. backend        - 백엔드 개발자
4. security       - 보안 전문가
5. qa-specialist  - QA 전문가
6. devops         - DevOps 엔지니어
7. analyzer       - 코드 분석가
8. educator       - 교육자
9. 없음           - 페르소나 없이

→ 선택 (여러 개 가능): [사용자 입력 대기]
```

### 3단계: 생성 확인

수집된 정보를 요약하고 확인 요청:

```markdown
## 📝 생성할 커맨드 정보

**이름**: [command-name]
**설명**: [description]
**타입**: [template-type]
**저장 위치**: `.claude/commands/sc/[command-name].md`

**설정**:
- 인자: [argument-hint 또는 "없음"]
- 도구: [allowed-tools 목록]
- MCP: [mcp-servers 또는 "없음"]
- 페르소나: [personas 또는 "없음"]

이 정보로 커맨드를 생성할까요?
1. 예 - 생성
2. 아니오 - 취소
3. 수정 - 다시 입력

→ 선택: [사용자 입력 대기]
```

---

## 🏗️ 파일 생성 (답변 수집 후)

수집된 답변을 바탕으로 적절한 템플릿을 선택하고 파일을 생성합니다.

### 생성 단계

1. **템플릿 로드**: 선택된 템플릿 구조 적용
2. **정보 삽입**: 수집된 답변을 템플릿에 삽입
3. **파일 작성**: `.claude/commands/sc/[name].md` 생성
4. **검증**: 생성된 파일 구문 검증
5. **확인**: 사용자에게 결과 보고

---

## 📚 템플릿 라이브러리

### 1. basic-command (기본 Claude Code Command)

```markdown
---
description: "[DESCRIPTION]"
argument-hint: [ARGUMENT_HINT]
allowed-tools: [ALLOWED_TOOLS]
---

# [COMMAND_NAME]

## 컨텍스트
(필요한 정보 수집)

## 작업
[사용자가 정의한 작업 수행]

## 검증
(성공 기준)
```

### 2. superclaude-utility (SuperClaude 유틸리티)

```markdown
---
name: [COMMAND_NAME]
description: "[DESCRIPTION]"
category: [CATEGORY]
complexity: [COMPLEXITY]
mcp-servers: [MCP_SERVERS]
personas: [PERSONAS]
---

# /sc:[COMMAND_NAME] - [TITLE]

## Triggers
- Trigger scenario 1
- Trigger scenario 2
- Trigger scenario 3
- Trigger scenario 4

## Usage
```
/sc:[COMMAND_NAME] [target] [--flags]
```

**Flags:**
- `--flag1`: Flag description

## Behavioral Flow
1. **Analyze**: Analysis phase
2. **Plan**: Planning phase
3. **Execute**: Execution phase
4. **Validate**: Validation phase
5. **Report**: Reporting phase

Key behaviors:
- Core behavior 1
- Core behavior 2

## MCP Integration
[MCP_INTEGRATION_DESCRIPTION]

## Tool Coordination
- **Read/Write**: File operations
- **Bash**: Command execution

## Key Patterns
- **Pattern Name**: Flow → stages → outcome

## Examples

### Basic Usage
```
/sc:[COMMAND_NAME] target
# Basic execution
```

## Boundaries

**Will:**
- Action command performs

**Will Not:**
- Restriction with reasoning
```

### 3. git-workflow (Git 워크플로우)

```markdown
---
description: "[DESCRIPTION]"
allowed-tools: Bash(git:*)
---

# Git 워크플로우: [COMMAND_NAME]

## 현재 Git 상태

- 상태: !`git status --short`
- 브랜치: !`git branch --show-current`
- 최근 커밋: !`git log --oneline -5`

## 작업

[Git 작업 수행]

## Conventional Commits

형식:
- **feat**: 새 기능
- **fix**: 버그 수정
- **docs**: 문서
- **refactor**: 리팩토링
- **test**: 테스트
- **chore**: 빌드/설정

## 검증

커밋 후:
- [ ] 커밋 메시지 검증
- [ ] 변경사항 확인
```

### 4. code-review (코드 리뷰)

```markdown
---
description: "[DESCRIPTION]"
argument-hint: <file-path>
---

# 코드 리뷰: $ARGUMENTS

## 파일 분석

@$ARGUMENTS

## 리뷰 체크리스트

### 보안 🔒
- [ ] SQL Injection
- [ ] XSS
- [ ] 인증/인가
- [ ] 민감 정보 노출

### 성능 ⚡
- [ ] 알고리즘 효율성
- [ ] 메모리 사용
- [ ] 불필요한 연산
- [ ] 캐싱 기회

### 코드 품질 ✨
- [ ] SOLID 원칙
- [ ] DRY
- [ ] 에러 핸들링
- [ ] 명확한 네이밍

### 테스트 🧪
- [ ] 테스트 커버리지
- [ ] Edge cases
- [ ] Mock 적절성

## 개선 제안

각 카테고리별로 구체적인 개선 방법을 제시하세요.
```

### 5. testing (테스트 자동화)

```markdown
---
description: "[DESCRIPTION]"
allowed-tools: Read, Write, Bash(npm:*)
---

# 테스트 생성: [COMMAND_NAME]

## 현재 테스트 상태

커버리지: !`npm run test:coverage`

## 작업

### 유닛 테스트 🧩
- 모든 public 함수
- Edge cases
- Error handling

### 통합 테스트 🔗
- API 엔드포인트
- 데이터베이스 연동
- 외부 서비스 Mock

## 테스트 작성 규칙

```typescript
describe('Component', () => {
  it('should do something', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 목표

- 커버리지: 90% 이상
- 실행 시간: 30초 이내
```

### 6. documentation (문서 생성)

```markdown
---
description: "[DESCRIPTION]"
argument-hint: <target-path>
---

# 문서 생성

## 대상

@$ARGUMENTS

## 문서 형식

### API 문서
- Endpoint 정보
- Parameters
- Request/Response 예제
- Error codes

### 코드 문서
- JSDoc/TSDoc 주석
- 사용 예제
- 주의사항

## 작업

위 형식에 맞춰 문서를 생성하고 적절한 위치에 저장하세요.
```

### 7. custom (빈 템플릿)

```markdown
---
description: "[DESCRIPTION]"
---

# [COMMAND_NAME]

(자유 형식으로 작성하세요)
```

---

## ✅ 검증 모드 (Validation Mode)

기존 커맨드 파일을 검증합니다.

### 검증 항목

#### 구조 검증
- [ ] YAML frontmatter 존재
- [ ] description 필드 존재
- [ ] 파일명이 kebab-case
- [ ] .md 확장자

#### 내용 검증
- [ ] 명확한 목적
- [ ] 구체적인 지시사항
- [ ] 인자 사용 시 hint 제공
- [ ] 도구 사용 시 권한 명시

#### SuperClaude 추가 검증 (해당 시)
- [ ] 8개 필수 섹션 존재
- [ ] category, complexity 정의
- [ ] Behavioral Flow 5단계
- [ ] Examples 최소 4개
- [ ] Boundaries 섹션

### 검증 보고서

```markdown
## 검증 결과: [파일명]

### ✅ 통과한 항목
- [항목 목록]

### ⚠️ 경고
- [경고 목록]

### ❌ 오류
- [오류 목록]

### 💡 개선 제안
- [제안 목록]
```

---

## 📋 템플릿 목록 모드

`--list-templates` 플래그 사용 시 사용 가능한 템플릿 목록을 표시합니다.

```markdown
## 사용 가능한 템플릿

### 기본 Commands
1. **basic-command** - 기본 Claude Code Command
   - 용도: 간단한 자동화 작업
   - 구조: 자유 형식
   - 예시: 파일 처리, 간단한 스크립트

2. **git-workflow** - Git 워크플로우
   - 용도: Git 작업 자동화
   - 구조: Git 상태 + 작업 + 검증
   - 예시: 스마트 커밋, 브랜치 관리

3. **code-review** - 코드 리뷰
   - 용도: 체계적 코드 검토
   - 구조: 체크리스트 기반
   - 예시: 보안/성능/품질 리뷰

4. **testing** - 테스트 자동화
   - 용도: 테스트 생성 및 실행
   - 구조: 테스트 타입별 분류
   - 예시: 유닛/통합/E2E 테스트

5. **documentation** - 문서 생성
   - 용도: API/코드 문서화
   - 구조: 문서 형식 템플릿
   - 예시: API 문서, JSDoc

### SuperClaude Commands
6. **superclaude-utility** - 유틸리티 커맨드
   - 용도: SuperClaude 유틸리티
   - 구조: 8개 필수 섹션
   - 예시: analyze, cleanup

7. **superclaude-workflow** - 워크플로우 커맨드
   - 용도: 복잡한 오케스트레이션
   - 구조: 8개 필수 섹션 + MCP
   - 예시: implement, document

### 기타
8. **custom** - 빈 템플릿
   - 용도: 완전히 새로운 구조
   - 구조: 최소한의 frontmatter만
   - 예시: 특수한 용도의 커맨드
```

---

## 🚀 사용 예제

### 예제 1: 대화형으로 Git 커맨드 생성

```bash
/commands-creator --interactive

→ Q1: my-git-commit
→ Q2: Smart commit message generator
→ Q3: 4 (git-workflow)
→ Q4: 2 (아니오 - 인자 없음)
→ Q5: 6 (Bash)
→ Q5-1: git:*

✅ 생성됨: .claude/commands/sc/my-git-commit.md
```

### 예제 2: 템플릿으로 빠르게 생성

```bash
/commands-creator --template code-review --name review-security

✅ 생성됨: .claude/commands/sc/review-security.md
```

### 예제 3: SuperClaude 커맨드 생성

```bash
/commands-creator --interactive

→ Q1: analyze-performance
→ Q2: Performance analysis and optimization
→ Q3: 2 (superclaude-utility)
→ Q6: 3 (analysis)
→ Q7: 3 (enhanced)
→ Q8: 1, 2 (Serena, Sequential)
→ Q9: 7 (analyzer)

✅ 생성됨: .claude/commands/sc/analyze-performance.md
```

### 예제 4: 기존 커맨드 검증

```bash
/commands-creator --validate analyze.md

## 검증 결과: analyze.md

### ✅ 통과 (12/15)
- YAML frontmatter 올바름
- 8개 필수 섹션 존재
- 예제 6개 포함

### ⚠️ 경고 (2)
- Examples 섹션에 한글 설명 부족
- Boundaries 섹션 간략함

### ❌ 오류 (1)
- MCP Integration 섹션에 Playwright 누락

### 💡 개선 제안
- 예제에 한글 설명 추가
- Playwright MCP 설명 보완
```

---

## 💡 팁과 노트

### 명명 규칙
- **kebab-case 사용**: `my-command`, `analyze-code`
- **동사로 시작**: `analyze`, `create`, `validate`
- **명확한 이름**: `review-pr` (O) vs `check` (X)

### 템플릿 선택 가이드
| 상황 | 추천 템플릿 |
|------|-------------|
| 간단한 파일 처리 | basic-command |
| Git 작업 자동화 | git-workflow |
| 체계적인 검토 | code-review |
| 테스트 생성 | testing |
| 문서 생성 | documentation |
| 복잡한 분석 | superclaude-utility |
| 다단계 워크플로우 | superclaude-workflow |
| 특수한 용도 | custom |

### SuperClaude vs 기본 Commands
| 기준 | 기본 Commands | SuperClaude |
|------|---------------|-------------|
| **학습 곡선** | 낮음 | 중간 |
| **구조** | 자유 | 표준화 |
| **MCP 통합** | 없음 | 있음 |
| **복잡도** | 간단 | 복잡 |
| **사용 사례** | 개인 자동화 | 팀 표준화 |

---

## 📝 생성 후 할 일

커맨드 파일이 생성되면:

1. **파일 확인**: `.claude/commands/sc/[name].md` 열기
2. **내용 커스터마이징**: 프로젝트에 맞게 수정
3. **테스트**: `/[command-name]` 실행해보기
4. **문서화**: 팀과 공유할 README 작성
5. **Git 커밋**: 버전 관리에 추가

```bash
git add .claude/commands/sc/[name].md
git commit -m "feat: add [name] command"
git push
```

---

## 🔧 트러블슈팅

### 파일이 생성되지 않을 때
- `.claude/commands/sc/` 디렉토리 존재 확인
- 파일 쓰기 권한 확인
- 파일명에 특수문자 없는지 확인

### 커맨드가 실행되지 않을 때
- `/help`로 커맨드 목록 확인
- 파일명과 명령어 이름 일치 확인
- Claude Code 재시작

### 검증 오류가 있을 때
- YAML 문법 검사 (들여쓰기, 콜론)
- 필수 필드 누락 확인
- 템플릿 구조 참고

---

## 참고 자료

- **완전 가이드**: `@commands-complete-guide.md`
- **SuperClaude 가이드**: `@COMMAND_WRITING_GUIDE.md`
- **Claude Code 가이드**: `@claude-code-commands-guide.md`

---

**버전**: 1.0.0  
**최종 업데이트**: 2026-01-19  
**사용법**: `/commands-creator --interactive` 또는 `/commands-creator --help`
