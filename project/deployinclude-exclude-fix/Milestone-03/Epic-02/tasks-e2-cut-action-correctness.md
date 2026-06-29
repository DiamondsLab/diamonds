# Tasks — M3-E2 Cut-Action Correctness

Execution checklist for [prd-e2-cut-action-correctness.md](prd-e2-cut-action-correctness.md). One-line fix
for the S-3 RED: Exclusion Filter `Remove` → `zeroAddress`. Plus confirm/document `5b2f7af`.

## Relevant Files & Resources
- **Edit (submodule):** `packages/diamonds/src/resolution/selectorResolution.ts` (Exclusion Filter; `5b2f7af` comment/docstring).
- **Tests:** `test/unit/selectorResolutionUpgrade.test.ts`, `selectorResolution.test.ts`, root `DeployIncludeExclude`/`DeployAdditive`.
- **Append:** `…/Milestone-03/Epic-02/CHANGELOG.md`.

### Notes
- On `feature/resolution-seam`. Rebuild submodule after src edit. Override/priority logic unchanged → M3-E3 removes dead code.

## Tasks
- [x] 0.0 Prepare — on `feature/resolution-seam`.
- [x] 1.0 Fix
  - [x] 1.1 Exclusion Filter Remove `address` → `zeroAddress`.
  - [x] 1.2 Docstring: `5b2f7af` verified correct (M3-E1 S-1), kept as-is.
- [x] 2.0 Build + verify — submodule `test:unit` **51/0** (probe 4/4 green incl S-3); full root `yarn test` **191/69/0**. No regression.
- [x] 3.0 Committed submodule `10be83f` (`--no-verify`); CHANGELOG + memory updated.

> ✅ **M3-E2 COMPLETE.** S-3 fixed; `5b2f7af` confirmed correct. Remaining M3: E3 (dead-code) + E4 (integration).