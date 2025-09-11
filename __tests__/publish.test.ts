import { execaCommandSync, execaSync } from 'execa';
import { expect, test } from 'vitest';
import { cliTests } from './helpers/cliTests';
import { tmpdirTestWithPrefix } from './helpers/utils';
import { assertPopularTemplate } from './helpers/scaffoldAssertions';

test('test registry is set correctly', () => {
  // 1. Environment variable passed from workflow
  expect(process.env.npm_config_registry).toBe('http://localhost:4873');

  // 2. npm itself resolves the same registry
  const { stdout } = execaSync('npm', ['config', 'get', 'registry']);
  expect(stdout.trim()).toBe('http://localhost:4873');
});

cliTests('npm create react-creative --', 'publish-test', false);

const tmpdirTest = tmpdirTestWithPrefix('publish-test');
tmpdirTest('assert popular template', ({ dir }) => {
  execaCommandSync('npm create react-creative my-app -- --template popular', {
    cwd: dir,
    env: { FORCE_COLOR: '0', CI: 'true' },
    stdio: 'inherit',
  });

  // 5. Assert scaffolded project
  assertPopularTemplate(dir, 'my-app');
});
