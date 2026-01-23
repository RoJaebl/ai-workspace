---
name: task-planner
description: "사용자 메시지를 5단계 워크플로우 계획서로 변환"
category: workflow
complexity: enhanced
mcp-servers: [sequential, serena]
personas: [architect, analyzer]
---

# /sc:task-planner - 작업 계획 수립

> **5단계 워크플로우**: 사용자 메시지를 받아 확인→분석→계획→작업→검증 단계로 구조화된 작업 계획서를 자동 생성합니다.

## Triggers
- 작업 계획 수립이 필요할 때
- 체계적인 워크플로우 접근이 필요한 프로젝트
- 5단계 방법론 (확인/분석/계획/작업/검증) 적용이 필요할 때
- 작업을 시작하기 전 명확한 계획서가 필요할 때

## Usage
```
/sc:task-planner [user-message]
/sc:task-planner  # 메시지 없으면 대화형으로 질문
```

**인자:**
- `[user-message]`: 계획을 수립할 작업 내용 (선택사항)

**동작:**
- 인자가 있으면: 메시지를 바탕으로 즉시 계획서 작성
- 인자가 없으면: 사용자에게 작업 내용을 질문

## Behavioral Flow
1. **확인 (Confirm)**: 요구사항 명확화 및 컨텍스트 수집
   - 사용자 메시지 분석 및 핵심 요구사항 파악
   - 프로젝트 컨텍스트 및 제약사항 확인
   - 불명확한 부분이 있으면 추가 질문
   
2. **분석 (Analyze)**: 작업 범위, 의존성, 리스크 분석 (반복 수행)
   - Sequential MCP를 활용한 다단계 체계적 분석
   - Serena MCP로 프로젝트 구조 및 심볼 분석
   - 작업 범위, 필요 리소스, 잠재적 리스크 식별
   - **반복 로직**: 세부 분석 결과에서 추가 영향이 발견되면 분석 단계를 재수행
   - **종료 조건**: 모든 전파 영향이 파악되고 새로운 발견이 없을 때 계획 단계로 진행
   
3. **계획 (Plan)**: 단계별 실행 계획 및 체크리스트 작성
   - 실행 단계를 논리적 순서로 구조화
   - 각 단계별 체크리스트 및 마일스톤 정의
   - 우선순위 및 의존성 관계 명시
   
4. **작업 (Execute)**: 구체적인 액션 아이템 정의
   - 실행 가능한 구체적 작업 목록 생성
   - 각 작업의 담당자 및 우선순위 지정
   - TodoWrite로 주요 작업 항목 등록
   
5. **검증 (Validate)**: 성공 기준 및 검증 방법 명시
   - 각 단계별 성공 기준 정의
   - 테스트 및 검증 방법 명시
   - 품질 게이트 및 승인 프로세스 설정

Key behaviors:
- 5단계 방법론을 일관되게 적용하여 체계적 계획 수립
- MCP 통합으로 프로젝트 컨텍스트 기반 심층 분석
- 계획서를 화면에 출력하고 사용자 Cursor 디렉토리의 `plans/` 폴더에 파일로 저장 (Bash로 환경 변수 자동 탐지)
- 주요 작업 항목은 TODO로 자동 등록하여 진행 관리

## MCP Integration
- **Sequential MCP**: 복잡한 작업을 다단계로 분해하고 체계적으로 분석
  - 작업 의존성 분석 및 순서 최적화
  - 각 단계별 상세 분석 및 검증
  - **반복 분석 지원**: 전파 영향이 완전히 파악될 때까지 분석 단계를 반복 수행
  
- **Serena MCP**: 프로젝트 메모리 및 심볼 분석으로 컨텍스트 파악
  - 프로젝트 구조 및 아키텍처 이해
  - 기존 코드 및 패턴 분석
  - 세션 간 컨텍스트 지속성 유지

## Tool Coordination
- **AskQuestion**: 인자 없이 실행 시 사용자에게 작업 내용 질문
- **Read**: 프로젝트 파일 및 컨텍스트 분석
- **Write**: `{CURSOR_PATH}/plans/{title}_{hash}.plan.md` 형식으로 계획서 저장 (Bash로 경로 탐지)
- **TodoWrite**: 주요 작업 항목을 TODO 리스트에 등록
- **Sequential MCP Tools**: 체계적 분석 및 계획 수립
- **Serena MCP Tools**: 프로젝트 컨텍스트 및 심볼 분석

## Key Patterns
- **5단계 워크플로우**: 확인 → 분석 → 계획 → 작업 → 검증 단계로 체계화
- **반복 분석 패턴**: 분석 → 영향 추적 → 새로운 발견 → 재분석 사이클을 완전히 파악될 때까지 반복
- **이중 출력**: 화면 출력 (마크다운) + 파일 저장 (`{CURSOR_PATH}/plans/*.plan.md`)
- **TODO 통합**: 계획서의 주요 작업을 TODO 항목으로 자동 등록
- **컨텍스트 기반**: MCP 통합으로 프로젝트 구조를 반영한 현실적 계획 수립

## Examples

### 기본 사용 - 인라인 메시지
```
/sc:task-planner 사용자 인증 시스템 구축
# "사용자 인증 시스템 구축"을 5단계로 분석하여 계획서 작성
# 화면에 출력 + {탐지된 Cursor 경로}/plans/사용자_인증_시스템_구축_a1b2c3d4.plan.md 저장
```

### 대화형 사용 - 메시지 없이 실행
```
/sc:task-planner
# → 질문: "어떤 작업의 계획을 수립하시겠습니까?"
# → 사용자 응답 후 계획서 작성
```

### 복잡한 프로젝트 - 여러 단계 계획
```
/sc:task-planner 마이크로서비스 아키텍처로 기존 모놀리식 시스템 마이그레이션
# Sequential MCP로 다단계 마이그레이션 전략 분석
# Serena MCP로 현재 시스템 구조 파악
# 상세한 단계별 계획 및 리스크 분석 포함
```

### 빠른 작업 - 간단한 작업 계획
```
/sc:task-planner API 문서 자동 생성 스크립트 작성
# 간단한 작업도 5단계로 구조화
# 누락 가능한 부분 (테스트, 검증) 명확히 정의
```

### 팀 협업 - 역할 분담 계획
```
/sc:task-planner 프론트엔드 성능 최적화 프로젝트
# Architect, Analyzer 페르소나 활성화
# 역할별 작업 분담 및 협업 포인트 명시
# TODO 항목으로 팀원별 할당 가능
```

## Boundaries

**Will:**
- 5단계 워크플로우를 적용하여 체계적인 계획서 자동 생성
- 프로젝트 컨텍스트를 반영한 현실적이고 실행 가능한 계획 수립
- 계획서를 화면 출력과 파일 저장으로 이중 제공
- 주요 작업 항목을 TODO로 등록하여 진행 관리 지원
- MCP 통합으로 심층 분석 및 컨텍스트 기반 계획 수립

**Will Not:**
- 계획서 없이 바로 작업을 실행하지 않음 (계획 먼저, 실행은 별도)
- 불완전하거나 검증되지 않은 계획을 승인하지 않음
- 사용자 확인 없이 프로젝트 파일을 수정하지 않음 (계획서만 생성)
- 지나치게 추상적이거나 실행 불가능한 계획을 제시하지 않음

---

## 내부 로직 (Claude 실행 가이드)

### 1단계: 사용자 메시지 수집

\`\`\`
IF $ARGUMENTS가 있으면:
  user_message = $ARGUMENTS
ELSE:
  AskQuestion 도구 사용:
  - 질문: "어떤 작업의 계획을 수립하시겠습니까?"
  - 답변을 user_message에 저장
\`\`\`

### 2단계: 5단계 워크플로우 적용

각 단계별로 다음 내용을 포함하여 계획서 작성:

**1️⃣ 확인 (Confirm)**
- 사용자가 요청한 작업의 핵심 요구사항
- 프로젝트 컨텍스트 (Serena MCP 활용)
- 명확히 해야 할 사항 또는 제약사항

**2️⃣ 분석 (Analyze) - 반복 수행**

LOOP (분석 완료될 때까지 반복):
  
  ITERATION N:
  - 작업 범위 및 경계 정의
  - 의존성 분석 (기술, 리소스, 타 작업)
  - 영향 범위 파악 (변경이 전파되는 모든 계층 식별)
  - 잠재적 리스크 및 대응 방안
  - 필요한 리소스 (인력, 도구, 시간)
  
  영향 전파 체크:
  - Read/Grep/SemanticSearch를 사용하여 영향받는 파일 탐색
  - 타입 변경 → Interface → Class → Service → Hook → UI 전파 경로 추적
  - 각 계층에서 추가로 영향받는 컴포넌트 발견
  
  종료 조건 판단:
  IF (새로운 영향 범위가 발견되지 않음 AND 모든 의존성이 파악됨):
    분석 완료 → 3단계(계획)로 진행
  ELSE:
    발견된 새로운 영향 범위를 포함하여 분석 반복

계획서에 기록:
- 총 반복 횟수 (예: "3회 반복 분석 수행")
- 각 반복에서 발견한 주요 영향 범위
- 최종 확정된 전체 영향 범위 목록

**3️⃣ 계획 (Plan)**
- 단계별 실행 계획 (논리적 순서)
- 각 단계의 체크리스트
- 마일스톤 및 중간 목표

**4️⃣ 작업 (Execute)**
- 구체적인 액션 아이템 리스트
- 각 작업의 담당자 (필요 시)
- 우선순위 (High/Medium/Low)

**5️⃣ 검증 (Validate)**
- 각 단계별 성공 기준
- 테스트 및 검증 방법
- 품질 게이트 및 승인 프로세스

### 3단계: 계획서 출력

마크다운 형식으로 화면에 출력:

\`\`\`markdown
# [작업명] 계획서

생성일시: YYYY-MM-DD HH:MM:SS
작성자: Claude AI (task-planner)

## 1️⃣ 확인 (Confirm)
[내용]

## 2️⃣ 분석 (Analyze)
[내용]

## 3️⃣ 계획 (Plan)
[내용]

## 4️⃣ 작업 (Execute)
[내용]

## 5️⃣ 검증 (Validate)
[내용]

---
**다음 단계**: 이 계획을 검토하고 승인되면 작업을 시작하세요.
\`\`\`

### 3.5단계: Cursor 경로 탐지 및 디렉토리 구성

**단계 1: Cursor 환경 변수 확인 (Bash 사용)**

Shell 도구로 Cursor가 설정한 환경 변수를 확인:

\`\`\`bash
# Cursor 사용자 데이터 경로 확인 (우선순위 1)
CURSOR_PATH=$(echo $CURSOR_USER_DATA)

# CURSOR_USER_DATA가 없으면 CURSOR_HOME 확인 (우선순위 2)
if [ -z "$CURSOR_PATH" ]; then
  CURSOR_PATH=$(echo $CURSOR_HOME)
fi

# Cursor 환경 변수가 없으면 XDG_CONFIG_HOME 확인 (Linux 표준, 우선순위 3)
if [ -z "$CURSOR_PATH" ] && [ -n "$XDG_CONFIG_HOME" ]; then
  CURSOR_PATH="$XDG_CONFIG_HOME/cursor"
fi

# 모든 Cursor 환경 변수가 없으면 OS별 기본 홈 사용 (우선순위 4)
if [ -z "$CURSOR_PATH" ]; then
  # Linux/macOS/WSL
  CURSOR_PATH="$HOME/.cursor"
  
  # Windows (PowerShell에서 실행 시)
  # CURSOR_PATH="$env:USERPROFILE\.cursor"
fi

# 최종 plans 디렉토리 경로
PLANS_DIR="$CURSOR_PATH/plans"
echo $PLANS_DIR
\`\`\`

**단계 2: 디렉토리 존재 확인 및 생성**

\`\`\`bash
# Linux/macOS/WSL
mkdir -p "$PLANS_DIR"

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "$PLANS_DIR"
\`\`\`

**단계 3: Claude 실행 로직**

1. **Shell 도구로 경로 탐지**:
   \`\`\`bash
   # 경로 탐지 스크립트 실행
   CURSOR_PATH=${CURSOR_USER_DATA:-${CURSOR_HOME:-${XDG_CONFIG_HOME:+$XDG_CONFIG_HOME/cursor}}}
   CURSOR_PATH=${CURSOR_PATH:-$HOME/.cursor}
   PLANS_DIR="$CURSOR_PATH/plans"
   echo $PLANS_DIR
   \`\`\`

2. **Shell 도구로 디렉토리 생성**:
   \`\`\`bash
   mkdir -p "$PLANS_DIR"
   \`\`\`

3. **경로를 변수에 저장**: Shell 명령어 출력을 파싱하여 `PLANS_DIR` 변수에 저장

4. **Write 도구로 파일 저장**:
   - 경로: `{PLANS_DIR}/{sanitized-title}_{hash}.plan.md`
   - 절대 경로 사용

**경로 탐지 결과 예시:**

| 환경 | 탐지된 경로 |
|---|---|
| Cursor 환경 변수 있음 | `/path/to/cursor-data/plans/` |
| Linux/WSL (기본) | `/home/username/.cursor/plans/` |
| macOS (기본) | `/Users/username/.cursor/plans/` |
| Windows (기본) | `C:\Users\username\.cursor\plans\` |
| 워크스페이스 폴백 | `/workspace/.cursor/plans/` |

### 4단계: 파일 저장

**전제 조건: Cursor 경로 탐지 및 디렉토리 생성**

Shell 도구로 Bash 스크립트 실행하여 Cursor 경로 탐지:
\`\`\`bash
# 1. Cursor 환경 변수 확인 (우선순위 높음)
CURSOR_PATH=${CURSOR_USER_DATA:-${CURSOR_HOME:-${XDG_CONFIG_HOME:+$XDG_CONFIG_HOME/cursor}}}

# 2. 환경 변수가 없으면 OS별 기본 홈 디렉토리 사용
CURSOR_PATH=${CURSOR_PATH:-$HOME/.cursor}

# 3. plans 디렉토리 경로 구성
PLANS_DIR="$CURSOR_PATH/plans"

# 4. 디렉토리 생성 (없으면 생성)
mkdir -p "$PLANS_DIR"

# 5. 경로 출력 (Claude가 파싱)
echo "$PLANS_DIR"
\`\`\`

**Windows (PowerShell) 환경:**
\`\`\`powershell
# Cursor 경로 탐지
$CURSOR_PATH = if ($env:CURSOR_USER_DATA) { $env:CURSOR_USER_DATA } 
               elseif ($env:CURSOR_HOME) { $env:CURSOR_HOME } 
               else { "$env:USERPROFILE\.cursor" }

# plans 디렉토리 생성
$PLANS_DIR = "$CURSOR_PATH\plans"
New-Item -ItemType Directory -Force -Path $PLANS_DIR
Write-Output $PLANS_DIR
\`\`\`

**Write 도구 사용:**

- 경로: `{PLANS_DIR}/{sanitized-title}_{hash}.plan.md`
- 탐지된 경로 예시:
  - Cursor 환경 변수 사용: `/custom/cursor/path/plans/작업명_12345678.plan.md`
  - Linux/WSL 기본: `/home/username/.cursor/plans/작업명_12345678.plan.md`
  - macOS 기본: `/Users/username/.cursor/plans/작업명_12345678.plan.md`
  - Windows 기본: `C:\Users\username\.cursor\plans\작업명_12345678.plan.md`
- 파일명 생성 규칙:
  - 작업명을 snake_case로 변환 (공백 → 언더스코어, 특수문자 제거)
  - 한글 작업명은 그대로 유지하고 공백만 언더스코어로 변환
  - 끝에 8자리 16진수 해시 추가 (무작위 생성 또는 타임스탬프 기반)
  - 예시:
    - 영문: `user_auth_system_a1b2c3d4.plan.md`
    - 한글: `사용자_인증_시스템_구축_f5e6d7c8.plan.md`
    - 혼합: `brochure_api_error_fix_ab1ee0e2.plan.md`

**경로 구성 로직:**

1. Shell 도구로 Bash 스크립트 실행 (위의 경로 탐지 스크립트)
2. 스크립트 출력을 파싱하여 `PLANS_DIR` 변수에 저장
3. 경로 조합: `{PLANS_DIR}/{파일명}`
4. Write 도구에 절대 경로 전달
5. 실패 시 워크스페이스 `.cursor/plans/`로 폴백

### 5단계: TODO 항목 등록

TodoWrite 도구 사용:
- "4️⃣ 작업 (Execute)" 섹션의 주요 액션 아이템을 TODO로 등록
- 각 TODO에 적절한 상태 (pending) 및 우선순위 반영
- 최대 10개 항목까지 등록 (너무 많으면 핵심만 선택)

### 6단계: 최종 메시지

\`\`\`
✅ 계획서 작성 완료!

📄 **파일 저장**: `{실제_탐지된_경로}/{title}_{hash}.plan.md`
📋 **TODO 등록**: {N}개 작업 항목 등록됨

**저장 위치 탐지 결과**:
- Cursor 환경 변수 감지: {탐지된 경로 또는 "없음"}
- 최종 저장 경로: {절대 경로}

**경로 탐지 우선순위**:
1. `$CURSOR_USER_DATA` 환경 변수
2. `$CURSOR_HOME` 환경 변수
3. `$XDG_CONFIG_HOME/cursor` (Linux 표준)
4. `$HOME/.cursor` (기본 홈 디렉토리)
5. `워크스페이스/.cursor` (폴백)

**OS별 예상 경로**:
- Linux/WSL: `/home/{username}/.cursor/plans/{title}_{hash}.plan.md`
- macOS: `/Users/{username}/.cursor/plans/{title}_{hash}.plan.md`
- Windows: `C:\Users\{username}\.cursor\plans\{title}_{hash}.plan.md`

**다음 단계**:
1. 계획서를 검토하고 필요시 수정
2. 계획이 승인되면 TODO 항목을 진행
3. 각 단계별 검증 기준을 확인하며 작업 진행
\`\`\`

---

**버전**: 1.2.0  
**최종 업데이트**: 2026-01-23  
**작성자**: SuperClaude Commands System  
**변경 이력**:
- v1.2.0 - Bash 기반 Cursor 환경 변수 탐지 로직 추가 (사용자별 경로 자동 구성)
- v1.1.0 - 분석 단계 반복 로직 추가 (완전한 영향 전파 분석)
