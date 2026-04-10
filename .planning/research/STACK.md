# Stack Research

**Domain:** Astro component-library maintenance and release stabilization in a TypeScript pnpm monorepo
**Researched:** 2026-04-10
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Node.js | 22.12+ LTS | Runtime and CI baseline | Astro 6 requires Node `>=22.12.0`; standardizing on Node 22 LTS removes class-of-bugs from mixed Node versions across local/CI/release jobs. | HIGH |
| Astro | 6.1.5 | Demo app framework + package consumer target | Keep package validation aligned to the current Astro major used by consumers; Astro CLI also provides `astro check` for CI diagnostics. | HIGH |
| TypeScript | 6.0.2 | Authoring and type safety | Current TS brings better ESM/package typing behavior and keeps pace with Astro/Vite ecosystem expectations for modern package exports. | HIGH |
| pnpm workspaces | 10.33.0 | Monorepo dependency management and workspace linking | `workspace:` protocol and strict linking are the current best practice for multi-package repos; reduces accidental registry drift and enforces local package contracts. | HIGH |
| Changesets | @changesets/cli 2.30.0 | Versioning/changelog/release orchestration | pnpm docs explicitly recommend Changesets for workspace release workflows; it is the de facto standard for JS/TS monorepos publishing multiple packages. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| Vitest | 4.1.4 | Unit/integration tests for package logic | Use for component lifecycle, options parsing, and failure-path tests. Fast Vite-native runner; ideal as default test layer. | HIGH |
| @vitest/coverage-v8 | 4.1.4 | Coverage in CI | Use to enforce minimum coverage gates on package runtime paths and regressions. | HIGH |
| @playwright/test | 1.59.1 | E2E tests for demo app + packaged behavior | Use for browser-level confidence (mounts, runtime errors, network/URL behavior) across Chromium/WebKit/Firefox in CI. | HIGH |
| @astrojs/check | 0.9.8 | Astro-aware diagnostics | Use in CI (`astro check`) to catch `.astro` and integration typing issues before publish. | HIGH |
| ESLint + Astro/TS plugins | eslint 10.2.0, eslint-plugin-astro 1.7.0, @typescript-eslint/* 8.58.1 | Static analysis and bug prevention | Use for correctness and maintainability rules (not formatting). Essential for hardening an existing package. | HIGH |
| Prettier + Astro plugin | prettier 3.8.2, prettier-plugin-astro 0.14.1 | Consistent formatting | Use as dedicated formatter; keep formatting out of ESLint for speed and fewer rule conflicts. | HIGH |
| eslint-config-prettier | 10.1.8 | Disable formatting lint rule overlap | Use when ESLint presets/plugins bring formatting rules that conflict with Prettier. | HIGH |
| publint | 0.3.18 | Package publish quality linting | Run on built package artifacts before release to catch export/entry/package.json compatibility issues. | HIGH |
| @arethetypeswrong/cli | 0.18.2 | Type export correctness validation | Run against packed tarball (`--pack`) in CI to detect ESM/CJS typing and export map mistakes before publish. | HIGH |
| npm-package-json-lint | 10.2.0 | package.json policy enforcement | Use to enforce required publish metadata (`exports`, `files`, `engines`, repository fields, etc.) consistently. | MEDIUM |

### Development Tools

| Tool | Purpose | Notes | Confidence |
|------|---------|-------|------------|
| GitHub Actions + changesets/action@v1 | Automated version PRs and publish pipeline | Standard 2025-2026 monorepo release flow: changeset files in PRs, release PR on main, publish on merge. | HIGH |
| npm provenance (`npm publish --provenance`) | Supply-chain attestation | For npm packages, provenance is now a baseline release-hardening control; prefer trusted publishing/OIDC where possible. | HIGH |
| Nx | 22.6.4 | Task graph execution and CI optimization | Keep Nx for scalable task orchestration/caching if already present; prefer one orchestrator path to reduce complexity. | MEDIUM |
| Husky + lint-staged | husky 9.1.7, lint-staged 16.4.0 | Pre-commit quality gate | Use for quick local checks (format/lint/tests) only; keep full validation in CI as source of truth. | MEDIUM |

## Installation

```bash
# Core
pnpm add -Dw typescript@6.0.2 @changesets/cli@2.30.0

# Supporting
pnpm add -Dw vitest@4.1.4 @vitest/coverage-v8@4.1.4 @playwright/test@1.59.1 @astrojs/check@0.9.8 publint@0.3.18 @arethetypeswrong/cli@0.18.2 npm-package-json-lint@10.2.0

# Dev dependencies
pnpm add -Dw eslint@10.2.0 eslint-plugin-astro@1.7.0 @typescript-eslint/parser@8.58.1 @typescript-eslint/eslint-plugin@8.58.1 prettier@3.8.2 prettier-plugin-astro@0.14.1 eslint-config-prettier@10.1.8 husky@9.1.7 lint-staged@16.4.0
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Changesets | semantic-release (25.0.3) | Use semantic-release only for single-package, commit-convention-driven repos where auto-calculated versioning is preferred over explicit per-package release intents. |
| Playwright | Cypress | Use Cypress only if the team already has deep Cypress investment; otherwise Playwright is better aligned with modern cross-browser CI and lower vendor lock-in. |
| ESLint + Prettier split | eslint-plugin-prettier-in-ESLint | Use plugin-in-ESLint only if you require one-command formatting errors in lint output; expect slower lint runs. |
| pnpm workspaces + `workspace:` | npm/yarn workspaces | Use npm/yarn only when org tooling mandates it; for this repo pnpm is already established and stronger for strict workspace linking. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Lerna-centric release/version flow as primary path | Adds overlapping release logic with Changesets and increases operational ambiguity in publish pipelines. | Keep Lerna only for temporary task compatibility; standardize release/versioning on Changesets. |
| `npm publish` from local developer machines | No reproducible build provenance and inconsistent environment parity. | Publish only from CI with OIDC/trusted publishing and provenance enabled. |
| ESLint formatting rules as the formatter | Slower lint cycles and more fixer conflicts; typescript-eslint explicitly recommends dedicated formatters. | Prettier (+ `eslint-config-prettier`). |
| Shipping package without package-quality checks | High risk of broken `exports`/types for consumers despite local demo working. | Add `publint` + `attw` checks on packed artifact in CI. |

## Stack Patterns by Variant

**If the goal is stabilization without major repo retooling:**
- Keep pnpm + Nx + existing workspace structure.
- Add hardening layers in this order: `astro check` -> lint/typecheck -> Vitest -> Playwright -> `publint`/`attw` -> Changesets release.
- Because this minimizes migration risk while closing the current build/test/release gaps quickly.

**If the goal is long-term release automation maturity:**
- Use `changesets/action@v1` to create version PRs and publish on merge.
- Enforce provenance/trusted publishing and block manual publishes.
- Because it creates auditable, repeatable releases with explicit package-level change intent.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| astro@6.1.5 | node@>=22.12.0 | Astro engine requirement should be enforced in CI matrix and `engines`. |
| vitest@4.1.4 | node@^20 \|\| ^22 \|\| >=24 | Node 22 satisfies Vitest; keeps parity with Astro requirement. |
| @playwright/test@1.59.1 | node@>=18 | Compatible with Node 22 baseline; use one Node version across jobs for reproducibility. |
| pnpm@10.33.0 | node@>=18.12 | Compatible with Node 22; pin `packageManager` to lock CLI behavior. |

## Sources

- https://docs.astro.build/en/guides/testing/ - Astro recommends Vitest for unit/integration and Playwright for E2E; verified current docs. (HIGH)
- https://docs.astro.build/en/reference/cli-reference/ - `astro check` is CI-oriented diagnostics command. (HIGH)
- https://docs.astro.build/en/guides/integrations/ - Astro component package guidance and workspace-based development model. (HIGH)
- https://pnpm.io/workspaces - `workspace:` protocol behavior and publishing transformation details. (HIGH)
- https://pnpm.io/using-changesets - pnpm-endorsed Changesets workflow and GitHub Action integration. (HIGH)
- https://github.com/changesets/changesets - Changesets scope and monorepo version/changelog design. (HIGH)
- https://github.com/changesets/action - Automated version PR/publish action details. (HIGH)
- https://vitest.dev/guide/ - Vitest current requirements and Vite-native test model. (HIGH)
- https://playwright.dev/docs/intro - Playwright current cross-browser CI model and Node support policy. (HIGH)
- https://publint.dev/docs/ - Package compatibility linting role and CI usage. (HIGH)
- https://github.com/arethetypeswrong/arethetypeswrong.github.io/tree/main/packages/cli - ATTW CLI checks for package type/export correctness. (HIGH)
- https://typescript-eslint.io/users/what-about-formatting/ - Rationale for Prettier over ESLint formatting rules. (HIGH)
- https://docs.npmjs.com/generating-provenance-statements - npm provenance and CI/OIDC release hardening. (HIGH)
- npm registry metadata via `npm view` on 2026-04-10 for versions and engines: Astro, TypeScript, pnpm, Vitest, Playwright, ESLint, Prettier, Changesets, publint, ATTW, Nx, etc. (HIGH)

---
*Stack research for: Astro component-library maintenance and release stabilization*
*Researched: 2026-04-10*
