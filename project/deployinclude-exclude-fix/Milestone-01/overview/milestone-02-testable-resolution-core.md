# Milestone 2 — Testable Resolution Core (M1)

> **Maps to:** [deployinclude-exclude-fix-project-plan.md](../../deployinclude-exclude-fix-project-plan.md) → §5 "M1 — Testable resolution core" · Oracle: [deployinclude-exclude-fix-architecture.md](../../deployinclude-exclude-fix-architecture.md) (frozen 2026-06-28) · Audit: [Milestone-00/test-audit-matrix.md](../../Milestone-00/test-audit-matrix.md)
> **Status:** 📋 planned — *first code milestone; behavior-preserving refactor + new tests/fixtures.*
> **Prod / impact:** None outward-facing (library + local tests). The seam refactor touches the live resolution path, guarded by the green baseline.
> **Author:** Am0rfu5 · **Date:** 2026-06-28
> **Epic breakouts:** [e1-resolution-seam](../Epic-01/overview/e1-resolution-seam.md) · [e2-unit-oracle-tests](../Epic-02/overview/e2-unit-oracle-tests.md) · [e3-additivity-fixture](../Epic-03/overview/e3-additivity-fixture.md) *(links resolve once `/breakout-epics` runs)*

---

## 1. Why this milestone exists

The oracle is frozen and the audit named exactly two real holes — **additivity (INV-3)** and the
**upgrade/redeploy path**. M1 builds the apparatus to attack them under TDD: a **pure, chain-free
selector-resolution function** that can be unit-tested in milliseconds against the §4 truth table, plus
the **failing tests** that pin the two gaps. Today the resolution logic is entangled inside
`BaseDeploymentStrategy.updateFunctionSelectorRegistryTasks()` (and the deploy-time include/exclude
filters), reachable only by deploying a diamond on a Hardhat node — too slow and too coupled to drive
TDD. Extracting a pure core makes the design *testable*, and (per oracle §6) seeds the shared core the
larger `basestrategy-fulfillment` effort will reuse.

It sits at `M0 → **M1** → M2 → M3 → M4`. M1 is the **one milestone that intentionally ends with RED
oracle tests** (additivity → greened in M2; upgrade → greened in M3) — see the plan §6 carve-out.

## 2. Goal & exit criteria

**Goal:** A pure/injectable resolution function exists in `packages/diamonds`, the live strategy delegates
to it with **no behavior change**, and table-driven unit tests encode the oracle — A/B green, additivity
and upgrade-path **RED (intentional)**.

**Exit criteria:**
- [ ] A pure resolution function (no Hardhat/provider dependency) exists in `packages/diamonds/src`, taking
      facet configs (priority, `deployInclude`, `deployExclude`) + facet ABIs + **prior deployed state**
      (for the upgrade path) → **ownership map + cut actions** (`Add`/`Replace`/`Remove`).
- [ ] `BaseDeploymentStrategy` delegates to it; **full `yarn test` (root) stays green** (behavior-preserving).
- [ ] Table-driven unit tests live in `packages/diamonds/test/unit/` and run via `yarn test:unit` **without
      deploying**: Fixtures **A & B pass**; the **additivity** case is **RED**; an **upgrade-path** unit case
      is authored and **RED/pending** (greened in M3) — both clearly annotated as expected.
- [ ] `examplediamond-include-additive.config.json` (Fixture C) + a root integration test exist, asserting
      the including facet owns **both** selectors — **RED** at HEAD (current whitelist drops the extra).
- [ ] No regression: the green baseline ([../../Milestone-00/baseline.md](../../Milestone-00/baseline.md)) still holds.

## 3. Scope

**In scope**
- Behavior-preserving extraction of the selector-resolution logic into a pure function (the "seam").
- Chain-free table-driven unit tests in the submodule (`test/unit/`).
- The additivity fixture (root `diamonds/ExampleDiamond/`) + its root integration test.
- Authoring (not fixing) the additivity + upgrade RED tests.

**Out of scope (deferred)**
- **Fixing** additivity (the whitelist removal) → **M2**.
- **Fixing** the upgrade/redeploy path + dead-code removal → **M3**.
- Rewriting the vacuous B4 / reframing the B17 edge test → **M2** (test-correction).
- Any config-schema change (INV-5); OZDefender.

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Engineer (agent-assisted)** | All three epics — extract the seam, write the unit harness + RED tests, build Fixture C. |
| **Owner** | None blocking. (The gate was M0-E1; it is cleared.) Optional: review the pure-function signature for promotability into the `basestrategy-fulfillment` shared core. |

No owner-only / outside-the-agent blocking work in M1.

## 5. Epics

| Epic | Title | Owner | Impact | Breakout |
|------|-------|-------|--------|----------|
| M1-E1 | resolution-seam | Engineer | High | [e1-resolution-seam](../Epic-01/overview/e1-resolution-seam.md) |
| M1-E2 | unit-oracle-tests | Engineer | High | [e2-unit-oracle-tests](../Epic-02/overview/e2-unit-oracle-tests.md) |
| M1-E3 | additivity-fixture | Engineer | Med | [e3-additivity-fixture](../Epic-03/overview/e3-additivity-fixture.md) |

### M1-E1 — `resolution-seam`
Extract the body of `updateFunctionSelectorRegistryTasks()` **plus** the deploy-time include/exclude
filters ([BaseDeploymentStrategy.ts:223-238](../../../../src/strategies/BaseDeploymentStrategy.ts#L223-L238)
and [:314-497](../../../../src/strategies/BaseDeploymentStrategy.ts#L314-L497)) into a **pure** module
(e.g. `src/strategies/selectorResolution.ts`). Proposed signature: `resolve(facets, priorDeployedState)
→ { ownership: Map<selector,{facet,address,action}>, cuts }`, where `facets` carries name/priority/abi
selectors/`deployInclude`/`deployExclude`. It may use `ethers.id` for selector math (pure) but must take
**no** Hardhat/provider. `BaseDeploymentStrategy` becomes a thin caller. **Crucially, design the
`priorDeployedState` input now** (even though upgrade *logic* is fixed in M3) so the signature is stable.
**Acceptance shape:** pure function + delegating strategy; **full `yarn test` green** (behavior-preserving).
**Key risk:** silent behavior drift → guard with the full suite + the M0 baseline. **Promotability:** shape
it so `basestrategy-fulfillment` can lift it into the shared core without redesign (oracle §6).

### M1-E2 — `unit-oracle-tests`
Table-driven tests in `packages/diamonds/test/unit/selectorResolution.test.ts`, run via `yarn test:unit`
(mocha/chai under hardhat-test, but **no deploy** — the pure function takes constructed inputs). Encode
the §4 truth table as data and assert **ownership + cut actions**: **Fixture A** (exclude→absent, INV-1/6)
and **Fixture B** (override, INV-2) **green**; **Fixture C-additive** (facet owns *both* its selectors,
INV-3) **RED**; an **upgrade-path** case (prior `Deployed` facet at a different address → correct
`Add`/`Replace`, INV-4) authored as a **probe** — expected RED and greened in M3, but its actual red/green
is **confirmed by running, not assumed** (the M0-E2 lesson); **INV-9** edge (non-existent
selector → no-op). **Acceptance shape:** a fast unit suite with the two intentional REDs clearly
annotated. **Key risk:** over-coupling to internal shapes → assert on the stable owner/address contract,
not internal registry fields.

### M1-E3 — `additivity-fixture`
The **integration** counterpart to E2's additivity unit case. Add
`diamonds/ExampleDiamond/examplediamond-include-additive.config.json` (**root** repo) — `ExampleTestDeployInclude`
@60 with `deployInclude: ["testDeployInclude()"]` and **no** `ExampleTestDeployExclude` in the config, so
`testDeployExclude()` has **no higher-priority competitor**. Reuse the existing `ExampleTestDeployInclude`
contract (it already exposes **both** selectors — no new Solidity needed). Add a root integration test
asserting the facet owns **both** `0x7f0c610c` *and* `0xdc38f9ab` → **RED** at HEAD (the deploy-time
whitelist drops `0xdc38f9ab`). **Acceptance shape:** committed config + a RED integration test that
distinguishes additive from whitelist. **Key risk:** none material; it reuses existing contracts.

## 6. Dependencies & sequencing

- **Upstream:** M0 — the **frozen oracle** (incl. §4 truth table, Fixture C spec DR-5) and the **audit
  "add" list** (`test-audit-matrix.md` §D). Both exist.
- **Internal ordering:** **M1-E1 first** (the seam is the unit of test). Then **M1-E2 ∥ M1-E3** in
  parallel — E2 (submodule unit) constructs inputs directly; E3 (root fixture + integration) is the
  on-chain proof. Both pin INV-3 at their layer.
- **Carried-over gate:** none (M0-E1 cleared).
- **Downstream:** **M2** greens the additivity tests (E2 + E3); **M3** greens the upgrade-path unit case;
  **M4-E3** consumes the unit-test names for the traceability matrix.
- **Two-repo note:** E1 + E2 land in the **submodule** (`packages/diamonds`); E3's fixture + integration
  test land in the **dev-env root**.

## 7. Rollback posture

Additive and low-risk. The seam (E1) is **behavior-preserving** — revert its single commit to restore the
inlined logic (no behavior change either way). The unit tests (E2) and the fixture + integration test (E3)
are **new files** — revert individually. No production/outward-facing surface.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| Seam extraction silently changes behavior | Full `yarn test` + the M0 green baseline are the regression gate; extract mechanically, assert green before/after. |
| `priorDeployedState` input shape wrong → churn in M3 | Design the upgrade input **now** with M3 in mind; M1-E2's upgrade RED case exercises the shape. |
| Unit tests run hardhat and become slow/coupled | Use constructed inputs only (no deploy); if hardhat-test overhead bites, fall back to `jest` (already a submodule dep). |
| Intentional REDs mistaken for breakage | Annotate additivity/upgrade tests as expected-RED with a TODO referencing M2/M3; plan §6 carve-out documents it. |

## 9. Definition of Done for Milestone 2 (M1)

- Pure resolution function extracted + wired; **full `yarn test` green** (no behavior change).
- `yarn test:unit` runs the table-driven suite chain-free: **A/B green**, **additivity RED**, **upgrade
  RED/pending** — all annotated.
- Fixture C config + root integration test committed, **RED** at HEAD.
- Clean handoff to **M2** (additivity fix + test-correction), with the RED tests as its target.

---

**Next:** run `/df3ndr:breakout-epics` to expand M1-E1/E2/E3 into their own `Epic-NN/overview/` docs,
then `/create-prd` per epic.
