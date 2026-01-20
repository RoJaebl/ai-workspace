# 아키텍처 분석 가이드

## 목차
1. [분석 체크리스트](#분석-체크리스트)
2. [레이어 패턴 검증](#레이어-패턴-검증)
3. [의존성 분석](#의존성-분석)
4. [일반적인 문제점](#일반적인-문제점)

## 분석 체크리스트

### 폴더 구조

```bash
# 프로젝트 구조 시각화
find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" | head -30

# 주요 진입점 확인
ls -la src/ app/ lib/ 2>/dev/null
```

**확인 항목:**
- [ ] 관심사 분리 (Separation of Concerns)
- [ ] 단일 책임 원칙 준수
- [ ] 명확한 레이어 구분
- [ ] 일관된 네이밍 컨벤션

### 의존성 방향

```bash
# import 문 분석 (TypeScript/JavaScript)
grep -r "import.*from" src/ --include="*.ts" | head -50

# 순환 참조 탐지 패턴
# A → B → C → A 형태 확인
```

## 레이어 패턴 검증

### Clean Architecture

```
┌─────────────────────────────────────┐
│           Presentation              │  ← UI, Controllers
├─────────────────────────────────────┤
│           Application               │  ← Use Cases, Services
├─────────────────────────────────────┤
│             Domain                  │  ← Entities, Business Logic
├─────────────────────────────────────┤
│          Infrastructure             │  ← DB, External APIs
└─────────────────────────────────────┘
```

**검증 기준:**
- Domain은 외부 의존성 없음
- Application은 Domain만 참조
- Infrastructure는 모든 레이어 구현 가능
- Presentation은 Application 호출

### Hexagonal Architecture

```
        ┌─── Port ───┐
Adapter │   Domain   │ Adapter
        └─── Port ───┘
```

**검증 기준:**
- Port(인터페이스) 정의 존재
- Adapter가 Port 구현
- Domain이 Port만 의존

## 의존성 분석

### 순환 참조 탐지

```typescript
// ❌ Bad: 순환 참조
// file: a.ts
import { B } from './b';
// file: b.ts
import { A } from './a';

// ✅ Good: 인터페이스로 분리
// file: interfaces.ts
export interface IA { ... }
export interface IB { ... }
```

### 의존성 역전 확인

```typescript
// ❌ Bad: 구체 클래스 직접 의존
import { MySQLDatabase } from './mysql';

// ✅ Good: 인터페이스 의존
import { IDatabase } from './interfaces';
```

## 일반적인 문제점

| 문제 | 증상 | 해결책 |
|------|------|--------|
| **순환 참조** | 컴파일 에러, 런타임 undefined | 인터페이스 분리, 의존성 역전 |
| **레이어 침범** | Domain이 Infrastructure 직접 참조 | Port/Adapter 패턴 적용 |
| **과도한 결합** | 한 파일 수정 시 다수 파일 영향 | 모듈화, 인터페이스 도입 |
| **불명확한 경계** | 비즈니스 로직이 여러 레이어에 분산 | 레이어 책임 재정의 |

## 권장 폴더 구조

### Frontend (React/Next.js)

```
src/
├── components/     # 재사용 UI 컴포넌트
├── features/       # 기능별 모듈
├── hooks/          # 커스텀 훅
├── services/       # API 호출
├── stores/         # 상태 관리
├── types/          # 타입 정의
└── utils/          # 유틸리티
```

### Backend (Node.js/NestJS)

```
src/
├── modules/        # 도메인별 모듈
│   └── user/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       └── dto/
├── common/         # 공통 코드
├── config/         # 설정
└── infrastructure/ # 외부 연동
```
