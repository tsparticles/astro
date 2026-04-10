# Architecture

**Analysis Date:** 2026-04-10

## Pattern Overview

**Overall:** Monorepo package + demo app with Astro islands-style client hydration

**Key Characteristics:**
- Workspace orchestration is centralized at repo root using `pnpm` workspaces and Lerna/Nx tasks from `package.json`, `pnpm-workspace.yaml`, `lerna.json`, and `nx.json`.
- Product code is split into a reusable component package at `components/astro/` and a runnable demo app at `apps/astro/`.
- Runtime behavior is hybrid: server-rendered Astro markup from `.astro` files plus browser-only initialization in inline `<script>` blocks (for both page bootstrap and custom element startup).

## Layers

**Workspace Orchestration Layer:**
- Purpose: Build and coordinate projects in the monorepo.
- Location: `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `.github/workflows/nodejs.yml`
- Contains: Workspace definitions, build targets, CI commands.
- Depends on: `pnpm`, `lerna`, `nx`, GitHub Actions.
- Used by: Local development workflows and CI pipelines.

**Component Package Layer (`@tsparticles/astro`):**
- Purpose: Expose a reusable Astro component wrapper for tsParticles.
- Location: `components/astro/index.ts`, `components/astro/src/Particles.astro`, `components/astro/package.json`
- Contains: Package entrypoint, component prop contract, custom element implementation.
- Depends on: `@tsparticles/engine` and Astro component runtime.
- Used by: Demo app page in `apps/astro/src/pages/index.astro` and external consumers importing `@tsparticles/astro`.

**Demo Application Layer (`@tsparticles/astro-demo`):**
- Purpose: Provide a concrete integration example and route rendering.
- Location: `apps/astro/src/pages/index.astro`, `apps/astro/src/layouts/Layout.astro`, `apps/astro/src/components/Card.astro`
- Contains: Route page, layout shell, presentation component, particles options object, engine preset bootstrap script.
- Depends on: `@tsparticles/astro`, `@tsparticles/engine`, `tsparticles`, Astro routing/layout system.
- Used by: Developers validating package behavior through `astro dev` / `astro build`.

**Browser Runtime Layer:**
- Purpose: Instantiate particles on the client after markup is rendered.
- Location: `components/astro/src/Particles.astro` (custom element class + `tsParticles.load`), `apps/astro/src/pages/index.astro` (`loadFull(tsParticles)` bootstrap)
- Contains: Custom element definition (`astro-particles`), `data-*` attribute transport, async engine/plugin initialization.
- Depends on: Browser `customElements`, `dataset`, JSON parsing, tsParticles engine API.
- Used by: Any page rendering `<Particles ... />`.

## Data Flow

**Page-to-Engine Initialization Flow:**

1. `apps/astro/src/pages/index.astro` defines typed particle options (`ISourceOptions`) and imports `Particles` from `@tsparticles/astro`.
2. The same page executes a client script that imports `tsParticles` and runs `loadFull(tsParticles)` from `tsparticles`.
3. `components/astro/src/Particles.astro` receives props (`id`, `options`, `url`, `class`, `style`) and serializes `options` into `data-options` on `<astro-particles>`.
4. The custom element constructor in `components/astro/src/Particles.astro` parses `data-options` and calls `tsParticles.load({ id, options, url })`.
5. tsParticles attaches to the rendered `<canvas>` under the custom element and starts animation.

**State Management:**
- State is local and ephemeral. There is no global app store.
- Configuration state is passed via component props and DOM `data-*` attributes.
- Engine readiness is coordinated by execution order of inline scripts and async initialization, not by explicit shared state containers.

## Key Abstractions

**Package Facade Abstraction:**
- Purpose: Provide a clean import surface for consumers.
- Examples: `components/astro/index.ts`
- Pattern: Single-entry default export (`export default Particles`) acting as a package facade.

**Particles Wrapper Abstraction:**
- Purpose: Translate Astro props into client runtime input.
- Examples: `components/astro/src/Particles.astro`
- Pattern: Thin adapter component that maps typed props to DOM attributes and bootstraps client behavior.

**Document Layout Abstraction:**
- Purpose: Standardize HTML shell and global styles for pages.
- Examples: `apps/astro/src/layouts/Layout.astro`
- Pattern: Layout with typed `Props`, `<slot />`, and global CSS (`<style is:global>`).

**Route Composition Abstraction:**
- Purpose: Compose feature component, layout, and presentational cards in a single route.
- Examples: `apps/astro/src/pages/index.astro`, `apps/astro/src/components/Card.astro`
- Pattern: File-based route imports layout + components and declares view-specific data/config inline.

## Entry Points

**Workspace Build Entry Point:**
- Location: `package.json`
- Triggers: `pnpm run build`, `pnpm run build:ci`, `pnpm run build:lerna`, `pnpm run build:nx`
- Responsibilities: Delegate builds across workspaces via Lerna or Nx.

**Published Package Entry Point:**
- Location: `components/astro/index.ts` and package export map in `components/astro/package.json`
- Triggers: Consumer import `import Particles from "@tsparticles/astro"`
- Responsibilities: Expose `Particles.astro` as the package default export.

**Application Route Entry Point:**
- Location: `apps/astro/src/pages/index.astro`
- Triggers: Astro file-based routing for `/`.
- Responsibilities: Initialize tsParticles presets, render `<Particles />`, and compose page content.

**CI Entry Point:**
- Location: `.github/workflows/nodejs.yml`
- Triggers: Push and pull request events on `main` and `legacy`.
- Responsibilities: Install dependencies and run `npx lerna run build:ci`.

## Error Handling

**Strategy:** Minimal/implicit error propagation from async promises.

**Patterns:**
- Async IIFEs are used without explicit `try/catch` in `apps/astro/src/pages/index.astro` and `components/astro/src/Particles.astro`.
- Runtime failures are delegated to unhandled promise behavior and library/browser diagnostics.

## Cross-Cutting Concerns

**Logging:** No dedicated logging abstraction detected in runtime code (`apps/astro/src/**`, `components/astro/src/**`).
**Validation:** Compile-time typing via TypeScript interfaces (`IParticlesProps`, `ISourceOptions`), with no explicit runtime validation of parsed `data-options`.
**Authentication:** Not applicable; no auth layer detected in `apps/astro/` or `components/astro/`.

---

*Architecture analysis: 2026-04-10*
