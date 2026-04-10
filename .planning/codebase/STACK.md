# Technology Stack

**Analysis Date:** 2026-04-10

## Languages

**Primary:**
- TypeScript - package/library entry and component source in `components/astro/index.ts` and `components/astro/src/Particles.astro`
- Astro component syntax - app and component templates in `apps/astro/src/pages/index.astro` and `components/astro/src/Particles.astro`

**Secondary:**
- JavaScript (ES modules) - framework and workspace config in `apps/astro/astro.config.mjs`
- YAML - workspace and CI configuration in `pnpm-workspace.yaml` and `.github/workflows/nodejs.yml`
- JSON - package/orchestration/tooling config in `package.json`, `apps/astro/package.json`, `components/astro/package.json`, `nx.json`, and `lerna.json`

## Runtime

**Environment:**
- Node.js - CI explicitly sets Node 16 in `.github/workflows/nodejs.yml`; lockfile metadata includes many packages requiring Node >=18 in `pnpm-lock.yaml`

**Package Manager:**
- pnpm `10.33.0` declared in root `package.json` (`packageManager` field)
- Lockfile: present (`pnpm-lock.yaml`)

## Frameworks

**Core:**
- Astro `^6.1.5` - app framework for demo site in `apps/astro/package.json`
- tsParticles engine (`@tsparticles/engine` `^3.9.1` in app, `^4.0.0-beta.11` declared in component package) - particle rendering/runtime used by the Astro component (`components/astro/src/Particles.astro`)

**Testing:**
- Not detected (no Jest/Vitest/Playwright/Cypress config found in repository root or workspace packages)

**Build/Dev:**
- Lerna `^8.2.4` - multi-package build orchestration in root `package.json` and `lerna.json`
- Nx `^22.6.4` - alternative task orchestration/caching in root `package.json` and `nx.json`
- Astro CLI - local dev/build in `apps/astro/package.json` scripts (`astro dev`, `astro build`, `astro preview`)
- Parcel (`parcel`, `@parcel/core`, `@parcel/transformer-sass`) - installed at workspace root in `package.json` for tooling/build support

## Key Dependencies

**Critical:**
- `astro` `^6.1.5` - runtime and compiler for the demo application in `apps/astro/package.json`
- `@tsparticles/astro` `workspace:^` - local workspace package consumed by the demo app in `apps/astro/package.json`
- `@tsparticles/engine` - particle engine used directly in both component and demo page (`components/astro/src/Particles.astro`, `apps/astro/src/pages/index.astro`)
- `tsparticles` `^3.9.1` - full loader used in demo page initialization in `apps/astro/src/pages/index.astro`

**Infrastructure:**
- `lerna` - package orchestration/version workflow in `lerna.json`
- `nx` - build target caching in `nx.json`
- `husky` - git hooks dependency declared in root `package.json`
- `@commitlint/cli` and `@commitlint/config-conventional` - conventional commit enforcement dependencies in root `package.json`

## Configuration

**Environment:**
- No runtime environment-variable usage detected in application/component source (`apps/astro/src/**`, `components/astro/src/**`)
- Type references for Astro env typings exist in `apps/astro/src/env.d.ts` and `components/astro/src/.env.d.ts`
- Optional CI token reference is commented in `.github/workflows/nodejs.yml` (`NX_CLOUD_ACCESS_TOKEN`)

**Build:**
- Workspace/package orchestration: `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`
- App framework config: `apps/astro/astro.config.mjs`
- TypeScript config: `apps/astro/tsconfig.json`, `components/astro/tsconfig.json`
- CI pipeline: `.github/workflows/nodejs.yml`

## Platform Requirements

**Development:**
- Node.js + pnpm workspace tooling required via `package.json` and `pnpm-workspace.yaml`
- Monorepo supports both Lerna and Nx execution flows via root scripts in `package.json`

**Production:**
- Astro static/site build output from `apps/astro` (`astro build` script in `apps/astro/package.json`)
- Library package distribution target is npm package `@tsparticles/astro` defined in `components/astro/package.json`

---

*Stack analysis: 2026-04-10*
