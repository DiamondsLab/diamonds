# Epic 2 — Unit Oracle Tests (M1-E2)

> **Parent milestone:** [Milestone 2 — Testable Resolution Core (M1)](../../overview/milestone-02-testable-resolution-core.md)
> **Maps to:** [project plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M1 epic table, row M1-E2 · Oracle truth table: [architecture §4](../../../deployinclude-exclude-fix-architecture.md) · Audit "add" list: [test-audit-matrix §D](../../../Milestone-00/test-audit-matrix.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** New tests only (no source). Defines the project's RED targets. · **Estimated effort:** M · **Status:** 📋 planned

## 1. Objective

Encode the **frozen** oracle's §4 truth table + invariants as fast, **chain-free**, table-driven unit
tests against the pure resolution function (M1-E1). Fixtures A & B become **green regression guards**;
the **additivity** and **upgrade-path** cases become the project's genuine **REDs** — the precise targets
M2 and M3 will green.

## 2. Acceptance criteria

- [ ] `packages/diamonds/test/unit/selectorResolution.test.ts` runs via `yarn test:unit` **without
      deploying** (constructed inputs only).
- [ ] **Fixture A** (exclude → absent; INV-1/INV-6) **green**.
- [ ] **Fixture B** (lower-priority include overrides higher; INV-2) **green**.
- [ ] **Fixture C-additive** (including facet owns **both** its selectors; INV-3) authored → **RED**.
- [ ] **Upgrade-path** case (prior `Deployed` facet at a different address → correct `Add`/`Replace`;
      INV-4) authored as a **probe**; **run it and record the actual red/green** (expected RED, greened
      in M3 — but **do not assume**, per the M0-E2 lesson).
- [ ] **INV-9** edge (non-existent selector in include/exclude → no-op) **green**.
- [ ] All intentional REDs **annotated** with a TODO referencing M2/M3; no other test left red.

## 3. Tasks

| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Scaffold the table-driven harness (each case = `{ facets, priorState, expected: { ownership, cuts } }`) | Engineer | one green scaffold case runs via `yarn test:unit` |
| 2 | Encode Fixtures A + B from truth table §4.1/§4.2 | Engineer | both green against the pure fn |
| 3 | Encode Fixture C-additive (§4.3): assert Include owns **both** `0x7f0c610c` and `0xdc38f9ab` | Engineer | authored; **RED** |
| 4 | Encode the upgrade-path probe (construct `priorDeployedState` with a facet at an old address) | Engineer | authored; **actual red/green recorded** in the epic CHANGELOG |
| 5 | Encode INV-9 edge (non-existent selector → no-op) | Engineer | green |
| 6 | Annotate intentional REDs (TODO→M2/M3); run `yarn test:unit` | Engineer | suite runs chain-free; only sanctioned REDs are red |

## 4. Dependencies & owner gates

- **Upstream:** **M1-E1** (the pure function — its signature is what these tests call) + M0 (frozen truth
  table + audit "add" list).
- **Owner gates:** **none.**
- **Downstream:** M2 greens the additivity case; M3 greens the upgrade case; M4-E3 lifts the test names
  into the §11 traceability matrix.

## 5. Risks

| Risk | Mitigation |
|------|------------|
| Tests couple to internal registry shapes → brittle | Assert on the **stable contract** (owner facet + address + action), not internal fields. |
| Upgrade probe is **assumed** RED but actually passes | **Run it** and record the real result (the exact mistake that derailed the original premise); if green, document that the `5b2f7af` path already handles that scenario and narrow M3. |
| "Chain-free" leaks a provider dependency | Inputs are constructed objects; the pure fn (M1-E1) forbids provider imports — keep tests free of `hre`/deploy. |

## 6. Notes

- This is the **unit** layer; the **integration** proof of additivity is **M1-E3** (root fixture + on-chain test).
- **Reversible:** a new test file — revert to remove.
- Mirror the audit matrix §D "add" list so M4-E3 traceability is mechanical.
