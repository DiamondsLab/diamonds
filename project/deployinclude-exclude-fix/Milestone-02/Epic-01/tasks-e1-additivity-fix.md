# Tasks — M2-E1 Additivity Fix

Execution checklist for [prd-e1-additivity-fix.md](prd-e1-additivity-fix.md). The fix: remove the
deploy-time `deployInclude` whitelist so it's additive (INV-3); green both M1 REDs. Override logic
untouched.

## Relevant Files & Resources
- `…/Milestone-02/Epic-01/prd-e1-additivity-fix.md` — the Change Plan.
- **Edit (submodule):** `packages/diamonds/src/resolution/selectorResolution.ts` (`computeFacetSelectors`).
- **Edit (root):** `test/deployment/DeployAdditive.test.ts` (un-skip).
- **Tests:** `packages/diamonds/test/unit/selectorResolution.test.ts`, `test/deployment/{DeployAdditive,DeployIncludeExclude}.test.ts`.
- **Create/append:** `…/Milestone-02/Epic-01/CHANGELOG.md`.

### Notes
- Submodule fix → commit on `feature/resolution-seam` (`--no-verify`); root un-skip → leave uncommitted.
- Rebuild submodule after src edit (root consumes dist). Override / dead code / 5b2f7af = M3, do not touch.

## Tasks
- [x] 0.0 Prepare — on `feature/resolution-seam`; baseline = unit additivity RED + `DeployAdditive` skipped RED.
- [x] 1.0 Make `deployInclude` additive
  - [x] 1.1 Removed the whitelist block in `computeFacetSelectors` (kept `deployExclude`; param → `_deployInclude`; docstring updated).
  - [x] 1.2 Un-skipped the `DeployAdditive` additivity test.
- [x] 2.0 Build + verify (all green)
  - [x] 2.2 M1-E2 unit suite → additivity **green** (`test:unit` 47/0).
  - [x] 2.3 `DeployAdditive` → **green** (Include owns both selectors).
  - [x] 2.4 `DeployIncludeExclude` → 17/17.
  - [x] 2.5 Full root `yarn test` → **191/69/0**.
- [x] **2.5b (NEWLY DISCOVERED — major):** integration was deploying via hardhat-diamonds' **nested published diamonds 1.3.2** (old whitelist), so the workspace fix didn't reach it. Fixed: hardhat-diamonds diamonds devDep → `workspace:*` + `yarn install`; then restored submodule build via standalone `yarn install` inside `packages/diamonds` (root install had hoisted typescript away). See [[diamonds-monorepo-wiring]].
- [x] 3.0 Record + commit
  - [x] 3.1 CHANGELOG written.
  - [x] 3.2 Committed diamonds src+test `886023d` (`--no-verify`). **Infra commits (hardhat-diamonds pkg, yarn.locks, M1-E3 root files) pending user decision.**
  - [x] 3.3 Memory updated (+ new [[diamonds-monorepo-wiring]] reference).

> ✅ **M2-E1 fix COMPLETE & verified** (unit + integration green; suite 191/69/0). ⚠️ **Multi-repo infra git
> (the wiring fix) still needs a decision** before this is fully "landed".
