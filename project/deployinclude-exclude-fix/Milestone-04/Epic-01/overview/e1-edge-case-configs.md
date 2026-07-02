# Epic 1 — Edge-Case Configs (M4-E1)

> **Parent milestone:** [Milestone 5 (M4)](../../overview/milestone-05-regression-and-signoff.md) · **Maps to:** [project-plan](../../../deployinclude-exclude-fix-project-plan.md) §5 M4 row M4-E1 · Oracle: INV-9, INV-7/DR-4 · Audit: [B15/B16/B17](../../../Milestone-00/test-audit-matrix.md)
> **Owner:** Engineer · **Impact:** Root test files only. · **Effort:** S · **Status:** 📋 planned

## 1. Objective
Make the three edge-case tests in `DeployIncludeExclude.test.ts` assert the **oracle**, not just "deploys":
`invalid-include`/`invalid-exclude` → INV-9 directly; `include-and-exclude` (B17) → **pending/deferred**
per the ratified INV-7 (hard error; enforcement is the validator's, DR-4).

## 2. Acceptance criteria
- [ ] **B15/B16** (`invalid-exclude`/`invalid-include`, INV-9): assert the non-existent signature is a
      **no-op** and the deploy **succeeds** — tighten the broad `try/catch` to a direct assertion.
- [ ] **B17** (`include-and-exclude`, INV-7): reframe from `expect(DiamondAddress).to.exist` ("handled") to
      a **pending/`it.skip`** documenting that it's an **invalid config** whose hard-error enforcement is
      deferred to the validator (DR-4) — not "succeeds".
- [ ] Full root `yarn test` stays green (the reframed B17 → pending, not failing).

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Tighten B15/B16 to assert deploy success + the selector is simply absent (INV-9 no-op) | Engineer | direct, non-`try/catch` assertions |
| 2 | Reframe B17 to `it.skip` with a TODO noting INV-7 hard-error enforcement is the validator's (DR-4) | Engineer | B17 pending + documented |
| 3 | Run `DeployIncludeExclude` + full root `yarn test`; confirm green | Engineer | green |

## 4. Dependencies & owner gates
- **Upstream:** M0-E3 audit (B15/16/17) + M0-E1 ratified INV-7. **Owner gates:** none. **Downstream:** M4-E3 traceability.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| Tightening B15/B16 surfaces a real INV-9 deviation | Run them; if the config behaves unexpectedly, record it as a finding (not a silent pass). |

## 6. Notes
- Root test file → uncommitted (convention). Reversible.
