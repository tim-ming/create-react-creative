import path from 'node:path';
import { execaCommandSync } from 'execa';
import { assertPopularTemplate } from './helpers/scaffoldAssertions';
import { projectRoot, tmpdirTestWithPrefix } from './helpers/utils';

const tmpDirTest = tmpdirTestWithPrefix('pack');

tmpDirTest('npm pack successfully', async ({ dir }) => {
  // 1. Pack directly into temp dir
  const { stdout: packOut } = execaCommandSync(`npm pack --json --pack-destination ${dir}`, { cwd: projectRoot });
  const { filename } = JSON.parse(packOut)[0];
  const tarballInTemp = path.join(dir, filename);

  execaCommandSync('npm init -y', { cwd: dir });
  // 3. Init + install tarball
  execaCommandSync(`npm install ${tarballInTemp}`, {
    cwd: dir,
    stdio: 'inherit',
  });

  // 4. Scaffold project
  execaCommandSync('npm create react-creative my-app -- --template popular', {
    cwd: dir,
    env: { FORCE_COLOR: '0', CI: 'true' },
    stdio: 'inherit',
  });

  // 5. Assert scaffolded project
  assertPopularTemplate(dir, 'my-app');
});
