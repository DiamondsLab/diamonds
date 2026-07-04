# Change Plan (PRD) — M1-E2 Remove Unused Deps

> **Expands:** [`overview/e2-remove-unused-deps.md`](overview/e2-remove-unused-deps.md) · **Parent:** [Milestone 2 (M1)](../overview/milestone-02-audit-remove-unused-vulnerable-deps.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** dependency change (reversible) · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03 · **Depends on:** M1-E1 (GO — all 26 advisories direct, clear on removal)

## 1. Overview & Problem
The npm-audit gate fails on 26 advisories, all on the unused direct deps `axios` (23) + `lodash` (3) — confirmed by M1-E1 (0 imports anywhere; `@diamondslab/diamonds` is their sole dependent). **Goal:** remove both from `package.json` `dependencies`, regenerate the lockfile, and re-audit to confirm the count drops to **0**. Small, reversible, no source impact.

## 2. Goals
- G1 — `axios` + `lodash` removed from `packages/diamonds/package.json` `dependencies`.
- G2 — Lockfile regenerated via a **standalone** `yarn install` inside `packages/diamonds`.
- G3 — `yarn npm audit --severity moderate` re-run; count recorded (expected **0**; any residual → M1-E3).
- G4 — Diff scoped to the intended change (exclude the pre-existing unrelated `yarn.lock` diff).

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` only.
- **Edited:** `packages/diamonds/package.json` (`dependencies` — remove 2 lines); `packages/diamonds/yarn.lock` (regenerated).
- **Run:** `yarn install` (standalone, inside the submodule), `yarn npm audit --severity moderate`.
- **No source code** touched.

## 4. Stakeholders & Impact
- **Engineer (agent):** executes. **Owner:** none for this epic (removal is reversible; the conditional owner gate is M1-E3). **User-facing/production impact:** none — removing unused deps has no runtime effect (0 imports); the published package simply stops declaring two deps it never used.

## 5. Operational Requirements
1. Remove the `axios` and `lodash` entries from `dependencies` in `packages/diamonds/package.json`.
2. Regenerate the lockfile via `yarn install` run **inside** `packages/diamonds` (standalone — not a root install), per the monorepo-wiring gotcha.
3. Re-run `yarn npm audit --severity moderate`; record the new advisory count + any residual.
4. Ensure the commit diff is limited to `package.json` (2 removed lines) + the intended `yarn.lock` regeneration — the pre-existing unrelated `yarn.lock` working-tree diff must not be conflated.
5. Make **no** source code change.

## 6. Security & Compliance Considerations
- No secrets/credentials/elevated privileges. This *reduces* attack surface (drops 26 advisories).
- Lockfile regeneration pulls no new packages of concern (it removes two subtrees); re-audit confirms.

## 7. Non-Goals (Out of Scope)
- Residual/transitive advisory disposition + regression verification (M1-E3).
- Replacing axios/lodash functionality (unused — nothing to replace).
- Touching other dependencies or source.

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — a single reversible commit.
- **Risk:** standalone install churns the devcontainer node_modules (yarn state bug / hoisting) → **Mitigation:** install inside the submodule; follow the M0 harness pattern if the state bug appears.
- **Risk:** the regenerated lock conflates the pre-existing unrelated `yarn.lock` diff → **Mitigation:** review the lock diff; keep the commit scoped.
- **Risk:** removal doesn't clear an advisory (unexpected transitive) → **Mitigation:** M1-E1 found 0 transitive; if one appears, hand to M1-E3.
- **Rollback:** `git checkout packages/diamonds/package.json packages/diamonds/yarn.lock` restores both deps.

## 9. Validation / Success Metrics
- `yarn npm audit --severity moderate` after removal → **0 findings** (or residual handed to M1-E3).
- `packages/diamonds/package.json` no longer lists `axios`/`lodash`; `yarn why axios` / `yarn why lodash` → not found.
- `git diff` is limited to the two package.json removals + intended lock changes.

## 10. Open Questions
- If `yarn install` inside the submodule triggers the state bug or unwanted hoisting, is a lock-only update acceptable? **Default:** yes — the requirement is a consistent regenerated lock without axios/lodash; use whatever reliable path achieves it (per M0 harness).

**Next:** `/generate-tasks` against this PRD.
