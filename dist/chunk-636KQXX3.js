// src/scanner.ts
import fs from "fs";
import { glob } from "glob";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
var traverse = traverseModule.default || traverseModule;
function scanCodebase(rootDir = ".") {
  const files = glob.sync("**/*.{js,jsx,ts,tsx}", {
    cwd: rootDir,
    ignore: ["node_modules/**", "dist/**", ".next/**", "build/**"]
  });
  const discovered = [];
  for (const file of files) {
    try {
      const code = fs.readFileSync(file, "utf-8");
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"]
      });
      traverse(ast, {
        MemberExpression(path) {
          const node = path.node;
          if (node.object.type === "MemberExpression" && node.object.object?.name === "process" && node.object.property?.name === "env" && node.property.type === "Identifier") {
            discovered.push({
              key: node.property.name,
              filePath: file,
              line: node.loc?.start.line || 0
            });
          }
          if (node.object.type === "MemberExpression" && node.object.object?.type === "MetaProperty" && node.object.property?.name === "env" && node.property.type === "Identifier") {
            discovered.push({
              key: node.property.name,
              filePath: file,
              line: node.loc?.start.line || 0
            });
          }
        }
      });
    } catch {
    }
  }
  return discovered;
}

// src/envParser.ts
import fs2 from "fs";
import dotenv from "dotenv";
var SECRET_PATTERNS = [
  /sk_live_[0-9a-zA-Z]{24,}/,
  /AKIA[0-9A-Z]{16}/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
  /-----BEGIN PRIVATE KEY-----/
];
function parseEnvFile(envPath = ".env") {
  const map = /* @__PURE__ */ new Map();
  if (!fs2.existsSync(envPath)) return map;
  const content = fs2.readFileSync(envPath, "utf-8");
  const parsed = dotenv.parse(content);
  for (const [key, value] of Object.entries(parsed)) {
    const isSecret = SECRET_PATTERNS.some((pattern) => pattern.test(value));
    map.set(key, { key, value, isPotentialSecret: isSecret });
  }
  return map;
}

export {
  scanCodebase,
  parseEnvFile
};
//# sourceMappingURL=chunk-636KQXX3.js.map