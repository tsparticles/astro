# Phase 01 — Build Pipeline Hardening Research

**Date:** 2026-04-10  
**Scope:** Deterministic build artifacts, tarball validation, dependency drift enforcement  
**Requirements:** BLD-01, BLD-02, BLD-03

## Inputs Reviewed

- `.planning/phases/01-build-pipeline-hardening/01-CONTEXT.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `package.json`
- `components/astro/package.json`
- `apps/astro/package.json`
- `.github/workflows/nodejs.yml`

## Current-State Findings

1. Root CI/build command exists (`pnpm build:ci`) but is not an explicit deterministic pipeline and has fallback behavior that can hide failures.
2. `components/astro` has placeholder build scripts (`echo build`, `echo build:ci`) and exports source (`./index.ts`) instead of distribution outputs.
3. CI toolchain is misaligned with repository declarations:
   - CI Node: 16
   - CI pnpm: 8
   - Repo `packageManager`: pnpm 10.33.0
   - Lockfile contains dependencies expecting newer Node ranges.
4. No tarball contract validator currently enforces exports/files/types correctness or expected content snapshots.
5. Runtime dependency major drift already exists between package and demo (`@tsparticles/engine` majors differ).

## Recommended Implementation Strategy

### 1) Canonical deterministic gate (`pnpm build:ci`) for BLD-01

Create repository scripts under `scripts/ci/` and make root `build:ci` run this exact ordered pipeline:

1. toolchain precheck (Node + pnpm + frozen lockfile installation assumption)
2. package build + type declaration verification
3. demo app build against workspace package
4. tarball validation
5. dependency major drift check

Fail-fast behavior should stop at first failure with a clear remediation message that names the failing command and expected state.

### 2) Package artifact hardening for BLD-01 + BLD-02

In `components/astro/package.json`:

- move publish entrypoints to distribution (`dist/*`)
- add `types` field targeting generated `.d.ts`
- add `files` allowlist (`dist`, `README.md`, `LICENSE`)
- replace placeholder `build`/`build:ci` with real commands:
  - `astro check` for type-level validation
  - `tsc` declaration emit for publishable types
- keep `prepack` to run `build`.

### 3) Tarball validation strictness for BLD-02

Use `pnpm pack --json` in `components/astro` and validate:

- exported entrypoints resolve to files included in tarball
- required files/types/docs/license are present
- no unexpected files outside allowlist policy
- committed expected manifest snapshot matches generated tarball file list.

Output requirements:

- machine-readable result file (JSON)
- concise human summary in stdout (checked exports/files/types + pass/fail).

### 4) Dependency major drift check for BLD-03

Implement a repository script (`scripts/ci/check-dependency-drift.mjs`) that compares shared runtime dependencies between:

- `components/astro/package.json`
- `apps/astro/package.json`

Policy for this phase:

- enforce major-version parity only
- fail on mismatch with package-level details and fix guidance.

## CI Contract Recommendation

Update `.github/workflows/nodejs.yml` to:

- read canonical Node version from repository source of truth (`.nvmrc`)
- read pnpm version from root `packageManager`
- run `pnpm install --frozen-lockfile`
- run `pnpm build:ci` (single canonical gate).

## Common Pitfalls to Avoid

1. **Silent fallback logic** in root build command (masks failing stages).
2. **Validating source exports only** instead of packed artifact exports.
3. **Permissive tarball checks** that only assert presence of a subset of files.
4. **Comparing all version segments** (overly strict for this phase); enforce major-only as decided.
5. **Toolchain checks after install/build** (must run before build stages).

## Validation Architecture

To satisfy Nyquist validation requirements, phase execution should include:

- Quick check after each task: targeted script checks (`pnpm build:ci` subcommands where possible).
- Full phase check before completion:
  - `pnpm build:ci`
  - package tarball validator output file present and reports pass
  - dependency drift checker exits 0 on aligned majors, non-zero on mismatch fixture.

## Implementation Notes

- Keep all enforcement logic in versioned scripts under `scripts/ci/` (not CI-only inline shell), so local and CI use identical behavior.
- Prefer Node ESM scripts (`.mjs`) because repository already uses ESM package metadata in app package.
- Use deterministic JSON parsing of `packageManager` and semver major extraction; avoid brittle regex-only approaches where possible.

## Decision Alignment Check

- D-01..D-04 covered by canonical root gate and toolchain precheck strategy.
- D-05..D-12 covered by dist exports + strict tarball validator + manifest snapshot.
- D-13..D-16 covered by shared dependency major checker in repo script.
- D-17..D-20 covered by repository-defined Node/pnpm and pre-build mismatch fail-fast.

## Research Outcome

`Phase 01` is implementable with no new external dependencies. Existing pnpm/Lerna/Astro toolchain is sufficient.

## RESEARCH COMPLETE
