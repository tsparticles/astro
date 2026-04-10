# Codebase Structure

**Analysis Date:** 2026-04-10

## Directory Layout

```text
astro/
├── apps/                      # Runnable applications in the monorepo
│   └── astro/                 # Astro demo app consuming the component package
├── components/                # Reusable libraries/packages
│   └── astro/                 # Published package `@tsparticles/astro`
├── .github/workflows/         # CI pipeline definitions
├── .planning/codebase/        # Generated architecture/quality planning docs
├── package.json               # Root workspace scripts and tool dependencies
├── pnpm-workspace.yaml        # Workspace package globs
├── lerna.json                 # Lerna orchestration config
└── nx.json                    # Nx task caching/defaults
```

## Directory Purposes

**`apps/astro/`:**
- Purpose: Host demo application and integration example for the package.
- Contains: Astro app config, route/layout/component files, public static files, local build output.
- Key files: `apps/astro/src/pages/index.astro`, `apps/astro/src/layouts/Layout.astro`, `apps/astro/src/components/Card.astro`, `apps/astro/astro.config.mjs`, `apps/astro/package.json`.

**`apps/astro/src/pages/`:**
- Purpose: File-based routes.
- Contains: Route-level `.astro` pages.
- Key files: `apps/astro/src/pages/index.astro`.

**`apps/astro/src/layouts/`:**
- Purpose: Shared document/page wrappers.
- Contains: Layout `.astro` files with `<slot />`.
- Key files: `apps/astro/src/layouts/Layout.astro`.

**`apps/astro/src/components/`:**
- Purpose: App-local presentational components.
- Contains: UI fragments used by pages.
- Key files: `apps/astro/src/components/Card.astro`.

**`components/astro/`:**
- Purpose: Source of reusable package `@tsparticles/astro`.
- Contains: Package metadata, exported entrypoint, component implementation.
- Key files: `components/astro/index.ts`, `components/astro/src/Particles.astro`, `components/astro/package.json`.

**`components/astro/src/`:**
- Purpose: Internal implementation of the package.
- Contains: Astro component source and local typing declaration.
- Key files: `components/astro/src/Particles.astro`, `components/astro/src/.env.d.ts`.

**`components/`:**
- Purpose: Group reusable packages and architecture notes.
- Contains: Library folders and integration guidance doc.
- Key files: `components/README.ISLAND_PATTERN.md`.

**`.github/workflows/`:**
- Purpose: CI automation.
- Contains: GitHub Actions workflow files.
- Key files: `.github/workflows/nodejs.yml`.

## Key File Locations

**Entry Points:**
- `package.json`: Root build command entry for monorepo orchestration.
- `components/astro/index.ts`: Package export entrypoint for `@tsparticles/astro`.
- `apps/astro/src/pages/index.astro`: Main app route entrypoint (`/`).
- `.github/workflows/nodejs.yml`: CI execution entrypoint.

**Configuration:**
- `pnpm-workspace.yaml`: Defines workspace package locations (`apps/*`, `components/*`).
- `lerna.json`: Defines Lerna package scope/versioning behavior.
- `nx.json`: Defines Nx named inputs and build target defaults.
- `apps/astro/astro.config.mjs`: Astro project config for demo app.
- `apps/astro/tsconfig.json`: Demo app TS strict Astro config extension.
- `components/astro/tsconfig.json`: Package TS base Astro config extension.

**Core Logic:**
- `components/astro/src/Particles.astro`: Custom element wrapper and `tsParticles.load` invocation.
- `apps/astro/src/pages/index.astro`: Example options definition and engine initialization.

**Testing:**
- Not detected (`*.test.*`/`*.spec.*` files are not present in `apps/astro/` or `components/astro/`).

## Naming Conventions

**Files:**
- Astro components/layouts/pages use PascalCase for shared components/layouts and lowercase for route files: `Card.astro`, `Layout.astro`, `index.astro`.
- Package entry file uses lowercase conventional module name: `components/astro/index.ts`.
- Config files use ecosystem-standard names: `astro.config.mjs`, `tsconfig.json`, `typedoc.json`, `package.json`.

**Directories:**
- Workspace-level grouping uses plural domains: `apps/`, `components/`.
- Astro source follows framework defaults: `src/pages/`, `src/layouts/`, `src/components/`.

## Where to Add New Code

**New Feature:**
- Primary code: add reusable particles-related functionality in `components/astro/src/` and export via `components/astro/index.ts`.
- Tests: place alongside implementation in `components/astro/src/` or app-level behavior checks in `apps/astro/src/` (create test setup if introducing tests).

**New Component/Module:**
- Reusable package component: `components/astro/src/<Feature>.astro`.
- Demo-only component: `apps/astro/src/components/<Feature>.astro`.
- New page route: `apps/astro/src/pages/<route>.astro`.

**Utilities:**
- Package-shared helpers for published behavior: `components/astro/src/` (co-located with `Particles.astro`).
- Demo-only helpers: `apps/astro/src/` under a new `utils/` directory.

## Special Directories

**`apps/astro/dist/`:**
- Purpose: Built static output from Astro build.
- Generated: Yes.
- Committed: No (ignored by `apps/astro/.gitignore`).

**`node_modules/` and `apps/astro/node_modules/`:**
- Purpose: Installed dependencies.
- Generated: Yes.
- Committed: No (ignored by `.gitignore` files).

**`.nx/`:**
- Purpose: Nx local cache/workspace data.
- Generated: Yes.
- Committed: No (cache directory content is runtime-generated).

**`.planning/codebase/`:**
- Purpose: Generated architecture/planning knowledge documents for GSD tooling.
- Generated: Yes.
- Committed: Yes (intended to be referenced by planning/execution commands).

---

*Structure analysis: 2026-04-10*
