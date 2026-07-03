# Epic 2 — Remove Unused Deps (M1-E2)

> **Parent milestone:** [Milestone 2 — Audit Gate: Remove Unused Vulnerable Deps (M1)](../../overview/milestone-02-audit-remove-unused-vulnerable-deps.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M1 → M1-E2
> **Owner:** Engineer · **Impact/blast radius:** `packages/diamonds/package.json` + lockfile; no source code · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Remove the confirmed-unused `axios` and `lodash` direct dependencies from `packages/diamonds/package.json`, regenerate the lockfile, and re-measure `yarn npm audit` to see how many of the 26 advisories cleared. This is the actual gate-clearing change — small, reversible, no code impact (0 imports).

## 2. Acceptance criteria
- [ ] `axios` + `lodash` removed from `dependencies` in `packages/diamonds/package.json`.
- [ ] Lockfile regenerated via a **standalone** `yarn install` inside `packages/diamonds` (per the monorepo-wiring gotcha — not a root install).
- [ ] `yarn npm audit --severity moderate` re-run; the new advisory count recorded (ideally 0; any residual handed to M1-E3).
- [ ] The pre-existing, unrelated `yarn.lock` working-tree diff is **not** bundled into this change.
- [ ] No source code changed.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Remove `axios` + `lodash` lines from `package.json` `dependencies` | Engineer | edited |
| 2 | Regenerate the lockfile via standalone `yarn install` inside `packages/diamonds` | Engineer | lock updated cleanly |
| 3 | Re-run `yarn npm audit --severity moderate`; record the resulting count + any residual advisories | Engineer | count recorded |
| 4 | Confirm the diff is limited to `package.json` + the intended `yarn.lock` changes (exclude the pre-existing unrelated lock diff) | Engineer | diff scoped |

## 4. Dependencies & owner gates
- **Upstream:** M1-E1 (go/no-go + residual list). **Do not remove** until E1 confirms unused.
- **Owner gates:** none in this epic (removal itself is reversible; the conditional owner gate lives in M1-E3).
- **Downstream:** M1-E3 (residual disposition + verification).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Standalone install churns the devcontainer node_modules (yarn state bug / hoisting) | Install **inside** `packages/diamonds`, not the root; if the state bug bites, follow the M0 harness pattern |
| The regenerated lock also picks up the pre-existing unrelated `yarn.lock` diff | Review the lock diff; keep the commit scoped to the axios/lodash removal |
| Removal doesn't clear an advisory (transitive) | Expected for any advisory E1 flagged transitive → hand to M1-E3, don't treat as failure |

## 6. Notes
- Reversible via a single `git checkout` of `package.json` + `yarn.lock`.
- No functional change — both deps have 0 imports (confirmed in M1-E1), so build/tests should be unaffected (M1-E3 verifies).
- Keep source untouched; this epic only edits `package.json` + regenerates the lock.
