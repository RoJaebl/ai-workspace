#!/usr/bin/env node

/**
 * Model 변경 영향 파일 탐색 스크립트
 * 
 * @description 도메인명을 입력받아 관련된 모든 파일(Model, Presenter, Mapper, Service, Hooks, UI)을 탐색합니다.
 * 
 * @usage
 * node scripts/find-impact-files.ts <domain>
 * 
 * @example
 * node scripts/find-impact-files.ts brochure
 * node scripts/find-impact-files.ts ir
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// 프로젝트 루트 경로
const PROJECT_ROOT = path.resolve(__dirname, "../../../..");
const PORTAL_ROOT = path.join(PROJECT_ROOT, "portal/src/app");

interface ImpactFiles {
  domain: string;
  files: {
    dto: string | null;
    adapter: string | null;
    model: string | null;
    presenters: string[];
    mapper: string | null;
    services: string[];
    hooks: string[];
    ui: string[];
  };
  summary: {
    totalFiles: number;
    missingCritical: string[];
    isBackendIntegrated: boolean;
  };
}

/**
 * Glob 패턴으로 파일 찾기
 */
function findFiles(pattern: string): string[] {
  try {
    const command = `find ${PORTAL_ROOT} -path "${pattern}" 2>/dev/null`;
    const result = execSync(command, { encoding: "utf-8" });
    return result
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)
      .map((file) => path.relative(PROJECT_ROOT, file));
  } catch (error) {
    return [];
  }
}

/**
 * 단일 파일 찾기 (첫 번째 매치만 반환)
 */
function findFile(pattern: string): string | null {
  const files = findFiles(pattern);
  return files.length > 0 ? files[0] : null;
}

/**
 * 도메인의 영향 파일 탐색
 */
function findImpactFiles(domain: string): ImpactFiles {
  console.log(`🔍 Searching impact files for domain: ${domain}\n`);

  // DTO 파일 (api/_backend)
  const dtoPattern = `*/api/_backend/**/${domain}/types/${domain}.dto.ts`;
  const dto = findFile(dtoPattern);

  // Adapter 파일 (api/_backend)
  const adapterPattern = `*/api/_backend/**/${domain}/types/${domain}.adapter.ts`;
  const adapter = findFile(adapterPattern);

  // Model 파일 (planning 폴더)
  const modelPattern = `*/(planning)/**/${domain}/_types/${domain}.model.ts`;
  const model = findFile(modelPattern);

  // Presenter 파일들 (메인 + 하위 엔티티)
  const presenterPattern = `*/(planning)/**/${domain}/_types/${domain}*.presenter.ts`;
  const presenters = findFiles(presenterPattern);

  // Mapper 파일
  const mapperPattern = `*/(planning)/**/${domain}/_services/${domain}.mapper.ts`;
  const mapper = findFile(mapperPattern);

  // Service 파일들 (planning + current)
  const servicePlanningPattern = `*/(planning)/**/${domain}/_services/${domain}.service.ts`;
  const serviceCurrentPattern = `*/(current)/**/${domain}/_services/${domain}.service.ts`;
  const services = [
    ...findFiles(servicePlanningPattern),
    ...findFiles(serviceCurrentPattern),
  ];

  // Hooks 파일들
  const hooksPattern = `*/(planning)/**/${domain}/_hooks/**/*.ts`;
  const hooks = findFiles(hooksPattern);

  // UI 파일들 (section, panel, module)
  const uiSectionPattern = `*/(planning)/**/${domain}/_ui/**/*.section.tsx`;
  const uiPanelPattern = `*/(planning)/**/${domain}/_ui/**/*.panel.tsx`;
  const uiModulePattern = `*/(planning)/**/${domain}/_ui/**/*.module.tsx`;
  const ui = [
    ...findFiles(uiSectionPattern),
    ...findFiles(uiPanelPattern),
    ...findFiles(uiModulePattern),
  ];

  // 누락된 중요 파일 확인
  const missingCritical: string[] = [];
  if (!model) missingCritical.push("Model");
  if (presenters.length === 0) missingCritical.push("Presenter");
  if (!mapper) missingCritical.push("Mapper");
  if (services.length === 0) missingCritical.push("Service");

  // 백엔드 연동 여부 확인
  const isBackendIntegrated = !!(dto && adapter);

  const totalFiles =
    (dto ? 1 : 0) +
    (adapter ? 1 : 0) +
    (model ? 1 : 0) +
    presenters.length +
    (mapper ? 1 : 0) +
    services.length +
    hooks.length +
    ui.length;

  return {
    domain,
    files: {
      dto,
      adapter,
      model,
      presenters,
      mapper,
      services,
      hooks,
      ui,
    },
    summary: {
      totalFiles,
      missingCritical,
      isBackendIntegrated,
    },
  };
}

/**
 * 결과 출력 (콘솔)
 */
function printResults(result: ImpactFiles): void {
  console.log("━".repeat(80));
  console.log(`📊 Impact Analysis for: ${result.domain}`);
  console.log("━".repeat(80));
  console.log();

  // 백엔드 연동 여부 표시
  if (result.summary.isBackendIntegrated) {
    console.log("✅ Backend Integration: Detected (DTO & Adapter found)");
  } else {
    console.log("ℹ️  Backend Integration: Not detected (using Mock Service)");
  }
  console.log();

  // DTO
  console.log("📁 DTO (Backend API Types)");
  if (result.files.dto) {
    console.log(`  ✅ ${result.files.dto}`);
  } else {
    console.log(`  ⚠️  NOT FOUND (백엔드 미연동 또는 Mock)`);
  }
  console.log();

  // Adapter
  console.log("📁 Adapter (DTO ↔ Model Converter)");
  if (result.files.adapter) {
    console.log(`  ✅ ${result.files.adapter}`);
  } else {
    console.log(`  ⚠️  NOT FOUND (백엔드 미연동 또는 Mock)`);
  }
  console.log();

  // Model
  console.log("📁 Model");
  if (result.files.model) {
    console.log(`  ✅ ${result.files.model}`);
  } else {
    console.log(`  ❌ NOT FOUND`);
  }
  console.log();

  // Presenter
  console.log("📁 Presenter");
  if (result.files.presenters.length > 0) {
    result.files.presenters.forEach((file) => {
      console.log(`  ✅ ${file}`);
    });
  } else {
    console.log(`  ❌ NOT FOUND`);
  }
  console.log();

  // Mapper
  console.log("📁 Mapper");
  if (result.files.mapper) {
    console.log(`  ✅ ${result.files.mapper}`);
  } else {
    console.log(`  ❌ NOT FOUND`);
  }
  console.log();

  // Services
  console.log("📁 Services");
  if (result.files.services.length > 0) {
    result.files.services.forEach((file) => {
      console.log(`  ✅ ${file}`);
    });
  } else {
    console.log(`  ❌ NOT FOUND`);
  }
  console.log();

  // Hooks
  console.log("📁 Hooks");
  if (result.files.hooks.length > 0) {
    console.log(`  ℹ️  ${result.files.hooks.length} file(s) found:`);
    result.files.hooks.slice(0, 5).forEach((file) => {
      console.log(`     ${file}`);
    });
    if (result.files.hooks.length > 5) {
      console.log(`     ... and ${result.files.hooks.length - 5} more`);
    }
  } else {
    console.log(`  ⚠️  No hooks found`);
  }
  console.log();

  // UI
  console.log("📁 UI Components");
  if (result.files.ui.length > 0) {
    console.log(`  ℹ️  ${result.files.ui.length} file(s) found:`);
    result.files.ui.slice(0, 5).forEach((file) => {
      console.log(`     ${file}`);
    });
    if (result.files.ui.length > 5) {
      console.log(`     ... and ${result.files.ui.length - 5} more`);
    }
  } else {
    console.log(`  ⚠️  No UI components found`);
  }
  console.log();

  // Summary
  console.log("━".repeat(80));
  console.log(`📈 Summary`);
  console.log("━".repeat(80));
  console.log(`Total files found: ${result.summary.totalFiles}`);
  if (result.summary.missingCritical.length > 0) {
    console.log(
      `⚠️  Missing critical files: ${result.summary.missingCritical.join(", ")}`
    );
  } else {
    console.log(`✅ All critical files found`);
  }
  console.log();

  // Change Order Guide
  console.log("━".repeat(80));
  console.log(`📋 Change Order Guide`);
  console.log("━".repeat(80));
  console.log();
  if (result.summary.isBackendIntegrated) {
    console.log("For ADDING a field (with Backend - bottom-up):");
    console.log("  0. DTO        ← Check backend spec");
    console.log("  1. Adapter    ← Map field names");
    console.log("  2. Model      ← Define type contract");
    console.log("  3. Presenter");
    console.log("  4. Mapper");
    console.log("  5. Service");
    console.log("  6. Hooks");
    console.log("  7. UI");
    console.log();
    console.log("For REMOVING a field (with Backend - top-down):");
    console.log("  1. UI         ← Start here");
    console.log("  2. Hooks");
    console.log("  3. Service");
    console.log("  4. Mapper");
    console.log("  5. Presenter");
    console.log("  6. Model");
    console.log("  7. Adapter    ← Remove mapping");
    console.log("  8. DTO        ← If backend also removed");
    console.log();
    console.log("For BACKEND FIELD NAME change:");
    console.log("  1. DTO        ← Update to match backend");
    console.log("  2. Adapter    ← Update mapping ONLY");
    console.log("  ✅ Done!      ← No other changes needed!");
    console.log();
  } else {
    console.log("For ADDING a field (frontend only - bottom-up):");
    console.log("  1. Model      ← Start here");
    console.log("  2. Presenter");
    console.log("  3. Mapper");
    console.log("  4. Service");
    console.log("  5. Hooks");
    console.log("  6. UI");
    console.log();
    console.log("For REMOVING a field (frontend only - top-down):");
    console.log("  1. UI         ← Start here");
    console.log("  2. Hooks");
    console.log("  3. Service");
    console.log("  4. Mapper");
    console.log("  5. Presenter");
    console.log("  6. Model");
    console.log();
  }
}

/**
 * JSON 파일로 저장
 */
function saveToJson(result: ImpactFiles, outputPath: string): void {
  try {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`💾 Results saved to: ${outputPath}`);
    console.log();
  } catch (error) {
    console.error(`❌ Failed to save results: ${error}`);
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
    console.log("Usage: node scripts/find-impact-files.ts <domain>");
    console.log();
    console.log("Examples:");
    console.log("  node scripts/find-impact-files.ts brochure");
    console.log("  node scripts/find-impact-files.ts ir");
    console.log("  node scripts/find-impact-files.ts news");
    process.exit(1);
  }

  const domain = args[0];
  const result = findImpactFiles(domain);

  // 콘솔 출력
  printResults(result);

  // JSON 저장 (선택적)
  const outputPath = path.join(__dirname, `../output/${domain}-impact.json`);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  saveToJson(result, outputPath);

  // 종료 코드 설정
  if (result.summary.missingCritical.length > 0) {
    console.log("⚠️  Warning: Some critical files are missing");
    process.exit(1);
  } else {
    console.log("✅ All critical files found successfully");
    process.exit(0);
  }
}

// 실행
main();
