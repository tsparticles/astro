# Feature Research

**Domain:** Astro OSS UI/component package stabilization (library + demo app)
**Researched:** 2026-04-10
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Reproducible CI build artifacts (`dist/` + publishable tarball checks) | Package consumers expect installable, working outputs every release | MEDIUM | Build must run in CI and validate produced files (not just command success) |
| Runtime input safety for component props (`options`, `url`, invalid JSON handling) | UI packages are expected to fail safely, not crash pages | MEDIUM | Validate/guard untrusted inputs and provide safe fallbacks/errors |
| Automated test baseline (unit/integration + E2E smoke) | Mature OSS packages are expected to catch regressions before publish | HIGH | Vitest for logic/component behavior; Playwright smoke on built demo/preview |
| Stable package contract (`exports`, `types`, `files`, semver discipline) | Consumers expect predictable imports, typings, and upgrade behavior | MEDIUM | Prevent accidental breaking changes from packaging drift |
| Release pipeline with changelog + versioning workflow | OSS users expect transparent release notes and reliable bumps | MEDIUM | Changesets-style workflow is common in monorepos and ecosystem tooling |
| Workspace dependency alignment between package and demo app | Demo must represent real package behavior, not drifted local setup | LOW | Pin/range strategy and CI checks reduce false confidence from demo-only success |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Cross-version compatibility matrix (Astro + Node + tsParticles) in CI | Demonstrates upgrade safety and reduces adopter risk | HIGH | Test matrix converts compatibility claims into evidence |
| Demo-as-contract testing (demo scenarios mapped to release gates) | Turns docs/demo into executable compatibility spec | MEDIUM | Prevents divergence between "works in docs" and "works in package" |
| Supply-chain trust hardening (OIDC trusted publish + npm provenance attestations) | Improves trust for production adopters and security-conscious orgs | MEDIUM | npm provenance is supported via CI + `npm publish --provenance` |
| Bundle/perf budget guardrails for package + demo | Keeps upgrades from degrading startup/perf unexpectedly | MEDIUM | Enforce max bundle deltas and initialization timing expectations |
| Failure observability hooks (structured warnings/errors for init failures) | Improves debuggability versus silent or opaque failures | MEDIUM | Lightweight telemetry hooks/logging contract for host apps |
| Publish "support policy" (maintained versions + deprecation windows) | Makes maintenance posture explicit and enterprise-friendly | LOW | Differentiates via operational clarity, not feature breadth |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| New visual presets/effects before stabilization | Feels like visible progress and marketing value | Increases surface area and regression risk during reliability phase | Freeze net-new visuals until reliability gates are green |
| "Load config from any URL" without strict validation | Convenience and flexibility | Expands attack/error surface and creates runtime unpredictability | Restrict protocols/domains and validate payload shape before use |
| E2E-heavy strategy with minimal unit/integration tests | Easy to understand "real browser" confidence | Slow, flaky suites; weak fault isolation | Keep a test pyramid: targeted unit/integration + slim E2E smoke |
| Custom release scripts replacing ecosystem tooling | Perceived control over releases | Hidden maintenance burden, more edge cases | Use established release tooling (Changesets + CI automation) |
| Supporting every package manager/workflow equally in v1 stabilization | Broad compatibility appeal | Adds matrix complexity and weakens focus | Optimize for existing pnpm workspace first, document others later |

## Feature Dependencies

```
[Stable package contract (exports/types/files)]
    └──requires──> [Reproducible CI build artifacts]
                        └──requires──> [Release pipeline with changelog/versioning]

[Runtime input safety]
    └──requires──> [Automated test baseline]
                        └──enables──> [Failure observability hooks]

[Workspace dependency alignment]
    └──enables──> [Demo-as-contract testing]
                        └──enables──> [Cross-version compatibility matrix]

[Supply-chain trust hardening]
    └──requires──> [Release pipeline with changelog/versioning]

[New visual presets/effects]
    └──conflicts──> [Stabilization-first scope]
```

### Dependency Notes

- **Stable package contract requires reproducible artifacts:** contract guarantees are meaningless unless generated outputs are verified in CI.
- **Runtime safety requires test baseline:** negative-path tests are necessary to prevent regressions in guard logic.
- **Dependency alignment enables demo-as-contract testing:** demo confidence is only valid when runtime deps match package reality.
- **Compatibility matrix builds on demo-as-contract tests:** matrix checks need stable scenarios to assert behavior across versions.
- **Supply-chain hardening depends on release automation:** provenance and trusted publishing are part of publish workflow design.

## MVP Definition

### Launch With (v1)

Minimum viable product for production-ready stabilization.

- [ ] Reproducible CI build artifacts with tarball/content validation — foundational release reliability.
- [ ] Runtime input safety and failure handling for invalid options/URLs — prevents user-facing crashes.
- [ ] Automated test baseline (unit/integration + minimal E2E smoke) — catches lifecycle/init/failure regressions.
- [ ] Stable package contract (`exports`, types, files) — protects consumer import/typing expectations.
- [ ] Release pipeline with changelog/version automation — provides predictable, auditable releases.

### Add After Validation (v1.x)

Features to add once core reliability is stable.

- [ ] Supply-chain trust hardening (`--provenance`, trusted publishing/OIDC) — add once publish path is stable.
- [ ] Demo-as-contract testing expansions — add richer scenario coverage after baseline flake-free.
- [ ] Bundle/perf budget guardrails — add once baseline metrics are captured.

### Future Consideration (v2+)

Features to defer until stabilization outcomes are proven.

- [ ] Cross-version compatibility matrix expansion across wider Node/Astro ranges — add when maintenance bandwidth is clear.
- [ ] Broader multi-tooling publish ergonomics beyond primary workspace flow — add after core workflow maturity.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Reproducible CI build artifacts | HIGH | MEDIUM | P1 |
| Runtime input safety | HIGH | MEDIUM | P1 |
| Automated test baseline | HIGH | HIGH | P1 |
| Stable package contract | HIGH | MEDIUM | P1 |
| Release pipeline + changelog/versioning | HIGH | MEDIUM | P1 |
| Workspace dependency alignment | MEDIUM | LOW | P1 |
| Demo-as-contract testing | HIGH | MEDIUM | P2 |
| Supply-chain trust hardening | MEDIUM | MEDIUM | P2 |
| Bundle/perf budget guardrails | MEDIUM | MEDIUM | P2 |
| Cross-version compatibility matrix | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Release/version discipline | Changesets-driven monorepos standardize changelog + bump flow | Smaller packages often do manual versioning with weaker traceability | Use Changesets-style automated, auditable release flow as baseline |
| Test strategy | Mature packages combine fast unit tests with targeted E2E | Many small libs rely on manual demo checks only | Require explicit test pyramid plus failure-path coverage |
| Demo reliability | Better projects treat demo as realistic integration harness | Weaker projects let demo drift from package dependency reality | Lock dependency alignment and convert demo scenarios into CI contract tests |
| Package publishing trust | Emerging leaders adopt provenance/trusted publishing | Many packages still publish with token-only workflows and no attestations | Add provenance and trusted publishing after core release pipeline stabilizes |

## Sources

- Astro docs: Testing guide (Vitest setup, Playwright/Cypress/Nightwatch recommendations) — https://docs.astro.build/en/guides/testing/ (HIGH)
- Astro docs: Working with integrations + publishing components to npm (package metadata, files/exports expectations) — https://docs.astro.build/en/guides/integrations/ (HIGH)
- Vitest docs: Coverage providers, setup, and reporting tradeoffs — https://vitest.dev/guide/coverage.html (HIGH)
- Playwright docs: `webServer` for deterministic app boot in CI/local testing — https://playwright.dev/docs/test-webserver (HIGH)
- Changesets repository/docs: monorepo versioning/changelog workflow and CI integration patterns — https://github.com/changesets/changesets (MEDIUM)
- npm docs: Provenance statements, trusted publishing/OIDC expectations, and CI prerequisites — https://docs.npmjs.com/generating-provenance-statements (HIGH)

---
*Feature research for: Astro component-library stabilization*
*Researched: 2026-04-10*
