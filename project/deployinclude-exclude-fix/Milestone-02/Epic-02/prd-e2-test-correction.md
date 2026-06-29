# Change Plan (PRD) — M2-E2 Test Correction

> **Epic overview:** [e2-test-correction.md](overview/e2-test-correction.md) · **Parent milestone:** [Milestone 3 (M2)](../overview/milestone-03-additivity-and-test-correctness.md) · **Audit:** [test-audit-matrix B4](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-29

## 1. Overview & Problem
`DeployIncludeExclude.test.ts:142-164` (B4) is **vacuous** — its `if (registry.has('0xdc38f9ab'))` guard is
false under the exclude config, so it asserts nothing (and its inner assertion encodes the old bug).
**Goal:** rewrite it to assert **INV-6 absence directly** — under the exclude config no facet owns
`0xdc38f9ab` (`facetAddress == ZeroAddress`).

## 2. Goals
- B4 asserts `exampleDiamond.facetAddress('0xdc38f9ab') == ZeroAddress` **unconditionally** (non-vacuous).
- Scan `DeployIncludeExclude.test.ts` + `SelectorRegistration.test.ts` for other vacuous/indirect assertions.
- The rewritten test passes; `DeployIncludeExclude` stays 17/17; full root `yarn test` green.

## 3. Scope — Components & Services
- **Edit (root):** `test/deployment/DeployIncludeExclude.test.ts` (the B4 `it` block, exclude describe).
- **Reviewed (root):** `test/deployment/SelectorRegistration.test.ts` (align if needed).
- No source/contract/config changes.

## 4. Stakeholders & Impact
- **Affected:** M4-E3 traceability. **User-facing/production:** none (a root test edit).

## 5. Operational Requirements
1. B4 MUST assert `facetAddress('0xdc38f9ab') == '0x0000…0000'` via the loaded diamond loupe,
   **unconditionally** (drop the `if (registry.has(...))` guard and the bug-encoding assertion).
2. Other vacuous/indirect assertions found in the two suites MUST be aligned per the audit.
3. The rewritten test MUST pass; `DeployIncludeExclude` 17/17; full root `yarn test` green.
4. Root test files are **left uncommitted** (per the established convention).

## 6. Security & Compliance Considerations
- None — a root test edit; no secrets/provider/production; no approval gate.

## 7. Non-Goals (Out of Scope)
- Source/contract/config changes; upgrade path (M3); INV-7/8.

## 8. Risk, Rollback & Recovery
- **Risk:** asserting the wrong fact. **Mitigation:** assert the strongest direct INV-6 fact
  (`facetAddress == 0`) and re-run the suite. **Rollback:** revert the edit. **No backup required.**

## 9. Validation / Success Metrics
- The rewritten B4 passes and runs unconditionally; `DeployIncludeExclude` 17/17; full root `yarn test` green.

## 10. Open Questions
- Whether `SelectorRegistration.test.ts` needs any change — likely not (its tests are pure calc/parse,
  already non-vacuous); confirm during execution.
