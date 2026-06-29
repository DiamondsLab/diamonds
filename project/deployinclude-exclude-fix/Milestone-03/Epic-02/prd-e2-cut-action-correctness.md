# Change Plan (PRD) — M3-E2 Cut-Action Correctness

> **Epic overview:** [e2-cut-action-correctness.md](overview/e2-cut-action-correctness.md) · **Parent:** [Milestone 4 (M3)](../overview/milestone-04-upgrade-path-and-dead-code-hardening.md) · **Probe findings:** [M3-E1 CHANGELOG](../Epic-01/CHANGELOG.md) · **Oracle:** INV-4
> **Status:** 📋 ready · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-29

## 1. Overview & Problem
The M3-E1 probe found **one** real upgrade bug (S-3): when a facet is redeployed with `deployExclude:[S]`,
`resolveFunctionSelectorRegistry`'s Exclusion Filter sets the `Remove` entry's `address` to
`currentFacetAddress` (non-zero). EIP-2535 requires a `Remove` cut to use `address(0)` → the cut would
**revert on-chain**. The `5b2f7af` Replace branch (S-1) is **correct** (verified). **Goal:** fix the
Remove address; confirm + document `5b2f7af`; green the S-3 probe with no regression.

## 2. Goals
- Exclusion Filter `Remove` entry uses `zeroAddress` (EIP-2535 valid).
- M3-E1 S-3 → **green**; S-1/S-2/S-4 stay green.
- `5b2f7af` branch comment/docstring updated to "verified (M3-E1 S-1)".
- No regression: Fixtures A/B/C, `DeployIncludeExclude`/`DeployAdditive`, full root + submodule suites green.

## 3. Scope — Components & Services
- **Edit (submodule):** `packages/diamonds/src/resolution/selectorResolution.ts` — the Exclusion Filter
  `Remove` `address` (→ `zeroAddress`); docstring/comment for `5b2f7af`.
- **Build:** `yarn workspace @diamondslab/diamonds build`. **Unchanged:** the override/priority logic.

## 4. Stakeholders & Impact
- **Affected:** correctness of `deployExclude`-on-upgrade. No fresh-deploy impact (the branch rarely fires
  there). No production/published surface.

## 5. Operational Requirements
1. In the Exclusion Filter, the `Remove` entry MUST use `address: zeroAddress` (not `currentFacetAddress`),
   matching the other Remove paths (Remove-Old + deleted-facets passes).
2. The `5b2f7af` Replace branch MUST be left functionally unchanged (verified correct by S-1) — only its
   comment/docstring updated to drop the "unverified" caveat.
3. Rebuild; **all green:** M3-E1 probe (S-1…S-4), M1 unit oracle, `DeployIncludeExclude`/`DeployAdditive`,
   full root `yarn test`, submodule suite.
4. Commit submodule (`--no-verify`).

## 6. Security & Compliance Considerations
- None — library logic; no secrets/provider/production.

## 7. Non-Goals (Out of Scope)
- Removing the dead `higherPrioritySplit` → M3-E3. Integration upgrade test → M3-E4.

## 8. Risk, Rollback & Recovery
- **Risk:** the Remove-address change affects a fresh-deploy case. **Mitigation:** full suite + M1 oracle
  before/after; the change aligns the exclude path with the already-zero Remove paths. **Rollback:** revert
  the one-line change.

## 9. Validation / Success Metrics
- M3-E1 probe → 4/4 green; M1 unit oracle green; `DeployIncludeExclude` 17/17; `DeployAdditive` green; full
  root `yarn test` 191/69/0; submodule suite green.

## 10. Open Questions
- None — the fix is a single, probe-pinpointed line.
