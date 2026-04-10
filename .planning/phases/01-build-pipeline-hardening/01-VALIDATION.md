---
phase: 01
slug: build-pipeline-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node script checks + workspace build commands |
| **Config file** | none — phase adds CI validation scripts |
| **Quick run command** | `pnpm --filter @tsparticles/astro run build:ci` |
| **Full suite command** | `pnpm build:ci` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @tsparticles/astro run build:ci`
- **After every plan wave:** Run `pnpm build:ci`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | BLD-01 | T-01-01 | Fails closed on toolchain mismatch | script | `pnpm run ci:toolchain` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | BLD-02 | T-01-02 | Rejects unexpected tarball content drift | integration | `pnpm run ci:validate-tarball` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 3 | BLD-03 | T-01-03 | Rejects major-version runtime dependency drift | script | `pnpm run ci:check-dependency-drift` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
