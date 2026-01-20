# 마이그레이션 (Migration)

버전 업그레이드, 기술 스택 변경을 위한 상세 가이드입니다.

## 목차
- [마이그레이션 전략](#마이그레이션-전략)
- [일반적인 마이그레이션 유형](#일반적인-마이그레이션-유형)
- [안전한 마이그레이션 절차](#안전한-마이그레이션-절차)
- [롤백 계획](#롤백-계획)

---

## 마이그레이션 전략

### Big Bang vs 점진적

| 전략 | 장점 | 단점 | 적합한 경우 |
|------|------|------|-------------|
| **Big Bang** | 빠른 완료, 깔끔한 전환 | 위험 높음, 롤백 어려움 | 작은 프로젝트, 테스트 충분 |
| **점진적** | 위험 분산, 롤백 용이 | 시간 오래 걸림, 복잡도 | 대규모 프로젝트, 운영 중 |

### Strangler Fig 패턴

```
기존 시스템을 점진적으로 대체:

1. 새 기능은 새 시스템에 구현
2. 기존 기능을 하나씩 마이그레이션
3. 기존 시스템으로의 트래픽 점진적 감소
4. 완전히 대체되면 기존 시스템 제거
```

### 병렬 실행 패턴

```
두 시스템을 동시에 운영:

1. 두 시스템에 동일 요청 전송
2. 결과 비교 (Shadow Mode)
3. 불일치 시 로깅 및 분석
4. 충분한 검증 후 전환
```

---

## 일반적인 마이그레이션 유형

### 프레임워크 버전 업그레이드

```bash
# 예: React 17 → 18

# 1. 변경사항 확인
# Context7 MCP로 마이그레이션 가이드 조회

# 2. 의존성 업데이트
npm install react@18 react-dom@18

# 3. Breaking Changes 처리
# - createRoot API 변경
# - Automatic Batching
# - Strict Mode 변경

# 4. 코드 수정 (codemod 활용)
npx react-codemod update-react-imports

# 5. 테스트 실행
npm test
```

### 빌드 도구 마이그레이션

```javascript
// Webpack → Vite 예시

// 1. Vite 설치
// npm install vite @vitejs/plugin-react

// 2. vite.config.ts 생성
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // 기존 alias 유지
    },
  },
});

// 3. index.html 수정 (Vite는 루트에 index.html 필요)

// 4. 환경 변수 마이그레이션
// REACT_APP_* → VITE_*

// 5. import 문법 수정
// require() → import
```

### 상태 관리 마이그레이션

```typescript
// Redux → Zustand 예시

// 기존 Redux
const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
});

// Zustand로 마이그레이션
import { create } from 'zustand';

// 1. 스토어 생성
interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// 2. 컴포넌트 업데이트
// Before: useSelector, useDispatch
// After: useUserStore

// 3. 점진적 마이그레이션 (병행 운영)
// - 새 기능: Zustand
// - 기존 기능: Redux 유지
// - 점진적 전환
```

### 데이터베이스 마이그레이션

```sql
-- 스키마 변경 예시

-- 1. 새 컬럼 추가 (기본값 설정)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- 2. 데이터 마이그레이션
UPDATE users SET email_verified = true WHERE verified_at IS NOT NULL;

-- 3. 애플리케이션 코드 배포 (새 컬럼 사용)

-- 4. 기존 컬럼 제거 (충분한 검증 후)
ALTER TABLE users DROP COLUMN verified_at;
```

### API 버전 마이그레이션

```typescript
// v1 → v2 API 마이그레이션

// 1. 버전 공존
app.use('/api/v1', v1Router);  // 기존 유지
app.use('/api/v2', v2Router);  // 새 버전

// 2. 응답 변환 레이어
function transformV1ToV2(v1Response) {
  return {
    data: v1Response.result,  // 필드명 변경
    meta: {
      total: v1Response.count,
      page: v1Response.page,
    },
  };
}

// 3. 클라이언트 점진적 업데이트

// 4. v1 Deprecation 공지
// - 응답 헤더: Deprecation: true
// - Sunset 헤더: Sunset: Sat, 31 Dec 2024

// 5. v1 제거
```

---

## 안전한 마이그레이션 절차

### 1단계: 현재 상태 분석

```
체크리스트:
- [ ] 현재 버전/스택 문서화
- [ ] 의존성 목록 및 버전
- [ ] 커스터마이징 항목 식별
- [ ] 테스트 커버리지 확인
- [ ] 성능 베이스라인 측정
```

### 2단계: 호환성 검토

```
검토 항목:
- [ ] Breaking Changes 목록
- [ ] Deprecation 경고 확인
- [ ] 서드파티 라이브러리 호환성
- [ ] 브라우저/런타임 지원 범위
```

### 3단계: 마이그레이션 계획

```
계획 항목:
- [ ] 작업 단위 분리
- [ ] 우선순위 결정
- [ ] 타임라인 설정
- [ ] 롤백 기준 정의
- [ ] 담당자 지정
```

### 4단계: 실행

```
실행 순서:
1. Feature branch 생성
2. 의존성 업데이트
3. Breaking changes 처리
4. 테스트 실행 및 수정
5. 스테이징 배포 및 검증
6. 프로덕션 배포 (점진적)
```

### 5단계: 검증

```
검증 항목:
- [ ] 모든 테스트 통과
- [ ] 성능 지표 비교
- [ ] 에러율 모니터링
- [ ] 사용자 피드백 수집
```

---

## 롤백 계획

### 롤백 기준

```
자동 롤백 트리거:
- 에러율 > 5%
- 응답 시간 > 2x 기존
- 핵심 기능 장애

수동 롤백 판단:
- 사용자 불만 급증
- 데이터 무결성 문제
- 보안 취약점 발견
```

### 롤백 절차

```bash
# 코드 롤백
git revert HEAD
# 또는
git checkout v1.2.3

# 의존성 롤백
npm install package@previous-version

# 데이터베이스 롤백 (마이그레이션 도구 사용)
npm run migrate:down

# 배포 롤백 (Kubernetes 예시)
kubectl rollout undo deployment/app
```

### 데이터 롤백 전략

```
1. 스키마 변경 시:
   - 항상 역방향 마이그레이션 스크립트 준비
   - 데이터 손실 없는 변경만 우선 적용

2. 데이터 변환 시:
   - 원본 데이터 백업
   - 변환 전 스냅샷 유지
   - 복원 스크립트 테스트

3. 포인트-인-타임 복구:
   - DB 스냅샷 주기적 생성
   - WAL/binlog 보관
   - 복구 절차 사전 테스트
```

### 체크리스트

```
마이그레이션 완료 전:
- [ ] 롤백 스크립트 준비됨
- [ ] 롤백 테스트 완료
- [ ] 모니터링 대시보드 설정
- [ ] 온콜 담당자 지정
- [ ] 커뮤니케이션 채널 준비
```
