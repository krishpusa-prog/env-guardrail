# env-guardrail 🛡️

> Audit `.env` files against your codebase to catch missing variables, dead keys, and leaked production secrets before committing.

## ⚡ Features

* **AST Codebase Scanning**: Static analysis parsing powered by Babel AST to accurately detect `process.env.VAR` and `import.meta.env.VAR` lookups across JS, JSX, TS, and TSX files.

* **Missing Variable Catching**: Flags environment variables referenced in code but missing from `.env` or `.env.example`.

* **Dead/Unused Key Cleanup**: Identifies orphaned variables declared in `.env` files that have zero references in your codebase.

* **Pre-Commit Secret Leak Prevention**: High-risk pattern scanner flags live production keys (Stripe, AWS, JWTs, RSA keys) inadvertently committed in local configuration files.

* **Zero-Config CLI & Programmatic API**: Use as an automated CLI check in pre-commit hooks/CI, or integrate directly into custom build tools with full TypeScript types.

## 📦 Installation

```
# Install globally for CLI usage
npm install -g env-guardrail

# Or install locally in your project
npm install --save-dev env-guardrail

```

## 🚀 Quick Start

Run a check in any repository root directory containing your source code and `.env` files:

```
npx env-guardrail check

```

### Example Terminal Output

```
🔍 Scanning codebase for environment variables...

✖ MISSING KEY  DATABASE_URL
               Found in: src/db/client.ts:12
               Action: Define this variable in .env

⚠ UNUSED KEY   OLD_REDIS_PORT
               Defined in: .env
               Action: No references found in codebase.

✖ SECRET LEAK  STRIPE_SECRET_KEY
               Defined in: .env
               Action: Value looks like an unmasked production secret key.

--------------------------------------------------
Result: 2 error(s), 1 warning(s)

```

## 🛠️ CLI Options

```
env-guardrail check [options]

```

| Option | Shorthand | Default | Description | 
 | ----- | ----- | ----- | ----- | 
| `--env <path>` | `-e` | `.env` | Path to target environment file to audit | 
| `--version` | `-v` | — | Display CLI version | 
| `--help` | `-h` | — | Display help menu | 

## 💻 Programmatic TypeScript API

You can import `env-guardrail` into your Node.js scripts, Vite plugins, or custom test runners:

```
import { auditEnv } from 'env-guardrail';

const report = auditEnv({
  rootDir: './src',
  envPath: '.env.local',
});

if (report.hasErrors) {
  console.error('Missing variables:', report.missingKeys);
  console.error('Potential secret leaks:', report.leakedSecrets);
  process.exit(1);
}

```

## 🔄 CI/CD & Git Hook Integration

### 1. Husky Pre-Commit Hook

Prevent committing broken configuration or leaked secrets locally:

```
npx husky add .husky/pre-commit "npx env-guardrail check"

```

### 2. GitHub Actions

Fail pull requests early if required environment variables are missing from `.env.example`:

```
name: Audit Environment Configuration

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  env-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx env-guardrail check --env .env.example

```

## 📄 License

MIT © Kaustubh Kashyap