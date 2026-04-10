---
phase: 01-build-pipeline-hardening
plan: 01
subsystem: infra
tags: [ci, pnpm, node, astro, typescript, build]
requires: []
provides:
  - Canonical fail-fast toolchain precheck wired into root build gate
  - Deterministic @tsparticles/astro dist artifact generation with declarations
  - CI workflow contract pinned to .nvmrc + packageManager + frozen lockfile
affects: [phase-02-runtime-safety-guards, phase-03-test-and-quality-gates]
tech-stack:
  added: []
  patterns: [root build:ci explicit ordering, repo-scripted CI checks under scripts/ci]
key-files:
  created:
    - .nvmrc
    - scripts/ci/verify-toolchain.mjs
    - scripts/ci/build-package.mjs
    - components/astro/tsconfig.build.json
  modified:
    - .github/workflows/nodejs.yml
    - package.json
    - components/astro/package.json
key-decisions:
  - "Use .nvmrc as canonical Node source and enforce pnpm version from packageManager before build stages."
  - "Package build outputs dist artifacts plus declaration files and validates required outputs before success."
patterns-established:
  - "Pattern: CI and local share the same repository scripts for deterministic gate behavior."
requirements-completed: [BLD-01]
duration: 22min
completed: 2026-04-10
---

# Phase 1 Plan 01: Build Foundation Summary

**Fail-fast root build gate now verifies Node/pnpm contracts first and produces deterministic `@tsparticles/astro` dist artifacts with declarations.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-10T18:56:00Z
- **Completed:** 2026-04-10T19:02:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Added canonical `.nvmrc` and toolchain precheck script with remediation-focused mismatch diagnostics.
- Replaced placeholder package build scripts with real dist/declaration artifact generation and verification.
- Updated GitHub Actions workflow to consume repo-defined Node/pnpm contracts and frozen lockfile install.

## Task Commits

1. **Task 1: Add canonical toolchain contract and fail-fast precheck** - `0809b5e` (feat)
2. **Task 2 (TDD RED): failing package build artifact tests** - `66af5ca` (test)
3. **Task 2 (TDD GREEN): deterministic package build implementation** - `9edeacb` (feat)

## Files Created/Modified
- `.nvmrc` - Canonical Node version for local and CI.
- `scripts/ci/verify-toolchain.mjs` - Fail-fast Node/pnpm precheck against repo declarations.
- `scripts/ci/build-package.mjs` - Dist artifact build and required output verification.
- `components/astro/tsconfig.build.json` - Declaration-only emit config for published types.
- `components/astro/package.json` - Real build scripts and dist-based export/types/files contract.
- `package.json` - Ordered root `build:ci` with explicit precheck and package/app build steps.
- `.github/workflows/nodejs.yml` - `.nvmrc` and packageManager-driven toolchain setup with frozen lockfile.

## Decisions Made
- Enforced Node major parity via `.nvmrc` while requiring exact pnpm version match from `packageManager`.
- Required build script artifact verification (`index.js`, `index.d.ts`, `src/Particles.astro`) as part of build success.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added local `*.astro` module declaration for declaration emit**
- **Found during:** Task 2
- **Issue:** `tsc -p tsconfig.build.json` failed resolving Astro module type declarations.
- **Fix:** Added `components/astro/src/astro-component.d.ts` and included it in build tsconfig.
- **Files modified:** `components/astro/src/astro-component.d.ts`, `components/astro/tsconfig.build.json`
- **Verification:** `pnpm --filter @tsparticles/astro run build:ci` succeeds.
- **Committed in:** `9edeacb`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary to make declaration generation functional and keep deterministic build behavior.

## Issues Encountered
- None beyond the blocking type-resolution issue auto-fixed during Task 2.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Tarball validation can now operate on real dist artifacts.
- Root and CI flows now share a deterministic, fail-fast toolchain/build baseline.

## Self-Check: PASSED
