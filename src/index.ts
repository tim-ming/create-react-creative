import path from 'node:path';
import fs, { emptyDirSync } from 'fs-extra';
import process from 'node:process';
import * as p from '@clack/prompts';
import { LIBRARIES, NONE, TEMPLATES, HELP_MESSAGE, PARENT_WRAPPERS, RENAME_FILES } from './lib/constants.js';
import type { Libraries } from './lib/types.js';
import chalk from 'chalk';
import {
  extractExportName,
  flattenObjectValues,
  formatTargetDir,
  getPackageManager,
  isEmpty,
  isValidPackageName,
  parseArgv,
  toValidPackageName,
  writeDir,
  writeFile,
} from './lib/helpers.js';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as babelTypes from '@babel/types';
import ignore from 'ignore';
import { generateReadme } from './lib/readme.js';

const traverse = traverseModule.default ?? traverseModule;
const generate = generateModule.default ?? generateModule;

const cwd = process.cwd();
const TEMPLATE_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..', `template`);
const SCAFFOLD_RELATIVE_ROOT = 'src/demo';

interface WizardState {
  targetDir: string;
  packageName: string;
  libraries: Libraries;
}
const DEFAULTS: WizardState = {
  targetDir: 'react-creative',
  packageName: 'react-creative',
  libraries: {
    animation: NONE,
    stateManagement: NONE,
    three: NONE,
    reactThree: [],
    creative: [],
  },
};

async function promptState(): Promise<WizardState> {
  const { dir: argDir, template: argTemplate, help: argHelp } = parseArgv(process.argv.slice(2));
  const argTargetDir = argDir ? formatTargetDir(argDir) : undefined;

  if (argHelp) {
    console.log(HELP_MESSAGE);
    process.exit(0);
  }
  p.intro(chalk.cyan('Create your creative project ⚡'));

  const cancel = () => {
    p.cancel('Operation cancelled');
    process.exit(0);
  };

  // 1. Get project name and target dir
  let targetDir = argTargetDir;
  if (!targetDir) {
    const projectName = await p.text({
      message: 'Project name:',
      defaultValue: DEFAULTS.targetDir,
      placeholder: DEFAULTS.targetDir,
      validate: (value) => {
        return value.length === 0 || formatTargetDir(value).length > 0 ? undefined : 'Invalid project name';
      },
    });
    if (p.isCancel(projectName)) return cancel();
    targetDir = formatTargetDir(projectName);
  }

  // 2. Handle directory if exist and not empty
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = await p.select({
      message:
        (targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) +
        ` is not empty. Please choose how to proceed:`,
      options: [
        {
          label: 'Cancel operation',
          value: 'no',
        },
        {
          label: 'Remove existing files and continue',
          value: 'yes',
        },
        {
          label: 'Ignore files and continue',
          value: 'ignore',
        },
      ],
    });
    if (p.isCancel(overwrite)) return cancel();
    switch (overwrite) {
      case 'yes':
        emptyDirSync(targetDir);
        break;
      case 'no':
        cancel();
    }
  }

  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
    const packageNameResult = await p.text({
      message: 'Package name:',
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir) {
        if (!isValidPackageName(dir)) {
          return 'Invalid package.json name';
        }
      },
    });
    if (p.isCancel(packageNameResult)) return cancel();
    packageName = packageNameResult;
  }
  const template = Object.entries(TEMPLATES).find(([key, _]) => key === argTemplate)?.[1];
  let libraries = template?.libs;
  if (!libraries) {
    if (argTemplate) p.note(`"${argTemplate}" isn't a valid template. Please customize your own template: `);
    const initialLibraries = DEFAULTS.libraries;

    libraries = (await p.group(
      {
        animation: () =>
          p.select({
            message: 'Choose an animation library:',
            initialValue: initialLibraries.animation,
            options: LIBRARIES.ANIMATIONS.map((a) => ({
              label: a.cli.color(a.cli.displayName),
              value: a,
              hint: a.cli.description,
            })),
          }),

        stateManagement: () =>
          p.select({
            message: 'Choose a state management library:',
            initialValue: initialLibraries.stateManagement,
            options: LIBRARIES.STATE_MANAGEMENTS.map((s) => ({
              label: s.cli.color(s.cli.displayName),
              value: s,
              hint: s.cli.description,
            })),
          }),

        three: () =>
          p.select({
            message: 'Add 3D graphics library?',
            initialValue: initialLibraries.three,
            options: LIBRARIES.THREES.map((t) => ({
              label: t.cli.color(t.cli.displayName),
              value: t,
              hint: t.cli.description,
            })),
          }),
        reactThree: async ({ results }) => {
          if (results?.three?.name == 'react-three-fiber') {
            return p.multiselect({
              message: 'Add React Three helpers?',
              initialValues: initialLibraries.reactThree?.map((r) => r) ?? [],
              options: LIBRARIES.REACT_THREES.map((r) => ({
                label: r.cli.color(r.cli.displayName),
                value: r,
                hint: r.cli.description,
              })),
              required: false,
            });
          }
          return [];
        },

        creative: () =>
          p.multiselect({
            message: 'Add creative coding helpers?',
            initialValues: initialLibraries.creative?.map((c) => c) ?? [],
            options: LIBRARIES.CREATIVE.map((c) => ({
              label: c.cli.color(c.cli.displayName),
              value: c,
              hint: c.cli.description,
            })),
            required: false,
          }),
      },
      {
        onCancel: cancel,
      }
    )) as Libraries;
  }

  return {
    targetDir,
    packageName,
    libraries,
  };
}

function summarize(state: WizardState): string {
  const graphics = [
    state.libraries.three?.cli.displayName,
    ...(state.libraries.reactThree?.map((r) => r.cli.displayName) ?? []),
  ].filter(Boolean);

  const graphicsLine = graphics.length > 0 ? `${chalk.bold.cyan('3D/Graphics')}: ${graphics.join(', ')}` : '';

  return [
    `${chalk.bold.cyan('Project Name')}: ${state.targetDir}`,
    `${chalk.bold.cyan('Automatically Included')}: ${'Tailwind, Path Aliasing, Svgr'}`,
    `${chalk.bold.cyan('Animation Libraries')}: ${state.libraries.animation.cli.displayName}`,
    `${chalk.bold.cyan('State Management')}: ${state.libraries.stateManagement.cli.displayName}`,
    graphicsLine,
    `${chalk.bold.cyan('Creative tools')}: ${
      state.libraries.creative.length ? state.libraries.creative.map((c) => c.cli.displayName).join(', ') : 'None'
    }`,
  ].join('\n');
}

function scaffoldTemplateFiles(projectRoot: string, state: WizardState) {
  // Get all files from template (with Dirent objects)
  const entries = fs.readdirSync(TEMPLATE_ROOT, {
    recursive: true,
    withFileTypes: true,
  });

  // Ensure target directory exists
  const root = path.join(cwd, state.targetDir);
  fs.mkdirSync(root, { recursive: true });

  // Setup .gitignore filter (if exists)
  const ig = ignore();
  const gitignorePath = path.join(
    TEMPLATE_ROOT,
    Object.entries(RENAME_FILES).find(([_, v]) => v === '.gitignore')?.[0] ?? '.gitignore'
  );
  if (fs.existsSync(gitignorePath)) {
    ig.add(fs.readFileSync(gitignorePath, 'utf8').split('\n'));
  }

  // Filter + map to relative paths in one go
  const filtered = entries
    .map((f) => {
      const fullPath = path.join(f.parentPath ?? TEMPLATE_ROOT, f.name);
      return {
        entry: f,
        relPath: path.relative(TEMPLATE_ROOT, fullPath),
      };
    })
    .filter(({ entry, relPath }) => {
      if (entry.isDirectory()) return false;
      if (relPath === 'package.json') return false;
      if (relPath === 'package-lock.json') return false;
      if (relPath.startsWith(SCAFFOLD_RELATIVE_ROOT)) return false;
      if (ig.ignores(relPath)) return false;
      return true;
    })
    .map(({ relPath }) => relPath);

  for (const file of filtered) {
    writeFile(TEMPLATE_ROOT, projectRoot, file);
  }

  const templateLibPkgNames = Object.values(LIBRARIES).flatMap((pkg) => pkg.map((pkg) => pkg.name));
  const selectedLibPkgNames = Object.values(state.libraries)
    .flat()
    .map((pkg) => pkg.name);
  const excludedLibPkgNames = templateLibPkgNames.filter((pkg) => !selectedLibPkgNames.includes(pkg));

  // write package.json with updated name and dependencies, delete excluded dependencies
  const pkgJson = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, `package.json`), 'utf-8'));

  pkgJson.name = state.packageName;
  excludedLibPkgNames.forEach((pkgToExclude) => {
    delete pkgJson.dependencies[pkgToExclude];
  });

  writeFile(TEMPLATE_ROOT, projectRoot, 'package.json', JSON.stringify(pkgJson, null, 2) + '\n');

  // copy scaffold demo files (only demo files, not the demo directory) into src
  for (const pkg of flattenObjectValues(state.libraries)) {
    if (!pkg.demo) continue;
    writeDir(path.join(TEMPLATE_ROOT, SCAFFOLD_RELATIVE_ROOT, pkg.demo.source), path.join(projectRoot, 'src'), '');
  }

  // overwrite README with dynamic content
  const readme = generateReadme(state.packageName || state.targetDir, state.libraries, {
    install: getPackageManager(process.env.npm_config_user_agent).commands.install,
    run: getPackageManager(process.env.npm_config_user_agent).commands.run,
  });
  writeFile(TEMPLATE_ROOT, projectRoot, 'README.md', readme + '\n');
}

function setupAppTsxAST(projectRoot: string, state: WizardState) {
  const projectAppPath = path.join(projectRoot, 'src', 'App.tsx');
  const content = fs.readFileSync(projectAppPath, 'utf8');

  // Parse AST
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  // Collect existing imports
  const existingImports = new Set<string>();
  traverse(ast, {
    ImportDeclaration(path) {
      existingImports.add(path.node.source.value);
    },
  });

  // Track new imports and wrapper insertions
  const parentWrappers: Record<
    (typeof PARENT_WRAPPERS)[keyof typeof PARENT_WRAPPERS],
    { imports: babelTypes.ImportDeclaration[]; components: babelTypes.JSXElement[] }
  > = Object.values(PARENT_WRAPPERS).reduce(
    (acc, wrapper) => {
      acc[wrapper] = { imports: [], components: [] };
      return acc;
    },
    {} as Record<
      (typeof PARENT_WRAPPERS)[keyof typeof PARENT_WRAPPERS],
      { imports: babelTypes.ImportDeclaration[]; components: babelTypes.JSXElement[] }
    >
  );

  // Collect new components from state
  for (const pkg of flattenObjectValues(state.libraries)) {
    if (!pkg.demo) continue;

    const demoDir = path.join(TEMPLATE_ROOT, SCAFFOLD_RELATIVE_ROOT, pkg.demo.source); // adjust if needed
    const tsxFiles = fs.readdirSync(demoDir).filter((f) => f.endsWith('.tsx'));

    if (tsxFiles.length !== 1) {
      throw new Error(`Expected exactly one .tsx file in ${pkg.demo.source}, found ${tsxFiles.length}`);
    }

    const tsxFilePath = path.join(demoDir, tsxFiles[0]);
    const exportName = extractExportName(fs.readFileSync(tsxFilePath, 'utf8'));
    if (!exportName) {
      throw new Error(`Could not find default export in ${tsxFilePath}`);
    }

    // Add import
    if (!existingImports.has(`@/${tsxFiles[0].replace(/\.tsx$/, '')}`)) {
      const imp = babelTypes.importDeclaration(
        [babelTypes.importDefaultSpecifier(babelTypes.identifier(exportName))],
        babelTypes.stringLiteral(`@/${tsxFiles[0].replace(/\.tsx$/, '')}`)
      );
      parentWrappers[pkg.demo.insertion].imports.push(imp);
    }

    // Add JSX component
    const jsx = babelTypes.jsxElement(
      babelTypes.jsxOpeningElement(babelTypes.jsxIdentifier(exportName), []),
      babelTypes.jsxClosingElement(babelTypes.jsxIdentifier(exportName)),
      [],
      false
    );
    parentWrappers[pkg.demo.insertion].components.push(jsx);
  }

  // Insert missing imports at the top
  traverse(ast, {
    Program(path) {
      const body = path.node.body;
      const lastImportIndex = body.findIndex((n) => !babelTypes.isImportDeclaration(n));
      const insertAt = lastImportIndex === -1 ? body.length : lastImportIndex;
      for (const wrapper of Object.values(PARENT_WRAPPERS)) {
        body.splice(insertAt, 0, ...parentWrappers[wrapper].imports);
      }
    },
  });

  // Insert JSX children into Grid/Effects
  traverse(ast, {
    JSXElement(path) {
      const name = path.node.openingElement.name;
      if (!babelTypes.isJSXIdentifier(name)) return;

      for (const wrapper of Object.values(PARENT_WRAPPERS)) {
        if (name.name === wrapper) {
          path.node.children.push(...parentWrappers[wrapper].components);
        }
      }
    },
  });

  // Generate code back
  const { code } = generate(ast, {
    retainLines: true,
    comments: true,
    concise: false,
  });

  fs.writeFileSync(projectAppPath, code, 'utf8');
}

async function main() {
  const state = await promptState();

  const projectRoot = path.join(cwd, state.targetDir);
  const pm = getPackageManager(process.env.npm_config_user_agent);

  p.note(summarize(state), 'Configuration Summary');

  p.log.step(`Scaffolding project in ${projectRoot}...`);
  scaffoldTemplateFiles(projectRoot, state);
  // setupAppTsx(projectRoot, state);
  setupAppTsxAST(projectRoot, state);
  p.log.success('Template files scaffolded!');

  p.outro(chalk.bold.green('✔ Project ready!'));
  const cdProjectName = path.relative(cwd, projectRoot);
  console.log('\nNext steps:');
  console.log(`  1. cd ${cdProjectName}`);
  console.log('  2.', pm.commands.install + '; ' + pm.commands.run + ' format');
  console.log('  3.', pm.commands.run + ' dev');

  console.log('\nGet creative and happy building ✨\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
