# Roadmap: tsParticles Astro Package Stabilization

## Overview

This roadmap hardens `@tsparticles/astro` from a working brownfield package into a reliable release pipeline: first guarantee real build artifacts and dependency alignment, then make runtime behavior safe under invalid inputs, then enforce automated quality gates, and finally ship through a trustworthy documented release flow.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Build Pipeline Hardening** - Produce deterministic, validated package artifacts and enforce workspace dependency alignment.
- [ ] **Phase 2: Runtime Safety Guards** - Ensure unsafe runtime inputs and lifecycle churn cannot break host pages.
- [ ] **Phase 3: Test and Quality Gates** - Gate delivery with automated runtime and browser validation.
- [ ] **Phase 4: Release Workflow and Publish Trust** - Formalize versioning, publishing, and release-note clarity.

## Phase Details

### Phase 1: Build Pipeline Hardening
**Goal**: Maintainers can reliably produce and validate publishable package artifacts with dependency drift protection.
**Depends on**: Nothing (first phase)
**Requirements**: BLD-01, BLD-02, BLD-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can run a single CI build entrypoint and receive publishable `@tsparticles/astro` artifacts.
  2. Maintainer can inspect a generated tarball and verify exports, published files, and types are correct before publish.
  3. CI fails when `components/astro` and `apps/astro` introduce dependency major-version drift.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Implement real package build outputs in workspace/CI flow.
- [ ] 01-02: Add tarball packaging and artifact content validation checks.
- [ ] 01-03: Enforce dependency drift detection between package and demo.

### Phase 2: Runtime Safety Guards
**Goal**: Users can use `Particles` safely even with malformed inputs or repeated mount/unmount cycles.
**Depends on**: Phase 1
**Requirements**: RUN-01, RUN-02, RUN-03
**Success Criteria** (what must be TRUE):
  1. User can provide malformed `options` input and the page still initializes without crashing.
  2. User can load remote config only when URL safety rules are met; unsafe URLs are blocked.
  3. User can repeatedly mount/unmount the component without leaked or duplicate particle instances.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Add guarded options parsing and initialization fallback behavior.
- [ ] 02-02: Implement and document URL trust validation policy.
- [ ] 02-03: Make lifecycle initialization/teardown idempotent.

### Phase 3: Test and Quality Gates
**Goal**: Maintainers can trust automated checks to catch regressions across runtime paths and demo consumption.
**Depends on**: Phase 2
**Requirements**: TST-01, TST-02, TST-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can run automated tests that verify initialization success and failure behavior.
  2. Maintainer can run browser smoke tests against the demo app consuming the built workspace package.
  3. Release flow is blocked automatically when tests or package-quality checks fail.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Add runtime-focused automated tests for success/failure/lifecycle behavior.
- [ ] 03-02: Add demo smoke tests and wire quality gates into CI blocking rules.

### Phase 4: Release Workflow and Publish Trust
**Goal**: Maintainers can produce transparent, provenance-backed releases that users can safely adopt.
**Depends on**: Phase 3
**Requirements**: REL-01, REL-02, REL-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can generate version and changelog updates through a documented monorepo workflow.
  2. Maintainer can publish through CI with provenance metadata attached to release artifacts.
  3. User can read release notes that clearly explain changes and compatibility expectations.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Standardize versioning/changelog flow and repository documentation.
- [ ] 04-02: Automate provenance-enabled CI publish and release-note output.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Build Pipeline Hardening | 0/3 | Not started | - |
| 2. Runtime Safety Guards | 0/3 | Not started | - |
| 3. Test and Quality Gates | 0/2 | Not started | - |
| 4. Release Workflow and Publish Trust | 0/2 | Not started | - |
