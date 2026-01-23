#!/usr/bin/env node

/**
 * 타입 일관성 검증 스크립트
 * 
 * @description Model, Presenter, Mapper 간 타입 일관성을 검증합니다.
 * 
 * @usage
 * node scripts/validate-type-consistency.ts <domain>
 * 
 * @example
 * node scripts/validate-type-consistency.ts brochure
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../../../..");
const PORTAL_ROOT = path.join(PROJECT_ROOT, "portal/src/app");

interface FieldInfo {
  name: string;
  type: string;
  isOptional: boolean;
  line: number;
}

interface ValidationResult {
  domain: string;
  files: {
    model: string | null;
    presenter: string | null;
    mapper: string | null;
  };
  validation: {
    modelToPresenter: {
      status: "ok" | "error" | "warning";
      missingInPresenter: string[];
      extraInPresenter: string[];
    };
    mapperFromModel: {
      status: "ok" | "error" | "warning";
      missingFields: string[];
    };
    mapperToModel: {
      status: "ok" | "error" | "warning";
      missingFields: string[];
    };
  };
  summary: {
    totalIssues: number;
    criticalIssues: number;
    passed: boolean;
  };
}

/**
 * 파일 찾기
 */
function findFile(pattern: string): string | null {
  try {
    const command = `find ${PORTAL_ROOT} -path "${pattern}" 2>/dev/null | head -1`;
    const result = execSync(command, { encoding: "utf-8" });
    const file = result.trim();
    return file.length > 0 ? file : null;
  } catch (error) {
    return null;
  }
}

/**
 * Interface 필드 추출
 */
function extractInterfaceFields(
  filePath: string,
  interfaceName: string
): FieldInfo[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const fields: FieldInfo[] = [];

  let inInterface = false;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith(`export interface ${interfaceName}`)) {
      inInterface = true;
      continue;
    }

    if (inInterface) {
      if (trimmed.includes("{")) braceCount++;
      if (trimmed.includes("}")) braceCount--;

      if (braceCount === 0 && trimmed.includes("}")) {
        break;
      }

      if (
        trimmed.length > 0 &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("*/") &&
        trimmed.includes(":")
      ) {
        const match = trimmed.match(/^(\w+)(\?)?:\s*(.+);?$/);
        if (match) {
          const [, name, optional, type] = match;
          fields.push({
            name,
            type: type.replace(/;$/, "").trim(),
            isOptional: !!optional,
            line: i + 1,
          });
        }
      }
    }
  }

  return fields;
}

/**
 * Class 필드 추출 (Presenter)
 */
function extractClassFields(filePath: string, className: string): FieldInfo[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const fields: FieldInfo[] = [];

  let inClass = false;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith(`export class ${className}`)) {
      inClass = true;
      continue;
    }

    if (inClass) {
      if (trimmed.includes("{")) braceCount++;
      if (trimmed.includes("}")) braceCount--;

      if (braceCount === 0 && trimmed.includes("}")) {
        break;
      }

      // readonly 필드만 추출
      if (trimmed.startsWith("readonly ")) {
        const match = trimmed.match(/^readonly\s+(\w+)(\?)?:\s*(.+);?$/);
        if (match) {
          const [, name, optional, type] = match;
          fields.push({
            name,
            type: type.replace(/;$/, "").trim(),
            isOptional: !!optional,
            line: i + 1,
          });
        }
      }
    }
  }

  return fields;
}

/**
 * Mapper 메서드에서 필드 변환 확인
 */
function checkMapperFields(
  filePath: string,
  methodName: string,
  fields: string[]
): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const missing: string[] = [];

  for (const field of fields) {
    // 필드가 메서드 내에 있는지 확인
    const regex = new RegExp(`${field}:\\s*`, "g");
    const inMethod = content.includes(`static ${methodName}`) && regex.test(content);
    
    if (!inMethod) {
      missing.push(field);
    }
  }

  return missing;
}

/**
 * 타입 일관성 검증
 */
function validateConsistency(domain: string): ValidationResult {
  console.log(`🔍 Validating type consistency for: ${domain}\n`);

  // 파일 찾기
  const modelPattern = `*/(planning)/**/${domain}/_types/${domain}.model.ts`;
  const presenterPattern = `*/(planning)/**/${domain}/_types/${domain}.presenter.ts`;
  const mapperPattern = `*/(planning)/**/${domain}/_services/${domain}.mapper.ts`;

  const modelPath = findFile(modelPattern);
  const presenterPath = findFile(presenterPattern);
  const mapperPath = findFile(mapperPattern);

  const result: ValidationResult = {
    domain,
    files: {
      model: modelPath ? path.relative(PROJECT_ROOT, modelPath) : null,
      presenter: presenterPath ? path.relative(PROJECT_ROOT, presenterPath) : null,
      mapper: mapperPath ? path.relative(PROJECT_ROOT, mapperPath) : null,
    },
    validation: {
      modelToPresenter: {
        status: "ok",
        missingInPresenter: [],
        extraInPresenter: [],
      },
      mapperFromModel: {
        status: "ok",
        missingFields: [],
      },
      mapperToModel: {
        status: "ok",
        missingFields: [],
      },
    },
    summary: {
      totalIssues: 0,
      criticalIssues: 0,
      passed: true,
    },
  };

  // 파일이 없으면 검증 불가
  if (!modelPath || !presenterPath || !mapperPath) {
    result.summary.passed = false;
    result.summary.criticalIssues = 3;
    return result;
  }

  // Model 필드 추출
  const modelInterfaceName = `${domain.charAt(0).toUpperCase() + domain.slice(1)}Model`;
  const modelFields = extractInterfaceFields(modelPath, modelInterfaceName);

  // Presenter 필드 추출
  const presenterClassName = `${domain.charAt(0).toUpperCase() + domain.slice(1)}Presenter`;
  const presenterFields = extractClassFields(presenterPath, presenterClassName);

  // Model → Presenter 검증
  const modelFieldNames = modelFields.map((f) => f.name);
  const presenterFieldNames = presenterFields.map((f) => f.name);

  result.validation.modelToPresenter.missingInPresenter = modelFieldNames.filter(
    (name) => !presenterFieldNames.includes(name)
  );
  result.validation.modelToPresenter.extraInPresenter = presenterFieldNames.filter(
    (name) => !modelFieldNames.includes(name)
  );

  if (result.validation.modelToPresenter.missingInPresenter.length > 0) {
    result.validation.modelToPresenter.status = "error";
    result.summary.criticalIssues +=
      result.validation.modelToPresenter.missingInPresenter.length;
  }

  if (result.validation.modelToPresenter.extraInPresenter.length > 0) {
    result.validation.modelToPresenter.status = "warning";
  }

  // Mapper 검증 (fromModel)
  const missingInFromModel = checkMapperFields(
    mapperPath,
    "fromModel",
    modelFieldNames
  );
  result.validation.mapperFromModel.missingFields = missingInFromModel;
  if (missingInFromModel.length > 0) {
    result.validation.mapperFromModel.status = "error";
    result.summary.criticalIssues += missingInFromModel.length;
  }

  // Mapper 검증 (toModel)
  const missingInToModel = checkMapperFields(
    mapperPath,
    "toModel",
    presenterFieldNames
  );
  result.validation.mapperToModel.missingFields = missingInToModel;
  if (missingInToModel.length > 0) {
    result.validation.mapperToModel.status = "error";
    result.summary.criticalIssues += missingInToModel.length;
  }

  // 총 이슈 수 계산
  result.summary.totalIssues =
    result.validation.modelToPresenter.missingInPresenter.length +
    result.validation.modelToPresenter.extraInPresenter.length +
    result.validation.mapperFromModel.missingFields.length +
    result.validation.mapperToModel.missingFields.length;

  result.summary.passed = result.summary.criticalIssues === 0;

  return result;
}

/**
 * 결과 출력
 */
function printResult(result: ValidationResult): void {
  console.log("━".repeat(80));
  console.log("📊 Type Consistency Validation Report");
  console.log("━".repeat(80));
  console.log();

  // 파일 확인
  console.log("📁 Files:");
  console.log(`  Model:     ${result.files.model || "❌ NOT FOUND"}`);
  console.log(`  Presenter: ${result.files.presenter || "❌ NOT FOUND"}`);
  console.log(`  Mapper:    ${result.files.mapper || "❌ NOT FOUND"}`);
  console.log();

  if (!result.files.model || !result.files.presenter || !result.files.mapper) {
    console.log("❌ Cannot validate: Missing critical files");
    return;
  }

  // Model → Presenter 검증
  console.log("━".repeat(80));
  console.log("1️⃣  Model → Presenter");
  console.log("━".repeat(80));
  console.log();

  if (result.validation.modelToPresenter.status === "ok") {
    console.log("✅ All Model fields are present in Presenter");
  } else {
    if (result.validation.modelToPresenter.missingInPresenter.length > 0) {
      console.log("❌ Missing in Presenter:");
      result.validation.modelToPresenter.missingInPresenter.forEach((field) => {
        console.log(`   - ${field}`);
      });
    }

    if (result.validation.modelToPresenter.extraInPresenter.length > 0) {
      console.log("⚠️  Extra fields in Presenter (not in Model):");
      result.validation.modelToPresenter.extraInPresenter.forEach((field) => {
        console.log(`   - ${field}`);
      });
    }
  }
  console.log();

  // Mapper fromModel 검증
  console.log("━".repeat(80));
  console.log("2️⃣  Mapper.fromModel() (Model → Presenter)");
  console.log("━".repeat(80));
  console.log();

  if (result.validation.mapperFromModel.status === "ok") {
    console.log("✅ All fields are converted in fromModel()");
  } else {
    console.log("❌ Missing field conversions in fromModel():");
    result.validation.mapperFromModel.missingFields.forEach((field) => {
      console.log(`   - ${field}`);
    });
  }
  console.log();

  // Mapper toModel 검증
  console.log("━".repeat(80));
  console.log("3️⃣  Mapper.toModel() (Presenter → Model)");
  console.log("━".repeat(80));
  console.log();

  if (result.validation.mapperToModel.status === "ok") {
    console.log("✅ All fields are converted in toModel()");
  } else {
    console.log("❌ Missing field conversions in toModel():");
    result.validation.mapperToModel.missingFields.forEach((field) => {
      console.log(`   - ${field}`);
    });
  }
  console.log();

  // 요약
  console.log("━".repeat(80));
  console.log("📈 Summary");
  console.log("━".repeat(80));
  console.log();
  console.log(`Total issues:    ${result.summary.totalIssues}`);
  console.log(`Critical issues: ${result.summary.criticalIssues}`);
  console.log();

  if (result.summary.passed) {
    console.log("✅ Validation PASSED - Type consistency is good!");
  } else {
    console.log("❌ Validation FAILED - Please fix the issues above");
  }
  console.log();

  // Next steps
  if (!result.summary.passed) {
    console.log("━".repeat(80));
    console.log("📝 Next Steps");
    console.log("━".repeat(80));
    console.log();
    console.log("1. Fix missing fields in Presenter:");
    console.log("   - Add readonly fields to Presenter class");
    console.log("   - Update create(), copyWith() methods");
    console.log();
    console.log("2. Fix Mapper conversions:");
    console.log("   - Add field conversions in fromModel()");
    console.log("   - Add field conversions in toModel()");
    console.log();
    console.log("3. Refer to templates:");
    console.log("   - assets/templates/presenter-update.template.ts");
    console.log("   - assets/templates/mapper-update.template.ts");
    console.log();
  }
}

/**
 * 메인 함수
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("❌ Error: Domain name is required");
    console.log();
    console.log("Usage: node scripts/validate-type-consistency.ts <domain>");
    console.log();
    console.log("Examples:");
    console.log("  node scripts/validate-type-consistency.ts brochure");
    console.log("  node scripts/validate-type-consistency.ts ir");
    process.exit(1);
  }

  const domain = args[0];
  const result = validateConsistency(domain);

  printResult(result);

  process.exit(result.summary.passed ? 0 : 1);
}

// 실행
main();
