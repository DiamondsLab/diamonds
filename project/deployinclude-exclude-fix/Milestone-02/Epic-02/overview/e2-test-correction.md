# Epic 2 — Test Correction (M2-E2)

> **Parent milestone:** [Milestone 3 — Additivity & Test Correctness (M2)](../../overview/milestone-03-additivity-and-test-correctness.md)
> **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M2, row M2-E2 · Audit: [test-audit-matrix §B (B4)](../../../Milestone-00/test-audit-matrix.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** Root test files only; no source/contract. · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
Replace the **vacuous** assertions the M0-E3 audit flagged with ones that assert the oracle **directly**.
Primary target: `DeployIncludeExclude.test.ts:142-164` (B4) — its `if (registry.has('0xdc38f9ab'))` guard
is false at HEAD, so it asserts nothing. Rewrite it to assert **INV-6 absence directly**.

## 2. Acceptance criteria
- [ ] `DeployIncludeExclude.test.ts:142-164` rewritten to assert, under the exclude config,
      `facetAddress(0xdc38f9ab) == ZeroAddress` (no facet owns the excluded selector) — a **non-vacuous**
      assertion that runs unconditionally.
- [ ] Any sibling vacuous/indirect assertions identified in the audit are aligned (incl. a scan of
      `SelectorRegistration.test.ts`).
- [ ] The rewritten test **passes**; full root `yarn test` stays green.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Rewrite `DeployIncludeExclude.test.ts:142-164` to assert `facetAddress(0xdc38f9ab) == ZeroAddress` via the loaded diamond loupe (drop the `if (registry.has(...))` guard) | Engineer | assertion is unconditional + direct |
| 2 | Scan `DeployIncludeExclude.test.ts` + `SelectorRegistration.test.ts` for other vacuous/indirect assertions; align as the audit prescribes | Engineer | no remaining guard-gated empty assertions in scope |
| 3 | Run the exclude describe-block + full root `yarn test`; confirm green | Engineer | green |
| 4 | Leave root tests uncommitted (per owner); record | Engineer | recorded |

## 4. Dependencies & owner gates
- **Upstream:** M0-E3 audit (identified B4) + M2-E1 (the fix — so the suite reflects correct behavior).
  **Owner gates:** none. **Downstream:** M4-E3 traceability.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Rewriting to assert the wrong fact | Assert the strongest direct invariant (`facetAddress == 0` for INV-6); re-run the full suite. |

## 6. Notes
- Root test files only; no source/contract. Reversible (revert the edits).
- Depends on M2-E1 landing first so the assertions reflect the corrected (additive) behavior.
