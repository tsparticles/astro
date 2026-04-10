# tsParticles Astro Package Stabilization

## What This Is

This project maintains and improves the `@tsparticles/astro` package and its demo app in this monorepo. The package gives Astro users a reusable `Particles` component that mounts tsParticles on the client, while `apps/astro` demonstrates real usage. This initialization sets up a focused roadmap for hardening build quality, runtime reliability, and release readiness.

## Core Value

Astro developers can install `@tsparticles/astro` and get a reliable, production-ready particles component that works predictably and is safe to upgrade.

## Requirements

### Validated

- ✓ Astro users can render particles via `Particles` component props (`id`, `options`, `url`, `class`, `style`) — existing
- ✓ Demo app can initialize tsParticles engine and render a running particles scene — existing
- ✓ Monorepo build orchestration exists via pnpm/Lerna/Nx scripts and CI workflow — existing

### Active

- [ ] Package build pipeline produces real, validated distributable artifacts in CI.
- [ ] Runtime path handles invalid options safely and validates untrusted URL usage.
- [ ] Automated tests cover component lifecycle, initialization, and failure paths.
- [ ] Workspace dependency/version strategy is aligned to reduce drift between demo and package runtime.

### Out of Scope

- New particle effect families or visual presets — not required for stabilization and release quality.
- Non-Astro framework features — this project scope is the Astro package and its demo only.

## Context

This is a brownfield TypeScript/Astro monorepo with an existing package (`components/astro`) and demo app (`apps/astro`). The current implementation works for basic scenarios, but codebase mapping identified release-risk gaps: placeholder build scripts in the package, dependency version drift, no automated runtime tests, and missing guards around JSON parsing and dynamic URL loading. Existing architecture and public package usage patterns should be preserved while improving reliability.

## Constraints

- **Tech stack**: Keep Astro + TypeScript + pnpm workspace tooling — aligns with current repository architecture and consumer expectations.
- **Compatibility**: Maintain existing public component prop contract where possible — prevents unnecessary breaking changes for package users.
- **Execution**: Quick planning depth with parallel work where safe — prioritize shipping stabilization improvements quickly.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Brownfield initialization with inferred validated requirements | Existing package behavior is already in production use and should be captured as baseline truth | — Pending |
| Use workflow research, plan-check, and verifier agents | Stabilization work benefits from domain best practices plus stronger planning/execution validation | — Pending |
| Track planning docs in git | Planning artifacts should be auditable and evolve with code changes | — Pending |

---
*Last updated: 2026-04-10 after initialization*
