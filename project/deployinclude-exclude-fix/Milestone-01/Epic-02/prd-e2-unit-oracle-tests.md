# Change Plan (PRD) — M1-E2 Unit Oracle Tests

> **Epic overview:** [e2-unit-oracle-tests.md](overview/e2-unit-oracle-tests.md) · **Parent milestone:** [Milestone 2 (M1)](../overview/milestone-02-testable-resolution-core.md) · **Project plan:** [project-plan](../../deployinclude-exclude-fix-project-plan.md) · **Oracle:** [architecture §4](../../deployinclude-exclude-fix-architecture.md) (frozen) · **Audit:** [test-audit-matrix §D](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 ready for `/generate-tasks` · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-28

## 1. Overview & Problem
The pure resolution core exists (M1-E1, `src/resolution/`) but is **untested at the unit level**. This
epic encodes the frozen oracle's §4 truth table as fast, **chain-free** unit tests so the project finally
has its genuine RED targets. **Goal:** Fixtures A & B become **green regression guards**; the
**additivity (INV-3)** case and a single **upgrade-path** probe become **RED** — the precise things M2 and
M3 will green.

**Owner decisions (2026-06-28):** runner = **reuse `yarn test:unit`** (hardhat+mocha+chai) in `test/unit/`;
**skip INV-7/INV-8** (enforcement is the validator's, DR-3); upgrade probe = **one representative case**.

## 2. Goals
- A table-driven unit suite at `packages/diamonds/test/unit/selectorResolution.test.ts` run via
  `yarn test:unit` **without deploying** (constructed inputs only).
- **Fixture A** (exclude → absent; INV-1/6) and **Fixture B** (override; INV-2) **green**.
- **Additivity** (INV-3) **RED** — the headline gap.
- **One upgrade-path probe** (INV-4 on the `Deployed`/different-address path) authored; its real red/green
  **recorded, not assumed**.
- **INV-9** (non-existent selector → no-op) **green**.

## 3. Scope — Components & Services
- **New (submodule):** `packages/diamonds/test/unit/selectorResolution.test.ts` — auto-picked by the
  existing `test:unit` glob (`test/unit/**/*.test.ts`), so **no script change**.
- **Under test (read-only):** `src/resolution/selectorResolution.ts` — `computeFacetSelectors` and
  `resolveFunctionSelectorRegistry`.
- **Reference:** the §4 truth table + the audit "add" list.
- **Runtime:** none — pure functions on constructed inputs (no Hardhat node, no deploy).

## 4. Stakeholders & Impact
- **Affected:** M2 (greens additivity), M3 (greens the upgrade probe), M4-E3 (lifts the test names into
  the traceability matrix).
- **User-facing / production impact:** **none** — new test file only.

## 5. Operational Requirements
1. Tests MUST run via `yarn test:unit` and MUST NOT deploy or require a provider (constructed inputs only).
2. The suite MUST be **table-driven** (each case a data record) and assert on the **stable contract** —
   selector → owning facet + address + action — not internal registry fields.
3. To mirror the strategy's real flow, truth-table cases MUST **compose** the two pure functions:
   `computeFacetSelectors(...)` to produce each facet's `funcSelectors`, then
   `resolveFunctionSelectorRegistry({ registry, newDeployedFacets, facetNames })`, then assert the
   resulting registry ownership.
4. **Fixture A** (only Exclude@50, `deployExclude:[testDeployExclude()]`) MUST assert `0xdc38f9ab` is
   **absent** and `0x7f0c610c` → Exclude — **green**.
5. **Fixture B** (Exclude@50 no directive; Include@60 `deployInclude:[testDeployInclude()]`) MUST assert
   `0x7f0c610c` → Include (override) and `0xdc38f9ab` → Exclude — **green**.
6. **Additivity (INV-3)** MUST be asserted directly on `computeFacetSelectors`:
   `computeFacetSelectors([selX, selY], ["funcX()"], [])` currently returns `[selX]` (whitelist) — the
   test asserts the **additive** expectation `[selX, selY]` and is therefore **RED** at HEAD. Annotate
   with a TODO → M2.
7. The **upgrade probe** MUST construct a `registry` pre-populated with a `Deployed` entry for a selector
   at address X, plus `newDeployedFacets` placing that selector's facet at a **different** address Y, run
   `resolveFunctionSelectorRegistry`, and assert the expected `Replace` end-state. **Run it and record the
   actual red/green** in the epic CHANGELOG (expected RED → M3; do not assume).
8. **INV-9** MUST be covered: a non-existent signature in include/exclude is a no-op (green).
9. Every intentional RED MUST be **clearly annotated** (TODO + target milestone); **no other test may be
   left red**, and the rest of `yarn test:unit` MUST stay green.

## 6. Security & Compliance Considerations
- **None.** New unit-test file exercising pure functions — no secrets, provider, network, or production
  resources; **no human-approval gate** applies.

## 7. Non-Goals (Out of Scope)
- **Fixing** additivity or the upgrade path → M2 / M3.
- The **integration** additivity proof (Fixture C config + on-chain test) → M1-E3.
- **INV-7/INV-8** tests → deferred to the validator effort (DR-3).
- A **jest** harness → not chosen; reuse `test:unit`.
- Any change to `src/resolution/` or `BaseDeploymentStrategy` (tests only).

## 8. Risk, Rollback & Recovery
- **Risk:** tests couple to internal registry shape → brittle. **Mitigation:** assert the stable
  owner/address/action contract only.
- **Risk:** the upgrade probe is **assumed** RED but actually passes. **Mitigation:** run it and record
  the real result (the exact mistake that derailed the original premise); if green, document that the
  `5b2f7af` path already handles it and narrow M3.
- **Risk:** `yarn test:unit` (hardhat) overhead makes the "unit" suite slow. **Mitigation:** acceptable
  (submodule unit run is ~seconds); revisit jest only if it bites.
- **Rollback:** delete the test file. **No backup required** (additive, no production surface).

## 9. Validation / Success Metrics
- `yarn test:unit` runs the new file chain-free; **Fixtures A/B + INV-9 green**, **additivity RED**,
  **upgrade probe red/green recorded**.
- The rest of the submodule unit suite stays green (no regression).
- Each RED is annotated with its target milestone; a reviewer can map every case to a §4 row / invariant.

## 10. Open Questions
- Exact helper shape for building `newDeployedFacet` records in the table (a small factory vs inline
  literals) — decide in `/generate-tasks`; lean to a tiny factory to keep cases readable.
- Whether to also assert `computeFacetSelectors` exclude-only behavior as its own green case (cheap; likely yes).
