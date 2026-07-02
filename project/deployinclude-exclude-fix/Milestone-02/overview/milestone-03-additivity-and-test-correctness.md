# Milestone 3 — Additivity & Test Correctness (M2)

> **Maps to:** [project-plan](../../deployinclude-exclude-fix-project-plan.md) → §5 "M2 — Additivity & test correctness" · Oracle: [architecture](../../deployinclude-exclude-fix-architecture.md) (INV-3, INV-6) · Audit: [test-audit-matrix](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 planned — *the first FIX milestone (greens the M1 REDs).*
> **Prod / impact:** Library behavior change (`deployInclude` becomes additive) — guarded by the full suite + the M1 unit guards. No outward-facing surface.
> **Author:** Am0rfu5 · **Date:** 2026-06-29
> **Epic breakouts:** [e1-additivity-fix](../Epic-01/overview/e1-additivity-fix.md) · [e2-test-correction](../Epic-02/overview/e2-test-correction.md)

---

## 1. Why this milestone exists
M1 left two **verified RED** targets proving the additivity gap (INV-3): the M1-E2 unit test and the
skipped `DeployAdditive` integration test. Both fail for one reason — the deploy-time `deployInclude`
**whitelist** drops a facet's other selectors. M2 **removes that whitelist** (making `deployInclude`
additive) to green both, and rewrites the **vacuous** assertions the audit flagged (B4, L142-164) so the
suite asserts the design directly. It is the first milestone that *fixes* rather than *characterizes*.

Critical path: `M0 ✅ → M1 ✅ → **M2** → M3 → M4`.

## 2. Goal & exit criteria
**Goal:** `deployInclude` is additive (a facet keeps its non-included selectors); the audit's vacuous
assertions assert the oracle directly. **Exit:**
- [ ] The deploy-time `deployInclude` whitelist is removed from `computeFacetSelectors` (INV-3).
- [ ] M1-E2 **unit** additivity test → **green**.
- [ ] `DeployAdditive.test.ts` additivity test **un-skipped** → **green**.
- [ ] `DeployIncludeExclude.test.ts:142-164` (B4) rewritten to assert **INV-6 absence directly**
      (`facetAddress(0xdc38f9ab) == ZeroAddress`) and passes.
- [ ] **No regression:** Fixtures A/B still green; full root `yarn test` green; submodule suite green.

## 3. Scope
**In scope**
- Remove the `deployInclude` whitelist in `packages/diamonds/src/resolution/selectorResolution.ts`
  (`computeFacetSelectors`).
- Un-skip the `DeployAdditive` integration additivity test (root).
- Rewrite the vacuous B4 assertion in `DeployIncludeExclude.test.ts` (+ align `SelectorRegistration.test.ts` if needed).

**Out of scope (deferred)**
- The override logic in `resolveFunctionSelectorRegistry` — **unchanged** (it already does the override).
- Upgrade-path adversarial probing + dead `higherPrioritySplit` removal + `5b2f7af` reconcile → **M3**.
- INV-7/INV-8 enforcement → validator (DR-3).

## 4. Roles
- **Engineer (agent-assisted):** both epics. **Owner:** none blocking.

## 5. Epics
| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M2-E1 | additivity-fix | Engineer | High | [e1-additivity-fix](../Epic-01/overview/e1-additivity-fix.md) |
| M2-E2 | test-correction | Engineer | Med | [e2-test-correction](../Epic-02/overview/e2-test-correction.md) |

### M2-E1 — `additivity-fix`
Remove the deploy-time whitelist from `computeFacetSelectors` so `deployInclude` no longer drops the
facet's other selectors (candidate set = ABI selectors minus `deployExclude` only). The **override**
(force-ownership over higher priority) is unchanged — it lives in `resolveFunctionSelectorRegistry`. Then
un-skip `DeployAdditive`. **Acceptance:** both additivity REDs green; A/B + full suite still green (the
symmetric fixtures are unaffected because the non-included selector is reclaimed by the higher-priority
facet via normal priority resolution). **Key risk:** an A/B regression — guarded by the M1 unit oracle +
full suite.

### M2-E2 — `test-correction`
Rewrite `DeployIncludeExclude.test.ts:142-164` (B4) — currently vacuous (its `if (registry.has(…))` guard
is false, so it asserts nothing) — to assert **INV-6 absence directly**: under the exclude config,
`facetAddress(0xdc38f9ab)` is `ZeroAddress` (no facet owns it). Scan for sibling vacuous/indirect
assertions and align `SelectorRegistration.test.ts`. **Acceptance:** the rewritten assertion passes and is
non-vacuous; full suite green. **Key risk:** minimal.

## 6. Dependencies & sequencing
- **Upstream:** M1 (the two REDs + the audit). **Internal:** E1 first (the fix), then E2 (test correction)
  — independent, but E1's green proves the fix before E2 tidies assertions.
- **Downstream:** M3 (upgrade path), M4 (regression + sign-off).
- **Two repos:** E1's fix is in the **submodule** (`src/resolution`) + a root un-skip; E2 is **root** tests.

## 7. Rollback posture
Small + reversible: revert the `computeFacetSelectors` change (one block) and the test edits. The override
logic is untouched, so reverting restores exact prior behavior.

## 8. Risks (milestone-scoped)
| Risk | Mitigation |
|------|------------|
| Removing the whitelist regresses Fixtures A/B | Full root suite + the M1-E2 unit oracle (A/B green guards) run before/after. |
| The override no longer fires once candidates include extra selectors | `resolveFunctionSelectorRegistry` override is unchanged; the M1 unit + integration tests prove ownership. |
| A rewritten assertion masks a real issue | Make B4 assert the strongest direct fact (`facetAddress == 0`); re-run the full suite. |

## 9. Definition of Done for Milestone 3 (M2)
- `deployInclude` additive; both additivity REDs **green** (unit + integration un-skipped).
- B4 rewritten non-vacuous + passing; full root + submodule suites green.
- Clean handoff to **M3** (upgrade-path probing + dead-code removal).

---
**Next:** `/df3ndr:breakout-epics` (done in this run) → `/create-prd` per epic → `/generate-tasks` → `/process-task-list`.
