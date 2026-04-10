# External Integrations

**Analysis Date:** 2026-04-10

## APIs & External Services

**Frontend rendering library:**
- tsParticles ecosystem - client-side particle animation rendering
  - SDK/Client: `@tsparticles/engine` and `tsparticles` in `apps/astro/package.json`; imported in `apps/astro/src/pages/index.astro` and `components/astro/src/Particles.astro`
  - Auth: Not applicable

**Package/Distribution ecosystem:**
- npm registry (package publishing target) - package metadata and package identity for distribution
  - SDK/Client: npm package metadata in `components/astro/package.json`
  - Auth: Not detected in repo files (publishing credentials not committed)

## Data Storage

**Databases:**
- None detected
  - Connection: Not applicable
  - Client: Not applicable

**File Storage:**
- Local filesystem only (project source/assets under `apps/astro/src` and `apps/astro/public`)

**Caching:**
- CI dependency cache via GitHub Actions cache in `.github/workflows/nodejs.yml` (pnpm store cache)
- Build cache via Nx target caching in `nx.json`

## Authentication & Identity

**Auth Provider:**
- None (no user authentication system detected)
  - Implementation: Not applicable

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/Bugsnag integrations in code/config)

**Logs:**
- GitHub Actions job logs from `.github/workflows/nodejs.yml`
- No application logging framework detected in app/component source

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured in repository (Astro build scripts exist in `apps/astro/package.json`, but no deploy target config found)

**CI Pipeline:**
- GitHub Actions workflow in `.github/workflows/nodejs.yml`
  - Triggers on push/pull_request to `main` and `legacy`
  - Uses `actions/setup-node`, `pnpm/action-setup`, `actions/cache`
  - Runs `pnpm install` and `npx lerna run build:ci`

## Environment Configuration

**Required env vars:**
- None required by application/component source (no `process.env` or `import.meta.env` usage detected in `apps/astro/src/**` or `components/astro/src/**`)
- Optional CI secret reference (commented): `NX_CLOUD_ACCESS_TOKEN` in `.github/workflows/nodejs.yml`

**Secrets location:**
- GitHub Actions secrets context (referenced as `${{ secrets.* }}` in `.github/workflows/nodejs.yml` comments)
- No committed secret files detected during analysis

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-04-10*
