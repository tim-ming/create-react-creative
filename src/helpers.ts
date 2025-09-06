import path from 'node:path';
import fs from 'fs-extra';
import process from 'node:process';
import { execa } from 'execa';
import yargsParser from 'yargs-parser';
import OPTIONS from './constants.js';
import type { PackageManager } from './types.js';
import { parse as babelParse } from '@babel/parser';
import traverseModule, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

const traverse = traverseModule.default ?? traverseModule;

type ElementType<T> = T extends (infer U)[] ? U : T;

export function flattenObjectValues<T extends Record<string, unknown>>(obj: T): ElementType<T[keyof T]>[] {
  return Object.values(obj).flatMap((value) => (Array.isArray(value) ? value : [value]));
}

export function extractExportName(content: string): string {
  let name = '';

  const ast = babelParse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  traverse(ast, {
    ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
      const node = path.node.declaration;
      if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
        name = node.id?.name || '';
      } else if (node.type === 'Identifier') {
        name = node.name;
      }
    },
  });

  return name;
}

export async function getAllRelativeFilePaths(rootPath: string): Promise<string[]> {
  const files = await fs.readdir(rootPath, {
    recursive: true,
    withFileTypes: true,
  });
  return files.map((file) => path.join(file.name));
}

export async function copyDirSafe(srcDir: string, destDir: string) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, ensure it exists and recurse
      await fs.ensureDir(destPath);
      await copyDirSafe(srcPath, destPath);
    } else {
      // It's a file → check if it already exists
      if (await fs.pathExists(destPath)) {
        throw new Error(`Conflict: file already exists at ${destPath}`);
      }
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export function getPackageManager(): Readonly<PackageManager> {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const acceptedPackageManagers = Object.keys(OPTIONS.PACKAGE_MANAGERS);
  const pm = Object.keys(OPTIONS.PACKAGE_MANAGERS).find((key) => {
    if (userAgent.startsWith(key)) {
      return key;
    }
  });

  if (!pm) {
    throw new Error(
      'Package Manager must be one of: ' + acceptedPackageManagers.join(', ') + '. You have: ' + userAgent
    );
  }
  return OPTIONS.PACKAGE_MANAGERS[pm];
}

export async function isCommandAvailable(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function parseFlags(argv: string[]): {
  name: string;
  noInstall: boolean;
} {
  const args = yargsParser(argv, {
    string: ['name'],
    boolean: ['no-install'],
    configuration: { 'camel-case-expansion': true },
  }) as { name?: string; _: string[]; noInstall?: boolean };

  return {
    // Prefer explicit --name, fallback to first positional arg
    name: args.name ?? args._[0] ?? '',
    noInstall: args.noInstall ?? false,
  };
}
