# 리팩토링 (Refactoring)

코드 품질 개선, 구조 변경을 위한 상세 가이드입니다.

## 목차
- [리팩토링 원칙](#리팩토링-원칙)
- [코드 스멜 카탈로그](#코드-스멜-카탈로그)
- [리팩토링 기법](#리팩토링-기법)
- [안전한 리팩토링 절차](#안전한-리팩토링-절차)

---

## 리팩토링 원칙

### 골든 룰

1. **작은 단위로**: 한 번에 하나의 변경만
2. **자주 테스트**: 각 변경 후 테스트 실행
3. **커밋 자주**: 되돌릴 수 있는 체크포인트 유지
4. **동작 보존**: 외부 동작은 변경하지 않음

### 리팩토링 시점

```
✅ 리팩토링 해야 할 때:
- 새 기능 추가 전 (코드 이해도 향상)
- 버그 수정 전 (문제 영역 정리)
- 코드 리뷰 후 (피드백 반영)
- 기술 부채 해소 주기

❌ 리팩토링 피해야 할 때:
- 마감 직전
- 테스트 없는 코드 (테스트 먼저 작성)
- 완전히 재작성이 나은 경우
```

---

## 코드 스멜 카탈로그

### 비대한 요소 (Bloaters)

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| **긴 메서드** | 20줄 이상, 여러 책임 | Extract Method |
| **큰 클래스** | 필드/메서드 과다 | Extract Class |
| **긴 매개변수 목록** | 4개 이상 파라미터 | Parameter Object |
| **데이터 뭉치** | 항상 함께 다니는 데이터 | Extract Class |

### 객체지향 남용 (OO Abusers)

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| **Switch 문** | 타입별 분기 반복 | Replace with Polymorphism |
| **거부된 유산** | 부모 메서드 미사용 | Replace Inheritance with Delegation |
| **임시 필드** | 특정 상황에만 사용 | Extract Class |

### 변경 방해자 (Change Preventers)

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| **산탄총 수술** | 하나 변경에 여러 클래스 수정 | Move Method/Field |
| **평행 상속** | 한 클래스 추가 시 다른 계층도 추가 | Collapse Hierarchy |
| **발산적 변경** | 여러 이유로 한 클래스 수정 | Extract Class |

### 불필요한 것들 (Dispensables)

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| **중복 코드** | 유사 코드 반복 | Extract Method, Template Method |
| **죽은 코드** | 사용되지 않는 코드 | Remove Dead Code |
| **추측성 일반화** | "나중에 필요할지도" | Remove Unused Code |

### 결합자 (Couplers)

| 스멜 | 증상 | 해결책 |
|------|------|--------|
| **기능 편애** | 다른 클래스 데이터 과다 사용 | Move Method |
| **부적절한 친밀** | 다른 클래스 내부 과다 접근 | Move Method/Field |
| **메시지 체인** | a.b().c().d() | Hide Delegate |
| **중개자** | 위임만 하는 클래스 | Remove Middle Man |

---

## 리팩토링 기법

### Extract Method

```typescript
// Before
function printInvoice(invoice: Invoice) {
  console.log("=== Invoice ===");
  console.log(`Customer: ${invoice.customer}`);
  console.log(`Date: ${invoice.date}`);
  
  let total = 0;
  for (const item of invoice.items) {
    console.log(`  ${item.name}: ${item.price}`);
    total += item.price;
  }
  
  console.log(`Total: ${total}`);
}

// After
function printInvoice(invoice: Invoice) {
  printHeader(invoice);
  const total = printItems(invoice.items);
  printTotal(total);
}

function printHeader(invoice: Invoice) {
  console.log("=== Invoice ===");
  console.log(`Customer: ${invoice.customer}`);
  console.log(`Date: ${invoice.date}`);
}

function printItems(items: InvoiceItem[]): number {
  let total = 0;
  for (const item of items) {
    console.log(`  ${item.name}: ${item.price}`);
    total += item.price;
  }
  return total;
}

function printTotal(total: number) {
  console.log(`Total: ${total}`);
}
```

### Replace Conditional with Polymorphism

```typescript
// Before
function getSpeed(vehicle: Vehicle): number {
  switch (vehicle.type) {
    case 'car':
      return vehicle.enginePower * 0.5;
    case 'bicycle':
      return vehicle.gears * 3;
    case 'airplane':
      return vehicle.thrust * 2;
  }
}

// After
interface Vehicle {
  getSpeed(): number;
}

class Car implements Vehicle {
  constructor(private enginePower: number) {}
  getSpeed() { return this.enginePower * 0.5; }
}

class Bicycle implements Vehicle {
  constructor(private gears: number) {}
  getSpeed() { return this.gears * 3; }
}

class Airplane implements Vehicle {
  constructor(private thrust: number) {}
  getSpeed() { return this.thrust * 2; }
}
```

### Introduce Parameter Object

```typescript
// Before
function searchProducts(
  minPrice: number,
  maxPrice: number,
  category: string,
  inStock: boolean,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
) { ... }

// After
interface SearchCriteria {
  priceRange: { min: number; max: number };
  category: string;
  inStock: boolean;
  sort: { field: string; order: 'asc' | 'desc' };
}

function searchProducts(criteria: SearchCriteria) { ... }
```

### Replace Magic Numbers with Constants

```typescript
// Before
if (user.age >= 18) { ... }
if (order.total >= 50) { ... }
setTimeout(callback, 86400000);

// After
const LEGAL_AGE = 18;
const FREE_SHIPPING_THRESHOLD = 50;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (user.age >= LEGAL_AGE) { ... }
if (order.total >= FREE_SHIPPING_THRESHOLD) { ... }
setTimeout(callback, ONE_DAY_MS);
```

---

## 안전한 리팩토링 절차

### 1. 준비

```bash
# 현재 상태 확인
git status
npm test  # 모든 테스트 통과 확인
```

### 2. 작업 단위 분리

```
대규모 리팩토링 분해 예시:

"UserService 리팩토링" →
  1. Extract: 검증 로직 → UserValidator
  2. Extract: 알림 로직 → NotificationService
  3. Rename: 메서드명 명확화
  4. Remove: 미사용 메서드 제거
```

### 3. 각 단계 실행

```bash
# 각 변경 후
npm test           # 테스트 실행
npm run lint       # 린트 확인
git add -p         # 변경 확인
git commit -m "refactor: extract validation logic to UserValidator"
```

### 4. 검증

```
최종 체크리스트:
- [ ] 모든 테스트 통과
- [ ] 타입 오류 없음
- [ ] 린트 오류 없음
- [ ] 동작 동일 (수동 테스트)
- [ ] 성능 저하 없음
```
