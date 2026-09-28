import fs from 'node:fs';
import dotenv from 'dotenv';

export interface EnvVariable {
  key: string;
  value: string;
  isPotentialSecret: boolean;
}

// High-risk pattern detector (Stripe, AWS, JWT, generic private keys)
const SECRET_PATTERNS = [
  /sk_live_[0-9a-zA-Z]{24,}/,
  /AKIA[0-9A-Z]{16}/,
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
  /-----BEGIN PRIVATE KEY-----/,
];

export function parseEnvFile(envPath = '.env'): Map<string, EnvVariable> {
  const map = new Map<string, EnvVariable>();
  if (!fs.existsSync(envPath)) return map;

  const content = fs.readFileSync(envPath, 'utf-8');
  const parsed = dotenv.parse(content);

  for (const [key, value] of Object.entries(parsed)) {
    const isSecret = SECRET_PATTERNS.some((pattern) => pattern.test(value));
    map.set(key, { key, value, isPotentialSecret: isSecret });
  }

  return map;
}