import path from 'node:path';
import { describe, expect } from 'vitest';
import fs from 'node:fs';
import { execaCommandSync } from 'execa';
import { projectRoot, tmpdirTestWithPrefix } from './utils';
import { createNonEmptyDir } from './utils';
import ignore from 'ignore';

export function cliTests(cmd: string, tmpDirName: string, local: boolean) {
  // running it this way to ensure subfolder can be tested correctly,
  // but adds alot of complexity to the paths, is it even worth it??
  const rootDir = projectRoot;

  const templatePath = path.join(rootDir, 'template');

  // we need to do this because of how the repo develops on the template directly
  const ignorePath = fs.readFileSync(path.join(templatePath, local ? '_gitignore' : '.npmignore'), 'utf-8');
  const ig = ignore().add(ignorePath.split('\n'));
  const templateFiles = fs
    .readdirSync(templatePath)
    .map((file) => (file === '_gitignore' ? '.gitignore' : file))
    .filter((file) => !ig.ignores(file))
    .filter((file) => !['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'].includes(file))
    .sort();

  const tmpdirTest = tmpdirTestWithPrefix(tmpDirName);
  describe('CLI integration tests', () => {
    tmpdirTest('prompts for project name if none supplied', async ({ dir }) => {
      const { stdout } = execaCommandSync(`${cmd}`, { cwd: dir });

      expect(stdout).toContain('Project name:');
    });

    tmpdirTest('asks to overwrite non-empty target directory', async ({ dir }) => {
      const projectName = 'my-app';
      const projectDir = path.resolve(dir, projectName);

      // create a non-empty directory
      createNonEmptyDir(projectDir);

      const { stdout } = execaCommandSync(`${cmd} ${projectName}`, { cwd: dir });

      expect(stdout).toContain(`Target directory "${projectName}" is not empty.`);
    });

    tmpdirTest('scaffolds a project with the popular template', async ({ dir }) => {
      const projectName = 'my-app';
      const projectDir = path.resolve(dir, projectName);

      const { stdout } = execaCommandSync(`${cmd} ${projectName} --template popular`, { cwd: dir });
      const generatedFiles = fs.readdirSync(projectDir).sort();

      expect(stdout).toContain(`Scaffolding project in ${projectDir}`);
      expect(generatedFiles).toEqual(templateFiles);
    });

    tmpdirTest('scaffolds into a subfolder', async ({ dir }) => {
      const projectName = 'subfolder/my-app';
      const projectDirWithSubfolder = path.resolve(dir, projectName);

      const { stdout } = execaCommandSync(`${cmd} ${projectName} --template popular`, { cwd: dir });
      const generatedFiles = fs.readdirSync(projectDirWithSubfolder).sort();

      expect(stdout).toContain(`Scaffolding project in ${projectDirWithSubfolder}`);
      expect(generatedFiles).toEqual(templateFiles);
    });

    tmpdirTest('works with -t alias', async ({ dir }) => {
      const projectName = 'my-app';
      const projectDir = path.resolve(dir, projectName);

      const { stdout } = execaCommandSync(`${cmd} ${projectName} -t popular`, { cwd: dir });
      const generatedFiles = fs.readdirSync(projectDir).sort();

      expect(stdout).toContain(`Scaffolding project in ${projectDir}`);
      expect(generatedFiles).toEqual(templateFiles);
    });

    tmpdirTest('shows help text with --help', async ({ dir }) => {
      const { stdout } = execaCommandSync(`${cmd} --help`, { cwd: dir });
      expect(stdout).toContain('Usage: create-react-creative [OPTION]... [DIRECTORY]');
    });

    tmpdirTest('shows help text with -h alias', async ({ dir }) => {
      const { stdout } = execaCommandSync(`${cmd} -h`, { cwd: dir });
      expect(stdout).toContain('Usage: create-react-creative [OPTION]... [DIRECTORY]');
    });
  });
}
