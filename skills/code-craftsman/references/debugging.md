# 디버깅 (Debugging)

버그 수정, 오류 분석을 위한 상세 가이드입니다.

## 목차
- [디버깅 워크플로우](#디버깅-워크플로우)
- [버그 유형별 접근법](#버그-유형별-접근법)
- [디버깅 도구 활용](#디버깅-도구-활용)
- [일반적인 버그 패턴](#일반적인-버그-패턴)

---

## 디버깅 워크플로우

### 1단계: 증상 수집

```
필수 정보:
- 에러 메시지 (전체 스택 트레이스)
- 재현 조건 (언제, 어떤 입력으로)
- 기대 동작 vs 실제 동작
- 환경 (브라우저, OS, 버전)
- 최근 변경 사항
```

### 2단계: 재현

```
재현 체크리스트:
- [ ] 로컬에서 재현 가능?
- [ ] 최소 재현 케이스 (Minimal Reproduction)
- [ ] 일관성 (항상 발생? 간헐적?)
- [ ] 특정 환경에서만?
```

### 3단계: 가설 수립

```
원인 범위 좁히기:

"로그인이 안 됩니다" →
  - 프론트엔드 문제? (네트워크 탭 확인)
  - API 문제? (서버 로그 확인)
  - DB 문제? (데이터 확인)
  - 인증 서비스 문제? (외부 서비스 상태)
```

### 4단계: 검증

```
가설 검증 방법:
- 로그 추가
- 브레이크포인트 설정
- 단위 테스트 작성
- 이분 탐색 (git bisect)
```

### 5단계: 수정

```
수정 원칙:
1. 근본 원인 해결 (증상만 가리지 않기)
2. 회귀 테스트 작성
3. 유사 케이스 확인
4. 코드 리뷰 요청
```

### 6단계: 회고

```
문서화:
- 원인이 무엇이었나?
- 왜 발생했나?
- 어떻게 방지할 수 있나?
- 모니터링 추가 필요한가?
```

---

## 버그 유형별 접근법

### 런타임 에러

```typescript
// TypeError: Cannot read property 'x' of undefined
// 접근법: null/undefined 체인 추적

// 원인 예시
const user = getUser(id);  // undefined 반환
console.log(user.name);    // 에러!

// 해결
const user = getUser(id);
if (!user) {
  throw new Error(`User not found: ${id}`);
}
console.log(user.name);

// 또는 옵셔널 체이닝
console.log(user?.name ?? 'Unknown');
```

### 논리 에러

```typescript
// 잘못된 결과, 에러 없음
// 접근법: 중간값 로깅, 단위 테스트

// 원인 예시
function calculateDiscount(price: number, rate: number) {
  return price * rate;  // 버그: rate가 퍼센트(20)인데 비율(0.2)로 사용
}

// 디버깅
function calculateDiscount(price: number, rate: number) {
  console.log('Input:', { price, rate });
  const discount = price * rate;
  console.log('Output:', discount);
  return discount;
}

// 수정
function calculateDiscount(price: number, ratePercent: number) {
  return price * (ratePercent / 100);
}
```

### 비동기 에러

```typescript
// 레이스 컨디션, 타이밍 문제
// 접근법: 상태 흐름 추적, async/await 확인

// 원인 예시
let data;
fetchData().then(result => { data = result; });
console.log(data);  // undefined! (비동기 완료 전)

// 수정
const data = await fetchData();
console.log(data);
```

### 메모리 문제

```typescript
// 메모리 누수
// 접근법: 힙 스냅샷, 이벤트 리스너 확인

// 원인 예시 (React)
useEffect(() => {
  const interval = setInterval(fetchData, 1000);
  // cleanup 없음 → 메모리 누수
}, []);

// 수정
useEffect(() => {
  const interval = setInterval(fetchData, 1000);
  return () => clearInterval(interval);  // cleanup 추가
}, []);
```

### 성능 문제

```typescript
// 느린 응답, 높은 CPU 사용
// 접근법: 프로파일링, 복잡도 분석

// 원인 예시
function findDuplicates(arr: number[]) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {  // O(n²)
      if (arr[i] === arr[j]) duplicates.push(arr[i]);
    }
  }
  return duplicates;
}

// 수정: O(n)
function findDuplicates(arr: number[]) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  }
  return [...duplicates];
}
```

---

## 디버깅 도구 활용

### Console 기법

```typescript
// 기본 로깅
console.log('Value:', value);

// 객체 전체 출력
console.dir(object, { depth: null });

// 테이블 형식
console.table(arrayOfObjects);

// 그룹핑
console.group('API Call');
console.log('Request:', request);
console.log('Response:', response);
console.groupEnd();

// 조건부 로깅
console.assert(condition, 'Assertion failed:', data);

// 타이밍 측정
console.time('operation');
await heavyOperation();
console.timeEnd('operation');

// 스택 트레이스
console.trace('How did we get here?');
```

### 브레이크포인트 전략

```
1. 에러 발생 지점에 설정
2. 조건부 브레이크포인트 (특정 값일 때만)
3. 로그포인트 (중단 없이 로그만)
4. 예외 시 자동 중단 설정
```

### Git Bisect

```bash
# 버그가 언제 도입되었는지 찾기
git bisect start
git bisect bad                 # 현재 커밋은 버그 있음
git bisect good v1.0.0         # 이 버전은 정상이었음

# Git이 중간 커밋으로 이동
# 테스트 후:
git bisect good  # 또는
git bisect bad

# 반복하면 버그 도입 커밋 발견
git bisect reset  # 완료 후 리셋
```

---

## 일반적인 버그 패턴

### Off-by-One 에러

```typescript
// 배열 인덱스, 반복문 경계

// 버그
for (let i = 0; i <= arr.length; i++) { ... }  // <= 대신 <

// 수정
for (let i = 0; i < arr.length; i++) { ... }
```

### 참조 vs 값

```typescript
// 객체 복사 문제

// 버그
const copy = original;  // 같은 참조!
copy.value = 'changed';
console.log(original.value);  // 'changed'

// 수정
const copy = { ...original };  // 얕은 복사
const deepCopy = structuredClone(original);  // 깊은 복사
```

### 부동소수점

```typescript
// 부동소수점 정밀도

// 버그
0.1 + 0.2 === 0.3  // false!

// 수정
Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON  // true
// 또는 정수로 계산
(10 + 20) / 100 === 0.3  // true
```

### 클로저 문제

```typescript
// 반복문 내 클로저

// 버그
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 출력: 3, 3, 3

// 수정 1: let 사용
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// 수정 2: 즉시 실행 함수
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i);
}
```

### 상태 동기화

```typescript
// 여러 곳에서 상태 관리

// 버그: 상태 불일치
updateLocalState(newValue);
// API 호출 실패 시 로컬만 업데이트됨

// 수정: 낙관적 업데이트 + 롤백
const previousValue = state;
updateLocalState(newValue);
try {
  await api.update(newValue);
} catch {
  updateLocalState(previousValue);  // 롤백
  throw;
}
```
