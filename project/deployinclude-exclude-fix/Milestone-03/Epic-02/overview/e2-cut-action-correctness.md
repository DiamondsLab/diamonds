# Epic 2 — Cut-Action Correctness (FIX) (M3-E2)

> **Parent milestone:** [Milestone 4 (M3)](../../overview/milestone-04-upgrade-path-and-dead-code-hardening.md) · **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) §5 M3 row M3-E2 · Oracle: INV-4
> **Owner:** Engineer · **Impact:** Touches the delicate `5b2f7af`/override logic. · **Effort:** S–M (**scope set by M3-E1**) · **Status:** 📋 planned

## 1. Objective
Fix whatever M3-E1's probe exposes on the upgrade/redeploy path: derive `Add` vs `Replace` correctly from
prior `Deployed`/registered state; replace the `5b2f7af` patch with verified-correct logic (or confirm +
document it); reconcile with `validateNoOrphanedSelectors` so no `"function already exists"` /
orphaned-selector revert (INV-4). **If M3-E1 is all-green, this epic is documentation only.**

## 2. Acceptance criteria
- [ ] Every M3-E1 scenario that was RED is now **green**.
- [ ] The `5b2f7af` branch is either replaced by verified-correct logic, or **confirmed correct + documented** (remove the "unverified" caveat).
- [ ] No `"function already exists"` / orphaned-selector revert (INV-4); `validateNoOrphanedSelectors` reconciled.
- [ ] No regression: Fixtures A/B/C green; full root + submodule suites green.

## 3. Tasks (provisional — finalized after M3-E1)
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | From M3-E1 findings, identify the exact code path(s) that mishandle the `Deployed` state | Engineer | root cause(s) pinned |
| 2 | Fix the `Add`/`Replace` derivation; replace/confirm `5b2f7af` | Engineer | RED scenarios green |
| 3 | Rebuild + run unit + integration + full suites | Engineer | all green |
| 4 | Commit submodule (`--no-verify`); record | Engineer | committed |

## 4. Dependencies & owner gates
- **Upstream:** **M3-E1 (sets scope)**. **Owner gates:** none. **Downstream:** M3-E4, M4.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Fixing the upgrade path regresses fresh-deploy | M1 unit oracle + full suite before/after. |

## 6. Notes
- Scope is deliberately provisional — **do not pre-fix**; let M3-E1's probe define the work.
