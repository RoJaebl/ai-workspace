#!/usr/bin/env node

/**
 * 영향도 다이어그램 생성 스크립트
 * 
 * @description Model 변경의 전파 경로를 Mermaid 다이어그램으로 시각화합니다.
 * 
 * @usage
 * node scripts/generate-impact-diagram.ts <domain> [fieldName]
 * 
 * @example
 * node scripts/generate-impact-diagram.ts brochure publishedAt
 * node scripts/generate-impact-diagram.ts ir
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../../../..");
const PORTAL_ROOT = path.join(PROJECT_ROOT, "portal/src/app");

interface DiagramData {
  domain: string;
  fieldName?: string;
  files: {
    model: string | null;
    presenter: string | null;
    mapper: string | null;
    services: string[];
    hooks: string[];
    ui: string[];
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
 * 여러 파일 찾기
 */
function findFiles(pattern: string): string[] {
  try {
    const command = `find ${PORTAL_ROOT} -path "${pattern}" 2>/dev/null`;
    const result = execSync(command, { encoding: "utf-8" });
    return result
      .trim()
      .split("\n")
      .filter((line) => line.length > 0);
  } catch (error) {
    return [];
  }
}

/**
 * 다이어그램 데이터 수집
 */
function collectData(domain: string, fieldName?: string): DiagramData {
  const modelPattern = `*/(planning)/**/${domain}/_types/${domain}.model.ts`;
  const presenterPattern = `*/(planning)/**/${domain}/_types/${domain}.presenter.ts`;
  const mapperPattern = `*/(planning)/**/${domain}/_services/${domain}.mapper.ts`;
  const servicePlanningPattern = `*/(planning)/**/${domain}/_services/${domain}.service.ts`;
  const serviceCurrentPattern = `*/(current)/**/${domain}/_services/${domain}.service.ts`;
  const hooksPattern = `*/(planning)/**/${domain}/_hooks/**/*.ts`;
  const uiPattern = `*/(planning)/**/${domain}/_ui/**/*.{section,panel,module}.tsx`;

  return {
    domain,
    fieldName,
    files: {
      model: findFile(modelPattern),
      presenter: findFile(presenterPattern),
      mapper: findFile(mapperPattern),
      services: [
        ...findFiles(servicePlanningPattern),
        ...findFiles(serviceCurrentPattern),
      ],
      hooks: findFiles(hooksPattern).slice(0, 3), // 최대 3개만
      ui: findFiles(uiPattern).slice(0, 2), // 최대 2개만
    },
  };
}

/**
 * 파일명 추출
 */
function getFileName(filePath: string): string {
  return path.basename(filePath);
}

/**
 * Mermaid 다이어그램 생성
 */
function generateMermaidDiagram(data: DiagramData): string {
  const { domain, fieldName, files } = data;
  
  const domainCapitalized = domain.charAt(0).toUpperCase() + domain.slice(1);
  
  let diagram = "```mermaid\ngraph TD\n";
  
  // 노드 정의
  if (files.model) {
    const label = fieldName 
      ? `${domainCapitalized}Model<br/>+ ${fieldName}`
      : `${domainCapitalized}Model`;
    diagram += `    Model["${label}"]\n`;
  }
  
  if (files.presenter) {
    diagram += `    Presenter["${domainCapitalized}Presenter"]\n`;
  }
  
  if (files.mapper) {
    diagram += `    Mapper["${domainCapitalized}Mapper"]\n`;
  }
  
  if (files.services.length > 0) {
    files.services.forEach((_, index) => {
      diagram += `    Service${index}["${getFileName(files.services[index])}"]\n`;
    });
  }
  
  if (files.hooks.length > 0) {
    files.hooks.forEach((_, index) => {
      diagram += `    Hook${index}["${getFileName(files.hooks[index])}"]\n`;
    });
  }
  
  if (files.ui.length > 0) {
    files.ui.forEach((_, index) => {
      diagram += `    UI${index}["${getFileName(files.ui[index])}"]\n`;
    });
  }
  
  diagram += "\n";
  
  // 관계 정의
  if (files.model && files.presenter) {
    diagram += `    Model -->|"implements"| Presenter\n`;
  }
  
  if (files.model && files.mapper) {
    diagram += `    Model -->|"converts"| Mapper\n`;
  }
  
  if (files.presenter && files.mapper) {
    diagram += `    Presenter -->|"uses"| Mapper\n`;
  }
  
  if (files.mapper && files.services.length > 0) {
    files.services.forEach((_, index) => {
      diagram += `    Mapper -->|"used in"| Service${index}\n`;
    });
  }
  
  if (files.services.length > 0 && files.hooks.length > 0) {
    files.services.forEach((_, sIndex) => {
      files.hooks.forEach((_, hIndex) => {
        diagram += `    Service${sIndex} -->|"called by"| Hook${hIndex}\n`;
      });
    });
  }
  
  if (files.hooks.length > 0 && files.ui.length > 0) {
    files.hooks.forEach((_, hIndex) => {
      files.ui.forEach((_, uIndex) => {
        diagram += `    Hook${hIndex} -->|"provides to"| UI${uIndex}\n`;
      });
    });
  }
  
  diagram += "```\n";
  
  return diagram;
}

/**
 * 플로우 다이어그램 생성 (Bottom-up)
 */
function generateFlowDiagram(data: DiagramData, direction: "bottomup" | "topdown"): string {
  const { domain } = data;
  const domainCapitalized = domain.charAt(0).toUpperCase() + domain.slice(1);
  
  let diagram = "```mermaid\ngraph TD\n";
  
  if (direction === "bottomup") {
    // 필드 추가 플로우 (Bottom-up)
    diagram += `    Start([Start: Add Field])\n`;
    diagram += `    Step1["1. Update ${domainCapitalized}Model"]\n`;
    diagram += `    Step2["2. Update ${domainCapitalized}Presenter"]\n`;
    diagram += `    Step3["3. Update ${domainCapitalized}Mapper"]\n`;
    diagram += `    Step4["4. Update Service (if needed)"]\n`;
    diagram += `    Step5["5. Update Hooks (if needed)"]\n`;
    diagram += `    Step6["6. Update UI (if needed)"]\n`;
    diagram += `    End([Done])\n\n`;
    
    diagram += `    Start --> Step1\n`;
    diagram += `    Step1 --> Step2\n`;
    diagram += `    Step2 --> Step3\n`;
    diagram += `    Step3 --> Step4\n`;
    diagram += `    Step4 --> Step5\n`;
    diagram += `    Step5 --> Step6\n`;
    diagram += `    Step6 --> End\n`;
  } else {
    // 필드 삭제 플로우 (Top-down)
    diagram += `    Start([Start: Remove Field])\n`;
    diagram += `    Step1["1. Remove from UI"]\n`;
    diagram += `    Step2["2. Remove from Hooks"]\n`;
    diagram += `    Step3["3. Remove from Service"]\n`;
    diagram += `    Step4["4. Remove from ${domainCapitalized}Mapper"]\n`;
    diagram += `    Step5["5. Remove from ${domainCapitalized}Presenter"]\n`;
    diagram += `    Step6["6. Remove from ${domainCapitalized}Model"]\n`;
    diagram += `    End([Done])\n\n`;
    
    diagram += `    Start --> Step1\n`;
    diagram += `    Step1 --> Step2\n`;
    diagram += `    Step2 --> Step3\n`;
    diagram += `    Step3 --> Step4\n`;
    diagram += `    Step4 --> Step5\n`;
    diagram += `    Step5 --> Step6\n`;
    diagram += `    Step6 --> End\n`;
  }
  
  diagram += "```\n";
  
  return diagram;
}

/**
 * 다이어그램 출력
 */
function printDiagram(data: DiagramData): void {
  console.log("━".repeat(80));
  console.log(`📊 Impact Diagram for: ${data.domain}`);
  if (data.fieldName) {
    console.log(`🔹 Field: ${data.fieldName}`);
  }
  console.log("━".repeat(80));
  console.log();
  
  // 파일 확인
  console.log("📁 Files Found:");
  console.log(`  Model:     ${data.files.model ? "✅" : "❌"}`);
  console.log(`  Presenter: ${data.files.presenter ? "✅" : "❌"}`);
  console.log(`  Mapper:    ${data.files.mapper ? "✅" : "❌"}`);
  console.log(`  Services:  ${data.files.services.length} file(s)`);
  console.log(`  Hooks:     ${data.files.hooks.length} file(s)`);
  console.log(`  UI:        ${data.files.ui.length} file(s)`);
  console.log();
  
  if (!data.files.model || !data.files.presenter || !data.files.mapper) {
    console.log("⚠️  Cannot generate diagram: Missing critical files");
    return;
  }
  
  // 의존성 다이어그램
  console.log("━".repeat(80));
  console.log("1️⃣  Dependency Diagram");
  console.log("━".repeat(80));
  console.log();
  console.log(generateMermaidDiagram(data));
  console.log();
  
  // Bottom-up 플로우 (필드 추가)
  console.log("━".repeat(80));
  console.log("2️⃣  Field Addition Flow (Bottom-up)");
  console.log("━".repeat(80));
  console.log();
  console.log(generateFlowDiagram(data, "bottomup"));
  console.log();
  
  // Top-down 플로우 (필드 삭제)
  console.log("━".repeat(80));
  console.log("3️⃣  Field Removal Flow (Top-down)");
  console.log("━".repeat(80));
  console.log();
  console.log(generateFlowDiagram(data, "topdown"));
  console.log();
}

/**
 * 다이어그램 파일로 저장
 */
function saveDiagram(data: DiagramData, outputPath: string): void {
  try {
    let content = `# Impact Diagram: ${data.domain}\n\n`;
    
    if (data.fieldName) {
      content += `Field: \`${data.fieldName}\`\n\n`;
    }
    
    content += `Generated: ${new Date().toISOString()}\n\n`;
    
    content += "## Dependency Diagram\n\n";
    content += generateMermaidDiagram(data);
    content += "\n";
    
    content += "## Field Addition Flow (Bottom-up)\n\n";
    content += generateFlowDiagram(data, "bottomup");
    content += "\n";
    
    content += "## Field Removal Flow (Top-down)\n\n";
    content += generateFlowDiagram(data, "topdown");
    
    fs.writeFileSync(outputPath, content);
    console.log(`💾 Diagram saved to: ${outputPath}`);
    console.log();
  } catch (error) {
    console.error(`❌ Failed to save diagram: ${error}`);
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
    console.log("Usage: node scripts/generate-impact-diagram.ts <domain> [fieldName]");
    console.log();
    console.log("Examples:");
    console.log("  node scripts/generate-impact-diagram.ts brochure");
    console.log("  node scripts/generate-impact-diagram.ts brochure publishedAt");
    console.log("  node scripts/generate-impact-diagram.ts ir viewCount");
    process.exit(1);
  }
  
  const domain = args[0];
  const fieldName = args[1];
  
  const data = collectData(domain, fieldName);
  
  // 콘솔 출력
  printDiagram(data);
  
  // 파일 저장
  const outputPath = path.join(
    __dirname,
    `../output/${domain}-diagram${fieldName ? `-${fieldName}` : ""}.md`
  );
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  saveDiagram(data, outputPath);
  
  console.log("━".repeat(80));
  console.log("✅ Diagram generation completed");
  console.log("━".repeat(80));
  console.log();
  console.log("📝 Next Steps:");
  console.log();
  console.log("1. Review the diagram to understand the impact");
  console.log("2. Follow the change order (bottom-up for addition, top-down for removal)");
  console.log("3. Refer to checklists: assets/checklists/");
  console.log("4. Validate after changes: node scripts/validate-type-consistency.ts");
  console.log();
}

// 실행
main();
