#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_commander = require("commander");
var import_picocolors = __toESM(require("picocolors"), 1);

// src/scanner.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_glob = require("glob");
var import_parser = require("@babel/parser");
var import_traverse = __toESM(require("@babel/traverse"), 1);
var traverse = import_traverse.default.default || import_traverse.default;
function scanCodebase(rootDir = ".") {
  const files = import_glob.glob.sync("**/*.{js,jsx,ts,tsx}", {
    cwd: rootDir,
    ignore: ["node_modules/**", "dist/**", ".next/**", "build/**"]
  });
  const discovered = [];
  for (const file of files) {
    try {
      const code = import_node_fs.default.readFileSync(file, "utf-8");
      const ast = (0, import_parser.parse)(code, {
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
var import_node_fs2 = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var SECRET_PATTERNS = [
  /sk_live_[0-9a-zA-Z]{24,}/,
  /AKIA[0-9A-Z]{16}/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
  /-----BEGIN PRIVATE KEY-----/
];
function parseEnvFile(envPath = ".env") {
  const map = /* @__PURE__ */ new Map();
  if (!import_node_fs2.default.existsSync(envPath)) return map;
  const content = import_node_fs2.default.readFileSync(envPath, "utf-8");
  const parsed = import_dotenv.default.parse(content);
  for (const [key, value] of Object.entries(parsed)) {
    const isSecret = SECRET_PATTERNS.some((pattern) => pattern.test(value));
    map.set(key, { key, value, isPotentialSecret: isSecret });
  }
  return map;
}

// src/cli.ts
var program = new import_commander.Command();
program.name("env-guardrail").description("Audit environment variables against codebase usage").version("0.1.0");
program.command("check").option("-e, --env <path>", "Path to target .env file", ".env").action((options) => {
  console.log(import_picocolors.default.cyan("\n\u{1F50D} Scanning codebase for environment variables...\n"));
  const codeUsage = scanCodebase(".");
  const envVariables = parseEnvFile(options.env);
  const usedKeys = new Set(codeUsage.map((u) => u.key));
  let errorCount = 0;
  let warningCount = 0;
  for (const usage of codeUsage) {
    if (!envVariables.has(usage.key)) {
      console.log(
        `${import_picocolors.default.red("\u2716 MISSING KEY")}  ${import_picocolors.default.bold(usage.key)}
               Found in: ${import_picocolors.default.dim(`${usage.filePath}:${usage.line}`)}
               Action: Define this variable in ${options.env}
`
      );
      errorCount++;
    }
  }
  for (const [key] of envVariables.entries()) {
    if (!usedKeys.has(key)) {
      console.log(
        `${import_picocolors.default.yellow("\u26A0 UNUSED KEY")}   ${import_picocolors.default.bold(key)}
               Defined in: ${import_picocolors.default.dim(options.env)}
               Action: No references found in codebase.
`
      );
      warningCount++;
    }
  }
  for (const [key, variable] of envVariables.entries()) {
    if (variable.isPotentialSecret) {
      console.log(
        `${import_picocolors.default.red("\u2716 SECRET LEAK")}  ${import_picocolors.default.bold(key)}
               Defined in: ${import_picocolors.default.dim(options.env)}
               Action: Value looks like an unmasked production secret key.
`
      );
      errorCount++;
    }
  }
  console.log(import_picocolors.default.dim("--------------------------------------------------"));
  if (errorCount === 0 && warningCount === 0) {
    console.log(import_picocolors.default.green("\u2714 All environment variables are consistent! No leaks detected.\n"));
    process.exit(0);
  } else {
    console.log(
      `Result: ${import_picocolors.default.red(`${errorCount} error(s)`)}, ${import_picocolors.default.yellow(`${warningCount} warning(s)`)}
`
    );
    if (errorCount > 0) process.exit(1);
  }
});
program.parse(process.argv);
//# sourceMappingURL=cli.cjs.map