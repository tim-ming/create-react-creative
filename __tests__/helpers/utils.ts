import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { test as base } from 'vitest';

export const createNonEmptyDir = (folder: string) => {
  const target = folder;
  fsSync.mkdirSync(target, { recursive: true });
  fsSync.writeFileSync(path.join(target, 'package.json'), '{ "foo": "bar" }');
};

export const clearDirs = (dir: string) => {
  if (fsSync.existsSync(dir)) {
    fsSync.rmSync(dir, { recursive: true, force: true });
  }
};

export const projectRoot = path.resolve(__dirname, '..', '..');
export const tmpDir = path.resolve(projectRoot, '__tests__', 'tmp');

// Reference: https://sdorra.dev/posts/2024-02-12-vitest-tmpdir
async function createTempDir(prefix: string) {
  await fs.mkdir(tmpDir, { recursive: true });
  const fullPrefix = path.join(tmpDir, `${prefix}-`);
  return await fs.mkdtemp(fullPrefix);
}

// retry incase it's being held by another process
async function rmrfRobust(dir: string, tries = 5, baseMs = 200) {
  let lastError: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
      return;
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code && ['ENOTEMPTY', 'EBUSY', 'EPERM', 'EACCES'].includes(code)) {
        lastError = e;
        const delay = baseMs * Math.pow(2, i) + Math.floor(Math.random() * baseMs);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError ?? new Error(`Failed to remove ${dir} after ${tries} tries`);
}

export function tmpdirTestWithPrefix(prefix: string) {
  return base.extend<{ dir: string }>({
    // eslint-disable-next-line no-empty-pattern
    dir: async ({}, use) => {
      const directory = await createTempDir(prefix);
      try {
        await use(directory);
      } finally {
        await rmrfRobust(directory);
      }
    },
  });
}
