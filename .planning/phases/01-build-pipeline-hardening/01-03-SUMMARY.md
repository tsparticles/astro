---
phase: 01-build-pipeline-hardening
plan: 03
subsystem: infra
tags: [ci, dependency-drift, semver, pnpm, astro]
requires:
  - phase: 01-build-pipeline-hardening
    provides: Canonical build gate and tarball validation from plans 01-01/01-02
provides:
  - Shared runtime dependency major-version drift checker script
  - Final build:ci gate ordering with drift enforcement as blocking final step
  - Workspace dependency major alignment for @tsparticles/engine
affects: [phase-02-runtime-safety-guards, phase-03-test-and-quality-gates]
tech-stack:
  added: []
  patterns: [major-only semver enforcement for shared runtime dependencies]
key-files:
  created:
    - scripts/ci/check-dependency-drift.mjs
  modified:
    - package.json
    - apps/astro/package.json
    - pnpm-lock.yaml
key-decisions:
  - "Major-version drift enforcement compares shared runtime dependency intersection only."
  - "Root `pnpm build:ci` is the single canonical gate path and ends with drift check failure policy."
patterns-established:
  - "Pattern: policy checks expose dependency-level mismatch diagnostics with remediation hints."
requirements-completed: [BLD-03]
duration: 11min
completed: 2026-04-10
---

# Phase 1 Plan 03: Dependency Drift Enforcement Summary

**Major-version drift between package and demo runtime dependencies is now blocked by a shared repository script at the end of canonical `pnpm build:ci`.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-10T19:07:00Z
- **Completed:** 2026-04-10T19:10:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Implemented shared runtime major-drift checker with per-package diagnostics.
- Added `ci:check-dependency-drift` and appended it as final blocking root gate stage.
- Aligned demo dependency major for `@tsparticles/engine` to satisfy phase policy and enable full gate pass.

## Task Commits

1. **Task 1 (TDD RED): failing dependency drift policy tests** - `67056af` (test)
2. **Task 1 (TDD GREEN): drift checker implementation** - `edd00d6` (feat)
3. **Task 2: root gate wiring and dependency major alignment** - `ec311dc` (feat)

## Files Created/Modified
- `scripts/ci/check-dependency-drift.mjs` - Shared manifest comparison enforcing major-only parity.
- `package.json` - Added `ci:check-dependency-drift` and finalized `build:ci` ordered pipeline.
- `apps/astro/package.json` - Aligned `@tsparticles/engine` major with package dependency policy.
- `pnpm-lock.yaml` - Lockfile updates reflecting dependency alignment.

## Decisions Made
- Compared only `dependencies` intersections for shared runtime policy in this phase.
- Kept minor/patch tolerance while hard-failing only on major mismatches.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected test fixture to reflect matching-major pass behavior**
- **Found during:** Task 1
- **Issue:** Initial pass-case fixture had an unintended major mismatch (`foo` dependency), causing false failure.
- **Fix:** Adjusted fixture to use matching major ranges while preserving test intent.
- **Files modified:** `scripts/ci/tests/check-dependency-drift.test.mjs`
- **Verification:** `node --test scripts/ci/tests/check-dependency-drift.test.mjs` passes.
- **Committed in:** `edd00d6`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Preserved policy correctness and avoided false-negative test behavior.

## Issues Encountered
- Demo build initially failed due stale workspace install state; rerunning `pnpm install` synchronized workspace links and restored canonical build behavior.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 gate sequence is complete: toolchain precheck → package build/type outputs → app build → tarball validation → dependency major drift check.

## Self-Check: PASSED
