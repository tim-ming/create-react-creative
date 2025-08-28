#!/usr/bin/env node
import path from "node:path";
import fs from "fs-extra";
import process from "node:process";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import { execa } from "execa";
import kleur from "kleur";
import yargsParser from "yargs-parser";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NONE = {
    name: "none",
    packageName: "",
    importStatement: "",
    cli: {
        color: kleur.gray,
        displayName: "none",
        hint: "",
        description: "",
    },
};
// ---------------- Package Managers ----------------
const PACKAGE_MANAGERS = [
    {
        name: "npm",
        packageName: "npm",
        cli: {
            displayName: "npm",
            description: "Node Package Manager",
            hint: "",
            color: kleur.red,
        },
        commands: {
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
    },
    {
        name: "pnpm",
        packageName: "pnpm",
        cli: {
            displayName: "pnpm",
            description: "PNPM",
            hint: "",
            color: kleur.magenta,
        },
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
    {
        name: "yarn",
        packageName: "yarn",
        cli: {
            displayName: "yarn",
            description: "Yarn",
            hint: "",
            color: kleur.cyan,
        },
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
    {
        name: "bun",
        packageName: "bun",
        cli: {
            displayName: "bun",
            description: "Bun",
            hint: "",
            color: kleur.yellow,
        },
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
];
// ---------------- Animations ----------------
const ANIMATIONS = [
    NONE,
    {
        name: "gsap",
        packageName: "gsap",
        importStatement: `import { gsap } from 'gsap'`,
        cli: {
            displayName: "GSAP",
            description: "GreenSock Animation Platform",
            hint: "",
            color: kleur.green,
        },
    },
    {
        name: "motion",
        packageName: "motion",
        importStatement: `import { motion } from 'motion/react'`,
        cli: {
            displayName: "motion (framer-motion)",
            description: "A production-grade animation library for React, JavaScript, and Vue.",
            hint: "",
            color: kleur.blue,
        },
    },
    {
        name: "react-spring",
        packageName: "@react-spring/web",
        importStatement: `import { useSpring, animated } from '@react-spring/web'`,
        cli: {
            displayName: "react-spring",
            description: "Open-source spring-physics first animation library",
            hint: "",
            color: kleur.magenta,
        },
    },
];
// ---------------- State Management ----------------
const STATE_MANAGEMENTS = [
    NONE,
    {
        name: "zustand",
        packageName: "zustand",
        importStatement: `import { create } from 'zustand'`,
        cli: {
            displayName: "Zustand",
            description: "zustand",
            hint: "",
            color: kleur.green,
        },
    },
    {
        name: "jotai",
        packageName: "jotai",
        importStatement: `import { atom } from 'jotai'`,
        cli: {
            displayName: "Jotai",
            description: "jotai",
            hint: "",
            color: kleur.cyan,
        },
    },
    {
        name: "valtio",
        packageName: "valtio",
        importStatement: `import { useSnapshot } from 'valtio'`,
        cli: {
            displayName: "Valtio",
            description: "valtio",
            hint: "",
            color: kleur.yellow,
        },
    },
    {
        name: "redux",
        packageName: "redux",
        importStatement: `import { useSelector } from 'react-redux'`,
        cli: {
            displayName: "Redux",
            description: "redux",
            hint: "",
            color: kleur.red,
        },
    },
];
// ---------------- Three.js / R3F ----------------
const THREES = [
    NONE,
    {
        name: "three",
        packageName: "three",
        importStatement: `import * as THREE from 'three'`,
        cli: {
            displayName: "Vanilla three.js",
            description: "Plain three.js",
            hint: "",
            color: kleur.magenta,
        },
    },
    {
        name: "react-three-fiber",
        packageName: "@react-three/fiber",
        importStatement: `import { Canvas } from '@react-three/fiber'`,
        cli: {
            displayName: "react-three-fiber",
            description: "React Three Fiber",
            hint: "",
            color: kleur.blue,
        },
    },
];
// ---------------- R3F Helpers ----------------
const REACT_THREES = [
    {
        name: "drei",
        packageName: "@react-three/drei",
        importStatement: `import { OrbitControls, Environment, useGLTF, useScroll, useTransform, useFrame, useThree } from '@react-three/drei'`,
        cli: {
            displayName: "drei",
            description: "R3F utilities",
            hint: "",
            color: kleur.cyan,
        },
    },
    {
        name: "react-three-postprocessing",
        packageName: "@react-three/postprocessing",
        importStatement: `import { EffectComposer, Bloom, ChromaticAberration, DotScreen, SMAA, SSAO, Vignette } from '@react-three/postprocessing'`,
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
        importStatement: `import { useControls } from 'leva'`,
        cli: {
            displayName: "leva",
            description: "GUI controls for React",
            hint: "",
            color: kleur.red,
        },
    },
];
// ---------------- Creative ----------------
const CREATIVE = [
    {
        name: "lenis",
        packageName: "lenis",
        importStatement: `import { useLenis } from 'lenis'`,
        cli: {
            displayName: "lenis",
            description: "Smooth scroll library",
            hint: "",
            color: kleur.magenta,
        },
    },
    {
        name: "@use-gesture/react",
        packageName: "@use-gesture/react",
        importStatement: `import { useGesture } from '@use-gesture/react'`,
        cli: {
            displayName: "@use-gesture/react",
            description: "The only gesture lib you'll need",
            hint: "",
            color: kleur.green,
        },
    },
];
const DEFAULTS = {
    packageManager: detectDefaultPM(),
    useTailwind: true,
    animation: NONE,
    stateManagement: NONE,
    three: NONE,
    reactThree: [],
    creative: [],
    projectName: "",
};
function detectDefaultPM() {
    const userAgent = process.env.npm_config_user_agent || "";
    const pm = PACKAGE_MANAGERS.find((pm) => userAgent.startsWith(pm.name)) ||
        PACKAGE_MANAGERS.find((pm) => pm.name === "npm");
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
    try {
        const { stdout, stderr } = await execa(pm.name, pm.commands.createVite(path.basename(projectRoot)), {
            stdio: "pipe",
        });
        // optionally store logs somewhere
        // console.log(stdout); // don’t log unless you want to
    }
    catch (err) {
        console.error(err.stderr || err.message);
        throw err;
    }
}
async function addDeps(projectRoot, pm, deps = [], devDeps = []) {
    if (deps.length) {
        await execa(pm.name, pm.commands.addPkgs(deps, false), {
            cwd: projectRoot,
            stdio: "inherit",
        });
    }
    if (devDeps.length) {
        await execa(pm.name, pm.commands.addPkgs(devDeps, true), {
            cwd: projectRoot,
            stdio: "inherit",
        });
    }
}
async function promptState(initial) {
    const selectHint = "Return ↵ to confirm";
    const multiselectHint = "Space to select, Return ↵ to confirm";
    p.intro(kleur.cyan("Create your project ⚡"));
    // Project name
    const projectName = initial.projectName ||
        (await p.text({
            message: "Project name:",
            placeholder: "my-app",
            validate: (v) => {
                if (v.trim().length === 0)
                    return "Please enter a project name";
                const targetDir = path.resolve(process.cwd(), v.trim());
                if (fs.existsSync(targetDir)) {
                    return `A directory named "${v}" already exists here. Please choose another name.`;
                }
                return undefined;
            },
        }));
    if (p.isCancel(projectName))
        process.exit();
    // Package manager
    const packageManager = await p.select({
        message: "Select a package manager:",
        initialValue: initial.packageManager,
        options: PACKAGE_MANAGERS.map((pm) => ({
            label: pm.cli.color(pm.cli.displayName),
            value: pm,
            hint: pm.cli.description,
        })),
    });
    if (p.isCancel(packageManager))
        process.exit();
    // Animation library
    const animation = await p.select({
        message: "Choose an animation library:",
        initialValue: initial.animation,
        options: ANIMATIONS.map((a) => ({
            label: a.cli.color(a.cli.displayName),
            value: a,
            hint: a.cli.description,
        })),
    });
    if (p.isCancel(animation))
        process.exit();
    // State management
    const stateManagement = await p.select({
        message: "Choose a state management library:",
        initialValue: initial.stateManagement,
        options: STATE_MANAGEMENTS.map((s) => ({
            label: s.cli.color(s.cli.displayName),
            value: s,
            hint: s.cli.description,
        })),
    });
    if (p.isCancel(stateManagement))
        process.exit();
    // Three.js / R3F
    const three = await p.select({
        message: "Add 3D graphics library?",
        initialValue: initial.three,
        options: THREES.map((t) => ({
            label: t.cli.color(t.cli.displayName),
            value: t,
            hint: t.cli.description,
        })),
    });
    if (p.isCancel(three))
        process.exit();
    // Extra helpers if react-three-fiber
    const reactThree = await (async () => {
        if (three.name === "react-three-fiber") {
            const rt = await p.multiselect({
                message: "Add React Three helpers?",
                initialValues: initial.reactThree?.map((r) => r) ?? [],
                options: REACT_THREES.map((r) => ({
                    label: r.cli.color(r.cli.displayName),
                    value: r,
                    hint: r.cli.description,
                })),
                required: false,
            });
            if (p.isCancel(rt))
                process.exit();
            return rt;
        }
        return [];
    })();
    // Creative coding extras
    const creative = await p.multiselect({
        message: "Add creative coding helpers?",
        initialValues: initial.creative?.map((c) => c) ?? [],
        options: CREATIVE.map((c) => ({
            label: c.cli.color(c.cli.displayName),
            value: c,
            hint: c.cli.description,
        })),
        required: false,
    });
    if (p.isCancel(creative))
        process.exit();
    p.outro(kleur.green("✔ Project setup complete!"));
    return {
        ...initial,
        projectName,
        packageManager,
        animation,
        stateManagement,
        three,
        reactThree,
        creative,
    };
}
const summarize = (state) => [
    `${kleur.bold().cyan("Project Name")}: ${state.projectName}`,
    `${kleur.bold().cyan("Package Manager")}: ${state.packageManager.cli.displayName}`,
    `${kleur.bold().cyan("Tailwind")}: ${state.useTailwind ? "Yes" : "No"}`,
    `${kleur.bold().cyan("Animation Libraries")}: ${state.animation.cli.displayName}`,
    `${kleur.bold().cyan("State Management")}: ${state.stateManagement.cli.displayName}`,
    `${kleur.bold().cyan("3D/Graphics")}: ${state.three.cli.displayName} ${state.reactThree.length
        ? state.reactThree.map((r) => r.cli.displayName).join(", ")
        : "None"}`,
    `${kleur.bold().cyan("Creative tools")}: ${state.creative.length
        ? state.creative.map((c) => c.cli.displayName).join(", ")
        : "None"}`,
].join("\n");
// https://tailwindcss.com/docs/installation/using-vite
async function setupTailwind(projectRoot, state) {
    const deps = ["tailwindcss", "@tailwindcss/vite"];
    await addDeps(projectRoot, state.packageManager, deps, []);
    const viteConfigPath = path.join(projectRoot, "vite.config.ts");
    let viteConfig = "";
    try {
        viteConfig = await fs.readFile(viteConfigPath, "utf8");
    }
    catch {
        // fallback if vite.config.ts doesn’t exist
        viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;
    }
    // Ensure `import tailwindcss`
    if (!viteConfig.includes("tailwindcss")) {
        viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
    }
    // Insert tailwindcss() into plugins if not already present
    viteConfig = viteConfig.replace(/plugins:\s*\[([^\]]*)\]/s, (match, plugins) => {
        if (plugins.includes("tailwindcss()"))
            return match; // already there
        return `plugins: [${plugins.trim()}${plugins.trim() ? ", " : ""}tailwindcss()]`;
    });
    await fs.writeFile(viteConfigPath, viteConfig, "utf8");
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
    const css = `@import "tailwindcss";

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
        const npm = PACKAGE_MANAGERS.find((pm) => pm.name === "npm");
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
        p.cancel(kleur.red(`✖ Directory already exists: ${projectRoot}`));
        process.exit(1);
    }
    p.note(summarize(state), "Summary");
    // --- Creating Vite project
    const viteTask = p.spinner();
    viteTask.start("Creating Vite + React (TS) project");
    try {
        await createViteProject(projectRoot, state.packageManager);
        viteTask.stop("Vite project created");
    }
    catch (err) {
        viteTask.stop("Failed to create Vite project");
        console.error(err);
        process.exit(1);
    }
    // --- Adding deps
    const { deps, devDeps } = computeDeps(state);
    const depsTask = p.spinner();
    depsTask.start("Adding selected dependencies");
    try {
        await addDeps(projectRoot, state.packageManager, deps, devDeps);
        depsTask.stop("Dependencies added");
    }
    catch (err) {
        depsTask.stop("Failed to add dependencies");
        console.error(err);
        process.exit(1);
    }
    // --- Tailwind
    if (state.useTailwind) {
        const twTask = p.spinner();
        twTask.start("Configuring TailwindCSS");
        try {
            await setupTailwind(projectRoot, state);
            twTask.stop("Tailwind configured");
        }
        catch (err) {
            twTask.stop("Failed to configure Tailwind");
            console.error(err);
            process.exit(1);
        }
    }
    // --- Scaffolding example files
    const filesTask = p.spinner();
    filesTask.start("Scaffolding example files");
    try {
        // await writeAppTsx(projectRoot, state);
        filesTask.stop("Example files ready");
    }
    catch (err) {
        filesTask.stop("Failed to scaffold files");
        console.error(err);
        process.exit(1);
    }
    p.outro(kleur.bold().green("✔ Project ready!"));
    console.log("\nNext steps:");
    console.log(`  1. cd ${state.projectName}`);
    console.log("  2.", runDevCmd(state.packageManager));
    console.log("\nHappy building ✨");
}
function runDevCmd(pm) {
    return pm.commands.runDev;
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
