# 구현 (Implementation)

새 기능, API, 컴포넌트 구현을 위한 상세 가이드입니다.

## 목차
- [구현 워크플로우](#구현-워크플로우)
- [레이어별 구현 패턴](#레이어별-구현-패턴)
- [체크리스트](#체크리스트)

---

## 구현 워크플로우

### 1단계: 요구사항 분석

```
입력 분석:
- 기능 명세 (무엇을 해야 하는가?)
- 입/출력 정의 (데이터 형태)
- 제약 조건 (성능, 보안, 호환성)
- 의존성 (필요한 외부 모듈)
```

### 2단계: 인터페이스 설계

**TypeScript 예시:**
```typescript
// 1. 타입 정의 먼저
interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
}

interface CreateUserOutput {
  id: string;
  email: string;
  createdAt: Date;
}

// 2. 함수 시그니처
function createUser(input: CreateUserInput): Promise<CreateUserOutput>;
```

### 3단계: 스켈레톤 구현

```typescript
async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  // TODO: 입력 검증
  
  // TODO: 중복 체크
  
  // TODO: 사용자 생성
  
  // TODO: 결과 반환
}
```

### 4단계: 핵심 로직 구현

순서:
1. Happy path (정상 흐름) 먼저
2. 에러 핸들링 추가
3. 엣지 케이스 처리
4. 로깅/모니터링

### 5단계: 테스트 작성

```typescript
describe('createUser', () => {
  it('should create user with valid input', async () => {
    // Arrange
    const input = { email: 'test@example.com', name: 'Test' };
    
    // Act
    const result = await createUser(input);
    
    // Assert
    expect(result.email).toBe(input.email);
    expect(result.id).toBeDefined();
  });
  
  it('should throw on duplicate email', async () => {
    // 중복 케이스 테스트
  });
});
```

---

## 레이어별 구현 패턴

### API 엔드포인트

```typescript
// REST API 패턴
export async function POST(request: Request) {
  try {
    // 1. 요청 파싱
    const body = await request.json();
    
    // 2. 입력 검증
    const validated = schema.parse(body);
    
    // 3. 비즈니스 로직 호출
    const result = await service.create(validated);
    
    // 4. 응답 반환
    return Response.json(result, { status: 201 });
    
  } catch (error) {
    // 5. 에러 처리
    return handleApiError(error);
  }
}
```

### 서비스 레이어

```typescript
class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}
  
  async create(input: CreateUserInput): Promise<User> {
    // 비즈니스 로직
    const user = User.create(input);
    
    // 영속화
    await this.repository.save(user);
    
    // 이벤트 발행
    this.eventBus.publish(new UserCreatedEvent(user));
    
    return user;
  }
}
```

### React 컴포넌트

```tsx
// 컴포넌트 구조
interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: UserFormData;
}

export function UserForm({ onSubmit, initialData }: UserFormProps) {
  // 1. 상태 관리
  const [formData, setFormData] = useState(initialData ?? defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. 이벤트 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // 3. 렌더링
  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

### 커스텀 훅

```typescript
// 훅 패턴
function useCreateUser() {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: Error | null;
    data: User | null;
  }>({ isLoading: false, error: null, data: null });
  
  const createUser = useCallback(async (input: CreateUserInput) => {
    setState({ isLoading: true, error: null, data: null });
    
    try {
      const result = await api.createUser(input);
      setState({ isLoading: false, error: null, data: result });
      return result;
    } catch (error) {
      setState({ isLoading: false, error: error as Error, data: null });
      throw error;
    }
  }, []);
  
  return { ...state, createUser };
}
```

---

## 체크리스트

### 구현 전
- [ ] 요구사항 명확히 이해
- [ ] 인터페이스/타입 정의 완료
- [ ] 의존성 확인 (외부 라이브러리, 내부 모듈)
- [ ] 기존 유사 코드 참조

### 구현 중
- [ ] 타입 안전성 유지
- [ ] 에러 핸들링 포함
- [ ] 로깅 추가 (디버그용)
- [ ] 매직 넘버/문자열 상수화

### 구현 후
- [ ] 린터 오류 없음
- [ ] 단위 테스트 작성
- [ ] 엣지 케이스 처리
- [ ] 코드 리뷰 준비
