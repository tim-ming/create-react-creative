# create-creative-app

Interactive wizard to scaffold a creative Vite + React app with Tailwind, animations, 3D, and creative tools.

## Usage

```bash
npx create-creative-app
```

### Flags

- `--full` Full preset (Tailwind, Framer Motion, Zustand, R3F stack, Leva, Lenis, use-gesture, tailwind-animate, vite-plugin-glsl)
- `--minimal` Minimal preset (Vite + React + Tailwind only)
- `--no-install` Skip dependency installation
- `--template=portfolio|shader` Start from a preset use case
- `--pm=npm|pnpm|yarn|bun` Choose package manager
- `--name=my-project` Set project name non-interactively

### Local dev

```bash
node ./bin/create-creative-app.mjs --name my-app --minimal --no-install
```
