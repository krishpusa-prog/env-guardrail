import { defineConfig } from 'tsup';

export default defineConfig({
  // Dual entry points: main programmatic library API and CLI binary
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Auto-generate .d.ts files
  clean: true, // Wipe dist/ before building
  sourcemap: true,
  minify: false, // Keep readable for node execution speed & debugging
  shims: true, // Injects CJS/ESM compatibility shims for __dirname and import.meta
});