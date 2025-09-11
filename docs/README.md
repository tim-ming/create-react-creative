## Developer Guide

This document is for contributors working on the CLI and scaffold template.

### Repository Layout

- `src/` — TypeScript CLI source. Entry: `src/index.ts`; shared helpers in `src/lib/`.
- `template/` — Vite + React (TS) app scaffold that the CLI copies and customizes.
- `dist/` — Built CLI bundle (via `@vercel/ncc`). `npm run build` to generate, automated in CI.

- `__tests__/` — Integration and publish tests run via Vitest.
- `docs/` — Developer documentation (this file).
- `.github/workflows/` — CI pipelines (lint, tests, publishing, release).

### Install & Common Scripts

```bash
npm ci                 # install dependencies
npm run build          # bundle CLI → dist/
npm run create         # run built CLI (node dist/index.js)
npm run lint           # eslint check
npm run lint:fix       # eslint fix
npm run format         # prettier write
npm run format:check   # prettier check

# Tests
npm run test:ci        # unit + integration suites
npm run test:integration
npm run test:publish   # runs Verdaccio publish tests (see CI)
```

### Local Development Workflow

1. Make changes in `src/**` (CLI) and/or `template/**` (scaffold files).
2. Build the CLI: `npm run build`.
3. Run locally in a test directory:

```bash
# From repo root
node index.js           # launches the CLI from dist/index.js

# Or create into a temp folder
TMP=$(mktemp -d) && (cd "$TMP" && node /path/to/repo/index.js)
```

Tip: You can also install globally from a local tarball for end‑to‑end testing:

```bash
npm pack                 # creates create-react-creative-*.tgz
npm i -g ./create-react-creative-*.tgz
create-react-creative    # runs the globally installed CLI
```

### Coding Style

- TypeScript strict mode (see `tsconfig.json`).
- Formatting: Prettier (2 spaces, single quotes, 120 width).
- Linting: ESLint (TypeScript). Unused variables must be `_`‑prefixed.

### Testing

We use Vitest projects configured in `vitest.config.js`:

- `unit` — `src/lib/**/__tests__/*.test.ts`
- `integration` — `__tests__/*.test.ts` (minus publish)
- `publish` — `__tests__/publish.test.ts` (expects a registry, see CI)

Run locally:

```bash
npm run test:ci
# or
vitest run --project unit --project integration
```

To run a single test:

```bash
vitest run __tests__/cli.int.test.ts
```

### Template Notes

- The scaffold uses a path alias: `@` → `src/` (see `template/tsconfig.json` and `vite.config.ts`).
- When adding template options, make sure imports and paths respect the `@` alias and update user docs in the repo `README.md`.
- The CLI performs AST edits to `App.tsx` using Babel to insert selected components — see `src/index.ts` near `setupAppTsxAST`.

### CI Pipelines

- `lint-format.yml` — Prettier and ESLint on push/PR.
- `pr.yml` — Matrix tests for supported Node versions.
- `test-publish.yml` — Spins up Verdaccio, publishes, installs, and runs publish tests.
- `semantic-release.yml` — Automated versioning and publishing (see below).
- `sync-engines-node.yml` — Keeps `engines.node` in sync with upstream guidance.

### Releases (semantic-release)

Automated versioning, changelog, GitHub Releases, and npm publishing are handled by semantic‑release.

- Commit messages must follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`).
- On push to `main`, the workflow analyzes commits, determines the next version, updates `CHANGELOG.md`, publishes to npm, and creates a GitHub Release.
- Configure branches and plugins in `.releaserc.json` (and optional `release.config.js`).

### Contributing

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `build:`, `test:`.

### TODO:

- [ ] Update badges on README
- [ ] Update generated templates
- [ ] Screenshot Banner
- [ ] Stackblitz Template
- [ ] Test CI pipeline
- [ ] Test Publish pipeline
- [ ] So many more things to do, will update this section
