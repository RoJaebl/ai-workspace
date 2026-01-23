#!/usr/bin/env node
/**
 * Type Validator
 * 
 * Validates type consistency between DTO, Model, and Presenter layers.
 * Detects field name mismatches, missing mappings, and type incompatibilities.
 * 
 * Usage:
 *   node validate-types.ts <domain-name>
 * 
 * Example:
 *   node validate-types.ts brochure
 * 
 * Output:
 *   - Field comparison between layers
 *   - Missing field mappings
 *   - Type mismatches
 *   - Suggestions for fixes
 */

import * as fs from 'fs';
import * as path from 'path';

interface FieldDefinition {
  name: string;
  type: string;
  optional: boolean;
  array: boolean;
}

interface ComparisonResult {
  missingInTarget: FieldDefinition[];
  missingInSource: FieldDefinition[];
  typeMismatches: {
    field: string;
    sourceType: string;
    targetType: string;
  }[];
  optionalMismatches: {
    field: string;
    sourceOptional: boolean;
    targetOptional: boolean;
  }[];
}

interface ValidationReport {
  domain: string;
  timestamp: string;
  dtoToModel: ComparisonResult | null;
  modelToPresenter: ComparisonResult | null;
  summary: {
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
}

/**
 * Known field name mappings
 */
const KNOWN_MAPPINGS: Record<string, string> = {
  // Attachment fields
  'name': 'fileName',
  'url': 'fileUrl',
  'size': 'fileSize',
  
  // Category fields
  'isActive': 'isPublic',
  
  // Document fields
  'createdBy': 'authorId',
  
  // Translation fields
  'description': 'content',
  
  // Pagination fields
  'limit': 'size',
};

/**
 * Reverse mapping lookup
 */
function getReversedMapping(): Record<string, string> {
  const reversed: Record<string, string> = {};
  for (const [key, value] of Object.entries(KNOWN_MAPPINGS)) {
    reversed[value] = key;
  }
  return reversed;
}

/**
 * Extract fields from interface/type definition
 */
function extractFields(content: string, interfaceName: string): FieldDefinition[] {
  const fields: FieldDefinition[] = [];
  
  // Find the interface definition
  const interfaceRegex = new RegExp(
    `(?:export )?(?:interface|type)\\s+${interfaceName}\\s*(?:extends\\s+[^{]+)?\\s*{([^}]+)}`,
    's'
  );
  
  const match = content.match(interfaceRegex);
  if (!match) {
    return fields;
  }
  
  const interfaceBody = match[1];
  
  // Extract fields (handle multi-line)
  const fieldRegex = /^\s*(\w+)(\?)?:\s*(.+?)(?:;|$)/gm;
  let fieldMatch;
  
  while ((fieldMatch = fieldRegex.exec(interfaceBody)) !== null) {
    const name = fieldMatch[1];
    const optional = !!fieldMatch[2];
    let type = fieldMatch[3].trim();
    
    // Remove inline comments
    type = type.replace(/\/\/.*$/, '').trim();
    
    // Check if array
    const array = type.endsWith('[]') || type.includes('Array<');
    
    fields.push({
      name,
      type,
      optional,
      array,
    });
  }
  
  return fields;
}

/**
 * Find main interface in file
 */
function findMainInterface(content: string, domain: string, suffix: string): string | null {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const domainTitle = capitalize(domain);
  
  // Try common patterns
  const patterns = [
    `${domainTitle}${suffix}`,
    `${domainTitle}Response${suffix}`,
    `${domainTitle}List${suffix}`,
  ];
  
  for (const pattern of patterns) {
    if (content.includes(`interface ${pattern}`) || content.includes(`type ${pattern}`)) {
      return pattern;
    }
  }
  
  return null;
}

/**
 * Compare two field lists
 */
function compareFields(
  source: FieldDefinition[],
  target: FieldDefinition[],
  mappings: Record<string, string>
): ComparisonResult {
  const missingInTarget: FieldDefinition[] = [];
  const missingInSource: FieldDefinition[] = [];
  const typeMismatches: ComparisonResult['typeMismatches'] = [];
  const optionalMismatches: ComparisonResult['optionalMismatches'] = [];
  
  // Check source fields exist in target (with mappings)
  for (const sourceField of source) {
    const mappedName = mappings[sourceField.name] || sourceField.name;
    const targetField = target.find(f => f.name === mappedName);
    
    if (!targetField) {
      missingInTarget.push(sourceField);
    } else {
      // Check type compatibility (basic check)
      if (sourceField.type !== targetField.type) {
        typeMismatches.push({
          field: sourceField.name + (mappings[sourceField.name] ? ` → ${mappedName}` : ''),
          sourceType: sourceField.type,
          targetType: targetField.type,
        });
      }
      
      // Check optional flag
      if (sourceField.optional !== targetField.optional) {
        optionalMismatches.push({
          field: sourceField.name + (mappings[sourceField.name] ? ` → ${mappedName}` : ''),
          sourceOptional: sourceField.optional,
          targetOptional: targetField.optional,
        });
      }
    }
  }
  
  // Check target fields exist in source (reverse)
  const reversedMappings = getReversedMapping();
  for (const targetField of target) {
    const mappedName = reversedMappings[targetField.name] || targetField.name;
    const sourceField = source.find(f => f.name === mappedName);
    
    if (!sourceField) {
      missingInSource.push(targetField);
    }
  }
  
  return {
    missingInTarget,
    missingInSource,
    typeMismatches,
    optionalMismatches,
  };
}

/**
 * Read and validate types for a domain
 */
function validateTypes(domain: string, projectRoot: string): ValidationReport {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  
  // Find type files (simplified - assumes common structure)
  const dtoPath = path.join(projectRoot, `portal/src/app/api/_backend/modules/cms/admin/homepage/${domain}/types/${domain}.dto.ts`);
  const modelPath = path.join(projectRoot, `portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/${domain}/_types/${domain}.model.ts`);
  const presenterPath = path.join(projectRoot, `portal/src/app/(planning)/plan/(cms)/cms/(admin)/homepage/${domain}/_types/${domain}.presenter.ts`);
  
  const report: ValidationReport = {
    domain,
    timestamp: new Date().toISOString(),
    dtoToModel: null,
    modelToPresenter: null,
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      warnings: 0,
    },
  };
  
  // Validate DTO → Model
  if (fs.existsSync(dtoPath) && fs.existsSync(modelPath)) {
    const dtoContent = fs.readFileSync(dtoPath, 'utf-8');
    const modelContent = fs.readFileSync(modelPath, 'utf-8');
    
    const dtoInterface = findMainInterface(dtoContent, domain, 'ResponseDto') || `${capitalize(domain)}ResponseDto`;
    const modelInterface = findMainInterface(modelContent, domain, 'Model') || `${capitalize(domain)}Model`;
    
    const dtoFields = extractFields(dtoContent, dtoInterface);
    const modelFields = extractFields(modelContent, modelInterface);
    
    if (dtoFields.length > 0 && modelFields.length > 0) {
      report.dtoToModel = compareFields(dtoFields, modelFields, KNOWN_MAPPINGS);
    }
  }
  
  // Validate Model → Presenter
  if (fs.existsSync(modelPath) && fs.existsSync(presenterPath)) {
    const modelContent = fs.readFileSync(modelPath, 'utf-8');
    const presenterContent = fs.readFileSync(presenterPath, 'utf-8');
    
    const modelInterface = findMainInterface(modelContent, domain, 'Model') || `${capitalize(domain)}Model`;
    // Presenter is usually a class, but we look for interface it implements
    const presenterInterface = modelInterface; // Usually implements Model
    
    const modelFields = extractFields(modelContent, modelInterface);
    const presenterFields = extractFields(presenterContent, presenterInterface);
    
    if (modelFields.length > 0 && presenterFields.length > 0) {
      report.modelToPresenter = compareFields(modelFields, presenterFields, {});
    }
  }
  
  // Calculate summary
  if (report.dtoToModel) {
    report.summary.criticalIssues += report.dtoToModel.missingInTarget.length;
    report.summary.warnings += report.dtoToModel.typeMismatches.length;
    report.summary.warnings += report.dtoToModel.optionalMismatches.length;
  }
  
  if (report.modelToPresenter) {
    report.summary.criticalIssues += report.modelToPresenter.missingInTarget.length;
    report.summary.warnings += report.modelToPresenter.typeMismatches.length;
  }
  
  report.summary.totalIssues = report.summary.criticalIssues + report.summary.warnings;
  
  return report;
}

/**
 * Display validation results
 */
function displayResults(report: ValidationReport): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Type Validation Report: ${report.domain}`);
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`${'='.repeat(80)}\n`);
  
  // DTO → Model
  if (report.dtoToModel) {
    console.log(`📋 DTO → Model Validation\n`);
    
    if (report.dtoToModel.missingInTarget.length > 0) {
      console.log(`❌ Missing in Model (${report.dtoToModel.missingInTarget.length}):`);
      report.dtoToModel.missingInTarget.forEach(field => {
        const mappedName = KNOWN_MAPPINGS[field.name];
        if (mappedName) {
          console.log(`   - ${field.name} (should map to: ${mappedName})`);
        } else {
          console.log(`   - ${field.name}`);
        }
      });
      console.log();
    }
    
    if (report.dtoToModel.missingInSource.length > 0) {
      console.log(`ℹ️  Extra fields in Model (${report.dtoToModel.missingInSource.length}):`);
      report.dtoToModel.missingInSource.forEach(field => {
        console.log(`   - ${field.name} (computed or default value)`);
      });
      console.log();
    }
    
    if (report.dtoToModel.typeMismatches.length > 0) {
      console.log(`⚠️  Type Mismatches (${report.dtoToModel.typeMismatches.length}):`);
      report.dtoToModel.typeMismatches.forEach(mismatch => {
        console.log(`   - ${mismatch.field}`);
        console.log(`     DTO:   ${mismatch.sourceType}`);
        console.log(`     Model: ${mismatch.targetType}`);
      });
      console.log();
    }
    
    if (report.dtoToModel.optionalMismatches.length > 0) {
      console.log(`⚠️  Optional Flag Mismatches (${report.dtoToModel.optionalMismatches.length}):`);
      report.dtoToModel.optionalMismatches.forEach(mismatch => {
        console.log(`   - ${mismatch.field}: DTO ${mismatch.sourceOptional ? 'optional' : 'required'} → Model ${mismatch.targetOptional ? 'optional' : 'required'}`);
      });
      console.log();
    }
    
    if (
      report.dtoToModel.missingInTarget.length === 0 &&
      report.dtoToModel.typeMismatches.length === 0
    ) {
      console.log(`✅ No critical issues found in DTO → Model conversion\n`);
    }
  } else {
    console.log(`⚠️  Could not validate DTO → Model (files not found or no interfaces)\n`);
  }
  
  // Model → Presenter
  if (report.modelToPresenter) {
    console.log(`📋 Model → Presenter Validation\n`);
    
    if (report.modelToPresenter.missingInTarget.length > 0) {
      console.log(`❌ Missing in Presenter (${report.modelToPresenter.missingInTarget.length}):`);
      report.modelToPresenter.missingInTarget.forEach(field => {
        console.log(`   - ${field.name}`);
      });
      console.log();
    }
    
    if (report.modelToPresenter.missingInSource.length > 0) {
      console.log(`ℹ️  Extra in Presenter (${report.modelToPresenter.missingInSource.length}):`);
      report.modelToPresenter.missingInSource.forEach(field => {
        console.log(`   - ${field.name} (helper method or computed property)`);
      });
      console.log();
    }
    
    if (
      report.modelToPresenter.missingInTarget.length === 0 &&
      report.modelToPresenter.typeMismatches.length === 0
    ) {
      console.log(`✅ No critical issues found in Model → Presenter conversion\n`);
    }
  } else {
    console.log(`⚠️  Could not validate Model → Presenter (files not found or no interfaces)\n`);
  }
  
  // Summary
  console.log(`${'='.repeat(80)}`);
  console.log(`Summary:`);
  console.log(`  Total Issues: ${report.summary.totalIssues}`);
  console.log(`  Critical: ${report.summary.criticalIssues} (missing fields)`);
  console.log(`  Warnings: ${report.summary.warnings} (type/optional mismatches)`);
  console.log(`${'='.repeat(80)}\n`);
  
  // Suggestions
  if (report.summary.totalIssues > 0) {
    console.log(`💡 Suggestions:`);
    console.log(`   1. Check Adapter methods for missing field mappings`);
    console.log(`   2. Review known mappings: ${Object.entries(KNOWN_MAPPINGS).map(([k, v]) => `${k}→${v}`).join(', ')}`);
    console.log(`   3. Run: grep -n "static from.*Response" <adapter-file>`);
    console.log(`   4. Add logging to Adapter to debug conversions`);
    console.log();
  } else {
    console.log(`🎉 All type validations passed!\n`);
  }
}

/**
 * Get project root
 */
function getProjectRoot(): string {
  const scriptDir = __dirname;
  return path.resolve(scriptDir, '../../../..');
}

/**
 * Main function
 */
function main() {
  const domain = process.argv[2];
  
  if (!domain) {
    console.error(`Usage: node validate-types.ts <domain-name>`);
    console.error(`Example: node validate-types.ts brochure`);
    process.exit(1);
  }
  
  try {
    const projectRoot = getProjectRoot();
    const report = validateTypes(domain, projectRoot);
    displayResults(report);
    
    // Exit with error code if there are critical issues
    if (report.summary.criticalIssues > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error validating types:`, error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use as module
export { validateTypes, ValidationReport, FieldDefinition, ComparisonResult };
