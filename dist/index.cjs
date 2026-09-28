"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  auditEnv: () => auditEnv
});
module.exports = __toCommonJS(index_exports);

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

// src/index.ts
function auditEnv(options = {}) {
  const rootDir = options.rootDir || ".";
  const envPath = options.envPath || ".env";
  const usages = scanCodebase(rootDir);
  const envMap = parseEnvFile(envPath);
  const usedKeyNames = new Set(usages.map((u) => u.key));
  const missingKeys = usages.filter((usage) => !envMap.has(usage.key));
  const unusedKeys = Array.from(envMap.keys()).filter((key) => !usedKeyNames.has(key));
  const leakedSecrets = Array.from(envMap.values()).filter((v) => v.isPotentialSecret);
  return {
    missingKeys,
    unusedKeys,
    leakedSecrets,
    hasErrors: missingKeys.length > 0 || leakedSecrets.length > 0
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  auditEnv
});
//# sourceMappingURL=index.cjs.map