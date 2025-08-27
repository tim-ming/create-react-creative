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
const NONE = {
    name: "none",
    packageName: "",
    displayName: "None",
    description: "None",
    importStatement: "",
};
const ANIMATIONS = [
    {
        name: "gsap",
        // https://gsap.com/docs/v3/Installation/
        packageName: "gsap",
        displayName: "GSAP",
        description: "GreenSock Animation Platform",
        importStatement: `import { gsap } from 'gsap'`,
    },
    {
        name: "motion",
        // https://motion.dev/docs/react
        packageName: "motion",
        displayName: "motion (framer-motion)",
        description: "framer-motion",
        importStatement: `import { motion } from 'motion/react'`,
    },
    {
        name: "react-spring",
        // https://react-spring.dev/docs/getting-started
        packageName: "@react-spring/web",
        displayName: "react-spring",
        description: "react-spring",
        importStatement: `import { useSpring, animated } from '@react-spring/web'`,
    },
    NONE,
];
const STATE_MANAGEMENTS = [
    {
        name: "zustand",
        // https://zustand.docs.pmnd.rs/getting-started/introduction#installation
        packageName: "zustand",
        displayName: "Zustand",
        description: "zustand",
        importStatement: `import { create } from 'zustand'`,
    },
    {
        name: "jotai",
        // https://jotai.org
        packageName: "jotai",
        displayName: "Jotai",
        description: "jotai",
        importStatement: `import { atom } from 'jotai'`,
    },
    {
        name: "valtio",
        // https://valtio.dev/docs/introduction/getting-started
        packageName: "valtio",
        displayName: "Valtio",
        description: "valtio",
        importStatement: `import { useSnapshot } from 'valtio'`,
    },
    {
        name: "redux",
        // https://redux.js.org/introduction/installation
        packageName: "redux",
        displayName: "Redux",
        description: "redux",
        importStatement: `import { useSelector } from 'react-redux'`,
    },
    NONE,
];
const THREES = [
    {
        name: "three",
        // https://threejs.org/manual/#en/installation
        packageName: "three",
        displayName: "Three.js",
        description: "Plain three.js",
        importStatement: `import * as THREE from 'three'`,
    },
    {
        name: "react-three-fiber",
        // https://r3f.docs.pmnd.rs/getting-started/installation
        packageName: "three @react-three/fiber",
        displayName: "Three.js + R3F",
        description: "React Three Fiber",
        importStatement: `import { Canvas } from '@react-three/fiber'`,
    },
    {
        name: "none",
        packageName: "",
        displayName: "None",
        description: "None",
        importStatement: "",
    },
    NONE,
];
const REACT_THREES = [
    {
        name: "drei",
        // https://github.com/pmndrs/drei
        packageName: "@react-three/drei",
        displayName: "Drei",
        description: "Drei",
        importStatement: `import { OrbitControls, Environment, useGLTF, useScroll, useTransform, useFrame, useThree } from '@react-three/drei'`,
    },
    {
        name: "react-three-postprocessing",
        // https://github.com/pmndrs/react-postprocessing
        packageName: "@react-three/postprocessing",
        displayName: "React Three Postprocessing",
        description: "React Three Postprocessing",
        importStatement: `import { EffectComposer, Bloom, ChromaticAberration, DotScreen, SMAA, SSAO, Vignette } from '@react-three/postprocessing'`,
    },
];
const CREATIVE = [
    {
        name: "leva",
        // https://github.com/pmndrs/leva?tab=readme-ov-file#installation
        packageName: "leva",
        displayName: "Leva",
        description: "leva",
        importStatement: `import { useControls } from 'leva'`,
    },
    {
        name: "lenis",
        // https://github.com/darkroomengineering/lenis?tab=readme-ov-file#installation
        packageName: "lenis",
        displayName: "Lenis",
        description: "lenis",
        importStatement: `import { useLenis } from 'lenis'`,
    },
    {
        name: "gesture",
        // https://github.com/pmndrs/use-gesture#installation
        packageName: "gesture",
        displayName: "Gesture",
        description: "gesture",
        importStatement: `import { useGesture } from 'gesture'`,
    },
    NONE,
];
const PM = [
    {
        name: "npm",
        install: ["install"],
        add: (dev) => (dev ? ["install", "-D"] : ["install"]),
        addPkgs: (pkgs, dev) => dev ? ["install", "-D", ...pkgs] : ["install", ...pkgs],
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
    {
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
        runDev: "pnpm dev",
    },
    {
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
        runDev: "yarn dev",
    },
    {
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
        runDev: "bun dev",
    },
];
const DEFAULTS = {
    packageManager: detectDefaultPM(),
    useTailwind: true,
    animation: undefined,
    stateManagement: undefined,
    three: undefined,
    reactThree: undefined,
    creative: undefined,
    projectName: "",
};
function detectDefaultPM() {
    const userAgent = process.env.npm_config_user_agent || "";
    const pm = PM.find((pm) => userAgent.startsWith(pm.name)) ||
        PM.find((pm) => pm.name === "npm");
    if (!pm)
        throw new Error("No package manager found");
    return pm;
}
async function isCommandAvailable(cmd) {
    try {
        await execa(cmd, ["--version"], { stdio: "ignore" });
        return true;
    }
    catch {
        return false;
    }
}
function parseFlags(argv) {
    const args = yargsParser(argv, {
        string: ["name"],
        configuration: { "camel-case-expansion": true },
    });
    return args.name
        ? {
            projectName: args.name,
        }
        : {};
}
async function createViteProject(projectRoot, pm) {
    await execa(pm.name, pm.createVite(path.basename(projectRoot)), {
        stdio: "inherit",
    });
}
async function addDeps(projectRoot, pm, deps = [], devDeps = []) {
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
async function promptState(initial) {
    const selectHint = "Return ↵ to submit";
    const multiselectHint = "Space to select, Return ↵ to submit";
    const response = await prompts([
        {
            type: initial.projectName.length > 0 ? null : "text",
            name: "projectName",
            message: "Project name",
            initial: initial.projectName || DEFAULTS.projectName,
            hint: selectHint,
            validate: (v) => v && v.trim().length > 0 ? true : "Please enter a project name",
        },
        {
            type: "select",
            name: "packageManager",
            message: "Choose package manager",
            choices: PM.map((v) => ({ title: v.name, value: v })),
            initial: Math.max(0, PM.indexOf(initial.packageManager ||
                DEFAULTS.packageManager)),
            hint: selectHint,
        },
        {
            type: "select",
            name: "animation",
            message: "Choose animation library",
            choices: ANIMATIONS.map((v) => ({
                title: v.displayName,
                value: v.packageName,
            })),
            initial: ANIMATIONS.indexOf(initial.animation || DEFAULTS.animation),
            hint: selectHint,
        },
        {
            type: "select",
            name: "state",
            message: "Choose state management",
            choices: STATE_MANAGEMENTS.map((v) => ({
                title: v.displayName,
                value: v.packageName,
            })),
            initial: STATE_MANAGEMENTS.indexOf(initial.stateManagement ||
                DEFAULTS.stateManagement),
            hint: selectHint,
        },
        {
            type: "select",
            name: "three",
            message: "Choose 3D stack",
            choices: THREES.map((v) => ({
                title: v.displayName,
                value: v.packageName,
            })),
            initial: THREES.indexOf(initial.three || DEFAULTS.three),
            hint: selectHint,
        },
        {
            type: (prev) => prev == THREES.find((v) => v.packageName == "react-three-fiber")
                ? "multiselect"
                : null,
            name: "react-three",
            message: "Choose react-three stack",
            choices: REACT_THREES.map((v) => ({
                title: v.displayName,
                value: v.packageName,
                selected: true,
            })),
            hint: selectHint,
        },
        {
            type: Array.isArray(initial.creative) && initial.creative.length
                ? null
                : "multiselect",
            name: "creative",
            message: "Add creative coding helpers?",
            hint: multiselectHint,
            choices: CREATIVE.map((v) => ({ title: v.displayName, value: v })),
        },
    ], {
        onCancel: () => {
            console.log(kleur.red("✖ Aborted."));
            process.exit(1);
        },
    });
    return {
        ...DEFAULTS,
        ...initial,
        ...response,
    };
}
const summarize = (state) => [
    `${kleur.bold().cyan("Project Name")}: ${state.projectName}`,
    `${kleur.bold().cyan("Package Manager")}: ${state.packageManager}`,
    `${kleur.bold().cyan("Tailwind")}: ${state.useTailwind}`,
    `${kleur.bold().cyan("Animation Libraries")}: ${state.animation}`,
    `${kleur.bold().cyan("State Management")}: ${state.stateManagement}`,
    `${kleur.bold().cyan("3D/Graphics")}: ${state.three} ${state.reactThree?.length ? state.reactThree.join(", ") : "None"}`,
    `${kleur.bold().cyan("Creative tools")}: ${state.creative?.length ? state.creative.join(", ") : "None"}`,
].join("\n");
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
    await fs.writeFile(path.join(projectRoot, "vite.config.ts"), viteConfig, "utf8");
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
    await fs.writeFile(path.join(projectRoot, "tailwind.config.ts"), tailwindConfig, "utf8");
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
// function renderAppTsx(state: WizardState): string {
//   const imports = new Set<string>([
//     "import React, { useEffect, useMemo, useRef, useState } from 'react'",
//   ]);
//   // Animation imports
//   if (state.animation) {
//     imports.add(state.animation.importStatement);
//   }
//   // StateManagement imports
//   if (state.stateManagement) {
//     imports.add(state.stateManagement.importStatement);
//   }
//   if (state.three) {
//     imports.add(state.three.importStatement);
//   }
//   // React Three imports
//   if (state.reactThree) {
//     state.reactThree.forEach((pkg) => {
//       imports.add(pkg.importStatement);
//     });
//   }
//   if (state.creative) {
//     state.creative.forEach((pkg) => {
//       imports.add(pkg.importStatement);
//     });
//   }
//   const lines: string[] = [];
//   lines.push([...imports].join("\n"));
//   lines.push("\n");
//   // StateManagement setup blocks
//   if (state.stateManagement === "zustand") {
//     lines.push(`type CounterState = { count: number; inc: () => void }`);
//     lines.push(
//       `const useCounterStore = create<CounterState>((set) => ({ count: 0, inc: () => set((s) => ({ count: s.count + 1 })) }))`
//     );
//   }
//   if (state.stateManagement === "jotai") {
//     lines.push(`const countAtom = atom(0)`);
//   }
//   if (state.stateManagement === "valtio") {
//     lines.push(`const stateProxy = proxy({ count: 0 })`);
//   }
//   if (state.stateManagement === "redux") {
//     lines.push(
//       `const slice = createSlice({ name: 'counter', initialState: { value: 0 }, reducers: { inc: (s) => { s.value += 1 } } })`
//     );
//     lines.push(
//       `const store = configureStore({ reducer: { counter: slice.reducer } })`
//     );
//   }
//   // Helper components for R3F
//   if (state.three === "r3f") {
//     lines.push(
//       `function SpinningBox({ color = '#4f46e5' }: { color?: string }) {`
//     );
//     lines.push(`  const ref = useRef<THREE.Mesh>(null!)`);
//     lines.push(
//       `  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta })`
//     );
//     lines.push(
//       `  return (\n    <mesh ref={ref}>\n      <boxGeometry args={[1,1,1]} />\n      <meshStandardMaterial color={color} />\n    </mesh>\n  )`
//     );
//     lines.push(`}`);
//   }
//   // Main component start
//   lines.push(`export default function App() {`);
//   if (state.creative?.includes("leva")) {
//     lines.push(
//       `  const { color, speed } = useControls({ color: '#4f46e5', speed: { value: 1, min: 0, max: 4, step: 0.1 } })`
//     );
//   }
//   if (state.animation === "gsap") {
//     lines.push(`  const titleRef = useRef<HTMLHeadingElement>(null)`);
//     lines.push(
//       `  useEffect(() => { if (titleRef.current) gsap.fromTo(titleRef.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }) }, [])`
//     );
//   }
//   if (state.animation === "react-spring") {
//     lines.push(
//       `  const styles = useSpring({ from: { opacity: 0, y: -16 }, to: { opacity: 1, y: 0 }, config: { tension: 200, friction: 18 } })`
//     );
//   }
//   if (state.stateManagement === "zustand") {
//     lines.push(`  const count = useCounterStore((s) => s.count)`);
//     lines.push(`  const inc = useCounterStore((s) => s.inc)`);
//   }
//   if (state.stateManagement === "jotai") {
//     lines.push(`  const [count, setCount] = useAtom(countAtom)`);
//   }
//   if (state.stateManagement === "valtio") {
//     lines.push(`  const snap = useSnapshot(stateProxy)`);
//   }
//   if (state.stateManagement === "redux") {
//     lines.push(`  const dispatch = useDispatch()`);
//     lines.push(`  const count = useSelector((s: any) => s.counter.value)`);
//   }
//   if (state.creative?.includes("lenis")) {
//     lines.push(
//       `  useEffect(() => { const lenis = new Lenis({ smoothWheel: true }); const raf = (t:number)=>{ lenis.raf(t); requestAnimationFrame(raf) }; requestAnimationFrame(raf); return () => { /* lenis has no destroy */ } }, [])`
//     );
//   }
//   if (state.creative?.includes("gesture")) {
//     lines.push(`  const [dragX, setDragX] = useState(0)`);
//     lines.push(
//       `  const bind = useDrag(({ offset: [x] }) => setDragX(x), { axis: 'x' })`
//     );
//   }
//   const titleEl = (() => {
//     const text = "create-creative-app";
//     if (state.animation === "motion")
//       return `<motion.h1 className=\"text-3xl font-bold\" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>${text}</motion.h1>`;
//     if (state.animation === "gsap")
//       return `<h1 ref={titleRef} className=\"text-3xl font-bold\">${text}</h1>`;
//     if (state.animation === "react-spring")
//       return `<animated.h1 style={styles as any} className=\"text-3xl font-bold\">${text}</animated.h1>`;
//     return `<h1 className=\"text-3xl font-bold\">${text}</h1>`;
//   })();
//   const counterEl = (() => {
//     if (state.stateManagement === "zustand")
//       return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={inc}>Count: {count}</button>`;
//     if (state.stateManagement === "jotai")
//       return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={() => setCount((c)=>c+1)}>Count: {count}</button>`;
//     if (state.stateManagement === "valtio")
//       return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={() => stateProxy.count++}>Count: {snap.count}</button>`;
//     if (state.stateManagement === "redux")
//       return `<button className=\"mt-4 px-3 py-2 rounded bg-indigo-600 text-white\" onClick={() => dispatch(slice.actions.inc())}>Count: {count}</button>`;
//     return "";
//   })();
//   lines.push("  return (");
//   if (state.stateManagement === "redux") {
//     lines.push("    <Provider store={store}>");
//   }
//   lines.push(
//     `    <div className=\"flex min-h-dvh flex-col items-center justify-center gap-6 p-8\">`
//   );
//   lines.push(`      ${titleEl}`);
//   lines.push(
//     `      <p className=\"text-sm opacity-70\">Vite + React${
//       state.useTailwind ? " + TailwindCSS" : ""
//     }${state.three !== "none" ? " + 3D" : ""}</p>`
//   );
//   if (state.creative?.includes("gesture")) {
//     lines.push(
//       `      <div {...bind()} className=\"select-none rounded border p-4\">Drag me → {Math.round(dragX)}</div>`
//     );
//   }
//   if (counterEl) lines.push(`      ${counterEl}`);
//   if (state.three === "r3f") {
//     const colorExpr = state.creative?.includes("leva")
//       ? "{color}"
//       : `'#4f46e5'`;
//     lines.push(
//       `      <div className=\"h-[300px] w-full max-w-3xl rounded border\">`
//     );
//     lines.push(`        <Canvas camera={{ position: [2.5, 2.5, 2.5] }}>`);
//     lines.push(`          <ambientLight intensity={0.5} />`);
//     lines.push(`          <directionalLight position={[3,3,3]} />`);
//     lines.push(`          <SpinningBox color=${colorExpr} />`);
//     lines.push(`          <OrbitControls enableDamping />`);
//     lines.push(`        </Canvas>`);
//     lines.push(`      </div>`);
//   }
//   lines.push("    </div>");
//   if (state.stateManagement === "redux") lines.push("    </Provider>");
//   lines.push("  )");
//   lines.push("}");
//   return lines.join("\n");
// }
// async function writeAppTsx(
//   projectRoot: string,
//   state: WizardState
// ): Promise<void> {
//   const appPath = path.join(projectRoot, "src", "App.tsx");
//   const content = renderAppTsx(state);
//   await fs.writeFile(appPath, content, "utf8");
// }
function computeDeps(state) {
    const deps = [];
    const devDeps = [];
    // Animations
    return { deps, devDeps };
}
async function ensurePmAvailable(pm) {
    const available = await isCommandAvailable(pm.name);
    if (!available) {
        console.log(kleur.yellow(`⚠ ${pm.name} is not installed. Falling back to npm.`));
        const npm = PM.find((pm) => pm.name === "npm");
        if (!npm)
            throw new Error("npm not found");
        return npm;
    }
    return pm;
}
async function main() {
    const flags = parseFlags(process.argv.slice(2));
    const initialState = { ...DEFAULTS, ...flags };
    const state = await promptState(initialState);
    await ensurePmAvailable(state.packageManager);
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
    }
    catch (err) {
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
    }
    catch (err) {
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
        }
        catch (err) {
            twSpinner.fail("Failed to configure Tailwind");
            console.error(err);
            process.exit(1);
        }
    }
    // Write App.tsx and template extras
    const filesSpinner = ora("Scaffolding example files").start();
    try {
        // await writeAppTsx(projectRoot, state);
        filesSpinner.succeed("Example files ready");
    }
    catch (err) {
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
    return pm.runDev;
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
