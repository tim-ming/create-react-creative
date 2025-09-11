import chalk from 'chalk';
import type { PackageManager, PackageOption, Template } from './types.js';

const PARENT_WRAPPERS = {
  GRID: 'Grid',
  EFFECTS: 'Effects',
} as const;

const NONE: Readonly<PackageOption> = {
  name: 'none',
  packages: [],
  cli: {
    color: chalk.gray,
    displayName: 'none',
    hint: '',
    description: '',
  },
};

// ---------------- Package Managers ----------------
const PACKAGE_MANAGERS = {
  npm: {
    packageName: 'npm',
    commands: {
      install: 'npm install',
      add: (dev) => (dev ? ['install', '-D'] : ['install']),
      addPkgs: (pkgs, dev) => (dev ? ['install', '-D', ...pkgs] : ['install', ...pkgs]),
      createVite: (projectName) => ['create', 'vite@latest', projectName, '--', '--template', 'react-ts'],
      run: 'npm run',
    },
  },
  pnpm: {
    packageName: 'pnpm',
    commands: {
      install: 'pnpm install',
      add: (dev) => (dev ? ['add', '-D'] : ['add']),
      addPkgs: (pkgs, dev) => (dev ? ['add', '-D', ...pkgs] : ['add', ...pkgs]),
      createVite: (projectName) => ['create', 'vite', projectName, '--template', 'react-ts'],
      run: 'pnpm',
    },
  },
  yarn: {
    packageName: 'yarn',
    commands: {
      install: 'yarn',
      add: (dev) => (dev ? ['add', '-D'] : ['add']),
      addPkgs: (pkgs, dev) => (dev ? ['add', '-D', ...pkgs] : ['add', ...pkgs]),
      createVite: (projectName) => ['create', 'vite', projectName, '--template', 'react-ts'],
      run: 'yarn',
    },
  },
  bun: {
    packageName: 'bun',
    commands: {
      install: 'bun install',
      add: (dev) => (dev ? ['add', '-D'] : ['add']),
      addPkgs: (pkgs, dev) => (dev ? ['add', '-D', ...pkgs] : ['add', ...pkgs]),
      createVite: (projectName) => ['x', 'create-vite@latest', projectName, '--', '--template', 'react-ts'],
      run: 'bun',
    },
  },
} as const satisfies Record<string, PackageManager>;

// ---------------- Animations ----------------
const ANIMATIONS: ReadonlyArray<Readonly<PackageOption>> = [
  NONE,
  {
    name: 'gsap',
    packages: ['gsap', '@gsap/react'],
    cli: {
      displayName: 'GSAP',
      description: 'GreenSock Animation Platform',
      hint: '',
      color: chalk.green,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'animation/gsap',
      destination: 'components',
    },
  },
  {
    name: 'motion',
    packages: ['motion'],
    cli: {
      displayName: 'motion (framer-motion)',
      description: 'A production-grade animation library for React, JavaScript, and Vue.',
      hint: '',
      color: chalk.blue,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'animation/motion',
      destination: 'components',
    },
  },
  {
    name: 'react-spring',
    packages: ['@react-spring/web'],
    cli: {
      displayName: 'react-spring',
      description: 'Open-source spring-physics first animation library',
      hint: '',
      color: chalk.magenta,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'animation/reactSpring',
      destination: 'components',
    },
  },
];

// ---------------- State Management ----------------
const STATE_MANAGEMENTS: ReadonlyArray<Readonly<PackageOption>> = [
  NONE,
  {
    name: 'zustand',
    packages: ['zustand'],
    cli: {
      displayName: 'Zustand',
      description: 'zustand',
      hint: '',
      color: chalk.green,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'stateManagement/zustand',
      destination: 'components',
    },
  },
  {
    name: 'jotai',
    packages: ['jotai'],
    cli: {
      displayName: 'Jotai',
      description: 'jotai',
      hint: '',
      color: chalk.cyan,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'stateManagement/jotai',
      destination: 'components',
    },
  },
  {
    name: 'valtio',
    packages: ['valtio'],
    cli: {
      displayName: 'Valtio',
      description: 'valtio',
      hint: '',
      color: chalk.yellow,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'stateManagement/valtio',
      destination: 'components',
    },
  },
  {
    name: 'redux',
    packages: ['redux'],
    cli: {
      displayName: 'Redux Toolkit',
      description: 'redux',
      hint: '',
      color: chalk.red,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'stateManagement/rtk',
      destination: 'components',
    },
  },
];

// ---------------- Three.js / R3F ----------------
const THREES: ReadonlyArray<Readonly<PackageOption>> = [
  NONE,
  {
    name: 'three',
    packages: ['three'],
    cli: {
      displayName: 'Vanilla three.js',
      description: 'Plain three.js',
      hint: '',
      color: chalk.magenta,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'three/vanillaThree',
      destination: 'components',
    },
  },
  {
    name: 'react-three-fiber',
    packages: ['three', '@types/three', '@react-three/fiber', '@react-three/drei'],
    cli: {
      displayName: 'react-three-fiber',
      description: 'React Three Fiber',
      hint: '',
      color: chalk.blue,
    },
    demo: {
      insertion: PARENT_WRAPPERS.GRID,
      source: 'three/r3f',
      destination: 'components',
    },
  },
];

// ---------------- R3F Helpers ----------------
const REACT_THREES: ReadonlyArray<Readonly<PackageOption>> = [
  {
    name: 'react-three-postprocessing',
    packages: ['@react-three/postprocessing'],
    cli: {
      displayName: 'react-three-postprocessing',
      description: 'Postprocessing effects for R3F',
      hint: '',
      color: chalk.yellow,
    },
  },
  {
    name: 'leva',
    packages: ['leva'],
    cli: {
      displayName: 'leva',
      description: 'GUI controls for React',
      hint: '',
      color: chalk.red,
    },
  },
];

// ---------------- Creative ----------------
const CREATIVE: ReadonlyArray<Readonly<PackageOption>> = [
  {
    name: 'lenis',
    packages: ['lenis'],
    cli: {
      displayName: 'lenis',
      description: 'Smooth scroll library',
      hint: '',
      color: chalk.magenta,
    },
    demo: {
      insertion: PARENT_WRAPPERS.EFFECTS,
      source: 'creative/lenis',
      destination: 'components',
    },
  },
  {
    name: '@use-gesture/react',
    packages: ['@use-gesture/react'],
    cli: {
      displayName: '@use-gesture/react',
      description: "The only gesture lib you'll need",
      hint: '',
      color: chalk.green,
    },
  },
];

const LIBRARIES = {
  ANIMATIONS,
  STATE_MANAGEMENTS,
  THREES,
  REACT_THREES,
  CREATIVE,
} as const;

// ---------------- Templates ----------------
const TEMPLATES = {
  popular: {
    cli: {
      color: chalk.blue,
      displayName: 'popular',
    },
    libs: {
      animation: ANIMATIONS.find((a) => a.name === 'gsap')!,
      stateManagement: STATE_MANAGEMENTS.find((s) => s.name === 'zustand')!,
      three: THREES.find((t) => t.name === 'react-three-fiber')!,
      reactThree: REACT_THREES.filter(() => false),
      creative: CREATIVE.filter((c) => c.name === 'lenis'),
    },
  },
} as const satisfies Template;

// ---------------- Dynamic Help Message ----------------
function renderTemplateSummary(template: (typeof TEMPLATES)[keyof typeof TEMPLATES]) {
  const libs: PackageOption[] = [
    template.libs.animation,
    template.libs.stateManagement,
    template.libs.three,
    ...(template.libs.reactThree ?? []),
    ...(template.libs.creative ?? []),
  ].filter(Boolean) as PackageOption[];

  const colored = libs.map((lib) => lib.cli.color(lib.cli.displayName));
  return `${template.cli.color(template.cli.displayName)} ${chalk.gray('----')} ${colored.join(' ')}`;
}

const HELP_MESSAGE = `\
Usage: create-react-creative [OPTION]... [DIRECTORY]

Create a new Vite + React project with your chosen libraries used in creative web development.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific scaffold template
  -h, --help                 show this help message
  -v, --version              print version info

Available templates:

${Object.values(TEMPLATES).map(renderTemplateSummary).join('\n')}
`;

const RENAME_FILES: Record<string, string> = {
  _gitignore: '.gitignore',
};

export { NONE, TEMPLATES, LIBRARIES, HELP_MESSAGE, RENAME_FILES, PACKAGE_MANAGERS, PARENT_WRAPPERS };
