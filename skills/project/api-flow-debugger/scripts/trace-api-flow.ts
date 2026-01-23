#!/usr/bin/env node
/**
 * API Flow Tracer
 * 
 * Automatically discovers all files involved in an API request/response flow
 * for a given domain.
 * 
 * Usage:
 *   node trace-api-flow.ts <domain-name>
 * 
 * Example:
 *   node trace-api-flow.ts brochure
 * 
 * Output:
 *   - Frontend Service files (planning & current)
 *   - API Handler files (route.ts)
 *   - Backend Service file
 *   - Type files (DTO, Model, Presenter)
 *   - Converter files (Adapter, Mapper)
 *   - Endpoint files
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ApiFlowFiles {
  domain: string;
  found: boolean;
  
  // Service files
  frontendServices: {
    planning: string | null;
    current: string | null;
  };
  backendService: string | null;
  
  // Type files
  types: {
    dto: string | null;
    model: string | null;
    presenter: string | null;
  };
  
  // Converter files
  converters: {
    adapter: string | null;
    mapper: string | null;
  };
  
  // Infrastructure files
  apiHandlers: string[];
  endpoints: {
    frontend: string | null;
    backend: string | null;
  };
  
  // Optional files
  interface: string | null;
  module: string | null;
}

/**
 * Find files using glob pattern
 */
async function findFiles(pattern: string, projectRoot: string): Promise<string[]> {
  try {
    const command = `find ${projectRoot} -type f -path "${pattern}" 2>/dev/null`;
    const { stdout } = await execAsync(command);
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Find Frontend Service files
 */
async function findFrontendServices(domain: string, projectRoot: string) {
  const planningFiles = await findFiles(`**/( planning)/**/${domain}/_services/${domain}.service.ts`, projectRoot);
  const currentFiles = await findFiles(`**/( current)/**/${domain}/_services/${domain}.service.ts`, projectRoot);
  
  return {
    planning: planningFiles[0] || null,
    current: currentFiles[0] || null,
  };
}

/**
 * Find Backend Service file
 */
async function findBackendService(domain: string, projectRoot: string): Promise<string | null> {
  const files = await findFiles(`**/api/_backend/**/${domain}/${domain}.service.ts`, projectRoot);
  return files[0] || null;
}

/**
 * Find API Handler files (route.ts)
 */
async function findApiHandlers(domain: string, projectRoot: string): Promise<string[]> {
  // Find all route.ts files in api/(cms) directory
  const allRoutes = await findFiles(`**/api/(cms)/**/route.ts`, projectRoot);
  
  // Filter by domain name (check if path contains domain or its plural)
  return allRoutes.filter(route => {
    const segments = route.split('/');
    return segments.some(seg => 
      seg === `(${domain})` || 
      seg === domain || 
      seg === `${domain}s` ||
      seg.includes(`${domain}-`)
    );
  });
}

/**
 * Find Type files
 */
async function findTypeFiles(domain: string, projectRoot: string) {
  const dtoFiles = await findFiles(`**/api/_backend/**/${domain}/types/${domain}.dto.ts`, projectRoot);
  const modelFiles = await findFiles(`**/( planning)/**/${domain}/_types/${domain}.model.ts`, projectRoot);
  const presenterFiles = await findFiles(`**/( planning)/**/${domain}/_types/${domain}.presenter.ts`, projectRoot);
  
  return {
    dto: dtoFiles[0] || null,
    model: modelFiles[0] || null,
    presenter: presenterFiles[0] || null,
  };
}

/**
 * Find Converter files
 */
async function findConverters(domain: string, projectRoot: string) {
  const adapterFiles = await findFiles(`**/api/_backend/**/${domain}/types/${domain}.adapter.ts`, projectRoot);
  const mapperFiles = await findFiles(`**/${domain}/_services/${domain}.mapper.ts`, projectRoot);
  
  return {
    adapter: adapterFiles[0] || null,
    mapper: mapperFiles[0] || null,
  };
}

/**
 * Find Endpoint files
 */
async function findEndpoints(domain: string, projectRoot: string) {
  const allEndpoints = await findFiles(`**/${domain}.endpoints.ts`, projectRoot);
  
  const frontend = allEndpoints.find(ep => ep.includes('(current)')) || null;
  const backend = allEndpoints.find(ep => ep.includes('_backend')) || null;
  
  return { frontend, backend };
}

/**
 * Find Interface file
 */
async function findInterface(domain: string, projectRoot: string): Promise<string | null> {
  const files = await findFiles(`**/${domain}/_services/${domain}.interface.ts`, projectRoot);
  return files[0] || null;
}

/**
 * Find Module file
 */
async function findModule(domain: string, projectRoot: string): Promise<string | null> {
  const files = await findFiles(`**/api/_backend/**/${domain}/${domain}.module.ts`, projectRoot);
  return files[0] || null;
}

/**
 * Get project root (assume script is in skills/api-flow-debugger/scripts)
 */
function getProjectRoot(): string {
  // Get the directory containing this script
  const scriptDir = __dirname;
  
  // Go up to workspace root: scripts -> api-flow-debugger -> skills -> .cursor -> workspace
  const projectRoot = path.resolve(scriptDir, '../../../..');
  
  return projectRoot;
}

/**
 * Make path relative to project root for display
 */
function makeRelative(filePath: string | null, projectRoot: string): string | null {
  if (!filePath) return null;
  return path.relative(projectRoot, filePath);
}

/**
 * Trace API flow for a domain
 */
async function traceApiFlow(domain: string): Promise<ApiFlowFiles> {
  const projectRoot = getProjectRoot();
  
  console.log(`\n🔍 Tracing API flow for domain: ${domain}`);
  console.log(`📁 Project root: ${projectRoot}\n`);
  
  // Find all files in parallel
  const [
    frontendServices,
    backendService,
    apiHandlers,
    types,
    converters,
    endpoints,
    interfaceFile,
    moduleFile,
  ] = await Promise.all([
    findFrontendServices(domain, projectRoot),
    findBackendService(domain, projectRoot),
    findApiHandlers(domain, projectRoot),
    findTypeFiles(domain, projectRoot),
    findConverters(domain, projectRoot),
    findEndpoints(domain, projectRoot),
    findInterface(domain, projectRoot),
    findModule(domain, projectRoot),
  ]);
  
  return {
    domain,
    found: !!(
      frontendServices.planning || 
      frontendServices.current || 
      backendService
    ),
    frontendServices,
    backendService,
    types,
    converters,
    apiHandlers,
    endpoints,
    interface: interfaceFile,
    module: moduleFile,
  };
}

/**
 * Display results
 */
function displayResults(results: ApiFlowFiles): void {
  const projectRoot = getProjectRoot();
  
  if (!results.found) {
    console.log(`❌ No files found for domain: ${results.domain}`);
    console.log(`\n💡 Suggestions:`);
    console.log(`   1. Check domain name spelling (use lowercase, hyphens)`);
    console.log(`   2. Try: grep -r "${results.domain}" src/`);
    console.log(`   3. Check for plural forms or related names`);
    return;
  }
  
  console.log(`✅ Found API flow for: ${results.domain}\n`);
  
  // Frontend Services
  console.log(`📦 Frontend Services:`);
  if (results.frontendServices.planning) {
    console.log(`   Planning: ${makeRelative(results.frontendServices.planning, projectRoot)}`);
  }
  if (results.frontendServices.current) {
    console.log(`   Current:  ${makeRelative(results.frontendServices.current, projectRoot)}`);
  }
  if (!results.frontendServices.planning && !results.frontendServices.current) {
    console.log(`   ⚠️  Not found`);
  }
  
  // Backend Service
  console.log(`\n📦 Backend Service:`);
  if (results.backendService) {
    console.log(`   ${makeRelative(results.backendService, projectRoot)}`);
  } else {
    console.log(`   ⚠️  Not found`);
  }
  
  // API Handlers
  console.log(`\n📦 API Handlers (route.ts):`);
  if (results.apiHandlers.length > 0) {
    results.apiHandlers.forEach(handler => {
      console.log(`   ${makeRelative(handler, projectRoot)}`);
    });
  } else {
    console.log(`   ⚠️  Not found`);
  }
  
  // Type Files
  console.log(`\n📄 Type Files:`);
  console.log(`   DTO:       ${results.types.dto ? makeRelative(results.types.dto, projectRoot) : '⚠️  Not found'}`);
  console.log(`   Model:     ${results.types.model ? makeRelative(results.types.model, projectRoot) : '⚠️  Not found'}`);
  console.log(`   Presenter: ${results.types.presenter ? makeRelative(results.types.presenter, projectRoot) : '⚠️  Not found'}`);
  
  // Converter Files
  console.log(`\n🔄 Converter Files:`);
  console.log(`   Adapter: ${results.converters.adapter ? makeRelative(results.converters.adapter, projectRoot) : '⚠️  Not found'}`);
  console.log(`   Mapper:  ${results.converters.mapper ? makeRelative(results.converters.mapper, projectRoot) : '⚠️  Not found'}`);
  
  // Endpoint Files
  console.log(`\n🌐 Endpoint Files:`);
  console.log(`   Frontend: ${results.endpoints.frontend ? makeRelative(results.endpoints.frontend, projectRoot) : '⚠️  Not found'}`);
  console.log(`   Backend:  ${results.endpoints.backend ? makeRelative(results.endpoints.backend, projectRoot) : '⚠️  Not found'}`);
  
  // Optional Files
  if (results.interface || results.module) {
    console.log(`\n📋 Optional Files:`);
    if (results.interface) {
      console.log(`   Interface: ${makeRelative(results.interface, projectRoot)}`);
    }
    if (results.module) {
      console.log(`   Module:    ${makeRelative(results.module, projectRoot)}`);
    }
  }
  
  // Summary
  const totalFound = [
    results.frontendServices.planning,
    results.frontendServices.current,
    results.backendService,
    ...results.apiHandlers,
    results.types.dto,
    results.types.model,
    results.types.presenter,
    results.converters.adapter,
    results.converters.mapper,
    results.endpoints.frontend,
    results.endpoints.backend,
    results.interface,
    results.module,
  ].filter(Boolean).length;
  
  console.log(`\n📊 Summary: Found ${totalFound} file(s)`);
}

/**
 * Main function
 */
async function main() {
  const domain = process.argv[2];
  
  if (!domain) {
    console.error(`Usage: node trace-api-flow.ts <domain-name>`);
    console.error(`Example: node trace-api-flow.ts brochure`);
    process.exit(1);
  }
  
  try {
    const results = await traceApiFlow(domain);
    displayResults(results);
  } catch (error) {
    console.error(`❌ Error tracing API flow:`, error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use as module
export { traceApiFlow, ApiFlowFiles };
