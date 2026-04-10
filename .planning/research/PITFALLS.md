# Pitfalls Research

**Domain:** Astro component-library maintenance (package + demo app in monorepo)
**Researched:** 2026-04-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Green CI That Never Builds a Real Package

**What goes wrong:**
CI passes while package build scripts are placeholders (`echo build`), so no distributable artifact is validated before release.

**Why it happens:**
Astro component packages can ship source files directly, so teams skip explicit pack-validation and assume `astro build` in demo is enough.

**How to avoid:**
Replace placeholder scripts with real checks: `pnpm -r build`, `pnpm pack --pack-destination ...`, and an install smoke test that consumes the packed tarball in a fixture app.

**Warning signs:**
- Package `build`/`build:ci` scripts only print text.
- CI runs only demo app build, not `npm pack`/`pnpm pack`.
- No workflow artifact proving package contents.

**Phase to address:**
Phase 1 - Build Pipeline Hardening

---

### Pitfall 2: Runtime Breakage From Cross-Workspace Version Drift

**What goes wrong:**
Demo app works locally with one engine/runtime version while published package depends on a different major/beta line, causing consumer breakage.

**Why it happens:**
Monorepos often mix `workspace:^` links with separately versioned external deps; demo and package drift silently.

**How to avoid:**
Pin and align shared runtime dependencies across package and demo; add CI guard that fails on mismatched major versions for `@tsparticles/engine`/`tsparticles`.

**Warning signs:**
- Package depends on `@tsparticles/engine` v4 beta while demo uses v3.x.
- Frequent "works in demo, fails in consumer" reports.
- Renovate/dependency PRs update only one workspace.

**Phase to address:**
Phase 1 - Build Pipeline Hardening

---

### Pitfall 3: Unsafe JSON Parsing in Client Component Bootstrap

**What goes wrong:**
`JSON.parse` on serialized props throws at runtime, preventing component initialization and potentially breaking page scripts.

**Why it happens:**
Developers trust serialized `data-*` payloads and skip try/catch and fallback paths.

**How to avoid:**
Wrap parse in guarded decoder (`try/catch`), log structured warning, and continue with safe defaults; add unit tests for malformed payload cases.

**Warning signs:**
- Direct `JSON.parse(this.dataset.options)` in component constructor.
- No test that injects invalid options string.
- Browser console shows uncaught syntax errors in initialization.

**Phase to address:**
Phase 2 - Runtime Safety Guards

---

### Pitfall 4: Untrusted Remote Config URL Loading

**What goes wrong:**
Component loads `url` from arbitrary origin, creating SSR/client policy violations and accidental data exfiltration or mixed-content/CORS instability.

**Why it happens:**
`url` prop is treated as convenience only; no allowlist or protocol checks are implemented.

**How to avoid:**
Validate URLs before passing to runtime loader: allow `https:` only by default, block `javascript:`/`data:`, and support optional origin allowlist in component config/docs.

**Warning signs:**
- Any string passed from props to runtime fetch URL without validation.
- Security review flags dynamic external fetches.
- Intermittent CORS/mixed-content failures in consumer environments.

**Phase to address:**
Phase 2 - Runtime Safety Guards

---

### Pitfall 5: Lifecycle Race Conditions in Custom Element Initialization

**What goes wrong:**
Initialization runs in constructor immediately, before expected DOM state or dependencies are ready, causing flaky behavior across navigation/hydration scenarios.

**Why it happens:**
Custom elements are authored with a one-shot async IIFE in constructor and no idempotent lifecycle handling.

**How to avoid:**
Move startup to `connectedCallback`, guard repeated mounts, and add teardown in `disconnectedCallback` for SPA-like navigation behavior.

**Warning signs:**
- Async load starts inside element constructor.
- No disconnection cleanup.
- Duplicate canvases or orphaned particle instances after route transitions.

**Phase to address:**
Phase 2 - Runtime Safety Guards

---

### Pitfall 6: Testing Only Happy Paths in Demo Pages

**What goes wrong:**
Hardening work looks complete, but failures (bad JSON, missing engine init, invalid URL, duplicate IDs) are untested and regressions ship.

**Why it happens:**
Teams rely on visual manual checks in demo app rather than repeatable negative-path tests.

**How to avoid:**
Add layered tests: Vitest component/lifecycle tests, fixture pages for build output checks, and Playwright smoke tests against built preview.

**Warning signs:**
- No test files for component package.
- CI has only `build` and no `test` stage.
- Bugs reappear after refactors despite "verified locally" notes.

**Phase to address:**
Phase 3 - Automated Test Coverage

---

### Pitfall 7: Release Process That Publishes Untested or Wrong Contents

**What goes wrong:**
Published package misses required files or exports incorrect entry points because contents were never inspected as packed tarball.

**Why it happens:**
Maintainers trust repository layout and skip `files`/`exports` validation in release automation.

**How to avoid:**
Introduce release gates: `npm pack` inspection, export map validation, and consumer install smoke test from tarball before publish.

**Warning signs:**
- No `files` allowlist in package manifest.
- Release checklist lacks pack/install verification.
- Post-release issues: "module not found" or missing `.astro` entrypoints.

**Phase to address:**
Phase 4 - Release Readiness and Automation

---

### Pitfall 8: CI/Tooling Baseline Drift (Node, pnpm, Actions Syntax)

**What goes wrong:**
Pipelines become fragile or noisy due to old runtime baselines and deprecated GitHub Actions patterns, masking real failures.

**Why it happens:**
Workflow files are rarely revisited after initial setup.

**How to avoid:**
Set explicit supported Node/pnpm matrix for package consumers, upgrade CI runners/actions regularly, and replace deprecated `::set-output` patterns with `$GITHUB_OUTPUT` files.

**Warning signs:**
- CI locked to old Node while package targets newer Astro ecosystem.
- Deprecated workflow command warnings.
- Build passes locally on modern toolchain but fails in CI.

**Phase to address:**
Phase 1 - Build Pipeline Hardening

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep placeholder package build scripts | Fast initial setup | False confidence in CI and broken releases | Never |
| Validate only demo app behavior | Quick manual feedback | Consumer package quality not guaranteed | MVP prototyping only, not release branch |
| Allow arbitrary remote options URLs | Flexible demos | Security/policy incidents and flaky runtime | Never for published defaults |
| Skip lifecycle teardown | Less code now | Memory leaks and duplicate instances | Never in reusable components |

## "Looks Done But Isn't" Checklist

- [ ] **Build hardening:** CI verifies packed tarball installs in a clean fixture project.
- [ ] **Runtime safety:** Invalid JSON and invalid URL cases are covered by tests and non-fatal at runtime.
- [ ] **Dependency strategy:** Demo and package shared runtime deps match intended major line.
- [ ] **Release readiness:** `exports` and `files` produce correct consumer entrypoints.
- [ ] **Pipeline hygiene:** Workflow avoids deprecated commands and uses current supported Node/pnpm baseline.

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Green CI with fake build scripts | Phase 1 - Build Pipeline Hardening | CI artifact includes successful `pnpm pack` + install smoke test |
| Cross-workspace version drift | Phase 1 - Build Pipeline Hardening | Dependency drift check passes for package/demo shared deps |
| Unsafe JSON parsing | Phase 2 - Runtime Safety Guards | Negative tests confirm malformed options do not crash component |
| Untrusted remote config URLs | Phase 2 - Runtime Safety Guards | URL validation tests reject unsafe protocols/origins |
| Custom element lifecycle races | Phase 2 - Runtime Safety Guards | Mount/unmount tests show idempotent init and cleanup |
| Happy-path-only tests | Phase 3 - Automated Test Coverage | CI includes unit + E2E + negative-path tests |
| Release without pack validation | Phase 4 - Release Readiness and Automation | Pre-publish workflow blocks on pack/export/install checks |
| CI tooling baseline drift | Phase 1 - Build Pipeline Hardening | Workflow lint/check confirms no deprecated patterns |

## Sources

- Project context and active gaps: `/Users/matteo/Projects/GitHub/tsparticles/astro/.planning/PROJECT.md`
- Repository package/workflow state: `/Users/matteo/Projects/GitHub/tsparticles/astro/components/astro/package.json`, `/Users/matteo/Projects/GitHub/tsparticles/astro/apps/astro/package.json`, `/Users/matteo/Projects/GitHub/tsparticles/astro/components/astro/src/Particles.astro`, `/Users/matteo/Projects/GitHub/tsparticles/astro/.github/workflows/nodejs.yml`
- Astro docs (component package structure/testing guidance): https://docs.astro.build/en/guides/integrations/ and https://docs.astro.build/en/guides/testing/
- GitHub Actions deprecation notice (`set-output`): https://github.blog/changelog/2022-10-10-github-actions-deprecating-save-state-and-set-output-commands/

---
*Pitfalls research for: Astro component-library maintenance*
*Researched: 2026-04-10*
