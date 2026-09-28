#!/usr/bin/env node
import { Command } from 'commander';
import pc from 'picocolors';
import { scanCodebase } from './scanner.js';
import { parseEnvFile } from './envParser.js';

const program = new Command();

program
  .name('env-guardrail')
  .description('Audit environment variables against codebase usage')
  .version('0.1.0');

program
  .command('check')
  .option('-e, --env <path>', 'Path to target .env file', '.env')
  .action((options) => {
    console.log(pc.cyan('\n🔍 Scanning codebase for environment variables...\n'));

    const codeUsage = scanCodebase('.');
    const envVariables = parseEnvFile(options.env);

    const usedKeys = new Set(codeUsage.map((u) => u.key));
    let errorCount = 0;
    let warningCount = 0;

    // 1. Check for Missing Variables
    for (const usage of codeUsage) {
      if (!envVariables.has(usage.key)) {
        console.log(
          `${pc.red('✖ MISSING KEY')}  ${pc.bold(usage.key)}\n` +
          `               Found in: ${pc.dim(`${usage.filePath}:${usage.line}`)}\n` +
          `               Action: Define this variable in ${options.env}\n`
        );
        errorCount++;
      }
    }

    // 2. Check for Unused Variables
    for (const [key] of envVariables.entries()) {
      if (!usedKeys.has(key)) {
        console.log(
          `${pc.yellow('⚠ UNUSED KEY')}   ${pc.bold(key)}\n` +
          `               Defined in: ${pc.dim(options.env)}\n` +
          `               Action: No references found in codebase.\n`
        );
        warningCount++;
      }
    }

    // 3. Check for Secret Leaks
    for (const [key, variable] of envVariables.entries()) {
      if (variable.isPotentialSecret) {
        console.log(
          `${pc.red('✖ SECRET LEAK')}  ${pc.bold(key)}\n` +
          `               Defined in: ${pc.dim(options.env)}\n` +
          `               Action: Value looks like an unmasked production secret key.\n`
        );
        errorCount++;
      }
    }

    // Summary output
    console.log(pc.dim('--------------------------------------------------'));
    if (errorCount === 0 && warningCount === 0) {
      console.log(pc.green('✔ All environment variables are consistent! No leaks detected.\n'));
      process.exit(0);
    } else {
      console.log(
        `Result: ${pc.red(`${errorCount} error(s)`)}, ${pc.yellow(`${warningCount} warning(s)`)}\n`
      );
      if (errorCount > 0) process.exit(1);
    }
  });

program.parse(process.argv);