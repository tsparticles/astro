# Phase 1: Build Pipeline Hardening - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce deterministic, validated publish artifacts for `@tsparticles/astro` and enforce CI-level dependency major-version drift protection between `components/astro` and `apps/astro`.

</domain>

<decisions>
## Implementation Decisions

### Build Entrypoint Contract
- **D-01:** The single canonical maintainer and CI gate command is root `pnpm build:ci`.
- **D-02:** `build:ci` must be an explicit ordered pipeline (not implicit tool-default ordering): toolchain precheck -> package build/typecheck -> demo app build -> tarball validation -> dependency drift check.
- **D-03:** Build gate behavior is fail-fast with explicit failing-step diagnostics and remediation-oriented messages.
- **D-04:** CI must enforce workspace-aligned toolchain and frozen dependency resolution: canonical Node version + pnpm pinned to `packageManager` + `--frozen-lockfile`.

### Artifact Strategy
- **D-05:** `@tsparticles/astro` publish artifacts must be built-distribution outputs, not raw source-only packaging.
- **D-06:** Type declarations are mandatory and validated against package exports before gate success.
- **D-07:** Export validation must cover all declared export paths (not only main entry).
- **D-08:** Tarball file-set policy is allowlist-based: required runtime/types/docs/license files must exist; unexpected extras are disallowed.

### Tarball Validation Strictness
- **D-09:** BLD-02 validation is strict and blocking: CI fails unless tarball checks pass for exports/files/types contract.
- **D-10:** Tarball validation runs inside root `build:ci` (not optional job, not prepublish-only).
- **D-11:** Validation output must include both machine-readable pass/fail and a concise human summary of checked exports/files/types.
- **D-12:** Validation must enforce a committed expected manifest/snapshot for package contents and fail on unapproved drift.

### Dependency Drift Policy
- **D-13:** Drift checks cover all shared runtime dependencies between `components/astro` and `apps/astro` (not engine-only).
- **D-14:** Enforcement level is major-version alignment (minor/patch can differ in this phase).
- **D-15:** Drift detection is a hard CI failure with package-level mismatch details and remediation hints.
- **D-16:** Drift logic must live in a versioned repository script invoked by both local and CI flows.

### CI Environment Contract
- **D-17:** Phase 1 uses one canonical Node version (no matrix) to maximize deterministic gate behavior.
- **D-18:** Canonical Node version source of truth is a repository-declared version file/config that CI reads.
- **D-19:** CI must use the exact pnpm version declared in root `package.json#packageManager`.
- **D-20:** Any CI-vs-repo toolchain mismatch fails immediately before build steps execute.

### the agent's Discretion
- Exact script file locations/names for build/pack/drift checks (while preserving the locked command contract and behavior).
- Exact report formatting details for human-readable validation summaries.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and acceptance
- `.planning/ROADMAP.md` — Phase 1 goal, requirements mapping, and success criteria.
- `.planning/REQUIREMENTS.md` — BLD-01/BLD-02/BLD-03 requirement contracts.
- `.planning/PROJECT.md` — Project constraints and compatibility expectations.

### Build and packaging contracts
- `package.json` — root workspace scripts (`build`, `build:ci`) and `packageManager` declaration.
- `components/astro/package.json` — package build scripts and publish surface metadata.
- `components/astro/index.ts` — package public entrypoint currently exported.
- `.github/workflows/nodejs.yml` — current CI entrypoint and toolchain behavior to harden.

### Workspace alignment inputs
- `apps/astro/package.json` — demo dependency versions used for drift comparison.
- `pnpm-workspace.yaml` — workspace package boundaries.
- `lerna.json` — current orchestration configuration.
- `nx.json` — current task orchestration defaults.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Root `package.json` build scripts and workspace tooling (`pnpm` + `lerna` + `nx`) already provide a single orchestration point that can be hardened rather than replaced.
- Existing CI workflow at `.github/workflows/nodejs.yml` already runs root build commands and is the natural integration point for stricter Phase 1 gates.

### Established Patterns
- Monorepo structure is split between publishable package (`components/astro`) and consuming demo app (`apps/astro`), so cross-workspace validation is an established expectation.
- Current package build scripts in `components/astro/package.json` are placeholders (`echo`), confirming Phase 1 must convert script contracts into real artifact-producing checks.
- Toolchain drift already exists (CI versions vs repo declarations), supporting explicit pre-build toolchain verification in the canonical gate.

### Integration Points
- CI hardening work should wire through root `build:ci` and `.github/workflows/nodejs.yml`.
- Artifact validation should attach to package packaging path from `components/astro/package.json` and be invokable from root scripts.
- Dependency drift enforcement should compare `components/astro/package.json` and `apps/astro/package.json` during the same root gate execution.

</code_context>

<specifics>
## Specific Ideas

- Canonical release-gate command must be explicitly documented as root `pnpm build:ci` for both CI and maintainer pre-publish use.
- Determinism means same commit + lockfile yields stable validated tarball contract (expected manifest/snapshot governs approved drift).
- Validation/reporting should remain strict for machines while still giving maintainers a fast human-readable summary of what was checked.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-build-pipeline-hardening*
*Context gathered: 2026-04-10*
