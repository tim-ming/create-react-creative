#!/usr/bin/env node

import path from "node:path";
import fs from "fs-extra";
import process from "node:process";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import { execa } from "execa";
import kleur from "kleur";
import OPTIONS, { NONE } from "./constants.js";
import type { PackageManagerPackage, PackageOption } from "./types.js";
import { parse } from "jsonc-parser";
import {
  copyDirSafe,
  detectDefaultPM,
  ensurePmAvailable,
  extractExportName,
  flattenObjectValues,
  getAllRelativeFilePaths,
  parseFlags,
} from "./helpers.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCAFFOLD_ROOT = path.resolve(
  __dirname,
  "../src/development/src/scaffold"
);
interface WizardState {
  projectName: string;
  packageManager: PackageManagerPackage;
  scaffold: {
    animation: PackageOption;
    stateManagement: PackageOption;
    three: PackageOption;
    reactThree: PackageOption[];
    creative: PackageOption[];
  };
}

const DEFAULTS: WizardState = {
  packageManager: detectDefaultPM(),
  scaffold: {
    animation: NONE,
    stateManagement: NONE,
    three: NONE,
    reactThree: [],
    creative: [],
  },
  projectName: "",
};

async function createViteProject(
  projectRoot: string,
  pm: PackageManagerPackage
) {
  try {
    await execa(pm.name, pm.commands.createVite(path.basename(projectRoot)), {
      stdio: "pipe",
    });
  } catch (err: any) {
    console.error(err.stderr || err.message);
    throw err;
  }
}

async function promptState(initial: WizardState): Promise<WizardState> {
  p.intro(kleur.cyan("Create your project ⚡"));

  const {
    projectName,
    packageManager,
    animation,
    stateManagement,
    three,
    reactThree,
    creative,
  } = await p.group(
    {
      projectName: async () =>
        initial.projectName ||
        p.text({
          message: "Project name:",
          placeholder: "my-app",
          validate: (v) => {
            if (v.trim().length === 0) return "Please enter a project name";
            const targetDir = path.resolve(process.cwd(), v.trim());
            if (fs.existsSync(targetDir)) {
              return `A directory named "${v}" already exists here. Please choose another name.`;
            }
            return undefined;
          },
        }),

      packageManager: () =>
        p.select({
          message: "Select a package manager:",
          initialValue: initial.packageManager,
          options: OPTIONS.PACKAGE_MANAGERS.map((pm) => ({
            label: pm.cli.color(pm.cli.displayName),
            value: pm,
            hint: pm.cli.description,
          })),
        }),

      animation: () =>
        p.select({
          message: "Choose an animation library:",
          initialValue: initial.scaffold.animation,
          options: OPTIONS.ANIMATIONS.map((a) => ({
            label: a.cli.color(a.cli.displayName),
            value: a,
            hint: a.cli.description,
          })),
        }),

      stateManagement: () =>
        p.select({
          message: "Choose a state management library:",
          initialValue: initial.scaffold.stateManagement,
          options: OPTIONS.STATE_MANAGEMENTS.map((s) => ({
            label: s.cli.color(s.cli.displayName),
            value: s,
            hint: s.cli.description,
          })),
        }),

      three: () =>
        p.select({
          message: "Add 3D graphics library?",
          initialValue: initial.scaffold.three,
          options: OPTIONS.THREES.map((t) => ({
            label: t.cli.color(t.cli.displayName),
            value: t,
            hint: t.cli.description,
          })),
        }),

      reactThree: async ({ results }) => {
        if (results.three?.name == "react-three-fiber") {
          return p.multiselect({
            message: "Add React Three helpers?",
            initialValues: initial.scaffold.reactThree?.map((r) => r) ?? [],
            options: OPTIONS.REACT_THREES.map((r) => ({
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
          message: "Add creative coding helpers?",
          initialValues: initial.scaffold.creative?.map((c) => c) ?? [],
          options: OPTIONS.CREATIVE.map((c) => ({
            label: c.cli.color(c.cli.displayName),
            value: c,
            hint: c.cli.description,
          })),
          required: false,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    }
  );

  p.outro(kleur.green("✔ Project setup complete!"));

  return {
    ...initial,
    projectName,
    packageManager,
    scaffold: {
      animation,
      stateManagement,
      three,
      reactThree: reactThree as PackageOption[],
      creative,
    },
  };
}

const summarize = (state: WizardState): string => {
  const graphics = [
    state.scaffold.three?.cli.displayName,
    ...(state.scaffold.reactThree?.map((r) => r.cli.displayName) ?? []),
  ].filter(Boolean);

  const graphicsLine =
    graphics.length > 0
      ? `${kleur.bold().cyan("3D/Graphics")}: ${graphics.join(", ")}`
      : "";

  return [
    `${kleur.bold().cyan("Project Name")}: ${state.projectName}`,
    `${kleur.bold().cyan("Package Manager")}: ${
      state.packageManager.cli.displayName
    }`,
    `${kleur
      .bold()
      .cyan("Automatically Included")}: ${"Tailwind, Path Aliasing"}`,
    `${kleur.bold().cyan("Animation Libraries")}: ${
      state.scaffold.animation.cli.displayName
    }`,
    `${kleur.bold().cyan("State Management")}: ${
      state.scaffold.stateManagement.cli.displayName
    }`,
    graphicsLine,
    `${kleur.bold().cyan("Creative tools")}: ${
      state.scaffold.creative.length
        ? state.scaffold.creative.map((c) => c.cli.displayName).join(", ")
        : "None"
    }`,
  ].join("\n");
};

async function setupTailwind(projectRoot: string): Promise<void> {
  const viteConfigPath = path.join(projectRoot, "vite.config.ts");
  let viteConfig = await fs.readFile(viteConfigPath, "utf8");

  if (!viteConfig.includes("tailwindcss")) {
    viteConfig =
      `import tailwindcss from '@tailwindcss/vite'
` + viteConfig;
  }

  viteConfig = viteConfig.replace(
    /plugins:\s*\[([^\]]*)\]/s,
    (match, plugins) => {
      if (plugins.includes("tailwindcss()")) return match;
      return `plugins: [${plugins.trim()}${
        plugins.trim() ? ", " : ""
      }tailwindcss()]`;
    }
  );

  await fs.writeFile(viteConfigPath, viteConfig, "utf8");

  const scaffoldCssPath = path.join(SCAFFOLD_ROOT, "index.css");
  const indexCssPath = path.join(projectRoot, "src", "index.css");
  await fs.copyFile(scaffoldCssPath, indexCssPath);
}

async function setupPathAlias(projectRoot: string) {
  // add tsconfigPaths to vite.config.ts
  const viteConfigPath = path.join(projectRoot, "vite.config.ts");
  let viteConfig = "";

  try {
    viteConfig = await fs.readFile(viteConfigPath, "utf8");
  } catch {
    throw new Error("vite.config.ts not found");
  }

  if (!viteConfig.includes("tsconfigPaths")) {
    viteConfig =
      `import tsconfigPaths from "vite-tsconfig-paths";
` + viteConfig;
  }

  viteConfig = viteConfig.replace(
    /plugins:\s*\[([^\]]*)\]/s,
    (match, plugins) => {
      if (plugins.includes("tsconfigPaths()")) return match;
      return `plugins: [${plugins.trim()}${
        plugins.trim() ? ", " : ""
      }tsconfigPaths()]`;
    }
  );

  await fs.writeFile(viteConfigPath, viteConfig, "utf8");

  // add path alias to tsconfig.app.json
  const tsconfigPath = path.join(projectRoot, "tsconfig.app.json");
  let tsconfigRaw = "";
  try {
    tsconfigRaw = await fs.readFile(tsconfigPath, "utf8");
  } catch {
    throw new Error("tsconfig.app.json not found");
  }

  const tsconfig = parse(tsconfigRaw);
  tsconfig.compilerOptions ??= {};
  tsconfig.compilerOptions.paths ??= {};
  tsconfig.compilerOptions.paths["@/*"] = ["./src/*"];

  await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2), "utf8");
}

async function setupSvgPlugin(projectRoot: string) {
  // add svgr to vite.config.ts
  const viteConfigPath = path.join(projectRoot, "vite.config.ts");
  let viteConfig = "";

  try {
    viteConfig = await fs.readFile(viteConfigPath, "utf8");
  } catch {
    throw new Error("vite.config.ts not found");
  }

  if (!viteConfig.includes("vite-plugin-svgr")) {
    viteConfig =
      `import svgr from "vite-plugin-svgr";
` + viteConfig;
  }

  viteConfig = viteConfig.replace(
    /plugins:\s*\[([^\]]*)\]/s,
    (match, plugins) => {
      if (plugins.includes("svgr()")) return match;
      return `plugins: [${plugins.trim()}${plugins.trim() ? ", " : ""}svgr()]`;
    }
  );

  await fs.writeFile(viteConfigPath, viteConfig, "utf8");

  const viteEnvPath = path.join(projectRoot, "src", "vite-env.d.ts");
  let viteEnv = "";
  try {
    viteEnv = await fs.readFile(viteEnvPath, "utf8");
  } catch {
    // ignore
  }

  const line = '/// <reference types="vite-plugin-svgr/client" />';
  if (!viteEnv.includes(line)) {
    viteEnv = viteEnv + "\n" + line;
  }

  await fs.writeFile(viteEnvPath, viteEnv, "utf8");
}

async function setupAppTsx(
  projectRoot: string,
  state: WizardState
): Promise<void> {
  const scaffoldAppPath = path.join(SCAFFOLD_ROOT, "App.tsx");
  const projectAppPath = path.join(projectRoot, "src", "App.tsx");
  let content = "";

  // read from scaffold app.tsx
  content = await fs.readFile(scaffoldAppPath, "utf8");
  const imports = new Set<string>();
  const gridComponents: string[] = [];
  const effectsComponents: string[] = [];

  // add components into App.tsx
  for (const pkg of flattenObjectValues(state.scaffold)) {
    if (!pkg.demo) continue;
    // get all relative file paths in the demo.source directory
    const paths = await getAllRelativeFilePaths(
      path.join(SCAFFOLD_ROOT, pkg.demo.source)
    );
    // sole file name with .tsx extension (NOT PATH)
    const tsxFiles = paths.filter((p) => p.endsWith(".tsx"));

    if (tsxFiles.length === 0) {
      throw new Error(`No tsx components found in ${pkg.demo.source}`);
    }
    if (tsxFiles.length > 1) {
      throw new Error(`Multiple tsx components found in ${pkg.demo.source}`);
    }

    // get default export name as the component name for import and usage
    const exportName = extractExportName(
      await fs.readFile(
        path.join(SCAFFOLD_ROOT, pkg.demo.source, tsxFiles[0]),
        "utf8"
      )
    );
    if (!exportName) {
      throw new Error(
        `Could not extract export name from ${path.join(
          pkg.demo.source,
          tsxFiles[0]
        )}`
      );
    }

    const importComponents = {
      path: tsxFiles[0].replace(".tsx", ""),
      componentName: exportName,
    };

    const importStatement = `import ${importComponents.componentName} from '@/${importComponents.path}';`;
    imports.add(importStatement);
    if (pkg.demo.insertion === "GRID") {
      gridComponents.push(`<${importComponents.componentName} />`);
    } else if (pkg.demo.insertion === "EFFECTS") {
      effectsComponents.push(`<${importComponents.componentName} />`);
    }
  }

  // === Add missing imports at the top ===
  const existingImports: string[] = content.match(/import .+ from .+;/g) || [];
  const newImports = [...imports].filter(
    (imp) => !existingImports.includes(imp)
  );

  if (newImports.length > 0) {
    content = newImports.join("\n") + "\n" + content;
  }

  // === Insert components into grid ===
  content = content.replace(
    /(^[ \t]*)<Grid>([\s\S]*?)<\/Grid>/m,
    (match, indent, inner) => {
      const existing = inner.trim();

      // children should be indented one level deeper than <Grid>
      const childIndent = indent + "  ";

      const updated = [existing, ...gridComponents]
        .filter(Boolean)
        .map((c) => childIndent + c)
        .join("\n");

      return `${indent}<Grid>\n${updated}\n${indent}</Grid>`;
    }
  );

  // === Insert components into effects ===
  content = content.replace(
    /(^[ \t]*)<Effects>([\s\S]*?)<\/Effects>/m,
    (match, indent, inner) => {
      const existing = inner.trim();

      // children should be indented one level deeper than <Effects>
      const childIndent = indent + "  ";

      const updated = [existing, ...effectsComponents]
        .filter(Boolean)
        .map((c) => childIndent + c)
        .join("\n");

      return `${indent}<Effects>\n${updated}\n${indent}</Effects>`;
    }
  );
  // write to project app.tsx
  await fs.writeFile(projectAppPath, content, "utf8");
}

const runSetup = async (
  projectRoot: string,
  state: WizardState,
  noInstall: boolean
) => {
  const steps: {
    startMessage: string;
    endMessage: string;
    errorMessage: string;
    action: () => Promise<void>;
  }[] = [
    {
      startMessage: "Creating Vite + React (TS) project",
      endMessage: "Vite project created",
      errorMessage: "Failed to create Vite project",
      action: () => createViteProject(projectRoot, state.packageManager),
    },
    {
      startMessage: noInstall
        ? "Adding dependencies"
        : "Installing selected dependencies",
      endMessage: noInstall ? "Dependencies added!" : "Dependencies installed!",
      errorMessage: "Failed to install dependencies",
      action: () => installDeps(projectRoot, state, noInstall),
    },
    {
      startMessage: "Configuring TailwindCSS",
      endMessage: "Tailwind configured",
      errorMessage: "Failed to configure Tailwind",
      action: () => setupTailwind(projectRoot),
    },
    {
      startMessage: "Configuring path alias and tsconfig",
      endMessage: "Path alias and tsconfig configured",
      errorMessage: "Failed to configure path alias and tsconfig",
      action: () => setupPathAlias(projectRoot),
    },
    {
      startMessage: "Configuring SVG plugin",
      endMessage: "SVG plugin configured",
      errorMessage: "Failed to configure SVG plugin",
      action: () => setupSvgPlugin(projectRoot),
    },
    {
      startMessage: "Scaffolding example files",
      endMessage: "Example files scaffolded",
      errorMessage: "Failed to scaffold example files",
      action: () => scaffoldExampleFiles(projectRoot, state),
    },
    {
      startMessage: "Updating App.tsx",
      endMessage: "App.tsx updated",
      errorMessage: "Failed to update App.tsx",
      action: () => setupAppTsx(projectRoot, state),
    },
  ];

  for (const step of steps) {
    const spinner = p.spinner();
    spinner.start(step.startMessage);

    try {
      await step.action();
      spinner.stop(step.endMessage);
    } catch (err) {
      spinner.stop(step.errorMessage);
      console.error(err);
      process.exit(1);
    }
  }
};

async function scaffoldExampleFiles(projectRoot: string, state: WizardState) {
  // copy scaffold demo files
  for (const pkg of flattenObjectValues(state.scaffold)) {
    if (!pkg.demo) continue;
    copyDirSafe(
      path.join(SCAFFOLD_ROOT, pkg.demo.source),
      path.join(projectRoot, "src")
    );
  }
}

async function installDeps(
  projectRoot: string,
  state: WizardState,
  noInstall: boolean
) {
  const devDeps = [
    "tailwindcss",
    "@tailwindcss/vite",
    "vite-tsconfig-paths",
    "vite-plugin-svgr",
  ];

  const deps = flattenObjectValues(state.scaffold)
    .flatMap((pkg) => pkg.packageName.split(" "))
    .filter(Boolean);

  const install = async (packages: string[], isDev: boolean) =>
    packages.length > 0 &&
    execa(
      state.packageManager.name,
      state.packageManager.commands.addPkgs(packages, isDev),
      {
        cwd: projectRoot,
        stdio: "inherit",
      }
    );
  if (noInstall) return;
  await install(deps, false);
  await install(devDeps, true);
}

async function main() {
  const { name, noInstall } = parseFlags(process.argv.slice(2));
  const initialState: WizardState = { ...DEFAULTS, projectName: name };
  const state = await promptState(initialState);

  await ensurePmAvailable(state.packageManager);

  const projectRoot = path.resolve(process.cwd(), state.projectName);
  if (await fs.pathExists(projectRoot)) {
    p.cancel(kleur.red(`✖ Directory already exists: ${projectRoot}`));
    process.exit(1);
  }

  p.note(summarize(state), "Summary");

  await runSetup(projectRoot, state, noInstall);

  p.outro(kleur.bold().green("✔ Project ready!"));
  console.log("\nNext steps:");
  console.log(`  1. cd ${state.projectName}`);
  if (!noInstall) {
    console.log("  2.", state.packageManager.commands.runDev);
  } else {
    console.log("  2. npm install ");
    console.log("  3.", state.packageManager.commands.runDev);
  }
  console.log("\nGet creative and happy building ✨");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
