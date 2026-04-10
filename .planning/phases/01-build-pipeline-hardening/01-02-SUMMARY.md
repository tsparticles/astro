---
phase: 01-build-pipeline-hardening
plan: 02
subsystem: infra
tags: [ci, tarball, validation, publish, pnpm]
requires:
  - phase: 01-build-pipeline-hardening
    provides: Deterministic dist artifacts from 01-01
provides:
  - Strict tarball exports/files/types validation in canonical gate
  - Committed expected tarball manifest snapshot drift enforcement
  - Machine-readable report output for CI artifact evidence
affects: [phase-03-test-and-quality-gates, phase-04-release-workflow-and-publish-trust]
tech-stack:
  added: []
  patterns: [pack-output contract validation, snapshot-based tarball drift approval]
key-files:
  created:
    - scripts/ci/validate-tarball.mjs
    - scripts/ci/tarball-expected-manifest.json
  modified:
    - package.json
key-decisions:
  - "Tarball validator is blocking and runs inside root build:ci, not optional/prepublish-only."
  - "Tarball content drift requires explicit snapshot update to approve publish-surface changes."
patterns-established:
  - "Pattern: validator emits both concise human logs and machine-readable JSON reports."
requirements-completed: [BLD-02]
duration: 16min
completed: 2026-04-10
---

# Phase 1 Plan 02: Tarball Contract Summary

**Packed `@tsparticles/astro` artifacts are now strictly validated for exports/files/types with committed manifest drift enforcement.**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-10T19:02:00Z
- **Completed:** 2026-04-10T19:07:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Implemented strict tarball validator backed by `pnpm pack --json` inspection.
- Wired tarball validation as a blocking root `build:ci` stage.
- Added committed expected-manifest snapshot and fail-on-drift behavior with explicit remediation guidance.

## Task Commits

1. **Task 1 (TDD RED): failing tarball validator tests** - `a02e992` (test)
2. **Task 1 (TDD GREEN): strict validator implementation + build gate wiring** - `09812f3` (feat)
3. **Task 2: expected manifest snapshot + drift enforcement** - `0eaf2c7` (fix)

## Files Created/Modified
- `scripts/ci/validate-tarball.mjs` - Blocking validation logic for exports/types/allowlist and report output.
- `scripts/ci/tarball-expected-manifest.json` - Committed expected tarball file snapshot.
- `package.json` - Added `ci:validate-tarball` and inserted it into canonical `build:ci` ordering.

## Decisions Made
- Used `.planning/tmp/tarball-validation-report.json` as deterministic machine-readable output path.
- Enforced manifest snapshot drift (added/removed file detection) in addition to required/allowlist checks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added robust JSON extraction from `pnpm pack --json` mixed output**
- **Found during:** Task 1
- **Issue:** `pnpm pack --json` output included prepack logs, causing direct `JSON.parse` failure.
- **Fix:** Extracted JSON object region from command output before parsing.
- **Files modified:** `scripts/ci/validate-tarball.mjs`
- **Verification:** `pnpm run ci:validate-tarball` passes and writes report.
- **Committed in:** `09812f3`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for deterministic validator execution in real workspace runs.

## Issues Encountered
- Temporary generated `.tgz` artifacts were cleaned from workspace and excluded from commits.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dependency drift enforcement can now be appended as final gate stage after validated tarball contract checks.

## Self-Check: PASSED
