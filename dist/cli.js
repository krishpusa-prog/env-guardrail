#!/usr/bin/env node
import {
  parseEnvFile,
  scanCodebase
} from "./chunk-636KQXX3.js";

// src/cli.ts
import { Command } from "commander";
import pc from "picocolors";
var program = new Command();
program.name("env-guardrail").description("Audit environment variables against codebase usage").version("0.1.0");
program.command("check").option("-e, --env <path>", "Path to target .env file", ".env").action((options) => {
  console.log(pc.cyan("\n\u{1F50D} Scanning codebase for environment variables...\n"));
  const codeUsage = scanCodebase(".");
  const envVariables = parseEnvFile(options.env);
  const usedKeys = new Set(codeUsage.map((u) => u.key));
  let errorCount = 0;
  let warningCount = 0;
  for (const usage of codeUsage) {
    if (!envVariables.has(usage.key)) {
      console.log(
        `${pc.red("\u2716 MISSING KEY")}  ${pc.bold(usage.key)}
               Found in: ${pc.dim(`${usage.filePath}:${usage.line}`)}
               Action: Define this variable in ${options.env}
`
      );
      errorCount++;
    }
  }
  for (const [key] of envVariables.entries()) {
    if (!usedKeys.has(key)) {
      console.log(
        `${pc.yellow("\u26A0 UNUSED KEY")}   ${pc.bold(key)}
               Defined in: ${pc.dim(options.env)}
               Action: No references found in codebase.
`
      );
      warningCount++;
    }
  }
  for (const [key, variable] of envVariables.entries()) {
    if (variable.isPotentialSecret) {
      console.log(
        `${pc.red("\u2716 SECRET LEAK")}  ${pc.bold(key)}
               Defined in: ${pc.dim(options.env)}
               Action: Value looks like an unmasked production secret key.
`
      );
      errorCount++;
    }
  }
  console.log(pc.dim("--------------------------------------------------"));
  if (errorCount === 0 && warningCount === 0) {
    console.log(pc.green("\u2714 All environment variables are consistent! No leaks detected.\n"));
    process.exit(0);
  } else {
    console.log(
      `Result: ${pc.red(`${errorCount} error(s)`)}, ${pc.yellow(`${warningCount} warning(s)`)}
`
    );
    if (errorCount > 0) process.exit(1);
  }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map