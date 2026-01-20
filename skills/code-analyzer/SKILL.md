---
name: code-analyzer
description: 코드베이스 분석 전문 스킬. 아키텍처, 디자인 패턴, 마이그레이션, 리팩토링, 보안, 테스트 도메인별 심층 분석을 수행합니다. 사용 시점: (1) 프로젝트 구조/아키텍처 평가, (2) 디자인 패턴 식별 및 개선, (3) 기술 마이그레이션 계획, (4) 리팩토링 대상 식별, (5) 보안 취약점 스캔, (6) 테스트 커버리지/품질 분석이 필요할 때.
---

# Code Analyzer

## 분석 워크플로우

```
1. Discover  → 파일 탐색, 프로젝트 구조 파악
2. Scan      → 도메인별 패턴 매칭, 정적 분석
3. Evaluate  → 심각도 평가, 우선순위 결정
4. Recommend → 개선 권장사항 생성
5. Report    → 결과 리포트 작성
```

## 도메인 선택 가이드

| 도메인 | 트리거 키워드 | 분석 대상 |
|--------|--------------|-----------|
| **architecture** | 구조, 레이어, 모듈, 의존성 | 폴더 구조, import 관계, 순환 참조 |
| **design-patterns** | 패턴, 싱글톤, 팩토리, SOLID | 클래스 구조, 인터페이스, 추상화 |
| **migration** | 마이그레이션, 업그레이드, 버전 | 의존성 버전, deprecated API |
| **refactoring** | 리팩토링, 코드 스멜, 복잡도 | 중복 코드, 긴 함수, 복잡도 |
| **security** | 보안, 취약점, XSS, SQL인젝션 | 입력 검증, 인증/인가, 암호화 |
| **testing** | 테스트, 커버리지, 품질 | 테스트 파일, 커버리지, 모킹 |

## 기본 분석 절차

### 1. 프로젝트 탐색

```bash
# 프로젝트 구조 파악
ls -la && find . -type f -name "*.ts" | head -20

# 주요 설정 파일 확인
cat package.json  # Node.js
cat pyproject.toml  # Python
cat pom.xml  # Java
```

### 2. 도메인별 분석 실행

도메인에 따라 해당 참조 문서를 로드:

- **아키텍처**: [references/architecture.md](references/architecture.md)
- **디자인 패턴**: [references/design-patterns.md](references/design-patterns.md)
- **마이그레이션**: [references/migration.md](references/migration.md)
- **리팩토링**: [references/refactoring.md](references/refactoring.md)
- **보안**: [references/security.md](references/security.md)
- **테스트**: [references/testing.md](references/testing.md)

### 3. 결과 보고 형식

```markdown
## 분석 결과 요약

### 발견 사항 (Findings)
| 심각도 | 항목 | 위치 | 설명 |
|--------|------|------|------|
| 🔴 Critical | ... | ... | ... |
| 🟠 High | ... | ... | ... |
| 🟡 Medium | ... | ... | ... |
| 🟢 Low | ... | ... | ... |

### 권장 사항 (Recommendations)
1. [우선순위 높음] ...
2. [우선순위 중간] ...
3. [우선순위 낮음] ...

### 다음 단계
- [ ] 즉시 조치 필요 항목
- [ ] 단기 개선 항목
- [ ] 장기 개선 항목
```

## 심각도 기준

| 등급 | 설명 | 조치 시점 |
|------|------|----------|
| 🔴 **Critical** | 즉시 수정 필요 (보안, 데이터 손실 위험) | 즉시 |
| 🟠 **High** | 빠른 수정 권장 (성능, 안정성 영향) | 1주 이내 |
| 🟡 **Medium** | 개선 권장 (유지보수성, 가독성) | 1개월 이내 |
| 🟢 **Low** | 선택적 개선 (스타일, 최적화) | 백로그 |

## 다중 도메인 분석

여러 도메인을 동시에 분석할 때:

1. 각 도메인별 참조 문서 순차 로드
2. 발견 사항을 통합 테이블로 정리
3. 도메인 간 연관 이슈 식별 (예: 보안 → 리팩토링 필요)
4. 우선순위 통합 결정
