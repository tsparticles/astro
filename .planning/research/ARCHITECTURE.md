# Architecture Research

**Domain:** Astro component package monorepo stabilization
**Researched:** 2026-04-10
**Confidence:** HIGH (repository-grounded), MEDIUM (forward-looking hardening recommendations)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Release Governance Layer                          │
├──────────────────────────────────────────────────────────────────────┤
│  .github/workflows/nodejs.yml  ->  lerna/nx/pnpm orchestration      │
│  versioning in lerna.json      ->  package publish contract          │
└──────────────────────────────────────────────────────────────────────┘
                              |
                              v
┌──────────────────────────────────────────────────────────────────────┐
│                  Build and Verification Layer                        │
├──────────────────────────────────────────────────────────────────────┤
│  components/astro build  ->  typed artifacts + package exports       │
│  components/astro tests  ->  runtime safety and failure-path checks  │
│  apps/astro build        ->  integration proof of package behavior   │
└──────────────────────────────────────────────────────────────────────┘
                              |
                              v
┌──────────────────────────────────────────────────────────────────────┐
│                     Runtime Component Layer                          │
├──────────────────────────────────────────────────────────────────────┤
│  Particles.astro (SSR props -> data-*) -> custom element bootstrap   │
│  custom element -> tsParticles.load(...) -> canvas container         │
└──────────────────────────────────────────────────────────────────────┘
                              |
                              v
┌──────────────────────────────────────────────────────────────────────┐
│                       Consumer App Layer                             │
├──────────────────────────────────────────────────────────────────────┤
│  apps/astro page imports @tsparticles/astro and engine loaders       │
│  user options/url flow into component and initialize client runtime   │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Talks To |
|-----------|----------------|----------|
| `components/astro/src/Particles.astro` | Public API surface (`id`, `options`, `url`, `class`, `style`) and SSR-to-client handoff | Astro page consumers, browser custom elements runtime |
| `AstroParticles` custom element (inside `Particles.astro`) | Safe runtime initialization, parse/validate inputs, invoke tsParticles | `@tsparticles/engine`, DOM dataset, browser custom elements registry |
| `components/astro/package.json` + package entry | Packaging contract (`exports`, scripts, prepack), dependency pinning | Monorepo orchestrator, npm/publish pipeline |
| `apps/astro` demo app | Integration canary proving package works in real Astro app | `@tsparticles/astro`, `@tsparticles/engine`, CI build job |
| Workspace orchestrator (`package.json`, `lerna.json`, `nx.json`, `pnpm-workspace.yaml`) | Deterministic install/build order, caching, multi-package execution | All workspace packages, CI workflow |
| CI workflow (`.github/workflows/nodejs.yml`) | Enforce reproducible install and build checks before release | pnpm lockfile, lerna scripts, build outputs |

## Recommended Project Structure

```
.
├── components/
│   └── astro/
│       ├── src/
│       │   ├── Particles.astro          # Public component + client init
│       │   ├── runtime/
│       │   │   ├── init.ts              # Safe tsParticles load wrapper
│       │   │   └── validation.ts        # options/url parse + guard logic
│       │   └── types.ts                 # shared runtime/component types
│       ├── tests/
│       │   ├── particles.lifecycle.test.ts
│       │   └── particles.failure-paths.test.ts
│       ├── index.ts                     # package export surface
│       ├── package.json                 # build, prepack, exports, deps
│       └── tsconfig.json
├── apps/
│   └── astro/
│       ├── src/pages/index.astro        # integration usage example
│       └── package.json
├── .github/workflows/nodejs.yml         # CI gates for install/build/test
├── lerna.json                            # version/release strategy
├── nx.json                               # task graph + cache behavior
├── pnpm-workspace.yaml                   # workspace membership
└── package.json                          # top-level orchestration scripts
```

### Structure Rationale

- **`components/astro/src/runtime/`**: isolates fragile initialization concerns from UI/templating so runtime guards are testable and reusable.
- **`components/astro/tests/`**: makes lifecycle and failure-path reliability a first-class release gate, not ad hoc manual testing.
- **Workspace root orchestration files**: keep deterministic build and release policy centralized, minimizing per-package drift.
- **`apps/astro` as integration canary**: catches package-to-consumer breakage before publishing.

## Architectural Patterns

### Pattern 1: Guarded Runtime Initialization

**What:** Parse/validate `options` and `url` before calling `tsParticles.load`, fail closed for invalid inputs.
**When to use:** Any client-side initialization from serialized props or untrusted URL sources.
**Trade-offs:** Slightly more code, but prevents runtime crashes and unsafe remote fetch behavior.

**Example:**
```typescript
type InitInput = { id?: string; rawOptions?: string; rawUrl?: string };

export async function initParticles(input: InitInput) {
  if (!input.id) return { ok: false as const, reason: "missing-id" };

  let options: unknown;
  if (input.rawOptions) {
    try {
      options = JSON.parse(input.rawOptions);
    } catch {
      return { ok: false as const, reason: "invalid-options-json" };
    }
  }

  const url = validateOptionsUrl(input.rawUrl); // allowlist or same-origin policy
  await tsParticles.load({ id: input.id, options, url });
  return { ok: true as const };
}
```

### Pattern 2: Deterministic Workspace Build Contracts

**What:** Real package `build` script produces publishable outputs, with CI using lockfile-driven installs and scripted task graph.
**When to use:** Monorepo package intended for external publication.
**Trade-offs:** More upfront build config, but reproducible artifacts and fewer "works locally" failures.

**Example:**
```typescript
// conceptual task graph
// 1) install (locked)
// 2) lint/typecheck/test package
// 3) build package artifacts
// 4) build demo against local workspace package
// 5) publish from validated artifacts only
```

### Pattern 3: Demo-as-Canary Integration Validation

**What:** Treat demo app as a consumer contract test in CI and pre-release checks.
**When to use:** Library/package repos with an in-repo showcase app.
**Trade-offs:** Slightly longer pipeline, much better confidence that package API still works in real Astro pages.

## Data Flow

### Runtime Request Flow

```
[Astro Page]
    -> passes props (`id`, `options`, `url`)
[Particles.astro SSR]
    -> serializes props into data attributes
[Browser Custom Element]
    -> reads dataset
    -> validates/parses
    -> calls tsParticles.load
[tsParticles Engine]
    -> creates container on canvas
    -> returns success/failure signal
[Component Telemetry/Errors]
    -> surfaced to console/tests/CI assertions
```

### Release and Build Flow

```
[Git push/PR]
    -> [.github/workflows/nodejs.yml]
    -> [pnpm install with lockfile]
    -> [lerna/nx build graph]
    -> [components/astro build + tests]
    -> [apps/astro integration build]
    -> [release versioning/publish eligibility]
```

### Key Data Flows

1. **Component initialization flow:** typed Astro props -> serialized DOM data -> validated runtime input -> tsParticles engine load.
2. **Remote options flow:** user-provided URL -> URL validator/allowlist -> optional fetch by engine -> parsed options applied.
3. **Release confidence flow:** source + lockfile -> deterministic install/build/test -> artifact validation -> publish decision.

## Build Order and Dependency Implications

1. **Workspace install first** (`pnpm install --frozen-lockfile` in CI) to lock dependency graph and avoid cross-package drift.
2. **Build and test `components/astro` next** because demo and publishability depend on package output correctness.
3. **Run package runtime tests before demo build** to fail fast on lifecycle/initialization regressions.
4. **Build `apps/astro` after package artifacts are ready** to verify real consumer integration using workspace dependency.
5. **Release/versioning steps last** (Lerna version/publish) only after package + demo checks pass.

Dependency direction should stay one-way: `apps/astro` depends on `components/astro`; package must never depend on demo app.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k consumers | Keep single package + demo structure, focus on runtime guards and test coverage. |
| 1k-100k consumers | Add stricter CI gates (matrix on Node/Astro versions), stronger artifact validation, and changelog automation. |
| 100k+ consumers | Split runtime internals into dedicated modules, add compatibility test matrix and staged release channels. |

### Scaling Priorities

1. **First bottleneck:** weak runtime validation causes consumer runtime failures; fix with guarded init and failure-path tests.
2. **Second bottleneck:** non-deterministic builds/dependency drift; fix with locked installs, real build outputs, and CI artifact checks.

## Anti-Patterns

### Anti-Pattern 1: Constructor-Only Fire-and-Forget Initialization

**What people do:** Trigger async load in custom element constructor without input guards or error handling.
**Why it's wrong:** JSON parse/runtime failures become hard-to-debug client crashes and flaky behavior.
**Do this instead:** Move init into guarded function with explicit validation and controlled failure states.

### Anti-Pattern 2: Placeholder Build Scripts for Published Package

**What people do:** Keep `build`/`build:ci` as no-op placeholders while relying on manual local behavior.
**Why it's wrong:** CI cannot validate publish artifacts; releases can ship broken package outputs.
**Do this instead:** Implement real artifact build + test scripts and wire them into CI gating.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| npm registry | Publish after CI success and versioning | Require artifact validation before publish step. |
| GitHub Actions | CI workflow for install/build/test orchestration | Lock Node/pnpm strategy to keep builds reproducible. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `apps/astro` <-> `components/astro` | package import via workspace protocol | Consumer contract boundary; keep API stable. |
| `Particles.astro` <-> runtime init module | function call with typed input/output | Keeps UI rendering separate from reliability logic. |
| root orchestration <-> package scripts | script invocation (`lerna`, `nx`, `pnpm`) | Build order and release policy remain centralized. |

## Sources

- Repository context: `/Users/matteo/Projects/GitHub/tsparticles/astro/.planning/PROJECT.md`
- Workspace/build config: `/Users/matteo/Projects/GitHub/tsparticles/astro/package.json`, `/Users/matteo/Projects/GitHub/tsparticles/astro/lerna.json`, `/Users/matteo/Projects/GitHub/tsparticles/astro/nx.json`, `/Users/matteo/Projects/GitHub/tsparticles/astro/pnpm-workspace.yaml`
- CI pipeline: `/Users/matteo/Projects/GitHub/tsparticles/astro/.github/workflows/nodejs.yml`
- Package runtime entrypoints: `/Users/matteo/Projects/GitHub/tsparticles/astro/components/astro/src/Particles.astro`, `/Users/matteo/Projects/GitHub/tsparticles/astro/components/astro/package.json`, `/Users/matteo/Projects/GitHub/tsparticles/astro/components/astro/index.ts`
- Demo consumer usage: `/Users/matteo/Projects/GitHub/tsparticles/astro/apps/astro/src/pages/index.astro`, `/Users/matteo/Projects/GitHub/tsparticles/astro/apps/astro/package.json`

---
*Architecture research for: Astro component package monorepo stabilization*
*Researched: 2026-04-10*
