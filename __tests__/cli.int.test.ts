import path from 'node:path';
import { projectRoot, tmpDir } from './helpers/utils';
import { cliTests } from './helpers/cliTests';

// based on utils.ts, tmpdir is one level up from dir
const toIndexJs = path.resolve(projectRoot, 'index.js');
const indexJs = path.join(path.resolve(tmpDir, toIndexJs), '..');
const cmd = `node ${indexJs}`;

cliTests(cmd, 'cli-int', true);
