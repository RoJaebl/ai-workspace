#!/usr/bin/env node

/**
 * Model 변경 감지 스크립트
 * 
 * @description Model 파일의 필드 변경사항을 분석하여 추가/삭제/수정된 필드를 보고합니다.
 * 
 * @usage
 * node scripts/analyze-model-changes.ts <domain>
 * 
 * @example
 * node scripts/analyze-model-changes.ts brochure
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

interface ChangeAnalysis {
  domain: string;
  modelPath: string | null;
  changes: {
    added: FieldInfo[];
    removed: FieldInfo[];
    typeChanged: Array<{
      name: string;
      oldType: string;
      newType: string;
      line: number;
    }>;
    optionalityChanged: Array<{
      name: string;
      wasOptional: boolean;
      isOptional: boolean;
      line: number;
    }>;
  };
  summary: {
    totalChanges: number;
    hasBreakingChanges: boolean;
  };
}

/**
 * Model 파일 찾기
 */
function findModelFile(domain: string): string | null {
  try {
    const pattern = `*/(planning)/**/${domain}/_types/${domain}.model.ts`;
    const command = `find ${PORTAL_ROOT} -path "${pattern}" 2>/dev/null | head -1`;
    const result = execSync(command, { encoding: "utf-8" });
    const file = result.trim();
    return file.length > 0 ? file : null;
  } catch (error) {
    return null;
  }
}

/**
 * TypeScript 파일에서 interface 필드 추출
 */
function extractFields(filePath: string, interfaceName: string): FieldInfo[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const fields: FieldInfo[] = [];
  
  let inInterface = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Interface 시작 감지
    if (trimmed.startsWith(`export interface ${interfaceName}`)) {
      inInterface = true;
      continue;
    }
    
    if (inInterface) {
      // 중괄호 카운트
      if (trimmed.includes("{")) braceCount++;
      if (trimmed.includes("}")) braceCount--;
      
      // Interface 종료
      if (braceCount === 0 && trimmed.includes("}")) {
        break;
      }
      
      // 필드 파싱 (주석, 빈 줄 제외)
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
 * Git diff를 사용한 변경 감지 (있으면 사용)
 */
function getGitChanges(filePath: string): string | null {
  try {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const command = `cd ${PROJECT_ROOT} && git diff HEAD -- ${relativePath}`;
    const result = execSync(command, { encoding: "utf-8" });
    return result.trim().length > 0 ? result : null;
  } catch (error) {
    return null;
  }
}

/**
 * 변경사항 분석
 */
function analyzeChanges(domain: string): ChangeAnalysis {
  console.log(`🔍 Analyzing model changes for: ${domain}\n`);
  
  const modelPath = findModelFile(domain);
  
  if (!modelPath) {
    return {
      domain,
      modelPath: null,
      changes: {
        added: [],
        removed: [],
        typeChanged: [],
        optionalityChanged: [],
      },
      summary: {
        totalChanges: 0,
        hasBreakingChanges: false,
      },
    };
  }
  
  console.log(`📄 Model file: ${path.relative(PROJECT_ROOT, modelPath)}\n`);
  
  // Git diff 확인 (참고용)
  const gitDiff = getGitChanges(modelPath);
  if (gitDiff) {
    console.log("📝 Git changes detected:\n");
    console.log(gitDiff);
    console.log("\n" + "━".repeat(80) + "\n");
  }
  
  // 메인 Model interface 추출
  const interfaceName = `${domain.charAt(0).toUpperCase() + domain.slice(1)}Model`;
  const currentFields = extractFields(modelPath, interfaceName);
  
  console.log(`✅ Extracted ${currentFields.length} fields from ${interfaceName}\n`);
  
  // 실제 프로젝트에서는 이전 버전과 비교해야 하지만,
  // 여기서는 현재 상태만 표시합니다.
  // Git diff가 있으면 참고하고, 없으면 현재 필드 목록만 표시
  
  return {
    domain,
    modelPath: path.relative(PROJECT_ROOT, modelPath),
    changes: {
      added: [], // Git diff 파싱으로 구현 가능
      removed: [],
      typeChanged: [],
      optionalityChanged: [],
    },
    summary: {
      totalChanges: 0,
      hasBreakingChanges: false,
    },
  };
}

/**
 * 현재 필드 목록 출력
 */
function printCurrentFields(domain: string): void {
  const modelPath = findModelFile(domain);
  
  if (!modelPath) {
    console.log(`❌ Model file not found for domain: ${domain}`);
    return;
  }
  
  const interfaceName = `${domain.charAt(0).toUpperCase() + domain.slice(1)}Model`;
  const fields = extractFields(modelPath, interfaceName);
  
  console.log("━".repeat(80));
  console.log(`📋 Current Fields in ${interfaceName}`);
  console.log("━".repeat(80));
  console.log();
  
  if (fields.length === 0) {
    console.log("  No fields found");
    return;
  }
  
  // Required fields
  const requiredFields = fields.filter((f) => !f.isOptional);
  if (requiredFields.length > 0) {
    console.log("✅ Required Fields:");
    requiredFields.forEach((field) => {
      console.log(`  - ${field.name}: ${field.type} (line ${field.line})`);
    });
    console.log();
  }
  
  // Optional fields
  const optionalFields = fields.filter((f) => f.isOptional);
  if (optionalFields.length > 0) {
    console.log("🔹 Optional Fields:");
    optionalFields.forEach((field) => {
      console.log(`  - ${field.name}?: ${field.type} (line ${field.line})`);
    });
    console.log();
  }
  
  console.log(`Total: ${fields.length} fields (${requiredFields.length} required, ${optionalFields.length} optional)`);
  console.log();
}

/**
 * 변경 가이드 출력
 */
function printChangeGuide(): void {
  console.log("━".repeat(80));
  console.log("📖 How to Track Changes");
  console.log("━".repeat(80));
  console.log();
  console.log("이 스크립트는 현재 Model의 필드 구조를 보여줍니다.");
  console.log("변경 사항을 추적하려면:");
  console.log();
  console.log("1. Git을 사용하는 경우:");
  console.log("   git diff portal/src/app/.../model.ts");
  console.log();
  console.log("2. 수동으로 확인:");
  console.log("   - 이전 버전과 현재 필드 목록 비교");
  console.log("   - 추가된 필드 → field-addition.md 체크리스트 참조");
  console.log("   - 삭제된 필드 → field-removal.md 체크리스트 참조");
  console.log("   - 타입 변경 → type-change.md 체크리스트 참조");
  console.log();
  console.log("3. 영향 파일 확인:");
  console.log("   node scripts/find-impact-files.ts <domain>");
  console.log();
}

/**
 * 메인 함수
 */
function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("❌ Error: Domain name is required");
    console.log();
    console.log("Usage: node scripts/analyze-model-changes.ts <domain>");
    console.log();
    console.log("Examples:");
    console.log("  node scripts/analyze-model-changes.ts brochure");
    console.log("  node scripts/analyze-model-changes.ts ir");
    process.exit(1);
  }
  
  const domain = args[0];
  
  // 현재 필드 출력
  printCurrentFields(domain);
  
  // Git diff 확인
  const modelPath = findModelFile(domain);
  if (modelPath) {
    const gitDiff = getGitChanges(modelPath);
    if (gitDiff) {
      console.log("━".repeat(80));
      console.log("📝 Git Diff (Uncommitted Changes)");
      console.log("━".repeat(80));
      console.log();
      console.log(gitDiff);
      console.log();
    } else {
      console.log("━".repeat(80));
      console.log("ℹ️  No uncommitted changes detected");
      console.log("━".repeat(80));
      console.log();
    }
  }
  
  // 가이드 출력
  printChangeGuide();
  
  console.log("━".repeat(80));
  console.log("📚 Next Steps");
  console.log("━".repeat(80));
  console.log();
  console.log("1. 필드를 추가/삭제/수정하려면:");
  console.log("   - Model interface를 직접 편집");
  console.log();
  console.log("2. 영향받는 파일 확인:");
  console.log(`   node scripts/find-impact-files.ts ${domain}`);
  console.log();
  console.log("3. 체크리스트 참조:");
  console.log("   - 필드 추가: assets/checklists/field-addition.md");
  console.log("   - 필드 삭제: assets/checklists/field-removal.md");
  console.log("   - 타입 변경: assets/checklists/type-change.md");
  console.log();
  console.log("4. 타입 일관성 검증:");
  console.log(`   node scripts/validate-type-consistency.ts ${domain}`);
  console.log();
}

// 실행
main();
