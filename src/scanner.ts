import fs from 'node:fs';
import {glob}from 'glob';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = (traverseModule as any).default || traverseModule;

export interface DiscoveredKey {
  key: string;
  filePath: string;
  line: number;
}

export function scanCodebase(rootDir = '.'): DiscoveredKey[] {
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', '.next/**', 'build/**'],
  });

  const discovered: DiscoveredKey[] = [];

  for (const file of files) {
    try {
      const code = fs.readFileSync(file, 'utf-8');
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      traverse(ast, {
        MemberExpression(path: any) {
          const node = path.node;
          // Detect process.env.KEY
          if (
            node.object.type === 'MemberExpression' &&
            node.object.object?.name === 'process' &&
            node.object.property?.name === 'env' &&
            node.property.type === 'Identifier'
          ) {
            discovered.push({
              key: node.property.name,
              filePath: file,
              line: node.loc?.start.line || 0,
            });
          }
          // Detect import.meta.env.KEY
          if (
            node.object.type === 'MemberExpression' &&
            node.object.object?.type === 'MetaProperty' &&
            node.object.property?.name === 'env' &&
            node.property.type === 'Identifier'
          ) {
            discovered.push({
              key: node.property.name,
              filePath: file,
              line: node.loc?.start.line || 0,
            });
          }
        },
      });
    } catch {
      // Ignore unparseable or non-JS files
    }
  }

  return discovered;
}