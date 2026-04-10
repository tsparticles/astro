# Coding Conventions

**Analysis Date:** 2026-04-10

## Naming Patterns

**Files:**
- Use `PascalCase.astro` for Astro components: `components/astro/src/Particles.astro`, `apps/astro/src/components/Card.astro`, `apps/astro/src/layouts/Layout.astro`.
- Use lowercase `index.*` for package/page entry points: `components/astro/index.ts`, `apps/astro/src/pages/index.astro`.
- Use lowercase config naming with ecosystem defaults: `apps/astro/astro.config.mjs`, `apps/astro/tsconfig.json`, `components/astro/tsconfig.json`.

**Functions:**
- Use `camelCase` for local variables/functions in scripts (`className`, `rawOptions`, `options`) in `components/astro/src/Particles.astro`.
- Use `PascalCase` for class names extending platform APIs (`AstroParticles`) in `components/astro/src/Particles.astro`.

**Variables:**
- Use destructuring from `Astro.props` with explicit renaming when needed (`class: className`) in `components/astro/src/Particles.astro`.
- Use `const` for immutable values (`options`, `title`, `href`) across `apps/astro/src/pages/index.astro`, `apps/astro/src/layouts/Layout.astro`, `apps/astro/src/components/Card.astro`.

**Types:**
- Use `interface` for component props (`IParticlesProps`, `Props`) in `components/astro/src/Particles.astro`, `apps/astro/src/layouts/Layout.astro`, `apps/astro/src/components/Card.astro`.
- Use imported library types for options/contracts (`ISourceOptions`) in `components/astro/src/Particles.astro` and `apps/astro/src/pages/index.astro`.

## Code Style

**Formatting:**
- Tool used: Not detected (`.prettierrc*` and prettier config files are not present in repo root or packages).
- Key settings: Not centrally configured; preserve existing local formatting style per file.
  - `components/astro/src/Particles.astro` uses 4-space indentation in frontmatter and script.
  - `apps/astro/src/layouts/Layout.astro` and `apps/astro/src/components/Card.astro` use tab-indented markup/style blocks.

**Linting:**
- Tool used: Not detected (`.eslintrc*`, `eslint.config.*`, `biome.json` not present).
- Key rules: No repository-level lint rule set detected; follow strict typing posture from `apps/astro/tsconfig.json` (`"extends": "astro/tsconfigs/strict"`).

## Import Organization

**Order:**
1. External package imports first (e.g., `@tsparticles/*`) in `components/astro/src/Particles.astro` and `apps/astro/src/pages/index.astro`.
2. Local Astro component/layout imports next (`../layouts/Layout.astro`, `../components/Card.astro`) in `apps/astro/src/pages/index.astro`.
3. Type imports grouped with imports and expressed with `import type` (`ISourceOptions`, `Container`, `Engine`) in `components/astro/src/Particles.astro` and `apps/astro/src/pages/index.astro`.

**Path Aliases:**
- Package imports use scoped workspace package names (`@tsparticles/astro`, `@tsparticles/engine`) in `apps/astro/src/pages/index.astro`.
- TS path aliases in `tsconfig.json`: Not detected.

## Error Handling

**Patterns:**
- Error boundaries/`try...catch`: Not detected in runtime code files.
- Async initialization is handled with awaited IIFEs and optimistic flow (no local recovery branch) in `components/astro/src/Particles.astro` and `apps/astro/src/pages/index.astro`.
- Defensive optional parsing pattern is used before consuming dataset options (`rawOptions ? JSON.parse(rawOptions) : undefined`) in `components/astro/src/Particles.astro`.

## Logging

**Framework:** console (not used in application runtime files).

**Patterns:**
- Runtime logging statements (`console.*`) are not present in `components/astro/src/Particles.astro` and `apps/astro/src/**/*.astro`.
- CI logs rely on command output in `.github/workflows/nodejs.yml`.

## Comments

**When to Comment:**
- Use concise comments for configuration intent and reference links (e.g., `// https://astro.build/config` in `apps/astro/astro.config.mjs`, workflow comments in `.github/workflows/nodejs.yml`).
- Keep component runtime files mostly self-descriptive with minimal comments (`components/astro/src/Particles.astro` has none).

**JSDoc/TSDoc:**
- Not detected in source files (`components/astro/index.ts`, `components/astro/src/Particles.astro`, `apps/astro/src/**/*.astro`).

## Function Design

**Size:**
- Keep logic compact and colocated in component frontmatter/script blocks; runtime behavior currently fits inside single small component files (`components/astro/src/Particles.astro`, `apps/astro/src/pages/index.astro`).

**Parameters:**
- Prefer typed props interfaces plus destructuring assignment from `Astro.props` (`IParticlesProps`, `Props`) in `components/astro/src/Particles.astro` and `apps/astro/src/components/Card.astro`.

**Return Values:**
- Astro component modules return markup templates, not explicit function returns (`apps/astro/src/layouts/Layout.astro`, `apps/astro/src/components/Card.astro`).
- Script async IIFEs resolve promises and perform side effects without returned value usage in `components/astro/src/Particles.astro` and `apps/astro/src/pages/index.astro`.

## Module Design

**Exports:**
- Use default export for package public entry (`export default Particles;`) in `components/astro/index.ts`.
- Export prop interfaces from components where types are part of local module contract (`IParticlesProps` in `components/astro/src/Particles.astro`).

**Barrel Files:**
- Minimal barrel usage: single package-level entry file in `components/astro/index.ts`.

---

*Convention analysis: 2026-04-10*
