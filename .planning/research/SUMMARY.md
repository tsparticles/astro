# Project Research Summary

**Project:** tsParticles Astro Package Stabilization
**Domain:** Astro OSS component-library stabilization in a TypeScript pnpm monorepo
**Researched:** 2026-04-10
**Confidence:** HIGH

## Executive Summary

This project is a brownfield stabilization effort for `@tsparticles/astro`: keep the existing public component contract, but make the package reliably buildable, testable, and publishable. The research converges on a standard OSS library hardening path: lock the toolchain (Node 22.12+ + pnpm workspaces), enforce deterministic CI artifacts, add runtime guards around untrusted inputs, and gate releases with package-quality checks (`publint`, ATTW, tarball install validation) plus structured versioning via Changesets.

The recommended approach is to sequence work by dependency risk, not feature novelty. First stabilize build/release fundamentals and dependency alignment between `components/astro` and `apps/astro`; then harden runtime initialization (`options` parsing, `url` validation, lifecycle idempotence); then add layered automated tests (Vitest + minimal Playwright smoke) and finally formalize release automation/provenance. This ordering is strongly supported across STACK, FEATURES, ARCHITECTURE, and PITFALLS and minimizes “green CI, broken package” outcomes.

The key risks are already known and actionable: fake/placeholder build success, workspace version drift, unsafe runtime parsing/loading, and unvalidated publish contents. Mitigation is clear: real artifact builds in CI, explicit dependency drift checks, guarded runtime modules with negative-path tests, and pre-publish tarball/export verification. Net: prioritize reliability gates over new visual scope until the release pipeline is trustworthy.

## Key Findings

### Recommended Stack

The stack is modern but conservative: keep Astro + TypeScript + pnpm workspaces and standardize execution on Node `>=22.12.0` to match Astro 6 engine requirements. Use Changesets as the primary release/version workflow, with CI-driven publish and provenance. For quality gates, pair lint/typecheck with Astro-aware diagnostics (`astro check`), package checks (`publint`, `@arethetypeswrong/cli`), and layered tests (Vitest for logic/failure paths, Playwright for browser smoke).

**Core technologies:**
- **Node.js 22.12+ LTS:** runtime/CI baseline — aligns with Astro 6 requirements and removes local-vs-CI version drift.
- **Astro 6.1.5:** framework target and consumer reality — keeps package validation aligned with current ecosystem expectations.
- **TypeScript 6.0.2:** authoring/type contract safety — improves modern ESM/export typing behavior.
- **pnpm workspaces 10.33.0:** deterministic monorepo dependency linking — `workspace:` protocol reduces package drift.
- **Changesets 2.30.0:** release orchestration — explicit, auditable multi-package version/changelog flow.

### Expected Features

v1 must focus on reliability fundamentals rather than net-new effects. Table-stakes are reproducible CI artifacts, runtime input safety, automated testing baseline, stable package contract (`exports`/types/files), and release workflow discipline. Differentiators (demo-as-contract, provenance hardening, perf budgets) are valuable, but should come after baseline stability is proven.

**Must have (table stakes):**
- Reproducible CI build artifacts with pack/content validation.
- Runtime input safety for invalid `options`/`url` inputs.
- Automated test baseline (unit/integration + minimal E2E smoke).
- Stable package contract (`exports`, types, files, semver discipline).
- Release pipeline with changelog/version automation.
- Workspace dependency alignment between package and demo app.

**Should have (competitive):**
- Demo-as-contract CI scenarios.
- Supply-chain hardening (trusted publish + npm provenance).
- Bundle/perf guardrails.
- Failure observability hooks for initialization errors.

**Defer (v2+):**
- Broad cross-version compatibility matrix expansion.
- Wider multi-tooling ergonomics beyond primary pnpm flow.
- New visual presets/effects until reliability gates stay green.

### Architecture Approach

Architecture should preserve existing boundaries but separate fragile runtime concerns into testable modules. `Particles.astro` remains public API/SSR handoff, while runtime init/validation logic moves into dedicated functions under `src/runtime/`. CI should enforce deterministic workspace install, package-first build/test, then demo build as consumer canary, with release steps only after artifact and contract checks pass.

**Major components:**
1. **`Particles.astro` public component** — owns API surface and SSR-to-client data handoff.
2. **Runtime init/validation module** — parses/guards `options` + validates `url` before `tsParticles.load`.
3. **Package contract layer (`package.json`/exports/scripts)** — defines what is published and how it is verified.
4. **`apps/astro` demo canary** — proves real consumer integration against workspace package.
5. **Workspace/CI orchestration (pnpm/Nx/Lerna/GitHub Actions)** — enforces deterministic build/test/release order.

### Critical Pitfalls

1. **Green CI without real package artifacts** — replace placeholder builds with real build + `pnpm pack` + tarball install smoke checks.
2. **Cross-workspace dependency drift** — align and enforce shared major versions (`@tsparticles/engine`/`tsparticles`) across package and demo.
3. **Unsafe JSON parsing in runtime bootstrap** — wrap parse in guarded decoder and test malformed payloads.
4. **Untrusted remote config URL loading** — enforce protocol/origin validation (default `https:` and deny unsafe schemes).
5. **Constructor-based lifecycle races** — move to idempotent `connectedCallback` + proper teardown in `disconnectedCallback`.

## Implications for Roadmap

Based on combined research, a 4-phase roadmap is the highest-confidence structure.

### Phase 1: Build Pipeline Hardening
**Rationale:** All downstream safety/release claims depend on real, reproducible artifacts and aligned dependencies.
**Delivers:** Deterministic CI (`Node 22.12+`, pinned pnpm), real package build scripts, tarball pack/install validation, dependency drift checks.
**Addresses:** Reproducible artifacts, stable package contract foundations, workspace alignment (FEATURES P1).
**Avoids:** Pitfalls 1, 2, and 8.

### Phase 2: Runtime Safety Guards
**Rationale:** Runtime crashes/security issues are the next highest user-facing risk once build is trustworthy.
**Delivers:** Guarded init module, invalid JSON resilience, URL validation policy, lifecycle-safe mount/unmount behavior.
**Uses:** TypeScript runtime modules + Astro component boundary patterns.
**Implements:** Guarded runtime initialization architecture pattern.
**Avoids:** Pitfalls 3, 4, and 5.

### Phase 3: Automated Test Coverage as Release Gate
**Rationale:** Hardening is incomplete without regression prevention on both happy and failure paths.
**Delivers:** Vitest lifecycle/failure-path tests, Playwright smoke on built demo, CI test stage integrated with package-first build order.
**Addresses:** Automated baseline testing, demo-as-contract foundation.
**Avoids:** Pitfall 6.

### Phase 4: Release Readiness and Trust Automation
**Rationale:** Once quality gates are stable, formalize release policy and security posture.
**Delivers:** Changesets-driven version/changelog flow, `publint` + ATTW + export/files checks, provenance-enabled CI publishing.
**Addresses:** Release pipeline table stakes + supply-chain differentiator.
**Avoids:** Pitfall 7.

### Phase Ordering Rationale

- Build determinism first because package contract, testing credibility, and release automation all depend on validated artifacts.
- Runtime guards precede broader test expansion so tests assert the intended safe behavior model (not existing unsafe behavior).
- Test gating precedes release automation to ensure automated publishing cannot ship unverified regressions.
- Differentiators (matrix breadth, perf budgets, policy docs) should layer onto a stable core, not compete with stabilization scope.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** finalize URL trust model (same-origin vs allowlist) and error-reporting contract for host apps.
- **Phase 4:** choose trusted publishing/OIDC implementation details and provenance rollout policy per npm/org constraints.
- **Post-v1 compatibility phase:** define economically sustainable Node/Astro/tsParticles matrix breadth.

Phases with standard patterns (can likely skip extra research-phase):
- **Phase 1:** deterministic monorepo CI hardening with pnpm + lockfile + pack validation is well-established.
- **Phase 3:** Vitest + Playwright pyramid for Astro package/demo validation is well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Backed by official Astro/pnpm/Vitest/Playwright/npm docs and version/engine checks. |
| Features | HIGH | Strong convergence on stabilization-first table stakes and explicit dependency graph. |
| Architecture | HIGH | Repository-grounded analysis with concrete component/workflow boundaries. |
| Pitfalls | HIGH | Directly mapped to observed repo risks and known monorepo/package failure modes. |

**Overall confidence:** HIGH

### Gaps to Address

- **URL security policy specifics:** Decide default trust boundary (`https` only vs origin allowlist) and configurability; validate against consumer expectations.
- **Dependency alignment enforcement mechanism:** Confirm whether to implement as custom CI script, lint rule, or workspace policy tool.
- **Release ownership model:** Clarify whether Lerna remains transitional while Changesets becomes authoritative to avoid dual-release ambiguity.
- **Compatibility matrix scope:** Define minimal supported Node/Astro/engine versions for v1 without overcommitting maintenance load.

## Sources

### Primary (HIGH confidence)
- `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` (project research outputs, 2026-04-10)
- Astro docs: testing, integrations, CLI (`astro check`) — https://docs.astro.build/en/guides/testing/, https://docs.astro.build/en/guides/integrations/, https://docs.astro.build/en/reference/cli-reference/
- pnpm docs: workspaces + changesets workflow — https://pnpm.io/workspaces, https://pnpm.io/using-changesets
- Changesets docs/action — https://github.com/changesets/changesets, https://github.com/changesets/action
- Vitest + Playwright docs — https://vitest.dev/guide/, https://playwright.dev/docs/intro
- npm provenance docs — https://docs.npmjs.com/generating-provenance-statements
- Repository context and configs: `.planning/PROJECT.md`, workspace/package/CI files cited in ARCHITECTURE/PITFALLS

### Secondary (MEDIUM confidence)
- npm-package-json-lint recommendation for manifest policy enforcement (useful but optional in early phases).
- Nx retention for orchestration optimization where existing repo investment is significant.

### Tertiary (LOW confidence)
- None identified; current plan does not depend on single-source speculative claims.

---
*Research completed: 2026-04-10*
*Ready for roadmap: yes*
