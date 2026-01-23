#!/usr/bin/env node
/**
 * Flow Diagram Generator
 * 
 * Generates Mermaid sequence diagrams for API request/response flows.
 * 
 * Usage:
 *   node generate-flow-diagram.ts <domain-name> <operation>
 * 
 * Operations:
 *   - list: List/query operation (GET collection)
 *   - get: Get single item (GET by ID)
 *   - create: Create operation (POST)
 *   - update: Update operation (PATCH)
 *   - delete: Delete operation (DELETE)
 * 
 * Example:
 *   node generate-flow-diagram.ts brochure list
 *   node generate-flow-diagram.ts brochure create
 */

type Operation = 'list' | 'get' | 'create' | 'update' | 'delete';

interface DiagramConfig {
  domain: string;
  operation: Operation;
  includeErrorPaths?: boolean;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get operation details
 */
function getOperationDetails(domain: string, operation: Operation) {
  const domainTitle = capitalize(domain);
  
  const operations = {
    list: {
      method: 'GET',
      frontendEndpoint: `/api/cms/${domain}s`,
      cmsEndpoint: `/api/cms/${domain}s`,
      requestType: `${domainTitle}ListParams`,
      responseType: `${domainTitle}sModel`,
      presenterType: `${domainTitle}sPresenter`,
      description: '목록 조회',
    },
    get: {
      method: 'GET',
      frontendEndpoint: `/api/cms/${domain}s/{id}`,
      cmsEndpoint: `/cms-api/${domain}s/{id}`,
      requestType: 'string (ID)',
      responseType: `${domainTitle}Model`,
      presenterType: `${domainTitle}Presenter`,
      description: '상세 조회',
    },
    create: {
      method: 'POST',
      frontendEndpoint: `/api/cms/${domain}s`,
      cmsEndpoint: `/cms-api/${domain}s`,
      requestType: `Create${domainTitle}Model`,
      responseType: `${domainTitle}Model`,
      presenterType: `${domainTitle}Presenter`,
      description: '생성',
    },
    update: {
      method: 'PATCH',
      frontendEndpoint: `/api/cms/${domain}s/{id}`,
      cmsEndpoint: `/cms-api/${domain}s/{id}`,
      requestType: `Update${domainTitle}Model`,
      responseType: `${domainTitle}Model`,
      presenterType: `${domainTitle}Presenter`,
      description: '수정',
    },
    delete: {
      method: 'DELETE',
      frontendEndpoint: `/api/cms/${domain}s/{id}`,
      cmsEndpoint: `/cms-api/${domain}s/{id}`,
      requestType: 'string (ID)',
      responseType: 'void',
      presenterType: 'void',
      description: '삭제',
    },
  };
  
  return operations[operation];
}

/**
 * Generate sequence diagram
 */
function generateSequenceDiagram(config: DiagramConfig): string {
  const { domain, operation, includeErrorPaths = false } = config;
  const details = getOperationDetails(domain, operation);
  const domainTitle = capitalize(domain);
  
  let diagram = `sequenceDiagram
    participant UI as UI Component
    participant FS as Frontend Service
    participant AH as API Handler
    participant BS as Backend Service
    participant AD as Adapter
    participant API as CMS API
    
    Note over UI,API: ${domainTitle} ${details.description} Flow
    
    %% Request Flow
    UI->>FS: ${details.description}(params)
    Note right of UI: User action
    
    FS->>FS: Build request
    Note right of FS: Type: ${details.requestType}
    
    FS->>AH: ${details.method} ${details.frontendEndpoint}
    Note right of FS: Next.js API Route
    
    AH->>AH: Extract auth token
    Note right of AH: getCmsAccessTokenFromCookies()
`;

  // Add authentication check for error path
  if (includeErrorPaths) {
    diagram += `    
    alt No auth token
        AH-->>FS: 401 Unauthorized
        FS-->>UI: Error: 인증 필요
        Note right of UI: Redirect to login
    else Authenticated
`;
  }

  // Request conversion for create/update
  if (operation === 'create' || operation === 'update') {
    diagram += `    
    AH->>AD: to${operation === 'create' ? 'Create' : 'Update'}${domainTitle}Request()
    Note right of AD: Model → DTO
    AD-->>AH: ${domainTitle}Dto
`;
  }

  diagram += `    
    AH->>BS: ${operation}${domainTitle}()
    Note right of AH: Backend Service call
    
    BS->>BS: Build CMS API request
    Note right of BS: Add auth header
    
    BS->>API: ${details.method} ${details.cmsEndpoint}
    Note right of BS: External CMS API
`;

  // Add error path for CMS API
  if (includeErrorPaths) {
    diagram += `    
    alt CMS API Error
        API-->>BS: 4xx/5xx Error
        BS-->>AH: ServiceResponse{success:false}
        AH-->>FS: Error response
        FS-->>UI: Display error
    else Success
`;
  }

  diagram += `    
    API-->>BS: JSON Response
    Note left of API: DTO structure
    
    BS->>AD: from${domainTitle}Response()
    Note right of AD: DTO → Model
    AD-->>BS: ${details.responseType}
    
    BS-->>AH: ServiceResponse{success:true, data}
    Note left of BS: Wrapped in ServiceResponse
    
    AH-->>FS: NextResponse.json()
    Note left of AH: HTTP ${details.method === 'POST' ? '201' : '200'}
    
    FS->>FS: Mapper.fromModel()
    Note right of FS: Model → Presenter
    
    FS-->>UI: ${details.presenterType}
    Note right of UI: Render UI
`;

  if (includeErrorPaths) {
    diagram += `    end
    end`;
  }

  return diagram;
}

/**
 * Generate type conversion diagram
 */
function generateTypeConversionDiagram(domain: string): string {
  const domainTitle = capitalize(domain);
  
  return `graph LR
    API[CMS API JSON]
    DTO[${domainTitle}Dto]
    Model[${domainTitle}Model]
    Presenter[${domainTitle}Presenter]
    UI[UI Component]
    
    API -->|"Backend Service<br/>fetch()"| DTO
    DTO -->|"Adapter<br/>fromResponse()"| Model
    Model -->|"API Handler<br/>ServiceResponse"| FS[Frontend Service]
    FS -->|"Mapper<br/>fromModel()"| Presenter
    Presenter -->|"React Props"| UI
    
    style API fill:#e1f5ff
    style DTO fill:#fff3e0
    style Model fill:#f3e5f5
    style Presenter fill:#e8f5e9
    style UI fill:#fce4ec
    
    %% Reverse flow for create/update
    UI2[UI Form] -->|"User Input"| Presenter2[${domainTitle}Presenter]
    Presenter2 -->|"Mapper<br/>toCreateModel()"| Model2[Create${domainTitle}Model]
    Model2 -->|"Frontend Service"| AH[API Handler]
    AH -->|"Adapter<br/>toCreateRequest()"| DTO2[Create${domainTitle}Dto]
    DTO2 -->|"Backend Service<br/>fetch()"| API2[CMS API]
    
    style UI2 fill:#fce4ec
    style Presenter2 fill:#e8f5e9
    style Model2 fill:#f3e5f5
    style DTO2 fill:#fff3e0
    style API2 fill:#e1f5ff
`;
}

/**
 * Generate error path diagram
 */
function generateErrorPathDiagram(domain: string): string {
  const domainTitle = capitalize(domain);
  
  return `graph TD
    Start[Request Start]
    
    Start --> CheckAuth{Auth Token<br/>Present?}
    CheckAuth -->|No| Error401[401 Unauthorized]
    CheckAuth -->|Yes| CallBackend[Call Backend Service]
    
    CallBackend --> FetchCMS[Fetch CMS API]
    FetchCMS --> CheckResponse{CMS API<br/>Success?}
    
    CheckResponse -->|Network Error| ErrorNetwork[Network Error]
    CheckResponse -->|4xx Error| Error4xx[Client Error]
    CheckResponse -->|5xx Error| Error5xx[Server Error]
    CheckResponse -->|200/201| ParseJSON[Parse JSON]
    
    ParseJSON --> ConvertDTO[Adapter: DTO→Model]
    ConvertDTO --> CheckConversion{Conversion<br/>Success?}
    
    CheckConversion -->|Field Missing| ErrorMapping[Field Mapping Error]
    CheckConversion -->|Type Mismatch| ErrorType[Type Conversion Error]
    CheckConversion -->|Success| WrapResponse[ServiceResponse{success:true}]
    
    WrapResponse --> ReturnToFrontend[Return to Frontend]
    ReturnToFrontend --> ConvertPresenter[Mapper: Model→Presenter]
    ConvertPresenter --> Success[✅ Success]
    
    Error401 --> HandleError[Handle Error]
    ErrorNetwork --> HandleError
    Error4xx --> HandleError
    Error5xx --> HandleError
    ErrorMapping --> HandleError
    ErrorType --> HandleError
    
    HandleError --> ReturnError[ServiceResponse{success:false}]
    ReturnError --> ShowError[❌ Display Error]
    
    style Start fill:#e3f2fd
    style Success fill:#c8e6c9
    style ShowError fill:#ffcdd2
    style Error401 fill:#ffcdd2
    style ErrorNetwork fill:#ffcdd2
    style Error4xx fill:#ffcdd2
    style Error5xx fill:#ffcdd2
    style ErrorMapping fill:#ffcdd2
    style ErrorType fill:#ffcdd2
`;
}

/**
 * Generate layered architecture diagram
 */
function generateArchitectureDiagram(): string {
  return `graph TB
    subgraph Frontend ["Frontend Layer"]
        UI[UI Components]
        FrontendService[Frontend Service]
        Presenter[Presenter Types]
        Mapper[Mapper]
    end
    
    subgraph APIHandler ["API Handler Layer (Next.js)"]
        Route[route.ts]
        Auth[Authentication]
        Module[Module]
    end
    
    subgraph Backend ["Backend Service Layer"]
        BackendService[Backend Service]
        Adapter[Adapter]
        BaseService[BaseService]
    end
    
    subgraph External ["External Layer"]
        CMSAPI[CMS API]
    end
    
    subgraph Types ["Type Definitions"]
        DTO[DTO]
        Model[Model]
        PresenterType[Presenter]
    end
    
    UI --> FrontendService
    FrontendService --> Mapper
    Mapper --> Presenter
    Mapper --> Model
    
    FrontendService --> Route
    Route --> Auth
    Route --> Module
    Module --> BackendService
    
    BackendService --> BaseService
    BackendService --> Adapter
    Adapter --> DTO
    Adapter --> Model
    
    BackendService --> CMSAPI
    
    style Frontend fill:#e8f5e9
    style APIHandler fill:#fff3e0
    style Backend fill:#f3e5f5
    style External fill:#e1f5ff
    style Types fill:#fce4ec
`;
}

/**
 * Display diagram
 */
function displayDiagram(diagram: string, title: string): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(80)}\n`);
  console.log('```mermaid');
  console.log(diagram);
  console.log('```\n');
}

/**
 * Main function
 */
function main() {
  const domain = process.argv[2];
  const operation = process.argv[3] as Operation;
  const includeErrors = process.argv.includes('--errors');
  
  if (!domain) {
    console.error(`Usage: node generate-flow-diagram.ts <domain> <operation> [--errors]`);
    console.error(`\nOperations: list, get, create, update, delete`);
    console.error(`\nExamples:`);
    console.error(`  node generate-flow-diagram.ts brochure list`);
    console.error(`  node generate-flow-diagram.ts brochure create --errors`);
    console.error(`\nSpecial diagrams:`);
    console.error(`  node generate-flow-diagram.ts <domain> types     - Type conversion flow`);
    console.error(`  node generate-flow-diagram.ts <domain> errors    - Error handling paths`);
    console.error(`  node generate-flow-diagram.ts architecture        - System architecture`);
    process.exit(1);
  }
  
  // Special cases
  if (domain === 'architecture') {
    displayDiagram(generateArchitectureDiagram(), 'System Architecture');
    return;
  }
  
  if (operation === 'types') {
    displayDiagram(generateTypeConversionDiagram(domain), `${capitalize(domain)} - Type Conversion Flow`);
    return;
  }
  
  if (operation === 'errors') {
    displayDiagram(generateErrorPathDiagram(domain), `${capitalize(domain)} - Error Handling Paths`);
    return;
  }
  
  // Regular operation diagram
  if (!operation || !['list', 'get', 'create', 'update', 'delete'].includes(operation)) {
    console.error(`Invalid operation: ${operation}`);
    console.error(`Valid operations: list, get, create, update, delete`);
    process.exit(1);
  }
  
  const config: DiagramConfig = {
    domain,
    operation,
    includeErrorPaths: includeErrors,
  };
  
  const details = getOperationDetails(domain, operation);
  const diagram = generateSequenceDiagram(config);
  
  displayDiagram(
    diagram,
    `${capitalize(domain)} - ${details.description} (${details.method}) Sequence${includeErrors ? ' with Error Paths' : ''}`
  );
  
  // Show usage tip
  console.log(`💡 Tip: Use --errors flag to include error handling paths`);
  console.log(`💡 Tip: Generate other diagrams:`);
  console.log(`   - ${domain} types    (Type conversion flow)`);
  console.log(`   - ${domain} errors   (Error handling)`);
  console.log(`   - architecture       (System overview)`);
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use as module
export { 
  generateSequenceDiagram,
  generateTypeConversionDiagram,
  generateErrorPathDiagram,
  generateArchitectureDiagram,
  DiagramConfig,
  Operation,
};
