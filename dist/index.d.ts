interface DiscoveredKey {
    key: string;
    filePath: string;
    line: number;
}

interface EnvVariable {
    key: string;
    value: string;
    isPotentialSecret: boolean;
}

interface AuditOptions {
    rootDir?: string;
    envPath?: string;
}
interface AuditReport {
    missingKeys: DiscoveredKey[];
    unusedKeys: string[];
    leakedSecrets: EnvVariable[];
    hasErrors: boolean;
}
declare function auditEnv(options?: AuditOptions): AuditReport;

export { type AuditOptions, type AuditReport, type DiscoveredKey, type EnvVariable, auditEnv };
