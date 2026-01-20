# 테스트 분석 가이드

## 목차
1. [커버리지 분석](#커버리지-분석)
2. [테스트 품질 평가](#테스트-품질-평가)
3. [테스트 유형별 검토](#테스트-유형별-검토)
4. [테스트 안티패턴](#테스트-안티패턴)

## 커버리지 분석

### 커버리지 측정

```bash
# Jest (JavaScript/TypeScript)
npm test -- --coverage
npx jest --coverage --coverageReporters=text-summary

# pytest (Python)
pytest --cov=src --cov-report=term-missing

# 커버리지 리포트 위치
# coverage/lcov-report/index.html
```

### 커버리지 기준

| 유형 | 설명 | 목표 |
|------|------|------|
| **Line** | 실행된 라인 비율 | 80%+ |
| **Branch** | 분기 경로 비율 | 70%+ |
| **Function** | 호출된 함수 비율 | 90%+ |
| **Statement** | 실행된 구문 비율 | 80%+ |

### 커버리지 갭 분석

```bash
# 테스트 안 된 파일 찾기
find src -name "*.ts" | while read f; do
  test_file="${f%.ts}.test.ts"
  [ ! -f "$test_file" ] && echo "Missing: $test_file"
done
```

## 테스트 품질 평가

### 좋은 테스트의 특성 (F.I.R.S.T)

| 원칙 | 설명 | 검증 방법 |
|------|------|----------|
| **Fast** | 빠르게 실행 | 전체 테스트 < 5분 |
| **Isolated** | 독립적 실행 | 순서 무관 실행 |
| **Repeatable** | 반복 가능 | 환경 무관 동일 결과 |
| **Self-validating** | 자동 검증 | 수동 확인 불필요 |
| **Timely** | 적시 작성 | 코드와 함께 |

### AAA 패턴 준수

```typescript
// ✅ Good: AAA 패턴
test('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10, qty: 2 }, { price: 5, qty: 1 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(25);
});
```

## 테스트 유형별 검토

### 단위 테스트 (Unit)

```bash
# 단위 테스트 파일 탐지
find . -name "*.test.ts" -o -name "*.spec.ts" | wc -l

# 모킹 사용 패턴
grep -r "jest.mock\|vi.mock\|sinon" --include="*.test.ts"
```

**검토 포인트:**
- [ ] 함수당 최소 1개 테스트
- [ ] 경계값 테스트 포함
- [ ] 에러 케이스 테스트
- [ ] 외부 의존성 모킹

### 통합 테스트 (Integration)

```typescript
// API 통합 테스트 예시
describe('POST /api/users', () => {
  it('should create user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@test.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

**검토 포인트:**
- [ ] 주요 API 엔드포인트 테스트
- [ ] 데이터베이스 연동 테스트
- [ ] 외부 서비스 연동 테스트

### E2E 테스트 (End-to-End)

```typescript
// Playwright E2E 예시
test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

**검토 포인트:**
- [ ] 핵심 사용자 시나리오 커버
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 뷰포트 테스트

## 테스트 안티패턴

### 탐지 패턴

```bash
# 빈 테스트 탐지
grep -r "test\|it" --include="*.test.ts" -A 3 | grep -B 2 "expect\|assert" | grep -v "expect\|assert"

# 너무 많은 assertion
grep -c "expect\|assert" **/*.test.ts | awk -F: '$2 > 10 {print}'
```

### 안티패턴 목록

| 안티패턴 | 문제점 | 해결책 |
|----------|--------|--------|
| **Flaky Test** | 때때로 실패 | 타이밍 문제 해결, 결정적 테스트 |
| **Test Pollution** | 테스트 간 상태 공유 | beforeEach로 초기화 |
| **Giant Test** | 하나의 테스트가 너무 큼 | 테스트 분리 |
| **Mystery Guest** | 외부 파일/데이터 의존 | 인라인 테스트 데이터 |
| **Test Logic** | 테스트에 로직 포함 | 단순한 assertion |
| **Mockery** | 과도한 모킹 | 실제 객체 사용 검토 |

### 테스트 리팩토링 포인트

```typescript
// ❌ Bad: 중복된 설정
test('test1', () => {
  const user = new User('test', 'test@test.com');
  // ...
});
test('test2', () => {
  const user = new User('test', 'test@test.com');
  // ...
});

// ✅ Good: 공통 설정 추출
describe('User', () => {
  let user: User;
  beforeEach(() => {
    user = new User('test', 'test@test.com');
  });
  test('test1', () => { /* ... */ });
  test('test2', () => { /* ... */ });
});
```

## 테스트 메트릭

| 메트릭 | 계산 방법 | 건강한 값 |
|--------|----------|----------|
| **Test/Code Ratio** | 테스트 라인 / 코드 라인 | 0.5-1.0 |
| **Mutation Score** | 잡은 변이 / 전체 변이 | 70%+ |
| **Test Speed** | 전체 실행 시간 | < 5분 |
| **Flaky Rate** | 불안정 테스트 비율 | < 1% |
