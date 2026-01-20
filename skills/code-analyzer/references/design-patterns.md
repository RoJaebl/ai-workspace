# 디자인 패턴 분석 가이드

## 목차
1. [패턴 식별 체크리스트](#패턴-식별-체크리스트)
2. [생성 패턴](#생성-패턴)
3. [구조 패턴](#구조-패턴)
4. [행위 패턴](#행위-패턴)
5. [안티 패턴](#안티-패턴)

## 패턴 식별 체크리스트

```bash
# 싱글톤 패턴 탐지
grep -r "getInstance\|private static instance" --include="*.ts"

# 팩토리 패턴 탐지
grep -r "Factory\|create[A-Z]" --include="*.ts"

# Observer 패턴 탐지
grep -r "subscribe\|addEventListener\|on[A-Z].*Event" --include="*.ts"
```

## 생성 패턴

### Singleton

```typescript
// 식별 키워드: getInstance, private constructor, static instance
class Database {
  private static instance: Database;
  private constructor() {}
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

**검토 포인트:**
- 정말 단일 인스턴스가 필요한가?
- 테스트 시 모킹 가능한가?
- 의존성 주입으로 대체 가능한가?

### Factory

```typescript
// 식별 키워드: Factory, create*, build*
interface Product { ... }
class ProductFactory {
  create(type: string): Product {
    switch(type) {
      case 'A': return new ProductA();
      case 'B': return new ProductB();
    }
  }
}
```

**검토 포인트:**
- switch/case가 비대해지지 않았는가?
- Abstract Factory로 확장 필요한가?

### Builder

```typescript
// 식별 키워드: Builder, with*, set*, build()
class QueryBuilder {
  private query: Query = {};
  select(fields: string[]) { ...; return this; }
  where(condition: Condition) { ...; return this; }
  build(): Query { return this.query; }
}
```

## 구조 패턴

### Adapter

```typescript
// 식별 키워드: Adapter, Wrapper, implements 외부 인터페이스
class LegacySystemAdapter implements ModernInterface {
  constructor(private legacy: LegacySystem) {}
  modernMethod() {
    return this.legacy.oldMethod();
  }
}
```

### Decorator

```typescript
// 식별 키워드: @decorator, Decorator, wraps original
function LogDecorator(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`Called ${key}`);
    return original.apply(this, args);
  };
}
```

### Facade

```typescript
// 식별 키워드: Facade, 복잡한 서브시스템 단순화
class OrderFacade {
  placeOrder(items: Item[]) {
    this.inventory.check(items);
    this.payment.process();
    this.shipping.schedule();
    this.notification.send();
  }
}
```

## 행위 패턴

### Observer

```typescript
// 식별 키워드: subscribe, notify, listeners, EventEmitter
class EventEmitter {
  private listeners = new Map<string, Function[]>();
  on(event: string, callback: Function) { ... }
  emit(event: string, data: any) { ... }
}
```

### Strategy

```typescript
// 식별 키워드: Strategy, 런타임 알고리즘 교체
interface PaymentStrategy {
  pay(amount: number): void;
}
class CreditCardStrategy implements PaymentStrategy { ... }
class PayPalStrategy implements PaymentStrategy { ... }
```

### Command

```typescript
// 식별 키워드: Command, execute, undo
interface Command {
  execute(): void;
  undo(): void;
}
class CreateUserCommand implements Command { ... }
```

## 안티 패턴

| 안티 패턴 | 증상 | 해결책 |
|-----------|------|--------|
| **God Object** | 하나의 클래스가 너무 많은 책임 | 단일 책임 원칙 적용, 분리 |
| **Spaghetti Code** | 복잡한 조건문, goto 같은 흐름 | 전략 패턴, 상태 패턴 적용 |
| **Copy-Paste** | 중복 코드 다수 | 템플릿 메서드, 전략 패턴 |
| **Magic Numbers** | 하드코딩된 값들 | 상수화, 설정 파일 분리 |
| **Primitive Obsession** | 원시 타입 남용 | Value Object 도입 |

## SOLID 원칙 검증

| 원칙 | 검증 방법 |
|------|----------|
| **S** - 단일 책임 | 클래스당 변경 이유가 1개인가? |
| **O** - 개방/폐쇄 | 확장에 열려있고 수정에 닫혀있는가? |
| **L** - 리스코프 치환 | 하위 타입이 상위 타입 대체 가능한가? |
| **I** - 인터페이스 분리 | 인터페이스가 작고 구체적인가? |
| **D** - 의존성 역전 | 추상화에 의존하는가? |
