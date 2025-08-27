#!/usr/bin/env node

import path from "node:path";
import fs from "fs-extra";
import process from "node:process";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import { execa } from "execa";
import ora from "ora";
import kleur from "kleur";
import yargsParser from "yargs-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PM = {
  npm: {
    name: "npm",
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
  },
  pnpm: {
    name: "pnpm",
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
  },
  yarn: {
    name: "yarn",
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
  },
  bun: {
    name: "bun",
    install: ["install"],
    add: (dev) => (dev ? ["add", "-d"] : ["add"]),
    addPkgs: (pkgs, dev) => (dev ? ["add", "-d", ...pkgs] : ["add", ...pkgs]),
    // bunx prefers passing via create-vite
    createVite: (projectName) => [
      "x",
      "create-vite@latest",
      projectName,
      "--",
      "--template",
      "react-ts",
    ],
  },
};

const DEFAULTS = {
  packageManager: detectDefaultPM(),
  useTailwind: true,
  animation: "none", // 'motion' | 'gsap' | 'spring' | 'none'
  state: "none", // 'zustand' | 'jotai' | 'valtio' | 'redux' | 'none'
  three: "none", // 'three' | 'r3f' | 'none'
  creative: [], // ['leva','lenis','gesture']
};

function detectDefaultPM() {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
}

async function isCommandAvailable(cmd) {
  try {
    await execa(cmd, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function parseFlags(argv) {
  const args = yargsParser(argv, {
    string: ["name"],
    configuration: { "camel-case-expansion": true },
  });
  return {
    projectName: args.name,
  };
}

async function promptState(initial) {
  const pmChoices = ["npm", "pnpm", "yarn", "bun"];
  const animationChoices = ["gsap", "motion", "react-spring", "none"];
  const stateChoices = ["zustand", "jotai", "valtio", "redux", "none"];
  const threeChoices = ["three", "r3f", "none"];
  const creativeChoices = ["leva", "lenis", "gesture"];
  const selectHint = "Return ↵ to submit";
  const multiselectHint = "Space to select, Return ↵ to submit";

  const response = await prompts(
    [
      {
        type: initial.projectName ? null : "text",
        name: "projectName",
        message: "Project name",
        initial: initial.projectName || DEFAULTS.projectName,
        hint: selectHint,
        validate: (v) =>
          v && v.trim().length > 0 ? true : "Please enter a project name",
      },
      {
        type: "select",
        name: "packageManager",
        message: "Choose package manager",
        choices: pmChoices.map((v) => ({ title: v, value: v })),
        initial: Math.max(
          0,
          pmChoices.indexOf(initial.packageManager || DEFAULTS.packageManager)
        ),
        hint: selectHint,
      },
      {
        type: "select",
        name: "animation",
        message: "Choose animation library",
        choices: animationChoices.map((v) => ({ title: v, value: v })),
        initial: animationChoices.indexOf(
          initial.animation || DEFAULTS.animation
        ),
        hint: selectHint,
      },
      {
        type: "select",
        name: "state",
        message: "Choose state management",
        choices: stateChoices.map((v) => ({ title: v, value: v })),
        initial: stateChoices.indexOf(initial.state || DEFAULTS.state),
        hint: selectHint,
      },
      {
        type: "select",
        name: "three",
        message: "Choose 3D stack",
        choices: threeChoices.map((v) => ({ title: v, value: v })),
        initial: threeChoices.indexOf(initial.three || DEFAULTS.three),
        hint: selectHint,
      },
      {
        type:
          Array.isArray(initial.creative) && initial.creative.length
            ? null
            : "multiselect",
        name: "creative",
        message: "Add creative coding helpers?",
        hint: multiselectHint,
        choices: creativeChoices.map((v) => ({ title: v, value: v })),
      },
    ],
    {
      onCancel: () => {
        console.log(kleur.red("✖ Aborted."));
        process.exit(1);
      },
    }
  );

  return { ...initial, ...response };
}

function summarize(state) {
  const lines = [];
  lines.push(`${kleur.bold().cyan("Project")}: ${state.projectName}`);
  lines.push(
    `${kleur.bold().cyan("Package manager")}: ${state.packageManager}`
  );
  lines.push(
    `${kleur.bold().cyan("TailwindCSS")}: ${state.useTailwind ? "Yes" : "No"}`
  );
  lines.push(`${kleur.bold().cyan("Animation")}: ${state.animation}`);
  lines.push(`${kleur.bold().cyan("State")}: ${state.state}`);
  lines.push(`${kleur.bold().cyan("3D/Graphics")}: ${state.three}`);
  lines.push(
    `${kleur.bold().cyan("Creative tools")}: ${
      state.creative?.length ? state.creative.join(", ") : "None"
    }`
  );
  return lines.join("\n");
}

async function createViteProject(projectRoot, pmName) {
  const pm = PM[pmName] || PM.npm;
  await execa(pm.name, pm.createVite(path.basename(projectRoot)), {
    stdio: "inherit",
  });
}

async function addDeps(projectRoot, pmName, deps = [], devDeps = []) {
  const pm = PM[pmName] || PM.npm;
  if (deps.length) {
    await execa(pm.name, pm.addPkgs(deps, false), {
      cwd: projectRoot,
      stdio: "inherit",
    });
  }
  if (devDeps.length) {
    await execa(pm.name, pm.addPkgs(devDeps, true), {
      cwd: projectRoot,
      stdio: "inherit",
    });
  }
}

// https://tailwindcss.com/docs/installation/using-vite
async function setupTailwind(projectRoot, state) {
  // Only need tailwindcss + vite plugin, no postcss/autoprefixer
  const deps = ["tailwindcss", "@tailwindcss/vite"];
  await addDeps(projectRoot, state.packageManager, deps, []);

  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'
  
  export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],
  })
  `;
  await fs.writeFile(
    path.join(projectRoot, "vite.config.ts"),
    viteConfig,
    "utf8"
  );

  // tailwind.config.ts
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  `;
  await fs.writeFile(
    path.join(projectRoot, "tailwind.config.ts"),
    tailwindConfig,
    "utf8"
  );

  // index.css
  const indexCssPath = path.join(projectRoot, "src", "index.css");
  const css = `@tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  :root {
    color-scheme: light dark;
  }
  
  body {
    @apply min-h-dvh bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 antialiased;
  }
  
  #root {
    @apply min-h-dvh;
  }
  `;
  await fs.writeFile(indexCssPath, css, "utf8");
}

function renderAppTsx(state) {
  const imports = new Set([
    "import React, { useEffect, useMemo, useRef, useState } from 'react'",
  ]);
  const body = [];

  // Animation imports
  if (state.animation === "motion")
    imports.add("import { motion } from 'motion/react'");
  if (state.animation === "gsap") imports.add("import { gsap } from 'gsap'");
  if (state.animation === "react-spring")
    imports.add("import { useSpring, animated } from '@react-spring/web'");

  // State imports
  if (state.state === "zustand")
    imports.add("import { create } from 'zustand'");
  if (state.state === "jotai")
    imports.add("import { atom, useAtom } from 'jotai'");
  if (state.state === "valtio")
    imports.add("import { proxy, useSnapshot } from 'valtio'");
  if (state.state === "redux") {
    imports.add(
      "import { configureStore, createSlice } from '@reduxjs/toolkit'"
    );
    imports.add(
      "import { Provider, useDispatch, useSelector } from 'react-redux'"
    );
  }

  // 3D imports
  if (state.three === "r3f") {
    imports.add("import { Canvas, useFrame } from '@react-three/fiber'");
    imports.add("import { OrbitControls } from '@react-three/drei'");
    imports.add("import * as THREE from 'three'");
  }
  if (state.three === "three") imports.add("import * as THREE from 'three'");

  // Creative imports
  if (state.creative?.includes("leva"))
    imports.add("import { useControls } from 'leva'");
  if (state.creative?.includes("lenis"))
    imports.add("import Lenis from '@studio-freight/lenis'");
  if (state.creative?.includes("gesture"))
    imports.add("import { useDrag } from '@use-gesture/react'");

  const lines = [];
  lines.push([...imports].join("\n"));
  lines.push("\n");

  // State setup blocks
  if (state.state === "zustand") {
    lines.push(`type CounterState = { count: number; inc: () => void }`);
    lines.push(
      `const useCounterStore = create<CounterState>((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }))`
    );
  }
  if (state.state === "jotai") {
    lines.push(`const countAtom = atom(0)`);
  }
  if (state.state === "valtio") {
    lines.push(`const stateProxy = proxy({ count: 0 })`);
  }
  if (state.state === "redux") {
    lines.push(
      `const slice = createSlice({ name: 'counter', initialState: { value: 0 }, reducers: { inc: (s) => { s.value += 1 } } })`
    );
    lines.push(
      `const store = configureStore({ reducer: { counter: slice.reducer } })`
    );
  }

  // Helper components for R3F
  if (state.three === "r3f") {
    lines.push(
      `function SpinningBox({ color = '#4f46e5' }: { color?: string }) {`
    );
    lines.push(`  const ref = useRef<THREE.Mesh>(null!)`);
    lines.push(
      `  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta })`
    );
    lines.push(
      `  return (\n    <mesh ref={ref}>\n      <boxGeometry args={[1,1,1]} />\n      <meshStandardMaterial color={color} />\n    </mesh>\n  )`
    );
    lines.push(`}`);
  }

  // Main component start
  lines.push(`export default function App() {`);

  if (state.creative?.includes("leva")) {
    lines.push(
      `  const { color, speed } = useControls({ color: '#4f46e5', speed: { value: 1, min: 0, max: 4, step: 0.1 } })`
    );
  }

  if (state.animation === "gsap") {
    lines.push(`  const titleRef = useRef<HTMLHeadingElement>(null)`);
    lines.push(
      `  useEffect(() => { if (titleRef.current) gsap.fromTo(titleRef.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }) }, [])`
    );
  }

  if (state.animation === "react-spring") {
    lines.push(
      `  const styles = useSpring({ from: { opacity: 0, y: -16 }, to: { opacity: 1, y: 0 }, config: { tension: 200, friction: 18 } })`
    );
  }

  if (state.state === "zustand") {
    lines.push(`  const count = useCounterStore((s) => s.count)`);
    lines.push(`  const inc = useCounterStore((s) => s.inc)`);
  }
  if (state.state === "jotai") {
    lines.push(`  const [count, setCount] = useAtom(countAtom)`);
  }
  if (state.state === "valtio") {
    lines.push(`  const snap = useSnapshot(stateProxy)`);
  }
  if (state.state === "redux") {
    lines.push(`  const dispatch = useDispatch()`);
    lines.push(`  const count = useSelector((s: any) => s.counter.value)`);
  }

  if (state.creative?.includes("lenis")) {
    lines.push(
      `  useEffect(() => { const lenis = new Lenis({ smoothWheel: true }); const raf = (t:number)=>{ lenis.raf(t); requestAnimationFrame(raf) }; requestAnimationFrame(raf); return () => { /* lenis has no destroy */ } }, [])`
    );
  }

  if (state.creative?.includes("gesture")) {
    lines.push(`  const [dragX, setDragX] = useState(0)`);
    lines.push(
      `  const bind = useDrag(({ offset: [x] }) => setDragX(x), { axis: 'x' })`
    );
  }

  const titleEl = (() => {
    const text = "create-creative-app";
    if (state.animation === "motion")
      return `<motion.h1 className=\"text-3xl font-bold\" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>${text}</motion.h1>`;
    if (state.animation === "gsap")
      return `<h1 ref={titleRef} className=\"text-3xl font-bold\">${text}</h1>`;
    if (state.animation === "react-spring")
      return `<animated.h1 style={styles as any} className=\"text-3xl font-bold\">${text}</animated.h1>`;
    return `<h1 className=\"text-3xl font-bold\">${text}</h1>`;
  })();

  const counterEl = (() => {
    if (state.state === "zustand")
      return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={inc}>Count: {count}</button>`;
    if (state.state === "jotai")
      return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={() => setCount((c)=>c+1)}>Count: {count}</button>`;
    if (state.state === "valtio")
      return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={() => stateProxy.count++}>Count: {snap.count}</button>`;
    if (state.state === "redux")
      return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={() => dispatch(slice.actions.inc())}>Count: {count}</button>`;
    return "";
  })();

  lines.push("  return (");
  if (state.state === "redux") {
    lines.push("    <Provider store={store}>");
  }
  lines.push(
    `    <div className=\"flex min-h-dvh flex-col items-center justify-center gap-6 p-8\">`
  );
  lines.push(`      ${titleEl}`);
  lines.push(
    `      <p className=\"text-sm opacity-70\">Vite + React${
      state.useTailwind ? " + TailwindCSS" : ""
    }${state.three !== "none" ? " + 3D" : ""}</p>`
  );
  if (state.creative?.includes("gesture")) {
    lines.push(
      `      <div {...bind()} className=\"select-none rounded border p-4\">Drag me → {Math.round(dragX)}</div>`
    );
  }
  if (counterEl) lines.push(`      ${counterEl}`);

  if (state.three === "r3f") {
    const colorExpr = state.creative?.includes("leva")
      ? "{color}"
      : `'#4f46e5'`;
    lines.push(
      `      <div className=\"h-[300px] w-full max-w-3xl rounded border\">`
    );
    lines.push(`        <Canvas camera={{ position: [2.5, 2.5, 2.5] }}>`);
    lines.push(`          <ambientLight intensity={0.5} />`);
    lines.push(`          <directionalLight position={[3,3,3]} />`);
    lines.push(`          <SpinningBox color=${colorExpr} />`);
    lines.push(`          <OrbitControls enableDamping />`);
    lines.push(`        </Canvas>`);
    lines.push(`      </div>`);
  }

  lines.push("    </div>");
  if (state.state === "redux") lines.push("    </Provider>");
  lines.push("  )");
  lines.push("}");

  return lines.join("\n");
}

async function writeAppTsx(projectRoot, state) {
  const appPath = path.join(projectRoot, "src", "App.tsx");
  const content = renderAppTsx(state);
  await fs.writeFile(appPath, content, "utf8");
}

async function maybeWriteShaderExample(projectRoot, state) {
  if (!state.creative?.includes("glsl")) return;
  const shadersDir = path.join(projectRoot, "src", "shaders");
  await fs.ensureDir(shadersDir);
  const glsl = `// Simple GLSL snippet example\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform float u_time;\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / 600.0;\n  gl_FragColor = vec4(st.x, st.y, abs(sin(u_time)), 1.0);\n}\n`;
  await fs.writeFile(path.join(shadersDir, "gradient.glsl"), glsl, "utf8");
}

function computeDeps(state) {
  const deps = [];
  const devDeps = [];
  // Animations
  // https://motion.dev/docs/react
  if (state.animation === "motion") deps.push("motion");

  // https://www.gsap.com/docs/v3/Installation/
  if (state.animation === "gsap") deps.push("gsap");

  // https://www.react-spring.dev/
  if (state.animation === "spring") deps.push("@react-spring/web");

  // State
  // https://zustand.docs.pmnd.rs/getting-started/introduction#installation
  if (state.state === "zustand") deps.push("zustand");
  // https://jotai.org
  if (state.state === "jotai") deps.push("jotai");
  // https://valtio.dev/docs/introduction/getting-started
  if (state.state === "valtio") deps.push("valtio");
  // https://redux.js.org/introduction/installation
  if (state.state === "redux") deps.push("@reduxjs/toolkit", "react-redux");

  // 3D
  // https://threejs.org/manual/#en/installation
  if (state.three === "three") deps.push("three");

  // https://r3f.docs.pmnd.rs/getting-started/installation
  if (state.three === "r3f")
    deps.push(
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "maath",
      "postprocessing",
      "@react-three/postprocessing"
    );

  // Creative
  // https://github.com/pmndrs/leva?tab=readme-ov-file#installation
  if (state.creative?.includes("leva")) deps.push("leva");
  // https://github.com/darkroomengineering/lenis?tab=readme-ov-file#installation
  if (state.creative?.includes("lenis")) deps.push("lenis");
  // https://github.com/pmndrs/use-gesture#installation
  if (state.creative?.includes("gesture")) deps.push("@use-gesture/react");

  return { deps, devDeps };
}

async function ensurePmAvailable(pmName) {
  const available = await isCommandAvailable(pmName);
  if (!available) {
    console.log(
      kleur.yellow(`⚠ ${pmName} is not installed. Falling back to npm.`)
    );
    return "npm";
  }
  return pmName;
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));

  let state = { ...DEFAULTS };
  if (flags.projectName) state.projectName = flags.projectName;

  state.packageManager = await ensurePmAvailable(state.packageManager);

  state = await promptState(state);

  const projectRoot = path.resolve(process.cwd(), state.projectName);
  if (await fs.pathExists(projectRoot)) {
    console.log(kleur.red(`✖ Directory already exists: ${projectRoot}`));
    process.exit(1);
  }

  console.log("\n" + summarize(state) + "\n");

  const spinner = ora("Creating Vite + React (TS) project").start();
  try {
    await createViteProject(projectRoot, state.packageManager);
    spinner.succeed("Vite project created");
  } catch (err) {
    spinner.fail("Failed to create Vite project");
    console.error(err);
    process.exit(1);
  }

  // Update deps
  const { deps, devDeps } = computeDeps(state);

  const addSpinner = ora("Adding selected dependencies").start();
  try {
    await addDeps(projectRoot, state.packageManager, deps, devDeps);
    addSpinner.succeed("Dependencies added");
  } catch (err) {
    addSpinner.fail("Failed to add dependencies");
    console.error(err);
    process.exit(1);
  }

  // Tailwind
  if (state.useTailwind) {
    const twSpinner = ora("Configuring TailwindCSS").start();
    try {
      await setupTailwind(projectRoot, state);
      twSpinner.succeed("Tailwind configured");
    } catch (err) {
      twSpinner.fail("Failed to configure Tailwind");
      console.error(err);
      process.exit(1);
    }
  }

  // Write App.tsx and template extras
  const filesSpinner = ora("Scaffolding example files").start();
  try {
    await writeAppTsx(projectRoot, state);
    await maybeWriteShaderExample(projectRoot, state);
    filesSpinner.succeed("Example files ready");
  } catch (err) {
    filesSpinner.fail("Failed to scaffold files");
    console.error(err);
    process.exit(1);
  }

  console.log("\n" + kleur.bold().green("✔ Project ready!"));
  console.log("\nNext steps:");
  console.log(`  1. cd ${state.projectName}`);
  console.log("  2. ", runDevCmd(state.packageManager));
  console.log("\nHappy building ✨");
}

function runDevCmd(pm) {
  switch (pm) {
    case "pnpm":
      return "pnpm dev";
    case "yarn":
      return "yarn dev";
    case "bun":
      return "bun dev";
    default:
      return "npm run dev";
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
