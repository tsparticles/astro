# Codebase Concerns

**Analysis Date:** 2026-04-10

## Tech Debt

**Build and packaging pipeline placeholders:**
- Issue: The library package build scripts are placeholders (`"build": "echo build"`, `"build:ci": "echo build:ci"`) instead of producing distributable artifacts.
- Files: `components/astro/package.json`, `package.json`, `.github/workflows/nodejs.yml`
- Impact: CI can report successful builds without validating transpilation/bundling correctness for `@tsparticles/astro`, and package publishing quality depends on raw source compatibility.
- Fix approach: Replace placeholder scripts with real build steps (for example Astro package check + type check + emit step) and enforce them in `build:ci`.

**Version and compatibility drift across workspace packages:**
- Issue: The demo app depends on `@tsparticles/engine` `^3.9.1`, while the component package depends on `^4.0.0-beta.11`.
- Files: `apps/astro/package.json`, `components/astro/package.json`
- Impact: Local validation can pass in one package but fail for consumers because API shape and runtime behavior can differ between major/beta lines.
- Fix approach: Align engine versions across workspace packages and add an automated dependency consistency check in CI.

**Copy/paste configuration debt in docs metadata:**
- Issue: TypeDoc config name is set to `"tsParticles Angular Component"` in Astro packages.
- Files: `apps/astro/typedoc.json`, `components/astro/typedoc.json`
- Impact: Generated docs metadata is misleading and increases maintenance mistakes when publishing or auditing package docs.
- Fix approach: Rename TypeDoc project names to Astro-specific values and validate docs config in CI.

## Known Bugs

**Commitlint hook is misconfigured:**
- Symptoms: Commit message hook runs `commitlint --edit ""` with an empty edit target.
- Files: `.husky/commit-msg`
- Trigger: Any local commit in environments that enforce Husky hooks.
- Workaround: Run `npx commitlint --edit .git/COMMIT_EDITMSG` manually or correct the hook to use `$1`.

**Changelog claims unsupported component props:**
- Symptoms: Changelog states `init` and `loaded` properties are present, but component props only expose `id`, `options`, `url`, `class`, and `style`.
- Files: `components/astro/CHANGELOG.md`, `components/astro/src/Particles.astro`, `apps/astro/CHANGELOG.md`, `CHANGELOG.md`
- Trigger: Consumers implement API from changelog expectations.
- Workaround: Use only currently implemented props until changelog and code are reconciled.

## Security Considerations

**Unvalidated dynamic URL loading in client runtime:**
- Risk: `url` from component props is passed directly to `tsParticles.load`, enabling arbitrary browser-side fetch destinations.
- Files: `components/astro/src/Particles.astro`
- Current mitigation: None detected.
- Recommendations: Validate/allowlist `url` values before passing to runtime and document trusted URL requirements.

**Unsafe JSON parsing of attribute payload:**
- Risk: Raw `JSON.parse` on `data-options` without guard can throw and break initialization path; malformed payloads can produce runtime instability.
- Files: `components/astro/src/Particles.astro`
- Current mitigation: None detected.
- Recommendations: Wrap parse with try/catch, validate schema shape before use, and fail gracefully.

## Performance Bottlenecks

**Large options are serialized into HTML attributes:**
- Problem: `options` are stringified into `data-options` on rendered markup.
- Files: `components/astro/src/Particles.astro`
- Cause: Inline attribute transport duplicates configuration into DOM text and increases HTML payload size.
- Improvement path: Pass options through an inline script payload or deferred client module state, keeping rendered attributes lightweight.

**No lifecycle cleanup for particle instances:**
- Problem: Custom element initializes particles but does not tear down on element removal.
- Files: `components/astro/src/Particles.astro`
- Cause: No `disconnectedCallback` and no tracked instance destroy call.
- Improvement path: Store created container reference and destroy it in teardown lifecycle to avoid leaked canvases/listeners.

## Fragile Areas

**Custom element bootstrap logic is tightly coupled and unguarded:**
- Files: `components/astro/src/Particles.astro`
- Why fragile: Async initialization runs inside constructor, parse/load errors are not handled, and hydration timing issues can break rendering silently.
- Safe modification: Introduce explicit methods (`connectedCallback`, guarded parse, load try/catch, optional retries) and keep constructor side effects minimal.
- Test coverage: No automated tests detected for custom element behavior.

**CI toolchain drift from declared local toolchain:**
- Files: `.github/workflows/nodejs.yml`, `package.json`
- Why fragile: CI pins Node 16 and pnpm 8, while workspace declares pnpm 10 in `packageManager`; CI behavior can diverge from local behavior.
- Safe modification: Standardize CI versions to match declared workspace toolchain and enforce with one source of truth.
- Test coverage: No CI assertion verifies runtime/pnpm version parity.

## Scaling Limits

**Runtime initialization does not include shared engine strategy:**
- Current capacity: Works for single simple demo usage.
- Limit: Multiple particle mounts across pages/components can repeatedly initialize/load with no explicit shared lifecycle management.
- Scaling path: Add a singleton initialization/cache layer and instance lifecycle management for multi-mount scenarios.

## Dependencies at Risk

**Beta dependency in published component:**
- Risk: `@tsparticles/engine` is pinned to a beta major line (`^4.0.0-beta.11`).
- Impact: Upstream beta API or behavior changes can break consumers without stable semver guarantees.
- Migration plan: Move to a stable engine release line and run compatibility tests in `apps/astro` before publish.

## Missing Critical Features

**No automated test suite for package runtime behavior:**
- Problem: No unit/integration/E2E test files or runner config are present for the component package.
- Blocks: Safe refactors of `components/astro/src/Particles.astro`, lifecycle changes, and regression prevention for published releases.

## Test Coverage Gaps

**Component initialization and error-path behavior are untested:**
- What's not tested: Invalid `options` JSON handling, missing `id`, failed `tsParticles.load`, repeated mount/unmount behavior.
- Files: `components/astro/src/Particles.astro`
- Risk: Runtime failures and memory leaks can ship unnoticed.
- Priority: High

**Build/CI contract is untested for real artifact output:**
- What's not tested: Whether `build` scripts emit valid distributable artifacts and whether CI catches packaging regressions.
- Files: `components/astro/package.json`, `package.json`, `.github/workflows/nodejs.yml`
- Risk: Release pipeline can produce incomplete or misleadingly “successful” builds.
- Priority: High

---

*Concerns audit: 2026-04-10*
