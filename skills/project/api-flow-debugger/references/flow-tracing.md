# Flow Tracing Reference

This document details the patterns and strategies for automatically discovering all files involved in an API request/response flow.

## Table of Contents

1. [File Discovery Strategy](#file-discovery-strategy)
2. [Glob Patterns](#glob-patterns)
3. [Grep Patterns](#grep-patterns)
4. [Layer-Specific Finding Rules](#layer-specific-finding-rules)
5. [Edge Cases](#edge-cases)
6. [Performance Optimization](#performance-optimization)

## File Discovery Strategy

### Overall Approach

Given a domain name (e.g., "brochure"), discover files in this order:

1. **Type definitions first** - DTO, Model, Presenter
2. **Converters second** - Adapter, Mapper
3. **Services third** - Frontend, Backend
4. **Infrastructure fourth** - API Handlers, Endpoints

This order ensures we understand the data structures before analyzing the code that uses them.

### Discovery Workflow

```typescript
interface ApiFlowFiles {
  domain: string;
  
  // Type files
  dto: string;
  model: string;
  presenter: string;
  
  // Converter files
  adapter: string;
  mapper: string;
  
  // Service files
  frontendService: string[];  // Planning and Current
  backendService: string;
  
  // Infrastructure files
  apiHandlers: string[];
  endpoints: string[];
  
  // Optional files
  interface?: string;
  module?: string;
}
```

## Glob Patterns

### Frontend Service Files

```typescript
// Planning directory (Mock service typically here)
const planningPattern = `(planning)/**/${domain}/_services/${domain}.service.ts`;

// Current directory (Real service typically here)
const currentPattern = `(current)/**/${domain}/_services/${domain}.service.ts`;

// Both patterns
const frontendPatterns = [
  `**/(planning)/**/${domain}/_services/${domain}.service.ts`,
  `**/(current)/**/${domain}/_services/${domain}.service.ts`,
];
```

**Example matches:**
```
portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_services/brochure.service.ts
portal/src/app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_services/brochure.service.ts
```

### API Handler Files

```typescript
// Route files within domain
const routePattern = `api/(cms)/**/(${domain})/*/route.ts`;

// Alternative: route groups
const routeGroupPattern = `api/(cms)/**/${domain}*/route.ts`;
```

**Example matches:**
```
portal/src/app/api/(cms)/cms/(admin)/homepage/(brochure)/brochures/route.ts
portal/src/app/api/(cms)/cms/(admin)/homepage/(brochure)/brochures/[brochureId]/route.ts
portal/src/app/api/(cms)/cms/(admin)/homepage/(brochure)/brochure-categories/route.ts
```

### Backend Service Files

```typescript
// Main service file
const backendPattern = `api/_backend/**/${domain}/${domain}.service.ts`;

// Alternative: modules directory
const modulePattern = `api/_backend/modules/**/${domain}/${domain}.service.ts`;
```

**Example matches:**
```
portal/src/app/api/_backend/modules/cms/admin/homepage/brochure/brochure.service.ts
```

### Type Files

```typescript
// DTO (in backend)
const dtoPattern = `api/_backend/**/${domain}/types/${domain}.dto.ts`;

// Model (in frontend planning)
const modelPattern = `(planning)/**/${domain}/_types/${domain}.model.ts`;

// Presenter (in frontend planning)
const presenterPattern = `(planning)/**/${domain}/_types/${domain}.presenter.ts`;
```

**Example matches:**
```
portal/src/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.dto.ts
portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_types/brochure.model.ts
portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_types/brochure.presenter.ts
```

### Converter Files

```typescript
// Adapter (in backend with DTO)
const adapterPattern = `api/_backend/**/${domain}/types/${domain}.adapter.ts`;

// Mapper (in frontend with Model)
const mapperPattern = `**/${domain}/_services/${domain}.mapper.ts`;
```

**Example matches:**
```
portal/src/app/api/_backend/modules/cms/admin/homepage/brochure/types/brochure.adapter.ts
portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/brochure/_services/brochure.mapper.ts
```

### Endpoints Files

```typescript
// Frontend endpoints (for API calls)
const frontendEndpointsPattern = `**/( current)/**/${domain}/_services/${domain}.endpoints.ts`;

// Backend endpoints (for CMS API calls)
const backendEndpointsPattern = `api/_backend/**/${domain}/${domain}.endpoints.ts`;
```

**Example matches:**
```
portal/src/app/(current)/current/(cms)/cms/(admin)/homepage/brochure/_services/brochure.endpoints.ts
portal/src/app/api/_backend/modules/cms/admin/homepage/brochure/brochure.endpoints.ts
```

## Grep Patterns

When glob patterns don't find files or you need to search by content:

### Finding Service Classes

```typescript
// Find service class definitions
const serviceClassPattern = `export class \\w*${capitalize(domain)}Service`;

// Example: "export class BrochureService"
```

### Finding Interface Definitions

```typescript
// Find interface by name
const interfacePattern = `export interface ${capitalize(domain)}\\w*(Dto|Model|Presenter)`;

// Examples:
// "export interface BrochureDto"
// "export interface BrochureModel"
// "export interface BrochurePresenter"
```

### Finding Adapter Methods

```typescript
// Find adapter conversion methods
const adapterPattern = `static (from|to)\\w+(Response|Request)`;

// Examples:
// "static fromBrochureResponse"
// "static toBrochuresRequest"
```

### Finding Mapper Methods

```typescript
// Find mapper conversion methods
const mapperPattern = `static (from|to)(Model|CreateModel|UpdateModel)`;

// Examples:
// "static fromModel"
// "static toCreateModel"
```

### Finding API Routes

```typescript
// Find route handler exports
const routeHandlerPattern = `export async function (GET|POST|PATCH|DELETE)`;

// Examples:
// "export async function GET()"
// "export async function POST(request: NextRequest)"
```

## Layer-Specific Finding Rules

### Frontend Service Layer

**Rule**: Look for service files in both `(planning)` and `(current)` directories.

```typescript
function findFrontendServices(domain: string): string[] {
  const planning = glob(`**/(planning)/**/${domain}/_services/${domain}.service.ts`);
  const current = glob(`**/(current)/**/${domain}/_services/${domain}.service.ts`);
  return [...planning, ...current];
}
```

**Characteristics to verify:**
- File exports a class implementing `{Domain}Service` interface
- Methods use 한글 names (e.g., `브로슈어_목록을_조회한다`)
- Returns `Promise<ApiResponse<...>>`
- Calls endpoints from `{domain}.endpoints.ts` or `{DOMAIN}_API` constant

### API Handler Layer

**Rule**: Look for `route.ts` files within route groups matching the domain.

```typescript
function findApiHandlers(domain: string): string[] {
  // Find all route files that might be related
  const routes = glob(`api/(cms)/**/**/route.ts`);
  
  // Filter by domain
  return routes.filter(path => {
    // Check if path contains domain name or route group
    return path.includes(`(${domain})`) || 
           path.includes(`/${domain}-`) ||
           path.includes(`/${domain}s/`);
  });
}
```

**Characteristics to verify:**
- File exports `GET`, `POST`, `PATCH`, or `DELETE` functions
- Uses `getCmsAccessTokenFromCookies()` for authentication
- Calls Backend Service via Module pattern
- Returns `NextResponse.json()`

### Backend Service Layer

**Rule**: Look in `api/_backend/modules` directory structure.

```typescript
function findBackendService(domain: string): string | null {
  // Primary pattern
  const service = glob(`api/_backend/modules/**/${domain}/${domain}.service.ts`)[0];
  if (service) return service;
  
  // Fallback: search by content
  const files = glob(`api/_backend/**/${domain}.service.ts`);
  for (const file of files) {
    const content = readFile(file);
    if (content.includes(`class ${capitalize(domain)}Service`)) {
      return file;
    }
  }
  
  return null;
}
```

**Characteristics to verify:**
- Class extends `BaseService`
- Implements `{Domain}ServiceInterface`
- Uses `this.handleApiCall()` for error handling
- Calls Adapter methods for DTO ↔ Model conversion
- Makes `fetch()` calls to CMS API

### Type Files Layer

**Rule**: Look for specific naming patterns in different directories.

```typescript
function findTypeFiles(domain: string): {
  dto: string | null;
  model: string | null;
  presenter: string | null;
} {
  return {
    dto: glob(`api/_backend/**/${domain}/types/${domain}.dto.ts`)[0] || null,
    model: glob(`(planning)/**/${domain}/_types/${domain}.model.ts`)[0] || null,
    presenter: glob(`(planning)/**/${domain}/_types/${domain}.presenter.ts`)[0] || null,
  };
}
```

**Characteristics to verify:**

**DTO:**
- Defines interfaces ending with `Dto` (e.g., `BrochureResponseDto`)
- Located in `api/_backend` directory tree
- Matches CMS API response structure

**Model:**
- Defines interfaces ending with `Model` (e.g., `BrochureModel`)
- Has `Create{Domain}Model` and `Update{Domain}Model` variants
- Located in `(planning)` directory tree

**Presenter:**
- Defines class ending with `Presenter` (e.g., `BrochurePresenter`)
- Has `static create()` and `static createEmpty()` methods
- Has `copyWith()` method
- May have `display*()` helper methods

### Converter Files Layer

**Rule**: Look for Adapter near DTO, Mapper near Model.

```typescript
function findConverters(domain: string): {
  adapter: string | null;
  mapper: string | null;
} {
  return {
    adapter: glob(`api/_backend/**/${domain}/types/${domain}.adapter.ts`)[0] || null,
    mapper: glob(`**/${domain}/_services/${domain}.mapper.ts`)[0] || null,
  };
}
```

**Characteristics to verify:**

**Adapter:**
- Class named `{Domain}Adapter`
- Has `from*Response` static methods (DTO → Model)
- Has `to*Request` static methods (Model → DTO)
- Handles field name mappings

**Mapper:**
- Class named `{Domain}Mapper`
- Has `fromModel` static method (Model → Presenter)
- Has `toModel` static method (Presenter → Model)
- Has `toCreateModel`, `toUpdateModel` methods

## Edge Cases

### Case 1: Domain Name with Hyphens

```typescript
// Domain: "video-gallery"
const patterns = {
  service: `**/${domain}/_services/${domain}.service.ts`,
  // Hyphen becomes part of the path
};

// Example: .../video-gallery/_services/video-gallery.service.ts
```

### Case 2: Plural Domain Names

```typescript
// API routes might use plural forms
// Domain: "brochure" → Routes: "brochures"

function findApiHandlers(domain: string): string[] {
  const singular = glob(`api/(cms)/**/(${domain})/*/route.ts`);
  const plural = glob(`api/(cms)/**/(${domain}s)/*/route.ts`);
  return [...singular, ...plural];
}
```

### Case 3: Nested Route Groups

```typescript
// Multiple route groups: (cms)/(admin)/(homepage)/(brochure)

function findApiHandlers(domain: string): string[] {
  // Search recursively through route groups
  const allRoutes = glob(`api/(cms)/**/route.ts`);
  
  return allRoutes.filter(route => {
    // Check if any segment matches domain
    const segments = route.split('/');
    return segments.some(seg => 
      seg === `(${domain})` || seg === domain || seg === `${domain}s`
    );
  });
}
```

### Case 4: Shared Types

```typescript
// Some types might be in shared directories
const sharedPatterns = [
  `**/_types/${domain}.model.ts`,
  `**/_entities/${domain}.entity.ts`,
  `**/types/${domain}.dto.ts`,
];
```

### Case 5: Domain Not Found

```typescript
function handleDomainNotFound(domain: string): void {
  console.log(`⚠️ No files found for domain: ${domain}`);
  console.log(`\nSuggestions:`);
  console.log(`1. Check domain name spelling (use lowercase, hyphens)`);
  console.log(`2. Search manually: grep -r "${domain}" src/`);
  console.log(`3. Try related names: ${domain}s, ${domain}-item, etc.`);
  
  // Fuzzy search for similar domains
  const allDomains = findAllDomains();
  const similar = allDomains.filter(d => 
    levenshteinDistance(d, domain) <= 2
  );
  
  if (similar.length > 0) {
    console.log(`\nDid you mean: ${similar.join(", ")}?`);
  }
}
```

## Performance Optimization

### Parallel Searching

```typescript
async function findAllFiles(domain: string): Promise<ApiFlowFiles> {
  // Run all glob searches in parallel
  const [
    frontendServices,
    backendService,
    apiHandlers,
    dto,
    model,
    presenter,
    adapter,
    mapper,
    endpoints,
  ] = await Promise.all([
    glob(`**/(planning|current)/**/${domain}/_services/${domain}.service.ts`),
    glob(`api/_backend/**/${domain}/${domain}.service.ts`),
    glob(`api/(cms)/**/**/route.ts`).then(routes => 
      routes.filter(r => r.includes(domain))
    ),
    glob(`api/_backend/**/${domain}/types/${domain}.dto.ts`),
    glob(`(planning)/**/${domain}/_types/${domain}.model.ts`),
    glob(`(planning)/**/${domain}/_types/${domain}.presenter.ts`),
    glob(`api/_backend/**/${domain}/types/${domain}.adapter.ts`),
    glob(`**/${domain}/_services/${domain}.mapper.ts`),
    glob(`**/${domain}.endpoints.ts`),
  ]);
  
  return {
    domain,
    frontendService: frontendServices,
    backendService: backendService[0],
    apiHandlers,
    dto: dto[0],
    model: model[0],
    presenter: presenter[0],
    adapter: adapter[0],
    mapper: mapper[0],
    endpoints,
  };
}
```

### Caching Results

```typescript
const fileCache = new Map<string, ApiFlowFiles>();

function findFilesWithCache(domain: string): ApiFlowFiles {
  if (fileCache.has(domain)) {
    return fileCache.get(domain)!;
  }
  
  const files = findAllFiles(domain);
  fileCache.set(domain, files);
  return files;
}
```

### Incremental Discovery

```typescript
// Only find what's needed for the current task
function findFilesIncremental(domain: string, layers: string[]): Partial<ApiFlowFiles> {
  const files: Partial<ApiFlowFiles> = { domain };
  
  if (layers.includes('types')) {
    files.dto = glob(`api/_backend/**/${domain}/types/${domain}.dto.ts`)[0];
    files.model = glob(`(planning)/**/${domain}/_types/${domain}.model.ts`)[0];
    files.presenter = glob(`(planning)/**/${domain}/_types/${domain}.presenter.ts`)[0];
  }
  
  if (layers.includes('converters')) {
    files.adapter = glob(`api/_backend/**/${domain}/types/${domain}.adapter.ts`)[0];
    files.mapper = glob(`**/${domain}/_services/${domain}.mapper.ts`)[0];
  }
  
  // ... etc
  
  return files;
}
```

## Integration with Cursor Tools

### Using Glob Tool

```typescript
// In the skill
function findFrontendServices(domain: string): string[] {
  // Use Cursor's Glob tool
  const results = await Glob({
    glob_pattern: `**/(planning|current)/**/${domain}/_services/${domain}.service.ts`,
  });
  return results.files;
}
```

### Using Grep Tool

```typescript
// When glob doesn't work, use grep
function findServiceByContent(domain: string): string[] {
  const pattern = `export class ${capitalize(domain)}Service`;
  const results = await Grep({
    pattern,
    output_mode: "files_with_matches",
  });
  return results.files;
}
```

### Using Read Tool

```typescript
// Verify found files contain expected content
async function verifyServiceFile(path: string): Promise<boolean> {
  const content = await Read({ path });
  return content.includes('implements') && content.includes('Service');
}
```

## Best Practices

1. **Start with type files** - Easier to find with predictable patterns
2. **Use parallel searches** - Glob operations can run simultaneously
3. **Cache results** - Same domain searched multiple times in a session
4. **Fuzzy matching** - Help users when domain name is slightly wrong
5. **Verify findings** - Check file content matches expectations
6. **Handle missing files gracefully** - Some layers might not exist yet
7. **Report partial results** - Show what was found even if not everything exists
