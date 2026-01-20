# 디자인 패턴 (Design Patterns)

디자인 패턴 적용, 아키텍처 개선을 위한 상세 가이드입니다.

## 목차
- [패턴 선택 가이드](#패턴-선택-가이드)
- [생성 패턴](#생성-패턴)
- [구조 패턴](#구조-패턴)
- [행동 패턴](#행동-패턴)
- [React/프론트엔드 패턴](#react프론트엔드-패턴)

---

## 패턴 선택 가이드

### 문제 → 패턴 매핑

| 문제 상황 | 적용 패턴 |
|-----------|-----------|
| 객체 생성이 복잡함 | Factory, Builder |
| 인스턴스가 하나만 필요 | Singleton |
| 인터페이스 호환이 필요 | Adapter |
| 기능을 동적으로 추가 | Decorator |
| 복잡한 서브시스템 단순화 | Facade |
| 상태에 따라 동작 변경 | State, Strategy |
| 객체 간 통신 분리 | Observer, Mediator |
| 작업 요청과 실행 분리 | Command |

---

## 생성 패턴

### Factory Pattern

```typescript
// 문제: 조건에 따라 다른 객체 생성
// 해결: 생성 로직을 Factory로 캡슐화

interface Notification {
  send(message: string): void;
}

class EmailNotification implements Notification {
  send(message: string) {
    console.log(`Email: ${message}`);
  }
}

class SMSNotification implements Notification {
  send(message: string) {
    console.log(`SMS: ${message}`);
  }
}

class PushNotification implements Notification {
  send(message: string) {
    console.log(`Push: ${message}`);
  }
}

// Factory
class NotificationFactory {
  static create(type: 'email' | 'sms' | 'push'): Notification {
    switch (type) {
      case 'email': return new EmailNotification();
      case 'sms': return new SMSNotification();
      case 'push': return new PushNotification();
    }
  }
}

// 사용
const notification = NotificationFactory.create('email');
notification.send('Hello!');
```

### Builder Pattern

```typescript
// 문제: 복잡한 객체를 단계별로 생성
// 해결: Builder로 생성 과정 분리

class QueryBuilder {
  private query: string[] = [];
  
  select(...fields: string[]) {
    this.query.push(`SELECT ${fields.join(', ')}`);
    return this;
  }
  
  from(table: string) {
    this.query.push(`FROM ${table}`);
    return this;
  }
  
  where(condition: string) {
    this.query.push(`WHERE ${condition}`);
    return this;
  }
  
  orderBy(field: string, order: 'ASC' | 'DESC' = 'ASC') {
    this.query.push(`ORDER BY ${field} ${order}`);
    return this;
  }
  
  limit(count: number) {
    this.query.push(`LIMIT ${count}`);
    return this;
  }
  
  build(): string {
    return this.query.join(' ');
  }
}

// 사용
const query = new QueryBuilder()
  .select('id', 'name', 'email')
  .from('users')
  .where('active = true')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .build();
```

### Singleton Pattern

```typescript
// 문제: 전역에서 하나의 인스턴스만 필요
// 해결: 인스턴스 접근을 제어

class Logger {
  private static instance: Logger;
  private logs: string[] = [];
  
  private constructor() {}  // private 생성자
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  log(message: string) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
    console.log(`[${timestamp}] ${message}`);
  }
  
  getLogs(): string[] {
    return [...this.logs];
  }
}

// 사용
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
console.log(logger1 === logger2);  // true
```

---

## 구조 패턴

### Adapter Pattern

```typescript
// 문제: 호환되지 않는 인터페이스 연결
// 해결: 중간 변환 레이어 제공

// 기존 라이브러리 (변경 불가)
class OldAnalytics {
  track(eventName: string, data: object) {
    console.log('Old analytics:', eventName, data);
  }
}

// 새 인터페이스
interface Analytics {
  logEvent(event: { name: string; properties: Record<string, unknown> }): void;
}

// Adapter
class AnalyticsAdapter implements Analytics {
  constructor(private oldAnalytics: OldAnalytics) {}
  
  logEvent(event: { name: string; properties: Record<string, unknown> }) {
    this.oldAnalytics.track(event.name, event.properties);
  }
}

// 사용
const analytics: Analytics = new AnalyticsAdapter(new OldAnalytics());
analytics.logEvent({ name: 'click', properties: { button: 'submit' } });
```

### Decorator Pattern

```typescript
// 문제: 기존 객체에 동적으로 기능 추가
// 해결: Wrapper로 기능 확장

interface DataSource {
  writeData(data: string): void;
  readData(): string;
}

class FileDataSource implements DataSource {
  constructor(private filename: string) {}
  
  writeData(data: string) {
    console.log(`Writing to ${this.filename}: ${data}`);
  }
  
  readData(): string {
    return `Data from ${this.filename}`;
  }
}

// Decorator Base
class DataSourceDecorator implements DataSource {
  constructor(protected wrapped: DataSource) {}
  
  writeData(data: string) {
    this.wrapped.writeData(data);
  }
  
  readData(): string {
    return this.wrapped.readData();
  }
}

// Encryption Decorator
class EncryptionDecorator extends DataSourceDecorator {
  writeData(data: string) {
    const encrypted = this.encrypt(data);
    super.writeData(encrypted);
  }
  
  readData(): string {
    return this.decrypt(super.readData());
  }
  
  private encrypt(data: string): string {
    return `[ENCRYPTED]${data}`;
  }
  
  private decrypt(data: string): string {
    return data.replace('[ENCRYPTED]', '');
  }
}

// Compression Decorator
class CompressionDecorator extends DataSourceDecorator {
  writeData(data: string) {
    const compressed = this.compress(data);
    super.writeData(compressed);
  }
  
  readData(): string {
    return this.decompress(super.readData());
  }
  
  private compress(data: string): string {
    return `[COMPRESSED]${data}`;
  }
  
  private decompress(data: string): string {
    return data.replace('[COMPRESSED]', '');
  }
}

// 사용: 데코레이터 조합
let source: DataSource = new FileDataSource('data.txt');
source = new EncryptionDecorator(source);
source = new CompressionDecorator(source);
source.writeData('sensitive data');
```

### Facade Pattern

```typescript
// 문제: 복잡한 서브시스템을 단순하게 사용
// 해결: 단순한 인터페이스 제공

// 복잡한 서브시스템들
class VideoFile { constructor(public filename: string) {} }
class CodecFactory { static extract(file: VideoFile) { return 'codec'; } }
class BitrateReader { static read(codec: string) { return 1000; } }
class AudioMixer { static fix(result: string) { return 'fixed'; } }

// Facade
class VideoConverter {
  convert(filename: string, format: string): string {
    const file = new VideoFile(filename);
    const codec = CodecFactory.extract(file);
    const bitrate = BitrateReader.read(codec);
    const result = `Converted ${filename} to ${format} at ${bitrate}kbps`;
    return AudioMixer.fix(result);
  }
}

// 사용: 단순한 인터페이스
const converter = new VideoConverter();
const result = converter.convert('video.mp4', 'avi');
```

---

## 행동 패턴

### Strategy Pattern

```typescript
// 문제: 알고리즘을 런타임에 교체
// 해결: 알고리즘을 캡슐화하여 교체 가능하게

interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  constructor(private cardNumber: string) {}
  
  pay(amount: number) {
    console.log(`Paid ${amount} with credit card ${this.cardNumber}`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}
  
  pay(amount: number) {
    console.log(`Paid ${amount} via PayPal (${this.email})`);
  }
}

class CryptoPayment implements PaymentStrategy {
  constructor(private walletAddress: string) {}
  
  pay(amount: number) {
    console.log(`Paid ${amount} in crypto to ${this.walletAddress}`);
  }
}

// Context
class ShoppingCart {
  private items: { price: number }[] = [];
  
  addItem(item: { price: number }) {
    this.items.push(item);
  }
  
  checkout(strategy: PaymentStrategy) {
    const total = this.items.reduce((sum, item) => sum + item.price, 0);
    strategy.pay(total);
  }
}

// 사용
const cart = new ShoppingCart();
cart.addItem({ price: 100 });
cart.addItem({ price: 50 });

cart.checkout(new CreditCardPayment('1234-5678'));
cart.checkout(new PayPalPayment('user@example.com'));
```

### Observer Pattern

```typescript
// 문제: 객체 상태 변경 시 여러 객체에 알림
// 해결: 발행-구독 구조

interface Observer<T> {
  update(data: T): void;
}

class Subject<T> {
  private observers: Observer<T>[] = [];
  
  subscribe(observer: Observer<T>) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer: Observer<T>) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  
  notify(data: T) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// 구현 예시
class PriceAlert implements Observer<number> {
  constructor(private threshold: number) {}
  
  update(price: number) {
    if (price < this.threshold) {
      console.log(`Alert: Price dropped to ${price}!`);
    }
  }
}

class PriceLogger implements Observer<number> {
  update(price: number) {
    console.log(`[LOG] Price updated: ${price}`);
  }
}

// 사용
const priceSubject = new Subject<number>();
priceSubject.subscribe(new PriceAlert(100));
priceSubject.subscribe(new PriceLogger());

priceSubject.notify(150);  // LOG만
priceSubject.notify(80);   // Alert + LOG
```

### Command Pattern

```typescript
// 문제: 요청을 객체로 캡슐화 (실행 취소, 큐잉)
// 해결: 명령을 객체화

interface Command {
  execute(): void;
  undo(): void;
}

class TextEditor {
  content = '';
  
  insertText(text: string, position: number) {
    this.content = 
      this.content.slice(0, position) + 
      text + 
      this.content.slice(position);
  }
  
  deleteText(position: number, length: number) {
    this.content = 
      this.content.slice(0, position) + 
      this.content.slice(position + length);
  }
}

class InsertCommand implements Command {
  constructor(
    private editor: TextEditor,
    private text: string,
    private position: number
  ) {}
  
  execute() {
    this.editor.insertText(this.text, this.position);
  }
  
  undo() {
    this.editor.deleteText(this.position, this.text.length);
  }
}

// Command Manager (Undo/Redo)
class CommandHistory {
  private history: Command[] = [];
  private position = -1;
  
  execute(command: Command) {
    // 현재 위치 이후 기록 삭제
    this.history = this.history.slice(0, this.position + 1);
    this.history.push(command);
    this.position++;
    command.execute();
  }
  
  undo() {
    if (this.position >= 0) {
      this.history[this.position].undo();
      this.position--;
    }
  }
  
  redo() {
    if (this.position < this.history.length - 1) {
      this.position++;
      this.history[this.position].execute();
    }
  }
}
```

---

## React/프론트엔드 패턴

### Compound Component

```tsx
// 문제: 관련 컴포넌트 간 암묵적 상태 공유
// 해결: Context로 상태 공유, 유연한 조합

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
} | null>(null);

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');
  
  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');
  
  return context.activeTab === id ? <div>{children}</div> : null;
}

// 사용
<Tabs defaultTab="tab1">
  <TabList>
    <Tab id="tab1">First</Tab>
    <Tab id="tab2">Second</Tab>
  </TabList>
  <TabPanel id="tab1">First content</TabPanel>
  <TabPanel id="tab2">Second content</TabPanel>
</Tabs>
```

### Render Props

```tsx
// 문제: 로직 재사용, 렌더링은 외부에서 결정
// 해결: 렌더 함수를 props로 전달

interface MousePosition {
  x: number;
  y: number;
}

function MouseTracker({ 
  render 
}: { 
  render: (position: MousePosition) => ReactNode 
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  
  return <>{render(position)}</>;
}

// 사용
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse position: {x}, {y}</div>
  )}
/>
```

### Custom Hook Extraction

```tsx
// 문제: 컴포넌트 로직 재사용
// 해결: 커스텀 훅으로 로직 추출

// Before: 로직이 컴포넌트에 묶임
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  // 렌더링 로직...
}

// After: 커스텀 훅으로 추출
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
}

// 재사용
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId);
  // 렌더링 로직만 집중
}

function UserAvatar({ userId }: { userId: string }) {
  const { user } = useUser(userId);
  return <Avatar src={user?.avatar} />;
}
```
