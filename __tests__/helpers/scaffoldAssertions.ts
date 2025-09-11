// test/helpers/scaffoldAssertions.ts
import fs from 'fs-extra';
import path from 'node:path';
import { expect } from 'vitest';

export function assertPopularTemplate(cwd: string, appName: string) {
  const appRoot = path.join(cwd, appName);

  // package.json name updated
  const pkg = fs.readJsonSync(path.join(appRoot, 'package.json'));
  expect(pkg.name).toBe(appName);

  // Template wrote common files
  expect(fs.pathExistsSync(path.join(appRoot, '.gitignore'))).toBe(true);
  expect(fs.pathExistsSync(path.join(appRoot, 'src', 'App.tsx'))).toBe(true);

  // package-lock.json should not be present
  expect(fs.pathExistsSync(path.join(appRoot, 'package-lock.json'))).toBe(false);

  // Demo files from selected libraries should be copied into src
  const demoFiles = ['AnimationDemo.tsx', 'StateDemo.tsx', 'ThreeDemo.tsx', 'Lenis.tsx'];
  for (const f of demoFiles) {
    expect(fs.pathExistsSync(path.join(appRoot, 'src', f))).toBe(true);
  }

  // App.tsx should be updated with imports and JSX insertions
  const appTsx = fs.readFileSync(path.join(appRoot, 'src', 'App.tsx'), 'utf8');

  function expectImport(component: string) {
    expect(appTsx).toMatch(new RegExp(`import ${component} from ["']@\\/${component}["];?`));
  }

  // Imports
  expectImport('AnimationDemo');
  expectImport('StateDemo');
  expectImport('ThreeDemo');
  expectImport('Lenis');

  // JSX insertions
  expect(appTsx).toContain('<AnimationDemo></AnimationDemo>');
  expect(appTsx).toContain('<StateDemo></StateDemo>');
  expect(appTsx).toContain('<ThreeDemo></ThreeDemo>');
  expect(appTsx).toContain('<Lenis></Lenis>');
}
