import kleur from "kleur";
import type { PackageManager, PackageOption } from "./types.js";

const NONE: Readonly<PackageOption> = {
  name: "none",
  packageName: "",
  cli: {
    color: kleur.gray,
    displayName: "none",
    hint: "",
    description: "",
  },
};

// ---------------- Package Managers ----------------
const PACKAGE_MANAGERS: Readonly<Record<string, Readonly<PackageManager>>> = {
  npm: {
    packageName: "npm",
    commands: {
      install: ["install"],
      add: (dev) => (dev ? ["install", "-D"] : ["install"]),
      addPkgs: (pkgs, dev) =>
        dev ? ["install", "-D", ...pkgs] : ["install", ...pkgs],
      createVite: (projectName) => [
        "create",
        "vite@latest",
        projectName,
        "--",
        "--template",
        "react-ts",
      ],
      runDev: "npm run dev",
    },
  },
  pnpm: {
    packageName: "pnpm",
    commands: {
      install: ["install"],
      add: (dev) => (dev ? ["add", "-D"] : ["add"]),
      addPkgs: (pkgs, dev) => (dev ? ["add", "-D", ...pkgs] : ["add", ...pkgs]),
      createVite: (projectName) => [
        "create",
        "vite",
        projectName,
        "--template",
        "react-ts",
      ],
      runDev: "pnpm dev",
    },
  },
  yarn: {
    packageName: "yarn",
    commands: {
      install: ["install"],
      add: (dev) => (dev ? ["add", "-D"] : ["add"]),
      addPkgs: (pkgs, dev) => (dev ? ["add", "-D", ...pkgs] : ["add", ...pkgs]),
      createVite: (projectName) => [
        "create",
        "vite",
        projectName,
        "--template",
        "react-ts",
      ],
      runDev: "yarn dev",
    },
  },
  bun: {
    packageName: "bun",
    commands: {
      install: ["install"],
      add: (dev) => (dev ? ["add", "-D"] : ["add"]),
      addPkgs: (pkgs, dev) => (dev ? ["add", "-D", ...pkgs] : ["add", ...pkgs]),
      createVite: (projectName) => [
        "x",
        "create-vite@latest",
        projectName,
        "--",
        "--template",
        "react-ts",
      ],
      runDev: "bun dev",
    },
  },
};

// ---------------- Animations ----------------
const ANIMATIONS: ReadonlyArray<Readonly<PackageOption>> = [
  NONE,
  {
    name: "gsap",
    packageName: "gsap @gsap/react",
    cli: {
      displayName: "GSAP",
      description: "GreenSock Animation Platform",
      hint: "",
      color: kleur.green,
    },
    demo: {
      insertion: "GRID",
      source: "animation/gsap",
      destination: "components",
    },
  },
  {
    name: "motion",
    packageName: "motion",
    cli: {
      displayName: "motion (framer-motion)",
      description:
        "A production-grade animation library for React, JavaScript, and Vue.",
      hint: "",
      color: kleur.blue,
    },
    demo: {
      insertion: "GRID",
      source: "animation/motion",
      destination: "components",
    },
  },
  {
    name: "react-spring",
    packageName: "@react-spring/web",
    cli: {
      displayName: "react-spring",
      description: "Open-source spring-physics first animation library",
      hint: "",
      color: kleur.magenta,
    },
    demo: {
      insertion: "GRID",
      source: "animation/reactSpring",
      destination: "components",
    },
  },
];

// ---------------- State Management ----------------
const STATE_MANAGEMENTS: ReadonlyArray<Readonly<PackageOption>> = [
  NONE,
  {
    name: "zustand",
    packageName: "zustand",
    cli: {
      displayName: "Zustand",
      description: "zustand",
      hint: "",
      color: kleur.green,
    },
    demo: {
      insertion: "GRID",
      source: "stateManagement/zustand",
      destination: "components",
    },
  },
  {
    name: "jotai",
    packageName: "jotai",
    cli: {
      displayName: "Jotai",
      description: "jotai",
      hint: "",
      color: kleur.cyan,
    },
    demo: {
      insertion: "GRID",
      source: "stateManagement/jotai",
      destination: "components",
    },
  },
  {
    name: "valtio",
    packageName: "valtio",
    cli: {
      displayName: "Valtio",
      description: "valtio",
      hint: "",
      color: kleur.yellow,
    },
    demo: {
      insertion: "GRID",
      source: "stateManagement/valtio",
      destination: "components",
    },
  },
  {
    name: "redux",
    packageName: "redux",
    cli: {
      displayName: "Redux Toolkit",
      description: "redux",
      hint: "",
      color: kleur.red,
    },
    demo: {
      insertion: "GRID",
      source: "stateManagement/rtk",
      destination: "components",
    },
  },
];

// ---------------- Three.js / R3F ----------------
const THREES: ReadonlyArray<Readonly<PackageOption>> = [
  NONE,
  {
    name: "three",
    packageName: "three",
    cli: {
      displayName: "Vanilla three.js",
      description: "Plain three.js",
      hint: "",
      color: kleur.magenta,
    },
    demo: {
      insertion: "GRID",
      source: "three/vanillaThree",
      destination: "components",
    },
  },
  {
    name: "react-three-fiber",
    packageName: "three @types/three @react-three/fiber @react-three/drei",
    cli: {
      displayName: "react-three-fiber",
      description: "React Three Fiber",
      hint: "",
      color: kleur.blue,
    },
    demo: {
      insertion: "GRID",
      source: "three/r3f",
      destination: "components",
    },
  },
];

// ---------------- R3F Helpers ----------------
const REACT_THREES: ReadonlyArray<Readonly<PackageOption>> = [
  {
    name: "react-three-postprocessing",
    packageName: "@react-three/postprocessing",
    cli: {
      displayName: "react-three-postprocessing",
      description: "Postprocessing effects for R3F",
      hint: "",
      color: kleur.yellow,
    },
  },
  {
    name: "leva",
    packageName: "leva",
    cli: {
      displayName: "leva",
      description: "GUI controls for React",
      hint: "",
      color: kleur.red,
    },
  },
];

// ---------------- Creative ----------------
const CREATIVE: ReadonlyArray<Readonly<PackageOption>> = [
  {
    name: "lenis",
    packageName: "lenis",
    cli: {
      displayName: "lenis",
      description: "Smooth scroll library",
      hint: "",
      color: kleur.magenta,
    },
    demo: {
      insertion: "EFFECTS",
      source: "creative/lenis",
      destination: "components",
    },
  },
  {
    name: "@use-gesture/react",
    packageName: "@use-gesture/react",
    cli: {
      displayName: "@use-gesture/react",
      description: "The only gesture lib you'll need",
      hint: "",
      color: kleur.green,
    },
  },
];

const OPTIONS = {
  PACKAGE_MANAGERS,
  ANIMATIONS,
  STATE_MANAGEMENTS,
  THREES,
  REACT_THREES,
  CREATIVE,
} as const;

export default OPTIONS;
export { NONE };
