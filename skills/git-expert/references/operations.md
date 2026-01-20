# Git 작업 가이드

## 상태 분석

### 기본 상태 확인

```bash
# 현재 상태 요약
git status --short

# 변경사항 통계
git diff --stat

# 스테이징된 변경사항
git diff --staged --stat

# 최근 커밋 히스토리
git log --oneline -10

# 현재 브랜치 정보
git branch -vv
```

### 상태 해석

| 기호 | 의미                    |
|------|-------------------------|
| `M`  | 수정됨 (Modified)       |
| `A`  | 추가됨 (Added)          |
| `D`  | 삭제됨 (Deleted)        |
| `R`  | 이름 변경 (Renamed)     |
| `C`  | 복사됨 (Copied)         |
| `U`  | 충돌 (Unmerged)         |
| `??` | 추적되지 않음 (Untracked) |

### 변경사항 상세 분석

```bash
# 특정 파일 변경 내용
git diff <file>

# 특정 커밋과 비교
git diff <commit> -- <file>

# 두 브랜치 비교
git diff <branch1>..<branch2>

# 변경된 함수/메서드 확인
git diff -p --stat
```

## 브랜치 관리

### 브랜치 네이밍 컨벤션

| 접두사      | 용도                    | 예시                        |
|-------------|-------------------------|-----------------------------|
| `feature/`  | 새 기능 개발            | `feature/jwt-refresh`       |
| `fix/`      | 버그 수정               | `fix/payment-calculation`   |
| `hotfix/`   | 긴급 수정               | `hotfix/security-patch`     |
| `release/`  | 릴리스 준비             | `release/v1.2.0`            |
| `refactor/` | 리팩토링                | `refactor/auth-module`      |
| `docs/`     | 문서 작업               | `docs/api-documentation`    |

### 브랜치 작업

```bash
# 새 브랜치 생성 및 전환
git checkout -b <branch-name>
# 또는
git switch -c <branch-name>

# 브랜치 전환
git checkout <branch-name>
# 또는
git switch <branch-name>

# 브랜치 목록 (로컬 + 원격)
git branch -a

# 브랜치 삭제 (로컬)
git branch -d <branch-name>   # 병합된 브랜치만
git branch -D <branch-name>   # 강제 삭제

# 브랜치 삭제 (원격)
git push origin --delete <branch-name>

# 원격 브랜치 추적
git checkout -b <local-branch> origin/<remote-branch>
```

### 브랜치 정리

```bash
# 병합된 로컬 브랜치 목록
git branch --merged

# 병합된 브랜치 일괄 삭제
git branch --merged | grep -v '\*\|main\|master' | xargs -n 1 git branch -d

# 원격에서 삭제된 브랜치 정리
git fetch --prune
```

## 병합 (Merge)

### 병합 전략

```bash
# 일반 병합 (merge commit 생성)
git merge <branch>

# Fast-forward 병합 (가능한 경우)
git merge --ff-only <branch>

# 항상 merge commit 생성
git merge --no-ff <branch>

# Squash 병합 (커밋 하나로 합치기)
git merge --squash <branch>
git commit -m "병합 메시지"
```

### 충돌 해결

```bash
# 충돌 상태 확인
git status

# 충돌 파일 확인
git diff --name-only --diff-filter=U

# 충돌 해결 후
git add <resolved-files>
git commit

# 병합 취소
git merge --abort
```

### 충돌 해결 가이드

1. **충돌 마커 이해**:
   ```
   <<<<<<< HEAD
   현재 브랜치의 코드
   =======
   병합하려는 브랜치의 코드
   >>>>>>> branch-name
   ```

2. **해결 전략**:
   - 두 변경사항 중 하나 선택
   - 두 변경사항 모두 유지 (순서 조정)
   - 새로운 코드로 대체

3. **충돌 해결 확인**:
   ```bash
   # 충돌 마커 검색
   git diff --check
   ```

## 리베이스 (Rebase)

### 기본 리베이스

```bash
# 다른 브랜치 위로 리베이스
git rebase <base-branch>

# 대화형 리베이스 (커밋 정리)
git rebase -i HEAD~<n>

# 리베이스 취소
git rebase --abort

# 리베이스 계속
git rebase --continue
```

### 대화형 리베이스 명령어

| 명령어   | 용도                              |
|----------|-----------------------------------|
| `pick`   | 커밋 유지                         |
| `reword` | 커밋 메시지 수정                  |
| `edit`   | 커밋 수정 (파일 변경 가능)        |
| `squash` | 이전 커밋과 합치기 (메시지 병합)  |
| `fixup`  | 이전 커밋과 합치기 (메시지 버림)  |
| `drop`   | 커밋 삭제                         |

### 리베이스 주의사항

- ⚠️ 이미 푸시된 커밋은 리베이스 금지
- ⚠️ 공유 브랜치에서 리베이스 금지
- ✅ 로컬 커밋 정리에만 사용

## 스태시 (Stash)

```bash
# 현재 변경사항 저장
git stash

# 메시지와 함께 저장
git stash push -m "작업 중인 기능"

# 스태시 목록
git stash list

# 최근 스태시 적용 (유지)
git stash apply

# 최근 스태시 적용 및 삭제
git stash pop

# 특정 스태시 적용
git stash apply stash@{n}

# 스태시 삭제
git stash drop stash@{n}

# 모든 스태시 삭제
git stash clear
```

## 커밋 수정

### 최근 커밋 수정

```bash
# 메시지만 수정
git commit --amend -m "새 메시지"

# 파일 추가 후 커밋에 포함
git add <file>
git commit --amend --no-edit
```

### Amend 주의사항

- ⚠️ 이미 푸시된 커밋은 amend 금지
- ⚠️ 다른 사람이 만든 커밋은 amend 금지
- ✅ 방금 만든 로컬 커밋만 amend

## 히스토리 조회

```bash
# 그래프 형태로 보기
git log --graph --oneline --all

# 특정 파일 히스토리
git log --follow -p -- <file>

# 특정 작성자 커밋
git log --author="<name>"

# 날짜 범위
git log --since="2024-01-01" --until="2024-12-31"

# 커밋 메시지 검색
git log --grep="<pattern>"

# 코드 변경 검색
git log -S "<code>" --oneline

# 커밋별 변경 통계
git log --stat
```

## 원격 저장소

### 기본 작업

```bash
# 원격 저장소 목록
git remote -v

# 원격 저장소 추가
git remote add <name> <url>

# 원격에서 가져오기 (병합 안 함)
git fetch origin

# 원격에서 가져오기 + 병합
git pull origin <branch>

# 원격으로 푸시
git push origin <branch>

# 원격 브랜치 추적 설정
git push -u origin <branch>
```

### Pull 전략

```bash
# 병합 (기본)
git pull

# 리베이스
git pull --rebase

# Fast-forward만
git pull --ff-only
```

## 되돌리기

### Reset vs Revert

| 명령어   | 용도                              | 히스토리 |
|----------|-----------------------------------|----------|
| `reset`  | 커밋 삭제 (로컬 전용)             | 변경됨   |
| `revert` | 커밋 되돌리기 (새 커밋 생성)      | 유지됨   |

### Reset

```bash
# 커밋 취소 (변경사항 스테이징 유지)
git reset --soft HEAD~1

# 커밋 취소 (변경사항 unstaged)
git reset --mixed HEAD~1  # 기본값

# 커밋 취소 (변경사항 삭제) ⚠️
git reset --hard HEAD~1
```

### Revert

```bash
# 특정 커밋 되돌리기
git revert <commit>

# 여러 커밋 되돌리기
git revert <oldest>..<newest>

# 병합 커밋 되돌리기
git revert -m 1 <merge-commit>
```

## 태그

```bash
# 태그 목록
git tag

# 태그 생성 (lightweight)
git tag <tag-name>

# 태그 생성 (annotated)
git tag -a <tag-name> -m "메시지"

# 특정 커밋에 태그
git tag -a <tag-name> <commit>

# 태그 푸시
git push origin <tag-name>
git push origin --tags  # 모든 태그

# 태그 삭제
git tag -d <tag-name>           # 로컬
git push origin --delete <tag-name>  # 원격
```

## 유용한 설정

```bash
# 글로벌 사용자 설정
git config --global user.name "이름"
git config --global user.email "email@example.com"

# 기본 브랜치 이름
git config --global init.defaultBranch main

# 줄바꿈 처리 (Windows)
git config --global core.autocrlf true

# 줄바꿈 처리 (Mac/Linux)
git config --global core.autocrlf input

# 에디터 설정
git config --global core.editor "code --wait"

# 별칭 설정
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --graph --oneline --all"
```

## 문제 해결

### 실수로 커밋한 파일 제거

```bash
# .gitignore에 추가 후
git rm --cached <file>
git commit -m "chore: 불필요한 파일 추적 제거"
```

### 잘못된 브랜치에서 작업한 경우

```bash
# 변경사항 스태시
git stash

# 올바른 브랜치로 전환
git checkout <correct-branch>

# 스태시 적용
git stash pop
```

### 푸시 전 마지막 커밋 취소

```bash
git reset --soft HEAD~1
# 수정 후 다시 커밋
```

### 특정 커밋의 파일만 가져오기

```bash
git checkout <commit> -- <file>
```
