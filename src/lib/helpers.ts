import path from 'node:path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { PACKAGE_MANAGERS, RENAME_FILES } from './constants.js';
import type { PackageManager } from './types.js';
import { parse as babelParse } from '@babel/parser';
import traverseModule, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import mri from 'mri';

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

export function getAllRelativeFilePaths(rootPath: string): string[] {
  const files = fs.readdirSync(rootPath, {
    recursive: true,
    withFileTypes: true,
  });
  return files.map((file) => path.join(file.name));
}

export function getPackageManager(userAgent: string | undefined): Readonly<PackageManager> {
  if (!userAgent) return PACKAGE_MANAGERS.npm;
  const acceptedPackageManagers = Object.keys(PACKAGE_MANAGERS);
  const pm = Object.keys(PACKAGE_MANAGERS).find((key) => {
    if (userAgent.startsWith(key)) {
      return key;
    }
  }) as keyof typeof PACKAGE_MANAGERS | undefined;

  if (!pm) {
    throw new Error(
      'Package Manager must be one of: ' + acceptedPackageManagers.join(', ') + '. You have: ' + userAgent
    );
  }
  return PACKAGE_MANAGERS[pm];
}

export async function isCommandAvailable(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function parseArgv(argv: string[]): {
  dir?: string;
  help: boolean;
  template?: string;
} {
  const args = mri(argv, {
    boolean: ['help'],
    string: ['template'],
    alias: {
      h: 'help',
      t: 'template',
    },
    default: {
      dir: undefined,
      help: false,
      template: undefined,
    },
  });

  return {
    dir: args._[0] || undefined,
    help: args.help,
    template: args.template,
  };
}

export function insertComponents(content: string, tag: string, components: string[]): string {
  const regex = new RegExp(`(^[ \\t]*)<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'm');

  return content.replace(regex, (_, indent: string, inner: string) => {
    const existing = inner.trim();

    // children indented one level deeper than the parent tag
    const childIndent = indent + '  ';

    const updated = [existing, ...components]
      .filter(Boolean)
      .map((c) => childIndent + c)
      .join('\n');

    return `${indent}<${tag}>\n${updated}\n${indent}</${tag}>`;
  });
}

// --- Helper functions inspired by create-vite ---

export function formatTargetDir(targetDir: string) {
  return targetDir
    .trim() // 1. remove whitespace before/after
    .replace(/\/+$/g, ''); // 2. remove trailing slashes
}

export function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

export const writeFile = (srcFolder: string, destFolder: string, file: string, content?: string) => {
  const targetPath = path.join(destFolder, RENAME_FILES[file] ?? file);

  // ensure parent directory exists
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (content) {
    fs.writeFileSync(targetPath, content, 'utf8');
  } else {
    fs.copyFileSync(path.join(srcFolder, file), targetPath);
  }
};

export const writeDir = (srcFolder: string, destFolder: string, dir: string) => {
  copyDir(path.join(srcFolder, dir), path.join(destFolder, dir));
};

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

export function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}
