import { expect, afterEach } from 'vitest';
import path from 'node:path';
import { execa } from 'execa';
import { startDev } from './helpers/server';
import { projectRoot, tmpdirTestWithPrefix } from './helpers/utils';

const appName = 'my-app';
let stopDev: (() => Promise<void>) | undefined;

const tmpdirTest = tmpdirTestWithPrefix('dev-e2e');
const toIndexJs = path.resolve(projectRoot, 'index.js');

afterEach(async () => {
  // ensure dev server is stopped even if test fails
  if (stopDev) {
    await stopDev();
    stopDev = undefined;
  }
});

// during testing, flaky due to whatever watcher runs during npm run dev
tmpdirTest(
  'E2E: generated app dev server',
  async ({ dir }) => {
    const appRoot = path.resolve(dir, appName);
    // 1. Scaffold app
    await execa('node', [path.relative(dir, toIndexJs), appName, '--template', 'rec'], {
      cwd: dir,
      env: { FORCE_COLOR: '0', CI: 'true' },
      stdio: 'inherit',
    });

    // 2. Install deps
    await execa('npm', ['--prefix', appRoot, 'install'], {
      cwd: dir,
      env: { FORCE_COLOR: '0', CI: 'true' },
      stdio: 'inherit',
    });
    // 3. Start dev server
    const { url, stop } = await startDev(['--prefix', appRoot], dir, 5179);

    stopDev = stop; // register cleanup

    // 4. Fetch HTML
    const html = await (await fetch(url)).text();

    expect(html).toContain('<title>Vite + React + TS</title>');

    await stopDev();
  },
  120_000
);
