import path from 'node:path';
import { execaCommandSync } from 'execa';
import { assertBarebonesTemplate, assertRecTemplate } from './helpers/scaffoldAssertions';
import { projectRoot, tmpdirTestWithPrefix } from './helpers/utils';

const tmpDirTest = tmpdirTestWithPrefix('pack');

tmpDirTest('npm pack successfully', async ({ dir }) => {
  const { stdout: packOut } = execaCommandSync(`npm pack --json --pack-destination ${dir}`, { cwd: projectRoot });
  const { filename } = JSON.parse(packOut)[0];
  const tarballInTemp = path.join(dir, filename);

  execaCommandSync('npm init -y', { cwd: dir });
  execaCommandSync(`npm install ${tarballInTemp}`, {
    cwd: dir,
    stdio: 'inherit',
  });

  execaCommandSync('npm create react-creative rec-app -- --template rec', {
    cwd: dir,
    env: { FORCE_COLOR: '0', CI: 'true' },
    stdio: 'inherit',
  });

  assertRecTemplate(dir, 'rec-app');

  execaCommandSync('npm create react-creative barebones-app -- --template rec', {
    cwd: dir,
    env: { FORCE_COLOR: '0', CI: 'true' },
    stdio: 'inherit',
  });

  assertBarebonesTemplate(dir, 'barebones-app');
});
