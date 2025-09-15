import ChalkInstance from 'chalk';
import type { PARENT_WRAPPERS } from './constants.js';

interface PackageOption {
  name: string;
  packages: string[];
  docs?: string;
  cli: {
    color: typeof ChalkInstance;
    displayName: string;
    hint: string;
    description: string;
  };
  demo?: {
    insertion: (typeof PARENT_WRAPPERS)[keyof typeof PARENT_WRAPPERS];
    source: string;
    destination: string; // not used
  };
}

interface PackageManager {
  packageName: 'npm' | 'pnpm' | 'yarn' | 'bun';
  commands: {
    install: string;
    add: (dev: boolean) => string[];
    addPkgs: (pkgs: string[], dev: boolean) => string[];
    createVite: (projectName: string) => string[];
    run: string;
  };
}
interface Libraries extends Record<string, PackageOption[] | PackageOption> {
  animation: PackageOption;
  stateManagement: PackageOption;
  three: PackageOption;
  reactThree: PackageOption[];
  creative: PackageOption[];
}

interface TemplateEntry {
  cli: {
    color: typeof ChalkInstance;
    displayName: string;
  };
  libs: Libraries;
}
type Template = Record<string, TemplateEntry>;

export type { PackageOption, PackageManager, Template, Libraries };
