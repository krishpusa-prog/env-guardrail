 // src/index.ts

// 1. Mark type-only imports explicitly
import type { DiscoveredKey } from './scanner.js';
import type { EnvVariable } from './envParser.js';

// 2. Value imports remain standard imports
import { scanCodebase } from './scanner.js';
import { parseEnvFile } from './envParser.js';

export interface AuditOptions {
  rootDir?: string;
  envPath?: string;
}

export interface AuditReport {
  missingKeys: DiscoveredKey[];
  unusedKeys: string[];
  leakedSecrets: EnvVariable[];
  hasErrors: boolean;
}

export function auditEnv(options: AuditOptions = {}): AuditReport {
  const rootDir = options.rootDir || '.';
  const envPath = options.envPath || '.env';

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
    hasErrors: missingKeys.length > 0 || leakedSecrets.length > 0,
  };
}

export type { DiscoveredKey, EnvVariable };