# 보안 분석 가이드

## 목차
1. [취약점 스캔](#취약점-스캔)
2. [OWASP Top 10](#owasp-top-10)
3. [인증/인가 검증](#인증인가-검증)
4. [데이터 보호](#데이터-보호)

## 취약점 스캔

### 자동 스캔 도구

```bash
# Node.js 의존성 취약점
npm audit
npm audit --json > audit-report.json

# Python 의존성 취약점
pip-audit
safety check

# 코드 정적 분석
# semgrep, snyk, sonarqube
```

### 수동 검사 패턴

```bash
# 하드코딩된 비밀 탐지
grep -r "password\|secret\|api_key\|token" --include="*.ts" --include="*.js"
grep -r "-----BEGIN.*PRIVATE KEY-----" .

# SQL 인젝션 취약점
grep -r "SELECT.*\+\|INSERT.*\+" --include="*.ts"

# eval/exec 사용
grep -r "eval\|exec\|Function(" --include="*.ts" --include="*.js"
```

## OWASP Top 10

### A01: Broken Access Control

```typescript
// ❌ Bad: 권한 검사 누락
app.get('/admin/users', (req, res) => {
  return db.getAllUsers();
});

// ✅ Good: 권한 검사 포함
app.get('/admin/users', requireAuth, requireRole('admin'), (req, res) => {
  return db.getAllUsers();
});
```

### A02: Cryptographic Failures

```typescript
// ❌ Bad: 취약한 암호화
const hash = md5(password);

// ✅ Good: 강력한 암호화
const hash = await bcrypt.hash(password, 12);
```

### A03: Injection

```typescript
// ❌ Bad: SQL 인젝션 취약
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good: 파라미터화된 쿼리
const query = 'SELECT * FROM users WHERE id = $1';
await db.query(query, [userId]);
```

### A07: XSS (Cross-Site Scripting)

```typescript
// ❌ Bad: XSS 취약
element.innerHTML = userInput;

// ✅ Good: 이스케이프 처리
element.textContent = userInput;
// 또는 DOMPurify.sanitize(userInput)
```

## 인증/인가 검증

### 체크리스트

| 항목 | 검증 방법 |
|------|----------|
| **비밀번호 정책** | 최소 8자, 대소문자+숫자+특수문자 |
| **세션 관리** | 만료 시간, 재발급 로직 |
| **JWT 검증** | 서명 검증, 만료 체크, 알고리즘 고정 |
| **CORS 설정** | 허용 Origin 명시적 지정 |
| **Rate Limiting** | 로그인 시도 제한 |

### JWT 보안

```typescript
// ❌ Bad: 알고리즘 검증 없음
jwt.verify(token, secret);

// ✅ Good: 알고리즘 명시
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

## 데이터 보호

### 민감 데이터 처리

```typescript
// ❌ Bad: 로그에 민감 정보
console.log('User login:', { email, password });

// ✅ Good: 민감 정보 마스킹
console.log('User login:', { email, password: '****' });
```

### 환경 변수 관리

```bash
# .env 파일 gitignore 확인
grep ".env" .gitignore

# 환경 변수 사용 확인
grep -r "process.env" --include="*.ts" | head -20
```

## 보안 체크리스트

### 입력 검증

- [ ] 모든 사용자 입력 검증
- [ ] 화이트리스트 기반 검증 선호
- [ ] 파일 업로드 확장자/크기 제한
- [ ] URL 파라미터 검증

### 출력 인코딩

- [ ] HTML 컨텍스트 이스케이프
- [ ] JavaScript 컨텍스트 이스케이프
- [ ] SQL 파라미터화
- [ ] URL 인코딩

### 헤더 보안

```typescript
// 권장 보안 헤더
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'self'"
}
```

## 심각도 분류

| 심각도 | 예시 | CVSS |
|--------|------|------|
| 🔴 Critical | SQL 인젝션, RCE | 9.0-10.0 |
| 🟠 High | 인증 우회, XSS | 7.0-8.9 |
| 🟡 Medium | CSRF, 정보 노출 | 4.0-6.9 |
| 🟢 Low | 버전 노출, 쿠키 설정 | 0.1-3.9 |
