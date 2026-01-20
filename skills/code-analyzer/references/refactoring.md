# 리팩토링 분석 가이드

## 목차
1. [코드 스멜 탐지](#코드-스멜-탐지)
2. [복잡도 분석](#복잡도-분석)
3. [리팩토링 기법](#리팩토링-기법)
4. [우선순위 결정](#우선순위-결정)

## 코드 스멜 탐지

### 탐지 명령어

```bash
# 긴 파일 탐지 (500줄 이상)
find . -name "*.ts" -exec wc -l {} + | sort -rn | head -20

# 긴 함수 탐지 (function 키워드 기준)
grep -n "function\|=>" --include="*.ts" -r src/ | head -50

# 중복 코드 탐지 (유사한 패턴)
# jscpd 도구 권장: npx jscpd src/
```

### 코드 스멜 카탈로그

| 코드 스멜 | 탐지 기준 | 리팩토링 기법 |
|-----------|----------|---------------|
| **Long Method** | 50줄+ | Extract Method |
| **Large Class** | 500줄+ | Extract Class |
| **Long Parameter List** | 5개+ | Parameter Object |
| **Duplicate Code** | 유사 블록 3+회 | Extract Method/Class |
| **Feature Envy** | 다른 클래스 메서드 과다 호출 | Move Method |
| **Data Clumps** | 동일 필드 그룹 반복 | Extract Class |
| **Primitive Obsession** | 원시 타입 남용 | Value Object |
| **Switch Statements** | 반복되는 switch/case | Strategy Pattern |
| **Speculative Generality** | 사용 안 되는 추상화 | Remove Abstraction |
| **Dead Code** | 호출되지 않는 코드 | Remove Dead Code |

## 복잡도 분석

### Cyclomatic Complexity

```typescript
// 복잡도 계산: 분기점 개수 + 1
// if, else, for, while, case, catch, &&, ||

// ❌ Bad: 복잡도 높음 (10+)
function process(data) {
  if (data.type === 'A') {
    if (data.status === 'active') {
      for (const item of data.items) {
        if (item.valid && item.enabled) {
          // ...
        }
      }
    }
  } else if (data.type === 'B') {
    // ...
  }
}

// ✅ Good: 복잡도 낮음 (1-5)
function processTypeA(data) { ... }
function processTypeB(data) { ... }
const processors = { A: processTypeA, B: processTypeB };
function process(data) {
  return processors[data.type]?.(data);
}
```

### 복잡도 기준

| 복잡도 | 등급 | 조치 |
|--------|------|------|
| 1-5 | 🟢 좋음 | 유지 |
| 6-10 | 🟡 주의 | 분리 검토 |
| 11-20 | 🟠 나쁨 | 리팩토링 필요 |
| 21+ | 🔴 위험 | 즉시 리팩토링 |

## 리팩토링 기법

### Extract Method

```typescript
// Before
function calculateTotal(order) {
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  const tax = total * 0.1;
  const shipping = total > 100 ? 0 : 10;
  return total + tax + shipping;
}

// After
function calculateItemsTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
function calculateTax(amount) { return amount * 0.1; }
function calculateShipping(amount) { return amount > 100 ? 0 : 10; }
function calculateTotal(order) {
  const itemsTotal = calculateItemsTotal(order.items);
  return itemsTotal + calculateTax(itemsTotal) + calculateShipping(itemsTotal);
}
```

### Replace Conditional with Polymorphism

```typescript
// Before
function getArea(shape) {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
  }
}

// After
interface Shape { getArea(): number; }
class Circle implements Shape {
  constructor(private radius: number) {}
  getArea() { return Math.PI * this.radius ** 2; }
}
class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  getArea() { return this.width * this.height; }
}
```

### Introduce Parameter Object

```typescript
// Before
function createUser(name, email, age, address, phone, country) { ... }

// After
interface UserData {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
  country: string;
}
function createUser(data: UserData) { ... }
```

## 우선순위 결정

### 리팩토링 우선순위 매트릭스

| 기준 | 가중치 | 설명 |
|------|--------|------|
| **변경 빈도** | 높음 | 자주 수정되는 코드 우선 |
| **버그 발생률** | 높음 | 버그가 많은 영역 우선 |
| **복잡도** | 중간 | 복잡도 높은 코드 우선 |
| **결합도** | 중간 | 의존성 많은 코드 우선 |
| **테스트 커버리지** | 낮음 | 테스트 없는 영역 주의 |

### 리팩토링 안전 체크리스트

- [ ] 테스트 커버리지 확보
- [ ] 기능 동작 동일성 확인
- [ ] 성능 영향 없음 확인
- [ ] 팀 리뷰 완료
- [ ] 롤백 계획 수립
