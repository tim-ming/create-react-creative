import { describe, it, expect } from 'vitest';
import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';

import {
  extractExportName,
  flattenObjectValues,
  formatTargetDir,
  getPackageManager,
  insertComponents,
  parseArgv,
  isEmpty,
  isValidPackageName,
  toValidPackageName,
  writeDir,
  writeFile,
} from '../index.js';

describe('helpers/index', () => {
  it('formatTargetDir trims and removes trailing slashes', () => {
    expect(formatTargetDir(' my-app ')).toBe('my-app');
    expect(formatTargetDir('my-app///')).toBe('my-app');
    expect(formatTargetDir('  nested/path/// ')).toBe('nested/path');
  });

  it('package name validation and normalization', () => {
    expect(isValidPackageName('my-app')).toBe(true);
    expect(isValidPackageName('@scope/my-app')).toBe(true);
    expect(isValidPackageName('Invalid Name')).toBe(false);

    expect(toValidPackageName('Invalid Name')).toBe('invalid-name');
    expect(toValidPackageName('.Bad_Name')).toBe('bad-name');
  });

  it('flattenObjectValues flattens arrays and singletons', () => {
    const obj = { a: [1, 2], b: 3, c: ['x'], d: 'y' } as const;
    expect(flattenObjectValues(obj)).toEqual([1, 2, 3, 'x', 'y']);
  });

  it('parseArgv parses dir, help, and template flags', () => {
    expect(parseArgv(['my-dir', '--template', 'rec'])).toEqual({
      dir: 'my-dir',
      help: false,
      template: 'rec',
    });

    expect(parseArgv(['-h'])).toEqual({ dir: undefined, help: true, template: undefined });
  });

  it('insertComponents inserts inside a tag preserving indentation', () => {
    const input = `<Grid>\n  <Existing/>\n</Grid>`;
    const out = insertComponents(input, 'Grid', ['<A/>', '<B/>']);
    expect(out).toBe(`<Grid>\n  <Existing/>\n  <A/>\n  <B/>\n</Grid>`);
  });

  it('extractExportName handles function, class and identifier exports', () => {
    const fn = `export default function MyComp(){ return null }`;
    const cls = `export default class MyClass {}`;
    const id = `const Named = () => null; export default Named`;
    expect(extractExportName(fn)).toBe('MyComp');
    expect(extractExportName(cls)).toBe('MyClass');
    expect(extractExportName(id)).toBe('Named');
  });

  it('getPackageManager resolves by userAgent and defaults to npm', () => {
    expect(getPackageManager(undefined).packageName).toBe('npm');
    expect(getPackageManager('pnpm/9.0.0 node/v20.0.0').packageName).toBe('pnpm');
    expect(getPackageManager('yarn/3.7.0 node/v20.0.0').packageName).toBe('yarn');
  });

  it('isEmpty detects empty directories and ignores .git only', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cca-test-'));
    expect(isEmpty(tmp)).toBe(true);
    await fs.ensureFile(path.join(tmp, 'file.txt'));
    expect(isEmpty(tmp)).toBe(false);
    await fs.remove(path.join(tmp, 'file.txt'));
    await fs.ensureDir(path.join(tmp, '.git'));
    expect(isEmpty(tmp)).toBe(true);
    await fs.remove(tmp);
  });

  it('writeFile respects RENAME_FILES mapping and content writes', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cca-test-'));
    const src = path.join(tmp, 'src');
    const dest = path.join(tmp, 'dest');
    await fs.ensureDir(src);
    await fs.ensureDir(dest);

    // When content provided, it should write directly (and rename _gitignore)
    writeFile(src, dest, '_gitignore', 'ignored');
    const gi = await fs.readFile(path.join(dest, '.gitignore'), 'utf8');
    expect(gi).toBe('ignored');

    // When content omitted, it should copy from src
    await fs.writeFile(path.join(src, 'a.txt'), 'hello');
    writeFile(src, dest, 'a.txt');
    const a = await fs.readFile(path.join(dest, 'a.txt'), 'utf8');
    expect(a).toBe('hello');

    await fs.remove(tmp);
  });

  it('writeDir copies a directory recursively', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cca-test-'));
    const src = path.join(tmp, 'src');
    const dest = path.join(tmp, 'dest');
    await fs.ensureDir(path.join(src, 'nested'));
    await fs.writeFile(path.join(src, 'nested', 'file.txt'), 'content');

    writeDir(tmp, dest, 'src');
    const copied = await fs.readFile(path.join(dest, 'src', 'nested', 'file.txt'), 'utf8');
    expect(copied).toBe('content');

    await fs.remove(tmp);
  });
});
