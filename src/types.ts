import kleur from "kleur";

interface PackageOption {
  name: string;
  packageName: string;
  cli: {
    color: kleur.Color;
    displayName: string;
    hint: string;
    description: string;
  };
  demo?: {
    insertion: "GRID" | "EFFECTS";
    source: string;
    destination: string; // not used
  };
}

interface PackageManagerConfig {
  install: string[];
  add: (dev: boolean) => string[];
  addPkgs: (pkgs: string[], dev: boolean) => string[];
  createVite: (projectName: string) => string[];
  runDev: string;
}

type PackageManagerPackage = PackageOption & {
  commands: PackageManagerConfig;
};

export type { PackageOption, PackageManagerConfig, PackageManagerPackage };
